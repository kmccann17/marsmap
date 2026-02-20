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

## Data source

- USGS Astrogeology / NASA MGS MOLA shaded relief tiles:
  `https://planetarymaps.usgs.gov/arcgis/rest/services/Mars/Mars_MGS_MOLA_ClrShade_merge_global_463m/MapServer`
  (proxied through `/api/mars/{z}/{y}/{x}` to avoid CORS issues)

## Build Mars PMTiles (GDAL)

This repo includes a script to generate a Mars PMTiles file from the USGS
MOLA shaded relief GeoTIFF.

Prereqs:

- GDAL installed
- PMTiles CLI installed (download from `https://github.com/protomaps/go-pmtiles/releases`)

Run:

```bash
./scripts/build-mars-pmtiles.sh
```

Output:

- `build/mars-color-rgb-3857.tif` (use this for Mapbox Raster MTS)
- `build/mars.mbtiles` (use this for Mapbox Uploads API)
- `build/mars.pmtiles`

## Mapbox Raster MTS (visual imagery)

This path uploads an **RGB GeoTIFF** and builds a Raster MTS tileset.
It requires a **secret** token with `tilesets:write`.

```bash
export MAPBOX_SECRET_TOKEN="sk..."
./scripts/mts-upload-raster.sh
```

Defaults:

- `MAPBOX_USER=kieranmccann`
- `SOURCE_ID=mars-mola-src`
- `TILESET_ID=kieranmccann.mars-mola`
- `SOURCE_FILE=build/mars-color-rgb-3857.tif`

Override any of these by exporting env vars before running.

## Mapbox Uploads API (MBTiles)

Mapbox accepts MBTiles uploads (raster recommended at 512x512). Uploads use a
**secret** token with `uploads:write` scope.

High-level flow:

1) Request temporary S3 upload credentials.
2) Upload the MBTiles file to the provided S3 bucket.
3) Create the upload, referencing the S3 URL and a tileset ID.
4) Poll upload status until complete.

## Token security

- Use a public `pk.*` token only.
- Add URL restrictions in Mapbox (at minimum `http://localhost:*` for dev).
