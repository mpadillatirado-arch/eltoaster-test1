// Photo review email for one newsletter issue: every picture the issue and its
// blog posts will show, in one place, so Mario can look at them before anything
// goes out.
//
//   POST { send, token }   email the review to Mario and return a summary
//
// The review lists, in Spanish: the news posts of the issue, the fun fact, the
// POS note and the business points. Each shows its photo and credit. A photo
// that already appears on another post (or twice in this issue) is flagged, and
// a post with no photo says it will fall back to a stock picture.
//
// Authority is the issue's own token, as for newsletter-send. The only
// recipient is Mario.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const TO = "mpadillatirado@gmail.com";
const FROM_EMAIL = "El Toaster <mario@eltoaster.com>";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const db = (path: string) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_ROLE_KEY!, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
  });

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

/** The same photo can be written with different size parameters: compare by id when there is one. */
const photoKey = (url: string) => /\/photos\/(\d+)\//.exec(url)?.[1] ?? url.split("?")[0];

type Item = {
  owner: string;
  label: string;
  title: string;
  image: string | null;
  credit: string | null;
  creditUrl: string | null;
};

const KIND_LABEL: Record<string, string> = {
  news: "Noticia",
  fun_fact: "Dato curioso",
  pos: "Punto de venta",
  business: "3 cosas del negocio",
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!RESEND_API_KEY) return json({ error: "no_resend_key" }, 500);

  let body: { send?: string; token?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* falls through to not_found */
  }
  const sendId = String(body.send || "");
  if (!UUID_RE.test(sendId)) return json({ error: "not_found" }, 404);

  const sendRes = await db(`newsletter_sends?id=eq.${sendId}&select=id,token,content,post_ids,send_at,blog_publish_at,status&limit=1`);
  const send = sendRes.ok ? (await sendRes.json())[0] : null;
  if (!send || send.token !== body.token) return json({ error: "not_found" }, 404);

  const items: Item[] = [];
  const c = send.content?.es ?? {};

  // News posts (Spanish rows) of this issue.
  const ids: string[] = send.post_ids ?? [];
  if (ids.length) {
    const r = await db(`blog_posts?id=in.(${ids.join(",")})&lang=eq.es&select=id,title,image_url,image_credit,image_credit_url&order=published_at.desc`);
    for (const p of r.ok ? await r.json() : []) {
      items.push({ owner: `post:${p.id}`, label: KIND_LABEL.news, title: p.title, image: p.image_url, credit: p.image_credit, creditUrl: p.image_credit_url });
    }
  }
  // The issue's own sections come from its content.
  const own: [string, string | undefined, any][] = [
    ["fun_fact", c.fun_fact?.title, c.fun_fact],
    ["pos", c.pos?.title, c.pos],
    ["business", "3 cosas que todo dueño debe saber esta semana", c.business_image],
  ];
  for (const [kind, title, src] of own) {
    if (!title) continue;
    items.push({
      owner: `send:${kind}`, label: KIND_LABEL[kind], title,
      image: src?.image_url || null, credit: src?.image_credit || null, creditUrl: src?.image_credit_url || null,
    });
  }

  // A photo is a repeat when something else already uses it: another published
  // post, or another item of this issue.
  const all = await db(`blog_posts?lang=eq.es&image_url=not.is.null&select=id,send_id,kind,image_url`);
  const used = new Map<string, Set<string>>();
  const add = (key: string, owner: string) => {
    if (!used.has(key)) used.set(key, new Set());
    used.get(key)!.add(owner);
  };
  for (const p of all.ok ? await all.json() : []) {
    const owner = p.send_id === sendId && p.kind !== "news" ? `send:${p.kind}` : `post:${p.id}`;
    add(photoKey(p.image_url), owner);
  }
  for (const it of items) if (it.image) add(photoKey(it.image), it.owner);

  const rows = items.map((it) => {
    const owners = it.image ? used.get(photoKey(it.image)) : undefined;
    return { ...it, repeated: Boolean(owners && owners.size > 1), missing: !it.image };
  });
  const repeated = rows.filter((r) => r.repeated).length;
  const missing = rows.filter((r) => r.missing).length;

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("es-US", { timeZone: "America/Phoenix", weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }) : "sin fecha";

  const card = (r: typeof rows[number]) => `
    <tr><td style="padding:0 0 22px 0;">
      <div style="font:700 11px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#FF4C00;margin:0 0 4px;">${esc(r.label)}</div>
      <div style="font:700 15px Arial,sans-serif;color:#111;margin:0 0 8px;">${esc(r.title)}</div>
      ${r.image
        ? `<img src="${esc(r.image)}" alt="" width="520" style="display:block;width:100%;max-width:520px;height:auto;border-radius:10px;" />`
        : `<div style="padding:18px;border:1px dashed #bbb;border-radius:10px;font:14px Arial,sans-serif;color:#666;">Sin foto propia: el blog le pondrá una imagen de archivo.</div>`}
      ${r.credit ? `<div style="font:12px Arial,sans-serif;color:#777;margin:6px 0 0;">${r.creditUrl ? `<a href="${esc(r.creditUrl)}" style="color:#777;">${esc(r.credit)}</a>` : esc(r.credit)}</div>` : ""}
      ${r.repeated ? `<div style="font:700 13px Arial,sans-serif;color:#b3261e;margin:8px 0 0;">Esta foto ya se usa en otra publicación. Hay que cambiarla.</div>` : ""}
    </td></tr>`;

  const html = `<!DOCTYPE html><html><body style="margin:0;background:#f6f2ec;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2ec;"><tr><td align="center" style="padding:24px 12px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:14px;"><tr><td style="padding:26px;">
        <div style="font:700 20px Arial,sans-serif;color:#111;margin:0 0 6px;">Revisión de fotos de la semana</div>
        <div style="font:14px/1.5 Arial,sans-serif;color:#444;margin:0 0 6px;">El correo sale el <b>${esc(fmt(send.send_at))}</b> y el blog se actualiza el <b>${esc(fmt(send.blog_publish_at))}</b> (hora de Arizona).</div>
        <div style="font:14px/1.5 Arial,sans-serif;color:${repeated || missing ? "#b3261e" : "#1b6e3a"};margin:0 0 20px;">${
          repeated || missing
            ? `${repeated ? `${repeated} foto(s) repetida(s). ` : ""}${missing ? `${missing} publicación(es) sin foto propia.` : ""}`
            : "Todas las fotos son distintas y ninguna se ha usado antes en el blog."}</div>
        <table width="100%" cellpadding="0" cellspacing="0">${rows.map(card).join("")}</table>
        <div style="font:13px/1.5 Arial,sans-serif;color:#666;border-top:1px solid #eee;padding-top:14px;">Para cambiar una foto, dímelo en Claude («cambia la foto de …»). Nada se manda a tus suscriptores hasta que apruebes la edición desde el correo de prueba.</div>
      </td></tr></table>
    </td></tr></table></body></html>`;

  const subject = `[Revisión de fotos] ${repeated ? `${repeated} repetida(s) · ` : ""}Edición del ${new Date(send.send_at ?? Date.now()).toLocaleDateString("es-US", { timeZone: "America/Phoenix", day: "numeric", month: "long" })}`;
  const mail = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [TO], subject, html }),
  });
  if (!mail.ok) return json({ error: "send_failed", detail: await mail.text() }, 502);

  return json({
    sent: true,
    items: rows.length,
    repeated: rows.filter((r) => r.repeated).map((r) => ({ label: r.label, title: r.title })),
    missing: rows.filter((r) => r.missing).map((r) => ({ label: r.label, title: r.title })),
  });
});
