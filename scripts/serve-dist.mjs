import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const rootDir = resolve(process.cwd(), process.env.STATIC_ROOT ?? 'dist');
const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 4173);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8'
};

function sendNotFound(response) {
  const fallback404 = join(rootDir, '404.html');

  if (existsSync(fallback404)) {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    createReadStream(fallback404).pipe(response);
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
}

async function resolvePath(requestPath) {
  const sanitizedPath = normalize(decodeURIComponent(requestPath)).replace(/^([.][.][/\\])+/, '');
  const candidatePath = resolve(rootDir, `.${sanitizedPath}`);

  if (!candidatePath.startsWith(rootDir)) {
    return null;
  }

  try {
    const candidateStat = await stat(candidatePath);
    if (candidateStat.isDirectory()) {
      return join(candidatePath, 'index.html');
    }
    return candidatePath;
  } catch {
    const htmlPath = resolve(rootDir, `.${sanitizedPath}.html`);
    if (existsSync(htmlPath)) {
      return htmlPath;
    }

    const indexPath = resolve(rootDir, `.${sanitizedPath}`, 'index.html');
    if (existsSync(indexPath)) {
      return indexPath;
    }

    return null;
  }
}

const server = createServer(async (request, response) => {
  if (!request.url || !request.method || !['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Method not allowed');
    return;
  }

  const requestUrl = new URL(request.url, `http://${host}:${port}`);
  const filePath = await resolvePath(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname);

  if (!filePath || !existsSync(filePath)) {
    sendNotFound(response);
    return;
  }

  const extension = extname(filePath).toLowerCase();
  response.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Type': mimeTypes[extension] ?? 'application/octet-stream'
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

server.listen(port, host, () => {
  console.log(`Static test server running at http://${host}:${port}`);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);