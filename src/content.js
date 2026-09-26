// Bilingual copy. Spanish is the default — the primary audience is
// Latino restaurant owners across the Phoenix metro.

export const content = {
  es: {
    nav: { how: "POS System", blog: "Blog", calc: "Calculadora", diag: "El diagnóstico", cta: "Diagnóstico gratis" },

    hero: {
      eyebrow: "Phoenix · Mesa · Glendale · Tempe · Gilbert · Chandler · Cave Creek · Queen Creek",
      h1a: "Tus reseñas ya te están costando",
      h1b: "dinero real",
      lede: "Cada estrella en Yelp vale entre 5% y 9% de tus ventas. Te hago un diagnóstico gratuito de tu reputación en línea — de lo que opinan tus clientes en tiempo real — y te digo exactamente cómo mejorar esos ratings y cuánto estás dejando en la mesa.",
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
      lede: "Mueve las barras con tus datos reales. La fórmula viene del estudio de Harvard Business School sobre reseñas de Yelp y ventas.",
      rating: "Tu calificación actual en Yelp",
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
        { i: "◎", h: "Tus principales problemas operativos", p: "Agrupo todas tus reseñas por tema: comida, servicio, tiempos de espera, precio, limpieza y autenticidad." },
        { i: "$", h: "El impacto en dólares", p: "Cuánto vale medio punto de calificación en tu operación, con tus ventas como base del cálculo." },
        { i: "✓", h: "Plan de 3 acciones", p: "Plan de acción basado en las áreas de oportunidad operativas de tu negocio: las tres cosas que más mueven la aguja en tu caso, en orden, con el esfuerzo que requiere cada una." },
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
      cityOptions: ["Phoenix", "Mesa", "Glendale", "Tempe", "Gilbert", "Chandler", "Cave Creek", "Queen Creek"],
      challengeOptions: [
        "Escasez de personal y alta rotación",
        "Costos de comida e insumos en aumento",
        "Reseñas y reputación en línea",
        "Menos clientes recurrentes",
        "Poca visibilidad en marketing digital",
      ],
      f: {
        restaurant: "Nombre del restaurante",
        name: "Tu nombre",
        email: "Correo electrónico",
        phone: "Teléfono (opcional)",
        city: "Ciudad",
        cityPlaceholderOpt: "Selecciona tu ciudad",
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
      cooldownTitle: "Ya pediste un diagnóstico con este correo",
      cooldownBody: (days, date) =>
        `Cada correo puede pedir un diagnóstico nuevo cada 30 días. Puedes volver en ${days} ${
          days === 1 ? "día" : "días"
        } — a partir del ${date} — y con gusto te preparo uno actualizado.`,
      cooldownClose: "Entendido",
      cooldownInline: (days) =>
        `Este correo ya pidió un diagnóstico. Puedes solicitar uno nuevo en ${days} ${
          days === 1 ? "día" : "días"
        }.`,
      alreadySubscribed: "Este correo ya está registrado en el boletín.",
    },

    blog: {
      eyebrow: "Blog",
      h2: "Noticias de la industria restaurantera",
      lede: "Lo que está pasando en la industria: notas, tendencias y datos que le sirven a un operador en Phoenix.",
      loading: "Cargando artículos…",
      empty: "Todavía no hay artículos publicados. Vuelve pronto.",
      readMore: "Leer el artículo",
      back: "← Volver al sitio",
    },

    newsletter: {
      h: "Suscríbete a mi Newsletter",
      lede: "Notas de la industria y tips de reputación, una vez al mes. Sin spam, y te puedes dar de baja cuando quieras.",
      placeholder: "tu@correo.com",
      cta: "Suscribirme",
      sending: "Enviando…",
      ok: "¡Listo! Ya estás suscrito al boletín.",
      already: "Este correo ya está registrado en el boletín.",
      invalid: "Escribe un correo válido.",
      error: "No se pudo completar. Inténtalo de nuevo.",
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

    pains: {
      eyebrow: "POS System",
      h2: "¿Te suena familiar?",
      lede: "Muchas veces la reseña baja es el síntoma. El problema real suele estar en cómo opera el restaurante día a día — casi siempre en el sistema que usas para vender.",
      items: [
        "Tu punto de venta se traba justo en la hora pico",
        "Los pedidos en línea no le llegan bien a la cocina",
        "Nadie sabe qué platillos realmente dejan ganancia",
        "Inventario, nómina y propinas viven en hojas separadas",
        "Cerrar caja toma horas y los números casi nunca cuadran",
      ],
      note: "¿Alguno te quitó el sueño esta semana? Platicamos 15 minutos, sin compromiso.",
      learnMore: "¿Quieres conocer más sobre sistemas POS?",
      learnMoreLink: "Ver información aquí",
      cta: "Agenda tu llamada de 15 minutos",
    },

    oneOnOne: {
      eyebrow: "¿Prefieres hablar directo?",
      h2: "Agenda 15 minutos conmigo, uno a uno",
      lede: "Sin formularios. Escoge un horario y platicamos de tu restaurante — reseñas, operación o lo que traigas encima.",
      cta: "Agendar mi llamada",
    },

    consent: {
      label: (link) =>
        `Quiero recibir por correo tips, casos de éxito y promociones sobre reputación de restaurantes (opcional). Puedo darme de baja cuando quiera. Ver <a href="#privacy" target="_blank" rel="noopener noreferrer">${link}</a>.`,
      linkText: "Aviso de Privacidad",
    },

    privacy: {
      title: "Aviso de Privacidad",
      updated: "Última actualización: septiembre de 2026",
      intro:
        "Este aviso explica qué información recopilo a través de El Toaster, para qué la uso, con quién la comparto y qué derechos tienes sobre tus datos, conforme a la ley de privacidad de California (CCPA/CPRA) y otras leyes estatales de privacidad de EE. UU. aplicables.",
      sections: [
        {
          h: "Qué información recopilo",
          p: "Cuando llenas el formulario de diagnóstico gratuito, recopilo: nombre del restaurante, tu nombre, correo electrónico, teléfono (opcional), ciudad, número de ubicaciones y el reto que nos compartas. Si aceptas recibir correos de marketing, guardo esa preferencia y la fecha en que la diste.",
        },
        {
          h: "Para qué la uso",
          p: "Uso tus datos únicamente para: (1) contactarte sobre tu diagnóstico de reputación, (2) enviarte el reporte y coordinar la llamada de seguimiento, y (3) si diste tu consentimiento explícito, enviarte contenido de marketing relacionado (tips, casos de éxito, promociones). Nunca uso tus datos para fines distintos a estos.",
        },
        {
          h: "Con quién la comparto",
          p: "No vendo ni comparto tu información con terceros para publicidad. Uso dos proveedores de servicio que procesan datos en mi nombre bajo sus propios acuerdos de confidencialidad: Supabase (almacenamiento de la base de datos) y, solo si diste tu consentimiento de marketing, Resend (envío de correos). Ninguno de los dos está autorizado a usar tus datos para sus propios fines.",
        },
        {
          h: "Tus derechos (CCPA/CPRA)",
          p: "Si eres residente de California — o de otro estado con protecciones similares — tienes derecho a: saber qué datos tengo sobre ti, solicitar una copia, pedir que los corrija, pedir que los elimine, y optar por no recibir más comunicaciones de marketing en cualquier momento. No vendo ni comparto tu información personal con terceros para publicidad dirigida, por lo que no aplica un mecanismo de 'no vender mis datos' — pero puedes ejercer cualquiera de los derechos anteriores escribiendo a mario.padilla@toasttab.com. Respondo en un plazo razonable y no habrá represalia ni cambio en el servicio por ejercer estos derechos.",
        },
        {
          h: "Cómo darte de baja de marketing",
          p: "Todo correo de marketing incluye un enlace de baja al final. También puedes escribirme directamente y te doy de baja de inmediato.",
        },
        {
          h: "Retención de datos",
          p: "Conservo tu información mientras exista una relación comercial activa o potencial, y la elimino a solicitud tuya salvo que la ley exija conservarla por más tiempo.",
        },
        {
          h: "Contacto",
          p: "Para cualquier pregunta o solicitud sobre tus datos, escribe a mario.padilla@toasttab.com.",
        },
      ],
      disclaimer:
        "Este aviso se ofrece con fines informativos y no constituye asesoría legal. Si operas un negocio con obligaciones de privacidad específicas, consulta a un abogado.",
      back: "← Volver al sitio",
    },
  },

  en: {
    nav: { how: "POS System", blog: "Blog", calc: "Calculator", diag: "The diagnostic", cta: "Free diagnostic" },

    hero: {
      eyebrow: "Phoenix · Mesa · Glendale · Tempe · Gilbert · Chandler · Cave Creek · Queen Creek",
      h1a: "Your reviews are already costing you",
      h1b: "real money",
      lede: "Every star on Google is worth 5–9% of your sales. I'll run a free diagnostic on your online reputation — pulling from Google, Yelp and TripAdvisor — and show you exactly what you're leaving on the table.",
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
      lede: "Move the sliders with your real figures. The formula comes from Harvard Business School research on Yelp reviews and revenue.",
      rating: "Your current Yelp rating",
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
        { i: "◎", h: "Your main operational problems", p: "Every review grouped by theme: food, service, wait times, price, cleanliness and authenticity." },
        { i: "$", h: "The dollar impact", p: "What half a rating point is worth in your operation, calculated against your actual revenue." },
        { i: "✓", h: "A 3-action plan", p: "An action plan based on your business's operational opportunity areas: the three things that move the needle most in your case, ranked, with the effort each one takes." },
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
      cityOptions: ["Phoenix", "Mesa", "Glendale", "Tempe", "Gilbert", "Chandler", "Cave Creek", "Queen Creek"],
      challengeOptions: [
        "Staffing shortages and high turnover",
        "Rising food and supply costs",
        "Online reviews and reputation",
        "Fewer repeat customers",
        "Low digital marketing visibility",
      ],
      f: {
        restaurant: "Restaurant name",
        name: "Your name",
        email: "Email address",
        phone: "Phone (optional)",
        city: "City",
        cityPlaceholderOpt: "Select your city",
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
      cooldownTitle: "You already requested a diagnostic with this email",
      cooldownBody: (days, date) =>
        `Each email can request a new diagnostic every 30 days. Come back in ${days} ${
          days === 1 ? "day" : "days"
        } — from ${date} — and I'll gladly put together an updated one.`,
      cooldownClose: "Got it",
      cooldownInline: (days) =>
        `This email already requested a diagnostic. You can request a new one in ${days} ${
          days === 1 ? "day" : "days"
        }.`,
      alreadySubscribed: "This email is already on the newsletter list.",
    },

    blog: {
      eyebrow: "Blog",
      h2: "Hospitality industry news",
      lede: "What's happening across the industry: reporting, trends and numbers an operator in Phoenix can actually use.",
      loading: "Loading articles…",
      empty: "No articles published yet. Check back soon.",
      readMore: "Read the article",
      back: "← Back to the site",
    },

    newsletter: {
      h: "Subscribe to the newsletter",
      lede: "Industry reporting and reputation tips, once a month. No spam, and you can unsubscribe anytime.",
      placeholder: "you@email.com",
      cta: "Subscribe",
      sending: "Sending…",
      ok: "You're in — thanks for subscribing.",
      already: "This email is already on the newsletter list.",
      invalid: "Enter a valid email address.",
      error: "Couldn't complete that. Please try again.",
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

    pains: {
      eyebrow: "POS System",
      h2: "Sound familiar?",
      lede: "A low review is often just the symptom. The real problem usually lives in how the restaurant runs day to day — most often in the system you use to sell.",
      items: [
        "Your point of sale locks up right at peak hour",
        "Online orders don't make it to the kitchen cleanly",
        "Nobody knows which dishes actually make money",
        "Inventory, payroll and tips live in separate spreadsheets",
        "Closing out takes hours and the numbers rarely match",
      ],
      note: "Any of these keep you up this week? Let's talk for 15 minutes, no strings attached.",
      learnMore: "Want to learn more about POS systems?",
      learnMoreLink: "See more information here",
      cta: "Book your 15-minute call",
    },

    oneOnOne: {
      eyebrow: "Would rather just talk?",
      h2: "Book 15 minutes with me, one on one",
      lede: "No forms. Pick a time and let's talk about your restaurant — reviews, operations, or whatever's on your plate.",
      cta: "Book my call",
    },

    consent: {
      label: (link) =>
        `I'd like to receive email tips, success stories and promotions about restaurant reputation (optional). I can unsubscribe anytime. See <a href="#privacy" target="_blank" rel="noopener noreferrer">${link}</a>.`,
      linkText: "Privacy Notice",
    },

    privacy: {
      title: "Privacy Notice",
      updated: "Last updated: September 2026",
      intro:
        "This notice explains what information I collect through El Toaster, how I use it, who I share it with, and what rights you have over your data under the California Consumer Privacy Act (CCPA/CPRA) and other applicable U.S. state privacy laws.",
      sections: [
        {
          h: "What I collect",
          p: "When you fill out the free diagnostic form, I collect: restaurant name, your name, email address, phone (optional), city, number of locations, and whatever challenge you share. If you opt in to marketing emails, I store that preference and the date you gave it.",
        },
        {
          h: "How I use it",
          p: "I use your data only to: (1) contact you about your reputation diagnostic, (2) send you the report and coordinate a follow-up call, and (3) if you gave explicit consent, send you related marketing content (tips, success stories, promotions). I never use your data for anything outside these purposes.",
        },
        {
          h: "Who I share it with",
          p: "I don't sell or share your information with third parties for advertising. I use two service providers who process data on my behalf under their own confidentiality agreements: Supabase (database storage) and, only if you gave marketing consent, Resend (email delivery). Neither is authorized to use your data for their own purposes.",
        },
        {
          h: "Your rights (CCPA/CPRA)",
          p: "If you're a California resident — or from another state with similar protections — you have the right to: know what data I have on you, request a copy, ask me to correct it, ask me to delete it, and opt out of marketing communications at any time. I don't sell or share your personal information with third parties for targeted advertising, so a 'do not sell my data' mechanism doesn't apply — but you can exercise any of the rights above by emailing mario.padilla@toasttab.com. I respond within a reasonable timeframe, and there's no retaliation or change in service for exercising these rights.",
        },
        {
          h: "How to unsubscribe from marketing",
          p: "Every marketing email includes an unsubscribe link at the bottom. You can also email me directly and I'll remove you right away.",
        },
        {
          h: "Data retention",
          p: "I keep your information for as long as there's an active or potential business relationship, and delete it on request unless the law requires me to keep it longer.",
        },
        {
          h: "Contact",
          p: "For any question or request about your data, email mario.padilla@toasttab.com.",
        },
      ],
      disclaimer:
        "This notice is provided for informational purposes and does not constitute legal advice. If you operate a business with specific privacy obligations, consult an attorney.",
      back: "← Back to the site",
    },
  },
};
