import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase.js";
import { RANKINGS } from "./rankings.js";
import "./admin.css";

/* eltoaster.com/admin — private panel for the site owner.
 *
 * Access is enforced in the database, not here: every read goes through a
 * row-level-security policy that only passes for a signed-in, confirmed email
 * listed in public.admin_users (see supabase/migrations/20261121_admin_panel.sql).
 * This file only decides what to show. Spanish only: it is for one reader. */

// `import.meta.env.DEV` is a literal false in the live build, so every branch behind DEMO is dropped there.
const DEMO_QS = new URLSearchParams(window.location.search).has("demo");
const TZ = "America/Phoenix";
const LOGIN_FLAG = "adminLogin";

const SOURCES = {
  diagnostico: { label: "Diagnóstico", color: "var(--c-diag)" },
  calculadora: { label: "Calculadora", color: "var(--c-calc)" },
  rankings: { label: "Rankings", color: "var(--c-rank)" },
  newsletter: { label: "Newsletter", color: "var(--c-news)" },
};
const SRC_KEYS = Object.keys(SOURCES);

const TYPE_LABEL = {
  taco_shop: "Taquería",
  coffee_shop: "Cafetería",
  full_service_casual: "Restaurante casual",
  full_service_fine_dining: "Alta cocina",
  food_truck: "Food truck",
  mariscos_seafood: "Mariscos",
  full_service_with_bar: "Restaurante con bar",
};
const RANK_LABEL = Object.fromEntries((RANKINGS.phoenix || []).map((c) => [c.id, c.label.es]));
const REPORT_STATUS = {
  pending: ["En cola", "muted"],
  researching: ["Investigando", "muted"],
  awaiting_review: ["Por aprobar", "warn"],
  approved: ["Aprobado", "ok"],
  sent: ["Enviado", "ok"],
  rejected: ["Rechazado", "bad"],
  failed: ["Falló", "bad"],
};
const NEWS_SOURCE = {
  footer: "Formulario del sitio",
  diagnostic: "Pidió diagnóstico",
  seed: "Interno",
  optout: "Solo registró su baja",
};
const REQUEST_TYPE = { access: "Ver sus datos", deletion: "Borrar sus datos", opt_out: "No vender sus datos", correction: "Corregir sus datos" };
const REQUEST_STATUS = { pending: "Pendiente", in_progress: "En proceso", completed: "Completada", denied: "Negada" };

const PRESETS = [
  ["all", "Todos", "Todas las personas, sin repetir: cada correo aparece una sola vez aunque se haya registrado en varios lugares."],
  ["owners", "Dueños (diagnóstico)", "Llenaron el formulario de diagnóstico gratis: dueños o gerentes de restaurante."],
  ["calc", "Calculadora", "Desbloquearon la calculadora con nombre, correo y teléfono."],
  ["rank", "Rankings", "Pidieron el PDF de un ranking."],
  ["news", "Newsletter activo", "Están suscritos y reciben tu newsletter."],
  ["hot", "Calientes", "Aparecen en 2 o más de: diagnóstico, calculadora y rankings. Son los más interesados."],
  ["phone", "Con teléfono", "Dejaron un teléfono (diagnóstico o calculadora): los puedes llamar."],
  ["baja", "Dados de baja", "Se dieron de baja del newsletter. No les escribas."],
];

/* ---------- data ---------- */

async function fetchAll(table, cols) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from(table)
      .select(cols)
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return rows;
}

async function loadAll() {
  const [leads, reports, calcs, ranks, subs, privacy] = await Promise.all([
    fetchAll(
      "leads",
      "id,created_at,restaurant_name,contact_name,email,phone,city,biggest_challenge,preferred_language,source,marketing_consent,zip_code,street_address,google_maps_url,annual_revenue,restaurant_type,locations"
    ),
    fetchAll("diagnostic_reports", "id,lead_id,status,weighted_score,created_at,sent_at,rejected_reason"),
    fetchAll("calculator_leads", "id,created_at,name,email,phone,preferred_language"),
    fetchAll("ranking_leads", "id,created_at,name,email,city,preferred_language,category"),
    fetchAll("newsletter_subscribers", "id,created_at,email,lang,source,unsubscribed_at,unsubscribe_reason,is_test,welcomed_at"),
    fetchAll("privacy_requests", "id,created_at,request_type,email,details,status,resolved_at"),
  ]);
  return { leads, reports, calcs, ranks, subs, privacy, loadedAt: new Date() };
}

const normCity = (c) => (c || "").trim().toLowerCase().replace(/\s+/g, " ");
const titleCase = (s) => s.replace(/\b\p{L}/gu, (m) => m.toUpperCase());

/* One person per email, with every place they showed up. */
function buildPeople(data, myEmail) {
  const map = new Map();
  const get = (email, create = true) => {
    const key = (email || "").trim().toLowerCase();
    if (!key) return null;
    let p = map.get(key);
    if (!p && create) {
      p = {
        email: key, name: "", phone: "", restaurant: "", city: "", type: "", lang: "",
        sources: new Set(), leads: [], calcs: [], ranks: [], sub: null, privacy: [],
        first: null, last: null, test: false, newsletter: "no",
      };
      map.set(key, p);
    }
    return p;
  };
  const seen = (p, at) => {
    if (!p.first || at < p.first) p.first = at;
    if (!p.last || at > p.last) p.last = at;
  };

  const reportOf = {};
  for (const r of data.reports) if (!reportOf[r.lead_id]) reportOf[r.lead_id] = r; // newest first

  for (const l of data.leads) {
    const p = get(l.email);
    p.sources.add("diagnostico");
    p.leads.push({ ...l, report: reportOf[l.id] || null });
    p.name ||= l.contact_name || "";
    p.phone ||= l.phone || "";
    p.restaurant ||= l.restaurant_name || "";
    p.city ||= normCity(l.city);
    p.type ||= l.restaurant_type || "";
    p.lang ||= l.preferred_language || "";
    seen(p, l.created_at);
  }
  for (const c of data.calcs) {
    const p = get(c.email);
    p.sources.add("calculadora");
    p.calcs.push(c);
    p.name ||= c.name || "";
    p.phone ||= c.phone || "";
    p.lang ||= c.preferred_language || "";
    seen(p, c.created_at);
  }
  for (const r of data.ranks) {
    const p = get(r.email);
    p.sources.add("rankings");
    p.ranks.push(r);
    p.name ||= r.name || "";
    p.city ||= normCity(r.city);
    p.lang ||= r.preferred_language || "";
    seen(p, r.created_at);
  }
  for (const s of data.subs) {
    const p = get(s.email);
    p.sub = s;
    if (s.source !== "optout") p.sources.add("newsletter");
    p.newsletter = s.unsubscribed_at ? "baja" : "activo";
    p.lang ||= s.lang || "";
    if (s.is_test) p.test = true;
    seen(p, s.created_at);
  }
  for (const r of data.privacy) {
    const p = get(r.email, false);
    if (p) p.privacy.push(r);
  }

  const mine = (myEmail || "").toLowerCase();
  for (const p of map.values()) {
    if (p.email.endsWith("@example.com") || (mine && p.email === mine)) p.test = true;
  }
  return [...map.values()].sort((a, b) => (a.last < b.last ? 1 : -1));
}

const intent = (p) => ["diagnostico", "calculadora", "rankings"].filter((k) => p.sources.has(k)).length;
const PRESET_TEST = {
  all: () => true,
  owners: (p) => p.sources.has("diagnostico"),
  calc: (p) => p.sources.has("calculadora"),
  rank: (p) => p.sources.has("rankings"),
  news: (p) => p.newsletter === "activo" && !p.sub?.is_test,
  hot: (p) => intent(p) >= 2,
  phone: (p) => Boolean(p.phone),
  baja: (p) => p.newsletter === "baja",
};

/* ---------- small helpers ---------- */

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-US", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("es-US", { timeZone: TZ, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "—";
function ago(iso) {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "hoy";
  if (d === 1) return "ayer";
  if (d < 30) return `hace ${d} días`;
  if (d < 365) return `hace ${Math.round(d / 30)} m`;
  return `hace ${Math.round(d / 365)} a`;
}
const dayKey = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
const digits = (s) => (s || "").replace(/\D/g, "");
const waLink = (phone) => {
  const d = digits(phone);
  return d ? `https://wa.me/${d.length === 10 ? "1" + d : d}` : null;
};
const personLabel = (p) => p.name || p.email.split("@")[0];
const cityLabel = (c) => (c ? titleCase(c) : "");

function csvCell(v) {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // keep spreadsheets from running pasted formulas
  return `"${s.replace(/"/g, '""')}"`;
}
function downloadCsv(people) {
  const head = ["Correo", "Nombre", "Teléfono", "Restaurante", "Tipo", "Ciudad", "Idioma", "Fuentes", "Newsletter", "Primer registro", "Última actividad"];
  const rows = people.map((p) => [
    p.email, p.name, p.phone, p.restaurant, TYPE_LABEL[p.type] || p.type, cityLabel(p.city), p.lang,
    SRC_KEYS.filter((k) => p.sources.has(k)).map((k) => SOURCES[k].label).join(" + "),
    p.newsletter === "activo" ? "Activo" : p.newsletter === "baja" ? "Baja" : "No",
    p.first, p.last,
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `personas-eltoaster-${dayKey(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- pieces ---------- */

function SrcTag({ k }) {
  return (
    <span className="adm-tag" style={{ "--tag": SOURCES[k].color }}>
      {SOURCES[k].label}
    </span>
  );
}

function NewsChip({ p }) {
  if (p.sub?.is_test) return <span className="adm-chip muted">Prueba</span>;
  if (p.newsletter === "activo") return <span className="adm-chip ok">Activo</span>;
  if (p.newsletter === "baja") return <span className="adm-chip bad">Baja</span>;
  return <span className="adm-dash">—</span>;
}

function Bars({ title, items, onPick, empty = "Sin datos todavía." }) {
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

function useNarrow() {
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

function Chart({ people }) {
  // Phones get two weeks in a narrower drawing so the labels stay readable.
  const narrow = useNarrow();
  const days = narrow ? 14 : 30;
  const keys = [];
  for (let i = days - 1; i >= 0; i--) keys.push(dayKey(Date.now() - i * 86400000));
  const rows = keys.map((k) => ({ k, diagnostico: 0, calculadora: 0, rankings: 0, newsletter: 0 }));
  const at = Object.fromEntries(rows.map((r) => [r.k, r]));
  const add = (src, iso) => {
    const r = at[dayKey(iso)];
    if (r) r[src] += 1;
  };
  for (const p of people) {
    p.leads.forEach((x) => add("diagnostico", x.created_at));
    p.calcs.forEach((x) => add("calculadora", x.created_at));
    p.ranks.forEach((x) => add("rankings", x.created_at));
    if (p.sub && p.sub.source !== "optout") add("newsletter", p.sub.created_at);
  }
  const totals = rows.map((r) => SRC_KEYS.reduce((n, k) => n + r[k], 0));
  const total = totals.reduce((a, b) => a + b, 0);
  const top = Math.max(4, ...totals);
  const W = narrow ? 360 : 720, H = narrow ? 170 : 190, L = 24, B = 22, T = 8;
  const bw = (W - L) / days;
  const y = (v) => T + (H - T - B) * (1 - v / top);

  return (
    <section className="adm-card adm-chart">
      <div className="adm-chart-head">
        <h3>Registros por día · últimos {days} días</h3>
        <span>{total} en total</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Registros por día, últimos ${days} días`}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={L} x2={W} y1={y(top * f)} y2={y(top * f)} className="adm-grid" />
            <text x={L - 6} y={y(top * f) + 4} textAnchor="end" className="adm-axis">
              {Math.round(top * f)}
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          let acc = 0;
          return (
            <g key={r.k}>
              <title>{`${r.k}: ${totals[i]}`}</title>
              {SRC_KEYS.map((k) => {
                if (!r[k]) return null;
                const y1 = y(acc + r[k]);
                const h = y(acc) - y1;
                acc += r[k];
                return <rect key={k} x={L + i * bw + 2} y={y1} width={bw - 4} height={h} rx="2" fill={SOURCES[k].color} />;
              })}
              {i % (narrow ? 3 : 5) === 0 || i === days - 1 ? (
                <text x={L + i * bw + bw / 2} y={H - 6} textAnchor="middle" className="adm-axis">
                  {r.k.slice(5).replace("-", "/")}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <ul className="adm-legend">
        {SRC_KEYS.map((k) => (
          <li key={k}>
            <i style={{ background: SOURCES[k].color }} />
            {SOURCES[k].label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Field({ k, children }) {
  if (children === null || children === undefined || children === "" || children === false) return null;
  return (
    <div className="adm-field">
      <dt>{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Detail({ p, onClose }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(p.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the address is on screen */
    }
  };
  const wa = waLink(p.phone);

  return (
    <div className="adm-overlay" onClick={onClose}>
      <aside className="adm-drawer" role="dialog" aria-label={personLabel(p)} onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <h2>{personLabel(p)}</h2>
            <p>{p.email}</p>
          </div>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className="adm-actions">
          <a className="adm-btn" href={`mailto:${p.email}`}>Escribir correo</a>
          {p.phone ? <a className="adm-btn" href={`tel:${digits(p.phone)}`}>Llamar</a> : null}
          {wa ? <a className="adm-btn" href={wa} target="_blank" rel="noreferrer">WhatsApp</a> : null}
          <button type="button" className="adm-btn ghost" onClick={copy}>{copied ? "Copiado" : "Copiar correo"}</button>
        </div>

        <div className="adm-tags">
          {SRC_KEYS.filter((k) => p.sources.has(k)).map((k) => <SrcTag key={k} k={k} />)}
          <NewsChip p={p} />
        </div>

        <dl className="adm-fields">
          <Field k="Teléfono">{p.phone}</Field>
          <Field k="Idioma">{p.lang === "en" ? "Inglés" : p.lang === "es" ? "Español" : p.lang}</Field>
          <Field k="Primer registro">{fmtTime(p.first)}</Field>
          <Field k="Última actividad">{fmtTime(p.last)}</Field>
        </dl>

        {p.leads.map((l) => {
          const st = l.report ? REPORT_STATUS[l.report.status] || [l.report.status, "muted"] : null;
          return (
            <section key={l.id} className="adm-block">
              <h4>Diagnóstico gratis · {fmt(l.created_at)}</h4>
              <dl className="adm-fields">
                <Field k="Restaurante">{l.restaurant_name}</Field>
                <Field k="Tipo">{TYPE_LABEL[l.restaurant_type] || l.restaurant_type}</Field>
                <Field k="Dirección">{[l.street_address, cityLabel(normCity(l.city)), l.zip_code].filter(Boolean).join(", ")}</Field>
                <Field k="Google Maps">
                  {l.google_maps_url ? <a href={l.google_maps_url} target="_blank" rel="noreferrer">Abrir ficha</a> : null}
                </Field>
                <Field k="Ventas al año">{l.annual_revenue}</Field>
                <Field k="Su mayor reto">{l.biggest_challenge}</Field>
                <Field k="Acepta marketing">{l.marketing_consent ? "Sí" : "No"}</Field>
                <Field k="Reporte">
                  {st ? <span className={`adm-chip ${st[1]}`}>{st[0]}</span> : null}
                  {l.report?.weighted_score ? ` · calificación ${Number(l.report.weighted_score).toFixed(1)}` : ""}
                </Field>
                <Field k="Motivo del rechazo">{l.report?.rejected_reason}</Field>
              </dl>
            </section>
          );
        })}

        {p.calcs.map((c) => (
          <section key={c.id} className="adm-block">
            <h4>Calculadora · {fmt(c.created_at)}</h4>
            <dl className="adm-fields">
              <Field k="Nombre">{c.name}</Field>
              <Field k="Teléfono">{c.phone}</Field>
            </dl>
          </section>
        ))}

        {p.ranks.length ? (
          <section className="adm-block">
            <h4>Rankings que pidió</h4>
            <ul className="adm-plain">
              {p.ranks.map((r) => (
                <li key={r.id}>
                  {RANK_LABEL[r.category] || (r.category ? r.category : "Categoría sin registrar")} · {cityLabel(r.city)} · {fmt(r.created_at)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {p.sub ? (
          <section className="adm-block">
            <h4>Newsletter</h4>
            <dl className="adm-fields">
              <Field k="Estado">{p.sub.unsubscribed_at ? `Baja el ${fmt(p.sub.unsubscribed_at)}` : "Suscrito y activo"}</Field>
              <Field k="Llegó por">{NEWS_SOURCE[p.sub.source] || p.sub.source}</Field>
              <Field k="Se unió">{fmt(p.sub.created_at)}</Field>
              <Field k="Motivo de la baja">{p.sub.unsubscribe_reason}</Field>
              <Field k="Correo de bienvenida">{p.sub.welcomed_at ? fmt(p.sub.welcomed_at) : "Sin enviar"}</Field>
              <Field k="Es prueba">{p.sub.is_test ? "Sí" : null}</Field>
            </dl>
          </section>
        ) : null}

        {p.privacy.length ? (
          <section className="adm-block">
            <h4>Solicitudes de privacidad</h4>
            <ul className="adm-plain">
              {p.privacy.map((r) => (
                <li key={r.id}>
                  {REQUEST_TYPE[r.request_type] || r.request_type} · {REQUEST_STATUS[r.status] || r.status} · {fmt(r.created_at)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </aside>
    </div>
  );
}

/* ---------- sign in ---------- */

function SignIn({ denied, email, onSignOut }) {
  const [mode, setMode] = useState("password"); // password | link
  const [val, setVal] = useState("");
  const [pass, setPass] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const [msg, setMsg] = useState("");

  if (denied) {
    return (
      <div className="adm-gate">
        <h1>Sin acceso</h1>
        <p>
          <b>{email}</b> no está en la lista de administradores de este sitio.
        </p>
        <button type="button" className="adm-btn" onClick={onSignOut}>Salir</button>
      </div>
    );
  }

  const fail = (text) => {
    setState("error");
    setMsg(text);
  };

  const signInPassword = async (e) => {
    e.preventDefault();
    if (!supabase) return fail("El sitio no tiene conexión a la base de datos en este entorno.");
    setState("sending");
    const { error } = await supabase.auth.signInWithPassword({ email: val.trim(), password: pass });
    // On success the auth listener in Admin() takes over and swaps this screen out.
    if (error) {
      const bad = /invalid login|invalid credentials/i.test(error.message);
      fail(bad ? "Correo o contraseña incorrectos." : error.message);
    }
  };

  const sendLink = async (e) => {
    e.preventDefault();
    if (!supabase) return fail("El sitio no tiene conexión a la base de datos en este entorno.");
    setState("sending");
    try {
      localStorage.setItem(LOGIN_FLAG, "1");
    } catch {
      /* storage blocked: the link still signs in, it just lands on the home page */
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: val.trim(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) {
      const limited = /rate limit/i.test(error.message);
      return fail(limited ? "Se llegó al límite de correos de Supabase. Entra con tu contraseña o espera una hora." : error.message);
    }
    setState("sent");
  };

  const swap = (m) => {
    setMode(m);
    setState("idle");
    setMsg("");
  };

  return (
    <div className="adm-gate">
      <span className="adm-badge">Privado</span>
      <h1>Panel de El Toaster</h1>
      {state === "sent" ? (
        <p>
          Te mandé un enlace a <b>{val.trim()}</b>. Ábrelo en este mismo navegador y entras directo. Si no llega en un minuto, revisa
          spam.
        </p>
      ) : (
        <form onSubmit={mode === "password" ? signInPassword : sendLink}>
          <p>
            {mode === "password"
              ? "Entra con tu correo de administrador y tu contraseña."
              : "Escribe tu correo de administrador y te mando un enlace para entrar."}
          </p>
          <label htmlFor="adm-email">Correo</label>
          <input
            id="adm-email"
            type="email"
            autoComplete="email"
            required
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="tu@correo.com"
          />
          {mode === "password" ? (
            <>
              <label htmlFor="adm-pass">Contraseña</label>
              <input
                id="adm-pass"
                type="password"
                autoComplete="current-password"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </>
          ) : null}
          <button className="adm-btn solid" disabled={state === "sending"}>
            {state === "sending" ? "Entrando…" : mode === "password" ? "Entrar" : "Enviarme el enlace"}
          </button>
          {state === "error" ? <p className="adm-err">{msg}</p> : null}
          <button type="button" className="adm-link adm-swap" onClick={() => swap(mode === "password" ? "link" : "password")}>
            {mode === "password" ? "Prefiero que me mande un enlace" : "Mejor uso mi contraseña"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ---------- panel ---------- */

const FILTERS0 = { q: "", preset: "all", lang: "", type: "", city: "", news: "", period: "", rank: "" };

function Panel({ data, myEmail, reload, loading, loadError, onSignOut }) {
  const [tab, setTab] = useState("resumen");
  const [hideTests, setHideTests] = useState(true);
  const [f, setF] = useState(FILTERS0);
  const [dq, setDq] = useState({ q: "", status: "" });
  const [sel, setSel] = useState(null);
  const [limit, setLimit] = useState(50);

  const all = useMemo(() => buildPeople(data, myEmail), [data, myEmail]);
  const people = useMemo(() => (hideTests ? all.filter((p) => !p.test) : all), [all, hideTests]);
  const hiddenCount = all.length - people.length;
  const byEmail = useMemo(() => Object.fromEntries(all.map((p) => [p.email, p])), [all]);

  useEffect(() => setLimit(50), [f, dq, hideTests, tab]);

  const set = (patch) => setF((s) => ({ ...s, ...patch }));
  const go = (patch) => {
    setF({ ...FILTERS0, ...patch });
    setTab("personas");
  };

  /* Resumen */
  const stats = useMemo(() => {
    const now = Date.now();
    const within = (p, days) => p.first && now - new Date(p.first).getTime() <= days * 86400000;
    const count = (fn) => people.filter(fn).length;
    const tally = (list, key, label) => {
      const m = new Map();
      list.forEach((x) => {
        const k = key(x);
        if (k) m.set(k, (m.get(k) || 0) + 1);
      });
      return [...m.entries()].map(([k, n]) => ({ key: k, label: label(k), n })).sort((a, b) => b.n - a.n);
    };
    const leadsAll = people.flatMap((p) => p.leads);
    return {
      total: people.length,
      week: count((p) => within(p, 7)),
      month: count((p) => within(p, 30)),
      owners: count(PRESET_TEST.owners),
      calc: count(PRESET_TEST.calc),
      rank: count(PRESET_TEST.rank),
      news: count(PRESET_TEST.news),
      hot: count(PRESET_TEST.hot),
      review: leadsAll.filter((l) => l.report?.status === "awaiting_review").length,
      types: tally(people.filter((p) => p.type), (p) => p.type, (k) => TYPE_LABEL[k] || k).slice(0, 8),
      cities: tally(people, (p) => p.city, cityLabel).slice(0, 8),
      langs: tally(people, (p) => p.lang, (k) => (k === "en" ? "Inglés" : "Español")),
      ranks: tally(people.flatMap((p) => p.ranks), (r) => r.category || "—", (k) => RANK_LABEL[k] || "Sin registrar"),
      newsSrc: tally(people.filter((p) => p.sub), (p) => p.sub.source, (k) => NEWS_SOURCE[k] || k),
    };
  }, [people]);

  /* Personas */
  const facets = useMemo(() => {
    const uniq = (fn) => [...new Set(people.map(fn).filter(Boolean))];
    return {
      types: uniq((p) => p.type),
      cities: uniq((p) => p.city).sort(),
      ranks: [...new Set(people.flatMap((p) => p.ranks.map((r) => r.category)).filter(Boolean))],
    };
  }, [people]);

  const filtered = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const cut = f.period ? Date.now() - Number(f.period) * 86400000 : 0;
    return people.filter((p) => {
      if (!PRESET_TEST[f.preset](p)) return false;
      if (f.lang && p.lang !== f.lang) return false;
      if (f.type && p.type !== f.type) return false;
      if (f.city && p.city !== f.city) return false;
      if (f.news && p.newsletter !== f.news) return false;
      if (f.rank && !p.ranks.some((r) => r.category === f.rank)) return false;
      if (cut && new Date(p.first).getTime() < cut) return false;
      if (q) {
        const hay = [p.email, p.name, p.phone, p.restaurant, ...p.leads.map((l) => l.restaurant_name)].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [people, f]);

  /* Diagnósticos */
  const diag = useMemo(() => {
    const q = dq.q.trim().toLowerCase();
    return people
      .flatMap((p) => p.leads.map((l) => ({ ...l, p })))
      .filter((l) => {
        if (dq.status === "none" ? l.report : dq.status && l.report?.status !== dq.status) return false;
        if (!q) return true;
        return [l.restaurant_name, l.contact_name, l.email, l.city].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [people, dq]);

  const tabs = [
    ["resumen", "Resumen"],
    ["personas", `Personas · ${people.length}`],
    ["diagnosticos", `Diagnósticos · ${people.flatMap((p) => p.leads).length}`],
    ["privacidad", `Privacidad · ${data.privacy.length}`],
  ];
  const help = PRESETS.find((x) => x[0] === f.preset)?.[2];
  const filtersOn = JSON.stringify({ ...f, q: "", preset: "all" }) !== JSON.stringify({ ...FILTERS0, q: "", preset: "all" }) || f.q || f.preset !== "all";

  return (
    <div className="adm">
      <header className="adm-top">
        <div>
          <h1>Panel de El Toaster</h1>
          <p>
            {myEmail} · actualizado {fmtTime(data.loadedAt)}
          </p>
        </div>
        <div className="adm-top-btns">
          <button type="button" className="adm-btn" onClick={reload} disabled={loading}>{loading ? "Actualizando…" : "Actualizar"}</button>
          <button type="button" className="adm-btn ghost" onClick={onSignOut}>Salir</button>
        </div>
      </header>

      {loadError ? <p className="adm-err adm-banner">No pude cargar todo: {loadError}</p> : null}

      <nav className="adm-tabs" aria-label="Secciones">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>
      <label className="adm-check">
        <input type="checkbox" checked={hideTests} onChange={(e) => setHideTests(e.target.checked)} />
        Ocultar pruebas (tu correo y @example.com){hiddenCount ? ` · ${hiddenCount} ocultas` : ""}
      </label>

      {tab === "resumen" ? (
        <div className="adm-stack">
          <div className="adm-kpis">
            <Kpi n={stats.total} label="Personas únicas" sub={`+${stats.week} esta semana · +${stats.month} este mes`} onClick={() => go({})} />
            <Kpi n={stats.owners} label="Dueños (diagnóstico)" sub={stats.review ? `${stats.review} reporte(s) por aprobar` : "Ningún reporte por aprobar"} onClick={() => go({ preset: "owners" })} />
            <Kpi n={stats.calc} label="Calculadora" sub="Con teléfono" onClick={() => go({ preset: "calc" })} />
            <Kpi n={stats.rank} label="Rankings" sub="Pidieron el PDF" onClick={() => go({ preset: "rank" })} />
            <Kpi n={stats.news} label="Newsletter activo" sub="Reciben tu correo" onClick={() => go({ preset: "news" })} />
            <Kpi n={stats.hot} label="Calientes" sub="En 2+ fuentes" onClick={() => go({ preset: "hot" })} />
          </div>
          <Chart people={people} />
          <div className="adm-grid2">
            <Bars title="Tipo de restaurante" items={stats.types} onPick={(k) => go({ type: k })} empty="Aparece cuando alguien pide diagnóstico." />
            <Bars title="Ciudad" items={stats.cities} onPick={(k) => go({ city: k })} />
            <Bars title="Ranking que más piden" items={stats.ranks} onPick={(k) => k !== "—" && go({ rank: k })} empty="Todavía nadie pide un ranking con categoría." />
            <Bars title="Idioma" items={stats.langs} onPick={(k) => go({ lang: k })} />
            <Bars title="Cómo llegaron al newsletter" items={stats.newsSrc} />
          </div>
        </div>
      ) : null}

      {tab === "personas" ? (
        <div className="adm-stack">
          <div className="adm-chips" role="tablist" aria-label="Segmentos">
            {PRESETS.map(([id, label]) => (
              <button key={id} type="button" className={f.preset === id ? "on" : ""} onClick={() => set({ preset: id })}>
                {label}
                <small>{people.filter(PRESET_TEST[id]).length}</small>
              </button>
            ))}
          </div>
          {help ? <p className="adm-help">{help}</p> : null}

          <div className="adm-filters">
            <input type="search" placeholder="Buscar nombre, correo, teléfono o restaurante" value={f.q} onChange={(e) => set({ q: e.target.value })} aria-label="Buscar" />
            <select value={f.type} onChange={(e) => set({ type: e.target.value })} aria-label="Tipo de restaurante">
              <option value="">Todo tipo de restaurante</option>
              {facets.types.map((t) => <option key={t} value={t}>{TYPE_LABEL[t] || t}</option>)}
            </select>
            <select value={f.city} onChange={(e) => set({ city: e.target.value })} aria-label="Ciudad">
              <option value="">Todas las ciudades</option>
              {facets.cities.map((c) => <option key={c} value={c}>{cityLabel(c)}</option>)}
            </select>
            <select value={f.rank} onChange={(e) => set({ rank: e.target.value })} aria-label="Ranking pedido">
              <option value="">Cualquier ranking</option>
              {facets.ranks.map((r) => <option key={r} value={r}>{RANK_LABEL[r] || r}</option>)}
            </select>
            <select value={f.lang} onChange={(e) => set({ lang: e.target.value })} aria-label="Idioma">
              <option value="">Todo idioma</option>
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
            <select value={f.news} onChange={(e) => set({ news: e.target.value })} aria-label="Newsletter">
              <option value="">Newsletter: todos</option>
              <option value="activo">Suscritos</option>
              <option value="baja">Dados de baja</option>
              <option value="no">No suscritos</option>
            </select>
            <select value={f.period} onChange={(e) => set({ period: e.target.value })} aria-label="Se registraron">
              <option value="">Cualquier fecha</option>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
          </div>

          <div className="adm-listbar">
            <span>
              <b>{filtered.length}</b> {filtered.length === 1 ? "persona" : "personas"}
              {filtersOn ? (
                <button type="button" className="adm-link" onClick={() => setF(FILTERS0)}>Limpiar filtros</button>
              ) : null}
            </span>
            <button type="button" className="adm-btn" disabled={!filtered.length} onClick={() => downloadCsv(filtered)}>
              Descargar CSV
            </button>
          </div>

          <div className="adm-list" role="list">
            <div className="adm-row adm-head" aria-hidden="true">
              <span>Persona</span><span>Restaurante</span><span>Fuentes</span><span>Newsletter</span><span>Registro</span>
            </div>
            {filtered.slice(0, limit).map((p) => (
              <button key={p.email} type="button" role="listitem" className="adm-row" onClick={() => setSel(p.email)}>
                <span className="adm-c adm-who">
                  <b>{personLabel(p)}</b>
                  <small>{p.email}</small>
                  {p.phone ? <small>{p.phone}</small> : null}
                </span>
                <span className="adm-c">
                  {p.restaurant || <span className="adm-dash">—</span>}
                  <small>{[TYPE_LABEL[p.type], cityLabel(p.city)].filter(Boolean).join(" · ")}</small>
                </span>
                <span className="adm-c adm-tags">
                  {SRC_KEYS.filter((k) => p.sources.has(k)).map((k) => <SrcTag key={k} k={k} />)}
                </span>
                <span className="adm-c"><NewsChip p={p} /></span>
                <span className="adm-c">
                  {fmt(p.first)}
                  <small>activo {ago(p.last)}</small>
                </span>
              </button>
            ))}
            {filtered.length === 0 ? <p className="adm-empty">Nadie coincide con estos filtros.</p> : null}
          </div>
          {filtered.length > limit ? (
            <button type="button" className="adm-btn more" onClick={() => setLimit((n) => n + 50)}>
              Mostrar más ({filtered.length - limit})
            </button>
          ) : null}
        </div>
      ) : null}

      {tab === "diagnosticos" ? (
        <div className="adm-stack">
          <div className="adm-filters two">
            <input type="search" placeholder="Buscar restaurante, contacto o ciudad" value={dq.q} onChange={(e) => setDq((s) => ({ ...s, q: e.target.value }))} aria-label="Buscar" />
            <select value={dq.status} onChange={(e) => setDq((s) => ({ ...s, status: e.target.value }))} aria-label="Estado del reporte">
              <option value="">Todos los reportes</option>
              {Object.entries(REPORT_STATUS).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
              <option value="none">Sin reporte</option>
            </select>
          </div>
          <div className="adm-listbar"><span><b>{diag.length}</b> {diag.length === 1 ? "solicitud" : "solicitudes"}</span></div>
          <div className="adm-list" role="list">
            <div className="adm-row adm-head diag" aria-hidden="true">
              <span>Restaurante</span><span>Contacto</span><span>Tipo y ciudad</span><span>Reporte</span><span>Fecha</span>
            </div>
            {diag.slice(0, limit).map((l) => {
              const st = l.report ? REPORT_STATUS[l.report.status] || [l.report.status, "muted"] : null;
              return (
                <button key={l.id} type="button" role="listitem" className="adm-row diag" onClick={() => setSel(l.p.email)}>
                  <span className="adm-c adm-who"><b>{l.restaurant_name}</b><small>{l.street_address}</small></span>
                  <span className="adm-c">{l.contact_name || "—"}<small>{l.email}</small>{l.phone ? <small>{l.phone}</small> : null}</span>
                  <span className="adm-c">{TYPE_LABEL[l.restaurant_type] || "—"}<small>{cityLabel(normCity(l.city))}</small></span>
                  <span className="adm-c">{st ? <span className={`adm-chip ${st[1]}`}>{st[0]}</span> : <span className="adm-dash">Sin reporte</span>}</span>
                  <span className="adm-c">{fmt(l.created_at)}<small>{ago(l.created_at)}</small></span>
                </button>
              );
            })}
            {diag.length === 0 ? <p className="adm-empty">Sin solicitudes con estos filtros.</p> : null}
          </div>
          {diag.length > limit ? (
            <button type="button" className="adm-btn more" onClick={() => setLimit((n) => n + 50)}>Mostrar más ({diag.length - limit})</button>
          ) : null}
        </div>
      ) : null}

      {tab === "privacidad" ? (
        <div className="adm-stack">
          <p className="adm-help">Solicitudes que la gente envía desde la página de privacidad (ver, borrar o corregir sus datos). Tienes un plazo legal para responderlas.</p>
          <div className="adm-list">
            {data.privacy.map((r) => (
              <div key={r.id} className="adm-row priv">
                <span className="adm-c adm-who"><b>{REQUEST_TYPE[r.request_type] || r.request_type}</b><small>{r.email}</small></span>
                <span className="adm-c">{r.details || <span className="adm-dash">Sin detalles</span>}</span>
                <span className="adm-c"><span className={`adm-chip ${r.status === "completed" ? "ok" : r.status === "denied" ? "bad" : "warn"}`}>{REQUEST_STATUS[r.status] || r.status}</span></span>
                <span className="adm-c">{fmt(r.created_at)}<small>{ago(r.created_at)}</small></span>
              </div>
            ))}
            {data.privacy.length === 0 ? <p className="adm-empty">Todavía no hay solicitudes. Perfecto.</p> : null}
          </div>
        </div>
      ) : null}

      {sel && byEmail[sel] ? <Detail p={byEmail[sel]} onClose={() => setSel(null)} /> : null}
    </div>
  );
}

function Kpi({ n, label, sub, onClick }) {
  return (
    <button type="button" className="adm-kpi" onClick={onClick}>
      <b>{n}</b>
      <span>{label}</span>
      <small>{sub}</small>
    </button>
  );
}

/* ---------- page ---------- */

export default function Admin() {
  const [phase, setPhase] = useState("loading"); // loading | out | denied | ready
  const [session, setSession] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    document.title = "Panel · El Toaster";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV && DEMO_QS) {
      setPhase("ready");
      return undefined;
    }
    if (!supabase) {
      setPhase("out");
      return undefined;
    }
    let alive = true;
    const check = async (s) => {
      if (!s) {
        if (alive) setPhase("out");
        return;
      }
      const { data: ok } = await supabase.rpc("is_admin");
      if (!alive) return;
      setPhase(ok === true ? "ready" : "denied");
    };
    supabase.auth.getSession().then(({ data: d }) => {
      if (!alive) return;
      setSession(d.session);
      check(d.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") return;
      setSession(s);
      if (event === "SIGNED_OUT") setData(null);
      // Not awaited here: supabase calls made inside this callback can deadlock the client.
      setTimeout(() => check(s), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      if (import.meta.env.DEV && DEMO_QS) {
        const m = await import("./adminDemo.js");
        setData(m.demoData());
      } else {
        setData(await loadAll());
      }
    } catch (e) {
      setLoadError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (phase !== "ready") return;
    try {
      localStorage.removeItem(LOGIN_FLAG);
    } catch {
      /* ignore */
    }
    reload();
  }, [phase, reload]);

  const signOut = async () => {
    setData(null);
    await supabase?.auth.signOut();
    setPhase("out");
  };

  const myEmail = session?.user?.email || (import.meta.env.DEV && DEMO_QS ? "demo@eltoaster.test" : "");

  if (phase === "loading") return <div className="adm-gate"><p>Cargando…</p></div>;
  if (phase === "out") return <SignIn />;
  if (phase === "denied") return <SignIn denied email={myEmail} onSignOut={signOut} />;
  if (!data) {
    return (
      <div className="adm-gate">
        {loadError ? (
          <>
            <p className="adm-err">No pude cargar los datos: {loadError}</p>
            <button type="button" className="adm-btn" onClick={reload}>Reintentar</button>
          </>
        ) : (
          <p>Cargando tus datos…</p>
        )}
      </div>
    );
  }
  return <Panel data={data} myEmail={myEmail} reload={reload} loading={loading} loadError={loadError} onSignOut={signOut} />;
}
