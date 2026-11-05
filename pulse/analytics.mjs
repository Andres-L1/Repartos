export const VERSION = '1.0';
export function change(current, previous) {
  return Number.isFinite(current) && Number.isFinite(previous) && previous > 0
    ? Math.round((10000 * (current - previous)) / previous) / 100
    : null;
}
export function monthOffset(month, offset) {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}
export function performance(history, month) {
  const expected = Array.from({ length: 13 }, (_, i) => monthOffset(month, i - 12));
  const rows = expected.map((m) => history.find((row) => row.month === m && row.rating > 0));
  const samples = rows.filter(Boolean).length;
  const games = rows.slice(1).reduce((sum, row) => sum + (row?.games || 0), 0);
  const complete = samples === 13;
  const eligible = complete && games >= 12 && rows[12].active;
  return {
    score: eligible ? rows[12].rating - rows[0].rating : null,
    delta: rows[0] && rows[12] ? rows[12].rating - rows[0].rating : null,
    games,
    samples,
    eligible,
    reason: !complete
      ? 'Se necesitan 13 listas mensuales consecutivas.'
      : games < 12
        ? 'Menos de 12 partidas registradas en el periodo.'
        : !rows[12].active
          ? 'Jugador marcado como inactivo en la lista actual.'
          : null,
  };
}
export function trending(items, endDate) {
  const end = new Date(`${endDate}T00:00:00Z`);
  const dates = Array.from({ length: 14 }, (_, i) =>
    new Date(end.getTime() - (13 - i) * 86400000).toISOString().slice(0, 10),
  );
  const rows = dates.map((date) => items.find((row) => row.date === date));
  const complete = rows.every((row) => row && Number.isFinite(row.views) && row.views >= 0);
  const previous = complete ? rows.slice(0, 7).reduce((sum, row) => sum + row.views, 0) : null;
  const current = complete ? rows.slice(7).reduce((sum, row) => sum + row.views, 0) : null;
  const eligible = complete && previous >= 100;
  return {
    current,
    previous,
    score: eligible ? change(current, previous) : null,
    eligible,
    samples: rows.filter(Boolean).length,
    start: dates[7],
    end: dates[13],
    previousStart: dates[0],
    previousEnd: dates[6],
    reason: !complete
      ? 'Faltan días en la fuente.'
      : previous < 100
        ? 'Periodo anterior inferior al mínimo de 100 visitas.'
        : null,
  };
}
export function globalIndex(history, month) {
  const now = history.find((row) => row.month === month),
    before = history.find((row) => row.month === monthOffset(month, -12));
  const eligible = Boolean(now && before && before.active >= 100);
  return {
    score: eligible ? change(now.active, before.active) : null,
    eligible,
    baseline: before?.active ?? null,
    current: now?.active ?? null,
    reason:
      !now || !before
        ? 'Faltan las dos listas comparables.'
        : before.active < 100
          ? 'La base tiene menos de 100 jugadores activos.'
          : null,
  };
}
export function fideColumns(header) {
  const keys = [
    'ID Number',
    'Name',
    'Fed',
    'Sex',
    'Tit',
    'WTit',
    'OTit',
    'FOA',
    'Gms',
    'K',
    'B-day',
    'Flag',
  ];
  const columns = Object.fromEntries(keys.map((key) => [key, header.indexOf(key)]));
  const rating = header.match(/\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\d{2}\b/i);
  if (!rating || Object.values(columns).some((pos) => pos < 0))
    throw new Error('Formato FIDE no reconocido.');
  columns.rating = rating.index;
  columns.period = rating[0].toUpperCase();
  return columns;
}
export function parseFideLine(line, columns) {
  const part = (start, end) => line.slice(columns[start], end ? columns[end] : undefined).trim();
  const id = part('ID Number', 'Name'),
    rating = Number(part('rating', 'Gms')),
    federation = part('Fed', 'Sex');
  if (
    !/^\d+$/.test(id) ||
    !/^[A-Z]{3}$/.test(federation) ||
    !Number.isInteger(rating) ||
    rating < 100 ||
    rating > 3500
  )
    return null;
  const born = Number(part('B-day', 'Flag')),
    games = Number(part('Gms', 'K'));
  if (!Number.isInteger(games) || games < 0 || games > 9999 || !part('Gms', 'K')) return null;
  const year = 2000 + Number(columns.period.slice(-2));
  return {
    id,
    name: part('Name', 'Fed'),
    federation,
    sex: part('Sex', 'Tit'),
    title: part('Tit', 'WTit') || part('WTit', 'OTit'),
    rating,
    games,
    birthYear: born >= 1900 && born <= year ? born : null,
    active: !part('Flag').toLowerCase().includes('i'),
  };
}
