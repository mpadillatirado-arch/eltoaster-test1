// Receives Resend webhook events and turns the ones that mean "stop mailing
// this address" into an opt-out on the one mailing list:
//
//   contact.updated (unsubscribed) / contact.deleted  -> unsubscribe
//   email.bounced                                     -> bounce
//   email.complained                                  -> complaint
//
// All of them go through newsletter_opt_out(), the same call the unsubscribe
// link uses, so the list row and the person's leads always agree.
//
// Resend signs webhook payloads with Svix — verify_jwt is off (Resend can't
// send a Supabase JWT), and the signature check below is what authenticates
// the request instead.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET");

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function verifySvixSignature(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string
): Promise<boolean> {
  // Svix secrets are prefixed "whsec_" and base64-encoded after that prefix.
  const secretBytes = base64ToBytes(secret.replace(/^whsec_/, ""));
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
  const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedContent));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));

  // svix-signature header can carry multiple space-separated "v1,<sig>" values.
  return svixSignature
    .split(" ")
    .map((s) => s.split(",")[1])
    .filter(Boolean)
    .some((sig) => sig === expected);
}

async function optOut(email: string, reason: "unsubscribe" | "bounce" | "complaint") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/newsletter_opt_out`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY as string,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_email: email, p_reason: reason }),
  });
  if (!res.ok) {
    console.error("Webhook opt-out failed:", res.status, await res.text());
  }
  return res.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.text();

  if (WEBHOOK_SECRET) {
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing signature headers", { status: 401 });
    }

    const valid = await verifySvixSignature(
      payload,
      svixId,
      svixTimestamp,
      svixSignature,
      WEBHOOK_SECRET
    );
    if (!valid) {
      console.error("Resend webhook signature verification failed");
      return new Response("Invalid signature", { status: 401 });
    }
  } else {
    // No secret configured — accept but log, so setup issues are visible
    // without silently dropping every event.
    console.error("RESEND_WEBHOOK_SECRET is not set; accepting unverified webhook");
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const type = event.type || "";
  const data = event.data || {};

  try {
    if (type === "contact.updated" && data.unsubscribed === true && typeof data.email === "string") {
      await optOut(data.email, "unsubscribe");
    } else if (type === "contact.deleted" && typeof data.email === "string") {
      await optOut(data.email, "unsubscribe");
    } else if ((type === "email.bounced" || type === "email.complained") && Array.isArray(data.to)) {
      const reason = type === "email.bounced" ? "bounce" : "complaint";
      for (const addr of data.to) {
        if (typeof addr === "string") await optOut(addr, reason);
      }
    }
  } catch (err) {
    console.error("Resend webhook processing error:", err);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
