# Mars Globe Map (Mapbox + Open Mars Data)

A lightweight demo that renders Mars imagery on a Mapbox globe using open USGS/NASA raster tiles.

## Run locally

Option A: open directly

1) Open `index.html` in your browser.
2) Note: when opened as a local file, the map uses a built-in Mars texture.
   Run the local server for the live USGS tiles.

Option B: run a local server

```bash
node server.js
```

Then open:

`http://localhost:4173/`

## Vercel environment variable

Set `MAPBOX_PUBLIC_TOKEN` in Vercel. The app will fetch it from `/api/token`
when running on a hosted URL. (Public token only.)

## Data source

- USGS Astrogeology / NASA MGS MOLA shaded relief tiles:
  `https://planetarymaps.usgs.gov/arcgis/rest/services/Mars/Mars_MGS_MOLA_ClrShade_merge_global_463m/MapServer`

## Token security

- Use a public `pk.*` token only.
- Add URL restrictions in Mapbox (at minimum `http://localhost:*` for dev).
