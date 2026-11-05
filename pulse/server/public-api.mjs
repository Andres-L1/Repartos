import { createMemo } from './cache.mjs';
import { conditional, entityTag, json } from './http.mjs';
import { normalizeBroadcasts, parseNews } from './feeds.mjs';
import { createSnapshotReader } from './snapshots.mjs';

export function createPublicApi({
  fetcher = (...args) => fetch(...args),
  edgeCache = () => globalThis.caches?.default,
  now = Date.now,
} = {}) {
  const memo = createMemo({ maxEntries: 128, now });
  const readSnapshot = createSnapshotReader({ memo, fetcher });
  async function feed(kind) {
    const news = kind === 'news';
    const response = await fetcher(
      news ? 'https://www.fide.com/feed/' : 'https://lichess.org/api/broadcast/top?nb=12',
      {
        headers: {
          Accept: news ? 'application/rss+xml' : 'application/json',
          'User-Agent': 'ChedexPulse/1.3 (https://chedexpulse.app)',
        },
        signal: AbortSignal.timeout(12000),
      },
    );
    if (!response.ok) throw new Error('source');
    return {
      status: 'ok',
      source: news ? 'FIDE · RSS oficial' : 'Lichess · Broadcast API',
      fetchedAt: new Date(now()).toISOString(),
      scope: news
        ? 'Últimos titulares del RSS; no es un archivo completo.'
        : 'Selección de retransmisiones destacadas; no es un censo mundial.',
      items: news ? parseNews(await response.text()) : normalizeBroadcasts(await response.json()),
    };
  }
  return async function publicApi(request, env, context) {
    const { pathname, origin } = new URL(request.url);
    const playerId = pathname.match(/^\/api\/players\/(\d{1,12})$/)?.[1];
    const kind =
      pathname === '/api/news'
        ? 'news'
        : pathname === '/api/broadcasts'
          ? 'broadcasts'
          : pathname === '/api/analytics/summary'
            ? 'analytics'
            : pathname === '/api/analytics'
              ? 'snapshot'
              : playerId
                ? 'player'
                : null;
    if (!kind) return null;
    const ttl = kind === 'news' ? 900 : kind === 'broadcasts' ? 300 : 600;
    const key = `${origin}/__pulse_cache__/v3${pathname}`;
    const cache = edgeCache(),
      cacheKey = new Request(key);
    const cached = cache && (await cache.match(cacheKey));
    if (cached) return conditional(cached, request);
    try {
      const resource = await memo.get(key, ttl, async () => {
        let payload;
        if (kind === 'news' || kind === 'broadcasts') payload = await feed(kind);
        else {
          const snapshot = await readSnapshot(request, env);
          if (kind === 'analytics') payload = snapshot.summary;
          else if (kind === 'snapshot') payload = snapshot.data;
          else {
            const player = snapshot.players.get(playerId);
            if (!player) return { missing: true };
            payload = {
              status: 'ok',
              schema: 1,
              generatedAt: snapshot.data.generatedAt,
              delivery: snapshot.data.delivery,
              month: snapshot.data.fide.month,
              player,
              interest: snapshot.interest.get(playerId) || null,
              sources: snapshot.data.fide.sources || [],
            };
          }
        }
        const text = JSON.stringify(payload);
        return { text, etag: await entityTag(text), persisted: false };
      });
      if (resource.missing) return json({ error: 'Jugador no encontrado' }, 404);
      const response = new Response(resource.text, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': `public, max-age=${ttl}`,
          ETag: resource.etag,
        },
      });
      if (cache && !resource.persisted) {
        resource.persisted = true;
        context.waitUntil(
          cache.put(cacheKey, response.clone()).catch(() => {
            resource.persisted = false;
          }),
        );
      }
      return conditional(response, request);
    } catch {
      return json(
        {
          status: 'unavailable',
          source: kind === 'news' ? 'FIDE' : kind === 'broadcasts' ? 'Lichess' : 'Análisis',
          fetchedAt: null,
          items: [],
          message: 'La fuente no está disponible temporalmente. Inténtalo de nuevo.',
        },
        503,
      );
    }
  };
}
