/** Acceso restringido a alumnos de TopChess: puerta de entrada, sesiones existentes y panel de administración (modo por defecto: 'allowlist'). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createApp } from '../../worker/app.js';
import { base64url } from '../../worker/auth.js';
import { MAX_ALLOWED, MAX_REQUESTS, recordDenied } from '../../worker/access.js';
import { cleanupStmts } from '../../worker/puzzles.js';
import type { Lesson, Unit } from '../../src/content/schema.js';
import { openTestDb } from './sqlite-db.js';

const ORIGIN = 'https://chedexpulse.app';
const SECRET = base64url(new Uint8Array(32).map((_, i) => i * 7 + 3));
const SESSION = '__Host-chedex_session';
const DAY = 86_400_000;
const NOW = Date.UTC(2026, 0, 10, 12, 0, 0);

const lesson = (id: string, extra: Partial<Lesson> = {}): Lesson => ({
  id, unitId: 'a', title: `T ${id}`, objective: 'o', intro: 'i', explanation: [], practice: [], evaluation: [], ...extra,
});
const units: Unit[] = [{ id: 'a', order: 1, title: 'A', description: 'd', level: 'beginner', requires: [], lessons: [lesson('a.1'), lesson('a.2')] }];

let account: { id: string; username: string };
let calls: string[];

beforeEach(() => {
  account = { id: 'Ana', username: 'Ana' };
  calls = [];
  vi.stubGlobal('fetch', async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input);
    const method = init.method ?? 'GET';
    calls.push(`${method} ${url}`);
    if (url === 'https://lichess.org/api/token' && method === 'POST') return new Response(JSON.stringify({ access_token: 'lip_x' }));
    if (url === 'https://lichess.org/api/account') return new Response(JSON.stringify(account));
    if (url === 'https://lichess.org/api/token' && method === 'DELETE') return new Response(null, { status: 204 });
    throw new Error(`fetch inesperado: ${method} ${url}`);
  });
});
afterEach(() => vi.unstubAllGlobals());

/** Sin accessMode: así se construye en producción (worker/index.ts), y debe ser restrictivo. */
function setup() {
  const db = openTestDb();
  const app = createApp({ db, content: { units }, sessionSecret: SECRET, publicOrigin: ORIGIN, now: () => new Date(NOW) });
  const jar = new Map<string, string>();
  const raw = async (method: string, path: string, body?: unknown, extra: Record<string, string> = {}) => {
    const headers: Record<string, string> = { ...extra };
    if (body !== undefined) headers['content-type'] = 'application/json';
    const ck = [...jar].filter(([, v]) => v !== '').map(([k, v]) => `${k}=${v}`).join('; ');
    if (ck && !('cookie' in headers)) headers.cookie = ck;
    const res = await app.request(ORIGIN + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    for (const sc of res.headers.getSetCookie()) {
      const [pair] = sc.split(';');
      const i = pair!.indexOf('=');
      jar.set(pair!.slice(0, i), pair!.slice(i + 1));
    }
    return res;
  };
  const req = async (method: string, path: string, body?: unknown, extra: Record<string, string> = {}) => {
    const res = await raw(method, path, body, extra);
    let json: any = null;
    try { json = JSON.parse(await res.text()); } catch { /* sin cuerpo */ }
    return { status: res.status, json, res };
  };
  const login = async () => {
    const start = await raw('GET', '/auth/login');
    const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
    return raw('GET', `/auth/callback?code=abc123&state=${state}`);
  };
  const allow = (id: string) => db.raw.prepare('INSERT INTO cp_allowed_users (lichess_id, username, added_at, added_by) VALUES (?,?,?,?)').run(id, id, NOW, 'andresli');
  const n = (t: string) => (db.raw.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;
  const as = async (name: string) => { account = { id: name, username: name }; jar.clear(); return login(); };
  return { app, db, raw, req, login, allow, n, as, jar };
}
const own = { origin: ORIGIN };

describe('puerta de entrada', () => {
  it('cuenta no autorizada: sin sesión ni usuario, se registra la solicitud, el token se revoca y ve su nombre', async () => {
    const s = setup();
    const res = await s.login();
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`${ORIGIN}/entrar?acceso=denegado&usuario=Ana`);
    expect(res.headers.getSetCookie().some((c) => c.startsWith(`${SESSION}=`) && !c.startsWith(`${SESSION}=;`))).toBe(false);
    expect(s.n('cp_users')).toBe(0);
    expect(s.n('cp_profiles')).toBe(0);
    expect(s.db.raw.prepare('SELECT lichess_id, username, first_at, last_at, attempts FROM cp_access_requests').all()).toEqual([
      { lichess_id: 'ana', username: 'Ana', first_at: NOW, last_at: NOW, attempts: 1 },
    ]);
    expect(calls).toContain('DELETE https://lichess.org/api/token');
    expect((await s.req('GET', '/api/me')).status).toBe(401);
    await s.login();
    expect(s.db.raw.prepare('SELECT attempts FROM cp_access_requests').all()).toEqual([{ attempts: 2 }]);
  });

  it('cuenta autorizada: entra y se crea su usuario; el id se compara en minúsculas', async () => {
    const s = setup();
    s.allow('ana');
    const res = await s.login();
    expect(res.headers.get('location')).toBe(`${ORIGIN}/aprender`);
    expect(s.n('cp_users')).toBe(1);
    expect((await s.req('GET', '/api/me')).json).toMatchObject({ user: { id: 'ana' }, isAdmin: false });
    expect(s.n('cp_access_requests')).toBe(0);
  });

  it('la administración entra siempre, aunque no esté en la tabla, y /api/me lo indica', async () => {
    const s = setup();
    await s.as('AndresLi');
    expect(s.n('cp_allowed_users')).toBe(0);
    expect((await s.req('GET', '/api/me')).json).toMatchObject({ user: { id: 'andresli' }, isAdmin: true });
  });

  it('quitar a alguien le cierra la sesión existente (403 y cookie borrada) sin borrar sus datos', async () => {
    const s = setup();
    s.allow('ana');
    await s.login();
    await s.req('PUT', '/api/level', { level: 'beginner' });
    expect((await s.req('GET', '/api/profile')).status).toBe(200);
    s.db.raw.prepare('DELETE FROM cp_allowed_users').run();
    const r = await s.req('GET', '/api/profile');
    expect(r.status).toBe(403);
    expect(r.json.error).toMatch(/TopChess/);
    expect(r.res.headers.getSetCookie().some((c) => c.startsWith(`${SESSION}=;`) && c.includes('Max-Age=0'))).toBe(true);
    expect(s.n('cp_users')).toBe(1);
    expect(s.n('cp_user_level')).toBe(1);
    // vuelve a entrar si lo autorizan de nuevo, con sus datos
    s.allow('ana');
    await s.login();
    expect((await s.req('GET', '/api/level')).json.chosen ?? 'beginner').toBeTruthy();
    expect((await s.req('GET', '/api/profile')).status).toBe(200);
  });

  it('usuarios que ya existían en cp_users y no figuran en la lista pierden el acceso (403), salvo la administración', async () => {
    const s = setup();
    s.allow('ana');
    await s.login();
    const ana = s.jar.get(SESSION)!;
    s.db.raw.exec("INSERT INTO cp_users (id, username, created_at, last_login_at) VALUES ('andresli','AndresLi','x','x')");
    s.db.raw.prepare('DELETE FROM cp_allowed_users').run();
    expect((await s.req('GET', '/api/me', undefined, { cookie: `${SESSION}=${ana}` })).status).toBe(403);
    await s.as('AndresLi');
    expect((await s.req('GET', '/api/me')).status).toBe(200);
  });

  it('DELETE /api/account sigue funcionando para quien tiene acceso', async () => {
    const s = setup();
    s.allow('ana');
    await s.login();
    expect((await s.raw('DELETE', '/api/account', undefined, own)).status).toBe(200);
    expect(s.n('cp_users')).toBe(0);
  });

  it('solo el temario es público (sin soluciones); no hay demo y el resto de la API privada exige sesión', async () => {
    const s = setup();
    expect((await s.req('GET', '/api/demo', undefined, { cookie: '' })).status).toBe(404);
    const outline = await s.req('GET', '/api/outline', undefined, { cookie: '' });
    expect(outline.status).toBe(200);
    expect(JSON.stringify(outline.json)).not.toMatch(/solutionUci|explanationCorrect|"practice"|"evaluation"/);
    for (const p of ['/api/lessons/a.1', '/api/lessons/a.2', '/api/map', '/api/profile', '/api/admin/access']) expect((await s.req('GET', p, undefined, { cookie: '' })).status).toBe(401);
  });
});

describe('solicitudes de acceso: límites y conservación', () => {
  it('nunca más de MAX_REQUESTS filas: se borran las más antiguas', async () => {
    const s = setup();
    for (let i = 0; i < MAX_REQUESTS + 25; i++) await recordDenied(s.db, { id: `u${i}`, username: `U${i}` }, NOW + i);
    expect(s.n('cp_access_requests')).toBe(MAX_REQUESTS);
    expect(s.db.raw.prepare("SELECT COUNT(*) AS n FROM cp_access_requests WHERE lichess_id = 'u0'").get()).toEqual({ n: 0 });
    expect(s.db.raw.prepare(`SELECT COUNT(*) AS n FROM cp_access_requests WHERE lichess_id = 'u${MAX_REQUESTS + 24}'`).get()).toEqual({ n: 1 });
  });

  it('la limpieza horaria borra las de más de 90 días y no toca las recientes', async () => {
    const s = setup();
    await recordDenied(s.db, { id: 'viejo', username: 'Viejo' }, NOW - 91 * DAY);
    await recordDenied(s.db, { id: 'reciente', username: 'Reciente' }, NOW - 89 * DAY);
    await s.db.batch(cleanupStmts(NOW));
    expect(s.db.raw.prepare('SELECT lichess_id FROM cp_access_requests').all()).toEqual([{ lichess_id: 'reciente' }]);
  });
});

describe('API de administración', () => {
  const post = (s: ReturnType<typeof setup>, username: unknown, extra: Record<string, string> = own) => s.req('POST', '/api/admin/allowed', { username }, extra);
  let s: ReturnType<typeof setup>;
  beforeEach(() => { s = setup(); });

  it('sin sesión 401; con sesión de alumno 403 en todas las rutas, sin modificar nada', async () => {
    s.allow('ana');
    s.db.raw.prepare("INSERT INTO cp_access_requests VALUES ('luis','Luis',1,1,1)").run();
    expect((await s.req('GET', '/api/admin/access', undefined, { cookie: '' })).status).toBe(401);
    await s.as('Ana');
    for (const [m, p, b] of [
      ['GET', '/api/admin/access'], ['POST', '/api/admin/allowed', { username: 'Pepe' }], ['DELETE', '/api/admin/allowed/ana'],
      ['POST', '/api/admin/requests/luis/approve'], ['DELETE', '/api/admin/requests/luis'],
    ] as const) expect((await s.req(m, p, b, own)).status, `${m} ${p}`).toBe(403);
    expect(s.n('cp_allowed_users')).toBe(1);
    expect(s.n('cp_access_requests')).toBe(1);
  });

  it('operaciones que modifican exigen Origin propio (CSRF): sin Origin o ajeno, 403', async () => {
    await s.as('AndresLi');
    for (const extra of [{} as Record<string, string>, { origin: 'https://evil.example' }]) {
      expect((await post(s, 'Pepe', extra)).status).toBe(403);
      expect((await s.req('DELETE', '/api/admin/allowed/pepe', undefined, extra)).status).toBe(403);
      expect((await s.req('POST', '/api/admin/requests/pepe/approve', undefined, extra)).status).toBe(403);
      expect((await s.req('DELETE', '/api/admin/requests/pepe', undefined, extra)).status).toBe(403);
    }
    expect(s.n('cp_allowed_users')).toBe(0);
    expect((await s.req('GET', '/api/admin/access')).status).toBe(200);
  });

  it('añadir: valida el usuario, guarda el id en minúsculas y el nombre tal cual, rechaza duplicados y a la administración', async () => {
    await s.as('AndresLi');
    for (const bad of ['', ' ', 'a', 'x'.repeat(31), 'con espacio', 'ñandú', '<b>', '../x', 5, null, undefined])
      expect((await post(s, bad)).status, JSON.stringify(bad)).toBe(400);
    expect((await s.req('POST', '/api/admin/allowed', undefined, own)).status).toBe(415);
    expect((await s.req('POST', '/api/admin/allowed', { username: 'a'.repeat(20_000) }, own)).status).toBe(413);
    const ok = await post(s, '  Pepe_9 ');
    expect(ok.status).toBe(200);
    expect(ok.json.allowed).toEqual([{ id: 'pepe_9', username: 'Pepe_9', addedAt: NOW }]);
    expect(s.db.raw.prepare('SELECT added_by FROM cp_allowed_users').get()).toEqual({ added_by: 'andresli' });
    expect((await post(s, 'PEPE_9')).status).toBe(409);
    expect((await post(s, 'AndresLi')).status).toBe(409);
    expect(s.n('cp_allowed_users')).toBe(1);
  });

  it('tope de autorizados', async () => {
    await s.as('AndresLi');
    const ins = s.db.raw.prepare('INSERT INTO cp_allowed_users (lichess_id, username, added_at, added_by) VALUES (?,?,?,?)');
    for (let i = 0; i < MAX_ALLOWED; i++) ins.run(`alumno${i}`, `Alumno${i}`, NOW, 'x');
    const r = await post(s, 'Uno_Mas');
    expect(r.status).toBe(409);
    expect(r.json.error).toMatch(/máximo/);
    expect(s.n('cp_allowed_users')).toBe(MAX_ALLOWED);
  });

  it('quitar: 404 si no está, 400 si el id no es válido; quita y el alumno pierde la sesión', async () => {
    s.allow('ana');
    await s.as('Ana');
    const ana = s.jar.get(SESSION)!;
    await s.as('AndresLi');
    expect((await s.req('DELETE', '/api/admin/allowed/nadie', undefined, own)).status).toBe(404);
    expect((await s.req('DELETE', '/api/admin/allowed/a%20b', undefined, own)).status).toBe(400);
    const r = await s.req('DELETE', '/api/admin/allowed/ANA', undefined, own);
    expect(r.status).toBe(200);
    expect(r.json.allowed).toEqual([]);
    expect((await s.req('GET', '/api/me', undefined, { cookie: `${SESSION}=${ana}` })).status).toBe(403);
  });

  it('solicitudes: un intento denegado aparece, se autoriza de un clic, entra y la solicitud desaparece', async () => {
    await s.as('Luis'); // denegado
    expect(s.n('cp_access_requests')).toBe(1);
    await s.as('AndresLi');
    const list = await s.req('GET', '/api/admin/access');
    expect(list.json.requests).toEqual([{ id: 'luis', username: 'Luis', firstAt: NOW, lastAt: NOW, attempts: 1 }]);
    expect(list.json.maxAllowed).toBe(MAX_ALLOWED);
    expect((await s.req('POST', '/api/admin/requests/nadie/approve', undefined, own)).status).toBe(404);
    const ok = await s.req('POST', '/api/admin/requests/luis/approve', undefined, own);
    expect(ok.status).toBe(200);
    expect(ok.json.allowed.map((a: any) => a.username)).toEqual(['Luis']);
    expect(ok.json.requests).toEqual([]);
    expect((await s.as('Luis')).headers.get('location')).toBe(`${ORIGIN}/aprender`);
  });

  it('descartar una solicitud la borra; descartar una inexistente no falla', async () => {
    await s.as('Luis');
    await s.as('AndresLi');
    expect((await s.req('DELETE', '/api/admin/requests/luis', undefined, own)).json.requests).toEqual([]);
    expect((await s.req('DELETE', '/api/admin/requests/luis', undefined, own)).status).toBe(200);
    expect((await s.req('DELETE', '/api/admin/requests/a%20b', undefined, own)).status).toBe(400);
  });
});
