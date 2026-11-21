/* Google Analytics 4 for eltoaster.com — built, switched off until a key is set.
 *
 * To turn it on, put the Measurement ID (G-XXXXXXXXXX, public by design) in
 * .env.production as VITE_GA_MEASUREMENT_ID and deploy. Until then every
 * function here does nothing and no Google script is ever loaded.
 *
 * Tracking plan (pages, events, parameters): docs/analytics.md.
 *
 * Privacy, matching the privacy notice: no ad storage, no Google Signals, no
 * ad personalisation; nothing that identifies a person is ever sent (no names,
 * emails, phones, restaurant names); browsers that send Global Privacy
 * Control or Do Not Track are not tracked; previews and localhost are not
 * tracked; the owner's own browser and /admin are never tracked. */

const ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim();
const VALID_ID = /^G-[A-Z0-9]{6,}$/i.test(ID);
const LIVE_HOSTS = ["eltoaster.com", "www.eltoaster.com"];
const OPT_OUT = "ga-optout"; // set on the owner's browser
const DEBUG = "ga-debug"; // lets a preview send hits, for GA's DebugView

/** True when a key is configured, so the privacy notice can mention analytics. */
export const analyticsEnabled = VALID_ID;

const read = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k, v) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* storage blocked: the setting just doesn't stick */
  }
};

// ?notrack=1 excludes this browser for good (?notrack=0 undoes it);
// ?ga_debug=1 lets a preview send hits (?ga_debug=0 stops).
try {
  const q = new URLSearchParams(window.location.search);
  if (q.has("notrack")) write(OPT_OUT, q.get("notrack") === "0" ? null : "1");
  if (q.has("ga_debug")) write(DEBUG, q.get("ga_debug") === "0" ? null : "1");
} catch {
  /* no window (tests) */
}

/** Called from the admin panel: the owner's visits should never count. */
export const excludeThisBrowser = () => write(OPT_OUT, "1");

/* ---------- the site map ---------- */

/* One entry per page people can land on. `group` becomes GA's content_group,
 * so reports can be split into Landing / Blog / Tools / About / Legal. */
const PAGES = {
  home: { path: "/", title: "Inicio", group: "Landing" },
  blog: { path: "/blog", title: "Blog", group: "Blog" },
  blog_post: { path: "/blog/post", title: "Artículo del blog", group: "Blog" },
  rankings: { path: "/rankings", title: "Rankings", group: "Tools" },
  calculator: { path: "/calculator", title: "Calculadora", group: "Tools" },
  about: { path: "/about_me", title: "Sobre mí", group: "About" },
  privacy: { path: "/privacy", title: "Aviso de privacidad", group: "Legal" },
};

/* Sections of the landing page, reported once each when they scroll into view. */
const SECTIONS = ["problema", "dolores", "como", "diagnostico", "empezar", "clientes", "video", "blog", "newsletter"];

/** Which page the address bar is on. Null means "never track this one":
 *  /admin, and the unsubscribe and newsletter-preview links, whose hashes
 *  carry personal tokens. */
function pageOf(loc = window.location) {
  const path = loc.pathname.replace(/\/+$/, "");
  const hash = loc.hash;
  if (path === "/admin") return null;
  if (path === "/about_me") return { id: "about", ...PAGES.about };
  if (path === "/calculator") return { id: "calculator", ...PAGES.calculator };
  if (path === "/rankings" || path === "/ranking") return { id: "rankings", ...PAGES.rankings };
  if (hash.startsWith("#unsubscribe") || hash.startsWith("#send/")) return null;
  if (hash === "#privacy") return { id: "privacy", ...PAGES.privacy };
  if (hash === "#blog" || hash.startsWith("#blog/page/")) return { id: "blog", ...PAGES.blog };
  if (hash.startsWith("#blog/")) return { id: "blog_post", ...PAGES.blog_post };
  return { id: "home", ...PAGES.home };
}

/* ---------- loading ---------- */

const blocked = () =>
  !VALID_ID ||
  read(OPT_OUT) === "1" ||
  navigator.globalPrivacyControl === true ||
  navigator.doNotTrack === "1" ||
  (!LIVE_HOSTS.includes(window.location.hostname) && read(DEBUG) !== "1");

let loaded = false;

function load() {
  if (loaded) return true;
  if (blocked()) return false;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
  };
  // Ad storage stays off; only measurement is on.
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  window.gtag("config", ID, {
    send_page_view: false, // page views are sent by hand below, once per real page
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    ...(read(DEBUG) === "1" ? { debug_mode: true } : {}),
  });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ID)}`;
  document.head.appendChild(s);
  return true;
}

/* ---------- sending ---------- */

const clip = (v, n = 100) => (typeof v === "string" ? v.slice(0, n) : v);

/** Send one event. Safe to call anywhere: does nothing when tracking is off. */
export function track(name, params = {}) {
  if (!pageOf() || !load()) return; // pageOf() is null on /admin and on token links
  const clean = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") clean[k] = clip(v);
  }
  window.gtag("event", name, clean);
}

/** Describe the visitor without identifying them (GA user property). */
export function setLanguage(lang) {
  if (!pageOf() || !load()) return;
  window.gtag("set", "user_properties", { site_language: lang });
}

let lastPath = null;
let seenSections = new Set();
let observer = null;

/** Report the page now showing. Anchors inside the landing page and repeat
 *  calls for the same page are ignored, so each real page counts once. */
export function trackPage(lang) {
  const page = pageOf();
  if (!page) {
    lastPath = null;
    return;
  }
  const loc = window.location;
  // Campaign tags must survive, or GA cannot tell where visitors came from.
  const keep = new URLSearchParams();
  new URLSearchParams(loc.search).forEach((v, k) => {
    if (/^utm_/.test(k) || k === "gclid") keep.set(k, v);
  });
  const qs = keep.toString();
  const pagePath = page.id === "blog_post" ? `/blog/${loc.hash.slice(6)}` : page.path;
  if (pagePath === lastPath) return;
  lastPath = pagePath;

  track("page_view", {
    page_location: `${loc.origin}${pagePath}${qs ? `?${qs}` : ""}`,
    page_path: pagePath,
    page_title: `${page.title} · El Toaster`,
    content_group: page.group,
    page_name: page.id,
    site_language: lang,
  });
  watchSections(page.id);
}

/** Report each landing-page section the first time it is half on screen. */
function watchSections(pageId) {
  observer?.disconnect();
  observer = null;
  seenSections = new Set();
  if (pageId !== "home" || !("IntersectionObserver" in window) || !load()) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || seenSections.has(e.target.id)) continue;
        seenSections.add(e.target.id);
        track("section_view", { section: e.target.id });
        observer.unobserve(e.target);
      }
    },
    { threshold: 0.4 }
  );
  // The page may still be drawing, so look a moment later.
  setTimeout(() => {
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer?.observe(el);
    }
  }, 600);
}

/* ---------- clicks ---------- */

/** Where on the page a link sits: the nearest named block, else its class, else its tag. */
function where(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (n.id && n.id !== "root") return n.id;
    if (/^(SECTION|HEADER|FOOTER|NAV)$/.test(n.tagName)) return String(n.className || "").split(/\s+/)[0] || n.tagName.toLowerCase();
  }
  return "page";
}

/** One listener for every link on the site, so components need no tracking code.
 *  What a link is decided by where it points. */
function onClick(e) {
  const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
  if (!a || a.hasAttribute("data-no-track")) return;
  const href = a.getAttribute("href") || "";
  const text = (a.getAttribute("aria-label") || a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
  const base = { link_text: text, section: where(a) };

  if (/^mailto:/i.test(href)) return track("contact_click", { method: "email", ...base });
  if (/^tel:/i.test(href)) return track("contact_click", { method: "phone", ...base });
  if (/\.pdf($|\?)/i.test(href)) {
    const file = href.split("?")[0].split("/").pop();
    return track("file_download", { file_name: file, file_extension: "pdf", link_url: href, ...base });
  }

  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return;
  }
  if (url.host !== window.location.host) {
    if (/(^|\.)cal\.com$/.test(url.hostname)) return track("book_call", { link_url: url.origin + url.pathname, ...base });
    if (/(^|\.)wa\.me$/.test(url.hostname) || /whatsapp/.test(url.hostname)) return track("contact_click", { method: "whatsapp", ...base });
    return track("click", { link_domain: url.hostname, link_url: url.origin + url.pathname, outbound: true, ...base });
  }
  // Calls to action inside the site: the form, the calculator, rankings, newsletter.
  if (href === "#empezar" || url.pathname.startsWith("/calculator") || /^\/rankings?$/.test(url.pathname) || href === "#newsletter") {
    return track("cta_click", { cta: href.startsWith("#") ? href.slice(1) : url.pathname, ...base });
  }
}

let started = false;

/** Start listening. Call once; nothing is sent until the first page_view. */
export function startAnalytics() {
  if (started || !VALID_ID) return;
  started = true;
  document.addEventListener("click", onClick, true);
}
