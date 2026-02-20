# Mars Globe Map (Mapbox + Open Mars Data)

A lightweight demo that renders Mars imagery on a Mapbox globe using open USGS/NASA raster tiles.

## Run locally

```bash
python3 -m http.server 4173
```

Then open:

`http://localhost:4173/?token=YOUR_MAPBOX_TOKEN`

## Data source

- USGS Astrogeology / NASA MGS MOLA shaded relief tiles:
  `https://planetarymaps.usgs.gov/arcgis/rest/services/Mars/Mars_MGS_MOLA_ClrShade_merge_global_463m/MapServer`
