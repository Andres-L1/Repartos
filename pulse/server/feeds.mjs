export function decodeXml(text = '') {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(x[0-9a-f]+|\d+);|&(amp|lt|gt|quot|apos);/gi, (all, num, named) => {
      if (!num) return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[named.toLowerCase()];
      const n = num[0].toLowerCase() === 'x' ? parseInt(num.slice(1), 16) : Number(num);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
    })
    .trim();
}
export const NEWS_FEEDS = [
  {
    source: 'FIDE',
    url: 'https://www.fide.com/feed/',
    hosts: ['fide.com', 'www.fide.com'],
    language: 'en',
  },
  {
    source: 'ChessBase',
    url: 'https://es.chessbase.com/feed/20',
    hosts: ['es.chessbase.com'],
    language: 'es',
  },
  {
    source: 'Lichess',
    url: 'https://lichess.org/blog.atom',
    hosts: ['lichess.org'],
    language: 'en',
  },
];
export function parseNews(xml, config = NEWS_FEEDS[0]) {
  const atom = /<feed[\s>]/i.test(xml);
  const entries = [
    ...xml.matchAll(
      atom ? /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi : /<item\b[^>]*>([\s\S]*?)<\/item>/gi,
    ),
  ];
  return entries.slice(0, 20).flatMap(([, item]) => {
    const field = (name) =>
      decodeXml(item.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1]);
    const title = field('title');
    const url = atom
      ? decodeXml(item.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1])
      : field('link');
    const date = new Date(atom ? field('published') || field('updated') : field('pubDate'));
    let link;
    try {
      link = new URL(url);
    } catch {
      return [];
    }
    if (
      !title ||
      link.protocol !== 'https:' ||
      !config.hosts.includes(link.hostname) ||
      link.username ||
      link.password ||
      !Number.isFinite(date.getTime())
    )
      return [];
    const result = {
      title: title.slice(0, 500),
      url: link.href,
      publishedAt: date.toISOString(),
      source: config.source,
    };
    // Mantiene el contrato del parser FIDE; la API añade idioma y metadatos.
    return [result];
  });
}
export function mergeNews(feeds) {
  const urls = new Set();
  return feeds
    .flatMap((feed) => feed.items)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((item) => {
      if (urls.has(item.url)) return false;
      urls.add(item.url);
      return true;
    })
    .slice(0, 60);
}
function isoDate(value) {
  if (value === null || value === undefined) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
export function normalizeBroadcasts(data) {
  const seen = new Set();
  return ['active', 'upcoming', 'past']
    .flatMap((group) => {
      const rows = Array.isArray(data[group])
        ? data[group]
        : group === 'past'
          ? data.past?.currentPageResults
          : [];
      return (Array.isArray(rows) ? rows : []).flatMap((entry) => {
        const tour = entry.tour,
          round = entry.round;
        if (!/^[A-Za-z0-9_-]{1,64}$/.test(tour?.id || '') || !tour.name || seen.has(tour.id))
          return [];
        const url = round?.url || tour.url;
        if (!/^https:\/\/lichess\.org\/broadcast\//.test(url || '')) return [];
        seen.add(tour.id);
        return [
          {
            id: tour.id,
            name: tour.name,
            url,
            round: round?.name || '',
            location: tour.info?.location || '',
            players: tour.info?.players || '',
            format: tour.info?.format || '',
            timeControl: tour.info?.tc || '',
            startsAt: isoDate(round?.startsAt || tour.dates?.[0]),
            finishedAt: isoDate(round?.finishedAt),
            status: round?.ongoing
              ? 'live'
              : round?.finishedAt || round?.finished || group === 'past'
                ? 'finished'
                : 'upcoming',
            standingsUrl: /^https:\/\//.test(tour.info?.standings || '')
              ? tour.info.standings
              : null,
            source: 'Lichess',
          },
        ];
      });
    })
    .slice(0, 500);
}
