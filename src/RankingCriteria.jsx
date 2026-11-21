import { useEffect, useRef, useState } from "react";
import { track } from "./analytics.js";

/* "How this ranking was built", for restaurant owners on /rankings.
 *
 * A friendly version of the phoenix-food-ranking-criteria rules: what counts
 * and how much, shown as a bar you can tap, a small calculator, and the rules
 * nobody can buy their way around. The full formula (ties, fallbacks, who
 * sets the bonuses) stays internal on purpose.
 *
 * Weights mirror the skill: Google 50, Yelp 30, social 10, awards 5, plus two
 * +5 bonuses (influencers, community). Max 105. */

const PARTS = [
  { key: "google", pts: 50, tone: "c-google" },
  { key: "yelp", pts: 30, tone: "c-yelp" },
  { key: "social", pts: 10, tone: "c-social" },
  { key: "awards", pts: 5, tone: "c-awards" },
];
const BONUS = [
  { key: "influencers", pts: 5 },
  { key: "community", pts: 5 },
];
const MAX = 105;

/* Flat outline icons, drawn in currentColor so they follow the theme. */
const ICONS = {
  google: (
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
  ),
  yelp: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20V11M12 20V6M17 20v-6" />
    </>
  ),
  social: (
    <>
      <path d="M4 5.5h16v10H9l-4.5 4v-4H4z" />
      <path d="M8 10h8M8 12.8h5" />
    </>
  ),
  awards: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4" />
    </>
  ),
  influencers: (
    <>
      <rect x="3.5" y="7" width="13" height="11" rx="2.5" />
      <path d="M16.5 11l4-2.5v8l-4-2.5" />
      <circle cx="10" cy="12.5" r="2.4" />
    </>
  ),
  community: (
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="16.5" cy="10" r="2.4" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14.5 15.4c2.6-.5 5 1 5.7 3.6" />
    </>
  ),
};

function Icon({ name, size = 26 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

function Score({ value, label }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const filled = Math.min(1, value / MAX);
  return (
    <div className="crit-score" aria-live="polite">
      <svg viewBox="0 0 100 100" width="132" height="132" aria-hidden="true">
        <circle cx="50" cy="50" r={r} className="crit-ring-bg" />
        <circle
          cx="50"
          cy="50"
          r={r}
          className="crit-ring"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - filled)}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="crit-score-num">
        <b>{Math.round(value)}</b>
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function RankingCriteria({ c, ranking, onClose }) {
  const [active, setActive] = useState("google");
  const [google, setGoogle] = useState(4.5);
  const [yelp, setYelp] = useState(4.0);
  const [social, setSocial] = useState(5);
  const [award, setAward] = useState(false);
  const [influencers, setInfluencers] = useState(false);
  const [community, setCommunity] = useState(false);
  const touched = useRef(false);
  const panel = useRef(null);

  useEffect(() => {
    track("criteria_open", { ranking });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, ranking]);

  // Same arithmetic as the internal formula, rounded for display.
  const total =
    (google / 5) * 50 + (yelp / 5) * 30 + social + (award ? 5 : 0) + (influencers ? 5 : 0) + (community ? 5 : 0);

  const tried = () => {
    if (touched.current) return;
    touched.current = true;
    track("criteria_simulate", { ranking });
  };

  const info = c.parts[active] || c.bonus[active];
  const activePts = PARTS.find((p) => p.key === active)?.pts ?? BONUS.find((b) => b.key === active)?.pts;
  const isBonus = BONUS.some((b) => b.key === active);

  return (
    <div className="crit-overlay" onClick={onClose}>
      <div
        className="crit-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crit-title"
        tabIndex={-1}
        ref={panel}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="crit-x" onClick={onClose} aria-label={c.close}>
          ×
        </button>

        <p className="crit-eyebrow">{c.eyebrow}</p>
        <h2 id="crit-title">{c.title}</h2>
        <p className="crit-lede">{c.lede}</p>

        {/* 1. What counts: a bar you can tap, plus two bonus chips. */}
        <div className="crit-bar-wrap">
          <div className="crit-bar" role="tablist" aria-label={c.barLabel}>
            {PARTS.map((p) => (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={active === p.key}
                className={`crit-seg ${p.tone}${active === p.key ? " on" : ""}`}
                style={{ flexGrow: p.pts }}
                onClick={() => setActive(p.key)}
              >
                <span className="crit-seg-pts">{p.pts}</span>
                <span className="crit-seg-name">{c.parts[p.key].short}</span>
              </button>
            ))}
          </div>
          <div className="crit-bonus" role="tablist" aria-label={c.bonusLabel}>
            {BONUS.map((b) => (
              <button
                key={b.key}
                type="button"
                role="tab"
                aria-selected={active === b.key}
                className={`crit-chip${active === b.key ? " on" : ""}`}
                onClick={() => setActive(b.key)}
              >
                +{b.pts} <span>{c.bonus[b.key].short}</span>
              </button>
            ))}
          </div>
          <p className="crit-hint">{c.tapHint}</p>
        </div>

        <div className={`crit-detail${isBonus ? " bonus" : ""}`} key={active}>
          <div className="crit-detail-icon">
            <Icon name={active} />
          </div>
          <div>
            <p className="crit-detail-pts">
              {isBonus ? `+${activePts} ${c.bonusWord}` : `${activePts} ${c.ptsWord}`}
            </p>
            <h3>{info.h}</h3>
            <p>{info.p}</p>
          </div>
        </div>

        {/* 2. Try it: move the stars and watch the score. */}
        <div className="crit-sim">
          <div className="crit-sim-head">
            <h3>{c.simH}</h3>
            <p>{c.simP}</p>
          </div>
          <div className="crit-sim-body">
            <div className="crit-sim-controls">
              <label className="crit-range">
                <span>
                  {c.simGoogle} <b>{google.toFixed(1)} ★</b>
                </span>
                <input
                  type="range"
                  min="3"
                  max="5"
                  step="0.1"
                  value={google}
                  onChange={(e) => {
                    tried();
                    setGoogle(+e.target.value);
                  }}
                />
              </label>
              <label className="crit-range">
                <span>
                  {c.simYelp} <b>{yelp.toFixed(1)} ★</b>
                </span>
                <input
                  type="range"
                  min="3"
                  max="5"
                  step="0.1"
                  value={yelp}
                  onChange={(e) => {
                    tried();
                    setYelp(+e.target.value);
                  }}
                />
              </label>
              <div className="crit-seg-pick">
                <span>{c.simSocial}</span>
                <div role="group" aria-label={c.simSocial}>
                  {[
                    [0, c.simLow],
                    [5, c.simMid],
                    [10, c.simHigh],
                  ].map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      className={social === v ? "on" : ""}
                      aria-pressed={social === v}
                      onClick={() => {
                        tried();
                        setSocial(v);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="crit-toggles">
                {[
                  [award, setAward, c.simAward, "awards"],
                  [influencers, setInfluencers, c.simInfluencers, "influencers"],
                  [community, setCommunity, c.simCommunity, "community"],
                ].map(([on, set, label, icon]) => (
                  <button
                    key={icon}
                    type="button"
                    className={`crit-toggle${on ? " on" : ""}`}
                    aria-pressed={on}
                    onClick={() => {
                      tried();
                      set(!on);
                    }}
                  >
                    <Icon name={icon} size={20} />
                    <span>{label}</span>
                    <b>+5</b>
                  </button>
                ))}
              </div>
            </div>
            <div className="crit-sim-out">
              <Score value={total} label={c.simOf} />
              <p className="crit-tip">{c.simTip}</p>
            </div>
          </div>
        </div>

        {/* 3. The rules nobody can buy their way around. */}
        <div className="crit-rules">
          <h3>{c.rulesH}</h3>
          <ul>
            {c.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="crit-cta">
          <div>
            <h3>{c.ctaH}</h3>
            <p>{c.ctaP}</p>
          </div>
          <a
            className="btn"
            href="/#empezar"
            onClick={() => track("cta_click", { cta: "criteria_diagnostic", section: "ranking_criteria" })}
          >
            {c.ctaBtn}&nbsp;→
          </a>
        </div>
      </div>
    </div>
  );
}
