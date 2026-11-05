const HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
export function decodeXml(text = '') {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').replace(/&#(x[0-9a-f]+|\d+);|&(amp|lt|gt|quot|apos);/gi, (all, num, named) => {
    if (!num) return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[named.toLowerCase()];
    const n = num[0].toLowerCase() === 'x' ? parseInt(num.slice(1), 16) : Number(num);
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
  }).trim();
}
export function parseNews(xml) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].slice(0, 10).flatMap(([, item]) => {
    const field = name => decodeXml(item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1]);
    const title = field('title'), url = field('link'), date = new Date(field('pubDate'));
    if (!title || !/^https:\/\/(www\.)?fide\.com\//.test(url) || !Number.isFinite(date.getTime())) return [];
    return [{ title, url, publishedAt: date.toISOString(), source: 'FIDE' }];
  });
}
export function normalizeBroadcasts(data) {
  const groups = ['active', 'upcoming', 'past'];
  const seen = new Set();
  return groups.flatMap(group => (Array.isArray(data[group]) ? data[group] : []).flatMap(entry => {
    const tour = entry.tour, round = entry.round;
    if (!tour?.id || !tour.name || seen.has(tour.id)) return [];
    seen.add(tour.id);
    const url = round?.url || tour.url;
    if (!/^https:\/\/lichess\.org\/broadcast\//.test(url || '')) return [];
    return [{ id: tour.id, name: tour.name, url, round: round?.name || '', location: tour.info?.location || '', players: tour.info?.players || '', format: tour.info?.format || '', timeControl: tour.info?.tc || '', startsAt: round?.startsAt || tour.dates?.[0] || null, status: round?.ongoing ? 'live' : group === 'past' ? 'finished' : 'upcoming', source: 'Lichess' }];
  })).slice(0, 24);
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': status === 200 ? 'public, max-age=60' : 'no-store' } });
}
async function sourceFeed(kind, request, context) {
  const cache = globalThis.caches?.default;
  const cacheKey = new Request(new URL(`/api/${kind}`, request.url));
  const cached = cache && await cache.match(cacheKey);
  if (cached) return cached;
  try {
    const upstream = await fetch(kind === 'news' ? 'https://www.fide.com/feed/' : 'https://lichess.org/api/broadcast/top?nb=12', {
      headers: { Accept: kind === 'news' ? 'application/rss+xml' : 'application/json', 'User-Agent': 'ChedexPulse/1.0 (chess observatory)' },
      signal: AbortSignal.timeout(12000)
    });
    if (!upstream.ok) throw new Error('upstream');
    const items = kind === 'news' ? parseNews(await upstream.text()) : normalizeBroadcasts(await upstream.json());
    const response = json({ status: 'ok', source: kind === 'news' ? 'FIDE · RSS oficial' : 'Lichess · Broadcast API', fetchedAt: new Date().toISOString(), scope: kind === 'news' ? 'Últimos titulares del RSS; no es un archivo completo.' : 'Selección de retransmisiones destacadas; no es un censo mundial.', items });
    response.headers.set('Cache-Control', `public, max-age=${kind === 'news' ? 900 : 300}`);
    if (cache) context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch {
    return json({ status: 'unavailable', source: kind === 'news' ? 'FIDE' : 'Lichess', fetchedAt: null, items: [], message: 'La fuente no está disponible temporalmente. Inténtalo de nuevo.' }, 503);
  }
}
export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    if (!['GET', 'HEAD'].includes(request.method)) return json({ error: 'Método no permitido' }, 405);
    if (url.pathname === '/api/news' || url.pathname === '/api/broadcasts') {
      const response = await sourceFeed(url.pathname.slice(5), request, context);
      return request.method === 'HEAD' ? new Response(null, response) : response;
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'Recurso no encontrado' }, 404);
    const asset = await env.ASSETS.fetch(request);
    const response = new Response(asset.body, asset);
    for (const [key, value] of Object.entries(HEADERS)) response.headers.set(key, value);
    return response;
  }
};
