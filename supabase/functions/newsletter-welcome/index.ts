// Welcome email for a new newsletter subscriber, from the footer form or from
// the marketing box on the diagnostic form.
//
// A trigger on newsletter_subscribers calls this with { id } when an address
// joins the list. The row's welcomed_at is claimed before sending, so each
// subscriber gets the welcome once at most, however often this is called;
// that is why it needs no other authority.
//
//   POST { id }                       welcome that subscriber (once)
//   POST { email, test: true, lang }  resend to a test address, as often as needed

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// CAN-SPAM: a postal address in every commercial email.
const MAILING_ADDRESS = (
  Deno.env.get("MAILING_ADDRESS") || "3031 E Lark Dr, Chandler, AZ 85286"
).trim();

const SITE_URL = "https://eltoaster.com";
const AVATAR_URL = `${SITE_URL}/newsletter/avatar-desdezero.jpg`;
const FROM_EMAIL = "Mario de El Toaster <mario@eltoaster.com>";
const REPLY_TO = "mario@eltoaster.com";

// Mario's social channels, shown as icons above the signature. PNGs on the
// site: mail programs don't show SVG.
const SOCIALS = [
  ["TikTok", "https://www.tiktok.com/@desdezeroenusa", `${SITE_URL}/newsletter/icon-tiktok.png`],
  ["Instagram", "https://www.instagram.com/desdezeroenusa/", `${SITE_URL}/newsletter/icon-instagram.png`],
  ["YouTube", "https://www.youtube.com/@DesdeZeroenUSA", `${SITE_URL}/newsletter/icon-youtube.png`],
  ["Facebook", "https://www.facebook.com/profile.php?id=61590665879779", `${SITE_URL}/newsletter/icon-facebook.png`],
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
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

type Lang = "es" | "en";
type Subscriber = {
  id: string;
  email: string;
  lang: string;
  is_test: boolean;
  unsubscribe_token: string;
};

const COPY = {
  es: {
    socialTitle: "Sígueme en mis redes",
    subject: "Te doy la bienvenida a El Toaster: esto es lo que te llega cada viernes",
    preheader: "Gracias por suscribirte. Al final te dejo una pregunta rápida.",
    hello: "¡Hola! Gracias por suscribirte.",
    intro:
      "Soy Mario Padilla. Ayudo a restaurantes del área de Phoenix a entender lo que dicen sus reseñas y a vender más con lo que ya tienen. En El Toaster comparto lo que voy aprendiendo, en corto y sin rollo.",
    whatTitle: "Lo que te llega cada viernes a las 8 a.m.",
    what: [
      ["Un dato curioso", "historias reales de restaurantes y de la comida que servimos."],
      ["Las noticias que importan", "lo que pasó en la industria esta semana, explicado para un dueño."],
      ["Tu punto de venta", "cómo sacarle más a tus números, sin tecnicismos."],
      ["3 cosas que todo dueño debe saber", "ideas que puedes usar esa misma semana."],
    ],
    first: "Y lo lees antes que nadie: las notas llegan a mi blog después del correo.",
    inboxTitle: "Para que no se te pierda",
    inbox:
      "Agrega mario@eltoaster.com a tus contactos. Si este correo cayó en Promociones o en Spam, muévelo a tu bandeja principal y así te llegan todos.",
    startTitle: "Mientras llega el viernes",
    start:
      "Date una vuelta por el blog, o pídeme tu diagnóstico gratis: reviso lo que dicen de tu restaurante en Google y Yelp y te digo cuánto te está costando.",
    blogButton: "Leer el blog",
    diagButton: "Pedir mi diagnóstico gratis",
    askTitle: "Una pregunta rápida",
    ask:
      "Responde este correo con una línea: ¿qué es lo que más te quita el sueño de tu restaurante ahorita? Leo cada respuesta, y lo que me cuentes me ayuda a escribir lo que de verdad te sirve.",
    signOff: "Nos leemos el viernes,",
    why: "Lo recibes porque te suscribiste al newsletter de El Toaster en eltoaster.com o al pedir tu diagnóstico gratuito.",
    unsubscribe: "Darme de baja",
    unsubscribeNote: "La baja es inmediata y no tiene costo.",
    testTag: "[PRUEBA]",
  },
  en: {
    socialTitle: "Follow me on social",
    subject: "Welcome to El Toaster: here's what lands in your inbox every Friday",
    preheader: "Thanks for subscribing. There's a quick question at the end.",
    hello: "Hi! Thanks for subscribing.",
    intro:
      "I'm Mario Padilla. I help restaurants around Phoenix understand what their reviews are saying and sell more with what they already have. At El Toaster I share what I'm learning, short and to the point.",
    whatTitle: "What you'll get every Friday at 8 a.m.",
    what: [
      ["A fun fact", "real stories about restaurants and the food we serve."],
      ["The news that matters", "what happened in the industry this week, explained for an owner."],
      ["Your point of sale", "how to get more out of your numbers, no jargon."],
      ["3 things every owner should know", "ideas you can use that same week."],
    ],
    first: "And you read it first: the stories go up on my blog after the email.",
    inboxTitle: "So you don't miss it",
    inbox:
      "Add mario@eltoaster.com to your contacts. If this email landed in Promotions or Spam, move it to your main inbox so every issue reaches you.",
    startTitle: "While you wait for Friday",
    start:
      "Take a look at the blog, or ask for your free diagnostic: I'll check what people say about your restaurant on Google and Yelp and tell you what it's costing you.",
    blogButton: "Read the blog",
    diagButton: "Get my free diagnostic",
    askTitle: "One quick question",
    ask:
      "Reply to this email with one line: what keeps you up at night about your restaurant right now? I read every reply, and what you tell me helps me write what's actually useful to you.",
    signOff: "See you Friday,",
    why: "You're getting this because you subscribed to the El Toaster newsletter at eltoaster.com or when you requested your free diagnostic.",
    unsubscribe: "Unsubscribe",
    unsubscribeNote: "It takes effect right away and costs nothing.",
    testTag: "[TEST]",
  },
};

const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

// Same look as the newsletter: phones get tighter padding and full-width
// buttons, and nothing depends on this block to fit the screen.
const MOBILE_CSS = `
  body { margin:0; padding:0; background:#fdfbf8; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-collapse:collapse; }
  img { border:0; max-width:100%; height:auto; }
  a { word-break:break-word; }
  @media only screen and (max-width:600px) {
    .outer { padding:12px 8px !important; }
    .head { padding:16px 18px !important; }
    .card { padding:20px 16px 22px !important; }
    .btn { display:block !important; padding-left:12px !important; padding-right:12px !important; margin:0 0 10px 0 !important; }
    .legal { font-size:12px !important; }
  }`;

function render(sub: Subscriber, lang: Lang, test: boolean) {
  const t = COPY[lang];
  const unsubscribeUrl = `${SITE_URL}/#unsubscribe/t/${sub.unsubscribe_token}`;
  const oneClickUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?t=${sub.unsubscribe_token}`;

  const h2 = (text: string) =>
    `<div style="font-size:17px;font-weight:800;color:#0d0d0d;line-height:1.3;margin:24px 0 10px 0;">${esc(text)}</div>`;
  const p = (text: string) =>
    `<p style="font-size:15px;line-height:1.65;color:#5b5651;margin:0 0 12px 0;">${esc(text)}</p>`;
  const button = (href: string, text: string, dark = false) =>
    `<a class="btn" href="${esc(href)}" style="display:inline-block;background:${dark ? "#0d0d0d" : "#FF4C00"};color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;padding:13px 22px;border-radius:10px;text-align:center;margin:0 8px 8px 0;">${esc(text)}</a>`;

  const list = t.what
    .map(
      ([title, text]) => `
        <tr>
          <td width="26" valign="top" style="width:26px;padding:3px 0 10px 0;">
            <div style="width:18px;height:18px;line-height:18px;border-radius:50%;background:#FF4C00;color:#ffffff;font-size:11px;font-weight:800;text-align:center;">&#10003;</div>
          </td>
          <td valign="top" style="padding:0 0 10px 0;font-size:15px;line-height:1.55;color:#5b5651;">
            <b style="color:#0d0d0d;">${esc(title)}:</b> ${esc(text)}
          </td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${esc(t.subject)}</title>
<style>${MOBILE_CSS}</style>
</head>
<body style="margin:0;padding:0;background:#fdfbf8;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(t.preheader)}</span>
<table role="presentation" width="100%" style="width:100%;background:#fdfbf8;font-family:Inter,Arial,Helvetica,sans-serif;">
  <tr>
    <td class="outer" align="center" style="padding:28px 16px;">
      <table role="presentation" width="580" style="width:100%;max-width:580px;">
        <tr>
          <td align="left">
            <div class="head" style="background:#FF4C00;padding:20px 26px;border-radius:16px 16px 0 0;">
              <table role="presentation">
                <tr>
                  <td width="60" valign="middle" style="width:60px;padding:0 14px 0 0;">
                    <a href="${SITE_URL}"><img src="${AVATAR_URL}" alt="Mario Padilla" width="54" height="54" style="display:block;width:54px;height:54px;border-radius:50%;border:3px solid #ffffff;" /></a>
                  </td>
                  <td valign="middle" style="line-height:1.25;">
                    <a href="${SITE_URL}" style="color:#ffffff;font-size:22px;font-weight:800;text-decoration:none;">El Toaster</a><br />
                    <span style="color:#ffffff;font-size:13.5px;">${lang === "en" ? "by Desde Zero" : "por Desde Zero"}</span>
                  </td>
                </tr>
              </table>
            </div>
            <div class="card" style="background:#ffffff;border:1px solid #e8e2d9;border-top:0;border-radius:0 0 16px 16px;padding:26px 26px 28px;">

              <table role="presentation" style="margin:0 0 18px 0;">
                <tr>
                  <td width="84" valign="middle" style="width:84px;padding:0 16px 0 0;">
                    <img src="${AVATAR_URL}" alt="Mario Padilla" width="84" height="84" style="display:block;width:84px;height:84px;border-radius:50%;border:3px solid #FF4C00;" />
                  </td>
                  <td valign="middle" style="font-size:22px;font-weight:800;color:#0d0d0d;line-height:1.25;">${esc(t.hello)}</td>
                </tr>
              </table>

              ${p(t.intro)}

              ${h2(t.whatTitle)}
              <table role="presentation" width="100%" style="width:100%;">${list}</table>
              ${p(t.first)}

              <div style="background:#fff7f2;border-radius:12px;padding:16px 18px;margin:20px 0 0 0;">
                <div style="font-size:15px;font-weight:800;color:#0d0d0d;margin:0 0 6px 0;">${esc(t.inboxTitle)}</div>
                <div style="font-size:14.5px;line-height:1.6;color:#5b5651;">${esc(t.inbox)}</div>
              </div>

              ${h2(t.startTitle)}
              ${p(t.start)}
              <div style="margin:4px 0 0 0;">
                ${button(`${SITE_URL}/#blog`, t.blogButton, true)}
                ${button(`${SITE_URL}/#empezar`, t.diagButton)}
              </div>

              ${h2(t.askTitle)}
              ${p(t.ask)}

              <div style="border-top:1px solid #e8e2d9;margin:24px 0 0 0;padding:18px 0 0 0;">
                <div style="font-size:15px;font-weight:800;color:#0d0d0d;margin:0 0 12px 0;">${t.socialTitle}</div>
                ${SOCIALS.map(([name, url, icon]) => `<a href="${url}" style="display:inline-block;margin:0 10px 0 0;text-decoration:none;"><img src="${icon}" alt="${name}" width="36" height="36" style="display:block;width:36px;height:36px;border:0;" /></a>`).join("")}
              </div>
              <table role="presentation" style="margin-top:22px;">
                <tr>
                  <td width="56" valign="middle" style="width:56px;padding:0 12px 0 0;">
                    <img src="${AVATAR_URL}" alt="Mario Padilla" width="56" height="56" style="display:block;width:56px;height:56px;border-radius:50%;" />
                  </td>
                  <td valign="middle" style="font-size:14px;color:#5b5651;line-height:1.5;">
                    ${esc(t.signOff)}<br />
                    <b style="color:#0d0d0d;">Mario Padilla</b><br />
                    <span style="font-size:12.5px;color:#8f8880;">El Toaster</span>
                  </td>
                </tr>
              </table>
            </div>

            <p class="legal" style="font-size:11.5px;line-height:1.65;color:#8f8880;text-align:center;margin:16px 8px 0;">
              ${esc(t.why)}<br />
              <a href="${unsubscribeUrl}" style="color:#8f8880;text-decoration:underline;">${esc(t.unsubscribe)}</a> · ${esc(t.unsubscribeNote)}<br />
              El Toaster · Mario Padilla · ${esc(MAILING_ADDRESS)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  // Tests carry the time so Gmail shows each one in full instead of threading.
  const at = new Date().toLocaleTimeString("en-GB", {
    timeZone: "America/Phoenix",
    hour: "2-digit",
    minute: "2-digit",
  });
  const subject = (test ? `${t.testTag.replace("]", ` ${at}]`)} ` : "") + t.subject;
  return { subject, html, oneClickUrl };
}

async function send(sub: Subscriber, lang: Lang, test: boolean) {
  const mail = render(sub, lang, test);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [sub.email],
      reply_to: REPLY_TO,
      subject: mail.subject,
      html: mail.html,
      headers: {
        "List-Unsubscribe": `<${mail.oneClickUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  if (res.ok) return { ok: true as const, id: (await res.json())?.id as string | undefined };
  return { ok: false as const, error: `Resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !RESEND_API_KEY) return json({ error: "not_configured" }, 500);

  try {
    const body = await req.json().catch(() => ({}));
    const fields = "id,email,lang,is_test,unsubscribe_token";

    // A test: only ever to an address marked as a test, as often as asked.
    if (body.test === true) {
      const email = String(body.email || "").trim().toLowerCase();
      const r = await db(
        `newsletter_subscribers?email=eq.${encodeURIComponent(email)}&is_test=eq.true&unsubscribed_at=is.null&select=${fields}&limit=1`
      );
      const sub: Subscriber | undefined = r.ok ? (await r.json())[0] : undefined;
      if (!sub) return json({ error: "not_a_test_address" }, 404);
      const lang: Lang = body.lang === "en" ? "en" : body.lang === "es" ? "es" : sub.lang === "en" ? "en" : "es";
      const result = await send(sub, lang, true);
      return json({ status: result.ok ? "sent" : "failed", ...result }, result.ok ? 200 : 502);
    }

    const id = String(body.id || "");
    if (!UUID_RE.test(id)) return json({ error: "not_found" }, 404);

    // Claim the welcome before sending: whoever sets welcomed_at sends it.
    const claim = await db(
      `newsletter_subscribers?id=eq.${id}&welcomed_at=is.null&unsubscribed_at=is.null&is_test=eq.false&select=${fields}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ welcomed_at: new Date().toISOString() }),
      }
    );
    const sub: Subscriber | undefined = claim.ok ? (await claim.json())[0] : undefined;
    if (!sub) return json({ status: "skipped" });

    const result = await send(sub, sub.lang === "en" ? "en" : "es", false);
    if (!result.ok) {
      // Give the row back so the welcome can be retried.
      await db(`newsletter_subscribers?id=eq.${id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ welcomed_at: null }),
      });
      console.error("Welcome failed:", sub.email, result.error);
      return json({ status: "failed", error: result.error }, 502);
    }
    return json({ status: "sent", id: result.id });
  } catch (err) {
    console.error(err);
    return json({ error: "exception" }, 500);
  }
});
