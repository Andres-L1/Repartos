// Respeta consultas secuenciales y el enfriamiento de Lichess por instancia.
export function directoryFetcher(fetcher, now = Date.now) {
  let tail = Promise.resolve(),
    queued = 0,
    retryAt = 0;
  return async (...args) => {
    if (queued >= 8 || now() < retryAt) throw Error('directory-busy');
    queued++;
    const before = tail;
    let release;
    tail = new Promise((resolve) => {
      release = resolve;
    });
    await before;
    try {
      if (now() < retryAt) throw Error('directory-cooldown');
      const response = await fetcher(...args);
      if (response.status === 429) retryAt = now() + 60000;
      return response;
    } finally {
      queued--;
      release();
    }
  };
}
export function normalizeFidePlayer(row) {
  if (
    !row ||
    !/^\d{1,12}$/.test(String(row.id)) ||
    typeof row.name !== 'string' ||
    !/^[A-Z]{3,4}$/.test(row.federation)
  )
    return null;
  const rating = (value) => (Number.isFinite(value) && value > 0 && value < 4000 ? value : null);
  return {
    id: String(row.id),
    name: row.name.slice(0, 200),
    federation: row.federation,
    birthYear: Number.isInteger(row.year) ? row.year : null,
    title: typeof row.title === 'string' ? row.title.slice(0, 10) : null,
    active: !row.inactive,
    standard: rating(row.standard),
    rapid: rating(row.rapid),
    blitz: rating(row.blitz),
  };
}
export function decodeRatings(values) {
  const rows = new Map();
  for (const point of (Array.isArray(values) ? values : []).slice(0, 3000)) {
    if (!Number.isSafeInteger(point)) continue;
    const rating = point % 10000,
      date = Math.floor(point / 10000);
    const year = Math.floor(date / 100),
      month = date % 100;
    if (year < 1900 || year > 2100 || month < 1 || month > 12 || rating < 1 || rating >= 4000)
      continue;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    rows.set(key, { month: key, rating });
  }
  return [...rows.values()].sort((a, b) => a.month.localeCompare(b.month));
}
export async function readDirectory(fetcher, { query, id, now }) {
  async function get(path) {
    const response = await fetcher('https://lichess.org/api/fide/player' + path, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ChedexPulse/1.4 (https://chedexpulse.app)',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('source');
    const text = await response.text();
    if (text.length > 500000) throw new Error('size');
    return JSON.parse(text);
  }
  const metadata = {
    status: 'ok',
    source: 'Datos FIDE a través de la API pública de Lichess',
    fetchedAt: new Date(now()).toISOString(),
    period: 'La API no indica la fecha de la lista; consulta FIDE para verificarla.',
  };
  if (query !== undefined) {
    const raw = await get(/^\d+$/.test(query) ? '/' + query : '?q=' + encodeURIComponent(query));
    return {
      ...metadata,
      items: (Array.isArray(raw) ? raw : raw ? [raw] : [])
        .slice(0, 30)
        .map(normalizeFidePlayer)
        .filter(Boolean),
      scope: 'Primeros 30 resultados devueltos por Lichess; su directorio puede tener ausencias.',
    };
  }
  const raw = await get('/' + id),
    player = normalizeFidePlayer(raw);
  if (!player) return { missing: true };
  let history = null;
  try {
    const data = await get('/' + id + '/ratings');
    if (data && ['standard', 'rapid', 'blitz'].some((key) => Array.isArray(data[key])))
      history = Object.fromEntries(
        ['standard', 'rapid', 'blitz'].map((key) => [key, decodeRatings(data[key])]),
      );
  } catch {
    /* La ficha sigue disponible aunque falle la serie histórica. */
  }
  return {
    ...metadata,
    player,
    history,
    historyUnavailable: history === null,
    historyNote:
      'La fuente omite meses consecutivos sin cambio de Elo. Los puntos no permiten calcular los índices Chedex ni las partidas disputadas.',
  };
}
