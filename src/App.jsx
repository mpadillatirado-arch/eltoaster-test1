import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { content } from "./content.js";
import { supabase } from "./supabase.js";
import lasCulichisLogo from "./assets/clients/las-culichis.jpg";
import padelPalsLogo from "./assets/clients/padel-pals.jpg";
import sushinoLogo from "./assets/clients/sushino.jpg";
import marioAvatar from "./assets/mario-avatar.webp";

const CLIENT_LOGOS = {
  "las-culichis": lasCulichisLogo,
  "padel-pals": padelPalsLogo,
  sushino: sushinoLogo,
};

const EMAIL = "mario.padilla@toasttab.com";
const LINKEDIN = "https://www.linkedin.com/in/mario-padilla-57145839/";
const CAL_URL = "https://cal.com/mario-padilla-tirado-hnho7v/15-minutos-chat-free-restaurant-diagnostic";
const POS_LEARN_MORE_URL =
  "https://pos.toasttab.com/lp/get-started?utm_medium=paid&utm_source=sembb&utm_campaign=tpos-b2bsmb-paid-1139094559993298-exabrandxx-acq-sembb-cousa&utm_term=point%20of%20sale%20toast&_bt=&_bm=e&_bn=o&device=c&utm_campaign_id=352125627&utm_adgroup_id=1139094559993298&msclkid=7b495c0779221c10f9df36b04aa2d98f&utm_content=Toast%20POS";

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

/** Quick-request modal: business name, email, location. Saves to Supabase
 *  and fires the send-lead-email Edge Function (best-effort, non-blocking
 *  for the UI outcome). */
function QuickModal({ open, onClose, t, lang }) {
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [form, setForm] = useState({ restaurant_name: "", email: "", city: "" });
  const [marketingConsent, setMarketingConsent] = useState(false);
  const firstRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      setState("idle");
      setForm({ restaurant_name: "", email: "", city: "" });
      setMarketingConsent(false);
      setTimeout(() => firstRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");

    if (!supabase) {
      setState("error");
      return;
    }

    const payload = {
      ...form,
      preferred_language: lang,
      source: "quick_modal",
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("leads").insert([payload]);

    if (error) {
      setState("error");
      return;
    }

    setState("done");

    // Best-effort emails — never block or fail the UI, since the lead is
    // already safely stored regardless of delivery.
    supabase.functions.invoke("send-lead-email", { body: payload }).catch(() => {});
    supabase.functions.invoke("send-diagnostic-email", { body: payload }).catch(() => {});
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-modal-title"
        ref={dialogRef}
      >
        <button
          type="button"
          className="modal-close"
          aria-label={t.quick.close}
          onClick={onClose}
        >
          ✕
        </button>

        {state === "done" ? (
          <div className="done">
            <div className="ic" aria-hidden="true">
              ✓
            </div>
            <h3>{t.quick.okTitle}</h3>
            <p>{t.quick.okBody}</p>
          </div>
        ) : (
          <>
            <h3 id="quick-modal-title" style={{ fontSize: "1.6rem", fontWeight: 800 }}>
              {t.quick.title}
            </h3>
            <p className="lede" style={{ marginTop: 10, fontSize: "0.98rem" }}>
              {t.quick.lede}
            </p>

            <form onSubmit={submit} style={{ marginTop: 24 }}>
              {state === "error" && (
                <div className="alert err" role="alert">
                  {t.quick.error}
                </div>
              )}

              <div className="inp">
                <label htmlFor="qm-biz">{t.quick.business}</label>
                <input
                  id="qm-biz"
                  ref={firstRef}
                  required
                  autoComplete="organization"
                  value={form.restaurant_name}
                  onChange={set("restaurant_name")}
                />
              </div>

              <div className="inp">
                <label htmlFor="qm-email">{t.quick.email}</label>
                <input
                  id="qm-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={set("email")}
                />
              </div>

              <div className="inp">
                <label htmlFor="qm-loc">{t.quick.location}</label>
                <select
                  id="qm-loc"
                  required
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

              <div className="inp consent">
                <label htmlFor="qm-consent" className="checkbox-label">
                  <input
                    id="qm-consent"
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
              </div>

              <button className="btn" type="submit" disabled={state === "sending"}>
                {state === "sending" ? t.quick.sending : t.quick.submit}
              </button>
            </form>

            <p className="formnote">
              {t.quick.moreDetail}{" "}
              <a href="#empezar" onClick={onClose}>
                {t.quick.moreDetailLink}
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- sections ---------------- */

function Nav({ lang, setLang, t }) {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="nav" data-stuck={stuck}>
      <div className="wrap nav-in">
        <a className="logo" href="#top">
          <span className="mark">MP</span>
          El&nbsp;Toaster
        </a>

        <nav className="nav-links">
          <a href="#dolores">{t.nav.how}</a>
          <a href="#calculadora">{t.nav.calc}</a>
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

        <a className="btn" href="#empezar">
          {t.nav.cta}
        </a>
      </div>
    </header>
  );
}

function Hero({ t, onQuick }) {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>
            {t.hero.h1a} <span className="hand">{t.hero.h1b}</span>
          </h1>
          <p className="lede">{t.hero.lede}</p>

          <div className="hero-cta">
            <button type="button" className="btn" onClick={onQuick}>
              {t.hero.cta1}
            </button>
            <a className="btn ghost" href="#calculadora">
              {t.hero.cta2}
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

function Problem({ t }) {
  return (
    <section id="problema">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">{t.problem.eyebrow}</p>
          <h2>{t.problem.h2}</h2>
          <p className="lede">{t.problem.lede}</p>
        </Reveal>

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

function Calculator({ t }) {
  const [current, setCurrent] = useState(3.8);
  const [target, setTarget] = useState(4.4);
  const [revenue, setRevenue] = useState(900000);

  const { lo, hi, mid, delta } = useMemo(() => {
    const d = Math.max(0, target - current);
    return {
      delta: d,
      lo: revenue * d * 0.05,
      mid: revenue * d * 0.07,
      hi: revenue * d * 0.09,
    };
  }, [current, target, revenue]);

  const pct = (v, min, max) => ((v - min) / (max - min)) * 100 + "%";

  return (
    <section id="calculadora">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">{t.calc.eyebrow}</p>
          <h2>{t.calc.h2}</h2>
          <p className="lede">{t.calc.lede}</p>
        </Reveal>

        <Reveal className="calc">
          <div className="calc-panel">
            <div className="field">
              <label htmlFor="cur">
                {t.calc.rating}
                <b>{current.toFixed(1)}</b>
              </label>
              <Stars value={current} />
              <input
                id="cur"
                type="range"
                min="2.5"
                max="4.9"
                step="0.1"
                value={current}
                style={{ "--pct": pct(current, 2.5, 4.9), marginTop: 12 }}
                onChange={(e) => {
                  const v = +e.target.value;
                  setCurrent(v);
                  if (target < v) setTarget(Math.min(5, v + 0.1));
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="tgt">
                {t.calc.target}
                <b>{target.toFixed(1)}</b>
              </label>
              <Stars value={target} />
              <input
                id="tgt"
                type="range"
                min="2.6"
                max="5"
                step="0.1"
                value={target}
                style={{ "--pct": pct(target, 2.6, 5), marginTop: 12 }}
                onChange={(e) => setTarget(+e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="rev">
                {t.calc.revenue}
                <b>{usdCompact(revenue)}</b>
              </label>
              <input
                id="rev"
                type="range"
                min="150000"
                max="5000000"
                step="50000"
                value={revenue}
                style={{ "--pct": pct(revenue, 150000, 5000000) }}
                onChange={(e) => setRevenue(+e.target.value)}
              />
            </div>
          </div>

          <div className="result">
            <p className="eyebrow">{t.calc.resultLabel}</p>
            <div className="big">{usd(mid)}</div>
            {delta > 0 ? (
              <p
                className="range"
                dangerouslySetInnerHTML={{
                  __html: t.calc.rangeText(usd(lo), usd(hi)),
                }}
              />
            ) : (
              <p className="range">{t.calc.zero}</p>
            )}
            <p className="note">{t.calc.note}</p>
          </div>
        </Reveal>
      </div>
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
              className={`card${i === 0 || i === 5 ? " wide" : ""}`}
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

function MidCta({ t, onQuick }) {
  return (
    <section className="midcta">
      <div className="wrap midcta-in">
        <Reveal as="h2">{t.midCta.h}</Reveal>
        <Reveal delay={80}>
          <button type="button" className="btn" onClick={onQuick}>
            {t.midCta.cta}
          </button>
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
              <img src={CLIENT_LOGOS[c.key]} alt={c.name} loading="lazy" />
            </Reveal>
          ))}
        </div>
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

        <Reveal delay={t.pains.items.length * 70}>
          <p className="pains-note">{t.pains.note}</p>
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
    locations: "1",
    biggest_challenge: "",
    preferred_language: lang,
  });
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, preferred_language: lang }));
  }, [lang]);

  const set = useCallback(
    (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
    []
  );

  async function submit(e) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");

    if (!supabase) {
      setState("error");
      return;
    }

    const payload = {
      ...form,
      source: "landing",
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("leads").insert([payload]);

    setState(error ? "error" : "done");

    if (!error) {
      // Best-effort notification + marketing sync — never blocks or fails
      // the UI outcome, since the lead is already safely stored.
      supabase.functions.invoke("send-lead-email", { body: payload }).catch(() => {});
      supabase.functions.invoke("send-diagnostic-email", { body: payload }).catch(() => {});
    }
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
              <span className="mark" aria-hidden="true">
                MP
              </span>
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
                  />
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
                  <label htmlFor="lc">{t.form.f.locations}</label>
                  <select id="lc" value={form.locations} onChange={set("locations")}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="inp">
                  <label htmlFor="lg">{t.form.f.lang}</label>
                  <select
                    id="lg"
                    value={form.preferred_language}
                    onChange={set("preferred_language")}
                  >
                    <option value="es">{t.form.f.langEs}</option>
                    <option value="en">{t.form.f.langEn}</option>
                  </select>
                </div>
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
              </div>

              <button className="btn" type="submit" disabled={state === "sending"}>
                {state === "sending" ? t.form.f.sending : t.form.f.submit}
              </button>
              <p className="formnote">{t.form.f.note}</p>
            </form>
          )}
        </Reveal>
      </div>
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

function Footer({ t, onQuick }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <h3>{t.foot.h}</h3>
          <button type="button" className="btn" onClick={onQuick}>
            {t.foot.cta}
          </button>
        </div>

        <div className="foot-links" style={{ marginTop: 34 }}>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a href="#calculadora">{t.nav.calc}</a>
          <a href="#diagnostico">{t.nav.diag}</a>
          <a href="#privacy">{t.privacy.title}</a>
        </div>

        <div className="foot-bot">
          <span>
            © {new Date().getFullYear()} Mario Padilla · {t.foot.rights}
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
  const [quickOpen, setQuickOpen] = useState(false);

  const [route, setRoute] = useState(() =>
    window.location.hash === "#privacy" ? "privacy" : "site"
  );
  useEffect(() => {
    const onHash = () =>
      setRoute(window.location.hash === "#privacy" ? "privacy" : "site");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (route === "privacy") {
    return (
      <>
        <Nav lang={lang} setLang={setLang} t={t} onQuick={() => setQuickOpen(true)} />
        <main>
          <PrivacyPolicy t={t} />
        </main>
        <Footer t={t} onQuick={() => setQuickOpen(true)} />
      </>
    );
  }

  return (
    <>
      <Nav lang={lang} setLang={setLang} t={t} onQuick={() => setQuickOpen(true)} />
      <main>
        <Hero t={t} onQuick={() => setQuickOpen(true)} />
        <Stats t={t} />
        <Problem t={t} />
        <Calculator t={t} />
        <MidCta t={t} onQuick={() => setQuickOpen(true)} />
        <Diagnostic t={t} />
        <Steps t={t} />
        <Clients t={t} />
        <Pains t={t} />
        <LeadForm t={t} lang={lang} />
        <OneOnOne t={t} />
      </main>
      <Footer t={t} onQuick={() => setQuickOpen(true)} />

      <button type="button" className="btn mobile-cta" onClick={() => setQuickOpen(true)}>
        {t.nav.cta}
      </button>

      <QuickModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        t={t}
        lang={lang}
      />
    </>
  );
}
