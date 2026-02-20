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

## Mapbox tileset

Mars mode uses the Mapbox raster tileset `kieranmccann.mars-mola`.
Make sure the tileset is **public** so it can be loaded in the browser.

## Build Mars Raster MTS Source (GDAL)

This repo includes a script to generate an RGB GeoTIFF from the USGS
MOLA shaded relief that is suitable for Mapbox Raster MTS.

General approach:

1) Download MOLA shaded-relief GeoTIFF.
2) Apply a Mars color ramp (GDAL color-relief).
3) Expand to RGB uint8.
4) Warp to EPSG:3857 (Web Mercator).
5) Upload the RGB GeoTIFF to Raster MTS.

Prereqs:

- GDAL installed
- PMTiles CLI installed (download from `https://github.com/protomaps/go-pmtiles/releases`)

Run:

```bash
./scripts/build-mars-raster-mts.sh
```

Output:

- `build/mars-color-rgb-3857.tif` (use this for Mapbox Raster MTS)

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

If you prefer MBTiles uploads instead of Raster MTS, use the Uploads API with a
**secret** token and a raster MBTiles file. This project currently targets
Raster MTS for the Mars tileset.

## Token security

- Use a public `pk.*` token only.
- Add URL restrictions in Mapbox (at minimum `http://localhost:*` for dev).
