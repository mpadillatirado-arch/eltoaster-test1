// Footer newsletter signup. Adds the address to the one mailing list through
// newsletter_opt_in() — the same call a diagnostic lead's consent goes through
// — and mirrors it into the Resend audience. Reports "already" so the form can
// say so instead of silently doing nothing on a repeat signup.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const db = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE_KEY as string,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const jsonHeaders = { ...CORS_HEADERS, "Content-Type": "application/json" };
  const reply = (status: string, code = 200) =>
    new Response(JSON.stringify({ status }), { status: code, headers: jsonHeaders });

  try {
    const { email, lang } = await req.json();
    const address = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!EMAIL_RE.test(address)) return reply("invalid", 400);

    const existing = await db(
      `newsletter_subscribers?email=eq.${encodeURIComponent(address)}&select=unsubscribed_at&limit=1`
    );
    const row = existing.ok ? (await existing.json())[0] : null;
    if (row && !row.unsubscribed_at) return reply("already");

    const optIn = await db("rpc/newsletter_opt_in", {
      method: "POST",
      body: JSON.stringify({
        p_email: address,
        p_lang: lang === "en" ? "en" : "es",
        p_source: "footer",
      }),
    });

    if (!optIn.ok || (await optIn.json()) === null) {
      console.error("Newsletter opt-in failed:", optIn.status);
      return reply("error");
    }

    // Best-effort: mirror into the Resend audience.
    if (RESEND_API_KEY && RESEND_AUDIENCE_ID) {
      try {
        await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: address, unsubscribed: false }),
        });
      } catch (err) {
        console.error("Resend audience sync failed:", err);
      }
    }

    return reply("subscribed");
  } catch (err) {
    console.error(err);
    return reply("error");
  }
});
