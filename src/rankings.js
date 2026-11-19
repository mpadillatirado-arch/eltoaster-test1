/* City rankings for eltoaster.com/rankings.
 *
 * Only cities with `items` are open; the rest show "Coming soon".
 * The first FREE_COUNT places are open to everyone, the rest need a name and
 * email (saved in public.ranking_leads).
 *
 * TODO: the Phoenix list below is SAMPLE DATA. Replace it with the real
 * ranking before this goes to production.
 */

export const FREE_COUNT = 3;

export const CITIES = [
  { id: "phoenix", name: "Phoenix", state: "AZ" },
  { id: "tucson", name: "Tucson", state: "AZ" },
  { id: "san-diego", name: "San Diego", state: "CA" },
  { id: "los-angeles", name: "Los Angeles", state: "CA" },
  { id: "san-francisco", name: "San Francisco", state: "CA" },
  { id: "las-vegas", name: "Las Vegas", state: "NV" },
  { id: "dallas", name: "Dallas", state: "TX" },
];

const sample = (n, rating, reviews) => ({
  name: `Restaurante de ejemplo ${n}`,
  area: "Phoenix",
  type: { es: "Comida mexicana", en: "Mexican food" },
  rating,
  reviews,
});

export const RANKINGS = {
  phoenix: [
    sample(1, 4.9, 1240),
    sample(2, 4.8, 980),
    sample(3, 4.8, 760),
    sample(4, 4.7, 1105),
    sample(5, 4.7, 640),
    sample(6, 4.7, 410),
    sample(7, 4.6, 890),
    sample(8, 4.6, 520),
    sample(9, 4.5, 1330),
    sample(10, 4.5, 300),
  ],
};
