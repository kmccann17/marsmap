const tokenFromUrl = new URLSearchParams(window.location.search).get('token');
mapboxgl.accessToken = tokenFromUrl || 'YOUR_MAPBOX_TOKEN_HERE';

const marsRasterTiles = [
  'https://planetarymaps.usgs.gov/arcgis/rest/services/Mars/Mars_MGS_MOLA_ClrShade_merge_global_463m/MapServer/tile/{z}/{y}/{x}'
];

const map = new mapboxgl.Map({
  container: 'map',
  style: {
    version: 8,
    projection: { name: 'globe' },
    sources: {
      mars: {
        type: 'raster',
        tiles: marsRasterTiles,
        tileSize: 256,
        attribution:
          'Mars shaded relief: USGS Astrogeology Science Center / NASA MGS MOLA'
      }
    },
    layers: [
      {
        id: 'mars-raster',
        type: 'raster',
        source: 'mars',
        minzoom: 0,
        maxzoom: 8
      }
    ]
  },
  zoom: 1.5,
  center: [0, 10],
  antialias: true
});

map.on('style.load', () => {
  map.setFog({
    color: 'rgb(24, 16, 11)',
    'high-color': 'rgb(49, 30, 20)',
    'horizon-blend': 0.25,
    'space-color': 'rgb(2, 2, 8)',
    'star-intensity': 0.15
  });
});

let userInteracting = false;

map.on('mousedown', () => {
  userInteracting = true;
});
map.on('dragend', () => {
  userInteracting = false;
});

function spinGlobe() {
  if (!userInteracting && map.isStyleLoaded()) {
    const center = map.getCenter();
    center.lng -= 0.08;
    map.easeTo({ center, duration: 80, easing: (n) => n, animate: true });
  }
  requestAnimationFrame(spinGlobe);
}

map.on('load', spinGlobe);
