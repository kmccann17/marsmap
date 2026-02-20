#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="${ROOT_DIR}/data"
BUILD_DIR="${ROOT_DIR}/build"

SOURCE_URL="https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_Shade_global_463m.tif"
SOURCE_TIF="${DATA_DIR}/Mars_MGS_MOLA_Shade_global_463m.tif"
COLOR_RAMP="${ROOT_DIR}/scripts/mars_colorramp.txt"
COLOR_TIF="${BUILD_DIR}/mars-color.tif"
RGB_TIF="${BUILD_DIR}/mars-color-rgb.tif"
WARP_TIF="${BUILD_DIR}/mars-color-rgb-3857.tif"
MBTILES="${BUILD_DIR}/mars.mbtiles"
PMTILES="${BUILD_DIR}/mars.pmtiles"

if ! command -v gdalinfo >/dev/null 2>&1; then
  echo "GDAL is not installed (gdalinfo not found). Install GDAL first."
  exit 1
fi

mkdir -p "${DATA_DIR}" "${BUILD_DIR}"

if [ ! -f "${SOURCE_TIF}" ]; then
  echo "Downloading MOLA shaded relief GeoTIFF (~1GB)..."
  curl -L "${SOURCE_URL}" -o "${SOURCE_TIF}"
fi

echo "Applying Mars color ramp..."
gdaldem color-relief "${SOURCE_TIF}" "${COLOR_RAMP}" "${COLOR_TIF}" -of GTiff -co COMPRESS=LZW

echo "Expanding to RGB (uint8)..."
gdal_translate -expand rgb -ot Byte -co PHOTOMETRIC=RGB "${COLOR_TIF}" "${RGB_TIF}"

echo "Warping to EPSG:3857 and clipping to Web Mercator bounds..."
gdalwarp \
  -t_srs EPSG:3857 \
  -te -20037508.34 -20037508.34 20037508.34 20037508.34 \
  -r cubic \
  -ts 16384 8192 \
  -co COMPRESS=LZW \
  -co TILED=YES \
  -overwrite \
  "${RGB_TIF}" \
  "${WARP_TIF}"

echo "Creating MBTiles (512x512 raster tiles)..."
gdal_translate \
  -of MBTiles \
  -co TILE_FORMAT=PNG \
  -co BLOCKSIZE=512 \
  -co ZLEVEL=6 \
  "${WARP_TIF}" \
  "${MBTILES}"

echo "Building overview zoom levels..."
gdaladdo -r average "${MBTILES}" 2 4 8 16 32 64

if ! command -v pmtiles >/dev/null 2>&1; then
  echo "pmtiles CLI not found."
  echo "Download the binary from: https://github.com/protomaps/go-pmtiles/releases"
  exit 1
fi

echo "Converting MBTiles to PMTiles..."
pmtiles convert "${MBTILES}" "${PMTILES}"

echo "Done!"
echo "PMTiles file: ${PMTILES}"
