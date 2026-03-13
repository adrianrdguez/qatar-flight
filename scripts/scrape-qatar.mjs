import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const OUTPUT_PATH = resolve("data/flight-status.json");

const itinerary = [
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
    duration: "6 h 30 m"
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
    duration: "8 h 00 m"
  }
];

if (!FIRECRAWL_API_KEY) {
  console.error("Missing FIRECRAWL_API_KEY. Set it in your shell or .env before running.");
  process.exit(1);
}

async function scrapePage(url) {
  const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "links"],
      onlyMainContent: true,
      waitFor: 1500,
      timeout: 30000,
      blockAds: true,
      proxy: "auto"
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Firecrawl ${response.status}: ${text}`);
  }

  return response.json();
}

function includesAny(text, candidates) {
  const haystack = text.toLowerCase();
  return candidates.some((candidate) => haystack.includes(candidate.toLowerCase()));
}

function cleanAlertText(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const lower = line.toLowerCase();
      return ![
        "tracking id",
        "verticafare",
        "boxever",
        "loading...",
        "histogram",
        "fare tracking",
        "dynamic fare",
        "fares strip",
        "homepage fares",
        "offers tracking",
        "header chec"
      ].some((token) => lower.includes(token));
    })
    .join("\n");
}

function buildOutput(alertResult) {
  const generatedAt = new Date().toISOString();
  const alertMarkdown = alertResult?.data?.markdown ?? "";
  const cleanMarkdown = cleanAlertText(alertMarkdown);
  const madridFound = includesAny(cleanMarkdown, ["madrid", "mad"]);
  const beijingFound = includesAny(cleanMarkdown, ["beijing", "pek", "pkx"]);
  const limitedOps = includesAny(cleanMarkdown, [
    "limited",
    "subject to",
    "reduced",
    "regulatory",
    "operating",
    "schedule"
  ]);

  const routeSignalValue = [madridFound ? "Madrid" : null, beijingFound ? "Beijing" : null]
    .filter(Boolean)
    .join(" y ") || "No detectadas";

  const decisionLabel =
    madridFound && beijingFound
      ? "Operacion posible, pero todavia no confirmada"
      : "Operativa incierta";

  const decisionSummary =
    madridFound && beijingFound
      ? "La alerta oficial menciona Madrid y Beijing dentro del contenido extraido, pero eso no sustituye la confirmacion de tus vuelos exactos."
      : "La alerta oficial extraida no deja clara la operacion de toda tu ruta, asi que conviene no dar el viaje por seguro.";

  const alertSummary = [
    limitedOps
      ? "El contenido extraido sugiere una operacion limitada o condicionada."
      : "El contenido extraido no muestra un bloqueo claro de toda la operativa.",
    madridFound ? "Madrid aparece mencionado." : "Madrid no se detecto claramente.",
    beijingFound ? "Beijing aparece mencionado." : "Beijing no se detecto claramente."
  ].join(" ");

  const segments = itinerary.map((segment) => {
    const destinationMentioned =
      segment.departureCode === "MAD" ? madridFound : beijingFound;

    return {
      ...segment,
      status: destinationMentioned ? "Ruta detectada en alertas" : "Ruta no detectada",
      summary: destinationMentioned
        ? "El scraping detecto referencias a esta ruta o ciudad en la alerta oficial de Qatar Airways. Aun hace falta comprobar Flight Status para el vuelo concreto."
        : "El scraping no detecto una referencia clara a esta ruta en la alerta extraida. Verifica el vuelo concreto manualmente."
    };
  });

  return {
    generatedAt,
    decision: {
      label: decisionLabel,
      summary: decisionSummary
    },
    metrics: [
      {
        label: "Estado global",
        value: limitedOps ? "Operacion limitada" : "Sin bloqueo claro",
        copy: "Resumen inferido del contenido extraido de Travel Alerts por Firecrawl."
      },
      {
        label: "Tiempo hasta la salida",
        value: "",
        copy: "La cuenta atras se calcula en el navegador."
      },
      {
        label: "Rutas vistas en alertas",
        value: routeSignalValue,
        copy: "Coincidencias de ciudades detectadas automaticamente en la alerta oficial."
      },
      {
        label: "Recomendacion",
        value: "Confirmar manualmente",
        copy: "Usa Flight Status y Manage Booking para validar QR150 y QR892 antes de salir."
      }
    ],
    segments,
    positiveSignals: [
      madridFound
        ? "Madrid aparece en el contenido extraido de Travel Alerts."
        : "Madrid no se detecto claramente en el ultimo scrape.",
      beijingFound
        ? "Beijing aparece en el contenido extraido de Travel Alerts."
        : "Beijing no se detecto claramente en el ultimo scrape.",
      "La extraccion se ha hecho contra una pagina oficial de Qatar Airways mediante Firecrawl."
    ],
    riskSignals: [
      "Travel Alerts no garantiza por si sola el estado exacto de QR150 o QR892.",
      "La pagina Flight Status de Qatar sigue siendo la comprobacion final recomendada.",
      limitedOps
        ? "El texto extraido contiene senales de operacion reducida o condicionada."
        : "Aunque no haya alerta fuerte, la web oficial puede cambiar antes de la salida."
    ],
    sources: [
      {
        date: new Date(generatedAt).toISOString().slice(0, 10),
        title: "Travel Alerts procesado por Firecrawl",
        body: alertSummary,
        href: "https://www.qatarairways.com/en/travel-alerts.html"
      },
      {
        date: new Date(generatedAt).toISOString().slice(0, 10),
        title: "Flight Status manual",
        body: "Mantenido como verificacion final porque el flujo interactivo del estado de vuelo aun no se automatiza en esta version.",
        href: "https://fs.qatarairways.com/"
      }
    ]
  };
}

async function main() {
  console.log("Scraping Qatar Travel Alerts with Firecrawl...");
  const alertResult = await scrapePage("https://www.qatarairways.com/en/travel-alerts.html");
  const output = buildOutput(alertResult);

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Decision: ${output.decision.label}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
