import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBroadcasts, parseNews, NEWS_FEEDS } from '../server/feeds.mjs';
import { createPublicApi } from '../server/public-api.mjs';
import { directoryFetcher, decodeRatings } from '../server/directory.mjs';
import { dailyOverview } from '../public/lib/observatory.js';
const req = (path) => new Request('https://pulse.test' + path);
const context = { waitUntil() {} };

test('la agenda conserva más de 24 torneos, lee past paginado y respeta rondas terminadas', () => {
  const entry = (id, round = {}) => ({
    tour: { id, name: 'Open ' + id, url: 'https://lichess.org/broadcast/open/' + id },
    round,
  });
  const active = Array.from({ length: 57 }, (_, i) =>
    entry(String(i), { startsAt: Date.parse('2026-11-06T12:00:00Z') }),
  );
  active[0].round.finishedAt = Date.parse('2026-11-06T14:00:00Z');
  active[1].round.ongoing = true;
  const result = normalizeBroadcasts({ active, past: { currentPageResults: [entry('past')] } });
  assert.equal(result.length, 58);
  assert.equal(result[0].status, 'finished');
  assert.equal(result[1].status, 'live');
  assert.equal(result[2].startsAt, '2026-11-06T12:00:00.000Z');
  assert.equal(result.at(-1).status, 'finished');
});

test('Atom y RSS español conservan fuente y rechazan enlaces ajenos', () => {
  const atom =
    '<feed><entry><title>Chess &amp; news</title><link rel="alternate" href="https://lichess.org/blog/test"/><published>2026-11-06T12:00:00Z</published></entry><entry><title>Bad</title><link href="https://evil.test/test"/><published>2026-11-06T12:00:00Z</published></entry></feed>';
  assert.equal(parseNews(atom, NEWS_FEEDS[2]).length, 1);
  assert.equal(parseNews(atom, NEWS_FEEDS[2])[0].source, 'Lichess');
  assert.equal(
    parseNews(
      '<rss><item><title>Noticias</title><link>https://es.chessbase.com/post/a</link><pubDate>Fri, 06 Nov 2026 12:00:00 GMT</pubDate></item></rss>',
      NEWS_FEEDS[1],
    )[0].source,
    'ChessBase',
  );
});

test('una caída de FIDE y Lichess no oculta las noticias disponibles en español', async () => {
  let calls = 0;
  const api = createPublicApi({
    edgeCache: () => undefined,
    fetcher: async (url) => {
      calls++;
      return url.includes('chessbase')
        ? new Response(
            '<rss><item><title>Noticias</title><link>https://es.chessbase.com/post/a</link><pubDate>Fri, 06 Nov 2026 12:00:00 GMT</pubDate></item></rss>',
          )
        : new Response('offline', { status: 503 });
    },
  });
  const response = await api(req('/api/news'), {}, context),
    data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.partial, true);
  assert.equal(data.items[0].language, 'es');
  assert.equal(data.sources.filter((s) => s.status === 'unavailable').length, 2);
  await api(req('/api/news'), {}, context);
  assert.equal(calls, 3);
});

test('la búsqueda valida consultas y comparte peticiones sin leer instantáneas', async () => {
  let reads = 0;
  const api = createPublicApi({
    edgeCache: () => undefined,
    fetcher: async (url) => {
      reads++;
      assert.ok(url.startsWith('https://lichess.org/api/fide/player?q='));
      return Response.json([{ id: 123, name: 'Test, Player', federation: 'ESP', standard: 1800 }]);
    },
  });
  assert.equal((await api(req('/api/directory/players?q=ab'), {}, context)).status, 400);
  assert.equal(reads, 0);
  const results = await Promise.all(
    Array.from({ length: 10 }, () => api(req('/api/directory/players?q=Test'), {}, context)),
  );
  assert.equal(reads, 1);
  assert.equal((await results[0].json()).items[0].id, '123');
});

test('las fichas amplían el directorio aunque falle su histórico y el 404 es explícito', async () => {
  const api = createPublicApi({
    edgeCache: () => undefined,
    fetcher: async (url) =>
      url.includes('/ratings')
        ? new Response('offline', { status: 503 })
        : url.endsWith('/999')
          ? new Response('not found', { status: 404 })
          : Response.json({ id: 123, name: 'Test Player', federation: 'ESP', rapid: 1900 }),
  });
  const response = await api(req('/api/directory/players/123'), {}, context),
    data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.historyUnavailable, true);
  assert.equal(data.player.standard, null);
  assert.equal(data.player.rapid, 1900);
  assert.equal((await api(req('/api/directory/players/999'), {}, context)).status, 404);
});

test('la serie compacta se decodifica sin inventar meses ni Elo', () => {
  const rows = decodeRatings([2026011800, 2026031850, 2026131900, 2026049999, NaN]);
  assert.deepEqual(rows, [
    { month: '2026-01', rating: 1800 },
    { month: '2026-03', rating: 1850 },
  ]);
});

test('la edición de hoy respeta medianoche de Madrid y no cuenta noticias futuras', () => {
  const now = Date.parse('2026-11-05T23:30:00Z');
  const summary = dailyOverview(
    [
      { id: '1', status: 'upcoming', startsAt: '2026-11-05T23:45:00Z' },
      { id: '2', status: 'upcoming', startsAt: '2026-11-06T23:15:00Z' },
    ],
    [{ publishedAt: '2026-11-05T20:00:00Z' }, { publishedAt: '2026-11-06T20:00:00Z' }],
    now,
  );
  assert.equal(summary.today.length, 1);
  assert.equal(summary.recentNews.length, 1);
});

test('el directorio no envía consultas paralelas y espera tras un 429', async () => {
  let active = 0,
    peak = 0,
    calls = 0,
    time = 0;
  const limited = directoryFetcher(
    async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 2));
      active--;
      calls++;
      return new Response('', { status: calls === 3 ? 429 : 200 });
    },
    () => time,
  );
  const results = await Promise.all([limited('a'), limited('b'), limited('c')]);
  assert.equal(peak, 1);
  assert.equal(results[2].status, 429);
  await assert.rejects(limited('d'));
  assert.equal(calls, 3);
  time = 60001;
  assert.equal((await limited('e')).status, 200);
});
