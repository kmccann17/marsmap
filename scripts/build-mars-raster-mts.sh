#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="${ROOT_DIR}/data"
BUILD_DIR="${ROOT_DIR}/build"

SOURCE_URL="https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_Shade_global_463m.tif"
SOURCE_TIF="${DATA_DIR}/Mars_MGS_MOLA_Shade_global_463m.tif"
COLOR_RAMP_CONTRAST="${ROOT_DIR}/scripts/mars_colorramp_contrast.txt"
COLOR_RAMP_RED="${ROOT_DIR}/scripts/mars_colorramp_red.txt"
COLOR_TIF_CONTRAST="${BUILD_DIR}/mars-contrast.tif"
COLOR_TIF_RED="${BUILD_DIR}/mars-red.tif"
RGB_TIF_CONTRAST="${BUILD_DIR}/mars-contrast-rgb.tif"
RGB_TIF_RED="${BUILD_DIR}/mars-red-rgb.tif"
WARP_TIF_CONTRAST="${BUILD_DIR}/mars-contrast-rgb-3857.tif"
WARP_TIF_RED="${BUILD_DIR}/mars-red-rgb-3857.tif"

if ! command -v gdalinfo >/dev/null 2>&1; then
  echo "GDAL is not installed (gdalinfo not found). Install GDAL first."
  exit 1
fi

mkdir -p "${DATA_DIR}" "${BUILD_DIR}"

if [ ! -f "${SOURCE_TIF}" ]; then
  echo "Downloading MOLA shaded relief GeoTIFF (~1GB)..."
  curl -L "${SOURCE_URL}" -o "${SOURCE_TIF}"
fi

echo "Applying Mars contrast color ramp..."
gdaldem color-relief "${SOURCE_TIF}" "${COLOR_RAMP_CONTRAST}" "${COLOR_TIF_CONTRAST}" -of GTiff -co COMPRESS=LZW

echo "Applying Mars red color ramp..."
gdaldem color-relief "${SOURCE_TIF}" "${COLOR_RAMP_RED}" "${COLOR_TIF_RED}" -of GTiff -co COMPRESS=LZW

echo "Expanding to RGB (uint8)..."
gdal_translate -expand rgb -ot Byte -co PHOTOMETRIC=RGB "${COLOR_TIF_CONTRAST}" "${RGB_TIF_CONTRAST}"
gdal_translate -expand rgb -ot Byte -co PHOTOMETRIC=RGB "${COLOR_TIF_RED}" "${RGB_TIF_RED}"

echo "Warping to EPSG:3857 and clipping to Web Mercator bounds..."
gdalwarp \
  -t_srs EPSG:3857 \
  -te -20037508.34 -20037508.34 20037508.34 20037508.34 \
  -r cubic \
  -ts 16384 8192 \
  -co COMPRESS=LZW \
  -co TILED=YES \
  -overwrite \
  "${RGB_TIF_CONTRAST}" \
  "${WARP_TIF_CONTRAST}"

gdalwarp \
  -t_srs EPSG:3857 \
  -te -20037508.34 -20037508.34 20037508.34 20037508.34 \
  -r cubic \
  -ts 16384 8192 \
  -co COMPRESS=LZW \
  -co TILED=YES \
  -overwrite \
  "${RGB_TIF_RED}" \
  "${WARP_TIF_RED}"

echo "Done!"
echo "Raster MTS source files:"
echo "- ${WARP_TIF_CONTRAST}"
echo "- ${WARP_TIF_RED}"
