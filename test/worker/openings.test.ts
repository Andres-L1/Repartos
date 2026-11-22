/** Estadísticas de aperturas de Lichess: siempre con un fetch falso (nunca la red real). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createOpenApp } from './helpers.js';
import { base64url } from '../../worker/auth.js';
import { openingsCleanupStmts, reduceStats, MAX_CACHE_ROWS, TTL_MS, type OpeningsSettings } from '../../worker/openings.js';
import { openTestDb } from './sqlite-db.js';

const ORIGIN = 'https://chedexpulse.app';
const SECRET = base64url(new Uint8Array(32).map((_, i) => i * 7 + 3));
const T0 = Date.UTC(2026, 0, 10, 12, 0, 0);
const AFTER_E4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

let account: { id: string; username: string };
beforeEach(() => {
  account = { id: 'Ana', username: 'Ana' };
  vi.stubGlobal('fetch', async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input);
    const method = init.method ?? 'GET';
    if (url === 'https://lichess.org/api/token' && method === 'POST') return new Response(JSON.stringify({ access_token: 'lip_x' }));
    if (url === 'https://lichess.org/api/account') return new Response(JSON.stringify(account));
    if (url === 'https://lichess.org/api/token' && method === 'DELETE') return new Response(null, { status: 204 });
    throw new Error(`fetch inesperado (la red real nunca se llama en los tests): ${method} ${url}`);
  });
});
afterEach(() => vi.unstubAllGlobals());

const REPLY = {
  white: 600, draws: 300, black: 100, topGames: [{ white: { name: 'secreto' } }],
  opening: { eco: 'B00', name: "King's Pawn Game" },
  moves: [{ uci: 'e7e5', san: 'e5', white: 300, draws: 150, black: 50, averageRating: 2500, extra: 'x' }],
};

function setup(o: OpeningsSettings | undefined, reply: (n: number) => Response | Error = () => new Response(JSON.stringify(REPLY))) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  const fetchFake = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    const r = reply(calls.length);
    if (r instanceof Error) throw r;
    return r;
  }) as typeof fetch;
  const clock = { t: T0 };
  const db = openTestDb();
  const app = createOpenApp({
    db, content: { units: [] }, sessionSecret: SECRET, publicOrigin: ORIGIN, now: () => new Date(clock.t),
    openings: o === undefined ? undefined : { fetch: fetchFake, ...o },
  });
  const jar = new Map<string, string>();
  const store = (res: Response) => {
    for (const sc of res.headers.getSetCookie()) {
      const [pair] = sc.split(';');
      const i = pair!.indexOf('=');
      jar.set(pair!.slice(0, i), pair!.slice(i + 1));
    }
  };
  const cookie = () => [...jar].filter(([, v]) => v !== '').map(([k, v]) => `${k}=${v}`).join('; ');
  const login = async (acc: { id: string; username: string }) => {
    account = acc;
    jar.clear();
    const start = await app.request(ORIGIN + '/auth/login');
    store(start);
    const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
    store(await app.request(ORIGIN + `/auth/callback?code=abc&state=${state}`, { headers: { cookie: cookie() } }));
  };
  const get = async (path: string, anon = false) => {
    const res = await app.request(ORIGIN + path, { headers: anon ? {} : { cookie: cookie() } });
    let json: any = null;
    try { json = JSON.parse(await res.text()); } catch { /* sin cuerpo */ }
    return { status: res.status, json };
  };
  const del = () => app.request(ORIGIN + '/api/account', { method: 'DELETE', headers: { cookie: cookie(), origin: ORIGIN } });
  const stats = (fen = AFTER_E4, source = 'masters') => get(`/api/openings/stats?fen=${encodeURIComponent(fen)}&source=${source}`);
  return { db, calls, clock, login, get, stats, del };
}

const ON = { enabled: '1' };

describe('GET /api/openings/stats', () => {
  it('apagado (por defecto o con 0): 404 {disabled}, /api/me dice false y no se llama a Lichess', async () => {
    for (const cfg of [undefined, { enabled: '0' }, { enabled: '' }]) {
      const s = setup(cfg);
      await s.login({ id: 'Ana', username: 'Ana' });
      const r = await s.stats();
      expect(r.status).toBe(404);
      expect(r.json).toEqual({ disabled: true });
      expect((await s.get('/api/me')).json.openingsStats).toBe(false);
      expect(s.calls).toHaveLength(0);
    }
  });

  it('exige sesión', async () => {
    const s = setup(ON);
    expect((await s.get(`/api/openings/stats?fen=${encodeURIComponent(START)}&source=masters`, true)).status).toBe(401);
  });

  it('válido: devuelve las cifras reducidas y a Lichess solo van FEN y fuente', async () => {
    const s = setup(ON);
    await s.login({ id: 'Ana', username: 'Ana' });
    expect((await s.get('/api/me')).json.openingsStats).toBe(true);
    const r = await s.stats(AFTER_E4, 'masters');
    expect(r.status).toBe(200);
    expect(r.json).toEqual({
      white: 600, draws: 300, black: 100, cached: false,
      opening: { eco: 'B00', name: "King's Pawn Game" },
      moves: [{ uci: 'e7e5', san: 'e5', white: 300, draws: 150, black: 50 }],
    });
    expect(s.calls).toHaveLength(1);
    const u = new URL(s.calls[0]!.url);
    expect(u.origin + u.pathname).toBe('https://explorer.lichess.ovh/masters');
    expect(u.searchParams.get('fen')).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'); // al paso solo si es legal
    expect([...u.searchParams.keys()].sort()).toEqual(['fen', 'moves', 'recentGames', 'topGames']);
    const sent = JSON.stringify(s.calls[0]);
    expect(sent).not.toMatch(/ana|cookie|authorization/i);
    expect(Object.keys((s.calls[0]!.init?.headers ?? {}) as object)).toEqual(['accept']);
    await s.stats(START, 'lichess');
    expect(new URL(s.calls[1]!.url).pathname).toBe('/lichess');
  });

  it('FEN o source inválidos: 400 sin llamar a Lichess', async () => {
    const s = setup(ON);
    await s.login({ id: 'Ana', username: 'Ana' });
    const bad = [
      '', 'basura', 'x'.repeat(200), START + ' extra extra', `${START}\n`,
      '8/8/8/8/8/8/8/8 w - - 0 1', // sin reyes
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 ' + 'a'.repeat(100),
    ];
    for (const fen of bad) expect((await s.stats(fen)).status).toBe(400);
    expect((await s.get('/api/openings/stats?source=masters')).status).toBe(400);
    for (const src of ['', 'otro', 'MASTERS', 'lichess/../x']) expect((await s.stats(START, src)).status).toBe(400);
    expect((await s.get(`/api/openings/stats?fen=${encodeURIComponent(START)}`)).status).toBe(400);
    expect(s.calls).toHaveLength(0);
  });

  it('caché: la misma posición (aunque cambien los contadores) y fuente no repite la llamada; otra fuente sí; caduca a las 24 h', async () => {
    const s = setup(ON);
    await s.login({ id: 'Ana', username: 'Ana' });
    expect((await s.stats(AFTER_E4)).json.cached).toBe(false);
    const again = await s.stats(AFTER_E4.replace('0 1', '5 9'));
    expect(again.json.cached).toBe(true);
    expect(s.calls).toHaveLength(1);
    await s.login({ id: 'Luis', username: 'Luis' });
    expect((await s.stats(AFTER_E4)).json.cached).toBe(true); // compartida entre alumnos
    await s.stats(AFTER_E4, 'lichess');
    expect(s.calls).toHaveLength(2);
    s.clock.t += TTL_MS + 1;
    expect((await s.stats(AFTER_E4)).json.cached).toBe(false);
    expect(s.calls).toHaveLength(3);
  });

  it('429, error HTTP, tiempo agotado o JSON raro: {unavailable:true} sin romper ni reintentar', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const cases: (Response | Error)[] = [new Response('{}', { status: 429 }), new Response('x', { status: 500 }), new Error('timeout'), new Response('no es json'), new Response(JSON.stringify({ nada: 1 }))];
    for (const c of cases) {
      const s = setup(ON, () => c);
      await s.login({ id: 'Ana', username: 'Ana' });
      const r = await s.stats();
      expect(r.status).toBe(200);
      expect(r.json).toEqual({ unavailable: true });
      expect(s.calls).toHaveLength(1);
      expect(await s.db.first('SELECT 1 FROM cp_openings_cache')).toBeNull();
      expect(await s.db.first("SELECT calls FROM cp_openings_usage WHERE user_id = 'ana'")).toMatchObject({ calls: 0 }); // no gasta el tope
    }
  });

  it('con la caché caducada y Lichess caído se sirve la copia vieja', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const s = setup(ON, (n) => (n === 1 ? new Response(JSON.stringify(REPLY)) : new Response('', { status: 429 })));
    await s.login({ id: 'Ana', username: 'Ana' });
    await s.stats();
    s.clock.t += TTL_MS + 1;
    const r = await s.stats();
    expect(r.json.white).toBe(600);
    expect(r.json.cached).toBe(true);
  });

  it('tope por alumno y día: a la tercera posición nueva ya no se llama, la caché sigue sirviendo; mañana vuelve', async () => {
    const s = setup({ ...ON, userDailyCalls: 2 });
    await s.login({ id: 'Ana', username: 'Ana' });
    const fens = [START, AFTER_E4, 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1'];
    expect((await s.stats(fens[0])).json.white).toBe(600);
    expect((await s.stats(fens[1])).json.white).toBe(600);
    expect((await s.stats(fens[2])).json).toEqual({ unavailable: true });
    expect((await s.stats(fens[0])).json.cached).toBe(true);
    expect(s.calls).toHaveLength(2);
    // otro alumno sí puede (tope por alumno)
    await s.login({ id: 'Luis', username: 'Luis' });
    expect((await s.stats(fens[2])).json.white).toBe(600);
    s.clock.t += 86_400_000;
    await s.login({ id: 'Ana', username: 'Ana' });
    expect((await s.stats(fens[2])).json.cached).toBe(false); // día nuevo: contador a cero y caché ya caducada
    expect(s.calls).toHaveLength(4);
  });

  it('tope global del día: se aplica a todos y el rechazo no consume el tope del alumno', async () => {
    const s = setup({ ...ON, globalDailyCalls: 2 });
    await s.login({ id: 'Ana', username: 'Ana' });
    await s.stats(START);
    await s.login({ id: 'Luis', username: 'Luis' });
    await s.stats(AFTER_E4);
    const r = await s.stats('rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1');
    expect(r.json).toEqual({ unavailable: true });
    expect(s.calls).toHaveLength(2);
    expect(await s.db.first("SELECT calls FROM cp_openings_usage WHERE user_id = 'luis'")).toMatchObject({ calls: 1 });
  });

  it('el borrado de la cuenta elimina su uso', async () => {
    const s = setup(ON);
    await s.login({ id: 'Ana', username: 'Ana' });
    await s.stats();
    expect(await s.db.first("SELECT 1 FROM cp_openings_usage WHERE user_id = 'ana'")).not.toBeNull();
    await s.del();
    expect(await s.db.first("SELECT 1 FROM cp_openings_usage WHERE user_id = 'ana'")).toBeNull();
  });
});

describe('reduceStats y limpieza', () => {
  it('reduceStats descarta lo que no es número o texto corto y exige moves', () => {
    expect(reduceStats(null)).toBeNull();
    expect(reduceStats({ white: 1 })).toBeNull();
    const r = reduceStats({ white: -5, draws: 'x', black: 2.5, moves: [{ uci: 'e2e4', san: 'e4'.repeat(10), white: 1 }], opening: { name: '' } })!;
    expect(r).toMatchObject({ white: 0, draws: 0, black: 0, opening: null });
    expect(r.moves[0]!.san).toHaveLength(8);
  });

  it('la limpieza conserva MAX_CACHE_ROWS y borra lo caducado hace más de 2 días', async () => {
    const db = openTestDb();
    const ins = "INSERT INTO cp_openings_cache (fen, source, json, fetched_at) VALUES (?,?,?,?)";
    await db.run(ins, ['viejo', 'masters', '{}', T0 - 3 * TTL_MS]);
    for (let i = 0; i < MAX_CACHE_ROWS + 5; i++) await db.run(ins, [`f${i}`, 'masters', '{}', T0 - i]);
    await db.batch(openingsCleanupStmts(T0));
    expect((await db.first<{ n: number }>('SELECT COUNT(*) AS n FROM cp_openings_cache'))!.n).toBe(MAX_CACHE_ROWS);
    expect(await db.first("SELECT 1 FROM cp_openings_cache WHERE fen = 'viejo'")).toBeNull();
  });
});
