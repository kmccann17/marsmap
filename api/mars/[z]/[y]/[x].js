const BASE_URL =
  'https://planetarymaps.usgs.gov/arcgis/rest/services/Mars/Mars_MGS_MOLA_ClrShade_merge_global_463m/MapServer/tile';

module.exports = async (req, res) => {
  const { z, y, x } = req.query || {};

  if (z === undefined || y === undefined || x === undefined) {
    res.status(400).end('Missing tile coordinates.');
    return;
  }

  const url = `${BASE_URL}/${z}/${y}/${x}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      res.status(response.status).end();
      return;
    }

    const contentType =
      response.headers.get('content-type') || 'image/png';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000');

    const arrayBuffer = await response.arrayBuffer();
    res.status(200).end(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(502).end('Tile proxy error.');
  }
};
