# Qatar Flight Check

Web estatica sencilla para seguir el estado probable de un viaje con Qatar Airways.

## Abrir la pagina

Abre [index.html](/Users/ucademy/Workspace/Qatar/index.html) en el navegador.

Si prefieres servirla en local:

```bash
python3 -m http.server 8000
```

Luego visita `http://localhost:8000`.

## Datos con Firecrawl

La web puede leer datos generados en [data/flight-status.json](/Users/ucademy/Workspace/Qatar/data/flight-status.json).

Para refrescarlos con Firecrawl:

```bash
export FIRECRAWL_API_KEY=fc-tu-clave
npm run scrape
```

Esto scrapea la pagina oficial de `Travel Alerts` de Qatar Airways y genera un JSON publico que GitHub Pages puede servir sin exponer la clave.

Ademas, el script consulta el backend publico de `Flight Status` de Qatar Airways para buscar los tramos concretos por ruta y fecha.

## GitHub Actions

Hay un workflow en [.github/workflows/update-flight-data.yml](/Users/ucademy/Workspace/Qatar/.github/workflows/update-flight-data.yml) para actualizar datos cada 6 horas o manualmente.

Solo necesitas anadir este secret en GitHub:

- `FIRECRAWL_API_KEY`

## Archivos

- [index.html](/Users/ucademy/Workspace/Qatar/index.html): estructura de la pagina
- [styles.css](/Users/ucademy/Workspace/Qatar/styles.css): diseno responsive
- [app.js](/Users/ucademy/Workspace/Qatar/app.js): datos del vuelo y renderizado
