/* Made-up people for trying the panel locally at /admin?demo.
 * Only reachable in `vite dev` (Admin.jsx gates it on import.meta.env.DEV),
 * so none of this ships to the live site. */

const NAMES = [
  "Lupita Ramos", "Carlos Mendoza", "Ana Sofía Cruz", "Miguel Ángel Soto", "Rosa Delgado", "Jorge Salazar",
  "Daniela Ortiz", "Luis Fernández", "Patricia Núñez", "Ricardo Beltrán", "Marisol Vega", "Héctor Quintana",
  "Gabriela Lara", "Óscar Miranda", "Elena Campos", "Raúl Domínguez", "Yesenia Rojas", "Tomás Aguilar",
];
const PLACES = [
  ["Taquería Los Primos", "taco_shop"], ["Mariscos El Pelícano", "mariscos_seafood"], ["Café Sol y Luna", "coffee_shop"],
  ["La Casita de Doña Rosa", "full_service_casual"], ["Tacos El Güero", "food_truck"], ["Cantina La Reina", "full_service_with_bar"],
  ["Birria Express", "food_truck"], ["El Rincón Poblano", "full_service_casual"], ["Mariscos Don Beto", "mariscos_seafood"],
];
const CITIES = ["Phoenix", "Mesa", "Glendale", "Peoria", "Chandler", "Tempe", "phoenix"];
const CATS = ["tacos", "mariscos", "hot-dogs", "burritos", "tortas", "chilaquiles"];
const STATUS = ["pending", "awaiting_review", "sent", "sent", "approved", "rejected"];

const daysAgo = (d, h = 14) => new Date(Date.now() - d * 86400000 - h * 3600000).toISOString();
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]+/g, ".");
const id = (() => { let n = 0; return () => `demo-${++n}`; })();

export function demoData() {
  const leads = [], reports = [], calcs = [], ranks = [], subs = [], privacy = [];

  NAMES.forEach((name, i) => {
    const email = `${slug(name)}@correo.test`;
    const when = i * 1.7 + (i % 3);
    const lang = i % 5 === 0 ? "en" : "es";
    const phone = `(602) 555-${String(1000 + i * 37).slice(-4)}`;

    if (i < 9) {
      const [restaurant, type] = PLACES[i];
      const l = {
        id: id(), created_at: daysAgo(when), restaurant_name: restaurant, contact_name: name, email, phone,
        city: CITIES[i % CITIES.length], biggest_challenge: i % 2 ? "Reseñas malas en Google y poca gente entre semana." : "Me cuesta controlar los costos de comida.",
        preferred_language: lang, source: "landing", marketing_consent: i % 3 !== 0, zip_code: `850${10 + i}`,
        street_address: `${1200 + i * 113} W Camelback Rd`, google_maps_url: i % 2 ? "https://maps.google.com/?q=demo" : null,
        annual_revenue: i % 2 ? "$450,000" : null, restaurant_type: type, locations: null,
      };
      leads.push(l);
      reports.push({ id: id(), lead_id: l.id, status: STATUS[i % STATUS.length], weighted_score: 3.4 + (i % 5) * 0.3, created_at: l.created_at, sent_at: null, rejected_reason: i % 6 === 5 ? "Reseñas de otra sucursal." : null });
    }
    if (i % 3 === 1) {
      calcs.push({ id: id(), created_at: daysAgo(when + 0.5), name, email, phone, preferred_language: lang });
    }
    if (i % 2 === 0 || i > 11) {
      ranks.push({ id: id(), created_at: daysAgo(when + 1), name, email, city: "phoenix", preferred_language: lang, category: i % 4 === 0 ? null : CATS[i % CATS.length] });
    }
    if (i % 2 === 0 || i === 3) {
      subs.push({
        id: id(), created_at: daysAgo(when + 0.2), email, lang, source: i < 9 ? "diagnostic" : "footer",
        unsubscribed_at: i === 6 ? daysAgo(1) : null, unsubscribe_reason: i === 6 ? "unsubscribe" : null,
        is_test: false, welcomed_at: daysAgo(when),
      });
    }
  });

  // A few people who only ever signed up for the newsletter, plus internal test rows.
  for (let i = 0; i < 6; i++) {
    subs.push({ id: id(), created_at: daysAgo(i * 4 + 1), email: `suscriptor${i}@correo.test`, lang: i % 2 ? "en" : "es", source: "footer", unsubscribed_at: null, unsubscribe_reason: null, is_test: false, welcomed_at: daysAgo(i * 4) });
  }
  subs.push({ id: id(), created_at: daysAgo(30), email: "prueba@example.com", lang: "es", source: "seed", unsubscribed_at: null, unsubscribe_reason: null, is_test: true, welcomed_at: null });
  ranks.push({ id: id(), created_at: daysAgo(2), name: "Prueba", email: "prueba-ranking@example.com", city: "phoenix", preferred_language: "es", category: "tacos" });

  privacy.push({ id: id(), created_at: daysAgo(3), request_type: "deletion", email: "rosa.delgado@correo.test", details: "Quiero que borren mis datos.", status: "pending", resolved_at: null });

  return { leads, reports, calcs, ranks, subs, privacy, loadedAt: new Date() };
}

/** Made-up Google Analytics numbers for the Analítica tab (same shape as the analytics-report function). */
export function demoAnalytics(days) {
  if (new URLSearchParams(window.location.search).has("setup")) return { configured: false, reason: "no_secret" };
  const ymd = (i) => new Date(Date.now() - i * 86400000).toLocaleDateString("en-CA", { timeZone: "America/Phoenix" }).replace(/-/g, "");
  const daily = [];
  for (let i = days - 1; i >= 0; i--) {
    const wave = 1 + Math.sin(i / 2.3) * 0.4;
    const users = Math.max(0, Math.round((18 + (days - i) * 0.25) * wave));
    daily.push({ date: ymd(i), users, sessions: Math.round(users * 1.2), views: Math.round(users * 2.6) });
  }
  const sum = (k) => daily.reduce((a, r) => a + r[k], 0);
  const now = { users: sum("users"), newUsers: Math.round(sum("users") * 0.78), sessions: sum("sessions"), views: sum("views"), engagementRate: 0.62, avgSession: 84, keyEvents: 31 };
  const before = { users: Math.round(now.users * 0.86), newUsers: Math.round(now.newUsers * 0.9), sessions: Math.round(now.sessions * 0.88), views: Math.round(now.views * 0.8), engagementRate: 0.65, avgSession: 91, keyEvents: 20 };
  return {
    configured: true, days, generatedAt: new Date().toISOString(), realtime: 3, now, before, daily,
    pages: [["/", 640, 410], ["/rankings", 220, 150], ["/calculator", 180, 120], ["/blog", 95, 70], ["/about_me", 60, 44]].map(([path, views, users]) => ({ path, views, users })),
    channels: [["Organic Social", 310], ["Direct", 190], ["Organic Search", 120], ["Referral", 40]].map(([name, sessions]) => ({ name, sessions, users: Math.round(sessions * 0.8), keyEvents: 5 })),
    sources: [["instagram / social", 220], ["(direct) / (none)", 190], ["google / organic", 120], ["linktr.ee / referral", 50]].map(([name, sessions]) => ({ name, sessions, users: Math.round(sessions * 0.8) })),
    cities: [["Phoenix", 210], ["Mesa", 60], ["Glendale", 34], ["Tucson", 22], ["(not set)", 18]].map(([name, users]) => ({ name, users })),
    countries: [["United States", 360], ["Mexico", 40]].map(([name, users]) => ({ name, users })),
    devices: [["mobile", 330], ["desktop", 95], ["tablet", 12]].map(([name, users]) => ({ name, users })),
    groups: [["Landing", 640], ["Tools", 400], ["Blog", 95], ["About", 60]].map(([name, views]) => ({ name, views })),
    events: [["cta_click", 210], ["file_download", 64], ["generate_lead", 18], ["calculator_run", 41], ["sign_up", 9], ["book_call", 7]].map(([name, count]) => ({ name, count })),
  };
}
