const http = require('http');
const { readFileSync, existsSync } = require('fs');
const { extname, join } = require('path');

const PORT = 4173;
const ROOT = process.cwd();

function readEnvToken() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return '';

  const raw = readFileSync(envPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key === 'MAPBOX_PUBLIC_TOKEN') {
      return rest.join('=').trim();
    }
  }
  return '';
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url ? req.url.split('?')[0] : '/';
  const filePath = urlPath === '/' ? '/index.html' : urlPath;
  const fullPath = join(ROOT, filePath);

  try {
    if (!existsSync(fullPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    if (filePath === '/index.html') {
      const token = readEnvToken();
      const html = readFileSync(fullPath, 'utf8').replace(
        '__MAPBOX_TOKEN__',
        token
      );
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(html);
      return;
    }

    const ext = extname(fullPath);
    const contentType = MIME[ext] || 'application/octet-stream';
    const file = readFileSync(fullPath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(file);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server Error');
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Marsmap dev server running at http://localhost:${PORT}`);
});
