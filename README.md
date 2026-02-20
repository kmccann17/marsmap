# Mars Globe Map (Mapbox + Open Mars Data)

A lightweight demo that renders Mars imagery on a Mapbox globe using open USGS/NASA raster tiles.

## Run locally

Option A: open directly

1) Open `index.html` in your browser.
2) Paste your public token (pk.*) into the form. It’s stored in localStorage.
3) Refresh if needed.
4) Note: when opened as a local file, the map uses a built-in Mars texture.
   Run the local server for the live USGS tiles.

Option B: run a local server

```bash
node server.js
```

Then open:

`http://localhost:4173/?token=YOUR_MAPBOX_TOKEN`

## Data source

- USGS Astrogeology / NASA MGS MOLA shaded relief tiles:
  `https://planetarymaps.usgs.gov/arcgis/rest/services/Mars/Mars_MGS_MOLA_ClrShade_merge_global_463m/MapServer`

## Token security

- Use a public `pk.*` token only.
- Add URL restrictions in Mapbox (at minimum `http://localhost:*` for dev).
