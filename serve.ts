// Ember Pact — local static server for play-testing game/.
// Usage: node serve.ts [--port 8080]  →  http://localhost:8080

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = portIndex >= 0 ? Number(args[portIndex + 1] ?? 8080) : 8080;
const root = join(process.cwd(), 'game');

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
};

const server = createServer((req, res) => {
  const path = normalize(join(root, decodeURIComponent(req.url?.split('?')[0] ?? '/')));
  if (!path.startsWith(root)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  const file = path.endsWith('/') || path === root ? join(path, 'index.html') : path;
  if (!existsSync(file)) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  try {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(500);
    res.end('error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Ember Pact at http://127.0.0.1:${port}/`);
});
