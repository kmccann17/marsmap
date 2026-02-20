# Mars Globe Map (Mapbox + Open Mars Data)

A lightweight, globe-first Mars visualization built with Mapbox GL JS. The
experience emphasizes a cinematic view of the planet using a custom raster
basemap derived from open NASA/USGS terrain data.

## How It Was Built

### Data Sources

- **USGS Astrogeology / NASA MGS MOLA shaded relief** provides the base Mars
  terrain data used to generate the imagery shown in the globe view.

### Raster MTS Pipeline (Conceptual)

The Mars basemap is produced as an RGB GeoTIFF, then published as a Mapbox
Raster MTS tileset. The processing pipeline:

1. Download MOLA shaded‑relief GeoTIFF.
2. Apply a Mars color ramp (GDAL `color-relief`).
3. Expand to RGB (8‑bit).
4. Warp to Web Mercator (EPSG:3857) for globe rendering.
5. Publish the RGB GeoTIFF to Mapbox Raster MTS.

### Mapbox Integration

- Mars mode uses the Mapbox raster tileset `kieranmccann.mars-mola`.
- Earth mode uses Mapbox Standard to validate token setup and globe rendering.
- When opened as a local file, the app falls back to a procedural Mars texture
  for quick offline previews.

## Token & Hosting Notes

- The app uses a public `pk.*` token in the client.
- URL restrictions are recommended for production safety.
