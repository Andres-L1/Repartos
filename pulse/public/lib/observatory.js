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
