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
export function parseNews(xml) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].slice(0, 10).flatMap(([, item]) => {
    const field = (name) =>
      decodeXml(item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1]);
    const title = field('title'),
      url = field('link'),
      date = new Date(field('pubDate'));
    if (!title || !/^https:\/\/(www\.)?fide\.com\//.test(url) || !Number.isFinite(date.getTime()))
      return [];
    return [{ title, url, publishedAt: date.toISOString(), source: 'FIDE' }];
  });
}
export function normalizeBroadcasts(data) {
  const groups = ['active', 'upcoming', 'past'];
  const seen = new Set();
  return groups
    .flatMap((group) =>
      (Array.isArray(data[group]) ? data[group] : []).flatMap((entry) => {
        const tour = entry.tour,
          round = entry.round;
        if (!tour?.id || !tour.name || seen.has(tour.id)) return [];
        seen.add(tour.id);
        const url = round?.url || tour.url;
        if (!/^https:\/\/lichess\.org\/broadcast\//.test(url || '')) return [];
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
            startsAt: round?.startsAt || tour.dates?.[0] || null,
            status: round?.ongoing ? 'live' : group === 'past' ? 'finished' : 'upcoming',
            source: 'Lichess',
          },
        ];
      }),
    )
    .slice(0, 24);
}
