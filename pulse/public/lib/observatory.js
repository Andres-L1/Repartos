import { matchesCountry } from '../data.js';

// El orden de la fuente no garantiza que los directos aparezcan primero.
export function orderBroadcasts(items) {
  const priority = { live: 0, upcoming: 1, finished: 2 };
  const time = (item) => {
    const value = Date.parse(item.startsAt);
    return Number.isFinite(value) ? value : item.status === 'finished' ? 0 : Infinity;
  };
  return [...items].sort(
    (a, b) =>
      (priority[a.status] ?? 1) - (priority[b.status] ?? 1) ||
      (a.status === 'finished' ? time(b) - time(a) : time(a) - time(b)) ||
      String(a.id).localeCompare(String(b.id)),
  );
}

export function countryActivity(list, broadcasts, players = [], filter = 'all') {
  return list.map((country) => {
    const items = orderBroadcasts(
      broadcasts.filter((item) => matchesCountry(item.location, country)),
    );
    const live = items.filter((item) => item.status === 'live').length;
    const upcoming = items.filter((item) => item.status === 'upcoming').length;
    const roster = players.filter((player) => player.country === country.code).length;
    const count =
      filter === 'live'
        ? live
        : filter === 'upcoming'
          ? upcoming
          : filter === 'players'
            ? roster
            : items.length;
    return { country, items, live, upcoming, players: roster, count };
  });
}

const madridDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Madrid',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
export function dailyOverview(broadcasts, news, now = Date.now()) {
  const today = madridDay.format(new Date(now));
  const items = orderBroadcasts(broadcasts);
  return {
    live: items.filter((item) => item.status === 'live'),
    today: items.filter(
      (item) =>
        item.status === 'upcoming' &&
        item.startsAt &&
        madridDay.format(new Date(item.startsAt)) === today,
    ),
    upcoming: items.filter(
      (item) => item.status === 'upcoming' && item.startsAt && Date.parse(item.startsAt) >= now,
    ),
    recentNews: news.filter(
      (item) =>
        Date.parse(item.publishedAt) <= now && Date.parse(item.publishedAt) > now - 86400000,
    ),
  };
}
