import { useEffect, useState } from "react";

/* Small pieces shared by the admin screens. */

export function Bars({ title, items, onPick, empty = "Sin datos todavía." }) {
  const max = Math.max(1, ...items.map((i) => i.n));
  return (
    <section className="adm-card">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="adm-empty">{empty}</p>
      ) : (
        <ul className="adm-bars">
          {items.map((i) => (
            <li key={i.key}>
              <button type="button" disabled={!onPick} onClick={() => onPick?.(i.key)}>
                <span className="adm-bar-label">{i.label}</span>
                <span className="adm-bar-track">
                  <i style={{ width: `${Math.max(4, (i.n / max) * 100)}%` }} />
                </span>
                <b>{i.n}</b>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function useNarrow() {
  const q = "(max-width: 639px)";
  const [narrow, setNarrow] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setNarrow(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return narrow;
}

/** A number with a label. `tone` ("up" / "down") colours the small line under it. */
export function Kpi({ n, label, sub, tone, onClick }) {
  return (
    <button type="button" className="adm-kpi" onClick={onClick} disabled={!onClick}>
      <b>{n}</b>
      <span>{label}</span>
      <small className={tone ? `adm-${tone}` : ""}>{sub}</small>
    </button>
  );
}
