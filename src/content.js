// Bilingual copy. Spanish is the default — the primary audience is
// Latino restaurant owners across the Phoenix metro.

export const content = {
  es: {
    nav: { how: "Cómo funciona", calc: "Calculadora", diag: "El diagnóstico", cta: "Diagnóstico gratis" },

    hero: {
      eyebrow: "Phoenix · Mesa · Glendale · Tempe · Gilbert · Chandler · Cave Creek · Queen Creek",
      h1a: "Tus reseñas ya te están costando",
      h1b: "dinero real",
      lede: "Cada estrella en Google vale entre 5% y 9% de tus ventas. Te hago un diagnóstico gratuito de tu reputación en línea — con datos de Google, Yelp y TripAdvisor — y te digo exactamente cuánto estás dejando en la mesa.",
      cta1: "Pedir mi diagnóstico gratis",
      cta2: "Ver cuánto pierdo",
      t1: "Sin costo",
      t2: "Resultados en 48 horas",
      t3: "En español o inglés",
    },

    stats: [
      { n: "5–9%", l: "de cambio en ventas por cada estrella, según Harvard Business School" },
      { n: "93%", l: "de los comensales leen reseñas antes de decidir dónde comer" },
      { n: "48 h", l: "es lo que tardo en entregarte el diagnóstico completo" },
      { n: "$0", l: "lo que cuesta. Sin contrato, sin compromiso de compra" },
    ],

    problem: {
      eyebrow: "El problema",
      h2: "No es que no sepas cocinar. Es que nadie está midiendo lo que dicen de ti.",
      lede: "La mayoría de los restaurantes familiares en Phoenix compiten con comida excelente y una reputación en línea que nadie revisa. Estos son los tres huecos por donde se va el dinero.",
      items: [
        {
          h: "Estás por debajo del promedio y no lo sabes",
          p: "Un 3.8 se siente bien hasta que ves que tu categoría promedia 4.3. Esa diferencia de media estrella son miles de dólares al año en clientes que eligieron otro lugar.",
        },
        {
          h: "Las quejas se repiten y nadie las agrupa",
          p: "«Tardaron mucho», «se equivocaron con la orden», «no aceptan tarjeta». Una reseña es una opinión. Cuarenta reseñas diciendo lo mismo es un problema de operación que se puede arreglar.",
        },
        {
          h: "Nadie responde las reseñas en español",
          p: "Tu clientela escribe en español y en inglés. Si solo respondes en uno — o no respondes — estás perdiendo la mitad de la conversación y la señal que Google usa para posicionarte.",
        },
      ],
    },

    calc: {
      eyebrow: "Calculadora",
      h2: "Haz el número tú mismo",
      lede: "Mueve las barras con tus datos reales. La fórmula viene del estudio de Harvard Business School sobre reseñas y ventas.",
      rating: "Tu calificación actual en Google",
      target: "A dónde podrías llegar",
      revenue: "Ventas anuales aproximadas",
      resultLabel: "Oportunidad anual estimada",
      rangeText: (lo, hi) => `Rango realista: entre <b>${lo}</b> y <b>${hi}</b> al año, según qué tan rápido se muevan las reseñas.`,
      note: "Cálculo basado en Luca, M. (Harvard Business School, 2011): un cambio de una estrella se asocia con un cambio de 5–9% en ingresos. Es una estimación para orientar la conversación, no una promesa de resultados.",
      zero: "Sube tu meta por encima de tu calificación actual para ver la oportunidad.",
    },

    diag: {
      eyebrow: "Qué recibes",
      h2: "Un reporte real de lo que opinan tus clientes, hecho para darte resultados tangibles",
      lede: "No es un PDF genérico. Es tu restaurante, tus reseñas, tus números — y una lista de qué arreglar primero.",
      cards: [
        { i: "★", h: "Tu posición real", p: "Tu calificación comparada con el promedio de tu categoría y con los competidores directos en tu código postal." },
        { i: "◎", h: "Los temas que se repiten", p: "Agrupo todas tus reseñas por tema: comida, servicio, tiempos de espera, precio, limpieza y autenticidad." },
        { i: "$", h: "El impacto en dólares", p: "Cuánto vale medio punto de calificación en tu operación, con tus ventas como base del cálculo." },
        { i: "✓", h: "Plan de 3 acciones", p: "Plan de acción basado en las áreas de oportunidad operativas de tu negocio: las tres cosas que más mueven la aguja en tu caso, en orden, con el esfuerzo que requiere cada una." },
        { i: "⇄", h: "Guion de respuestas", p: "Plantillas en español e inglés para responder reseñas buenas y malas sin sonar a robot." },
        { i: "📍", h: "Tu Perfil de Negocio en Google", p: "Reviso tu Google Business Profile completo — horarios, fotos, categorías, atributos, menú — para que tengas todo lo necesario y así generar más ventas y atraer más clientes." },
      ],
    },

    steps: {
      eyebrow: "Cómo funciona",
      h2: "Tres pasos. Ninguno te cuesta.",
      items: [
        { h: "Me das el nombre y la dirección", p: "Nada más. No necesito acceso a tus sistemas, ni a tu punto de venta, ni a tus cuentas." },
        { h: "Analizo tus reseñas públicas", p: "Agrego todas tus reseñas reales en Google, Yelp y TripAdvisor y las agrupo por tema y por mes. También reviso tu Google Business Profile completo para que tengas todos los atributos necesarios y generes más ventas." },
        { h: "Nos sentamos 20 minutos", p: "Te explico el reporte en persona o por video, en el idioma que prefieras. Te lo llevas aunque no trabajemos juntos." },
      ],
    },

    form: {
      eyebrow: "Empecemos",
      h2: "Pide tu diagnóstico gratuito",
      lede: "Llena los datos y te contacto en menos de 24 horas hábiles. Si prefieres hablar directo, escríbeme.",
      checklist: [
        "Reporte completo sin costo ni compromiso",
        "Atención en español o inglés, como prefieras",
        "Hecho para restaurantes del área de Phoenix",
        "Tus datos no se comparten ni se venden",
      ],
      quote: "Trabajo con dueños de restaurantes todos los días. La conversación siempre empieza igual: con datos, no con una presentación de ventas.",
      quoteBy: "Mario Padilla · Strategic Cuisines Account Executive",
      f: {
        restaurant: "Nombre del restaurante",
        name: "Tu nombre",
        email: "Correo electrónico",
        phone: "Teléfono (opcional)",
        city: "Ciudad",
        locations: "Número de ubicaciones",
        challenge: "¿Cuál es tu reto más grande ahora mismo? (opcional)",
        lang: "Prefiero que me contacten en",
        langEs: "Español",
        langEn: "Inglés",
        submit: "Enviar y recibir mi diagnóstico",
        sending: "Enviando…",
        note: "Al enviar aceptas que Mario Padilla te contacte sobre tu diagnóstico. Sin spam, sin listas de correo.",
      },
      cityPlaceholder: "Phoenix",
      locPlaceholder: "1",
      okTitle: "¡Listo! Ya tengo tus datos.",
      okBody: "Te contacto en menos de 24 horas hábiles con los siguientes pasos. Revisa tu correo — y la carpeta de spam, por si acaso.",
      error: "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo, o escríbeme directo a mario.padilla@toasttab.com.",
    },

    foot: {
      h: "¿Listo para saber qué dicen realmente de tu restaurante?",
      cta: "Pedir diagnóstico gratis",
      rights: "Hecho en Phoenix, Arizona.",
      disclaimer: "Sitio personal de Mario Padilla. Las estimaciones de ingresos son orientativas y no constituyen una garantía de resultados.",
    },

    quick: {
      title: "Pedir mi diagnóstico gratis",
      lede: "Tres datos y te contacto en menos de 24 horas hábiles.",
      business: "Nombre del restaurante",
      email: "Correo electrónico",
      location: "Ciudad o ubicación",
      locationPlaceholder: "Phoenix, AZ",
      submit: "Enviar",
      sending: "Enviando…",
      close: "Cerrar",
      okTitle: "¡Listo!",
      okBody: "Recibí tus datos y te contacto en menos de 24 horas hábiles.",
      error: "No se pudo enviar. Inténtalo de nuevo o escríbeme a mario.padilla@toasttab.com.",
      moreDetail: "¿Prefieres darme más contexto ahora?",
      moreDetailLink: "Usa el formulario completo",
    },

    midCta: {
      h: "¿Seguimos? Pide tu diagnóstico gratis antes de que se te olvide.",
      cta: "Pedir mi diagnóstico gratis",
    },

    clients: {
      eyebrow: "Clientes",
      h2: "Restaurantes que ya confían en este proceso",
      lede: "Marcas independientes del área de Phoenix con las que he trabajado.",
      items: [
        { key: "las-culichis", name: "Las Culichis Mariscos" },
        { key: "padel-pals", name: "Padel Pals" },
        { key: "sushino", name: "Sushino Mexican Roll" },
      ],
    },
  },

  en: {
    nav: { how: "How it works", calc: "Calculator", diag: "The diagnostic", cta: "Free diagnostic" },

    hero: {
      eyebrow: "Phoenix · Mesa · Glendale · Tempe · Gilbert · Chandler · Cave Creek · Queen Creek",
      h1a: "Your reviews are already costing you",
      h1b: "real money",
      lede: "Every star on Google is worth 5–9% of your sales. I'll run a free diagnostic on your online reputation — pulling from Google, Yelp and TripAdvisor — and show you exactly what you're leaving on the table.",
      cta1: "Get my free diagnostic",
      cta2: "See what I'm losing",
      t1: "No cost",
      t2: "Results in 48 hours",
      t3: "In English or Spanish",
    },

    stats: [
      { n: "5–9%", l: "revenue shift per star, per Harvard Business School research" },
      { n: "93%", l: "of diners read reviews before choosing where to eat" },
      { n: "48 h", l: "turnaround on your complete diagnostic report" },
      { n: "$0", l: "what it costs. No contract, no obligation to buy" },
    ],

    problem: {
      eyebrow: "The problem",
      h2: "It's not the food. It's that nobody is measuring what people say about you.",
      lede: "Most family-run restaurants in Phoenix compete with excellent food and an online reputation nobody reviews. These are the three places the money leaks out.",
      items: [
        {
          h: "You're below average and don't know it",
          p: "A 3.8 feels fine until you learn your category averages 4.3. That half-star gap is thousands of dollars a year in guests who picked somewhere else.",
        },
        {
          h: "The same complaints repeat and nobody groups them",
          p: "\"Took too long.\" \"Order was wrong.\" \"They don't take cards.\" One review is an opinion. Forty saying the same thing is an operations problem you can fix.",
        },
        {
          h: "Nobody answers reviews in Spanish",
          p: "Your guests write in both languages. If you only answer in one — or don't answer at all — you're missing half the conversation and the signal Google uses to rank you.",
        },
      ],
    },

    calc: {
      eyebrow: "Calculator",
      h2: "Run the number yourself",
      lede: "Move the sliders with your real figures. The formula comes from Harvard Business School research on reviews and revenue.",
      rating: "Your current Google rating",
      target: "Where you could get to",
      revenue: "Approximate annual revenue",
      resultLabel: "Estimated annual opportunity",
      rangeText: (lo, hi) => `Realistic range: between <b>${lo}</b> and <b>${hi}</b> a year, depending on how fast the reviews move.`,
      note: "Based on Luca, M. (Harvard Business School, 2011): a one-star change is associated with a 5–9% change in revenue. This is an estimate to frame the conversation, not a promise of results.",
      zero: "Set your target above your current rating to see the opportunity.",
    },

    diag: {
      eyebrow: "What you get",
      h2: "A real report on what your customers are saying, built to get you tangible results",
      lede: "Not a generic PDF. Your restaurant, your reviews, your numbers — and a list of what to fix first.",
      cards: [
        { i: "★", h: "Where you actually stand", p: "Your rating against your category average and the direct competitors in your zip code." },
        { i: "◎", h: "The themes that repeat", p: "Every review grouped by theme: food, service, wait times, price, cleanliness and authenticity." },
        { i: "$", h: "The dollar impact", p: "What half a rating point is worth in your operation, calculated against your actual revenue." },
        { i: "✓", h: "A 3-action plan", p: "An action plan based on your business's operational opportunity areas: the three things that move the needle most in your case, ranked, with the effort each one takes." },
        { i: "⇄", h: "Response scripts", p: "Templates in English and Spanish for answering good and bad reviews without sounding like a robot." },
        { i: "📍", h: "Your Google Business Profile", p: "I review your full Google Business Profile — hours, photos, categories, attributes, menu — so you have everything needed to drive more sales and attract more customers." },
      ],
    },

    steps: {
      eyebrow: "How it works",
      h2: "Three steps. None of them cost you.",
      items: [
        { h: "Give me the name and address", p: "That's it. I don't need access to your systems, your POS, or any of your accounts." },
        { h: "I analyze your public reviews", p: "I pull every one of your real reviews from Google, Yelp and TripAdvisor and group them by theme and by month. I also review your full Google Business Profile so you have every attribute needed to drive more sales." },
        { h: "We sit down for 20 minutes", p: "I walk you through the report in person or over video, in whichever language you prefer. It's yours either way." },
      ],
    },

    form: {
      eyebrow: "Let's start",
      h2: "Request your free diagnostic",
      lede: "Fill this out and I'll be in touch within one business day. If you'd rather just talk, email me directly.",
      checklist: [
        "Complete report at no cost or obligation",
        "Served in English or Spanish, your call",
        "Built for restaurants in the Phoenix metro",
        "Your information is never shared or sold",
      ],
      quote: "I work with restaurant owners every day. The conversation always starts the same way: with data, not a sales deck.",
      quoteBy: "Mario Padilla · Strategic Cuisines Account Executive",
      f: {
        restaurant: "Restaurant name",
        name: "Your name",
        email: "Email address",
        phone: "Phone (optional)",
        city: "City",
        locations: "Number of locations",
        challenge: "What's your biggest challenge right now? (optional)",
        lang: "Contact me in",
        langEs: "Spanish",
        langEn: "English",
        submit: "Send and get my diagnostic",
        sending: "Sending…",
        note: "By submitting you agree to be contacted by Mario Padilla about your diagnostic. No spam, no mailing lists.",
      },
      cityPlaceholder: "Phoenix",
      locPlaceholder: "1",
      okTitle: "Got it — you're on the list.",
      okBody: "I'll reach out within one business day with next steps. Keep an eye on your inbox, and your spam folder just in case.",
      error: "Couldn't send that. Check your connection and try again, or email me directly at mario.padilla@toasttab.com.",
    },

    foot: {
      h: "Ready to find out what people really say about your restaurant?",
      cta: "Get a free diagnostic",
      rights: "Made in Phoenix, Arizona.",
      disclaimer: "Personal site of Mario Padilla. Revenue estimates are directional and are not a guarantee of results.",
    },

    quick: {
      title: "Get my free diagnostic",
      lede: "Three details and I'll be in touch within one business day.",
      business: "Restaurant name",
      email: "Email address",
      location: "City or location",
      locationPlaceholder: "Phoenix, AZ",
      submit: "Send",
      sending: "Sending…",
      close: "Close",
      okTitle: "You're set!",
      okBody: "Got your details — I'll reach out within one business day.",
      error: "Couldn't send that. Try again or email me at mario.padilla@toasttab.com.",
      moreDetail: "Want to give me more context now?",
      moreDetailLink: "Use the full form",
    },

    midCta: {
      h: "Still here? Get your free diagnostic before you scroll past it.",
      cta: "Get my free diagnostic",
    },

    clients: {
      eyebrow: "Clients",
      h2: "Restaurants that already trust this process",
      lede: "Independent brands across the Phoenix area I've worked with.",
      items: [
        { key: "las-culichis", name: "Las Culichis Mariscos" },
        { key: "padel-pals", name: "Padel Pals" },
        { key: "sushino", name: "Sushino Mexican Roll" },
      ],
    },
  },
};
