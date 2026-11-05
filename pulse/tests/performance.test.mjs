import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPublicApi } from '../server/public-api.mjs';
import { createMemo } from '../server/cache.mjs';
import { summarize } from '../server/snapshots.mjs';
import { parseRoute, legacyPath } from '../public/lib/routes.js';
import worker from '../worker.mjs';
import { requestJSON } from '../public/lib/requests.js';
const snapshot = JSON.parse(
  await readFile(new URL('../public/snapshots/latest.json', import.meta.url)),
);
const context = { waitUntil() {} };
const request = (path) => new Request('https://pulse.test' + path);
test('el cliente comparte peticiones simultáneas y reutiliza respuestas sin más llamadas', async () => {
  const original = globalThis.fetch;
  let reads = 0;
  globalThis.fetch = async () => {
    reads++;
    return Response.json({ value: 42 });
  };
  try {
    const responses = await Promise.all(
      Array.from({ length: 20 }, () => requestJSON('/test/client-cache')),
    );
    assert.equal(reads, 1);
    assert.ok(responses.every((data) => data.value === 42));
    await requestJSON('/test/client-cache');
    assert.equal(reads, 1);
  } finally {
    globalThis.fetch = original;
  }
});
test('el resumen conserva rankings y omite históricos, con reducción de tamaño medible', () => {
  const result = summarize(snapshot);
  assert.equal(result.fide.players.length, snapshot.fide.players.length);
  assert.equal(result.fide.players[0].history, undefined);
  assert.equal(result.fide.federations[0].history, undefined);
  assert.ok(result.fide.federations[0].current);
  assert.equal(result.interest.players[0].history, undefined);
  assert.ok(JSON.stringify(result).length < JSON.stringify(snapshot).length * 0.5);
});
test('veinte consultas simultáneas comparten una sola lectura de origen; el detalle comparte instantánea', async () => {
  let reads = 0;
  const api = createPublicApi({
    edgeCache: () => undefined,
    fetcher: async () => {
      reads++;
      return Response.json(snapshot);
    },
  });
  const responses = await Promise.all(
    Array.from({ length: 20 }, () => api(request('/api/analytics/summary'), {}, context)),
  );
  assert.equal(reads, 1);
  assert.ok(responses.every((r) => r.status === 200));
  const detail = await api(request('/api/players/' + snapshot.fide.players[0].id), {}, context);
  assert.equal(reads, 1);
  assert.ok((await detail.json()).player.history.length > 0);
  const legacy = await api(request('/api/analytics'), {}, context);
  assert.ok((await legacy.json()).fide.players[0].history.length > 0);
  assert.equal(reads, 1);
  const etag = responses[0].headers.get('ETag');
  assert.ok(etag);
  const unchanged = await api(
    new Request('https://pulse.test/api/analytics/summary', { headers: { 'If-None-Match': etag } }),
    {},
    context,
  );
  assert.equal(unchanged.status, 304);
  assert.equal(await unchanged.text(), '');
  assert.equal(reads, 1);
});
test('al caducar se revalida el origen con ETag en lugar de descargar la instantánea de nuevo', async () => {
  let time = 0,
    reads = 0,
    conditional = false;
  const api = createPublicApi({
    now: () => time,
    edgeCache: () => undefined,
    fetcher: async (_url, options) => {
      reads++;
      if (options.headers['If-None-Match']) {
        conditional = true;
        return new Response(null, { status: 304 });
      }
      return Response.json(snapshot, { headers: { ETag: '"snapshot-one"' } });
    },
  });
  await api(request('/api/analytics/summary'), {}, context);
  time = 601000;
  assert.equal((await api(request('/api/analytics/summary'), {}, context)).status, 200);
  assert.equal(reads, 2);
  assert.equal(conditional, true);
});
test('caché acotada, TTL y errores sin almacenar resultados fallidos', async () => {
  let time = 0,
    calls = 0;
  const memo = createMemo({ maxEntries: 1, now: () => time });
  const load = async () => ++calls;
  assert.equal(await memo.get('one', 1, load), 1);
  assert.equal(await memo.get('one', 1, load), 1);
  await memo.get('two', 1, load);
  assert.equal(await memo.get('one', 1, load), 3);
  time = 2000;
  assert.equal(await memo.get('one', 1, load), 4);
  await assert.rejects(
    memo.get('bad', 10, async () => {
      throw Error('source');
    }),
  );
  assert.equal(await memo.get('bad', 10, async () => 5), 5);
});
test('rutas limpias, enlaces anteriores y rutas desconocidas sin convertirlas en portada', async () => {
  assert.deepEqual(parseRoute('/'), { section: 'inicio', value: undefined });
  assert.equal(parseRoute('/panel').section, 'hoy');
  assert.equal(parseRoute('/indices/global').value, 'global');
  assert.equal(legacyPath('#hoy'), '/panel');
  assert.equal(legacyPath('#indices/trending'), '/indices/trending');
  assert.equal(legacyPath('#main'), null);
  assert.equal(parseRoute('/api/orders'), null);
  let requested;
  const env = {
    ASSETS: {
      fetch: async (req) => {
        requested = new URL(req.url).pathname;
        return new Response('landing');
      },
    },
  };
  assert.equal((await worker.fetch(request('/indices/global'), env, context)).status, 200);
  assert.equal(requested, '/');
  assert.equal((await worker.fetch(request('/api/missing'), env, context)).status, 404);
});
