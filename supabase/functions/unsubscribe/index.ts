// The single opt-out endpoint for every email El Toaster sends.
//
// A link identifies the person one of two ways:
//   ?t=<unsubscribe_token>   newsletter emails (the subscriber's own secret)
//   ?id=<lead id>            diagnostic emails, including ones already delivered
// Both resolve to an email address and end in the same database call,
// newsletter_opt_out(), which flags the list row and clears marketing consent
// on that person's leads.
//
//   GET   -> redirects to the confirmation page on eltoaster.com. A GET never
//            unsubscribes: mail scanners prefetch links, and Supabase serves
//            function HTML as text/plain, so the page cannot live here anyway.
//   POST  -> performs the opt-out. Used by that page and by mail clients'
//            one-click button (RFC 8058, List-Unsubscribe-Post).
//
// A requested diagnostic is still delivered after opting out; this only stops
// newsletters and promotions.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID");

const SITE_URL = "https://eltoaster.com";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

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

/** Turns either kind of link into the person's email and language. */
async function resolve(kind: "t" | "l", value: string) {
  const path =
    kind === "t"
      ? `newsletter_subscribers?unsubscribe_token=eq.${value}&select=email,lang&limit=1`
      : `leads?id=eq.${value}&select=email,lang:preferred_language&limit=1`;
  const res = await db(path);
  if (!res.ok) {
    console.error("Unsubscribe lookup failed:", res.status, await res.text());
    return null;
  }
  const row = (await res.json())[0];
  return row?.email ? { email: String(row.email), lang: row.lang === "en" ? "en" : "es" } : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json({ ok: false, error: "not_configured" }, 500);

  const url = new URL(req.url);
  let t = url.searchParams.get("t");
  let l = url.searchParams.get("id") || url.searchParams.get("l");

  if (req.method === "GET") {
    const target =
      t && UUID_RE.test(t)
        ? `${SITE_URL}/#unsubscribe/t/${t}`
        : l && UUID_RE.test(l)
        ? `${SITE_URL}/#unsubscribe/l/${l}`
        : `${SITE_URL}/#unsubscribe`;
    return new Response(null, { status: 302, headers: { ...CORS, Location: target } });
  }

  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  // The site page posts JSON; a mail client's one-click posts a form body we
  // don't need, because its identifier is already in the query string.
  if ((req.headers.get("content-type") || "").includes("application/json")) {
    try {
      const body = await req.json();
      t = t || body.t || null;
      l = l || body.l || body.id || null;
    } catch {
      /* fall through to the query string */
    }
  }

  const kind = t ? "t" : "l";
  const value = t || l;
  if (!value || !UUID_RE.test(value)) return json({ ok: false, error: "not_found" }, 404);

  const who = await resolve(kind, value);
  if (!who) return json({ ok: false, error: "not_found" }, 404);

  const out = await db("rpc/newsletter_opt_out", {
    method: "POST",
    body: JSON.stringify({ p_email: who.email, p_reason: "unsubscribe" }),
  });
  if (!out.ok) {
    console.error("Opt-out failed:", out.status, await out.text());
    return json({ ok: false, error: "failed", lang: who.lang }, 500);
  }

  // Best-effort mirror so the Resend audience agrees with the database.
  if (RESEND_API_KEY && RESEND_AUDIENCE_ID) {
    try {
      await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(who.email)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ unsubscribed: true }),
        }
      );
    } catch (err) {
      console.error("Resend unsubscribe mirror failed:", err);
    }
  }

  return json({ ok: true, lang: who.lang });
});
