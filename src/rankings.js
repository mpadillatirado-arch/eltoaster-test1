/* City rankings for eltoaster.com/rankings.
 *
 * Phoenix lists come from the phoenix-food-rankings skill (published
 * Instagram rankings, Nov 2026 snapshot). Cities without lists show
 * "Coming soon". The page shows every place; the PDF still asks for a name
 * and email (saved in public.ranking_leads). How the order is decided is in
 * src/RankingCriteria.jsx (from the phoenix-food-ranking-criteria skill).
 */

export const CITIES = [
  { id: "phoenix", name: "Phoenix", state: "AZ" },
  { id: "tucson", name: "Tucson", state: "AZ" },
  { id: "san-diego", name: "San Diego", state: "CA" },
  { id: "los-angeles", name: "Los Angeles", state: "CA" },
  { id: "san-francisco", name: "San Francisco", state: "CA" },
  { id: "las-vegas", name: "Las Vegas", state: "NV" },
  { id: "dallas", name: "Dallas", state: "TX" },
];

export const RANKINGS = {
  tucson: [
    {
      "id": "tacos",
      "label": {
        "es": "Tacos",
        "en": "Tacos"
      },
      "items": [
        {
          "name": "Karamelo King",
          "dish": "Carne asada",
          "city": "Tucson"
        },
        {
          "name": "Tacos Apson",
          "dish": "Taco chino",
          "city": "Tucson"
        },
        {
          "name": "Amelia's Mexican Kitchen",
          "dish": "Quesabirria",
          "city": "Tucson"
        },
        {
          "name": "Taquería Mi Pueblo",
          "dish": "Taco de pescado",
          "city": "Tucson"
        },
        {
          "name": "Taco Rico",
          "city": "Marana"
        },
        {
          "name": "Taquería Alamos",
          "city": "Tucson"
        },
        {
          "name": "La Chaitería",
          "dish": "Tacos veganos",
          "city": "Tucson"
        },
        {
          "name": "Taquería El Rápido",
          "city": "Tucson"
        },
        {
          "name": "El Tacoson",
          "city": "Tucson"
        },
        {
          "name": "Tacos de la H",
          "dish": "Estilo Hermosillo",
          "city": "Tucson"
        },
        {
          "name": "Taquería El Cheke",
          "city": "Tucson"
        },
        {
          "name": "Aquí con El Nene",
          "dish": "Taco Yaqui",
          "city": "Tucson"
        },
        {
          "name": "The Quesadillas",
          "city": "Tucson"
        },
        {
          "name": "Taquería 2 Hermanos",
          "city": "Tucson"
        },
        {
          "name": "Taquería Juanito's",
          "city": "Tucson"
        },
        {
          "name": "Rollies Mexican Patio",
          "dish": "Tacos de birria",
          "city": "Tucson"
        },
        {
          "name": "Carnitas El Michoacano",
          "dish": "Carnitas",
          "city": "Tucson"
        },
        {
          "name": "Taco Fish",
          "dish": "Tacos de pescado",
          "city": "Tucson"
        },
        {
          "name": "La Botana Tacos",
          "city": "Tucson"
        },
        {
          "name": "Carnitas La Yoca",
          "dish": "Carnitas",
          "city": "Tucson"
        },
        {
          "name": "El Taco Rústico",
          "dish": "Quesabirria",
          "city": "Tucson"
        },
        {
          "name": "BK Carne Asada",
          "dish": "Carne asada",
          "city": "Tucson"
        },
        {
          "name": "Taquería Pico de Gallo",
          "dish": "Taco de pescado",
          "city": "South Tucson"
        },
        {
          "name": "Tacos Estilo Cajeme",
          "dish": "Tacos de cabeza",
          "city": "Tucson"
        },
        {
          "name": "Taco Giro",
          "dish": "Cocina sonorense",
          "city": "Tucson"
        }
      ],
      "method": {
        "google": 65,
        "yelp": 35,
        "award": 3,
        "influencer": 2,
        "community": 2,
        "max": 107,
        "reviewFactor": false
      },
      "pdf": false
    }
  ],
  phoenix: [
    {
      "id": "tacos",
      "label": {
        "es": "Tacos",
        "en": "Tacos"
      },
      "items": [
        {
          "name": "Taco Viva",
          "dish": "Adobada estilo TJ",
          "city": "Phoenix",
          "score": {
            "google": 4.7,
            "yelp": 4.7,
            "noYelp": false,
            "award": "Best of Phoenix 2024",
            "influencer": true,
            "community": true,
            "total": 101.0,
            "prev": 1
          }
        },
        {
          "name": "Los Vales",
          "dish": "Birria crujiente",
          "city": "Phoenix",
          "score": {
            "google": 4.8,
            "yelp": 4.5,
            "noYelp": false,
            "award": false,
            "influencer": true,
            "community": true,
            "total": 97.9,
            "prev": 3
          }
        },
        {
          "name": "Ta'Carbon",
          "dish": "Asada sonorense",
          "city": "Phoenix, Glendale y Peoria",
          "score": {
            "google": 4.6,
            "yelp": 4.4,
            "noYelp": false,
            "award": "Best Carne Asada 2024",
            "influencer": true,
            "community": true,
            "total": 97.4,
            "prev": 5
          }
        },
        {
          "name": "Tacos Calafia",
          "dish": "Adobada estilo TJ",
          "city": "Varias sucursales",
          "score": {
            "google": 4.7,
            "yelp": 4.3,
            "noYelp": false,
            "award": "Best Al Pastor 2018",
            "influencer": false,
            "community": true,
            "total": 95.8,
            "prev": 24
          }
        },
        {
          "name": "Tacos Chiwas",
          "dish": "Variado",
          "city": "Phoenix y Mesa",
          "score": {
            "google": 4.5,
            "yelp": 4.5,
            "noYelp": false,
            "award": "Best Quesadilla 2020",
            "influencer": false,
            "community": false,
            "total": 93.0,
            "prev": 2
          }
        },
        {
          "name": "Taco Chelo",
          "dish": "Quesadillas",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.0,
            "noYelp": false,
            "award": "Best Quesadillas 2022",
            "influencer": false,
            "community": true,
            "total": 92.8,
            "prev": 17
          }
        },
        {
          "name": "Restaurante Lomas",
          "dish": "Asada, cabeza y Minini",
          "city": "Chandler",
          "score": {
            "google": 4.8,
            "yelp": 4.0,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 92.4,
            "prev": 7
          }
        },
        {
          "name": "Asadero Sonora",
          "dish": "Asada sonorense",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.5,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 91.3,
            "prev": 11
          }
        },
        {
          "name": "Tacos Lin",
          "dish": "Al pastor",
          "city": "Glendale",
          "score": {
            "google": 4.8,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 91.0,
            "prev": 12
          }
        },
        {
          "name": "Santa Madre Taco Shop",
          "dish": "Fish taco",
          "city": "Tempe",
          "score": {
            "google": 4.6,
            "yelp": 4.4,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 90.6,
            "prev": 22
          }
        },
        {
          "name": "Don Camarón",
          "dish": "Taco de camarón",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.4,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 90.6,
            "prev": 21
          }
        },
        {
          "name": "Taco Boys",
          "dish": "Asada y tripa",
          "city": "Phoenix y Tempe",
          "score": {
            "google": 4.5,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": true,
            "community": false,
            "total": 90.2,
            "prev": 6
          }
        },
        {
          "name": "Birrieria Tijuana",
          "dish": "Birria estilo Tijuana",
          "city": "Phoenix",
          "score": {
            "google": 4.5,
            "yelp": 4.4,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 89.3,
            "prev": 13
          }
        },
        {
          "name": "La Frontera",
          "dish": "Taco de carnitas",
          "city": "Phoenix",
          "score": {
            "google": 4.4,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 89.3,
            "prev": 23
          }
        },
        {
          "name": "Tacos Sahuaro",
          "dish": "Tacos de la casa",
          "city": "Phoenix",
          "score": {
            "google": 4.5,
            "yelp": 3.8,
            "noYelp": true,
            "award": "Best Taco 2018",
            "influencer": false,
            "community": false,
            "total": 88.1,
            "prev": 20
          }
        },
        {
          "name": "Taquería El Trompo",
          "dish": "Al pastor estilo chilango",
          "city": "Phoenix",
          "score": {
            "google": 4.5,
            "yelp": 4.2,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 87.9,
            "prev": 19
          }
        },
        {
          "name": "Tacos del Pepe",
          "dish": "Asada sonorense",
          "city": "Phoenix",
          "score": {
            "google": 4.4,
            "yelp": 4.1,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 87.9,
            "prev": 15
          }
        },
        {
          "name": "Unos Tacos y Birria",
          "dish": "Birria de res",
          "city": "Phoenix y Mesa",
          "score": {
            "google": 4.5,
            "yelp": 3.9,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 87.2,
            "prev": 14
          }
        },
        {
          "name": "Tacos El Rojo",
          "dish": "Adobada estilo TJ",
          "city": "Glendale y Peoria",
          "score": {
            "google": 4.3,
            "yelp": 3.9,
            "noYelp": false,
            "award": false,
            "influencer": true,
            "community": true,
            "total": 87.2,
            "prev": 8
          }
        },
        {
          "name": "Tacos El Güero",
          "dish": "Taquería",
          "city": "Phoenix",
          "score": {
            "google": 4.5,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 87.1,
            "prev": null
          }
        },
        {
          "name": "Asadero Pitic",
          "dish": "Asada sonorense",
          "city": "Phoenix",
          "score": {
            "google": 4.3,
            "yelp": 3.6,
            "noYelp": false,
            "award": false,
            "influencer": true,
            "community": true,
            "total": 85.1,
            "prev": 4
          }
        },
        {
          "name": "Tacos Chava",
          "dish": "Asada tipo cebosito",
          "city": "Phoenix",
          "score": {
            "google": 4.4,
            "yelp": 3.5,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 83.7,
            "prev": 10
          }
        },
        {
          "name": "Tacos Huicho",
          "dish": "Al pastor estilo chilango",
          "city": "Phoenix",
          "score": {
            "google": 4.2,
            "yelp": 3.8,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 83.0,
            "prev": 9
          }
        },
        {
          "name": "El Fundador",
          "dish": "Campechano",
          "city": "Phoenix",
          "score": {
            "google": 4.2,
            "yelp": 3.4,
            "noYelp": false,
            "award": "Best Taco Tuesday 2020",
            "influencer": false,
            "community": false,
            "total": 81.4,
            "prev": 16
          }
        },
        {
          "name": "Mi Lindo Michoacán",
          "dish": "Carnitas",
          "city": "Phoenix",
          "score": {
            "google": 4.1,
            "yelp": 4.0,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 81.3,
            "prev": 18
          }
        }
      ],
      "method": {
        "google": 65,
        "yelp": 35,
        "award": 3,
        "influencer": 2,
        "community": 2,
        "max": 107,
        "reviewFactor": false
      }
    },
    {
      "id": "hot-dogs",
      "label": {
        "es": "Hot Dogs",
        "en": "Hot Dogs"
      },
      "items": [
        {
          "name": "El Caprichoso",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix (4 sucursales)",
          "score": {
            "google": 4.35,
            "yelp": 4.4,
            "noYelp": false,
            "award": "Best Sonoran Hot Dog 2016, 2019 y 2023",
            "influencer": true,
            "community": true,
            "total": 94.2,
            "prev": 1,
            "gReviews": 1767,
            "yReviews": 166
          }
        },
        {
          "name": "Loaded Dogs",
          "dish": "New York style",
          "city": "Phoenix",
          "score": {
            "google": 5.0,
            "yelp": 5.0,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 94.0,
            "prev": 24,
            "gReviews": 8,
            "yReviews": 4
          }
        },
        {
          "name": "Los Mayitos",
          "dish": "Hot dog estilo Sonora",
          "city": "Mesa",
          "score": {
            "google": 4.7,
            "yelp": 4.6,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 93.5,
            "prev": 20,
            "gReviews": 220,
            "yReviews": 64
          }
        },
        {
          "name": "Dogos y Tacos El Gordo",
          "dish": "Dogos estilo Zapopan",
          "city": "Mesa",
          "score": {
            "google": 4.8,
            "yelp": 4.1,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 92.5,
            "prev": null,
            "gReviews": 642,
            "yReviews": 48
          }
        },
        {
          "name": "Chicago Hamburger Co.",
          "dish": "Chicago style",
          "city": "Phoenix",
          "score": {
            "google": 4.7,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 92.0,
            "prev": 6,
            "gReviews": 2035,
            "yReviews": 656
          }
        },
        {
          "name": "Lupita's Hot Dogs",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.6,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 92.0,
            "prev": 7,
            "gReviews": 1095,
            "yReviews": 213
          }
        },
        {
          "name": "Johnny's Burgers & Dogs",
          "dish": "Chicago style",
          "city": "Tempe",
          "score": {
            "google": 4.7,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 92.0,
            "prev": 9,
            "gReviews": 945,
            "yReviews": 352
          }
        },
        {
          "name": "Lucky Boy",
          "dish": "Hot dog clásico",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 90.5,
            "prev": 15,
            "gReviews": 1688,
            "yReviews": 530
          }
        },
        {
          "name": "Nogales Hot Dogs",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix (4 sucursales)",
          "score": {
            "google": 4.4,
            "yelp": 4.1,
            "noYelp": false,
            "award": false,
            "influencer": true,
            "community": true,
            "total": 90.5,
            "prev": 2,
            "gReviews": 1172,
            "yReviews": 264
          }
        },
        {
          "name": "Der Wurst",
          "dish": "New York style",
          "city": "Phoenix",
          "score": {
            "google": 4.5,
            "yelp": 5.0,
            "noYelp": false,
            "award": "Best Hot Dog (3 años seguidos)",
            "influencer": false,
            "community": false,
            "total": 90.1,
            "prev": 4,
            "gReviews": 34,
            "yReviews": 1
          }
        },
        {
          "name": "Ted's Hot Dogs",
          "dish": "Hot dog al carbón estilo Buffalo",
          "city": "Tempe",
          "score": {
            "google": 4.4,
            "yelp": 3.9,
            "noYelp": false,
            "award": "Best Hot Dogs 2024",
            "influencer": false,
            "community": false,
            "total": 88.5,
            "prev": null,
            "gReviews": 4772,
            "yReviews": 1000
          }
        },
        {
          "name": "Hot Dogs La Yaquesita",
          "dish": "Hot dog estilo Sonora",
          "city": "Avondale",
          "score": {
            "google": 4.5,
            "yelp": 4.2,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 88.5,
            "prev": 13,
            "gReviews": 317,
            "yReviews": 55
          }
        },
        {
          "name": "Dogos Guadalupe",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix",
          "score": {
            "google": 4.3,
            "yelp": 4.8,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 88.5,
            "prev": 22,
            "gReviews": 206,
            "yReviews": 5
          }
        },
        {
          "name": "Dazzo's Dog House",
          "dish": "Chicago style",
          "city": "Glendale",
          "score": {
            "google": 4.5,
            "yelp": 4.1,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 88.0,
            "prev": null,
            "gReviews": 1402,
            "yReviews": 272
          }
        },
        {
          "name": "5 Hermanos Hot Dogs",
          "dish": "Hot dog estilo Sonora",
          "city": "Glendale",
          "score": {
            "google": 5.0,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 88.0,
            "prev": 12,
            "gReviews": 41,
            "yReviews": 0
          }
        },
        {
          "name": "Hot Dogs El Mago",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix",
          "score": {
            "google": 5.0,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 88.0,
            "prev": 23,
            "gReviews": 15,
            "yReviews": 0
          }
        },
        {
          "name": "Hot Dogs La Mochila",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix",
          "score": {
            "google": 4.7,
            "yelp": 4.6,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 87.9,
            "prev": null,
            "gReviews": 6,
            "yReviews": 5
          }
        },
        {
          "name": "Detroit Coney Grill",
          "dish": "Coney style",
          "city": "Tempe y Scottsdale",
          "score": {
            "google": 4.45,
            "yelp": 4.0,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 86.8,
            "prev": 16,
            "gReviews": 1731,
            "yReviews": 536
          }
        },
        {
          "name": "Simon's Hot Dogs",
          "dish": "Hot dog estilo colombiano",
          "city": "Scottsdale",
          "score": {
            "google": 4.5,
            "yelp": 4.8,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 86.1,
            "prev": 11,
            "gReviews": 15,
            "yReviews": 759
          }
        },
        {
          "name": "El Exquisito",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix",
          "score": {
            "google": 4.7,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 86.0,
            "prev": 18,
            "gReviews": 101,
            "yReviews": 0
          }
        },
        {
          "name": "El Sabroso",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix (2 sucursales)",
          "score": {
            "google": 4.45,
            "yelp": 3.6,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 84.8,
            "prev": 5,
            "gReviews": 953,
            "yReviews": 73
          }
        },
        {
          "name": "Micky's Hot Dogs",
          "dish": "Hot dog estilo Sonora",
          "city": "Mesa",
          "score": {
            "google": 4.3,
            "yelp": 3.9,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 84.0,
            "prev": 14,
            "gReviews": 1187,
            "yReviews": 196
          }
        },
        {
          "name": "El Chapo Hot Dogs",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix",
          "score": {
            "google": 4.4,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 81.7,
            "prev": null,
            "gReviews": 134,
            "yReviews": 0
          }
        },
        {
          "name": "Pa Los Hotdogs",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix",
          "score": {
            "google": 3.8,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": true,
            "community": false,
            "total": 75.2,
            "prev": 8,
            "gReviews": 65,
            "yReviews": 0
          }
        },
        {
          "name": "Dogos de la H",
          "dish": "Hot dog estilo Sonora",
          "city": "Phoenix",
          "score": {
            "google": 3.9,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": true,
            "community": false,
            "total": 74.8,
            "prev": 21,
            "gReviews": 16,
            "yReviews": 0
          }
        }
      ],
      "method": {
        "google": 75,
        "yelp": 25,
        "award": 3,
        "influencer": 2,
        "community": 2,
        "max": 107,
        "reviewFactor": true
      }
    },
    {
      "id": "mariscos",
      "label": {
        "es": "Mariscos",
        "en": "Seafood"
      },
      "items": [
        {
          "name": "Mariscos El Wicho",
          "dish": "Aguachiles y cocteles",
          "city": "Phoenix",
          "score": {
            "google": 4.7,
            "yelp": 4.6,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 93.5,
            "prev": 23,
            "gReviews": 324,
            "yReviews": 102
          }
        },
        {
          "name": "Los Arbolitos de Cajeme",
          "dish": "Aguachile estilo Sonora",
          "city": "Glendale",
          "score": {
            "google": 4.6,
            "yelp": 4.1,
            "noYelp": false,
            "award": "Best of Phoenix 2024",
            "influencer": false,
            "community": false,
            "total": 92.5,
            "prev": 2,
            "gReviews": 525,
            "yReviews": 143
          }
        },
        {
          "name": "Mariscos El Guayabas",
          "dish": "Mariscos frescos",
          "city": "Phoenix",
          "score": {
            "google": 4.7,
            "yelp": 5.0,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 91.9,
            "prev": null,
            "gReviews": 33,
            "yReviews": 1
          }
        },
        {
          "name": "Mariscos Playa Hermosa",
          "dish": "Camarones locos",
          "city": "Phoenix",
          "score": {
            "google": 4.4,
            "yelp": 4.4,
            "noYelp": false,
            "award": "Best of Phoenix 2019",
            "influencer": false,
            "community": false,
            "total": 91.0,
            "prev": 6,
            "gReviews": 3464,
            "yReviews": 1300
          }
        },
        {
          "name": "Tacos y Mariscos El Sinaloa",
          "dish": "Aguachile",
          "city": "Phoenix",
          "score": {
            "google": 4.9,
            "yelp": 3.8,
            "noYelp": true,
            "award": "Best of Phoenix 2019",
            "influencer": false,
            "community": false,
            "total": 89.6,
            "prev": 5,
            "gReviews": 14,
            "yReviews": 0
          }
        },
        {
          "name": "Don Clamatón",
          "dish": "Clamatos y cocteles",
          "city": "Peoria",
          "score": {
            "google": 4.5,
            "yelp": 5.0,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 89.1,
            "prev": null,
            "gReviews": 85,
            "yReviews": 3
          }
        },
        {
          "name": "Marisco Boys",
          "dish": "Tostada de yellowtail",
          "city": "Phoenix",
          "score": {
            "google": 4.5,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 89.0,
            "prev": 8,
            "gReviews": 408,
            "yReviews": 107
          }
        },
        {
          "name": "Mariscos El Molcajete",
          "dish": "Molcajete",
          "city": "Peoria",
          "score": {
            "google": 4.5,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 89.0,
            "prev": 13,
            "gReviews": 381,
            "yReviews": 56
          }
        },
        {
          "name": "Mariscos Ensenada",
          "dish": "Ceviche y micheladas",
          "city": "Phoenix",
          "score": {
            "google": 4.5,
            "yelp": 4.1,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 88.0,
            "prev": 19,
            "gReviews": 746,
            "yReviews": 37
          }
        },
        {
          "name": "Mariscos Las Culichis",
          "dish": "Mixtiadas estilo Culiacán",
          "city": "Phoenix",
          "score": {
            "google": 5.0,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 88.0,
            "prev": 7,
            "gReviews": 22,
            "yReviews": 0
          }
        },
        {
          "name": "El Wero Marisquero",
          "dish": "Tostadas de mariscos",
          "city": "Phoenix",
          "score": {
            "google": 4.3,
            "yelp": 4.5,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 87.0,
            "prev": 18,
            "gReviews": 598,
            "yReviews": 17
          }
        },
        {
          "name": "Mariscos El Profe",
          "dish": "Ceviche mixto y aguachile",
          "city": "Phoenix",
          "score": {
            "google": 4.2,
            "yelp": 5.0,
            "noYelp": false,
            "award": false,
            "influencer": true,
            "community": true,
            "total": 87.0,
            "prev": 1,
            "gReviews": 40,
            "yReviews": 1
          }
        },
        {
          "name": "El Rey de los Ostiones",
          "dish": "Ostiones preparados",
          "city": "Phoenix",
          "score": {
            "google": 4.4,
            "yelp": 4.8,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 86.7,
            "prev": 17,
            "gReviews": 145,
            "yReviews": 21
          }
        },
        {
          "name": "Mariscos Bahía de Guaymas",
          "dish": "Empanadas de camarón",
          "city": "Phoenix",
          "score": {
            "google": 4.3,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 86.0,
            "prev": 9,
            "gReviews": 448,
            "yReviews": 50
          }
        },
        {
          "name": "Bertha's Los Mochis",
          "dish": "Tacos de marlín",
          "city": "Phoenix",
          "score": {
            "google": 4.3,
            "yelp": 4.2,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 85.5,
            "prev": 15,
            "gReviews": 451,
            "yReviews": 30
          }
        },
        {
          "name": "Marisa's Seafood Cocina",
          "dish": "Ceviche de camarón",
          "city": "Phoenix",
          "score": {
            "google": 4.3,
            "yelp": 4.1,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 85.0,
            "prev": 24,
            "gReviews": 675,
            "yReviews": 113
          }
        },
        {
          "name": "San Diego Bay",
          "dish": "Molcajete de mariscos",
          "city": "Guadalupe",
          "score": {
            "google": 4.3,
            "yelp": 4.0,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 84.5,
            "prev": 10,
            "gReviews": 402,
            "yReviews": 124
          }
        },
        {
          "name": "Ceviche 101",
          "dish": "Taco 101 y tostadas",
          "city": "Glendale",
          "score": {
            "google": 4.2,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 84.5,
            "prev": 14,
            "gReviews": 246,
            "yReviews": 87
          }
        },
        {
          "name": "Mariscos El Dorado Sinaloa",
          "dish": "Torre El Dorado",
          "city": "Phoenix",
          "score": {
            "google": 4.3,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 83.5,
            "prev": 11,
            "gReviews": 965,
            "yReviews": 0
          }
        },
        {
          "name": "Mariscos El Cochorit",
          "dish": "Campechana especial",
          "city": "Phoenix",
          "score": {
            "google": 4.1,
            "yelp": 3.0,
            "noYelp": false,
            "award": "Best of Phoenix 2016",
            "influencer": true,
            "community": true,
            "total": 83.5,
            "prev": 3,
            "gReviews": 528,
            "yReviews": 8
          }
        },
        {
          "name": "Vaca Lola",
          "dish": "Cocina sinaloense",
          "city": "Phoenix",
          "score": {
            "google": 4.3,
            "yelp": 3.7,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 83.0,
            "prev": 22,
            "gReviews": 298,
            "yReviews": 7
          }
        },
        {
          "name": "Mariscos La Capi",
          "dish": "Ceviche y cocteles",
          "city": "Phoenix",
          "score": {
            "google": 4.1,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": true,
            "community": true,
            "total": 81.4,
            "prev": null,
            "gReviews": 66,
            "yReviews": 2
          }
        },
        {
          "name": "Mariscos Las Islitas",
          "dish": "Estilo Nayarit",
          "city": "Phoenix",
          "score": {
            "google": 4.1,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 80.5,
            "prev": 16,
            "gReviews": 293,
            "yReviews": 0
          }
        },
        {
          "name": "El Pacífico Mariscos",
          "dish": "Ceviche",
          "city": "Phoenix",
          "score": {
            "google": 4.1,
            "yelp": 3.7,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 80.0,
            "prev": 25,
            "gReviews": 633,
            "yReviews": 74
          }
        },
        {
          "name": "Mariscos Vuelve a la Vida",
          "dish": "Coctel Vuelve a la Vida",
          "city": "Phoenix",
          "score": {
            "google": 4.0,
            "yelp": 3.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 76.5,
            "prev": 21,
            "gReviews": 903,
            "yReviews": 47
          }
        }
      ],
      "method": {
        "google": 75,
        "yelp": 25,
        "award": 3,
        "influencer": 2,
        "community": 2,
        "max": 107,
        "reviewFactor": true
      }
    },
    {
      "id": "chilaquiles",
      "label": {
        "es": "Chilaquiles",
        "en": "Chilaquiles"
      },
      "items": [
        {
          "name": "Presidio Cocina Mexicana",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.6,
            "noYelp": false,
            "award": "Best Mexican Brunch 2023",
            "influencer": false,
            "community": true,
            "total": 97.0,
            "prev": 2,
            "gReviews": 1663,
            "yReviews": 1300
          }
        },
        {
          "name": "Centrico",
          "city": "Phoenix",
          "score": {
            "google": 4.8,
            "yelp": 4.6,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 95.0,
            "prev": 7,
            "gReviews": 1268,
            "yReviews": 709
          }
        },
        {
          "name": "Pepe's Taco Villa",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.4,
            "noYelp": false,
            "award": "Best Chilaquiles 2014",
            "influencer": false,
            "community": false,
            "total": 94.0,
            "prev": 15,
            "gReviews": 1017,
            "yReviews": 251
          }
        },
        {
          "name": "Cocina Madrigal",
          "city": "Phoenix",
          "score": {
            "google": 4.7,
            "yelp": 4.6,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 93.5,
            "prev": 6,
            "gReviews": 4589,
            "yReviews": 4600
          }
        },
        {
          "name": "Gallo Blanco",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.2,
            "noYelp": false,
            "award": "Best Chilaquiles 2018",
            "influencer": false,
            "community": false,
            "total": 93.0,
            "prev": 3,
            "gReviews": 2005,
            "yReviews": 605
          }
        },
        {
          "name": "El Sol Mexican Cafe",
          "city": "Chandler",
          "score": {
            "google": 4.7,
            "yelp": 4.5,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 93.0,
            "prev": 13,
            "gReviews": 695,
            "yReviews": 250
          }
        },
        {
          "name": "Comedor Guadalajara",
          "city": "Phoenix",
          "score": {
            "google": 4.5,
            "yelp": 4.1,
            "noYelp": false,
            "award": "Best Chilaquiles 2017",
            "influencer": false,
            "community": false,
            "total": 91.0,
            "prev": 1,
            "gReviews": 5372,
            "yReviews": 853
          }
        },
        {
          "name": "Chilakil To Go",
          "city": "Glendale",
          "score": {
            "google": 4.9,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 90.8,
            "prev": 12,
            "gReviews": 138,
            "yReviews": 0
          }
        },
        {
          "name": "Otro Café",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.1,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 89.5,
            "prev": 4,
            "gReviews": 3045,
            "yReviews": 1400
          }
        },
        {
          "name": "Ghost Ranch",
          "city": "Tempe",
          "score": {
            "google": 4.5,
            "yelp": 4.4,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 89.5,
            "prev": 18,
            "gReviews": 1586,
            "yReviews": 1500
          }
        },
        {
          "name": "Soul Café",
          "city": "Scottsdale",
          "score": {
            "google": 4.5,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 89.0,
            "prev": 21,
            "gReviews": 1344,
            "yReviews": 1300
          }
        },
        {
          "name": "Liberty Market",
          "city": "Gilbert",
          "score": {
            "google": 4.5,
            "yelp": 4.2,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 88.5,
            "prev": 19,
            "gReviews": 3404,
            "yReviews": 2100
          }
        },
        {
          "name": "Doña Tita Traila",
          "city": "Phoenix",
          "score": {
            "google": 4.7,
            "yelp": 3.6,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 88.5,
            "prev": 8,
            "gReviews": 741,
            "yReviews": 10
          }
        },
        {
          "name": "Las Marías",
          "city": "Peoria",
          "score": {
            "google": 4.5,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 88.5,
            "prev": 25,
            "gReviews": 363,
            "yReviews": 0
          }
        },
        {
          "name": "Chilaquiles by Irma",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 88.0,
            "prev": 5,
            "gReviews": 770,
            "yReviews": 0
          }
        },
        {
          "name": "Tortas Ahogadas Guadalajara",
          "city": "Chandler",
          "score": {
            "google": 4.5,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 86.5,
            "prev": 24,
            "gReviews": 1433,
            "yReviews": 0
          }
        },
        {
          "name": "The Social on 83rd",
          "city": "Peoria",
          "score": {
            "google": 4.3,
            "yelp": 4.1,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 85.0,
            "prev": 22,
            "gReviews": 1071,
            "yReviews": 715
          }
        },
        {
          "name": "Alebrijes Cafe & Grill",
          "city": "Litchfield Park",
          "score": {
            "google": 4.4,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 85.0,
            "prev": 16,
            "gReviews": 994,
            "yReviews": 0
          }
        },
        {
          "name": "The Mission",
          "city": "Scottsdale (2 sucursales)",
          "score": {
            "google": 4.35,
            "yelp": 3.8,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 84.2,
            "prev": 23,
            "gReviews": 4662,
            "yReviews": 4230
          }
        },
        {
          "name": "Bitz-ee Mama's",
          "city": "Glendale",
          "score": {
            "google": 4.3,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 83.5,
            "prev": 17,
            "gReviews": 1069,
            "yReviews": 0
          }
        },
        {
          "name": "El Mesquite",
          "city": "Phoenix",
          "score": {
            "google": 4.3,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 83.5,
            "prev": 14,
            "gReviews": 844,
            "yReviews": 0
          }
        },
        {
          "name": "Elly's Brunch & Café",
          "city": "Phoenix",
          "score": {
            "google": 4.3,
            "yelp": 3.7,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 83.0,
            "prev": 20,
            "gReviews": 2057,
            "yReviews": 869
          }
        },
        {
          "name": "Ahuevo Café",
          "city": "Tolleson",
          "score": {
            "google": 4.1,
            "yelp": 3.9,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 83.0,
            "prev": null,
            "gReviews": 331,
            "yReviews": 66
          }
        },
        {
          "name": "La Barquita",
          "city": "Phoenix",
          "score": {
            "google": 4.2,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 82.0,
            "prev": 10,
            "gReviews": 1586,
            "yReviews": 0
          }
        },
        {
          "name": "Chilaquiles Modern Kitchen",
          "city": "Mesa",
          "score": {
            "google": 4.1,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 80.5,
            "prev": 11,
            "gReviews": 2063,
            "yReviews": 0
          }
        }
      ],
      "method": {
        "google": 75,
        "yelp": 25,
        "award": 3,
        "influencer": 2,
        "community": 2,
        "max": 107,
        "reviewFactor": true
      }
    },
    {
      "id": "burritos",
      "label": {
        "es": "Burritos",
        "en": "Burritos"
      },
      "items": [
        {
          "name": "El Norteño",
          "dish": "Breakfast burrito",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.2,
            "noYelp": false,
            "award": "Best Breakfast Burrito 2014, 2020 y 2024",
            "influencer": false,
            "community": true,
            "total": 95.0,
            "prev": 6,
            "gReviews": 3231,
            "yReviews": 433
          }
        },
        {
          "name": "Ta'Carbon",
          "dish": "Carne asada",
          "city": "Glendale",
          "score": {
            "google": 4.6,
            "yelp": 4.5,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 93.5,
            "prev": 4,
            "gReviews": 4227,
            "yReviews": 643
          }
        },
        {
          "name": "Asadero Norte de Sonora",
          "dish": "Carne asada",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.5,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 91.5,
            "prev": 5,
            "gReviews": 1467,
            "yReviews": 245
          }
        },
        {
          "name": "Rolando's Mexican Food",
          "dish": "Breakfast burrito",
          "city": "Phoenix",
          "score": {
            "google": 4.5,
            "yelp": 4.2,
            "noYelp": false,
            "award": "Best Breakfast Burrito 2016",
            "influencer": false,
            "community": false,
            "total": 91.5,
            "prev": 12,
            "gReviews": 1317,
            "yReviews": 221
          }
        },
        {
          "name": "Topo",
          "dish": "Surf & turf",
          "city": "Gilbert",
          "score": {
            "google": 4.6,
            "yelp": 4.4,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 91.0,
            "prev": 16,
            "gReviews": 667,
            "yReviews": 384
          }
        },
        {
          "name": "Kiss Pollos",
          "dish": "Pollo asado",
          "city": "Phoenix",
          "score": {
            "google": 4.7,
            "yelp": 4.8,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 91.0,
            "prev": 10,
            "gReviews": 134,
            "yReviews": 309
          }
        },
        {
          "name": "Rita's Burritos",
          "dish": "Breakfast burrito",
          "city": "Chandler",
          "score": {
            "google": 4.6,
            "yelp": 4.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 90.5,
            "prev": 8,
            "gReviews": 859,
            "yReviews": 586
          }
        },
        {
          "name": "Elmer's Tacos",
          "dish": "Machaca",
          "city": "Chandler",
          "score": {
            "google": 4.6,
            "yelp": 4.2,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 90.0,
            "prev": 7,
            "gReviews": 3406,
            "yReviews": 709
          }
        },
        {
          "name": "PHX Burrito House",
          "dish": "Carne asada",
          "city": "Phoenix",
          "score": {
            "google": 4.4,
            "yelp": 4.2,
            "noYelp": false,
            "award": "Best Burrito 2020",
            "influencer": false,
            "community": false,
            "total": 90.0,
            "prev": 3,
            "gReviews": 1701,
            "yReviews": 1100
          }
        },
        {
          "name": "Testal Mexican Kitchen",
          "dish": "Estilo Chihuahua",
          "city": "Phoenix",
          "score": {
            "google": 4.6,
            "yelp": 4.2,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 90.0,
            "prev": 25,
            "gReviews": 608,
            "yReviews": 166
          }
        },
        {
          "name": "Señor Taco Express",
          "dish": "Breakfast burrito",
          "city": "Phoenix (3 sucursales)",
          "score": {
            "google": 4.63,
            "yelp": 4.1,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 89.9,
            "prev": 9,
            "gReviews": 770,
            "yReviews": 299
          }
        },
        {
          "name": "Rito's Mexican Food",
          "dish": "Chile verde",
          "city": "Phoenix (3 sucursales)",
          "score": {
            "google": 4.37,
            "yelp": 3.8,
            "noYelp": true,
            "award": "Best Burrito 2014, 2018 y 2024",
            "influencer": false,
            "community": true,
            "total": 89.6,
            "prev": 1,
            "gReviews": 4144,
            "yReviews": 0
          }
        },
        {
          "name": "Tacos La K'lera",
          "dish": "Big Bear Burrito",
          "city": "Tolleson",
          "score": {
            "google": 4.5,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": true,
            "total": 88.5,
            "prev": 17,
            "gReviews": 246,
            "yReviews": 0
          }
        },
        {
          "name": "Checo's Taco Shop",
          "dish": "Pollo asado",
          "city": "Scottsdale",
          "score": {
            "google": 4.5,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 86.5,
            "prev": 23,
            "gReviews": 226,
            "yReviews": 0
          }
        },
        {
          "name": "Mochilero Kitchen",
          "dish": "Breakfast burrito",
          "city": "Peoria (2 sucursales)",
          "score": {
            "google": 4.4,
            "yelp": 4.05,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 86.3,
            "prev": 18,
            "gReviews": 897,
            "yReviews": 769
          }
        },
        {
          "name": "The Original Carolina's",
          "dish": "Machaca",
          "city": "Phoenix",
          "score": {
            "google": 4.4,
            "yelp": 3.9,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 85.5,
            "prev": 2,
            "gReviews": 4949,
            "yReviews": 998
          }
        },
        {
          "name": "Los Dos Molinos",
          "dish": "Carne adovada",
          "city": "Phoenix (2 sucursales)",
          "score": {
            "google": 4.4,
            "yelp": 3.8,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 85.0,
            "prev": 20,
            "gReviews": 3386,
            "yReviews": 2089
          }
        },
        {
          "name": "Rosita's Place",
          "dish": "Chile verde",
          "city": "Phoenix",
          "score": {
            "google": 4.4,
            "yelp": 3.8,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 85.0,
            "prev": 15,
            "gReviews": 2962,
            "yReviews": 611
          }
        },
        {
          "name": "Fiesta Burrito",
          "dish": "Carne asada",
          "city": "Scottsdale",
          "score": {
            "google": 4.4,
            "yelp": 3.8,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 85.0,
            "prev": 13,
            "gReviews": 1620,
            "yReviews": 448
          }
        },
        {
          "name": "La Casa de Juana",
          "dish": "Juana's Burrito",
          "city": "Tempe",
          "score": {
            "google": 4.4,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 85.0,
            "prev": 22,
            "gReviews": 852,
            "yReviews": 0
          }
        },
        {
          "name": "Taco Taco AZ",
          "dish": "Carne asada",
          "city": "Surprise",
          "score": {
            "google": 4.6,
            "yelp": 3.8,
            "noYelp": true,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 84.6,
            "prev": 24,
            "gReviews": 95,
            "yReviews": 0
          }
        },
        {
          "name": "Someburros",
          "dish": "Machaca",
          "city": "Tempe (2 sucursales)",
          "score": {
            "google": 4.35,
            "yelp": 3.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 81.7,
            "prev": 19,
            "gReviews": 3673,
            "yReviews": 1115
          }
        },
        {
          "name": "Los Favoritos",
          "dish": "Breakfast burrito",
          "city": "Mesa (2 sucursales)",
          "score": {
            "google": 4.3,
            "yelp": 3.3,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 81.0,
            "prev": 11,
            "gReviews": 2131,
            "yReviews": 537
          }
        },
        {
          "name": "Herrera's Mexican Food",
          "dish": "Breakfast burrito",
          "city": "Peoria",
          "score": {
            "google": 4.0,
            "yelp": 3.7,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 78.5,
            "prev": 21,
            "gReviews": 759,
            "yReviews": 115
          }
        },
        {
          "name": "Burrito Express",
          "dish": "Breakfast burrito",
          "city": "Gilbert (3 sucursales)",
          "score": {
            "google": 3.97,
            "yelp": 3.35,
            "noYelp": false,
            "award": false,
            "influencer": false,
            "community": false,
            "total": 76.3,
            "prev": 14,
            "gReviews": 2459,
            "yReviews": 720
          }
        }
      ],
      "method": {
        "google": 75,
        "yelp": 25,
        "award": 3,
        "influencer": 2,
        "community": 2,
        "max": 107,
        "reviewFactor": true
      }
    },
    {
      "id": "hamburguesas",
      "label": {
        "es": "Hamburguesas",
        "en": "Burgers"
      },
      "items": [
        {
          "name": "Harvey's Wineburger",
          "dish": "Mushroom burger",
          "city": "Phoenix"
        },
        {
          "name": "Chicago Hamburger Co.",
          "dish": "Cheeseburger clásico",
          "city": "Phoenix"
        },
        {
          "name": "La Hamburguesa",
          "dish": "The Mexican",
          "city": "Phoenix"
        },
        {
          "name": "Paradise Valley Burger Co.",
          "dish": "The Fritter",
          "city": "Scottsdale"
        },
        {
          "name": "Bad Jimmy's",
          "dish": "Smash burger",
          "city": "Phoenix"
        },
        {
          "name": "The Stand",
          "dish": "Arcadia burger",
          "city": "Phoenix"
        },
        {
          "name": "Rehab Burger Therapy",
          "dish": "Burger XL",
          "city": "Scottsdale"
        },
        {
          "name": "The Chuckbox",
          "dish": "Tijuana Torpedo",
          "city": "Tempe"
        },
        {
          "name": "Happy's Hamburgers",
          "dish": "Cheeseburger",
          "city": "Scottsdale"
        },
        {
          "name": "Stoop Kid",
          "dish": "Smash burger",
          "city": "Phoenix"
        },
        {
          "name": "Main Burger",
          "dish": "La Sonora",
          "city": "Mesa"
        },
        {
          "name": "El Barajas Ribs & Burgers",
          "dish": "Hamburguesa al carbón",
          "city": "Glendale"
        },
        {
          "name": "Hopdoddy Burger Bar",
          "dish": "El Diablo",
          "city": "Phoenix"
        },
        {
          "name": "Rocket Burger & Subs",
          "dish": "Cheeseburger",
          "city": "Phoenix"
        },
        {
          "name": "Wally Burger",
          "dish": "En pan hawaiano",
          "city": "Glendale"
        },
        {
          "name": "Michoakan Burger",
          "dish": "Estilo Michoacán",
          "city": "Phoenix"
        },
        {
          "name": "Culinary Gangster",
          "dish": "Mushroom & Swiss",
          "city": "Phoenix"
        },
        {
          "name": "Miracle Mile Deli",
          "dish": "Mile Burger",
          "city": "Phoenix"
        },
        {
          "name": "Liberty Market",
          "dish": "Tower Burger",
          "city": "Gilbert"
        },
        {
          "name": "Giant Hamburgers",
          "dish": "Giant burger",
          "city": "Mesa"
        },
        {
          "name": "Chase's Diner",
          "dish": "Burger de diner",
          "city": "Chandler"
        },
        {
          "name": "UNiQ Burger",
          "dish": "Vegana",
          "city": "Scottsdale"
        },
        {
          "name": "Wild Horse West",
          "dish": "Burger de rancho",
          "city": "Peoria"
        },
        {
          "name": "Benny's Burgers & BBQ",
          "dish": "Burger & BBQ",
          "city": "Sun City"
        },
        {
          "name": "Baba's Burgers & Birds",
          "dish": "Smash burger",
          "city": "Peoria"
        }
      ]
    },
    {
      "id": "sushi-mexicano",
      "label": {
        "es": "Sushi Mexicano",
        "en": "Mexican Sushi"
      },
      "items": [
        {
          "name": "El Tataki Sushi",
          "dish": "Cielo, Mar y Tierra",
          "city": "Avondale"
        },
        {
          "name": "Sushinola Roll",
          "dish": "Rollo de aguachile",
          "city": "Phoenix"
        },
        {
          "name": "Sushi Sonora",
          "dish": "Sushi Dog",
          "city": "Phoenix"
        },
        {
          "name": "Xami Sushi",
          "dish": "Rollo empanizado",
          "city": "Phoenix"
        },
        {
          "name": "Sushino Mexican Roll",
          "dish": "Mexican roll",
          "city": "Phoenix"
        },
        {
          "name": "Sushi y Mariscos Los Plebes",
          "dish": null,
          "city": "Mesa"
        },
        {
          "name": "Mariscos y Sushi El Kora",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Sushi Mocorito",
          "dish": "La Phoenikera",
          "city": "Phoenix"
        },
        {
          "name": "Erickitoo Culiacán",
          "dish": "Estilo Culiacán",
          "city": "Phoenix"
        },
        {
          "name": "Señor Sushi",
          "dish": "Rollos mexicanos",
          "city": "Phoenix"
        },
        {
          "name": "Mv Snacks & Sushi Bar",
          "dish": null,
          "city": "Mesa"
        },
        {
          "name": "Culichi Sushi",
          "dish": "Estilo culichi",
          "city": "Phoenix"
        },
        {
          "name": "SUSHI-TO",
          "dish": "Fusión mex-japonesa",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos y Sushi El Dorado",
          "dish": "Estilo Sinaloa",
          "city": "Glendale"
        },
        {
          "name": "Sushi y Tacos Del Valle",
          "dish": null,
          "city": "Tolleson"
        },
        {
          "name": "El Rey de los Mariscos y Sushi",
          "dish": null,
          "city": "Tolleson"
        },
        {
          "name": "La Office Mariscos y Sushis",
          "dish": null,
          "city": "Glendale"
        },
        {
          "name": "Sushi Long y Birria",
          "dish": null,
          "city": "Tolleson"
        },
        {
          "name": "Sushiwins",
          "dish": "El Guamuchilito",
          "city": "Glendale"
        },
        {
          "name": "Suchilango",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Yorokobi Sushi",
          "dish": "Estilo Sonora",
          "city": "Phoenix"
        },
        {
          "name": "Tamasushi",
          "dish": null,
          "city": "Tolleson"
        },
        {
          "name": "Neto's Fusion Cuisine",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Sushi Volla",
          "dish": null,
          "city": "Glendale"
        },
        {
          "name": "Sushilonn",
          "dish": null,
          "city": "Phoenix"
        }
      ]
    },
    {
      "id": "panaderias",
      "label": {
        "es": "Panaderías",
        "en": "Bakeries"
      },
      "items": [
        {
          "name": "La Purísima Bakery",
          "dish": "Conchas",
          "city": "Glendale"
        },
        {
          "name": "Panadería La Estrella",
          "dish": null,
          "city": "Mesa"
        },
        {
          "name": "Panadería La Central",
          "dish": "Conchas y empanadas",
          "city": "Avondale"
        },
        {
          "name": "Carmen's Bakery",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Panadería Los Jarochos",
          "dish": "Pan veracruzano",
          "city": "Phoenix"
        },
        {
          "name": "La Fama Mexican Bakery",
          "dish": null,
          "city": "Glendale"
        },
        {
          "name": "Panadería El Güero",
          "dish": "Pan y tamales",
          "city": "Phoenix"
        },
        {
          "name": "Panadería La Tapatía",
          "dish": "Pan y comedor",
          "city": "Phoenix"
        },
        {
          "name": "Panadería El Zócalo",
          "dish": null,
          "city": "Mesa"
        },
        {
          "name": "Las Espigas Bakery",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Mi Panadería",
          "dish": null,
          "city": "Avondale"
        },
        {
          "name": "Pan de Mujer Sinaloa",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Panadería La Obregonense",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Champis Bakery",
          "dish": null,
          "city": "Avondale"
        },
        {
          "name": "Panadería Guerrero",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Los Reyes Bakery",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "La Reyna Bakery",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Panadería El Buen Gusto",
          "dish": null,
          "city": "El Mirage"
        },
        {
          "name": "Panadería Cristal",
          "dish": null,
          "city": "Glendale"
        },
        {
          "name": "La Grandísima Bakery",
          "dish": null,
          "city": "Glendale"
        },
        {
          "name": "La Familia Panadería",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Diana's Bakery",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Dulce Poblana",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "La Guadalupana Bakery",
          "dish": null,
          "city": "Gilbert"
        },
        {
          "name": "Panadería Acapulco",
          "dish": null,
          "city": "Phoenix"
        }
      ]
    },
    {
      "id": "carnicerias",
      "label": {
        "es": "Carnicerías",
        "en": "Butcher Shops"
      },
      "items": [
        {
          "name": "Carnicería Sonora",
          "dish": "Carne asada marinada",
          "city": "Tempe"
        },
        {
          "name": "Carnicería Los Pinos",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Carnicería Murrieta's",
          "dish": null,
          "city": "Mesa"
        },
        {
          "name": "Carnicería Los Amigos",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Carnicería Agave",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Los Altos Ranch Market",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Carnicería Del Pacífico",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Carnicería El Herradero",
          "dish": "Carnitas",
          "city": "Chandler"
        },
        {
          "name": "Carnicería México",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "La Calidad Meat Market",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Parrillero Meat Market",
          "dish": null,
          "city": "Glendale"
        },
        {
          "name": "El Alamo Super Carnicería",
          "dish": null,
          "city": "Chandler"
        },
        {
          "name": "Carnicería El Rancho",
          "dish": null,
          "city": "Gilbert"
        },
        {
          "name": "Carnicería Rancho Alegre",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "La Hereford Meat Market",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Rancho 33 Carnicería",
          "dish": null,
          "city": "Peoria"
        },
        {
          "name": "Carnicería El Charro",
          "dish": null,
          "city": "Tolleson"
        },
        {
          "name": "Carnicería Mi Ranchito",
          "dish": null,
          "city": "Avondale"
        },
        {
          "name": "Carnicería El Camino",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Carnicería El Rodeo",
          "dish": null,
          "city": "Tolleson"
        },
        {
          "name": "Carnicería La Tapatía",
          "dish": null,
          "city": "Avondale"
        },
        {
          "name": "Carnicería Uruapan",
          "dish": null,
          "city": "El Mirage"
        },
        {
          "name": "Carnicería El Potrero",
          "dish": null,
          "city": "Chandler"
        },
        {
          "name": "Carnicería Los Reyes",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "La Familia Carnicería",
          "dish": null,
          "city": "Phoenix"
        }
      ]
    },
    {
      "id": "tortas",
      "label": {
        "es": "Tortas",
        "en": "Tortas"
      },
      "items": [
        {
          "name": "Los Reyes de la Torta",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Tortas El Rey",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Tortas El Güero",
          "dish": "Cochinita pibil",
          "city": "Phoenix"
        },
        {
          "name": "Tortas Manantial",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Tortas Paquimé",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Tortas El Chavo",
          "dish": null,
          "city": "Mesa"
        },
        {
          "name": "Tortas Ahogadas George",
          "dish": "Torta ahogada",
          "city": "Tolleson"
        },
        {
          "name": "Tortas Ahogadas Guadalajara",
          "dish": "Torta ahogada",
          "city": "Chandler"
        },
        {
          "name": "El Rey de la Torta",
          "dish": null,
          "city": "Glendale"
        },
        {
          "name": "Taquería Mí Casita",
          "dish": null,
          "city": "Chandler"
        },
        {
          "name": "I Love Tortas & Tacos",
          "dish": null,
          "city": "Mesa"
        },
        {
          "name": "El Multi Tacos y Tortas",
          "dish": null,
          "city": "Mesa"
        },
        {
          "name": "Picossitos",
          "dish": null,
          "city": "Avondale"
        },
        {
          "name": "Tortas Sinaí",
          "dish": null,
          "city": "Mesa"
        },
        {
          "name": "Tortas Ahogadas La Viejona",
          "dish": "Torta ahogada",
          "city": "Laveen"
        }
      ]
    }
  ],
};
