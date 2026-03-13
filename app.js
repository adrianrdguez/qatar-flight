const tripData = {
  reviewedAt: "2026-03-13T00:30:00+03:00",
  reviewTimeZone: "Asia/Qatar",
  decision: {
    label: "Operacion posible, pero todavia no confirmada",
    summary:
      "Panel base cargado. Si existe un JSON generado por Firecrawl, esta pagina usara esa version automaticamente."
  },
  segments: [
    {
      number: "QR 150",
      route: "Madrid -> Doha",
      departureDate: "2026-03-18T15:20:00+01:00",
      arrivalDate: "2026-03-18T23:50:00+03:00",
      departureTimeZone: "Europe/Madrid",
      arrivalTimeZone: "Asia/Qatar",
      departureCode: "MAD",
      arrivalCode: "DOH",
      departureAirport: "Madrid Adolfo Suarez Madrid-Barajas",
      arrivalAirport: "Doha Hamad International",
      aircraft: "Boeing 777-300ER",
      duration: "6 h 30 m",
      status: "Pendiente de confirmacion",
      summary:
        "No aparece todavia una confirmacion publica para tu fecha exacta, pero Madrid si figura en la programacion limitada de dias cercanos.",
    },
    {
      number: "QR 892",
      route: "Doha -> Beijing",
      departureDate: "2026-03-19T01:45:00+03:00",
      arrivalDate: "2026-03-19T14:45:00+08:00",
      departureTimeZone: "Asia/Qatar",
      arrivalTimeZone: "Asia/Shanghai",
      departureCode: "DOH",
      arrivalCode: "PKX",
      departureAirport: "Doha Hamad International",
      arrivalAirport: "Beijing Daxing International",
      aircraft: "Airbus A350-900",
      duration: "8 h 00 m",
      status: "Pendiente de confirmacion",
      summary:
        "Beijing aparece como destino operado en los avisos recientes, pero Qatar Airways no ha publicado aun una garantia para el 19 de marzo de 2026.",
    },
  ],
  metrics: [
    {
      label: "Estado global",
      value: "Operacion limitada",
      copy:
        "Qatar Airways sigue operando con programacion reducida y con vuelos sujetos a aprobaciones regulatorias.",
    },
    {
      label: "Tiempo hasta la salida",
      value: countdownLabel("2026-03-18T15:20:00+01:00"),
      copy:
        "Cuenta atras hasta el despegue del primer tramo desde Madrid.",
    },
    {
      label: "Rutas vistas en alertas",
      value: "Madrid y Beijing",
      copy:
        "Ambas ciudades aparecen en la programacion limitada publicada en dias previos a tu viaje.",
    },
    {
      label: "Recomendacion",
      value: "Esperar confirmacion",
      copy:
        "Todavia no conviene dar el viaje por seguro sin revisar el estado del vuelo y la reserva.",
    },
  ],
  positiveSignals: [
    "Madrid aparece en la programacion limitada publicada por Qatar Airways para fechas cercanas a tu salida.",
    "Beijing tambien figura en la red operada en los avisos mas recientes, asi que la ruta sigue activa dentro del sistema.",
    "Tus numeros de vuelo son servicios regulares de largo radio y no vuelos excepcionales creados para contingencia.",
  ],
  riskSignals: [
    "A viernes, 13 de marzo de 2026, Qatar Airways no ha comunicado una vuelta completa a la normalidad.",
    "La aerolinea indica que los vuelos siguen sujetos a aprobaciones regulatorias y a corredores disponibles.",
    "Tus fechas exactas, miercoles 18 y jueves 19 de marzo de 2026, todavia no aparecen confirmadas publicamente en el aviso.",
  ],
  sources: [
    {
      date: "13 mar 2026",
      title: "Red todavia limitada",
      body:
        "La alerta oficial sigue describiendo una operacion parcial y no una reanudacion completa de la programacion habitual.",
      href: "https://www.qatarairways.com/en/travel-alerts.html",
    },
    {
      date: "13 mar 2026",
      title: "Madrid y Beijing si aparecen",
      body:
        "Las ciudades de Madrid y Beijing se incluyen en la programacion limitada publicada para los dias inmediatamente anteriores a tu viaje.",
      href: "https://www.qatarairways.com/en/travel-alerts.html",
    },
    {
      date: "Hasta 28 mar 2026",
      title: "Politica flexible activa",
      body:
        "Qatar Airways mantiene opciones de cambio o reembolso para billetes afectados dentro de la ventana anunciada.",
      href: "https://www.qatarairways.com/en/travel-alerts.html",
    },
  ],
};

function countdownLabel(departureIso) {
  const now = new Date();
  const departure = new Date(departureIso);
  const diff = departure.getTime() - now.getTime();

  if (diff <= 0) {
    return "Fecha pasada";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  if (days > 0) {
    return `${days} d ${hours} h`;
  }

  return `${Math.max(hours, 1)} h`;
}

function formatLocal(iso, options, timeZone) {
  return new Intl.DateTimeFormat("es-ES", {
    ...options,
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(iso));
}

function renderMetrics() {
  const container = document.getElementById("metric-grid");
  const metrics = tripData.metrics.map((metric) =>
    metric.label === "Tiempo hasta la salida"
      ? { ...metric, value: countdownLabel("2026-03-18T15:20:00+01:00") }
      : metric
  );

  container.innerHTML = metrics
    .map(
      (metric) => `
        <article class="metric-card">
          <p class="metric-label">${metric.label}</p>
          <p class="metric-value">${metric.value}</p>
          <p class="metric-copy">${metric.copy}</p>
        </article>
      `
    )
    .join("");
}

function renderSegments() {
  const container = document.getElementById("segment-grid");
  container.innerHTML = tripData.segments
    .map(
      (segment) => `
        <article class="segment-card">
          <div class="segment-top">
            <div>
              <h3>${segment.route}</h3>
              <p class="segment-code">${segment.number}</p>
            </div>
            <div class="status-chip">${segment.status}</div>
          </div>

          <div class="segment-times">
            <div>
              <p class="airport-label">${formatLocal(segment.departureDate, {
                weekday: "short",
                day: "numeric",
                month: "short",
              }, segment.departureTimeZone)}</p>
              <p class="time">${formatLocal(segment.departureDate, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }, segment.departureTimeZone)}</p>
              <p class="airport-code">${segment.departureCode}</p>
            </div>

            <div class="segment-arrow">-&gt;</div>

            <div>
              <p class="airport-label">${formatLocal(segment.arrivalDate, {
                weekday: "short",
                day: "numeric",
                month: "short",
              }, segment.arrivalTimeZone)}</p>
              <p class="time">${formatLocal(segment.arrivalDate, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }, segment.arrivalTimeZone)}</p>
              <p class="airport-code">${segment.arrivalCode}</p>
            </div>
          </div>

          <p class="segment-copy">${segment.summary}</p>

          <div class="segment-meta">
            <div class="meta-row">
              <span class="meta-label">Aeropuerto salida</span>
              <span class="meta-value">${segment.departureAirport}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Aeropuerto llegada</span>
              <span class="meta-value">${segment.arrivalAirport}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Avion previsto</span>
              <span class="meta-value">${segment.aircraft}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Duracion estimada</span>
              <span class="meta-value">${segment.duration}</span>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderSignals() {
  const positive = document.getElementById("positive-signals");
  const risk = document.getElementById("risk-signals");

  positive.innerHTML = tripData.positiveSignals
    .map((item) => `<li>${item}</li>`)
    .join("");
  risk.innerHTML = tripData.riskSignals
    .map((item) => `<li>${item}</li>`)
    .join("");
}

function renderSources() {
  const container = document.getElementById("source-list");
  container.innerHTML = tripData.sources
    .map(
      (source) => `
        <article class="source-card">
          <p class="source-date">${source.date}</p>
          <h3>${source.title}</h3>
          <p>${source.body}</p>
          <a class="source-link" href="${source.href}" target="_blank" rel="noreferrer">
            Ver fuente oficial >
          </a>
        </article>
      `
    )
    .join("");
}

function renderDecisionNote() {
  const note = document.getElementById("decision-note");
  note.textContent =
    `${tripData.decision.summary} Revision basada en avisos oficiales de Qatar Airways actualizados a ${formatLocal(
      tripData.generatedAt || tripData.reviewedAt,
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
      tripData.reviewTimeZone
    )}.`;
}

function renderDecisionBadge() {
  const badge = document.querySelector(".decision-badge");
  if (badge) {
    badge.textContent = tripData.decision.label;
  }
}

async function hydrateFromGeneratedData() {
  try {
    const response = await fetch("./data/flight-status.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const generatedData = await response.json();

    if (generatedData?.decision) {
      tripData.decision = generatedData.decision;
    }

    if (generatedData?.generatedAt) {
      tripData.generatedAt = generatedData.generatedAt;
    }

    if (Array.isArray(generatedData?.metrics)) {
      tripData.metrics = generatedData.metrics;
    }

    if (Array.isArray(generatedData?.positiveSignals)) {
      tripData.positiveSignals = generatedData.positiveSignals;
    }

    if (Array.isArray(generatedData?.riskSignals)) {
      tripData.riskSignals = generatedData.riskSignals;
    }

    if (Array.isArray(generatedData?.sources)) {
      tripData.sources = generatedData.sources;
    }

    if (Array.isArray(generatedData?.segments)) {
      tripData.segments = tripData.segments.map((segment) => {
        const generatedSegment = generatedData.segments.find(
          (item) => item.number === segment.number
        );

        return generatedSegment ? { ...segment, ...generatedSegment } : segment;
      });
    }
  } catch (error) {
    console.warn("No generated flight data found. Using built-in data.", error);
  }
}

async function init() {
  await hydrateFromGeneratedData();
  renderDecisionBadge();
  renderMetrics();
  renderSegments();
  renderSignals();
  renderSources();
  renderDecisionNote();
}

init();
