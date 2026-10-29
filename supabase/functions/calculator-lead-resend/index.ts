// Copies a calculator lead (name + email from the /calculator gate) into its
// own Resend audience, "Calculadora El Toaster". Separate from the newsletter
// audience on purpose: these people asked for the calculator, not the
// newsletter. The phone number stays in calculator_leads only.
//
// A trigger on calculator_leads calls this with { id } after each insert. The
// row's resend_synced_at is claimed first, so each lead is copied once at
// most, however often this is called; that is why it needs no other authority.
//
//   POST { id }   copy that lead (once)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const AUDIENCE_NAME = "Calculadora El Toaster";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

const resend = (path: string, init: RequestInit = {}) =>
  fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** The calculator audience's id, created the first time it is needed. */
async function audienceId(): Promise<string> {
  const list = await resend("/audiences");
  if (!list.ok) throw new Error(`list audiences: ${list.status} ${await list.text()}`);
  const all: { id: string; name: string; created_at: string }[] = (await list.json()).data || [];
  // Oldest first, so a duplicate made by two leads arriving at once is ignored.
  const found = all
    .filter((a) => a.name === AUDIENCE_NAME)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
  if (found) return found.id;
  const made = await resend("/audiences", {
    method: "POST",
    body: JSON.stringify({ name: AUDIENCE_NAME }),
  });
  if (!made.ok) throw new Error(`create audience: ${made.status} ${await made.text()}`);
  return (await made.json()).id;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!RESEND_API_KEY) return json({ error: "no_resend_key" }, 500);

  let id = "";
  try {
    id = String((await req.json()).id || "");
  } catch {
    /* falls through to not_found */
  }
  if (!UUID_RE.test(id)) return json({ error: "not_found" }, 404);

  // Claim the lead before copying: whoever sets resend_synced_at copies it.
  const claim = await db(
    `calculator_leads?id=eq.${id}&resend_synced_at=is.null&select=name,email`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ resend_synced_at: new Date().toISOString() }),
    }
  );
  const lead: { name: string | null; email: string } | undefined = claim.ok
    ? (await claim.json())[0]
    : undefined;
  if (!lead) return json({ status: "skipped" });

  try {
    const [first, ...rest] = (lead.name || "").trim().split(/\s+/);
    const res = await resend(`/audiences/${await audienceId()}/contacts`, {
      method: "POST",
      body: JSON.stringify({
        email: lead.email.trim().toLowerCase(),
        first_name: first || undefined,
        last_name: rest.join(" ") || undefined,
        unsubscribed: false,
      }),
    });
    if (!res.ok) throw new Error(`add contact: ${res.status} ${await res.text()}`);
    return json({ status: "synced" });
  } catch (err) {
    // Give the row back so the copy can be retried.
    await db(`calculator_leads?id=eq.${id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ resend_synced_at: null }),
    });
    console.error("Calculator lead copy failed:", err);
    return json({ status: "failed", error: String(err) }, 502);
  }
});
