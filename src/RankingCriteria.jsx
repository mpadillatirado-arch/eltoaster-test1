import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "./analytics.js";

/* "How this ranking was built", for restaurant owners on /rankings.
 *
 * Desde Zero's method in plain words. Each ranking can carry its own weights
 * (src/rankings.js → method): Google and Yelp stars make the base (stars ÷ 5
 * × weight), plus bonuses for a formal award, local influencers and the
 * community. Some rankings (mariscos) also scale the Google points by how many
 * Google reviews a place has. Shown as a tappable bar, every place's score
 * when the ranking has them, a small calculator, and the rules money can't
 * buy. Internal details (fallbacks, ties, who assigns bonuses) stay out. */

export const DEFAULT_METHOD = { google: 65, yelp: 35, award: 3, influencer: 2, community: 2, max: 107, reviewFactor: false };

const reviewFactor = (m, reviews) =>
  !m.reviewFactor || reviews == null ? 1 : reviews < 50 ? 0.92 : reviews <= 150 ? 0.95 : 1;

/* Flat outline icons, drawn in currentColor so they follow the theme. */
const ICONS = {
  google: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />,
  yelp: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20V11M12 20V6M17 20v-6" />
    </>
  ),
  award: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4" />
    </>
  ),
  influencer: (
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
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
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

function Score({ value, max, label }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const filled = Math.min(1, value / max);
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
        <b>{value.toFixed(1)}</b>
        <span>{label}</span>
      </div>
    </div>
  );
}

const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const fmtN = (n) => Number(n).toLocaleString("en-US");

/** Movement against the previous edition of the list. */
function Move({ prev, pos, c }) {
  if (prev == null) return <span className="crit-move new">{c.newTag}</span>;
  const d = prev - pos;
  if (d > 0) return <span className="crit-move up" title={c.moveUp.replace("{n}", d)}>▲ {d}</span>;
  if (d < 0) return <span className="crit-move down" title={c.moveDown.replace("{n}", -d)}>▼ {-d}</span>;
  return <span className="crit-move same" title={c.moveSame}>—</span>;
}

/** Every place with its score; tap one to see how it adds up. */
function Scores({ c, m, items, label }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const rows = useMemo(() => items.map((it, i) => ({ ...it, pos: i + 1 })), [items]);
  const shown = q.trim() ? rows.filter((r) => fold(r.name).includes(fold(q.trim()))) : rows;

  return (
    <div className="crit-scores">
      <div className="crit-scores-head">
        <div>
          <h3>{c.scoresH.replace("{label}", label)}</h3>
          <p>{c.scoresP}</p>
        </div>
        <label className="crit-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={q}
            placeholder={c.searchPh}
            aria-label={c.searchPh}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>

      <ol className="crit-table">
        {shown.map((r) => {
          const s = r.score;
          const isOpen = open === r.pos;
          const multi = /,| y |sucursales/i.test(r.city || "");
          const f = reviewFactor(m, s.gReviews);
          return (
            <li key={r.pos} className={"crit-row" + (isOpen ? " open" : "") + (r.pos <= 3 ? " top" : "")}>
              <button
                type="button"
                className="crit-row-main"
                aria-expanded={isOpen}
                onClick={() => {
                  if (!isOpen) track("criteria_place", { place: r.name });
                  setOpen(isOpen ? null : r.pos);
                }}
              >
                <span className="crit-pos">{r.pos}</span>
                <span className="crit-place">
                  <b>{r.name}</b>
                  <Move prev={s.prev} pos={r.pos} c={c} />
                </span>
                <span className="crit-stars">
                  <span title="Google">G ★ {s.google.toFixed(1)}</span>
                  <span title="Yelp">{s.noYelp ? c.noYelp : `Y ★ ${s.yelp.toFixed(1)}`}</span>
                </span>
                <span className="crit-badges" aria-hidden="true">
                  {s.award && <Icon name="award" size={17} />}
                  {s.influencer && <Icon name="influencer" size={17} />}
                  {s.community && <Icon name="community" size={17} />}
                </span>
                <span className="crit-total">
                  <i style={{ width: `${(s.total / m.max) * 100}%` }} />
                  <b>{s.total.toFixed(1)}</b>
                </span>
              </button>
              {isOpen && (
                <div className="crit-break">
                  <div className="crit-break-line">
                    <span>
                      Google ★ {s.google.toFixed(1)}
                      {s.gReviews != null && ` · ${fmtN(s.gReviews)} ${c.reviewsWord}`}
                      {f < 1 && ` · ×${f}`}
                    </span>
                    <b>{((s.google / 5) * m.google * f).toFixed(1)}</b>
                  </div>
                  <div className="crit-break-line">
                    <span>
                      {s.noYelp ? c.yelpNeutral : `Yelp ★ ${s.yelp.toFixed(1)}`}
                      {!s.noYelp && s.yReviews != null && ` · ${fmtN(s.yReviews)} ${c.reviewsWord}`}
                    </span>
                    <b>{((s.yelp / 5) * m.yelp).toFixed(1)}</b>
                  </div>
                  {s.award && (
                    <div className="crit-break-line bonus">
                      <span>
                        <Icon name="award" size={16} /> {c.bonus.award.short}
                        {typeof s.award === "string" && `: ${s.award}`}
                      </span>
                      <b>+{m.award}</b>
                    </div>
                  )}
                  {s.influencer && (
                    <div className="crit-break-line bonus">
                      <span>
                        <Icon name="influencer" size={16} /> {c.bonus.influencer.short}
                      </span>
                      <b>+{m.influencer}</b>
                    </div>
                  )}
                  {s.community && (
                    <div className="crit-break-line bonus">
                      <span>
                        <Icon name="community" size={16} /> {c.bonus.community.short}
                      </span>
                      <b>+{m.community}</b>
                    </div>
                  )}
                  <div className="crit-break-line total">
                    <span>{c.totalWord}</span>
                    <b>{s.total.toFixed(1)}</b>
                  </div>
                  {f < 1 && <p className="crit-break-note">{f === 0.92 ? c.factorLow : c.factorMid}</p>}
                  {multi && <p className="crit-break-note">{c.multiNote}</p>}
                </div>
              )}
            </li>
          );
        })}
        {shown.length === 0 && <li className="crit-empty">{c.noMatch}</li>}
      </ol>
      <p className="crit-legend">
        <span className="crit-move up">▲</span> {c.legendUp} · <span className="crit-move down">▼</span> {c.legendDown} ·{" "}
        <span className="crit-move new">{c.newTag}</span> {c.legendNew}
      </p>
    </div>
  );
}

export default function RankingCriteria({ c, ranking, items, label, method, onClose }) {
  const m = method || DEFAULT_METHOD;
  const parts = [
    { key: "google", pts: m.google, tone: "c-google" },
    { key: "yelp", pts: m.yelp, tone: "c-yelp" },
  ];
  const bonuses = [
    { key: "award", pts: m.award },
    { key: "influencer", pts: m.influencer },
    { key: "community", pts: m.community },
  ];
  const [active, setActive] = useState("google");
  const [google, setGoogle] = useState(4.5);
  const [yelp, setYelp] = useState(4.0);
  const [reviews, setReviews] = useState(1);
  const [award, setAward] = useState(false);
  const [influencer, setInfluencer] = useState(false);
  const [community, setCommunity] = useState(false);
  const touched = useRef(false);
  const panel = useRef(null);
  const hasScores = Array.isArray(items) && items.length > 0 && items.every((it) => it.score);

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

  const total =
    (google / 5) * m.google * (m.reviewFactor ? reviews : 1) +
    (yelp / 5) * m.yelp +
    (award ? m.award : 0) +
    (influencer ? m.influencer : 0) +
    (community ? m.community : 0);

  const tried = () => {
    if (touched.current) return;
    touched.current = true;
    track("criteria_simulate", { ranking });
  };

  const info = c.parts[active] || c.bonus[active];
  const activePts = parts.find((p) => p.key === active)?.pts ?? bonuses.find((b) => b.key === active)?.pts;
  const isBonus = bonuses.some((b) => b.key === active);
  const perTenth = +(m.google / 50).toFixed(2);

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

        {/* 1. What counts: a bar you can tap, plus the bonus chips. */}
        <div className="crit-bar-wrap">
          <div className="crit-bar" role="tablist" aria-label={c.barLabel}>
            {parts.map((p) => (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={active === p.key}
                className={`crit-seg ${p.tone}${active === p.key ? " on" : ""}`}
                style={{ flexGrow: p.pts }}
                onClick={() => setActive(p.key)}
              >
                <span className="crit-seg-pts">{p.pts}%</span>
                <span className="crit-seg-name">{c.parts[p.key].short}</span>
              </button>
            ))}
          </div>
          <div className="crit-bonus" role="tablist" aria-label={c.bonusLabel}>
            {bonuses.map((b) => (
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
            <p className="crit-detail-pts">{isBonus ? `+${activePts} ${c.bonusWord}` : `${activePts}% ${c.ptsWord}`}</p>
            <h3>{info.h}</h3>
            <p>{info.p}</p>
            {active === "google" && m.reviewFactor && <p className="crit-detail-extra">{c.factorNote}</p>}
          </div>
        </div>

        {/* 2. Every place with its score, when this ranking has them. */}
        {hasScores && <Scores c={c} m={m} items={items} label={label} />}

        {/* 3. Try it: move the stars and watch the score. */}
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
              {m.reviewFactor && (
                <div className="crit-seg-pick">
                  <span>{c.simReviews}</span>
                  <div role="group" aria-label={c.simReviews}>
                    {[
                      [0.92, c.revLow],
                      [0.95, c.revMid],
                      [1, c.revHigh],
                    ].map(([v, text]) => (
                      <button
                        key={v}
                        type="button"
                        className={reviews === v ? "on" : ""}
                        aria-pressed={reviews === v}
                        onClick={() => {
                          tried();
                          setReviews(v);
                        }}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              <div className="crit-toggles">
                {[
                  [award, setAward, c.simAward, "award", m.award],
                  [influencer, setInfluencer, c.simInfluencers, "influencer", m.influencer],
                  [community, setCommunity, c.simCommunity, "community", m.community],
                ].map(([on, set, text, icon, pts]) => (
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
                    <span>{text}</span>
                    <b>+{pts}</b>
                  </button>
                ))}
              </div>
            </div>
            <div className="crit-sim-out">
              <Score value={total} max={m.max} label={c.simOf.replace("{max}", m.max)} />
              <p className="crit-tip">{c.simTip.replace("{x}", perTenth)}</p>
            </div>
          </div>
        </div>

        {/* 4. The rules nobody can buy their way around. */}
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
