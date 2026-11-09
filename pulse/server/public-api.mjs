import { createMemo } from './cache.mjs';
import { conditional, entityTag, json } from './http.mjs';
import { directoryFetcher, readDirectory } from './directory.mjs';
import { NEWS_FEEDS, mergeNews, normalizeBroadcasts, parseNews } from './feeds.mjs';
import { createSnapshotReader } from './snapshots.mjs';

export function createPublicApi({
  fetcher = (...args) => fetch(...args),
  edgeCache = () => globalThis.caches?.default,
  now = Date.now,
} = {}) {
  const memo = createMemo({ maxEntries: 128, now });
  const fetchDirectory = directoryFetcher(fetcher, now);
  const readSnapshot = createSnapshotReader({ memo, fetcher });
  async function feed(kind) {
    const fetchedAt = new Date(now()).toISOString();
    if (kind === 'news') {
      const feeds = await Promise.all(
        NEWS_FEEDS.map(async (config) => {
          try {
            const items = await memo.get(`rss:${config.source}`, 900, async () => {
              const response = await fetcher(config.url, {
                headers: {
                  Accept: 'application/rss+xml, application/atom+xml',
                  'User-Agent': 'ChedexPulse/1.4 (https://chedexpulse.app)',
                },
                signal: AbortSignal.timeout(10000),
              });
              if (!response.ok) throw Error('source');
              const text = await response.text();
              if (text.length > 1500000) throw Error('size');
              const items = parseNews(text, config).map((item) => ({
                ...item,
                language: config.language,
              }));
              if (!items.length) throw Error('empty-feed');
              return items;
            });
            return {
              source: config.source,
              status: 'ok',
              language: config.language,
              url: config.url,
              items,
            };
          } catch {
            return {
              source: config.source,
              status: 'unavailable',
              language: config.language,
              url: config.url,
              items: [],
            };
          }
        }),
      );
      if (feeds.every((feed) => feed.status !== 'ok')) throw Error('source');
      return {
        status: 'ok',
        partial: feeds.some((feed) => feed.status !== 'ok'),
        source: 'FIDE · ChessBase en español · Lichess',
        fetchedAt,
        scope:
          'Titulares de tres canales RSS/Atom, con enlace al artículo original. No es toda la prensa del ajedrez.',
        sources: feeds.map(({ items, ...feed }) => ({ ...feed, count: items.length })),
        items: mergeNews(feeds),
      };
    }
    const response = await fetcher('https://lichess.org/api/broadcast/top?page=1', {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ChedexPulse/1.4 (https://chedexpulse.app)',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw Error('source');
    const text = await response.text();
    if (text.length > 2000000) throw Error('size');
    const data = JSON.parse(text);
    if (!Array.isArray(data.active)) throw Error('schema');
    return {
      status: 'ok',
      source: 'Lichess · Broadcast API',
      fetchedAt,
      scope:
        'Torneos activos y primera página de recientes del directorio destacado de Lichess; no es un censo mundial.',
      hasMorePast: Boolean(data.past?.nextPage),
      items: normalizeBroadcasts(data),
    };
  }
  return async function publicApi(request, env, context) {
    const { pathname, origin, searchParams } = new URL(request.url);
    const directoryId = pathname.match(/^\/api\/directory\/players\/(\d{1,12})$/)?.[1];
    const directorySearch = pathname === '/api/directory/players';
    const query = directorySearch
      ? (searchParams.get('q') || '').normalize('NFC').trim().replace(/\s+/g, ' ')
      : undefined;
    if (directorySearch && (query.length < 3 || query.length > 80 || /[\p{Cc}]/u.test(query)))
      return json({ error: 'Escribe entre 3 y 80 caracteres.' }, 400);
    const performanceCode = pathname.match(/^\/api\/performance\/(WORLD|[A-Z]{3})$/)?.[1];
    const playerId = pathname.match(/^\/api\/players\/(\d{1,12})$/)?.[1];
    const kind = performanceCode
      ? 'performance'
      : directorySearch
        ? 'search'
        : directoryId
          ? 'directory'
          : pathname === '/api/news'
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
    const ttl =
      kind === 'news'
        ? 900
        : kind === 'broadcasts' || kind === 'search'
          ? 300
          : kind === 'directory'
            ? 3600
            : 600;
    const key = `${origin}/__pulse_cache__/v4${pathname}${directorySearch ? '?q=' + encodeURIComponent(query.toLocaleLowerCase('es')) : ''}`;
    const cache = edgeCache(),
      cacheKey = new Request(key);
    const cached = cache && (await cache.match(cacheKey));
    if (cached) return conditional(cached, request);
    try {
      const resource = await memo.get(key, ttl, async () => {
        let payload;
        if (kind === 'performance') {
          let response,
            delivery = 'github';
          try {
            response = await fetcher(
              `https://raw.githubusercontent.com/Andres-L1/Repartos/main/pulse/public/snapshots/performance/${performanceCode}.json`,
              { signal: AbortSignal.timeout(10000) },
            );
            if (!response.ok) throw Error('source');
          } catch {
            delivery = 'bundled';
            response = await env.ASSETS.fetch(
              new Request(new URL(`/snapshots/performance/${performanceCode}.json`, origin)),
            );
            if (!response.ok) throw Error('source');
          }
          const source = await response.text();
          if (source.length > 500000) throw Error('size');
          const data = JSON.parse(source);
          if (
            data.schema !== 1 ||
            !/^\d{4}-\d{2}$/.test(data.month) ||
            !data.groups ||
            typeof data.groups !== 'object'
          )
            throw Error('schema');
          payload = { status: 'ok', delivery, ...data };
        } else if (kind === 'search' || kind === 'directory')
          payload = await readDirectory(fetchDirectory, { query, id: directoryId, now });
        else if (kind === 'news' || kind === 'broadcasts') payload = await feed(kind);
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
        if (payload.missing) return payload;
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
          source:
            kind === 'news'
              ? 'FIDE · ChessBase · Lichess'
              : ['broadcasts', 'search', 'directory'].includes(kind)
                ? 'Lichess'
                : 'Análisis',
          fetchedAt: null,
          items: [],
          message: 'La fuente no está disponible temporalmente. Inténtalo de nuevo.',
        },
        503,
        ['search', 'directory'].includes(kind) ? { 'Retry-After': '60' } : {},
      );
    }
  };
}
