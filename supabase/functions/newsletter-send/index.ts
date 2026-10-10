// Sends one newsletter issue (a row in public.newsletter_sends).
//
// An issue always goes out in two steps:
//   test  — to the internal seed addresses (newsletter_subscribers.is_test)
//   live  — to everyone else on the list who has not opted out
// Live is refused until a test has gone out, so nothing reaches a subscriber
// that Mario has not seen in a real inbox first.
//
//   GET  ?send=<id>&token=<token>                      issue summary (JSON)
//   POST { send, token, action: "test" }               send the test
//   POST { send, token, action: "live" }               send to subscribers
//   POST { send, token, action: "cancel" }             abandon a draft
//   POST { ..., action: "test" | "live", only: [..] }  just these addresses
//
// `only` narrows a send to specific people who are already eligible for that
// step; it cannot add anyone. A narrowed live send leaves the issue open, and
// the delivery rows it writes mean those people are skipped by the full send.
//
// verify_jwt is off because the approval page on eltoaster.com calls this with
// the publishable key. Authority comes from the issue's own token, which exists
// only in the database and in the test email. Responses are JSON on purpose:
// Supabase serves function HTML as text/plain, so pages live on the site.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// CAN-SPAM requires a valid physical postal address (street, P.O. box or
// registered mailbox) in every commercial email. Sending to the whole list is
// refused until the full address is set. The locality is shown meanwhile, but
// a city and ZIP alone do not meet the requirement.
const MAILING_ADDRESS = (Deno.env.get("MAILING_ADDRESS") || "").trim();
const MAILING_LOCALITY = "Chandler, AZ 85286";

const SITE_URL = "https://eltoaster.com";
const BOOKING_URL =
  "https://cal.com/mario-padilla-tirado-hnho7v/15-minutos-chat-free-restaurant-diagnostic";
const FROM_EMAIL = "El Toaster <mario@eltoaster.com>";
const REPLY_TO = "mario@eltoaster.com";

const POSTS_PER_ISSUE = 3;
const SEND_GAP_MS = 600; // Resend allows two requests per second
const TIME_BUDGET_MS = 110_000; // stay under the function's wall-clock limit
const STALE_MS = 5 * 60_000; // a "sending" issue older than this may be resumed

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

const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
type Post = {
  id: string;
  lang: string;
  title: string;
  excerpt: string | null;
  source: string | null;
  external_url: string | null;
  published_at: string;
};
type Subscriber = {
  id: string;
  email: string;
  lang: string;
  is_test: boolean;
  unsubscribe_token: string;
};
type Block = { title: string; body: string };
type IssueContent = {
  subject: string;
  preheader?: string;
  fun_fact: Block;
  pos: Block;
  business: Block[];
};
type Send = {
  id: string;
  status: string;
  token: string;
  post_ids: string[];
  content: Partial<Record<Lang, IssueContent>> | null;
  started_at: string | null;
  sent_at: string | null;
  recipients: number | null;
  error: string | null;
};

// The fixed words around each issue's written content.
const COPY = {
  es: {
    funFact: "Dato curioso",
    news: "Lo que pasó en la industria",
    readMore: "Leer el artículo completo →",
    moreNews: "Ver más noticias en el blog →",
    pos: "Tu punto de venta",
    business: "3 cosas que todo dueño debe saber",
    ctaTitle: "¿Platicamos 15 minutos?",
    ctaBody:
      "Te digo qué veo en tus reseñas y en tu operación. Sin costo y sin compromiso.",
    ctaButton: "Agendar mi llamada",
    signOff: "Un saludo,",
    ad: "Este es un correo promocional de El Toaster, enviado por Mario Padilla.",
    why: "Lo recibes porque te suscribiste en eltoaster.com o lo pediste al solicitar tu diagnóstico gratuito.",
    unsubscribe: "Darme de baja",
    unsubscribeNote: "La baja es inmediata y no tiene costo.",
    testTag: "[PRUEBA]",
    testTitle: "Prueba — esta edición todavía no se envía",
    testBody: (n: number) =>
      `Así la verán tus suscriptores. Si se ve bien, apruébala y saldrá a ${n} ${n === 1 ? "persona" : "personas"}.`,
    testButton: "Revisar y enviar",
    testNoAddress:
      "Falta tu dirección postal completa (calle o apartado postal), que la ley CAN-SPAM exige. Una ciudad y código postal no bastan, así que el envío a toda la lista sigue bloqueado.",
  },
  en: {
    funFact: "Fun fact",
    news: "What happened in the industry",
    readMore: "Read the full article →",
    moreNews: "See more news on the blog →",
    pos: "Your point of sale",
    business: "3 things every owner should know",
    ctaTitle: "Got 15 minutes?",
    ctaBody:
      "I'll tell you what I see in your reviews and your operation. No cost, no strings.",
    ctaButton: "Book my call",
    signOff: "Talk soon,",
    ad: "This is a promotional email from El Toaster, sent by Mario Padilla.",
    why: "You're getting it because you subscribed at eltoaster.com or asked for it when you requested your free diagnostic.",
    unsubscribe: "Unsubscribe",
    unsubscribeNote: "It takes effect right away and costs nothing.",
    testTag: "[TEST]",
    testTitle: "Test — this issue has not been sent yet",
    testBody: (n: number) =>
      `This is what your subscribers will see. If it looks right, approve it and it goes to ${n} ${n === 1 ? "person" : "people"}.`,
    testButton: "Review and send",
    testNoAddress:
      "Your full postal address (street or P.O. box) is missing, and CAN-SPAM requires it. A city and ZIP are not enough, so sending to the whole list stays blocked.",
  },
};

/** The stories one reader gets: their language, newest first. */
function postsFor(lang: Lang, posts: Post[]) {
  const pick = (l: string) =>
    posts
      .filter((p) => p.lang === l || p.lang === "both")
      .sort((a, b) => b.published_at.localeCompare(a.published_at))
      .slice(0, POSTS_PER_ISSUE);
  const own = pick(lang);
  return own.length ? own : pick(lang === "es" ? "en" : "es");
}

/** An issue is sendable only when both languages have every written section. */
function contentReady(send: Send) {
  return (["es", "en"] as Lang[]).every((l) => {
    const c = send.content?.[l];
    return Boolean(
      c?.subject && c.fun_fact?.title && c.fun_fact?.body && c.pos?.title && c.pos?.body &&
        Array.isArray(c.business) && c.business.length === 3 &&
        c.business.every((b) => b?.title && b?.body)
    );
  });
}

const label = (text: string) =>
  `<div style="font-size:11px;letter-spacing:0.09em;text-transform:uppercase;color:#d63e00;font-weight:800;margin:0 0 10px 0;">${text}</div>`;

function render(
  sub: Subscriber,
  posts: Post[],
  mode: "test" | "live",
  ctx: { send: Send; liveCount: number }
) {
  const lang: Lang = sub.lang === "en" ? "en" : "es";
  const t = COPY[lang];
  const c = ctx.send.content![lang]!;
  const mine = postsFor(lang, posts);
  const unsubscribeUrl = `${SITE_URL}/#unsubscribe/t/${sub.unsubscribe_token}`;
  const oneClickUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?t=${sub.unsubscribe_token}`;

  const news = mine
    .map(
      (p) => `
      <div style="border:1px solid #e8e2d9;border-radius:12px;padding:16px 18px;margin-bottom:12px;">
        <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#8f8880;font-weight:700;margin-bottom:5px;">${esc(p.source)}</div>
        <div style="font-size:16px;font-weight:800;color:#0d0d0d;line-height:1.3;margin-bottom:7px;">${esc(p.title)}</div>
        <div style="font-size:14px;line-height:1.55;color:#5b5651;">${esc(p.excerpt)}</div>
        ${
          p.external_url
            ? `<div style="margin-top:10px;"><a href="${esc(p.external_url)}" style="font-size:13px;font-weight:700;color:#d63e00;text-decoration:none;">${t.readMore}</a></div>`
            : ""
        }
      </div>`
    )
    .join("");

  const business = c.business
    .map(
      (b, i) => `
      <tr>
        <td style="width:40px;vertical-align:top;padding:0 0 16px 0;">
          <div style="width:28px;height:28px;line-height:28px;border-radius:50%;background:#FF4C00;color:#ffffff;font-weight:800;font-size:13px;text-align:center;">${i + 1}</div>
        </td>
        <td style="padding:2px 0 16px 0;">
          <div style="font-size:15px;font-weight:800;color:#0d0d0d;line-height:1.35;margin-bottom:4px;">${esc(b.title)}</div>
          <div style="font-size:14px;line-height:1.55;color:#5b5651;">${esc(b.body)}</div>
        </td>
      </tr>`
    )
    .join("");

  const testBanner =
    mode === "test"
      ? `
      <div style="border:2px dashed #FF4C00;border-radius:14px;background:#fff7f2;padding:18px 20px;margin-bottom:18px;">
        <div style="font-size:15px;font-weight:800;color:#0d0d0d;margin-bottom:6px;">${t.testTitle}</div>
        <div style="font-size:14px;line-height:1.55;color:#5b5651;margin-bottom:14px;">${t.testBody(ctx.liveCount)}</div>
        ${
          MAILING_ADDRESS
            ? ""
            : `<div style="font-size:13px;line-height:1.5;color:#a32d2d;margin-bottom:14px;">${t.testNoAddress}</div>`
        }
        <a href="${SITE_URL}/#send/${ctx.send.id}/${ctx.send.token}" style="display:inline-block;background:#FF4C00;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px;">${t.testButton}</a>
      </div>`
      : "";

  const divider = `<div style="border-top:1px solid #e8e2d9;margin:26px 0;"></div>`;

  const html = `
  <div style="font-family:Inter,Arial,Helvetica,sans-serif;background:#fdfbf8;padding:28px 16px;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(c.preheader || "")}</span>
    <div style="max-width:580px;margin:0 auto;">
      ${testBanner}
      <div style="background:#FF4C00;padding:20px 26px;border-radius:16px 16px 0 0;">
        <div style="color:#ffffff;font-size:20px;font-weight:800;">El Toaster</div>
      </div>
      <div style="background:#ffffff;border:1px solid #e8e2d9;border-top:0;border-radius:0 0 16px 16px;padding:26px 26px 28px;">

        <div style="background:#fff7f2;border-radius:12px;padding:18px 20px;">
          ${label(t.funFact)}
          <div style="font-size:18px;font-weight:800;color:#0d0d0d;line-height:1.3;margin-bottom:8px;">${esc(c.fun_fact.title)}</div>
          <div style="font-size:14.5px;line-height:1.6;color:#5b5651;">${esc(c.fun_fact.body)}</div>
        </div>

        ${divider}
        ${label(t.news)}
        ${news}
        <a href="${SITE_URL}/#blog" style="font-size:13px;font-weight:700;color:#d63e00;text-decoration:none;">${t.moreNews}</a>

        ${divider}
        ${label(t.pos)}
        <div style="font-size:17px;font-weight:800;color:#0d0d0d;line-height:1.3;margin-bottom:8px;">${esc(c.pos.title)}</div>
        <div style="font-size:14.5px;line-height:1.6;color:#5b5651;">${esc(c.pos.body)}</div>

        ${divider}
        ${label(t.business)}
        <table role="presentation" style="width:100%;border-collapse:collapse;">${business}</table>

        <div style="background:#0d0d0d;border-radius:14px;padding:24px 22px;text-align:center;margin-top:10px;">
          <div style="font-size:18px;font-weight:800;color:#ffffff;margin-bottom:6px;">${t.ctaTitle}</div>
          <div style="font-size:14px;line-height:1.55;color:#d6d0ca;margin-bottom:16px;">${t.ctaBody}</div>
          <a href="${BOOKING_URL}" style="display:inline-block;background:#FF4C00;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;">${t.ctaButton}</a>
        </div>

        <div style="margin-top:24px;font-size:14px;color:#5b5651;line-height:1.6;">
          ${t.signOff}<br />
          <b style="color:#0d0d0d;">Mario Padilla</b><br />
          <span style="font-size:12.5px;color:#8f8880;">El Toaster</span>
        </div>
      </div>

      <p style="font-size:11.5px;line-height:1.65;color:#8f8880;text-align:center;margin:16px 8px 0;">
        ${t.ad}<br />
        ${t.why}<br />
        <a href="${unsubscribeUrl}" style="color:#8f8880;text-decoration:underline;">${t.unsubscribe}</a> · ${t.unsubscribeNote}<br />
        El Toaster · Mario Padilla · ${esc(MAILING_ADDRESS || MAILING_LOCALITY)}
      </p>
    </div>
  </div>`;

  const subject = (mode === "test" ? `${t.testTag} ` : "") + c.subject;
  return { subject, html, oneClickUrl, hasPosts: mine.length > 0 };
}

async function resendSend(payload: Record<string, unknown>) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true as const, id: (await res.json())?.id as string | undefined };
    if (res.status === 429 && attempt === 0) {
      await sleep(1500);
      continue;
    }
    return { ok: false as const, error: `Resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
  }
  return { ok: false as const, error: "Resend rate limit" };
}

/**
 * Mails `list` one by one. Each recipient is claimed by inserting their
 * delivery row first; the unique key on (send, subscriber, mode) means a retry
 * or a double click finds the row already there and skips anyone already sent.
 */
async function deliver(
  list: Subscriber[],
  posts: Post[],
  mode: "test" | "live",
  ctx: { send: Send; liveCount: number },
  startedAt: number
) {
  const out = { sent: 0, failed: 0, skipped: 0, remaining: 0, errors: [] as string[] };

  for (let i = 0; i < list.length; i++) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      out.remaining = list.length - i;
      break;
    }
    const sub = list[i];

    const claim = await db("newsletter_deliveries?on_conflict=send_id,subscriber_id,mode", {
      method: "POST",
      headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
      body: JSON.stringify({ send_id: ctx.send.id, subscriber_id: sub.id, mode }),
    });
    let rows = claim.ok ? await claim.json() : [];
    if (!Array.isArray(rows) || rows.length === 0) {
      const existing = await db(
        `newsletter_deliveries?send_id=eq.${ctx.send.id}&subscriber_id=eq.${sub.id}&mode=eq.${mode}&select=id,status&limit=1`
      );
      rows = existing.ok ? await existing.json() : [];
      if (rows[0]?.status === "sent") {
        out.skipped++;
        continue;
      }
    }
    const deliveryId = rows[0]?.id;
    if (!deliveryId) {
      out.failed++;
      out.errors.push(`${sub.email}: could not record delivery`);
      continue;
    }

    const mail = render(sub, posts, mode, ctx);
    const result = mail.hasPosts
      ? await resendSend({
          from: FROM_EMAIL,
          to: [sub.email],
          reply_to: REPLY_TO,
          subject: mail.subject,
          html: mail.html,
          headers: {
            "List-Unsubscribe": `<${mail.oneClickUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        })
      : { ok: false as const, error: "no posts for this issue" };

    await db(`newsletter_deliveries?id=eq.${deliveryId}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(
        result.ok
          ? { status: "sent", resend_id: result.id ?? null, sent_at: new Date().toISOString(), error: null }
          : { status: "failed", error: result.error }
      ),
    });

    if (result.ok) out.sent++;
    else {
      out.failed++;
      out.errors.push(`${sub.email}: ${result.error}`);
    }

    if (i < list.length - 1) await sleep(SEND_GAP_MS);
  }
  return out;
}

const patchSend = (id: string, filter: string, body: Record<string, unknown>) =>
  db(`newsletter_sends?id=eq.${id}${filter}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body),
  }).then(async (r) => (r.ok ? ((await r.json()) as Send[]) : []));

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json({ error: "not_configured" }, 500);

  const startedAt = Date.now();
  const url = new URL(req.url);

  try {
    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }
    const sendId = String(body.send ?? url.searchParams.get("send") ?? "");
    const token = String(body.token ?? url.searchParams.get("token") ?? "");
    const action = req.method === "POST" ? String(body.action ?? "") : "status";
    const only = (Array.isArray(body.only) ? body.only : body.only ? [body.only] : [])
      .map((e) => String(e).trim().toLowerCase())
      .filter(Boolean);

    if (!UUID_RE.test(sendId) || !UUID_RE.test(token)) return json({ error: "not_found" }, 404);

    const sendRes = await db(`newsletter_sends?id=eq.${sendId}&token=eq.${token}&limit=1`);
    const send: Send | undefined = sendRes.ok ? (await sendRes.json())[0] : undefined;
    if (!send) return json({ error: "not_found" }, 404);

    const subsRes = await db(
      "newsletter_subscribers?unsubscribed_at=is.null&select=id,email,lang,is_test,unsubscribe_token&order=created_at.asc&limit=5000"
    );
    if (!subsRes.ok) return json({ error: "list_unavailable" }, 500);
    const subs: Subscriber[] = await subsRes.json();
    const tests = subs.filter((s) => s.is_test);
    const live = subs.filter((s) => !s.is_test);

    const postsRes = await db(
      `blog_posts?id=in.(${send.post_ids.join(",")})&select=id,lang,title,excerpt,source,external_url,published_at`
    );
    const posts: Post[] = postsRes.ok ? await postsRes.json() : [];
    const ready = contentReady(send);

    const summary = (s: Send) => ({
      id: s.id,
      status: s.status,
      content_ready: ready,
      test_recipients: tests.length,
      live_recipients: live.length,
      mailing_address_set: Boolean(MAILING_ADDRESS),
      sent_at: s.sent_at,
      recipients: s.recipients,
      last_error: s.error,
      subject: { es: s.content?.es?.subject ?? null, en: s.content?.en?.subject ?? null },
      stories: {
        es: postsFor("es", posts).map((p) => p.title),
        en: postsFor("en", posts).map((p) => p.title),
      },
    });

    if (action === "status") return json(summary(send));

    if (action === "cancel") {
      const rows = await patchSend(send.id, "&status=in.(draft,test_sent,failed)", {
        status: "cancelled",
      });
      return rows.length ? json(summary(rows[0])) : json({ error: "cannot_cancel", ...summary(send) }, 409);
    }

    if (action !== "test" && action !== "live") return json({ error: "unknown_action" }, 400);
    if (!RESEND_API_KEY) return json({ error: "resend_not_configured" }, 500);
    if (posts.length === 0) return json({ error: "no_posts", ...summary(send) }, 409);
    if (!ready) return json({ error: "content_missing", ...summary(send) }, 409);

    // Narrow to the requested addresses. Anyone asked for who is not eligible
    // for this step (opted out, unknown, or the wrong kind of address) is
    // reported back rather than mailed.
    const pool = action === "test" ? tests : live;
    const targets = only.length ? pool.filter((s) => only.includes(s.email.toLowerCase())) : pool;
    const notEligible = only.filter((e) => !targets.some((s) => s.email.toLowerCase() === e));

    const ctx = { send, liveCount: live.length };

    if (action === "test") {
      if (!["draft", "test_sent"].includes(send.status)) {
        return json({ error: "not_testable", ...summary(send) }, 409);
      }
      if (targets.length === 0) {
        return json({ error: "no_test_recipients", not_eligible: notEligible, ...summary(send) }, 409);
      }

      // A test can be repeated, so clear these recipients' previous rows first.
      await db(
        `newsletter_deliveries?send_id=eq.${send.id}&mode=eq.test&subscriber_id=in.(${targets
          .map((s) => s.id)
          .join(",")})`,
        { method: "DELETE" }
      );
      const result = await deliver(targets, posts, "test", ctx, startedAt);

      let current = send;
      if (result.sent > 0) {
        const rows = await patchSend(send.id, "&status=in.(draft,test_sent)", {
          status: "test_sent",
          test_sent_at: new Date().toISOString(),
        });
        if (rows.length) current = rows[0];
      }
      return json(
        { ...summary(current), result, not_eligible: notEligible },
        result.sent > 0 ? 200 : 502
      );
    }

    // action === "live"
    if (send.status === "sent") return json({ error: "already_sent", ...summary(send) }, 409);
    if (send.status === "draft") return json({ error: "test_first", ...summary(send) }, 409);
    if (send.status === "cancelled") return json({ error: "cancelled", ...summary(send) }, 409);
    // The whole list needs the full postal address. A send narrowed to named
    // people is allowed with the locality, as an explicit one-off.
    if (!MAILING_ADDRESS && only.length === 0) {
      return json({ error: "mailing_address_missing", ...summary(send) }, 409);
    }
    if (targets.length === 0) {
      return json({ error: "no_recipients", not_eligible: notEligible, ...summary(send) }, 409);
    }

    const now = new Date().toISOString();
    let claimed = await patchSend(send.id, "&status=in.(test_sent,failed)", {
      status: "sending",
      started_at: now,
      error: null,
    });
    if (!claimed.length && send.status === "sending" && send.started_at) {
      // Another run holds it. Only take over if that run is clearly dead.
      if (Date.now() - new Date(send.started_at).getTime() < STALE_MS) {
        return json({ error: "in_progress", ...summary(send) }, 409);
      }
      claimed = await patchSend(
        send.id,
        `&status=eq.sending&started_at=eq.${encodeURIComponent(send.started_at)}`,
        { started_at: now }
      );
    }
    if (!claimed.length) return json({ error: "in_progress", ...summary(send) }, 409);

    const result = await deliver(targets, posts, "live", ctx, startedAt);

    const countRes = await db(
      `newsletter_deliveries?send_id=eq.${send.id}&mode=eq.live&status=eq.sent&select=id`
    );
    const delivered = countRes.ok ? (await countRes.json()).length : result.sent;

    // A narrowed send never finishes the issue: it goes back to waiting for
    // approval, with those people already marked as delivered.
    const finished = only.length === 0 && result.remaining === 0;
    const rows = await patchSend(
      send.id,
      "",
      only.length
        ? { status: "test_sent", recipients: delivered }
        : {
            status: finished ? "sent" : "failed",
            sent_at: finished ? new Date().toISOString() : null,
            recipients: delivered,
            error: finished
              ? result.failed
                ? `${result.failed} could not be delivered`
                : null
              : `Stopped with ${result.remaining} still to send. Approve again to finish; nobody is mailed twice.`,
          }
    );
    return json({ ...summary(rows[0] ?? send), result, not_eligible: notEligible });
  } catch (err) {
    console.error(err);
    return json({ error: "exception" }, 500);
  }
});
