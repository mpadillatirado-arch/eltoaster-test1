/* City rankings for eltoaster.com/rankings.
 *
 * Phoenix lists come from the phoenix-food-rankings skill (published
 * Instagram rankings, Nov 2026 snapshot). Cities without lists show
 * "Coming soon". Only places FREE_FROM+1..FREE_TO are open (4-6); the
 * top 3 and the rest need a name and email (saved in public.ranking_leads).
 */

export const FREE_FROM = 3;
export const FREE_TO = 6;

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
          "city": null
        },
        {
          "name": "Tacos Chiwas",
          "dish": "Variado",
          "city": null
        },
        {
          "name": "Los Vales",
          "dish": "Birria crujiente",
          "city": null
        },
        {
          "name": "Asadero Pitic",
          "dish": "Asada sonorense",
          "city": null
        },
        {
          "name": "Ta'Carbon",
          "dish": "Asada sonorense",
          "city": null
        },
        {
          "name": "Taco Boys",
          "dish": "Asada y tripa",
          "city": null
        },
        {
          "name": "Restaurante Lomas",
          "dish": "Asada, cabeza y Minini",
          "city": null
        },
        {
          "name": "Tacos El Rojo",
          "dish": "Adobada estilo TJ",
          "city": null
        },
        {
          "name": "Tacos Huicho",
          "dish": "Al pastor estilo chilango",
          "city": null
        },
        {
          "name": "Tacos Chava",
          "dish": "Asada tipo cebosito",
          "city": null
        },
        {
          "name": "Asadero Sonora",
          "dish": "Asada sonorense",
          "city": null
        },
        {
          "name": "Tacos Lin",
          "dish": "Al pastor",
          "city": null
        },
        {
          "name": "La Santísima",
          "dish": "Taco de mole negro",
          "city": null
        },
        {
          "name": "Birrieria Tijuana",
          "dish": "Birria estilo Tijuana",
          "city": null
        },
        {
          "name": "Unos Tacos y Birria",
          "dish": "Birria de res",
          "city": null
        },
        {
          "name": "Tacos del Pepe",
          "dish": "Asada sonorense",
          "city": null
        },
        {
          "name": "El Fundador",
          "dish": "Campechano",
          "city": null
        },
        {
          "name": "Taco Chelo",
          "dish": "Quesadillas",
          "city": null
        },
        {
          "name": "Mi Lindo Michoacán",
          "dish": "Carnitas",
          "city": null
        },
        {
          "name": "Taquería El Trompo",
          "dish": "Al pastor estilo chilango",
          "city": null
        },
        {
          "name": "Tacos Sahuaro",
          "dish": "Tacos de la casa",
          "city": null
        },
        {
          "name": "Don Camarón",
          "dish": "Taco de camarón",
          "city": null
        },
        {
          "name": "Santa Madre Taco Shop",
          "dish": "Fish taco",
          "city": null
        },
        {
          "name": "La Frontera",
          "dish": "Taco de carnitas",
          "city": null
        },
        {
          "name": "Tacos Calafia",
          "dish": "Adobada estilo TJ",
          "city": null
        }
      ]
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
          "city": null
        },
        {
          "name": "Nogales Hot Dogs",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Emilio's Tacos & Hotdogs",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Der Wurst",
          "dish": "New York style",
          "city": null
        },
        {
          "name": "El Sabroso",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Chicago Hamburger Co.",
          "dish": "Chicago style",
          "city": null
        },
        {
          "name": "Lupita's Hot Dogs",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Pa Los Hotdogs",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Johnny's Burgers & Dogs",
          "dish": "Chicago style",
          "city": null
        },
        {
          "name": "Los del Nene",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Simon's Hot Dogs",
          "dish": "Hot dog estilo colombiano",
          "city": null
        },
        {
          "name": "5 Hermanos Hot Dogs",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Hot Dogs La Yaquesita",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Micky's Hot Dogs",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Lucky Boy",
          "dish": "Hot dog clásico",
          "city": null
        },
        {
          "name": "Detroit Coney Grill",
          "dish": "Coney style",
          "city": null
        },
        {
          "name": "RoRo Dogs",
          "dish": "Chicago style",
          "city": null
        },
        {
          "name": "El Exquisito",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Secret Dogs",
          "dish": "Chicago style",
          "city": null
        },
        {
          "name": "Los Mayitos Hot Dogs",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Dogos de la H",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Dogos Guadalupe",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Hot Dogs El Mago",
          "dish": "Hot dog estilo Sonora",
          "city": null
        },
        {
          "name": "Loaded Dogs",
          "dish": "New York style",
          "city": null
        },
        {
          "name": "Hot Dogs Los Mochis",
          "dish": "Hot dog estilo Sinaloa",
          "city": null
        }
      ]
    },
    {
      "id": "mariscos",
      "label": {
        "es": "Mariscos",
        "en": "Seafood"
      },
      "items": [
        {
          "name": "Mariscos El Profe",
          "dish": "Ceviche mixto y aguachile",
          "city": "Phoenix"
        },
        {
          "name": "Los Arbolitos de Cajeme",
          "dish": "Aguachile estilo Sonora",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos El Cochorit",
          "dish": "Campechana especial",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos A Todo Mar",
          "dish": "Aguachile rojo",
          "city": "Phoenix"
        },
        {
          "name": "Tacos y Mariscos El Sinaloa",
          "dish": "Aguachile",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos Playa Hermosa",
          "dish": "Camarones locos",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos Las Culichis",
          "dish": "Mixtiadas estilo Culiacán",
          "city": "Phoenix"
        },
        {
          "name": "Marisco Boys",
          "dish": "Tostada de yellowtail",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos Bahía de Guaymas",
          "dish": "Empanadas de camarón",
          "city": "Phoenix"
        },
        {
          "name": "San Diego Bay",
          "dish": "Molcajete de mariscos",
          "city": "Guadalupe"
        },
        {
          "name": "Mariscos El Dorado Sinaloa",
          "dish": "Torre El Dorado",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos El Rey",
          "dish": "Aguachile bandera",
          "city": "Mesa"
        },
        {
          "name": "Mariscos El Molcajete",
          "dish": "Molcajete",
          "city": "Peoria"
        },
        {
          "name": "Ceviche 101",
          "dish": "Taco 101 y tostadas",
          "city": "Glendale"
        },
        {
          "name": "Bertha's Los Mochis",
          "dish": "Tacos de marlín",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos Las Islitas",
          "dish": "Estilo Nayarit",
          "city": "Phoenix"
        },
        {
          "name": "El Rey de los Ostiones",
          "dish": "Ostiones preparados",
          "city": "Phoenix"
        },
        {
          "name": "El Wero Marisquero",
          "dish": "Tostadas de mariscos",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos Ensenada",
          "dish": "Ceviche y micheladas",
          "city": "Phoenix"
        },
        {
          "name": "Chuchulukos El Sinaloa",
          "dish": "Aguachile estilo Sinaloa",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos Vuelve a la Vida",
          "dish": "Coctel Vuelve a la Vida",
          "city": "Phoenix"
        },
        {
          "name": "Vaca Lola",
          "dish": "Cocina sinaloense",
          "city": "Phoenix"
        },
        {
          "name": "Mariscos El Wicho",
          "dish": "Aguachiles y cocteles",
          "city": "Phoenix"
        },
        {
          "name": "Marisa's Seafood Cocina",
          "dish": "Ceviche de camarón",
          "city": "Phoenix"
        },
        {
          "name": "El Pacífico Mariscos",
          "dish": "Ceviche",
          "city": "Phoenix"
        }
      ]
    },
    {
      "id": "chilaquiles",
      "label": {
        "es": "Chilaquiles",
        "en": "Chilaquiles"
      },
      "items": [
        {
          "name": "Comedor Guadalajara",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Presidio Cocina Mexicana",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Gallo Blanco",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Otro Café",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Chilaquiles by Irma",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Cocina Madrigal",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Centrico",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Doña Tita Traila",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Cocina Adamex",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "La Barquita",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Chilaquiles Modern Kitchen",
          "dish": null,
          "city": "Mesa"
        },
        {
          "name": "Chilakil To Go",
          "dish": null,
          "city": "Glendale"
        },
        {
          "name": "El Sol Mexican Cafe",
          "dish": null,
          "city": "Chandler"
        },
        {
          "name": "El Mesquite",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Pepe's Taco Villa",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Alebrijes Cafe & Grill",
          "dish": null,
          "city": "Litchfield Park"
        },
        {
          "name": "Bitz-ee Mama's",
          "dish": null,
          "city": "Glendale"
        },
        {
          "name": "Ghost Ranch",
          "dish": null,
          "city": "Tempe"
        },
        {
          "name": "Liberty Market",
          "dish": null,
          "city": "Gilbert"
        },
        {
          "name": "Elly's Brunch & Café",
          "dish": null,
          "city": "Phoenix"
        },
        {
          "name": "Soul Café",
          "dish": null,
          "city": "Scottsdale"
        },
        {
          "name": "The Social on 83rd",
          "dish": null,
          "city": "Peoria"
        },
        {
          "name": "The Mission",
          "dish": null,
          "city": "Scottsdale"
        },
        {
          "name": "Tortas Ahogadas Guadalajara",
          "dish": null,
          "city": "Chandler"
        },
        {
          "name": "Las Marías",
          "dish": null,
          "city": "Peoria"
        }
      ]
    },
    {
      "id": "burritos",
      "label": {
        "es": "Burritos",
        "en": "Burritos"
      },
      "items": [
        {
          "name": "Rito's Mexican Food",
          "dish": "Chile verde",
          "city": "Phoenix"
        },
        {
          "name": "The Original Carolina's",
          "dish": "Machaca",
          "city": "Phoenix"
        },
        {
          "name": "PHX Burrito House",
          "dish": "Carne asada",
          "city": "Phoenix"
        },
        {
          "name": "Ta'Carbon",
          "dish": "Carne asada",
          "city": "Glendale"
        },
        {
          "name": "Asadero Norte de Sonora",
          "dish": "Carne asada",
          "city": "Phoenix"
        },
        {
          "name": "El Norteño",
          "dish": "Breakfast burrito",
          "city": "Phoenix"
        },
        {
          "name": "Elmer's Tacos",
          "dish": "Machaca",
          "city": "Chandler"
        },
        {
          "name": "Rita's Burritos",
          "dish": "Breakfast burrito",
          "city": "Chandler"
        },
        {
          "name": "Señor Taco Express",
          "dish": "Breakfast burrito",
          "city": "Phoenix"
        },
        {
          "name": "Kiss Pollos",
          "dish": "Pollo asado",
          "city": "Phoenix"
        },
        {
          "name": "Los Favoritos",
          "dish": "Breakfast burrito",
          "city": "Mesa"
        },
        {
          "name": "Rolando's Mexican Food",
          "dish": "Breakfast burrito",
          "city": "Phoenix"
        },
        {
          "name": "Fiesta Burrito",
          "dish": "Carne asada",
          "city": "Scottsdale"
        },
        {
          "name": "Burrito Express",
          "dish": "Breakfast burrito",
          "city": "Gilbert"
        },
        {
          "name": "Rosita's Place",
          "dish": "Chile verde",
          "city": "Phoenix"
        },
        {
          "name": "Topo",
          "dish": "Surf & turf",
          "city": "Gilbert"
        },
        {
          "name": "Tacos La K'lera",
          "dish": "Big Bear Burrito",
          "city": "Tolleson"
        },
        {
          "name": "Mochilero Kitchen",
          "dish": "Breakfast burrito",
          "city": "Peoria"
        },
        {
          "name": "Someburros",
          "dish": "Machaca",
          "city": "Tempe"
        },
        {
          "name": "Los Dos Molinos",
          "dish": "Carne adovada",
          "city": "Phoenix"
        },
        {
          "name": "Herrera's Mexican Food",
          "dish": "Breakfast burrito",
          "city": "Peoria"
        },
        {
          "name": "La Casa de Juana",
          "dish": "Juana's Burrito",
          "city": "Tempe"
        },
        {
          "name": "Checo's Taco Shop",
          "dish": "Pollo asado",
          "city": "Scottsdale"
        },
        {
          "name": "Taco Taco AZ",
          "dish": "Carne asada",
          "city": "Surprise"
        },
        {
          "name": "Testal Mexican Kitchen",
          "dish": "Estilo Chihuahua",
          "city": "Phoenix"
        }
      ]
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
