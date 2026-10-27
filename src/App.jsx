import { useState, useEffect, useRef, useCallback } from "react";
import { content } from "./content.js";
import { supabase } from "./supabase.js";
import lasCulichisLogo from "./assets/clients/las-culichis.jpg";
import padelPalsLogo from "./assets/clients/padel-pals.jpg";
import sushinoLogo from "./assets/clients/sushino.jpg";
import elChakaLogo from "./assets/clients/el-chaka.jpg";
import las15SalsasLogo from "./assets/clients/las-15-salsas.png";
import marioAvatar from "./assets/mario-avatar.webp";
import marioFace from "./assets/mario-avatar-face.webp";
import posTerminal from "./assets/pos-terminal.webp";

const CLIENT_LOGOS = {
  "las-culichis": lasCulichisLogo,
  "padel-pals": padelPalsLogo,
  sushino: sushinoLogo,
  "el-chaka": elChakaLogo,
  "las-15-salsas": las15SalsasLogo,
};

const EMAIL = "mario@eltoaster.com";
const LINKEDIN = "https://www.linkedin.com/in/mario-padilla-57145839/";
const CAL_URL = "https://cal.com/mario-padilla-tirado-hnho7v/15-minutos-chat-free-restaurant-diagnostic";
const POS_LEARN_MORE_URL =
  "https://pos.toasttab.com/lp/get-started?utm_medium=paid&utm_source=sembb&utm_campaign=tpos-b2bsmb-paid-1139094559993298-exabrandxx-acq-sembb-cousa&utm_term=point%20of%20sale%20toast&_bt=&_bm=e&_bn=o&device=c&utm_campaign_id=352125627&utm_adgroup_id=1139094559993298&msclkid=7b495c0779221c10f9df36b04aa2d98f&utm_content=Toast%20POS";

// The calculator used to be a section of the landing page; old links in sent
// emails and newsletters still point at #calculadora.
if (window.location.hash === "#calculadora") window.location.replace("/calculator");

/* ---------------- helpers ---------------- */

const usd = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const usdCompact = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

/** Fades a section in the first time it scrolls into view. */
function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  style,
  ...rest
}) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  return (
    <Tag
      ref={ref}
      className={`reveal${seen ? " in" : ""}${className ? " " + className : ""}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function CalculatorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="11" x2="8" y2="11" />
      <line x1="12" y1="11" x2="12" y2="11" />
      <line x1="16" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="8" y2="15" />
      <line x1="12" y1="15" x2="12" y2="15" />
      <line x1="16" y1="15" x2="16" y2="18" />
      <line x1="8" y1="18" x2="12" y2="18" />
    </svg>
  );
}

function Stars({ value }) {
  return (
    <div className="stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color: value >= i - 0.25 ? "var(--orange)" : "var(--line)",
            fontSize: "1rem",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/* ---------------- sections ---------------- */

/** The signup lives in the footer. Where a footer is on the page, go to it and
 *  put the cursor in the field; elsewhere the link's own #newsletter takes the
 *  visitor to the landing page, which scrolls to it. */
function goToNewsletter(e) {
  const box = document.getElementById("newsletter");
  if (!box) return;
  e.preventDefault();
  box.scrollIntoView({ behavior: "smooth", block: "center" });
  box.querySelector("input")?.focus({ preventScroll: true });
}

/** The one fixed button on phones, in the thumb zone: the diagnostic. Nothing
 *  else is pinned there, so it stays the main thing to tap. */
function MobileBar({ t }) {
  return (
    <a className="btn mobile-cta" href="#empezar">
      {t.nav.cta}
    </a>
  );
}

function Nav({ lang, setLang, t }) {
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Close the mobile menu on nav (hash changes) or on resize back to desktop.
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("hashchange", close);
    const mq = window.matchMedia("(min-width: 900px)");
    mq.addEventListener("change", close);
    return () => {
      window.removeEventListener("hashchange", close);
      mq.removeEventListener("change", close);
    };
  }, [menuOpen]);

  const links = [
    { href: "#dolores", label: t.nav.how },
    { href: "#blog", label: t.nav.blog },
    { href: "/calculator", label: t.nav.calc },
  ];

  return (
    <header className="nav" data-stuck={stuck}>
      <div className="wrap nav-in">
        <a className="logo" href="#top">
          <img className="mark" src={marioFace} alt="" />
          <span className="logo-text">
            El&nbsp;Toaster
            <small>{t.brand.by}</small>
          </span>
        </a>

        <nav className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="lang" role="group" aria-label="Language / Idioma">
          <button
            type="button"
            aria-pressed={lang === "es"}
            onClick={() => setLang("es")}
          >
            ES
          </button>
          <button
            type="button"
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>

        <a className="btn gray" href="#newsletter" onClick={goToNewsletter}>
          {t.nav.news}
        </a>
        <a className="btn" href="#empezar">
          {t.nav.cta}
        </a>

        <button
          type="button"
          className="nav-burger"
          aria-label={t.nav.menu}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <nav className="nav-mobile" aria-label={t.nav.menu}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <a
            href="#newsletter"
            onClick={(e) => {
              setMenuOpen(false);
              goToNewsletter(e);
            }}
          >
            {t.nav.news}
          </a>
        </nav>
      )}
    </header>
  );
}

/* Hero dashboard: a sample restaurant's rating climbing, reviews arriving,
   revenue rising. The figures match the calculator (3.8 → 4.5 stars on $1M
   in sales is about $49,000 a year), so the two pages tell the same story. */
const HD_CYCLE = 10000;
const HD_POINTS = [74, 70, 76, 64, 69, 57, 61, 48, 52, 38, 31, 14];
const HD_W = 300;
const HD_H = 110;

const hdEase = (p) => 1 - Math.pow(1 - p, 3);
const hdSpan = (e, start, dur) => hdEase(Math.min(1, Math.max(0, (e - start) / dur)));

/** Drives a looping card animation: `e` is milliseconds into the current
    cycle (counted up for `runMs`), `cycle` keys the remount. */
function useCardLoop(cycleMs, runMs) {
  const [still] = useState(prefersReducedMotion);
  const [cycle, setCycle] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [e, setE] = useState(still ? Infinity : 0);
  const ref = useRef(null);

  // Loop, but only while someone can see it: off screen or in a background
  // tab it holds on the finished picture instead of fading out unseen, and
  // it starts over each time it scrolls into view.
  useEffect(() => {
    if (still) return;
    let visible = true;
    let timer;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !visible) {
        clearTimeout(timer);
        setLeaving(false);
        setCycle((c) => c + 1);
        timer = setTimeout(next, cycleMs);
      }
      visible = en.isIntersecting;
    });
    io.observe(ref.current);
    const next = () => {
      if (!visible || document.hidden) {
        timer = setTimeout(next, 1000);
        return;
      }
      setLeaving(true);
      timer = setTimeout(() => {
        setLeaving(false);
        setCycle((c) => c + 1);
        timer = setTimeout(next, cycleMs);
      }, 600);
    };
    timer = setTimeout(next, cycleMs);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [still, cycleMs]);

  useEffect(() => {
    if (still) return;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const el = now - t0;
      setE(el);
      if (el < runMs) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cycle, still, runMs]);

  return { still, cycle, leaving, e, ref };
}

function useMediaQuery(query) {
  const [match, setMatch] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

function HeroDashboard({ t }) {
  const d = t.hero.dash;
  const { still, cycle, leaving, e, ref } = useCardLoop(HD_CYCLE, 5200);

  const rating = 3.8 + 0.7 * hdSpan(e, 200, 2400);
  const line = hdSpan(e, 400, 2800);
  const reviews = Math.round(128 * hdSpan(e, 2400, 1600));
  const visits = Math.round(34 * hdSpan(e, 2600, 1600));
  const revenue = 49000 * hdSpan(e, 2800, 1800);
  const done = e >= 4600;

  const step = HD_W / (HD_POINTS.length - 1);
  const pts = HD_POINTS.map((y, i) => [i * step, y]);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  // Where the line is being drawn right now, for the glowing head.
  const at = line * (pts.length - 1);
  const i0 = Math.min(pts.length - 2, Math.floor(at));
  const f = at - i0;
  const head = [
    pts[i0][0] + (pts[i0 + 1][0] - pts[i0][0]) * f,
    pts[i0][1] + (pts[i0 + 1][1] - pts[i0][1]) * f,
  ];

  return (
    <div
      className={`hero-media hero-dash${leaving ? " leaving" : ""}${still ? " still" : ""}`}
      ref={ref}
      aria-hidden="true"
    >
      <div className="hd-body" key={cycle}>
        <div className="hd-top">
          <span className="hd-place">
            <span className="hd-dot" />
            {d.place}
          </span>
          <span className="hd-sample">{d.sample}</span>
        </div>

        <div className="hd-rating-row">
          <div className="hd-rating">
            <span className="hd-label">{d.rating}</span>
            <b className="hd-score">{rating.toFixed(1)}</b>
            <span className="hd-stars">
              ★★★★★
              <span style={{ width: `${(rating / 5) * 100}%` }}>★★★★★</span>
            </span>
          </div>
          <div className="hd-feed">
            {d.toasts.map((r, i) => (
              <div
                key={i}
                className={`hd-toast${i === d.toasts.length - 1 ? " last" : ""}`}
                style={{ animationDelay: `${600 + i * 2600}ms` }}
              >
                <span className="hd-toast-head">
                  <span className="hd-toast-stars">★★★★★</span>
                  <span className="hd-src">{r.src}</span>
                </span>
                <span className="hd-toast-text">“{r.text}”</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hd-chart">
          <span className="hd-label">{d.chart}</span>
          <span className={`hd-badge${line >= 1 ? " on" : ""}`}>+{usdCompact(49000)}</span>
          <div className="hd-plot">
            <svg viewBox={`0 0 ${HD_W} ${HD_H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="hdFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ff4c00" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#ff4c00" stopOpacity="0" />
                </linearGradient>
                <clipPath id="hdClip">
                  {/* Padded so the line's rounded ends and glow aren't cut off. */}
                  <rect x="-8" y="-12" width={HD_W * line + 8} height={HD_H + 24} />
                </clipPath>
              </defs>
              {[28, 55, 82].map((y) => (
                <line key={y} className="hd-grid" x1="0" x2={HD_W} y1={y} y2={y} />
              ))}
              <path
                d={`${path} L${HD_W} ${HD_H} L0 ${HD_H} Z`}
                fill="url(#hdFill)"
                clipPath="url(#hdClip)"
              />
              <path className="hd-line" d={path} clipPath="url(#hdClip)" />
            </svg>
            {/* Kept outside the stretched SVG so the dot stays round. */}
            <span
              className={`hd-head${line >= 1 ? " peak" : ""}`}
              style={{ left: `${(head[0] / HD_W) * 100}%`, top: `${(head[1] / HD_H) * 100}%` }}
            />
          </div>
        </div>

        <div className="hd-metrics">
          <div className="hd-metric">
            <b>+{reviews}</b>
            <span>{d.newReviews}</span>
          </div>
          <div className="hd-metric">
            <b>+{visits}%</b>
            <span>{d.visits}</span>
          </div>
          <div className={`hd-metric hot${done ? " landed" : ""}`}>
            <b>+{usd(revenue)}</b>
            <span>{d.revenue}</span>
            {done && (
              <span className="hd-pips">
                {["$", "★", "$", "★", "$", "★"].map((c, i) => (
                  <i key={i}>{c}</i>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({ t }) {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="wrap hero-grid">
        <HeroDashboard t={t} />
        <Reveal className="hero-copy">
          {/* Visitors arrive from Desde Zero's socials: say where they landed. */}
          <p className="hero-brand">
            <span aria-hidden="true" />
            {t.brand.pill}
          </p>
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>
            {t.hero.h1a} <span className="hand">{t.hero.h1b}</span>
          </h1>
          <p className="lede">{t.hero.lede}</p>

          <div className="hero-cta">
            <a className="btn dark" href="/calculator">
              <CalculatorIcon />
              {t.hero.cta2}
            </a>
            {/* Phones only: the nav has no room for it there. */}
            <a className="btn gray hero-news" href="#newsletter" onClick={goToNewsletter}>
              {t.nav.news}
            </a>
          </div>

          <div className="trust">
            <span>
              <b>✓</b> {t.hero.t1}
            </span>
            <span>
              <b>✓</b> {t.hero.t2}
            </span>
            <span>
              <b>✓</b> {t.hero.t3}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stats({ t }) {
  return (
    <div className="stats">
      {t.stats.map((s, i) => (
        <Reveal key={i} className="stat" delay={i * 70}>
          <div className="n">{s.n}</div>
          <div className="l">{s.l}</div>
        </Reveal>
      ))}
    </div>
  );
}

/* What the problem costs, as a chart: twelve months of sales, each with the
   slice that walked out on top, and the rating sliding under the category
   average. 4.3 → 3.8 on $1M in sales is about $35,000 a year by the same
   formula as the calculator. Light card, unlike the dark hero dashboard. */
const PC_CYCLE = 10000;
const PC_BARS = [58, 54, 62, 66, 70, 76, 73, 68, 63, 66, 72, 80];
const pcPos = (r) => `${((r - 3) / 2) * 100}%`;

function ProblemChart({ t }) {
  const d = t.problem.leak;
  const { still, cycle, leaving, e, ref } = useCardLoop(PC_CYCLE, 4800);

  // Linear, so the total adds up month by month as the bars land.
  const lost = 35000 * Math.min(1, Math.max(0, (e - 300) / 3340));
  const rating = 4.3 - 0.5 * hdSpan(e, 600, 2600);
  const done = e >= 3700;

  return (
    <div className={`pc${leaving ? " leaving" : ""}${still ? " still" : ""}`} ref={ref} aria-hidden="true">
      <div className="pc-body" key={cycle}>
        <div className="pc-top">
          <span className="pc-place">
            <span className="pc-dot" />
            {d.place}
          </span>
          <span className="pc-chip">{d.sample}</span>
        </div>

        <div className={`pc-big${done ? " landed" : ""}`}>−{usd(lost)}</div>
        <p className="pc-sub">{d.lost}</p>

        <div className="pc-chart">
          {PC_BARS.map((h, i) => {
            const g = hdSpan(e, 300 + i * 240, 700);
            return (
              <div className="pc-col" key={i}>
                <span className="pc-sold" style={{ height: `${h * g}%` }} />
                <span className="pc-gone" style={{ bottom: `${h * g}%`, height: `${16 * g}%` }} />
                <span className="pc-m">{d.months[i]}</span>
              </div>
            );
          })}
        </div>
        <div className="pc-legend">
          <span>
            <i className="sold" />
            {d.sold}
          </span>
          <span>
            <i className="gone" />
            {d.gone}
          </span>
        </div>

        <div className="pc-gauge">
          <div className="pc-gauge-head">
            <span>{d.rating}</span>
            <b>
              {rating.toFixed(1)} <em>★</em>
            </b>
          </div>
          <div className="pc-track">
            <span className="pc-gap" style={{ left: pcPos(rating), width: `${((4.3 - rating) / 2) * 100}%` }} />
            <span className="pc-you" style={{ left: pcPos(rating) }} />
            <span className="pc-avg" style={{ left: pcPos(4.3) }}>
              <small>
                {d.avg} 4.3
              </small>
            </span>
          </div>
          <div className="pc-scale">
            <span>3.0</span>
            <span>4.0</span>
            <span>5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Problem({ t }) {
  // Desktop only: on phones the section stays text, as before.
  const wide = useMediaQuery("(min-width: 1000px)");
  return (
    <section id="problema">
      <div className="wrap">
        <div className="problem-top">
          <Reveal className="sec-head">
            <p className="eyebrow">{t.problem.eyebrow}</p>
            <h2>{t.problem.h2}</h2>
            <p className="lede">{t.problem.lede}</p>
          </Reveal>
          {wide && (
            <Reveal className="problem-visual" delay={120}>
              <ProblemChart t={t} />
            </Reveal>
          )}
        </div>

        <div className="problems">
          {t.problem.items.map((it, i) => (
            <Reveal key={i} className="problem" delay={i * 80}>
              <div className="num">0{i + 1}</div>
              <div>
                <h3>{it.h}</h3>
                <p>{it.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- calculator page (/calculator) ---------------- */

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Confetti and coins exploding out of (x, y), drawn on a throwaway canvas. */
function burst(x, y) {
  if (prefersReducedMotion()) return;
  const canvas = document.createElement("canvas");
  canvas.className = "burst-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const colors = ["#ff4c00", "#ff6a2e", "#ffb800", "#ffd76a", "#d63e00", "#0d0d0d"];
  const parts = Array.from({ length: 110 }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 5 + Math.random() * 11;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.45,
      w: 5 + Math.random() * 6,
      h: 9 + Math.random() * 9,
      color: colors[i % colors.length],
      coin: i % 7 === 0,
    };
  });

  const life = 1900;
  const start = performance.now();
  const frame = (now) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = Math.max(0, 1 - elapsed / life);
    for (const p of parts) {
      p.vy += 0.32;
      p.vx *= 0.986;
      p.vy *= 0.986;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.coin) {
        ctx.fillStyle = "#ffb800";
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#9a5a00";
        ctx.font = "800 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 1);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (elapsed < life) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}

const CALC_RATINGS = Array.from({ length: 25 }, (_, i) => +(2.5 + i * 0.1).toFixed(1)); // 2.5–4.9
const CALC_REVENUES = [250000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000];
const CALC_UNLOCK_KEY = "calcUnlocked";

/** Name, email and cell phone before the calculator opens. Remembered in this
 *  browser so a returning visitor goes straight in. */
function CalculatorGate({ t, lang, onUnlock }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [state, setState] = useState("idle"); // idle | sending | error
  const [phoneError, setPhoneError] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (state === "sending") return;
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    if (!supabase) {
      setState("error");
      return;
    }
    setState("sending");
    const name = form.name.trim();
    const { error } = await supabase.from("calculator_leads").insert([
      { name, email: form.email.trim(), phone: form.phone.trim(), preferred_language: lang },
    ]);
    if (error) {
      setState("error");
      return;
    }
    const first = name.split(/\s+/)[0];
    try {
      localStorage.setItem(CALC_UNLOCK_KEY, first);
    } catch {
      /* storage unavailable — they still get in for this visit */
    }
    onUnlock(first);
  }

  return (
    <Reveal className="form-card calc-gate">
      <h2 className="calc-gate-title">{t.calcPage.gateTitle}</h2>
      <p className="calc-gate-lede">{t.calcPage.gateLede}</p>
      <form onSubmit={submit}>
        {state === "error" && (
          <div className="alert err" role="alert">
            {t.calcPage.gateError}
          </div>
        )}
        <div className="inp">
          <label htmlFor="cg-name">{t.calcPage.name}</label>
          <input id="cg-name" required autoComplete="name" value={form.name} onChange={set("name")} />
        </div>
        <div className="inp">
          <label htmlFor="cg-email">{t.calcPage.email}</label>
          <input
            id="cg-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
          />
        </div>
        <div className="inp">
          <label htmlFor="cg-phone">{t.calcPage.phone}</label>
          <input
            id="cg-phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder={t.calcPage.phonePlaceholder}
            aria-invalid={phoneError || undefined}
            aria-describedby={phoneError ? "cg-phone-err" : undefined}
            value={form.phone}
            onChange={set("phone")}
          />
          {phoneError && (
            <p id="cg-phone-err" className="inp-note warn">
              {t.calcPage.phoneError}
            </p>
          )}
        </div>
        <button className="btn" type="submit" disabled={state === "sending"}>
          {state === "sending" ? t.calcPage.unlocking : t.calcPage.unlock}
        </button>
        <p className="formnote">
          {t.calcPage.gateNote} <a href="/#privacy">{t.calcPage.privacy}</a>
        </p>
      </form>
    </Reveal>
  );
}

function CalculatorTool({ t, name }) {
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [revenue, setRevenue] = useState("");
  // Totals stay hidden until the button is pressed; editing any input hides
  // them again, so a number on screen always matches the inputs above it.
  const [result, setResult] = useState(null);
  const [shown, setShown] = useState(0);
  const [pop, setPop] = useState(0);
  const resultRef = useRef(null);
  const bigRef = useRef(null);

  const targets = CALC_RATINGS.concat(5).filter((r) => current === "" || r > +current);
  const ready = current !== "" && target !== "" && revenue !== "";

  const change = (setter) => (e) => {
    setter(e.target.value);
    setResult(null);
  };

  function calculate(e) {
    e.preventDefault();
    if (!ready) return;
    // The target list only offers ratings above the current one, so delta > 0.
    const delta = +target - +current;
    setResult({
      lo: +revenue * delta * 0.05,
      mid: +revenue * delta * 0.07,
      hi: +revenue * delta * 0.09,
    });
  }

  const explode = () => {
    const r = bigRef.current?.getBoundingClientRect();
    if (!r) return;
    burst(r.left + r.width / 2, r.top + r.height / 2);
    setPop((n) => n + 1);
  };

  // Count up from zero, then let it explode.
  useEffect(() => {
    setShown(0);
    setPop(0);
    if (!result) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (prefersReducedMotion()) {
      setShown(result.mid);
      return;
    }
    let raf;
    const duration = 1400;
    const delay = 350;
    const start = performance.now() + delay;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      setShown(result.mid * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else explode();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result]);

  return (
    <div className="calc">
      <Reveal className="calc-panel">
        <form onSubmit={calculate}>
          <p className="calc-hello">{t.calcPage.fill}</p>

          <div className="field">
            <label htmlFor="cur">
              {t.calc.rating}
              {current !== "" && <Stars value={+current} />}
            </label>
            <div className="inp">
              <select id="cur" required value={current} onChange={(e) => {
                const v = e.target.value;
                setCurrent(v);
                if (target !== "" && +target <= +v) setTarget("");
                setResult(null);
              }}>
                <option value="" disabled>{t.calcPage.ratingHint}</option>
                {CALC_RATINGS.map((r) => (
                  <option key={r} value={r}>{r.toFixed(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="rev">{t.calc.revenue}</label>
            <div className="inp">
              <select id="rev" required value={revenue} onChange={change(setRevenue)}>
                <option value="" disabled>{t.calcPage.revenueHint}</option>
                {CALC_REVENUES.map((v) => (
                  <option key={v} value={v}>{usdCompact(v)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="tgt">
              {t.calc.target}
              {target !== "" && <Stars value={+target} />}
            </label>
            <div className="inp">
              <select id="tgt" required value={target} onChange={change(setTarget)}>
                <option value="" disabled>{t.calcPage.ratingHint}</option>
                {targets.map((r) => (
                  <option key={r} value={r}>{r.toFixed(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn btn-lg calc-go" type="submit" disabled={!ready}>
            {t.calcPage.calculate}
          </button>
        </form>
      </Reveal>

      <div className={`result${result ? " revealed" : ""}`} ref={resultRef}>
        <p className="eyebrow">{t.calcPage.resultLabel}</p>

        {!result && (
          <div className="big calc-locked" aria-hidden="true">
            $ ? ? ?
          </div>
        )}

        {result && (
          <>
            <button
              type="button"
              ref={bigRef}
              key={pop}
              className={`big calc-number${pop ? " pop" : ""}`}
              onClick={explode}
              aria-label={usd(result.mid)}
            >
              {usd(shown)}
            </button>
            <p className="calc-tap">{t.calcPage.tapAgain}</p>
            <p
              className="range"
              dangerouslySetInnerHTML={{ __html: t.calcPage.lostLine(usd(result.lo), usd(result.hi)) }}
            />
            <div className="calc-cta">
              <a className="btn" href="/#empezar">
                {t.calcPage.cta}
              </a>
              <p>{t.calcPage.ctaLede}</p>
            </div>
          </>
        )}


        <p className="note">{t.calc.note}</p>
      </div>
    </div>
  );
}

function CalculatorPage({ t, lang }) {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(CALC_UNLOCK_KEY) || "";
    } catch {
      return "";
    }
  });

  // This page lives at /calculator, but every in-page link on the site is a
  // bare #anchor meant for the landing page. A <base> makes them resolve to
  // "/#anchor" here, so the shared nav and footer keep working unchanged.
  useEffect(() => {
    const base = document.createElement("base");
    base.href = "/";
    document.head.prepend(base);
    return () => base.remove();
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = `${t.calcPage.eyebrow} · ${t.brand.full}`;
    return () => {
      document.title = prev;
    };
  }, [t]);

  const head = (
    <Reveal className="sec-head">
      <p className="eyebrow">{t.calcPage.eyebrow}</p>
      <h1 className="calc-h1">{t.calcPage.h1}</h1>
      <p className="lede">{t.calcPage.lede}</p>
    </Reveal>
  );

  return (
    <section className="calc-page">
      {name ? (
        <div className="wrap">
          {head}
          <CalculatorTool t={t} name={name} />
        </div>
      ) : (
        <div className="wrap form-grid calc-locked-grid">
          {head}
          <CalculatorGate t={t} lang={lang} onUnlock={setName} />
        </div>
      )}
    </section>
  );
}

function Diagnostic({ t }) {
  return (
    <section id="diagnostico">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">{t.diag.eyebrow}</p>
          <h2>{t.diag.h2}</h2>
          <p className="lede">{t.diag.lede}</p>
        </Reveal>

        <div className="bento">
          {t.diag.cards.map((c, i) => (
            <Reveal
              key={i}
              className={`card${i === 0 || i === t.diag.cards.length - 1 ? " wide" : ""}`}
              delay={i * 60}
            >
              <div className="ic" aria-hidden="true">
                {c.i}
              </div>
              <h3>{c.h}</h3>
              <p>{c.p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps({ t }) {
  return (
    <section id="como">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">{t.steps.eyebrow}</p>
          <h2>{t.steps.h2}</h2>
        </Reveal>

        <div className="steps">
          {t.steps.items.map((s, i) => (
            <Reveal key={i} className="step" delay={i * 90}>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Mario explaining the offer himself. Never autoplays: it has sound, so the
 *  visitor starts it. preload="none" keeps its 9MB off the page until then. */
function VideoIntro({ t }) {
  return (
    <section className="video-sec" id="video">
      <div className="wrap video-grid">
        <Reveal className="sec-head video-copy">
          <p className="eyebrow">{t.video.eyebrow}</p>
          <h2>{t.video.h2}</h2>
          <p className="lede">{t.video.lede}</p>
          <a className="btn" href="#empezar">
            {t.video.cta}
          </a>
          {t.video.note && <p className="video-note">{t.video.note}</p>}
        </Reveal>

        <Reveal className="video-frame" delay={90}>
          <video
            controls
            playsInline
            preload="none"
            poster="/video/diagnostico-poster.jpg"
            aria-label={t.video.label}
          >
            <source src="/video/diagnostico.mp4" type="video/mp4" />
          </video>
        </Reveal>
      </div>
    </section>
  );
}

/** Silent kitchen loop behind the mid-page band. Decoration only, so it waits
 *  until the band is near the viewport and is skipped for reduced motion. */
function AmbientVideo() {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="midcta-bg" ref={ref} aria-hidden="true">
      {show && (
        <video
          // React sets `muted` as a property, not the attribute iOS Safari
          // checks before allowing autoplay, so set both and start it by hand.
          ref={(el) => {
            if (!el) return;
            el.defaultMuted = true;
            el.muted = true;
            el.play().catch(() => {});
          }}
          autoPlay
          muted
          loop
          playsInline
          poster="/video/cocina-poster.jpg"
        >
          <source src="/video/cocina.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}

function MidCta({ t }) {
  return (
    <section className="midcta">
      <AmbientVideo />
      <div className="wrap midcta-in">
        <Reveal as="h2">{t.midCta.h}</Reveal>
        <Reveal delay={80}>
          <a className="btn" href="#empezar">
            {t.midCta.cta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Clients({ t }) {
  return (
    <section id="clientes">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">{t.clients.eyebrow}</p>
          <h2>{t.clients.h2}</h2>
          <p className="lede">{t.clients.lede}</p>
        </Reveal>

        <div className="clients-grid">
          {t.clients.items.map((c, i) => (
            <Reveal key={i} className="client-card" delay={i * 70}>
              <a href={c.url} target="_blank" rel="noopener noreferrer" aria-label={c.name}>
                <img src={CLIENT_LOGOS[c.key]} alt={c.name} loading="lazy" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Curated hospitality-industry articles. Rows live in the blog_posts table so
 *  new pieces can be added from the Supabase dashboard without a redeploy. */
const fmtDate = (d, lang) =>
  new Date(d).toLocaleDateString(lang === "en" ? "en-US" : "es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const POSTS_PER_PAGE = 6;

/** Mario's own posts (anything that is not outside news) carry Mario's
 *  face and name, so they read as his and not as a relayed story. */
const isOwnPost = (p) => Boolean(p.kind) && p.kind !== "news";

function Blog({ t, lang, page }) {
  const [posts, setPosts] = useState(null); // null while loading
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!supabase) {
      setPosts([]);
      return;
    }
    let cancelled = false;

    supabase
      .from("blog_posts")
      .select("id,kind,title,teaser,excerpt,source,image_url,published_at", { count: "exact" })
      .eq("published", true)
      .in("lang", [lang, "both"])
      // Newsletter stories are dated for the Monday after the Friday email:
      // subscribers can open them by link, the list shows them from then on.
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .order("id")
      .range((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE - 1)
      .then(({ data, count }) => {
        if (cancelled) return;
        setPosts(data || []);
        setTotal(count || 0);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, page]);

  const pages = Math.ceil(total / POSTS_PER_PAGE);
  const pageHref = (n) => (n === 1 ? "#blog" : `#blog/page/${n}`);

  return (
    <section id="blog" className="blog-page">
      <div className="wrap">
        <a href="#top" className="back-link">
          {t.blog.back}
        </a>
        <Reveal className="sec-head">
          <p className="eyebrow">{t.blog.eyebrow}</p>
          <h2>{t.blog.h2}</h2>
          <p className="lede">{t.blog.lede}</p>
        </Reveal>

        {posts === null ? (
          <p className="blog-empty">{t.blog.loading}</p>
        ) : posts.length === 0 ? (
          <p className="blog-empty">{t.blog.empty}</p>
        ) : (
          <>
          <div className="blog-grid">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                {/* Every card opens the post on this site; the original
                    source is linked from there. */}
                <a className="blog-card" href={`#blog/${p.id}`}>
                  <div className={`blog-top${isOwnPost(p) ? " own" : ""}`}>
                    {p.image_url && (
                      <img className="blog-img" src={p.image_url} alt="" loading="lazy" />
                    )}
                    {isOwnPost(p) && (
                      <span className="blog-brand">
                        <img src={marioFace} alt="" />
                        <span>
                          <strong>El Toaster</strong>
                          {t.blog.by}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="blog-body">
                    <div className="blog-meta">
                      {p.source && <span>{p.source}</span>}
                      <span>{fmtDate(p.published_at, lang)}</span>
                    </div>
                    <h3>{p.title}</h3>
                    {(p.teaser || p.excerpt) && <p>{p.teaser || p.excerpt}</p>}
                    <span className="blog-more">{t.blog.readMore} →</span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

          {pages > 1 && (
            <nav className="blog-pages" aria-label={t.blog.pagesLabel}>
              {page > 1 && (
                <a href={pageHref(page - 1)} rel="prev">
                  ← {t.blog.prev}
                </a>
              )}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <a
                  key={n}
                  href={pageHref(n)}
                  className="num"
                  aria-current={n === page ? "page" : undefined}
                >
                  {n}
                </a>
              ))}
              {page < pages && (
                <a href={pageHref(page + 1)} rel="next">
                  {t.blog.next} →
                </a>
              )}
            </nav>
          )}
          </>
        )}
      </div>
    </section>
  );
}

/** One post, opened from a blog card or from a newsletter link (#blog/<id>).
 *  Shows the full text here first; the original source is one click further. */
function BlogPost({ t, lang, setLang, id }) {
  const [post, setPost] = useState(undefined); // undefined while loading, null if missing

  useEffect(() => {
    if (!supabase || !/^[0-9a-f-]{36}$/i.test(id)) {
      setPost(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("blog_posts")
      .select("id,kind,lang,send_id,title,excerpt,source,image_url,image_credit,image_credit_url,external_url,source_links,published_at")
      .eq("published", true)
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setPost(data || null);
        // A link from an email or a share should read in the story's own
        // language, buttons included. Runs once per post, so the visitor can
        // still switch afterwards.
        if (data?.lang === "es" || data?.lang === "en") setLang(data.lang);
      });
    return () => {
      cancelled = true;
    };
  }, [id, setLang]);

  // Switching language on a post opens the same story in the other language:
  // newsletter sections pair by issue and section, news stories by their
  // original link. With no counterpart the post stays as it is.
  useEffect(() => {
    if (!post || post.lang === lang || !["es", "en"].includes(post.lang)) return;
    let q = supabase.from("blog_posts").select("id").eq("published", true).eq("lang", lang);
    if (post.send_id) q = q.eq("send_id", post.send_id).eq("kind", post.kind);
    else if (post.external_url) q = q.eq("external_url", post.external_url);
    else return;
    let cancelled = false;
    q.limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.id) location.replace(`#blog/${data.id}`);
      });
    return () => {
      cancelled = true;
    };
  }, [post, lang]);

  return (
    <article className="blog-page blog-post">
      <div className="wrap">
        <a href="#blog" className="back-link">
          {t.blog.backToBlog}
        </a>

        {post === undefined ? (
          <p className="blog-empty">{t.blog.loading}</p>
        ) : post === null ? (
          <p className="blog-empty">{t.blog.notFound}</p>
        ) : (
          <>
            <div className="blog-meta">
              {post.source && <span>{post.source}</span>}
              <span>{fmtDate(post.published_at, lang)}</span>
            </div>
            <h1>{post.title}</h1>

            {isOwnPost(post) && (
              <p className="blog-byline">
                <img src={marioAvatar} alt="" />
                <span>
                  <strong>El Toaster</strong>
                  {t.blog.byline}
                </span>
              </p>
            )}

            {post.image_url && (
              <figure>
                <img src={post.image_url} alt="" />
                {post.image_credit && (
                  <figcaption>
                    {post.image_credit_url ? (
                      <a href={post.image_credit_url} target="_blank" rel="noopener noreferrer">
                        {post.image_credit}
                      </a>
                    ) : (
                      post.image_credit
                    )}
                  </figcaption>
                )}
              </figure>
            )}

            {(post.excerpt || "").split(/\n{2,}/).map((para, i) => (
              <p key={i} className="blog-para">
                {para}
              </p>
            ))}

            {post.external_url && (
              <a
                className="blog-source"
                href={post.external_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.blog.original(post.source)} →
              </a>
            )}

            {Array.isArray(post.source_links) && post.source_links.length > 0 && (
              <div className="blog-sources">
                <h2>{t.blog.sources}</h2>
                <ul>
                  {post.source_links.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.label} →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

/** Full-width band under every blog page that sends readers to the form. */
function BlogCta({ t }) {
  return (
    <section className="midcta">
      <div className="wrap midcta-in">
        <div>
          <h2>{t.blog.ctaTitle}</h2>
          <p className="blog-cta-body">{t.blog.ctaBody}</p>
        </div>
        <a className="btn" href="#empezar">
          {t.blog.ctaButton}
        </a>
      </div>
    </section>
  );
}

/** Soft, non-salesy callout: restaurant operational pain points. Clicking any
 *  one opens Mario's Cal.com booking page in a new tab — framed as "let's
 *  talk," not as a POS pitch. */
function Pains({ t }) {
  return (
    <section id="dolores" className="pains">
      <div className="wrap">
        <div className="pains-top">
          <Reveal className="sec-head pains-head">
            <img
              className="pains-avatar"
              src={marioAvatar}
              alt="Mario Padilla"
              loading="lazy"
            />
            <p className="eyebrow">{t.pains.eyebrow}</p>
            <h2 className="hand pains-h2">{t.pains.h2}</h2>
            <p className="lede">{t.pains.lede}</p>
          </Reveal>

          <Reveal className="pains-photo" delay={90}>
            <img
              src={posTerminal}
              alt={t.pains.imageAlt}
              width="1200"
              height="576"
              loading="lazy"
              decoding="async"
            />
          </Reveal>
        </div>

        <div className="pains-list">
          {t.pains.items.map((p, i) => (
            <Reveal key={i} delay={i * 70}>
              <a
                className="pain-item"
                href={CAL_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p}
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={t.pains.items.length * 70} className="pains-cta-block">
          <p className="pains-note">{t.pains.note}</p>
          <a
            className="btn btn-lg pains-cta"
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.pains.cta}
          </a>
          <p className="pains-learn-more">
            {t.pains.learnMore}{" "}
            <a href={POS_LEARN_MORE_URL} target="_blank" rel="noopener noreferrer">
              {t.pains.learnMoreLink}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function OneOnOne({ t }) {
  return (
    <section className="one-on-one">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">{t.oneOnOne.eyebrow}</p>
          <h2>{t.oneOnOne.h2}</h2>
          <p className="lede">{t.oneOnOne.lede}</p>
          <a
            className="btn btn-lg"
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.oneOnOne.cta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function LeadForm({ t, lang }) {
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [form, setForm] = useState({
    restaurant_name: "",
    contact_name: "",
    email: "",
    phone: "",
    city: "",
    zip_code: "",
    restaurant_type: "",
    street_address: "",
    annual_revenue: "",
    biggest_challenge: "",
    // Not asked for — the language the visitor is reading the site in is the
    // language they'll be contacted in.
    preferred_language: lang,
  });
  const [marketingConsent, setMarketingConsent] = useState(false);
  // What the eligibility endpoint last said about the typed email.
  const [status, setStatus] = useState(null);
  const [cooldown, setCooldown] = useState(null);
  const checkedEmail = useRef("");

  useEffect(() => {
    setForm((f) => ({ ...f, preferred_language: lang }));
  }, [lang]);

  const set = useCallback(
    (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
    []
  );

  const fmtDate = useCallback(
    (iso) =>
      new Date(iso).toLocaleDateString(lang === "en" ? "en-US" : "es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [lang]
  );

  /** Asks the backend whether this email may request a diagnostic and whether
   *  it is already subscribed, so the form can say so before submitting. */
  const checkEmail = useCallback(async (email) => {
    const address = email.trim().toLowerCase();
    if (!supabase || !address || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address)) return null;
    if (checkedEmail.current === address) return status;

    const { data, error } = await supabase.functions.invoke("check-lead-eligibility", {
      body: { email: address },
    });
    if (error) return null;

    checkedEmail.current = address;
    setStatus(data);
    return data;
  }, [status]);

  async function submit(e) {
    e.preventDefault();
    if (state === "sending") return;

    if (!supabase) {
      setState("error");
      return;
    }

    setState("sending");

    const check = await checkEmail(form.email);
    if (check && !check.eligible) {
      setCooldown(check);
      setState("idle");
      return;
    }

    const payload = {
      ...form,
      source: "landing",
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("leads").insert([payload]);

    if (error) {
      // The 30-day rule is enforced by a database trigger, so a race (or a
      // stale check) still lands here — show the same friendly explanation
      // rather than a generic failure.
      const match = /DIAGNOSTIC_COOLDOWN\s+(\S+)/.exec(error.message || "");
      if (match) {
        const next = new Date(match[1]);
        setCooldown({
          nextEligibleAt: next.toISOString(),
          daysRemaining: Math.max(1, Math.ceil((next.getTime() - Date.now()) / 86400000)),
        });
        setState("idle");
      } else {
        setState("error");
      }
      return;
    }

    setState("done");

    // Best-effort notification + marketing sync — never blocks or fails
    // the UI outcome, since the lead is already safely stored.
    supabase.functions.invoke("send-lead-email", { body: payload }).catch(() => {});
    supabase.functions.invoke("send-diagnostic-email", { body: payload }).catch(() => {});
  }

  return (
    <section className="form-sec" id="empezar">
      <div className="wrap form-grid">
        <Reveal>
          <p className="eyebrow">{t.form.eyebrow}</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", margin: "14px 0 20px" }}>
            {t.form.h2}
          </h2>
          <p className="lede">{t.form.lede}</p>

          <ul className="checklist">
            {t.form.checklist.map((c, i) => (
              <li key={i}>
                <span className="tick" aria-hidden="true">
                  ✓
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>

          <blockquote className="quote">
            <p>“{t.form.quote}”</p>
            <footer>
              <img className="mark" src={marioFace} alt="" />
              {t.form.quoteBy}
            </footer>
          </blockquote>
        </Reveal>

        <Reveal className="form-card" delay={90}>
          {state === "done" ? (
            <div className="done">
              <div className="ic" aria-hidden="true">
                ✓
              </div>
              <h3>{t.form.okTitle}</h3>
              <p>{t.form.okBody}</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate={false}>
              {state === "error" && (
                <div className="alert err" role="alert">
                  {t.form.error}
                </div>
              )}

              <div className="inp">
                <label htmlFor="rest">{t.form.f.restaurant}</label>
                <input
                  id="rest"
                  required
                  autoComplete="organization"
                  value={form.restaurant_name}
                  onChange={set("restaurant_name")}
                />
              </div>

              {/* Required: a brand name alone matches same-named restaurants
                  elsewhere in the metro, which would diagnose the wrong store. */}
              <div className="inp">
                <label htmlFor="addr">{t.form.f.address}</label>
                <input
                  id="addr"
                  required
                  autoComplete="street-address"
                  placeholder={t.form.f.addressPlaceholder}
                  value={form.street_address}
                  onChange={set("street_address")}
                />
                <p className="inp-note">{t.form.f.addressNote}</p>
              </div>

              <div className="row">
                <div className="inp">
                  <label htmlFor="nm">{t.form.f.name}</label>
                  <input
                    id="nm"
                    required
                    autoComplete="name"
                    value={form.contact_name}
                    onChange={set("contact_name")}
                  />
                </div>
                <div className="inp">
                  <label htmlFor="em">{t.form.f.email}</label>
                  <input
                    id="em"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={set("email")}
                    onBlur={(e) => checkEmail(e.target.value)}
                  />
                  {status && !status.eligible && (
                    <p className="inp-note warn">
                      {t.form.cooldownInline(status.daysRemaining)}
                    </p>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="inp">
                  <label htmlFor="ph">{t.form.f.phone}</label>
                  <input
                    id="ph"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={set("phone")}
                  />
                </div>
                <div className="inp">
                  <label htmlFor="ct">{t.form.f.city}</label>
                  <select
                    id="ct"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={set("city")}
                  >
                    <option value="" disabled>
                      {t.form.f.cityPlaceholderOpt}
                    </option>
                    {t.form.cityOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="inp">
                  <label htmlFor="zip">{t.form.f.zip}</label>
                  <input
                    id="zip"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder={t.form.f.zipPlaceholder}
                    pattern="[0-9]{5}(-[0-9]{4})?"
                    maxLength={10}
                    value={form.zip_code}
                    onChange={set("zip_code")}
                  />
                </div>
                <div className="inp">
                  <label htmlFor="rtype">{t.form.f.restaurantType}</label>
                  <select
                    id="rtype"
                    required
                    value={form.restaurant_type}
                    onChange={set("restaurant_type")}
                  >
                    <option value="" disabled>
                      {t.form.f.restaurantTypePlaceholder}
                    </option>
                    {t.form.restaurantTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="inp">
                <label htmlFor="rev">{t.form.f.revenue}</label>
                <select id="rev" value={form.annual_revenue} onChange={set("annual_revenue")}>
                  <option value="">{t.form.f.revenuePlaceholder}</option>
                  {t.form.f.revenueOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <p className="inp-note">{t.form.f.revenueNote}</p>
              </div>

              <div className="inp">
                <label htmlFor="ch">{t.form.f.challenge}</label>
                <div className="chip-row" role="group" aria-label={t.form.f.challenge}>
                  {t.form.challengeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`chip${form.biggest_challenge === opt ? " active" : ""}`}
                      aria-pressed={form.biggest_challenge === opt}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          biggest_challenge: f.biggest_challenge === opt ? "" : opt,
                        }))
                      }
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <textarea
                  id="ch"
                  value={form.biggest_challenge}
                  onChange={set("biggest_challenge")}
                />
              </div>

              <div className="inp consent">
                <label htmlFor="lf-consent" className="checkbox-label">
                  <input
                    id="lf-consent"
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                  />
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t.consent.label(t.consent.linkText),
                    }}
                  />
                </label>
                {marketingConsent && status?.subscribed && (
                  <p className="inp-note">{t.form.alreadySubscribed}</p>
                )}
              </div>

              <button className="btn" type="submit" disabled={state === "sending"}>
                {state === "sending" ? t.form.f.sending : t.form.f.submit}
              </button>
              <p className="formnote">{t.form.f.note}</p>
            </form>
          )}
        </Reveal>
      </div>

      {cooldown && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCooldown(null);
          }}
        >
          <div
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cooldown-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label={t.form.cooldownClose}
              onClick={() => setCooldown(null)}
            >
              ✕
            </button>
            <div className="done">
              <div className="ic" aria-hidden="true">
                ⏳
              </div>
              <h3 id="cooldown-title">{t.form.cooldownTitle}</h3>
              <p>
                {t.form.cooldownBody(
                  cooldown.daysRemaining,
                  fmtDate(cooldown.nextEligibleAt)
                )}
              </p>
            </div>
            <button type="button" className="btn" onClick={() => setCooldown(null)}>
              {t.form.cooldownClose}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function PrivacyPolicy({ t }) {
  return (
    <section className="privacy-page">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <a href="#top" className="back-link">
          {t.privacy.back}
        </a>
        <h1>{t.privacy.title}</h1>
        <p className="updated">{t.privacy.updated}</p>
        <p className="lede">{t.privacy.intro}</p>

        {t.privacy.sections.map((s, i) => (
          <div key={i} className="privacy-sec">
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </div>
        ))}

        <p className="disclaimer">{t.privacy.disclaimer}</p>
      </div>
    </section>
  );
}

/** POSTs to an Edge Function and returns its JSON whatever the HTTP status —
 *  these pages need the body of a 404/409 to say what went wrong. */
async function callFunction(name, body) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  try {
    const res = await fetch(`${base}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json().catch(() => null) };
  } catch {
    return { status: 0, data: null };
  }
}

/** Landing page for every unsubscribe link (#unsubscribe/t/<token> from the
 *  newsletter, #unsubscribe/l/<lead id> from diagnostic emails). Opting out
 *  takes a click here, so a mail scanner opening the link can't do it. */
function Unsubscribe({ t }) {
  const [, kind, value] = window.location.hash.split("/");
  const [state, setState] = useState(value ? "confirm" : "missing"); // confirm | working | done | missing | error

  async function confirm() {
    setState("working");
    const { status, data } = await callFunction("unsubscribe", { [kind === "t" ? "t" : "l"]: value });
    setState(data?.ok ? "done" : status === 404 ? "missing" : "error");
  }

  const u = t.unsubscribe;
  return (
    <section className="privacy-page">
      <div className="wrap notice">
        {state === "done" ? (
          <>
            <h1>{u.doneTitle}</h1>
            <p className="lede">{u.doneBody}</p>
          </>
        ) : state === "missing" ? (
          <>
            <h1>{u.missingTitle}</h1>
            <p className="lede">{u.missingBody}</p>
          </>
        ) : (
          <>
            <h1>{u.title}</h1>
            <p className="lede">{u.body}</p>
            <button type="button" className="btn" onClick={confirm} disabled={state === "working"}>
              {state === "working" ? u.working : u.button}
            </button>
            {state === "error" && (
              <p className="notice-msg" role="alert">
                {u.error}
              </p>
            )}
          </>
        )}
        <a href="#top" className="back-link">
          {u.back}
        </a>
      </div>
    </section>
  );
}

/** Mario's approval page, opened from the test email (#send/<id>/<token>).
 *  Shows what the issue contains and who it reaches before anything goes out. */
function NewsletterSend({ t, lang }) {
  const [, send, token] = window.location.hash.split("/");
  const [issue, setIssue] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | sending | missing
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    let alive = true;
    callFunction("newsletter-send", { send, token, action: "status" }).then(({ data }) => {
      if (!alive) return;
      if (!data?.id) return setState("missing");
      setIssue(data);
      setState("ready");
    });
    return () => {
      alive = false;
    };
  }, [send, token]);

  async function approve() {
    setState("sending");
    setProblem(null);
    const { data } = await callFunction("newsletter-send", { send, token, action: "live" });
    if (data?.id) setIssue(data);
    if (!data?.id || data.error) setProblem(data?.error || "error");
    setState("ready");
  }

  const s = t.sendPage;
  // Issues are timed in Arizona, whatever the reader's clock says.
  const day = (iso, withTime) =>
    new Date(iso).toLocaleString(lang === "en" ? "en-US" : "es-MX", {
      timeZone: "America/Phoenix",
      weekday: "long",
      month: "long",
      day: "numeric",
      ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    });
  if (state === "loading" || state === "missing") {
    return (
      <section className="privacy-page">
        <div className="wrap notice">
          <h1>{s.title}</h1>
          <p className="lede">{state === "loading" ? s.loading : s.notFound}</p>
        </div>
      </section>
    );
  }

  const blocked =
    problem ||
    (issue.status === "draft" || issue.status === "cancelled" ? issue.status : null) ||
    (!issue.mailing_address_set && issue.status !== "sent" ? "mailing_address_missing" : null);
  const canSend = ["test_sent", "failed"].includes(issue.status) && issue.mailing_address_set;
  const later = issue.send_at && new Date(issue.send_at) > new Date() ? day(issue.send_at, true) : null;
  const onBlog = issue.blog_publish_at ? day(issue.blog_publish_at, false) : null;

  return (
    <section className="privacy-page">
      <div className="wrap notice">
        <h1>{s.title}</h1>

        {issue.status === "sent" ? (
          <p className="lede">{s.sent(issue.recipients ?? 0)}</p>
        ) : issue.status === "scheduled" ? (
          <p className="lede">{s.scheduled(issue.live_recipients, day(issue.send_at, true), onBlog)}</p>
        ) : (
          <p className="lede">
            {s.audience(issue.live_recipients)}
            {later && ` ${s.when(later, onBlog)}`}
          </p>
        )}

        <h2>{s.stories}</h2>
        <ol className="notice-list">
          {(issue.stories?.[lang] || []).map((title) => (
            <li key={title}>{title}</li>
          ))}
        </ol>

        {issue.status !== "sent" && issue.status !== "scheduled" && (
          <button
            type="button"
            className="btn"
            onClick={approve}
            disabled={!canSend || state === "sending"}
          >
            {state === "sending"
              ? s.sending
              : later
                ? s.approve(issue.live_recipients)
                : s.button(issue.live_recipients)}
          </button>
        )}

        {issue.status !== "sent" && blocked && (
          <p className="notice-msg" role="alert">
            {s.status[blocked] || s.status.error}
          </p>
        )}
        {issue.last_error && <p className="notice-msg">{issue.last_error}</p>}
      </div>
    </section>
  );
}

function Newsletter({ t, lang }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | ok | already | invalid | error

  async function submit(e) {
    e.preventDefault();
    if (state === "sending") return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setState("invalid");
      return;
    }
    if (!supabase) {
      setState("error");
      return;
    }

    setState("sending");
    const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
      body: { email: email.trim(), lang },
    });

    if (error || !data) {
      setState("error");
      return;
    }
    setState(data.status === "already" ? "already" : data.status === "subscribed" ? "ok" : "error");
    if (data.status === "subscribed") setEmail("");
  }

  return (
    <div className="newsletter" id="newsletter">
      <h3>{t.newsletter.h}</h3>
      <p className="newsletter-lede">{t.newsletter.lede}</p>
      <form className="newsletter-form" onSubmit={submit}>
        <input
          type="email"
          aria-label={t.newsletter.h}
          placeholder={t.newsletter.placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state !== "sending") setState("idle");
          }}
        />
        <button className="btn dark outline-white" type="submit" disabled={state === "sending"}>
          {state === "sending" ? t.newsletter.sending : t.newsletter.cta}
        </button>
      </form>
      {state !== "idle" && state !== "sending" && (
        <p className={`newsletter-msg${state === "ok" ? " ok" : ""}`} role="status">
          {t.newsletter[state === "ok" ? "ok" : state]}
        </p>
      )}
    </div>
  );
}

function Footer({ t, lang }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <h3>{t.foot.h}</h3>
          <Newsletter t={t} lang={lang} />
        </div>

        <div className="foot-brand">
          <img className="mark" src={marioFace} alt="" />
          <div>
            <p className="logo-text">
              El&nbsp;Toaster
              <small>{t.brand.by}</small>
            </p>
            <p className="foot-brand-line">{t.brand.foot}</p>
          </div>
        </div>

        <div className="foot-links" style={{ marginTop: 28 }}>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a href="/calculator">{t.nav.calc}</a>
          <a href="#diagnostico">{t.nav.diag}</a>
          <a href="#privacy">{t.privacy.title}</a>
        </div>

        <div className="foot-bot">
          <span>
            © {new Date().getFullYear()} Desde Zero · Mario Padilla · {t.foot.rights}
          </span>
          <span style={{ maxWidth: "62ch" }}>{t.foot.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- app ---------------- */

export default function App() {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "es" || saved === "en") return saved;
    } catch {
      /* storage unavailable — fall through */
    }
    return navigator.language?.toLowerCase().startsWith("en") ? "en" : "es";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = content[lang];

  const routeFromHash = () => {
    const h = window.location.hash;
    if (h === "#privacy") return "privacy";
    if (h === "#blog" || h.startsWith("#blog/")) return "blog";
    if (h.startsWith("#unsubscribe")) return "unsubscribe";
    if (h.startsWith("#send/")) return "send";
    return "site";
  };

  const [route, setRoute] = useState(routeFromHash);
  // The token pages carry their identifier in the hash, so they are keyed by
  // it: a different link in the same tab must start from a clean page.
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#calculadora") {
        window.location.replace("/calculator");
        return;
      }
      setRoute(routeFromHash());
      setHash(window.location.hash);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Pages start at the top. Going back to the landing page with an anchor
  // (#empezar from a blog post) needs a nudge, because the target did not
  // exist yet when the browser handled the hash change.
  // Anchors within the landing page are left to the browser's own smooth
  // scroll; this only steps in when arriving from another page.
  const prevRoute = useRef(null);
  useEffect(() => {
    const arriving = prevRoute.current !== "site";
    prevRoute.current = route;
    if (route !== "site") {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (!arriving) return;
    const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView({ behavior: "instant" });
  }, [hash, route]);

  // A real path rather than a #route, so the address people share reads
  // eltoaster.com/calculator. vercel.json rewrites it to index.html.
  if (window.location.pathname.replace(/\/+$/, "") === "/calculator") {
    return (
      <>
        <Nav lang={lang} setLang={setLang} t={t} />
        <main>
          <CalculatorPage t={t} lang={lang} />
        </main>
        <Footer t={t} lang={lang} />
        <MobileBar t={t} />
      </>
    );
  }

  if (route === "privacy") {
    return (
      <>
        <Nav lang={lang} setLang={setLang} t={t} />
        <main>
          <PrivacyPolicy t={t} />
        </main>
        <Footer t={t} lang={lang} />
      </>
    );
  }

  if (route === "unsubscribe" || route === "send") {
    return (
      <>
        <Nav lang={lang} setLang={setLang} t={t} />
        <main>
          {route === "send" ? (
            <NewsletterSend key={hash} t={t} lang={lang} />
          ) : (
            <Unsubscribe key={hash} t={t} />
          )}
        </main>
      </>
    );
  }

  if (route === "blog") {
    // #blog is page 1, #blog/page/<n> the rest; anything else is one post.
    const pageMatch = hash.match(/^#blog\/page\/(\d+)$/);
    const blogPage = pageMatch ? Math.max(1, Number(pageMatch[1])) : hash === "#blog" ? 1 : 0;
    return (
      <>
        <Nav lang={lang} setLang={setLang} t={t} />
        <main>
          {blogPage ? (
            <Blog t={t} lang={lang} page={blogPage} />
          ) : (
            <BlogPost key={hash} t={t} lang={lang} setLang={setLang} id={hash.slice(6)} />
          )}
          <BlogCta t={t} />
        </main>
        <Footer t={t} lang={lang} />
        <MobileBar t={t} />
      </>
    );
  }

  return (
    <>
      <Nav lang={lang} setLang={setLang} t={t} />
      <main>
        <Hero t={t} />
        <Stats t={t} />
        <VideoIntro t={t} />
        <Problem t={t} />
        <MidCta t={t} />
        <Diagnostic t={t} />
        <Steps t={t} />
        <Clients t={t} />
        <Pains t={t} />
        <LeadForm t={t} lang={lang} />
        <OneOnOne t={t} />
      </main>
      <Footer t={t} lang={lang} />

      <MobileBar t={t} />
    </>
  );
}
