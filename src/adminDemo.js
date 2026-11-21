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
