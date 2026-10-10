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
// Before any email goes out the issue's written sections are published to the
// blog (newsletter_publish_issue), and every link in the email points at a
// page on eltoaster.com — never straight at an outside site.
//
// verify_jwt is off because the approval page on eltoaster.com calls this with
// the publishable key. Authority comes from the issue's own token, which exists
// only in the database and in the test email. Responses are JSON on purpose:
// Supabase serves function HTML as text/plain, so pages live on the site.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// CAN-SPAM requires a valid physical postal address in every commercial email.
const MAILING_ADDRESS = (
  Deno.env.get("MAILING_ADDRESS") || "3031 E Lark Dr, Chandler, AZ 85286"
).trim();

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
  teaser: string | null;
  excerpt: string | null;
  source: string | null;
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
type FunFact = Block & {
  image_url?: string;
  image_alt?: string;
  image_credit?: string;
};
type IssueContent = {
  subject: string;
  preheader?: string;
  fun_fact: FunFact;
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
/** Blog post id of each written section, per language. */
type SectionLinks = Partial<Record<Lang, Partial<Record<"fun_fact" | "pos" | "business", string>>>>;

// The fixed words around each issue's written content.
const COPY = {
  es: {
    funFact: "Dato curioso",
    news: "Lo que pasó en la industria",
    readMore: "Leer más en el blog →",
    moreNews: "Ver todas las noticias en el blog →",
    onBlog: "Seguir leyendo en eltoaster.com →",
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
  },
  en: {
    funFact: "Fun fact",
    news: "What happened in the industry",
    readMore: "Read more on the blog →",
    moreNews: "See all the news on the blog →",
    onBlog: "Keep reading at eltoaster.com →",
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

/** The email shows only a short teaser; the full story is on the blog. */
function teaserOf(p: Post) {
  if (p.teaser) return p.teaser;
  const text = (p.excerpt || "").trim();
  const first = text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
  return first.length > 170 ? first.slice(0, 169).trimEnd() + "…" : first;
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

const textLink = (href: string, text: string) =>
  `<a href="${esc(href)}" style="font-size:13px;font-weight:700;color:#d63e00;text-decoration:none;">${text}</a>`;

function render(
  sub: Subscriber,
  posts: Post[],
  mode: "test" | "live",
  ctx: { send: Send; liveCount: number; links: SectionLinks }
) {
  const lang: Lang = sub.lang === "en" ? "en" : "es";
  const t = COPY[lang];
  const c = ctx.send.content![lang]!;
  const mine = postsFor(lang, posts);
  const blog = (id?: string) => (id ? `${SITE_URL}/#blog/${id}` : `${SITE_URL}/#blog`);
  const links = ctx.links[lang] || {};
  const unsubscribeUrl = `${SITE_URL}/#unsubscribe/t/${sub.unsubscribe_token}`;
  const oneClickUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?t=${sub.unsubscribe_token}`;

  const funFactText = `
    <div style="font-size:18px;font-weight:800;color:#0d0d0d;line-height:1.3;margin-bottom:8px;">${esc(c.fun_fact.title)}</div>
    <div style="font-size:14.5px;line-height:1.6;color:#5b5651;margin-bottom:10px;">${esc(c.fun_fact.body)}</div>
    ${textLink(blog(links.fun_fact), t.onBlog)}`;

  // The photo sits beside the text so a tall picture doesn't push the story
  // off the first screen.
  const funFact = c.fun_fact.image_url
    ? `
    <table role="presentation" style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:150px;vertical-align:top;padding-right:16px;">
          <a href="${esc(blog(links.fun_fact))}"><img src="${esc(c.fun_fact.image_url)}" width="150" alt="${esc(c.fun_fact.image_alt || c.fun_fact.title)}" style="display:block;width:150px;height:auto;border-radius:10px;border:0;" /></a>
        </td>
        <td style="vertical-align:top;">${funFactText}</td>
      </tr>
    </table>
    ${
      c.fun_fact.image_credit
        ? `<div style="font-size:10.5px;color:#8f8880;margin-top:8px;">${esc(c.fun_fact.image_credit)}</div>`
        : ""
    }`
    : funFactText;

  const news = mine
    .map(
      (p) => `
      <div style="border:1px solid #e8e2d9;border-radius:12px;padding:14px 16px;margin-bottom:10px;">
        <div style="font-size:15.5px;font-weight:800;color:#0d0d0d;line-height:1.3;margin-bottom:5px;">${esc(p.title)}</div>
        <div style="font-size:14px;line-height:1.5;color:#5b5651;margin-bottom:8px;">${esc(teaserOf(p))}</div>
        ${textLink(blog(p.id), t.readMore)}
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
        <a href="${SITE_URL}" style="color:#ffffff;font-size:20px;font-weight:800;text-decoration:none;">El Toaster</a>
      </div>
      <div style="background:#ffffff;border:1px solid #e8e2d9;border-top:0;border-radius:0 0 16px 16px;padding:26px 26px 28px;">

        <div style="background:#fff7f2;border-radius:12px;padding:18px 20px;">
          ${label(t.funFact)}
          ${funFact}
        </div>

        ${divider}
        ${label(t.news)}
        ${news}
        ${textLink(blog(), t.moreNews)}

        ${divider}
        ${label(t.pos)}
        <div style="font-size:17px;font-weight:800;color:#0d0d0d;line-height:1.3;margin-bottom:8px;">${esc(c.pos.title)}</div>
        <div style="font-size:14.5px;line-height:1.6;color:#5b5651;margin-bottom:10px;">${esc(c.pos.body)}</div>
        ${textLink(blog(links.pos), t.onBlog)}

        ${divider}
        ${label(t.business)}
        <table role="presentation" style="width:100%;border-collapse:collapse;">${business}</table>
        ${textLink(blog(links.business), t.onBlog)}

        <div style="background:#0d0d0d;border-radius:14px;padding:24px 22px;text-align:center;margin-top:24px;">
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
        El Toaster · Mario Padilla · ${esc(MAILING_ADDRESS)}
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
  ctx: { send: Send; liveCount: number; links: SectionLinks },
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

/** Puts the issue's written sections on the blog and returns where they are. */
async function publishToBlog(sendId: string): Promise<SectionLinks | null> {
  const pub = await db("rpc/newsletter_publish_issue", {
    method: "POST",
    body: JSON.stringify({ p_send: sendId }),
  });
  if (!pub.ok) {
    console.error("Publish to blog failed:", pub.status, await pub.text());
    return null;
  }
  const res = await db(`blog_posts?send_id=eq.${sendId}&published=eq.true&select=id,kind,lang`);
  if (!res.ok) return null;
  const links: SectionLinks = {};
  for (const row of (await res.json()) as { id: string; kind: string; lang: Lang }[]) {
    (links[row.lang] ||= {})[row.kind as "fun_fact" | "pos" | "business"] = row.id;
  }
  return links;
}

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
      `blog_posts?id=in.(${send.post_ids.join(",")})&select=id,lang,title,teaser,excerpt,source,published_at`
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

    if (action === "test" && !["draft", "test_sent"].includes(send.status)) {
      return json({ error: "not_testable", ...summary(send) }, 409);
    }
    if (action === "live") {
      if (send.status === "sent") return json({ error: "already_sent", ...summary(send) }, 409);
      if (send.status === "draft") return json({ error: "test_first", ...summary(send) }, 409);
      if (send.status === "cancelled") return json({ error: "cancelled", ...summary(send) }, 409);
      if (!MAILING_ADDRESS) return json({ error: "mailing_address_missing", ...summary(send) }, 409);
    }
    if (targets.length === 0) {
      return json(
        {
          error: action === "test" ? "no_test_recipients" : "no_recipients",
          not_eligible: notEligible,
          ...summary(send),
        },
        409
      );
    }

    // The email links to these pages, so they must exist before it leaves.
    const links = await publishToBlog(send.id);
    if (!links) return json({ error: "blog_publish_failed", ...summary(send) }, 500);

    const ctx = { send, liveCount: live.length, links };

    if (action === "test") {
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
