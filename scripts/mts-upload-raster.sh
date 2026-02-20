#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="${ROOT_DIR}/build"

MAPBOX_USER="${MAPBOX_USER:-kieranmccann}"
SOURCE_ID="${SOURCE_ID:-mars-mola-src}"
TILESET_ID="${TILESET_ID:-${MAPBOX_USER}.mars-mola}"
SOURCE_FILE="${SOURCE_FILE:-${BUILD_DIR}/mars-color-rgb-3857.tif}"
TOKEN="${MAPBOX_SECRET_TOKEN:-}"

if [ -z "${TOKEN}" ]; then
  echo "MAPBOX_SECRET_TOKEN is required."
  exit 1
fi

if [ ! -f "${SOURCE_FILE}" ]; then
  echo "Source file not found: ${SOURCE_FILE}"
  exit 1
fi

RECIPE_FILE="${BUILD_DIR}/mts-recipe.json"
TILESET_FILE="${BUILD_DIR}/mts-tileset.json"
SOURCE_URI="mapbox://tileset-source/${MAPBOX_USER}/${SOURCE_ID}"

mkdir -p "${BUILD_DIR}"

cat > "${RECIPE_FILE}" <<EOF
{
  "version": 1,
  "type": "raster",
  "sources": [
    { "uri": "${SOURCE_URI}" }
  ],
  "minzoom": 0,
  "maxzoom": 8,
  "layers": {
    "RGB": {
      "source_rules": {
        "filter": [
          ["==", ["get", "colorinterp"], "red"],
          ["==", ["get", "colorinterp"], "green"],
          ["==", ["get", "colorinterp"], "blue"]
        ]
      }
    }
  }
}
EOF

cat > "${TILESET_FILE}" <<EOF
{
  "name": "Mars MOLA (visual imagery)",
  "recipe": $(cat "${RECIPE_FILE}")
}
EOF

echo "Uploading raster source to tileset source ${MAPBOX_USER}/${SOURCE_ID}..."
curl -sS -X POST \
  "https://api.mapbox.com/tilesets/v1/sources/${MAPBOX_USER}/${SOURCE_ID}?access_token=${TOKEN}" \
  -F "file=@${SOURCE_FILE}"

echo "Creating tileset ${TILESET_ID}..."
curl -sS -X POST \
  "https://api.mapbox.com/tilesets/v1/${TILESET_ID}?access_token=${TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary @"${TILESET_FILE}"

echo "Publishing tileset..."
curl -sS -X POST \
  "https://api.mapbox.com/tilesets/v1/${TILESET_ID}/publish?access_token=${TOKEN}"

echo "Done. Check status in Mapbox Studio tilesets."
