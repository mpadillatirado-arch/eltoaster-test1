#!/usr/bin/env node
/**
 * CLI the scheduled diagnostic job drives. Three commands:
 *
 *   node engine.mjs pending
 *       Lists leads whose diagnostic hasn't been researched yet, with every
 *       parameter the research step needs. Prints JSON.
 *
 *   node engine.mjs claim <report_id>
 *       Marks a report 'researching' so a second run of the job doesn't pick up
 *       the same lead while the first is still reading reviews.
 *
 *   node engine.mjs submit <payload.json>
 *       Validates and renders the research into an email body, stores it as
 *       'awaiting_review', and emails Mario the review link. Sends nothing to
 *       the restaurant owner — that only happens when he approves.
 *
 *   node engine.mjs rerender <report_id>
 *       Rebuilds the stored email after a template change, without redoing the
 *       research. Refuses on a report that was already sent.
 *
 *   node engine.mjs fail <report_id> "<reason>"
 *       Records that research couldn't be completed, so the lead surfaces for
 *       manual handling instead of silently disappearing.
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment. The
 * service key bypasses RLS, which is why this runs locally from the job and
 * never ships to the browser bundle.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderDiagnosticEmail, validate } from "./render-email.mjs";

const URL_BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n\n" +
      "Add them to tools/diagnostic-engine/.env.engine (gitignored) and run the job with:\n" +
      "  node --env-file=tools/diagnostic-engine/.env.engine tools/diagnostic-engine/engine.mjs pending\n"
  );
  process.exit(1);
}

async function rest(path, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase ${res.status} on ${path}: ${await res.text()}`);
  }
  return res.status === 204 ? null : res.json();
}

async function fn(slug, body) {
  const res = await fetch(`${URL_BASE}/functions/v1/${slug}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Function ${slug} ${res.status}: ${await res.text()}`);
  return res.json();
}

/* ------------------------------------------------------------------ pending */

async function pending() {
  const rows = await rest(
    "diagnostic_reports?status=eq.pending&order=created_at.asc&limit=10" +
      "&select=id,created_at,lead_id,leads(" +
      "restaurant_name,contact_name,email,phone,city,zip_code,restaurant_type," +
      "street_address,location_addresses,google_maps_url,annual_revenue," +
      "biggest_challenge,preferred_language,unsubscribed_at)"
  );

  // An unsubscribe between submitting and researching should stop the report.
  const live = rows.filter((r) => r.leads && !r.leads.unsubscribed_at);

  console.log(
    JSON.stringify(
      live.map((r) => ({
        report_id: r.id,
        lead_id: r.lead_id,
        queued_at: r.created_at,
        ...r.leads,
      })),
      null,
      2
    )
  );
}

/* -------------------------------------------------------------------- claim */

async function claim(id) {
  await rest(`diagnostic_reports?id=eq.${id}&status=eq.pending`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ status: "researching" }),
  });
  console.log(`claimed ${id}`);
}

/* ------------------------------------------------------------------- submit */

async function submit(file) {
  const payload = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8"));
  const reportId = payload.report_id;

  if (!reportId) {
    console.error("payload.report_id is required — take it from `engine.mjs pending`.");
    process.exit(1);
  }

  const problems = validate(payload);
  if (problems.length) {
    console.error(
      `Not submitting. ${problems.length} problem(s) — every one of these means a claim ` +
        `in the report can't be traced to review text that was actually read:\n` +
        problems.map((p) => `  - ${p}`).join("\n")
    );
    process.exit(1);
  }

  const unsubscribeUrl = `${URL_BASE}/functions/v1/unsubscribe?id=${payload.lead.id}`;
  const { subject, html, bytes } = renderDiagnosticEmail(payload, { unsubscribeUrl });

  await rest(`diagnostic_reports?id=eq.${reportId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      status: "awaiting_review",
      payload: payload.research,
      weighted_score: payload.research.weighted_score,
      email_subject: subject,
      email_html: html,
      error: null,
    }),
  });

  const { review_url } = await fn("diagnostic-review", { report_id: reportId });

  console.log(`Rendered ${(bytes / 1024).toFixed(1)}KB — "${subject}"`);
  console.log(`Status: awaiting_review. Nothing sent to the owner yet.`);
  console.log(`Review: ${review_url}`);
}

/* ----------------------------------------------------------------- rerender */

/**
 * Rebuilds a stored report's email from the research payload already in the
 * database, without redoing any research. This is what to run after a template
 * change — the findings and quotes are unchanged, only the HTML around them.
 *
 * Deliberately refuses to touch a report that has already been sent: the
 * recipient has the old version, and silently replacing the stored copy would
 * destroy the record of what they actually received.
 */
async function rerender(id) {
  const [row] = await rest(
    `diagnostic_reports?id=eq.${id}&select=id,status,lead_id,payload,leads(*)`
  );
  if (!row) throw new Error(`No report ${id}`);
  if (row.status === "sent") {
    throw new Error(
      `Report ${id} was already sent. Re-rendering would overwrite the record of ` +
        `what the owner actually received. Create a new report instead.`
    );
  }
  if (!row.payload) throw new Error(`Report ${id} has no stored research payload to render from.`);

  const payload = { lead: row.leads, research: row.payload };
  const problems = validate(payload);
  if (problems.length) {
    throw new Error(
      `Stored payload no longer satisfies the gate:\n` +
        problems.map((p) => `  - ${p}`).join("\n")
    );
  }

  const unsubscribeUrl = `${URL_BASE}/functions/v1/unsubscribe?id=${row.lead_id}`;
  const { subject, html, bytes } = renderDiagnosticEmail(payload, { unsubscribeUrl });

  await rest(`diagnostic_reports?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ email_subject: subject, email_html: html }),
  });

  console.log(`Re-rendered ${row.leads.restaurant_name} — ${(bytes / 1024).toFixed(1)}KB`);
  console.log(`Status unchanged: ${row.status}`);
}

/* --------------------------------------------------------------------- fail */

async function fail(id, reason) {
  const [row] = await rest(`diagnostic_reports?id=eq.${id}&select=attempts`);
  await rest(`diagnostic_reports?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      status: "failed",
      error: reason || "research could not be completed",
      attempts: (row?.attempts ?? 0) + 1,
    }),
  });
  console.log(`marked ${id} failed`);
}

/* ---------------------------------------------------------------------- cli */

const [cmd, ...args] = process.argv.slice(2);

const commands = { pending, claim, submit, rerender, fail };
const run = commands[cmd];

if (!run) {
  console.error(`Usage: engine.mjs <${Object.keys(commands).join("|")}> [args]`);
  process.exit(1);
}

// Setting exitCode rather than calling process.exit lets Node close its open
// handles first; exiting mid-request trips a libuv assertion on Windows and
// prints alarming noise after a perfectly ordinary error message.
run(...args).catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
