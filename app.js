const tokenStatus = document.getElementById('token-status');
const mode = new URLSearchParams(window.location.search).get('mode') || 'mars';
const useMapboxStandard = mode === 'earth';
const marsVariant = new URLSearchParams(window.location.search).get('mars') || 'contrast';
const HARDCODED_TOKEN =
  'pk.eyJ1Ijoia2llcmFubWNjYW5uIiwiYSI6ImNtbHVieWExbDAweHYza3B3MzZsOG81YjUifQ.w61Q4cg-CEH-ZI2MGExlJA';

const MARS_TILESETS = {
  contrast: 'mapbox://kieranmccann.mars-mola-contrast',
  red: 'mapbox://kieranmccann.mars-mola-red'
};
const marsTileset = MARS_TILESETS[marsVariant] || MARS_TILESETS.contrast;

const isFileProtocol = window.location.protocol === 'file:';

function createMarsTextureCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'mars-canvas';
  canvas.width = 2048;
  canvas.height = 1024;
  canvas.style.display = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#5a2a1e');
  gradient.addColorStop(0.45, '#8c4a2a');
  gradient.addColorStop(0.75, '#b86b36');
  gradient.addColorStop(1, '#6b2f1f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.6));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.4));
  }
  ctx.putImageData(imageData, 0, 0);

  for (let i = 0; i < 140; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 12 + Math.random() * 60;
    const alpha = 0.08 + Math.random() * 0.15;
    ctx.beginPath();
    ctx.fillStyle = `rgba(40, 20, 14, ${alpha})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = `rgba(230, 180, 120, ${alpha * 0.6})`;
    ctx.lineWidth = 2;
    ctx.arc(x + radius * 0.2, y - radius * 0.1, radius * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  }

  return canvas;
}

const marsSources = isFileProtocol
  ? {
      marsCanvas: {
        type: 'canvas',
        canvas: createMarsTextureCanvas().id,
        coordinates: [
          [-180, 85],
          [180, 85],
          [180, -85],
          [-180, -85]
        ]
      }
    }
  : {
      mars: {
        type: 'raster',
        url: marsTileset,
        tileSize: 256,
        attribution:
          'Mars shaded relief: USGS Astrogeology Science Center / NASA MGS MOLA'
      }
    };

const marsLayerSource = isFileProtocol ? 'marsCanvas' : 'mars';

function initMap(accessToken) {
  mapboxgl.accessToken = accessToken || 'YOUR_MAPBOX_TOKEN_HERE';

  const map = new mapboxgl.Map(
    useMapboxStandard
      ? {
          container: 'map',
          style: 'mapbox://styles/mapbox/standard',
          zoom: 1.5,
          center: [0, 10],
          antialias: true
        }
      : {
          container: 'map',
          style: {
            version: 8,
            projection: { name: 'globe' },
            sources: marsSources,
            layers: [
              {
                id: 'mars-raster',
                type: 'raster',
                source: marsLayerSource,
                minzoom: 0,
                maxzoom: 8
              }
            ]
          },
          zoom: 1.5,
          center: [0, 10],
          antialias: true
        }
  );

  map.on('style.load', () => {
    if (useMapboxStandard) {
      map.setProjection('globe');
    }
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
}

if (tokenStatus && !isFileProtocol) {
  tokenStatus.textContent = 'Using embedded Mapbox token for this build.';
}

initMap(HARDCODED_TOKEN);
