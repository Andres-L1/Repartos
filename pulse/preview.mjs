import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import worker from './worker.mjs';
const root = fileURLToPath(new URL('./public/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const env = { ASSETS: { async fetch(request) {
  const pathname = decodeURIComponent(new URL(request.url).pathname);
  const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!target.startsWith(root) || target.includes('\0')) return new Response('No encontrado', { status: 404 });
  try { return new Response(await readFile(target), { headers: { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' } }); }
  catch { return new Response('No encontrado', { status: 404 }); }
} } };
const server = createServer(async (req, res) => {
  try {
    const response = await worker.fetch(new Request(`http://127.0.0.1:8787${req.url}`, { method: req.method }), env, { waitUntil() {} });
    res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end('Error de vista previa'); }
});
server.listen(8787, '127.0.0.1', () => console.log('Chedex Pulse · http://127.0.0.1:8787'));
