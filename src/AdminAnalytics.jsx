import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase.js";
import { Bars, Kpi, useNarrow } from "./adminUi.jsx";

/* "Analítica" tab of the admin panel: Google Analytics numbers without opening
 * Google Analytics. The data comes from the analytics-report Edge Function,
 * which only answers listed admins (supabase/functions/analytics-report). */

const GA_URL = "https://analytics.google.com/analytics/web/#/p565380788/reports/intelligenthome";
const DEMO_QS = new URLSearchParams(window.location.search).has("demo");

const EVENT_LABEL = {
  generate_lead: "Formularios enviados (leads)",
  sign_up: "Nuevos suscriptores del newsletter",
  book_call: "Clics para agendar llamada",
  calculator_run: "Calculadora usada",
  file_download: "Descargas de PDF",
  cta_click: "Clics en botones del sitio",
  contact_click: "Clics de contacto",
  language_change: "Cambios de idioma",
  click: "Clics a otros sitios",
};
const CHANNEL_LABEL = {
  Direct: "Directo",
  "Organic Search": "Búsqueda",
  "Organic Social": "Redes sociales",
  "Paid Social": "Redes pagadas",
  "Paid Search": "Búsqueda pagada",
  Referral: "Otros sitios",
  Email: "Correo",
  Unassigned: "Sin clasificar",
  "Organic Video": "Video",
};
const DEVICE_LABEL = { desktop: "Computadora", mobile: "Celular", tablet: "Tablet", "smart tv": "TV" };
const GROUP_LABEL = { Landing: "Inicio", Blog: "Blog", Tools: "Herramientas", About: "Sobre mí", Legal: "Legal", "(not set)": "Sin grupo" };

const num = (n) => Math.round(n).toLocaleString("es-US");
const pct = (n) => `${(n * 100).toFixed(1)}%`;
const dur = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const dayLabel = (d) => `${d.slice(4, 6)}/${d.slice(6, 8)}`;

/** "▲ 12% vs. periodo anterior", coloured; plain text when there is nothing to compare. */
function delta(now, before, higherIsBetter = true) {
  if (before === null || before === undefined) return { sub: "Sin periodo anterior", tone: "" };
  if (!before) return { sub: now ? "Nuevo este periodo" : "Sin datos", tone: "" };
  const d = (now - before) / before;
  if (Math.abs(d) < 0.005) return { sub: "Igual que el periodo anterior", tone: "" };
  const up = d > 0;
  return {
    sub: `${up ? "▲" : "▼"} ${Math.abs(d * 100).toFixed(0)}% vs. periodo anterior`,
    tone: up === higherIsBetter ? "up" : "down",
  };
}

async function errorText(error) {
  try {
    const body = await error.context?.json();
    if (body?.error) return body.error;
  } catch {
    /* not JSON */
  }
  return error.message || "Error desconocido";
}

function Lines({ rows }) {
  const narrow = useNarrow();
  const W = narrow ? 360 : 720, H = narrow ? 170 : 200, L = 30, B = 22, T = 8;
  const top = Math.max(4, ...rows.flatMap((r) => [r.users, r.views]));
  const step = (W - L - 6) / Math.max(1, rows.length - 1);
  const x = (i) => L + i * step;
  const y = (v) => T + (H - T - B) * (1 - v / top);
  const path = (key) => rows.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(r[key]).toFixed(1)}`).join(" ");
  const every = Math.max(1, Math.ceil(rows.length / (narrow ? 4 : 8)));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Usuarios y vistas por día">
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={L} x2={W} y1={y(top * f)} y2={y(top * f)} className="adm-grid" />
          <text x={L - 6} y={y(top * f) + 4} textAnchor="end" className="adm-axis">{Math.round(top * f)}</text>
        </g>
      ))}
      <path d={`${path("users")} L${x(rows.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z`} fill="var(--c-diag)" opacity="0.12" />
      <path d={path("views")} fill="none" stroke="var(--c-rank)" strokeWidth="2" strokeLinejoin="round" />
      <path d={path("users")} fill="none" stroke="var(--c-diag)" strokeWidth="2.5" strokeLinejoin="round" />
      {rows.map((r, i) => (
        <g key={r.date}>
          <rect x={x(i) - step / 2} y={T} width={Math.max(step, 4)} height={H - T - B} fill="transparent">
            <title>{`${dayLabel(r.date)}: ${r.users} usuarios · ${r.views} vistas`}</title>
          </rect>
          {i % every === 0 || i === rows.length - 1 ? (
            <text x={x(i)} y={H - 6} textAnchor={i === rows.length - 1 ? "end" : "middle"} className="adm-axis">{dayLabel(r.date)}</text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

function Setup({ reason, error }) {
  const hint = !error
    ? null
    : /has not been used|is disabled|SERVICE_DISABLED/i.test(error)
      ? "La API de Google Analytics Data no está activada en tu proyecto de Google Cloud (paso 1)."
      : /permission|forbidden|does not have|PERMISSION_DENIED|403/i.test(error)
        ? "Google no deja leer esta propiedad: falta agregar la cuenta de servicio como Viewer en Analytics (paso 3)."
        : null;
  return (
    <section className="adm-card">
      <h3>Falta conectar Google Analytics (una sola vez)</h3>
      {reason === "bad_secret" ? <p className="adm-err">El secreto GA_SERVICE_ACCOUNT_JSON no es un JSON válido. Pega el archivo completo.</p> : null}
      {error ? <p className="adm-err">Google respondió: {error}</p> : null}
      {hint ? <p className="adm-help">{hint}</p> : null}
      <ol className="adm-steps">
        <li>En <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">Google Cloud</a>, crea un proyecto y activa la <b>Google Analytics Data API</b>.</li>
        <li>En ese proyecto crea una <b>cuenta de servicio</b> y descarga su llave en formato JSON.</li>
        <li>En <a href={GA_URL} target="_blank" rel="noreferrer">Google Analytics</a> → Admin → Property access management, agrega el correo de esa cuenta de servicio con el rol <b>Viewer</b>.</li>
        <li>En Supabase → Edge Functions → Secrets, crea <code>GA_SERVICE_ACCOUNT_JSON</code> y pega el contenido completo del archivo JSON.</li>
      </ol>
      <p className="adm-help">Cuando termines, toca «Actualizar» y aparecen los números.</p>
    </section>
  );
}

export default function AnalyticsTab() {
  const [days, setDays] = useState(28);
  const [st, setSt] = useState({ status: "loading" }); // loading | ready | setup | error

  const load = useCallback(async (d) => {
    setSt((s) => ({ ...s, status: s.data ? "refreshing" : "loading" }));
    try {
      let data;
      if (import.meta.env.DEV && DEMO_QS) {
        data = (await import("./adminDemo.js")).demoAnalytics(d);
      } else {
        const { data: res, error } = await supabase.functions.invoke("analytics-report", { body: { days: d } });
        if (error) throw new Error(await errorText(error));
        data = res;
      }
      if (data?.configured === false) setSt({ status: "setup", reason: data.reason });
      else if (data?.error) setSt({ status: "error", error: data.error });
      else setSt({ status: "ready", data });
    } catch (e) {
      setSt({ status: "error", error: e.message || String(e) });
    }
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  const { status, data } = st;

  const bar = (
    <div className="adm-an-bar">
      <div className="adm-seg" role="group" aria-label="Periodo">
        {[7, 28, 90].map((d) => (
          <button key={d} type="button" className={days === d ? "on" : ""} onClick={() => setDays(d)}>
            {d} días
          </button>
        ))}
      </div>
      {data ? (
        <span className="adm-live">
          <i /> {data.realtime} {data.realtime === 1 ? "persona" : "personas"} en el sitio ahora
        </span>
      ) : null}
      <span className="adm-an-end">
        <a className="adm-link" href={GA_URL} target="_blank" rel="noreferrer">Abrir en Google Analytics ↗</a>
        <button type="button" className="adm-btn" onClick={() => load(days)} disabled={status === "loading" || status === "refreshing"}>
          {status === "refreshing" || status === "loading" ? "Cargando…" : "Actualizar"}
        </button>
      </span>
    </div>
  );

  if (status === "setup") return <div className="adm-stack">{bar}<Setup reason={st.reason} /></div>;
  if (status === "error") {
    return (
      <div className="adm-stack">
        {bar}
        <Setup error={st.error} />
      </div>
    );
  }
  if (!data) return <div className="adm-stack">{bar}<p className="adm-empty">Cargando analítica…</p></div>;

  const n = data.now, b = data.before;
  const noData = !n.users && !n.views;
  const items = (rows, key, val, label = (x) => x) => rows.map((r) => ({ key: r[key], label: label(r[key]), n: Math.round(r[val]) }));
  const cards = [
    ["Usuarios", num(n.users), delta(n.users, b?.users)],
    ["Usuarios nuevos", num(n.newUsers), delta(n.newUsers, b?.newUsers)],
    ["Sesiones", num(n.sessions), delta(n.sessions, b?.sessions)],
    ["Vistas de página", num(n.views), delta(n.views, b?.views)],
    ["Tasa de interacción", pct(n.engagementRate), delta(n.engagementRate, b?.engagementRate)],
    ["Duración media", dur(n.avgSession), delta(n.avgSession, b?.avgSession)],
  ];

  return (
    <div className="adm-stack">
      {bar}
      {noData ? <p className="adm-help">Todavía no hay visitas en este periodo. Google tarda un poco en procesar los datos nuevos.</p> : null}
      <div className="adm-kpis">
        {cards.map(([label, value, d]) => (
          <Kpi key={label} n={value} label={label} sub={d.sub} tone={d.tone} />
        ))}
      </div>

      <section className="adm-card adm-chart">
        <div className="adm-chart-head">
          <h3>Visitas por día · últimos {days} días</h3>
          <span>{num(n.keyEvents)} eventos clave</span>
        </div>
        {data.daily.length ? <Lines rows={data.daily} /> : <p className="adm-empty">Sin datos.</p>}
        <ul className="adm-legend">
          <li><i style={{ background: "var(--c-diag)" }} />Usuarios</li>
          <li><i style={{ background: "var(--c-rank)" }} />Vistas de página</li>
        </ul>
      </section>

      <div className="adm-grid2">
        <Bars title="Qué hace la gente (eventos)" items={items(data.events, "name", "count", (k) => EVENT_LABEL[k] || k)} empty="Aún no hay eventos." />
        <Bars title="Páginas más vistas" items={items(data.pages, "path", "views")} />
        <Bars title="De dónde llegan" items={items(data.channels, "name", "sessions", (k) => CHANNEL_LABEL[k] || k)} />
        <Bars title="Fuente / medio" items={items(data.sources, "name", "sessions")} />
        <Bars title="Ciudades" items={items(data.cities, "name", "users", (k) => (k === "(not set)" ? "Sin dato" : k))} />
        <Bars title="Países" items={items(data.countries, "name", "users")} />
        <Bars title="Dispositivos" items={items(data.devices, "name", "users", (k) => DEVICE_LABEL[k] || k)} />
        <Bars title="Secciones del sitio" items={items(data.groups, "name", "views", (k) => GROUP_LABEL[k] || k)} />
      </div>
      <p className="adm-help">Datos de Google Analytics ({new Date(data.generatedAt).toLocaleTimeString("es-US", { hour: "numeric", minute: "2-digit" })}). Google puede tardar unas horas en reflejar lo más reciente; el contador de arriba es en vivo.</p>
    </div>
  );
}
