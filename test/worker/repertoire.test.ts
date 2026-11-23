/** Repertorio de aperturas: validación, aislamiento por alumno y borrado de cuenta. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createOpenApp } from './helpers.js';
import { base64url } from '../../worker/auth.js';
import { openTestDb } from './sqlite-db.js';

const ORIGIN = 'https://chedexpulse.app';
const SECRET = base64url(new Uint8Array(32).map((_, i) => i * 7 + 3));
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';
let account = { id: 'Ana', username: 'Ana' };
beforeEach(() => {
  vi.stubGlobal('fetch', async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input);
    if (url === 'https://lichess.org/api/token' && (init.method ?? 'GET') === 'POST') return new Response(JSON.stringify({ access_token: 'lip_x' }));
    if (url === 'https://lichess.org/api/account') return new Response(JSON.stringify(account));
    if (url === 'https://lichess.org/api/token') return new Response(null, { status: 204 });
    throw new Error(`fetch inesperado: ${url}`);
  });
});
afterEach(() => vi.unstubAllGlobals());

function setup() {
  const db = openTestDb();
  const app = createOpenApp({ db, content: { units: [] }, sessionSecret: SECRET, publicOrigin: ORIGIN, now: () => new Date(0) });
  const jar = new Map<string, string>();
  const cookie = () => [...jar].filter(([, v]) => v !== '').map(([k, v]) => `${k}=${v}`).join('; ');
  const store = (res: Response) => {
    for (const sc of res.headers.getSetCookie()) {
      const [pair] = sc.split(';');
      const i = pair!.indexOf('=');
      jar.set(pair!.slice(0, i), pair!.slice(i + 1));
    }
  };
  const login = async (acc: typeof account) => {
    account = acc;
    jar.clear();
    const start = await app.request(ORIGIN + '/auth/login');
    store(start);
    const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
    store(await app.request(ORIGIN + `/auth/callback?code=abc&state=${state}`, { headers: { cookie: cookie() } }));
  };
  const call = async (method: string, path: string, body?: unknown, anon = false) => {
    const res = await app.request(ORIGIN + path, {
      method,
      headers: { ...(anon ? {} : { cookie: cookie() }), origin: ORIGIN, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    let json: any = null;
    try { json = JSON.parse(await res.text()); } catch { /* sin cuerpo */ }
    return { status: res.status, json };
  };
  return { db, login, call };
}

describe('/api/repertoire', () => {
  it('exige sesión', async () => {
    const s = setup();
    expect((await s.call('GET', '/api/repertoire', undefined, true)).status).toBe(401);
  });

  it('añade (sin duplicar), quita y vacía; cada alumno ve solo lo suyo', async () => {
    const s = setup();
    await s.login({ id: 'Ana', username: 'Ana' });
    const add = { color: 'white', moves: [{ key: START, uci: 'e2e4' }] };
    expect((await s.call('POST', '/api/repertoire/add', add)).json.moves).toHaveLength(1);
    expect((await s.call('POST', '/api/repertoire/add', add)).json.moves).toHaveLength(1);
    await s.login({ id: 'Luis', username: 'Luis' });
    expect((await s.call('GET', '/api/repertoire')).json.moves).toEqual([]);
    await s.login({ id: 'Ana', username: 'Ana' });
    const key = (await s.call('GET', '/api/repertoire')).json.moves[0].key;
    expect((await s.call('POST', '/api/repertoire/remove', { color: 'white', key, uci: 'e2e4' })).json.moves).toEqual([]);
    await s.call('POST', '/api/repertoire/add', add);
    expect((await s.call('POST', '/api/repertoire/clear', { color: 'white' })).json.moves).toEqual([]);
  });

  it('rechaza jugadas ilegales, colores raros y cuerpos mal formados', async () => {
    const s = setup();
    await s.login({ id: 'Ana', username: 'Ana' });
    expect((await s.call('POST', '/api/repertoire/add', { color: 'white', moves: [{ key: START, uci: 'e2e5' }] })).status).toBe(400);
    expect((await s.call('POST', '/api/repertoire/add', { color: 'rojo', moves: [] })).status).toBe(400);
    expect((await s.call('POST', '/api/repertoire/add', { color: 'white', moves: 'x' })).status).toBe(400);
    expect((await s.call('POST', '/api/repertoire/clear', {})).status).toBe(400);
  });

  it('comentarios: se guardan, se borran con texto vacío, solo en jugadas propias y con límite', async () => {
    const s = setup();
    await s.login({ id: 'Ana', username: 'Ana' });
    const mv = { color: 'white', key: START, uci: 'e2e4' };
    expect((await s.call('POST', '/api/repertoire/note', { ...mv, note: 'Centro' })).status).toBe(404);
    await s.call('POST', '/api/repertoire/add', { color: 'white', moves: [{ key: START, uci: 'e2e4' }] });
    const key = (await s.call('GET', '/api/repertoire')).json.moves[0].key;
    expect((await s.call('POST', '/api/repertoire/note', { ...mv, key, note: '  Centro  ' })).json.moves[0].note).toBe('Centro');
    expect((await s.call('POST', '/api/repertoire/note', { ...mv, key, note: 'x'.repeat(281) })).status).toBe(400);
    await s.login({ id: 'Luis', username: 'Luis' });
    expect((await s.call('GET', '/api/repertoire')).json.moves).toEqual([]);
    await s.login({ id: 'Ana', username: 'Ana' });
    expect((await s.call('POST', '/api/repertoire/note', { ...mv, key, note: '' })).json.moves[0].note).toBeNull();
    await s.call('POST', '/api/repertoire/note', { ...mv, key, note: 'Otra' });
    await s.call('POST', '/api/repertoire/remove', { ...mv, key });
    expect(await s.db.first('SELECT 1 FROM cp_repertoire_notes')).toBeNull();
  });

  it('borrar la cuenta borra el repertorio', async () => {
    const s = setup();
    await s.login({ id: 'Ana', username: 'Ana' });
    await s.call('POST', '/api/repertoire/add', { color: 'white', moves: [{ key: START, uci: 'e2e4' }] });
    expect((await s.call('DELETE', '/api/account')).status).toBe(200);
    expect(await s.db.first("SELECT 1 FROM cp_repertoire WHERE user_id = 'ana'")).toBeNull();
  });
});
