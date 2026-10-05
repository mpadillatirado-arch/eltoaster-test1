// Human approval gate for the automated diagnostic engine.
//
// The research step (a scheduled Claude Code job driving a real browser across
// Google Business Profile, Yelp and TripAdvisor) writes a rendered report into
// public.diagnostic_reports with status 'awaiting_review'. Nothing reaches a
// restaurant owner until Mario looks at it and approves it here.
//
// Three entry points:
//   POST  { report_id }        — service-authed; emails Mario the review link
//   GET   ?token=<uuid>        — renders the exact email with Approve / Reject
//   POST  token + action       — performs the approve (sends) or reject
//
// Approving is deliberately a POST from a form on the review page, never a bare
// GET link. Mail clients and security scanners routinely prefetch links in a
// message, and a prefetch that could fire a client-facing report is not an
// acceptable failure mode.
//
// verify_jwt is off so the review page opens straight from an email. Authority
// comes from `review_token`, a per-report random UUID that never leaves Mario's
// inbox; the POST path additionally requires the service role key.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const FROM_EMAIL = "Mario Padilla <mario@eltoaster.com>";
const REPLY_TO = "mario@eltoaster.com";
const REVIEWER_EMAIL = Deno.env.get("REVIEWER_EMAIL") || "mario@eltoaster.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

const db = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

async function sendMail(payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Minimal styled page for the browser-facing responses. */
function page(title: string, body: string, status = 200) {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(title)}</title>
<style>
  body{margin:0;background:#fdfbf8;font:16px/1.6 Inter,-apple-system,'Segoe UI',Arial,sans-serif;color:#0d0d0d;}
  .wrap{max-width:680px;margin:0 auto;padding:40px 20px 60px;}
  h1{font-size:22px;margin:0 0 10px;}
  p{color:#5b5651;margin:0 0 14px;}
  .card{background:#fff;border:1px solid #e8e2d9;border-radius:14px;padding:24px;}
  .meta{font-size:14px;color:#8f8880;}
  iframe{width:100%;height:70vh;border:1px solid #e8e2d9;border-radius:12px;background:#fff;margin:18px 0;}
  button{font:inherit;font-weight:700;border:0;border-radius:10px;padding:14px 26px;cursor:pointer;}
  .ok{background:#FF4C00;color:#fff;}
  .no{background:#f6f2ec;color:#5b5651;border:1px solid #e8e2d9;}
  form{display:inline;}
  .row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
</style></head><body><div class="wrap">${body}</div></body></html>`,
    { status, headers: { ...CORS, "Content-Type": "text/html; charset=utf-8" } }
  );
}

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

/** Loads a report plus its lead by review token. */
async function loadByToken(token: string) {
  const res = await db(
    `diagnostic_reports?review_token=eq.${encodeURIComponent(token)}&limit=1` +
      `&select=id,status,email_subject,email_html,weighted_score,lead_id,` +
      `leads(restaurant_name,contact_name,email,city,preferred_language)`
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Supabase env vars missing");
    return json({ error: "not_configured" }, 500);
  }

  const url = new URL(req.url);

  try {
    /* ------------------------------------------------ notify Mario (POST) */
    if (req.method === "POST" && !url.searchParams.get("token")) {
      const body = await req.json();
      const { report_id } = body;
      if (!report_id) return json({ error: "report_id is required" }, 400);

      // Authority is proved by capability rather than by string-matching the
      // service key. Supabase injects SUPABASE_SERVICE_ROLE_KEY in a different
      // format than the legacy JWT shown in the dashboard on newer projects,
      // so comparing them is unreliable. Instead the lookup runs with the
      // CALLER's token: diagnostic_reports has RLS on with no anon policies,
      // so a non-privileged key reads back an empty set even when the row
      // exists, and a forged token is rejected by PostgREST outright.
      const callerToken = (req.headers.get("Authorization") || "")
        .replace(/^Bearer\s+/i, "")
        .trim();
      if (!callerToken) return json({ error: "unauthorized" }, 401);

      const select =
        `diagnostic_reports?id=eq.${encodeURIComponent(report_id)}&limit=1` +
        `&select=id,status,review_token,email_subject,email_html,weighted_score,` +
        `leads(restaurant_name,city,email)`;

      const res = await fetch(`${SUPABASE_URL}/rest/v1/${select}`, {
        headers: { apikey: callerToken, Authorization: `Bearer ${callerToken}` },
      });

      const rows = res.ok ? await res.json() : [];
      const r = Array.isArray(rows) ? rows[0] : null;
      if (!r) {
        // Indistinguishable on purpose: a caller that can't read the row has
        // no business learning whether it exists.
        return json({ error: "unauthorized_or_not_found" }, 401);
      }

      const lead = r.leads || {};

      // Test copy: send the real report body to a chosen address instead of the
      // owner, so the rendering can be checked in an actual inbox. Status is
      // left untouched — this is not a delivery to the client, and a report
      // that was tested must still go through approval to reach them.
      const testTo = body.test_to;
      if (testTo) {
        if (!r.email_html) return json({ error: "report has no rendered email" }, 409);
        await sendMail({
          from: FROM_EMAIL,
          to: [testTo],
          reply_to: REPLY_TO,
          subject: `[PRUEBA ${new Date().toISOString().slice(0,16).replace('T',' ')}] ${r.email_subject || lead.restaurant_name}`,
          html: r.email_html,
        });
        return json({ test_sent: true, to: testTo, status_unchanged: r.status });
      }

      const reviewUrl = `${SUPABASE_URL}/functions/v1/diagnostic-review?token=${r.review_token}`;

      await sendMail({
        from: FROM_EMAIL,
        to: [REVIEWER_EMAIL],
        reply_to: REPLY_TO,
        subject: `Review needed — diagnostic for ${lead.restaurant_name || "?"}`,
        html: `<div style="font:15px/1.6 Inter,Arial,sans-serif;color:#0d0d0d;max-width:560px;">
<p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8f8880;margin:0 0 6px;">El Toaster — diagnostic engine</p>
<h2 style="margin:0 0 14px;font-size:20px;">A diagnostic is ready for your review</h2>
<table style="border-collapse:collapse;font-size:14px;margin:0 0 20px;">
  <tr><td style="padding:4px 14px 4px 0;color:#8f8880;">Restaurant</td><td><b>${esc(lead.restaurant_name)}</b></td></tr>
  <tr><td style="padding:4px 14px 4px 0;color:#8f8880;">City</td><td>${esc(lead.city)}</td></tr>
  <tr><td style="padding:4px 14px 4px 0;color:#8f8880;">Would go to</td><td>${esc(lead.email)}</td></tr>
  <tr><td style="padding:4px 14px 4px 0;color:#8f8880;">Weighted score</td><td>${esc(r.weighted_score)} / 5</td></tr>
</table>
<p style="color:#5b5651;">Nothing has been sent. Open the review page to read the exact email and approve or reject it.</p>
<p><a href="${esc(reviewUrl)}" style="display:inline-block;background:#FF4C00;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:10px;">Review it</a></p>
</div>`,
      });

      return json({ notified: true, review_url: reviewUrl });
    }

    /* ------------------------------------------- review page / act (token) */
    const token =
      url.searchParams.get("token") ||
      (req.method === "POST" ? (await req.clone().formData()).get("token")?.toString() : null);

    if (!token) return page("Not found", `<div class="card"><h1>Nothing to review</h1></div>`, 404);

    const report = await loadByToken(token);
    if (!report) {
      return page("Not found", `<div class="card"><h1>That review link isn't valid</h1>
<p>It may have been rotated or the report deleted.</p></div>`, 404);
    }

    const lead = report.leads || {};

    /* --- perform the action --- */
    if (req.method === "POST") {
      const fd = await req.formData();
      const action = fd.get("action")?.toString();

      if (report.status === "sent") {
        return page("Already sent", `<div class="card"><h1>Already sent</h1>
<p>This diagnostic went out to ${esc(lead.email)} already.</p></div>`);
      }
      if (report.status === "rejected") {
        return page("Rejected", `<div class="card"><h1>Already rejected</h1>
<p>This report was rejected and won't be sent.</p></div>`);
      }
      if (report.status !== "awaiting_review") {
        return page("Not ready", `<div class="card"><h1>Not ready for review</h1>
<p>Current status: <b>${esc(report.status)}</b>.</p></div>`, 409);
      }

      if (action === "reject") {
        await db(`diagnostic_reports?id=eq.${report.id}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            rejected_reason: fd.get("reason")?.toString() || "rejected on review",
          }),
        });
        return page("Rejected", `<div class="card"><h1>Rejected</h1>
<p>Nothing was sent to ${esc(lead.email)}. The lead stays in the table if you want to redo it.</p></div>`);
      }

      if (action !== "approve") {
        return page("Unknown action", `<div class="card"><h1>Unknown action</h1></div>`, 400);
      }

      if (!RESEND_API_KEY) {
        return page("Not configured", `<div class="card"><h1>RESEND_API_KEY is not set</h1>
<p>Nothing was sent.</p></div>`, 500);
      }
      if (!report.email_html || !lead.email) {
        return page("Incomplete", `<div class="card"><h1>This report has no rendered email</h1>
<p>Re-run the job for this lead.</p></div>`, 409);
      }

      const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?id=${encodeURIComponent(report.lead_id)}`;

      await sendMail({
        from: FROM_EMAIL,
        to: [lead.email],
        reply_to: REPLY_TO,
        subject: report.email_subject || `Your reputation diagnostic — ${lead.restaurant_name}`,
        html: report.email_html,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      const now = new Date().toISOString();
      await db(`diagnostic_reports?id=eq.${report.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: "sent", reviewed_at: now, sent_at: now }),
      });

      return page("Sent", `<div class="card"><h1>Sent</h1>
<p>The diagnostic for <b>${esc(lead.restaurant_name)}</b> went out to ${esc(lead.email)}.</p></div>`);
    }

    /* --- render the review page --- */
    const statusNote =
      report.status === "awaiting_review"
        ? `<p class="meta">Nothing has been sent yet. Read it below, then approve or reject.</p>`
        : `<p class="meta">Status: <b>${esc(report.status)}</b> — the buttons are disabled.</p>`;

    const actions =
      report.status === "awaiting_review"
        ? `<div class="row">
      <form method="POST">
        <input type="hidden" name="token" value="${esc(token)}" />
        <input type="hidden" name="action" value="approve" />
        <button class="ok" type="submit">Approve and send to ${esc(lead.email)}</button>
      </form>
      <form method="POST" onsubmit="return confirm('Reject this report? It will not be sent.')">
        <input type="hidden" name="token" value="${esc(token)}" />
        <input type="hidden" name="action" value="reject" />
        <button class="no" type="submit">Reject</button>
      </form>
    </div>`
        : "";

    return page(
      `Review — ${lead.restaurant_name || ""}`,
      `<div class="card">
  <h1>${esc(lead.restaurant_name)} — ${esc(report.weighted_score)} / 5</h1>
  <p class="meta">${esc(lead.city)} &middot; would send to ${esc(lead.email)} &middot; language: ${esc(
        lead.preferred_language
      )}</p>
  ${statusNote}
  <iframe sandbox="" title="Email preview" srcdoc="${esc(report.email_html || "")}"></iframe>
  ${actions}
</div>`
    );
  } catch (err) {
    console.error(err);
    const wantsHtml = (req.headers.get("accept") || "").includes("text/html");
    return wantsHtml
      ? page("Error", `<div class="card"><h1>Something went wrong</h1>
<p>Nothing was sent. Check the function logs.</p></div>`, 500)
      : json({ error: "exception" }, 500);
  }
});
