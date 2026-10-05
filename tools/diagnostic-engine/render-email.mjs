/**
 * Renders a completed review diagnostic into an email-safe HTML body.
 *
 * The research step (Google Business Profile + Yelp, read through a real
 * browser by the `restaurant-review-diagnostic` skill) produces the JSON this
 * module takes as input; everything here is formatting and validation, never
 * invention.
 *
 * Three things worth knowing before changing it:
 *
 * 1. `validate()` is a hard gate, not a linter. The worst failure mode for this
 *    engine is emailing a restaurant owner a quote that nobody actually wrote,
 *    under Mario's name. So a finding without an attributed verbatim quote, or
 *    a quote attributed to a location that wasn't researched, throws instead of
 *    rendering. Fail loudly and wait for a human rather than send something
 *    that can't be sourced.
 *
 * 2. The HTML is deliberately old-fashioned — nested presentation tables,
 *    inline styles, hex colors, no CSS variables, no flex or grid. Email
 *    clients (Outlook especially) don't support modern layout, and Gmail
 *    silently clips a message over ~102KB, which would cut the report off
 *    mid-finding. `MAX_HTML_BYTES` guards that.
 *
 * 3. Readability is the brief. Restaurant owners read this on a phone, often
 *    quickly. Type is large, ratings are spelled out ("4.2 de 5" over "75
 *    reseñas") rather than compressed into "4.2 · 75", and anything that
 *    matters sits on a tinted panel so it survives skimming.
 */

// Mario's email palette, matching send-diagnostic-email so a report reads as
// coming from the same sender as the confirmation that preceded it.
const C = {
  orange: "#FF4C00",
  orangeDark: "#d63e00",
  orangeTint: "#FFF1EB",
  ink: "#0d0d0d",
  body: "#45413d",
  faint: "#8f8880",
  border: "#e8e2d9",
  panel: "#faf7f3",
  panelAlt: "#f6f2ec",
  page: "#fdfbf8",
  white: "#ffffff",
  green: "#1e7a46",
  greenBg: "#e8f4ed",
  red: "#c0392b",
  redBg: "#fdecea",
  blue: "#1a5f9c",
  blueBg: "#eaf2fa",
};

const FONT = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif";

// Gmail clips around 102KB; stay under with room for the Resend wrapper.
const MAX_HTML_BYTES = 96 * 1024;

// Served from the Supabase `brand` bucket rather than the site build, for two
// reasons: the URL has no build hash so it survives redeploys and never breaks
// the image in an email already sent, and it needs no deploy to update. JPEG,
// not WebP — Outlook does not render WebP and showed a broken image instead.
const PHOTO_URL =
  "https://oichxzrvbvauazvvysll.supabase.co/storage/v1/object/public/brand/mario.jpg";

// Icon set, same bucket. Rebuild and re-upload with build-icons.mjs.
const ICON_BASE =
  "https://oichxzrvbvauazvvysll.supabase.co/storage/v1/object/public/brand/icons";

// A diagnostic is a conversation starter, not an audit. Past three problems a
// reader stops reading and starts feeling attacked, and the fourth-ranked
// finding is always the weakest-sourced one. The research step ranks findings
// by weight, so taking the first three keeps the strongest and drops the filler.
const MAX_FINDINGS = 3;

// See the language note in renderDiagnosticEmail. Flip to true to honour the
// form's English selection again.
const ALLOW_ENGLISH = false;

const COPY = {
  es: {
    subjectOne: (r) => `Diagnóstico de Reseñas en YELP - ${r}`,
    subjectMany: (r, n) => `Diagnóstico de Reseñas en YELP - ${r} (${n} ubicaciones)`,
    kicker: "EL TOASTER",
    heading: "Diagnóstico de reseñas de YELP",
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    intro: (r) =>
      `Esto es lo que tus clientes están diciendo de <b>${r}</b> en internet hoy. Todo sale de reseñas reales, leídas una por una.`,
    scoreLabel: "Tu calificación real",
    scoreNote: "Combinando Google y Yelp, con más peso donde hay más reseñas.",
    outOf: "de 5",
    reviewsWord: (n) => (n === 1 ? "reseña" : "reseñas"),
    locationsTitle: "Dónde estás parado",
    thLocation: "Ubicación",
    lovedTitle: "Lo que la gente valora",
    findingsTitle: "Lo que hay que ponerle atención de Yelp",
    findingsLede: "Cada punto viene directo de reseñas de Yelp, con la cita textual del cliente.",
    partialNote: "la reseña sigue más allá de lo que se pudo capturar",
    challengeLead: "Tú me dijiste que tu reto más grande es:",
    challengeNote: "Le puse atención especial a eso al revisar tus reseñas.",
    benchTitle: "Tu competencia",
    thCompetitor: "Negocio",
    thRating: "Calificación",
    thReviews: "Reseñas",
    youLabel: "TÚ",
    moneyTitle: "Qué significa en dinero",
    moneyBasis:
      "Una estrella equivale a entre 5% y 9% de las ventas (Michael Luca, Harvard Business School, 2011).",
    questionsTitle: "Lo que quiero preguntarte",
    ctaLead: "¿Lo platicamos?",
    ctaBody: "Agendemos una llamada de 15 minutos, me interesa entender más sobre tu negocio y poder ayudarte.",
    ctaButton: "Agendar 15 minutos",
    signOff: "Un saludo,",
    role: "El Toaster",
    sourcesLabel: "Fuentes:",
    accessedLabel: "Consultado el",
    disclaimer: "Las calificaciones cambian. Esto refleja lo publicado en esa fecha.",
    allegationNote:
      "Lo que afirman los clientes se reporta tal como ellos lo escribieron y no está verificado de forma independiente.",
    footer:
      "Recibes este correo porque pediste un diagnóstico gratuito en eltoaster.com. No comparto ni vendo tus datos.",
    unsubscribe: "Darme de baja",
  },
  en: {
    subjectOne: (r) => `Diagnóstico de Reseñas en YELP - ${r}`,
    subjectMany: (r, n) => `Diagnóstico de Reseñas en YELP - ${r} (${n} ubicaciones)`,
    kicker: "EL TOASTER",
    heading: "Reputation diagnostic",
    greeting: (n) => (n ? `Hi ${n},` : "Hi,"),
    intro: (r) =>
      `Here's what your customers are saying about <b>${r}</b> online today. All of it comes from real reviews, read one by one.`,
    scoreLabel: "Your real rating",
    scoreNote: "Google and Yelp combined, weighted toward wherever you have more reviews.",
    outOf: "out of 5",
    reviewsWord: (n) => (n === 1 ? "review" : "reviews"),
    locationsTitle: "Where you stand",
    thLocation: "Location",
    lovedTitle: "What people love",
    findingsTitle: "What needs attention",
    findingsLede: "Each point comes with the customer's own words.",
    partialNote: "the review continues past what we could capture",
    challengeLead: "You told me your biggest challenge is:",
    challengeNote: "I paid special attention to that when I went through your reviews.",
    benchTitle: "Your competition",
    thCompetitor: "Business",
    thRating: "Rating",
    thReviews: "Reviews",
    youLabel: "YOU",
    moneyTitle: "What it means in dollars",
    moneyBasis:
      "One star is worth 5% to 9% of revenue (Michael Luca, Harvard Business School, 2011).",
    questionsTitle: "What I want to ask you",
    ctaLead: "Want to talk it through?",
    ctaBody: "15 minutes, in English or Spanish. The report is yours either way.",
    ctaButton: "Book 15 minutes",
    signOff: "Talk soon,",
    role: "El Toaster",
    sourcesLabel: "Sources:",
    accessedLabel: "Accessed",
    disclaimer: "Ratings change. This reflects what was published on that date.",
    allegationNote:
      "Reviewer claims are reported as written and have not been independently verified.",
    footer:
      "You're getting this because you requested a free diagnostic at eltoaster.com. I don't share or sell your information.",
    unsubscribe: "Unsubscribe",
  },
};

export function escapeHtml(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

const fmtRating = (n) => (typeof n === "number" ? n.toFixed(1) : "—");
const fmtCount = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : "—");

/**
 * Refuses to render anything that can't be sourced.
 *
 * Returns every problem rather than throwing on the first, so a run that needs
 * more research sees the full picture in one pass.
 */
export function validate(payload) {
  const problems = [];
  const lead = payload?.lead ?? {};
  const r = payload?.research ?? {};

  if (!lead.restaurant_name) problems.push("lead.restaurant_name is missing");
  if (!lead.email) problems.push("lead.email is missing");

  if (!r.accessed_on) {
    problems.push("research.accessed_on is missing — the report must state when data was read");
  }

  const locs = Array.isArray(r.locations) ? r.locations : [];
  if (locs.length === 0) problems.push("research.locations is empty — nothing was researched");

  locs.forEach((l, i) => {
    if (!l.label) problems.push(`locations[${i}].label is missing`);
    if (!l.google && !l.yelp) {
      problems.push(`locations[${i}] (${l.label || "?"}) has neither Google nor Yelp data`);
    }
  });

  const score = r.weighted_score;
  if (typeof score !== "number" || score < 1 || score > 5) {
    problems.push("research.weighted_score must be a number between 1 and 5");
  }

  // The core anti-fabrication rule: a finding is only a finding if a real
  // reviewer said something, and we know which platform and which location.
  // A quote pinned to a location that was never researched is exactly how the
  // Backyard Taco misattribution happened, so that's checked explicitly.
  const labels = new Set(locs.map((l) => l.label).filter(Boolean));
  const findings = Array.isArray(r.findings) ? r.findings : [];

  findings.forEach((f, i) => {
    const tag = `findings[${i}] (${f.title || "untitled"})`;
    if (!f.title) problems.push(`${tag}: title is missing`);
    if (!f.whats_happening) problems.push(`${tag}: whats_happening is missing`);

    const quotes = Array.isArray(f.quotes) ? f.quotes : [];
    if (quotes.length === 0) {
      problems.push(
        `${tag}: has no quotes — every finding needs verbatim review text or it cannot be sent`
      );
    }
    quotes.forEach((q, j) => {
      const qtag = `${tag} quote[${j}]`;
      if (!q.text || String(q.text).trim().length < 15) {
        problems.push(`${qtag}: text is missing or too short to be a real quote`);
      }
      if (!q.platform) problems.push(`${qtag}: platform is missing`);
      if (!q.location) {
        problems.push(`${qtag}: location is missing`);
      } else if (labels.size && !labels.has(q.location)) {
        problems.push(
          `${qtag}: attributed to "${q.location}", which is not one of the researched locations ` +
            `(${[...labels].join(", ")}) — check this quote belongs to this business`
        );
      }
      if (typeof q.partial !== "boolean") {
        problems.push(
          `${qtag}: partial must be explicitly true or false, so a truncated quote is labeled honestly`
        );
      }
    });
  });

  if (!Array.isArray(r.sources) || r.sources.length === 0) {
    problems.push("research.sources is empty — the footer must name where the data came from");
  }

  return problems;
}

/* ---------------------------------------------------------------- partials */

const row = (inner, pad = "0 0 20px 0") => `<tr><td style="padding:${pad};">${inner}</td></tr>`;

/**
 * A PNG rendered from the SVG set in build-icons.mjs. PNG rather than inline
 * SVG because Gmail strips <svg> and Outlook never supported it. Icons are
 * decorative: alt is empty so a screen reader doesn't announce them, and every
 * heading still reads correctly in the many inboxes that block images by
 * default.
 */
function icon(name, size = 24) {
  return `<img src="${ICON_BASE}/${name}.png" width="${size}" height="${size}" alt="" style="display:block;width:${size}px;height:${size}px;border:0;" />`;
}

function sectionTitle(text, iconName) {
  const cell = iconName
    ? `<td width="34" valign="middle" style="padding:0 10px 0 0;">${icon(iconName)}</td>`
    : "";
  return `<tr><td style="padding:6px 0 12px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>${cell}<td valign="middle" style="font-family:${FONT};font-size:23px;font-weight:800;color:${C.ink};line-height:1.25;">${escapeHtml(
      text
    )}</td></tr>
  </table>
</td></tr>`;
}

function para(html, size = 17) {
  return `<tr><td style="padding:0 0 16px 0;font-family:${FONT};font-size:${size}px;line-height:1.65;color:${C.body};">${html}</td></tr>`;
}

/** Tinted panel — the main tool for making something survive a skim. */
function panel(inner, { bg = C.panel, border = C.orange } = {}) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 18px 0;">
  <tr><td style="background:${bg};border-left:5px solid ${border};padding:18px 20px;font-family:${FONT};font-size:17px;line-height:1.6;color:${C.body};">${inner}</td></tr>
</table>`;
}

/**
 * One platform's numbers, spelled out. "4.2 de 5" above "75 reseñas" reads at a
 * glance; the older "4.2 · 75" made people ask what the second number was.
 */
function platformCard(name, data, t, accent) {
  if (!data || typeof data.rating !== "number") return "";
  return `<td class="stack" width="50%" valign="top" style="padding:0 6px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.white};border:2px solid ${accent};">
    <tr><td align="center" style="background:${accent};padding:8px 10px;font-family:${FONT};font-size:14px;font-weight:800;letter-spacing:.08em;color:#ffffff;">${escapeHtml(
      name
    )}</td></tr>
    <tr><td align="center" style="padding:16px 10px 18px 10px;">
      <div style="font-family:${FONT};font-size:44px;font-weight:800;color:${C.ink};line-height:1;">${fmtRating(
        data.rating
      )}</div>
      <div style="font-family:${FONT};font-size:14px;color:${C.faint};padding-top:4px;">${escapeHtml(
        t.outOf
      )}</div>
      <div style="font-family:${FONT};font-size:17px;font-weight:700;color:${C.body};padding-top:10px;">${fmtCount(
        data.count
      )} ${escapeHtml(t.reviewsWord(data.count))}</div>
    </td></tr>
  </table>
</td>`;
}

function quoteBlock(q, t) {
  const cite = [q.location, q.platform].filter(Boolean).map(escapeHtml).join(" — ");
  const note = q.partial ? ` (${escapeHtml(t.partialNote)})` : "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 12px 0;">
  <tr><td style="background:${C.white};border-left:4px solid ${C.border};padding:12px 16px;">
    <div style="font-family:${FONT};font-size:17px;line-height:1.6;color:${C.ink};font-style:italic;">&ldquo;${escapeHtml(
      q.text
    )}&rdquo;</div>
    <div style="font-family:${FONT};font-size:13px;color:${C.faint};padding-top:8px;">${cite}${note}</div>
  </td></tr>
</table>`;
}

function dataTable(headers, rows) {
  const th = headers
    .map(
      (h) =>
        `<th align="left" style="background:${C.ink};color:${C.white};font-family:${FONT};font-size:14px;font-weight:700;text-align:left;padding:11px 12px;">${escapeHtml(
          h
        )}</th>`
    )
    .join("");
  const tr = rows
    .map((cells, i) => {
      const bg = i % 2 === 1 ? C.panelAlt : C.white;
      return `<tr>${cells
        .map(
          (c) =>
            `<td style="background:${bg};font-family:${FONT};font-size:16px;color:${C.body};padding:11px 12px;">${c}</td>`
        )
        .join("")}</tr>`;
    })
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
  <tr>${th}</tr>${tr}
</table>`;
}

function bulletList(items, bulletColor = C.orange) {
  return items
    .map(
      (it) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td width="18" valign="top" style="font-family:${FONT};font-size:19px;line-height:1.5;color:${bulletColor};padding:0 0 12px 0;">&bull;</td>
    <td style="font-family:${FONT};font-size:17px;line-height:1.6;color:${C.body};padding:0 0 12px 0;">${escapeHtml(
        it
      )}</td>
  </tr>
</table>`
    )
    .join("");
}

/* ------------------------------------------------------------------ render */

/**
 * @returns {{ subject: string, html: string, bytes: number }}
 * @throws if the payload can't be sourced, or the result would be clipped.
 */
export function renderDiagnosticEmail(payload, opts = {}) {
  const problems = validate(payload);
  if (problems.length) {
    throw new Error(
      `Diagnostic cannot be rendered — ${problems.length} unresolved problem(s):\n` +
        problems.map((p) => `  - ${p}`).join("\n")
    );
  }

  const { lead, research: r } = payload;

  // Spanish is the rule, not the default. El Toaster sells to Latino-owned
  // restaurants and the reports go out in Spanish even when the form's language
  // selector says otherwise — a lead ticking "English" on a web form is weaker
  // evidence than who this business actually serves. The English copy is kept
  // and maintained so flipping ALLOW_ENGLISH back to true is a one-line change
  // if that call ever changes.
  const lang = lead.preferred_language === "en" && ALLOW_ENGLISH ? "en" : "es";
  const t = COPY[lang];

  const schedulingUrl =
    opts.schedulingUrl ||
    "https://cal.com/mario-padilla-tirado-hnho7v/15-minutos-chat-free-restaurant-diagnostic";
  const unsubscribeUrl = opts.unsubscribeUrl || "";
  const photoUrl = opts.photoUrl || PHOTO_URL;

  const restaurant = escapeHtml(lead.restaurant_name);
  const contact = escapeHtml(lead.contact_name || "");
  const locs = r.locations;
  const multi = locs.length > 1;

  const blocks = [];

  /* greeting + intro */
  blocks.push(
    `<tr><td style="padding:0 0 14px 0;font-family:${FONT};font-size:19px;font-weight:700;color:${C.ink};">${t.greeting(
      contact
    )}</td></tr>`,
    para(t.intro(restaurant))
  );

  /* headline number — the single most important thing on the page */
  blocks.push(row(`<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr><td align="center" style="background:${C.orangeTint};border:3px solid ${C.orange};padding:24px 20px;">
    <div style="padding-bottom:6px;">${icon("star", 28)}</div>
    <div style="font-family:${FONT};font-size:14px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.orangeDark};">${escapeHtml(
      t.scoreLabel
    )}</div>
    <div style="font-family:${FONT};font-size:64px;font-weight:800;color:${C.ink};line-height:1.05;padding:8px 0 2px 0;">${fmtRating(
      r.weighted_score
    )}</div>
    <div style="font-family:${FONT};font-size:17px;font-weight:700;color:${C.faint};padding-bottom:10px;">${escapeHtml(
      t.outOf
    )}</div>
    <div style="font-family:${FONT};font-size:15px;line-height:1.55;color:${C.body};">${escapeHtml(
      t.scoreNote
    )}</div>
  </td></tr>
</table>`, "0 0 24px 0"));

  /* where you stand — name, address, and each platform spelled out */
  blocks.push(sectionTitle(t.locationsTitle, "pin"));

  if (!multi) {
    const l = locs[0];
    blocks.push(row(
      panel(
        `<div style="font-family:${FONT};font-size:19px;font-weight:800;color:${C.ink};">${restaurant}</div>
<div style="font-family:${FONT};font-size:15px;color:${C.faint};padding-top:4px;">${escapeHtml(l.address || l.label)}</div>`,
        { bg: C.panel, border: C.orange }
      ) +
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>${platformCard("GOOGLE", l.google, t, C.blue)}${platformCard("YELP", l.yelp, t, C.red)}</tr>
</table>`,
      "0 0 10px 0"
    ));

    if (l.note) {
      blocks.push(
        `<tr><td style="padding:0 0 18px 0;font-family:${FONT};font-size:15px;color:${C.faint};">${escapeHtml(
          l.note
        )}</td></tr>`
      );
    }
  } else {
    const rows = locs.map((l) => [
      `<b style="color:${C.ink};">${escapeHtml(l.label)}</b>`,
      l.google
        ? `<b>${fmtRating(l.google.rating)}</b><br><span style="font-size:14px;color:${C.faint};">${fmtCount(
            l.google.count
          )} ${escapeHtml(t.reviewsWord(l.google.count))}</span>`
        : "—",
      l.yelp
        ? `<b>${fmtRating(l.yelp.rating)}</b><br><span style="font-size:14px;color:${C.faint};">${fmtCount(
            l.yelp.count
          )} ${escapeHtml(t.reviewsWord(l.yelp.count))}</span>`
        : "—",
    ]);
    blocks.push(row(dataTable([t.thLocation, "Google", "Yelp"], rows)));
  }

  /* strengths */
  if (r.strengths?.length) {
    blocks.push(
      sectionTitle(t.lovedTitle, "heart"),
      row(
        panel(bulletList(r.strengths, C.green), { bg: C.greenBg, border: C.green }),
        "0 0 6px 0"
      )
    );
  }

  /* the owner's own stated challenge */
  const challenge = (lead.biggest_challenge || "").trim();
  if (challenge && challenge.toUpperCase() !== "NA") {
    blocks.push(
      row(
        panel(
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="34" valign="top" style="padding:2px 10px 0 0;">${icon("target")}</td><td><div style="font-size:14px;color:${C.faint};padding-bottom:6px;">${escapeHtml(
            t.challengeLead
          )}</div>
<div style="font-size:19px;font-weight:800;color:${C.ink};padding-bottom:8px;">${escapeHtml(
            challenge
          )}</div>
<div style="font-size:16px;">${escapeHtml(t.challengeNote)}</div></td></tr></table>`,
          { bg: C.blueBg, border: C.blue }
        ),
        "0 0 8px 0"
      )
    );
  }

  /* findings — the pain points, each with a tinted header band */
  const findings = (r.findings || []).slice(0, MAX_FINDINGS);
  if (findings.length) {
    blocks.push(sectionTitle(t.findingsTitle, "alert"), para(escapeHtml(t.findingsLede), 16));

    findings.forEach((f, i) => {
      const bandBg = C.redBg;
      const bandAccent = C.red;

      let inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;">
  <tr>
    <td width="44" valign="top" style="background:${bandAccent};padding:14px 0;font-family:${FONT};font-size:24px;font-weight:800;color:#ffffff;text-align:center;">${
        i + 1
      }</td>
    <td valign="middle" style="background:${bandBg};padding:14px 18px;font-family:${FONT};font-size:19px;font-weight:800;color:${C.ink};line-height:1.35;">${escapeHtml(
        f.title
      )}</td>
  </tr>
</table>
<div style="font-family:${FONT};font-size:17px;line-height:1.65;color:${C.body};padding:0 0 14px 0;">${escapeHtml(
        f.whats_happening
      )}</div>
${f.quotes.map((q) => quoteBlock(q, t)).join("")}`;

      if (f.callout?.text) {
        inner += panel(escapeHtml(f.callout.text), { bg: C.redBg, border: C.red });
      }

      blocks.push(row(inner, "0 0 26px 0"));
    });
  }

  /* competition */
  if (r.competitors?.length) {
    // Use Yelp numbers for the business's own benchmark row so the table is
    // consistent with the competitor data (all Yelp).
    const yelp = locs.reduce(
      (acc, l) => l.yelp ? { rating: acc.rating + l.yelp.rating * l.yelp.count, count: acc.count + l.yelp.count } : acc,
      { rating: 0, count: 0 }
    );
    const ownYelpRating = yelp.count > 0 ? yelp.rating / yelp.count : r.weighted_score;
    const ownYelpCount = yelp.count || null;

    const benchRows = [
      [
        `<b style="color:${C.ink};">${restaurant} <span style="background:${C.orange};color:#fff;font-size:12px;font-weight:800;padding:2px 7px;">${escapeHtml(
          t.youLabel
        )}</span></b>`,
        `<b style="font-size:18px;color:${C.ink};">${fmtRating(ownYelpRating)}</b>`,
        ownYelpCount ? fmtCount(ownYelpCount) : "—",
      ],
      ...r.competitors.map((c) => [
        escapeHtml(c.name),
        `<b>${fmtRating(c.rating)}</b>`,
        fmtCount(c.count),
      ]),
    ];
    blocks.push(
      sectionTitle(t.benchTitle, "chart"),
      row(dataTable([t.thCompetitor, t.thRating, t.thReviews], benchRows))
    );
  }

  /* money */
  if (r.money?.text) {
    blocks.push(
      sectionTitle(t.moneyTitle, "dollar"),
      row(
        panel(
          `${escapeHtml(r.money.text)}
<div style="font-size:14px;color:${C.faint};padding-top:12px;line-height:1.5;">${escapeHtml(
            t.moneyBasis
          )}${r.money.assumption ? ` ${escapeHtml(r.money.assumption)}` : ""}</div>`,
          { bg: C.panel, border: C.orange }
        ),
        "0 0 8px 0"
      )
    );
  }

  /* questions */
  if (r.questions?.length) {
    blocks.push(sectionTitle(t.questionsTitle, "chat"), row(bulletList(r.questions)));
  }

  /* CTA */
  blocks.push(row(`<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:2px solid ${C.border};">
  <tr><td align="center" style="padding:28px 0 26px 0;">
    <div style="font-family:${FONT};font-size:21px;font-weight:800;color:${C.ink};padding-bottom:10px;">${escapeHtml(
      t.ctaLead
    )}</div>
    <div style="font-family:${FONT};font-size:17px;line-height:1.55;color:${C.body};padding-bottom:22px;">${escapeHtml(
      t.ctaBody
    )}</div>
    <a href="${escapeHtml(
      schedulingUrl
    )}" style="display:inline-block;background:${C.orange};color:#ffffff;text-decoration:none;font-family:${FONT};font-weight:800;font-size:18px;padding:18px 38px;">${escapeHtml(
      t.ctaButton
    )}</a>
  </td></tr>
</table>`, "0"));

  /* signature with photo */
  blocks.push(row(`<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="96" valign="top" style="padding-right:18px;">
      <img src="${escapeHtml(
        photoUrl
      )}" width="88" height="88" alt="Mario Padilla — El Toaster" style="display:block;width:88px;height:88px;border-radius:44px;border:2px solid ${C.orange};" />
    </td>
    <td valign="middle" style="font-family:${FONT};font-size:16px;line-height:1.6;color:${C.body};">
      <div style="color:${C.faint};font-size:15px;">${escapeHtml(t.signOff)}</div>
      <div style="font-size:19px;font-weight:800;color:${C.ink};">Mario Padilla</div>
      <div style="font-size:14px;color:${C.faint};">${escapeHtml(t.role)}</div>
      <a href="tel:+14802417044" style="font-size:15px;color:${C.orangeDark};text-decoration:none;">480-241-7044</a>
      &nbsp;·&nbsp;
      <a href="mailto:mario@eltoaster.com" style="font-size:15px;color:${C.orangeDark};">mario@eltoaster.com</a>
    </td>
  </tr>
</table>`, "4px 0 0 0"));

  /* sources + disclosures */
  const disclosures = [...(r.disclosures || [])];
  if (r.has_allegations) disclosures.push(t.allegationNote);
  disclosures.push(t.disclaimer);

  blocks.push(`<tr><td style="padding:22px 0 0 0;border-top:1px solid ${C.border};font-family:${FONT};font-size:13px;line-height:1.6;color:${C.faint};">
  ${escapeHtml(t.sourcesLabel)} ${escapeHtml(r.sources.join(", "))}. ${escapeHtml(
    t.accessedLabel
  )} ${escapeHtml(r.accessed_on)}.<br />${disclosures.map(escapeHtml).join("<br />")}
</td></tr>`);

  const unsubHtml = unsubscribeUrl
    ? ` <a href="${escapeHtml(unsubscribeUrl)}" style="color:${C.faint};text-decoration:underline;">${escapeHtml(
        t.unsubscribe
      )}</a>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${lang}"><head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>${escapeHtml(t.heading)} — ${restaurant}</title>
<style>
  /* Progressive enhancement only. The layout already works from the inline
     styles alone, because the shell is width:100% with a max-width rather than
     a fixed 640px — a fixed width overflowed the screen on a phone and cut off
     the right edge of the header and tables. This block just buys back some
     horizontal room on small screens; clients that strip <style> (some Gmail
     contexts) still get a correct, readable email. */
  @media only screen and (max-width: 480px) {
    .pad { padding-left: 18px !important; padding-right: 18px !important; }
    .stack { display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;font-size:1px;color:${C.page};max-height:0;overflow:hidden;">${escapeHtml(
    t.scoreLabel
  )}: ${fmtRating(r.weighted_score)} ${escapeHtml(t.outOf)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.page};">
<tr><td align="center" style="padding:24px 10px;">
  <table role="presentation" class="shell" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:640px;background:${C.white};border:1px solid ${C.border};">
    <tr><td class="pad" style="background:${C.orange};padding:26px 32px;">
      <div style="font-family:${FONT};color:#ffffff;font-size:13px;letter-spacing:.12em;font-weight:800;">${escapeHtml(
        t.kicker
      )}</div>
      <div style="font-family:${FONT};color:#ffffff;font-size:27px;font-weight:800;padding-top:6px;line-height:1.2;">${escapeHtml(
        t.heading
      )}</div>
    </td></tr>
    <tr><td class="pad" style="padding:30px 32px 28px 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        ${blocks.join("\n")}
      </table>
    </td></tr>
    <tr><td class="pad" style="background:${C.panelAlt};padding:18px 32px;font-family:${FONT};font-size:13px;line-height:1.55;color:${C.faint};">
      ${escapeHtml(t.footer)}${unsubHtml}
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  const bytes = new TextEncoder().encode(html).length;
  if (bytes > MAX_HTML_BYTES) {
    throw new Error(
      `Rendered email is ${(bytes / 1024).toFixed(1)}KB, over the ${(
        MAX_HTML_BYTES / 1024
      ).toFixed(0)}KB limit — Gmail would clip it mid-report. Trim findings or shorten quotes.`
    );
  }

  const subject = multi
    ? t.subjectMany(lead.restaurant_name, locs.length)
    : t.subjectOne(lead.restaurant_name);

  return { subject, html, bytes };
}

export default renderDiagnosticEmail;
