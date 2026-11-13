import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { createApp } from '../../worker/app.js';
import { devBilling } from '../../worker/billing.js';
import { base64url, seal } from '../../worker/auth.js';
import type { BillingMode } from '../../src/shared/api.js';
import type { Lesson, Unit } from '../../src/content/schema.js';
import { openTestDb } from './sqlite-db.js';

const ORIGIN = 'https://chedexpulse.app';
const SECRET = base64url(new Uint8Array(32).map((_, i) => i * 7 + 3));
const TOKEN = 'lip_testtoken123';

const lesson = (id: string, unitId: string, extra: Partial<Lesson> = {}): Lesson => ({
  id, unitId, title: `T ${id}`, objective: `O ${id}`, intro: 'i', explanation: [], practice: [], evaluation: [], ...extra,
});
const units: Unit[] = [
  { id: 'a', order: 1, title: 'A', description: 'd', level: 'beginner', requires: [],
    lessons: [lesson('a.1', 'a', { demo: true }), lesson('a.2', 'a'), lesson('a.3', 'a')] },
  { id: 'b', order: 2, title: 'B', description: 'd', level: 'beginner', requires: ['a'], lessons: [lesson('b.1', 'b')] },
];

const DAY = 86_400_000;
let clock = Date.UTC(2026, 0, 10, 12, 0, 0);
const advance = (ms: number) => (clock += ms);

interface LichessMock {
  tokenStatus: number;
  accountStatus: number;
  account: unknown;
  calls: { url: string; method: string; auth?: string; body?: string }[];
}
let lichess: LichessMock;

function stubLichess() {
  lichess = { tokenStatus: 200, accountStatus: 200, account: { id: 'Ana', username: 'Ana' }, calls: [] };
  vi.stubGlobal('fetch', async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input);
    const method = init.method ?? 'GET';
    const headers = new Headers(init.headers);
    lichess.calls.push({ url, method, auth: headers.get('authorization') ?? undefined, body: init.body ? String(init.body) : undefined });
    if (url === 'https://lichess.org/api/token' && method === 'POST')
      return new Response(JSON.stringify(lichess.tokenStatus === 200 ? { access_token: TOKEN, token_type: 'Bearer' } : { error: 'bad' }), { status: lichess.tokenStatus });
    if (url === 'https://lichess.org/api/account') return new Response(JSON.stringify(lichess.account), { status: lichess.accountStatus });
    if (url === 'https://lichess.org/api/token' && method === 'DELETE') return new Response(null, { status: 204 });
    throw new Error(`fetch inesperado: ${method} ${url}`);
  });
}

function setup(mode: BillingMode = 'beta_open', opts: { secret?: string | undefined; units?: Unit[] } = {}) {
  clock = Date.UTC(2026, 0, 10, 12, 0, 0);
  const db = openTestDb();
  const app = createApp({
    db, content: { units: opts.units ?? units }, billingMode: mode, billing: devBilling(),
    sessionSecret: 'secret' in opts ? opts.secret : SECRET, publicOrigin: ORIGIN, now: () => new Date(clock),
  });
  const jar = new Map<string, string>();
  const cookieHeader = () => [...jar].filter(([, v]) => v !== '').map(([k, v]) => `${k}=${v}`).join('; ');
  const raw = async (method: string, path: string, body?: unknown, extra: Record<string, string> = {}) => {
    const headers: Record<string, string> = { ...extra };
    if (body !== undefined) headers['content-type'] = 'application/json';
    const ck = cookieHeader();
    if (ck && !('cookie' in headers)) headers.cookie = ck;
    const res = await app.request(ORIGIN + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    if (!('cookie' in extra)) for (const sc of res.headers.getSetCookie()) {
      const [pair] = sc.split(';');
      const i = pair!.indexOf('=');
      jar.set(pair!.slice(0, i), pair!.slice(i + 1));
    }
    return res;
  };
  const req = async (method: string, path: string, body?: unknown, extra: Record<string, string> = {}) => {
    const res = await raw(method, path, body, extra);
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { /* sin cuerpo JSON */ }
    return { status: res.status, json, headers: res.headers };
  };
  /** Flujo OAuth completo contra el mock de Lichess. */
  const login = async () => {
    const start = await raw('GET', '/auth/login');
    const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
    return raw('GET', `/auth/callback?code=abc123&state=${state}`);
  };
  return { app, db, req, raw, login, jar };
}

beforeEach(() => stubLichess());
afterEach(() => vi.unstubAllGlobals());

describe('OAuth con Lichess', () => {
  it('/auth/login redirige a Lichess con PKCE S256, sin scopes y cookie sellada', async () => {
    const s = setup();
    const res = await s.raw('GET', '/auth/login');
    expect(res.status).toBe(303);
    const loc = new URL(res.headers.get('location')!);
    expect(loc.origin + loc.pathname).toBe('https://lichess.org/oauth');
    expect(loc.searchParams.get('response_type')).toBe('code');
    expect(loc.searchParams.get('code_challenge_method')).toBe('S256');
    expect(loc.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(loc.searchParams.get('scope')).toBe('');
    expect(loc.searchParams.get('redirect_uri')).toBe(`${ORIGIN}/auth/callback`);
    const ck = res.headers.getSetCookie()[0]!;
    expect(ck).toMatch(/^__Host-chedex_oauth=/);
    expect(ck).toMatch(/HttpOnly/);
    expect(ck).toMatch(/Secure/);
    expect(ck).toMatch(/SameSite=Lax/);
    expect(ck).toMatch(/Path=\//);
    expect(ck).not.toContain(loc.searchParams.get('state')!); // sellada, no en claro
  });

  it('state inválido, ausente o error de Lichess: falla sin llamar a Lichess ni crear sesión', async () => {
    const s = setup();
    const start = await s.raw('GET', '/auth/login');
    const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
    for (const q of [`code=abc&state=otro`, `code=abc`, `error=access_denied&state=${state}`, `state=${state}`, `code=${encodeURIComponent('a b')}&state=${state}`]) {
      const res = await s.raw('GET', `/auth/callback?${q}`);
      expect(res.status).toBe(303);
      expect(res.headers.get('location')).toBe(`${ORIGIN}/?auth=failed#/entrar`);
      expect(res.headers.getSetCookie().some((c) => c.startsWith('__Host-chedex_session=') && !c.startsWith('__Host-chedex_session=;'))).toBe(false);
    }
    expect(lichess.calls).toHaveLength(0);
    expect((await s.req('GET', '/api/me')).status).toBe(401);
  });

  it('callback sin cookie de OAuth (o manipulada) falla', async () => {
    const s = setup();
    const res = await s.raw('GET', '/auth/callback?code=abc&state=x', undefined, { cookie: '__Host-chedex_oauth=basura.basura' });
    expect(res.headers.get('location')).toBe(`${ORIGIN}/?auth=failed#/entrar`);
    expect(lichess.calls).toHaveLength(0);
  });

  it('código inválido (Lichess rechaza el intercambio): falla y no hay token que revocar', async () => {
    const s = setup();
    lichess.tokenStatus = 400;
    const res = await s.login();
    expect(res.headers.get('location')).toBe(`${ORIGIN}/?auth=failed#/entrar`);
    expect(lichess.calls.map((c) => c.method)).toEqual(['POST']);
    expect((await s.req('GET', '/api/me')).status).toBe(401);
  });

  it('cuenta de Lichess inválida: falla pero el token se revoca', async () => {
    const s = setup();
    lichess.account = { id: 'x', username: '<script>' };
    const res = await s.login();
    expect(res.headers.get('location')).toBe(`${ORIGIN}/?auth=failed#/entrar`);
    expect(lichess.calls.at(-1)).toMatchObject({ method: 'DELETE', url: 'https://lichess.org/api/token', auth: `Bearer ${TOKEN}` });
    expect((await s.req('GET', '/api/me')).status).toBe(401);
  });

  it('éxito: sesión sellada, usuario en D1, token revocado y nunca guardado', async () => {
    const s = setup();
    const start = await s.raw('GET', '/auth/login');
    const challenge = new URL(start.headers.get('location')!).searchParams.get('code_challenge')!;
    const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
    const res = await s.raw('GET', `/auth/callback?code=abc123&state=${state}`);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`${ORIGIN}/#/mapa`);

    // intercambio con verifier PKCE correcto y revocación posterior
    const exchange = lichess.calls[0]!;
    const form = new URLSearchParams(exchange.body);
    expect(form.get('grant_type')).toBe('authorization_code');
    expect(form.get('code')).toBe('abc123');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(form.get('code_verifier')!));
    expect(base64url(digest)).toBe(challenge);
    expect(lichess.calls.map((c) => c.method)).toEqual(['POST', 'GET', 'DELETE']);
    expect(lichess.calls[2]).toMatchObject({ auth: `Bearer ${TOKEN}` });

    // cookie de sesión sellada
    const cookies = res.headers.getSetCookie();
    const session = cookies.find((c) => c.startsWith('__Host-chedex_session=') && !c.includes('Max-Age=0'))!;
    expect(session).toMatch(/HttpOnly/);
    expect(session).toMatch(/Secure/);
    expect(session).toMatch(/SameSite=Lax/);
    expect(session).toMatch(/Path=\//);
    expect(session).not.toMatch(/Domain=/);
    expect(session).not.toContain('Ana');
    expect(session).not.toContain(TOKEN);
    expect(cookies.some((c) => c.startsWith('__Host-chedex_oauth=;') && c.includes('Max-Age=0'))).toBe(true);

    // usuario en D1 y token ausente de toda la base
    expect(s.db.raw.prepare('SELECT id, username FROM cp_users').all()).toEqual([{ id: 'ana', username: 'Ana' }]);
    for (const { name } of s.db.raw.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[])
      expect(JSON.stringify(s.db.raw.prepare(`SELECT * FROM ${name}`).all())).not.toContain(TOKEN);

    const me = await s.req('GET', '/api/me');
    expect(me.status).toBe(200);
    expect(me.json.user).toEqual({ id: 'ana', username: 'Ana' });
    expect(JSON.stringify(me.json)).not.toMatch(/email|password|token/i);
  });

  it('un segundo login actualiza el nombre sin duplicar usuario ni perder progreso', async () => {
    const s = setup();
    await s.login();
    await s.req('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] });
    lichess.account = { id: 'ana', username: 'ANA_2' };
    await s.login();
    expect(s.db.raw.prepare('SELECT id, username FROM cp_users').all()).toEqual([{ id: 'ana', username: 'ANA_2' }]);
    expect((await s.req('GET', '/api/profile')).json.profile.xp).toBeGreaterThan(0);
  });

  it('sesión: sin cookie, manipulada, de otra clave o caducada da 401', async () => {
    const s = setup();
    expect((await s.req('GET', '/api/me', undefined, { cookie: '' })).status).toBe(401);
    await s.login();
    const good = s.jar.get('__Host-chedex_session')!;
    expect((await s.req('GET', '/api/me')).status).toBe(200);
    const tampered = good.slice(0, -2) + (good.endsWith('AA') ? 'BB' : 'AA');
    expect((await s.req('GET', '/api/me', undefined, { cookie: `__Host-chedex_session=${tampered}` })).status).toBe(401);
    const other = await seal({ kind: 'session', id: 'ana', username: 'Ana', exp: clock + DAY }, base64url(new Uint8Array(32).fill(9)));
    expect((await s.req('GET', '/api/me', undefined, { cookie: `__Host-chedex_session=${other}` })).status).toBe(401);
    const wrongKind = await seal({ kind: 'oauth', id: 'ana', username: 'Ana', exp: clock + DAY }, SECRET);
    expect((await s.req('GET', '/api/me', undefined, { cookie: `__Host-chedex_session=${wrongKind}` })).status).toBe(401);
    advance(8 * DAY);
    expect((await s.req('GET', '/api/me')).status).toBe(401);
  });

  it('logout borra cookies; exige Origin propio', async () => {
    const s = setup();
    await s.login();
    const evil = await s.req('POST', '/auth/logout', undefined, { origin: 'https://evil.example' });
    expect(evil.status).toBe(403);
    const none = await s.req('POST', '/auth/logout');
    expect(none.status).toBe(403);
    const ok = await s.raw('POST', '/auth/logout', undefined, { origin: ORIGIN });
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ ok: true });
    expect(ok.headers.getSetCookie().some((c) => c.startsWith('__Host-chedex_session=;') && c.includes('Max-Age=0'))).toBe(true);
    expect((await s.req('GET', '/api/me')).status).toBe(401);
  });

  it('GET /auth/logout no existe; registro/login con contraseña eliminados', async () => {
    const s = setup();
    expect((await s.raw('GET', '/auth/logout')).status).toBe(404);
    expect((await s.req('POST', '/api/auth/register', { email: 'a@b.co', password: 'password123', displayName: 'x' })).status).toBe(404);
    expect((await s.req('POST', '/api/auth/login', { email: 'a@b.co', password: 'password123' })).status).toBe(404);
  });

  it('sin SESSION_SECRET: 503 en login y la API privada responde 401', async () => {
    const s = setup('beta_open', { secret: undefined });
    expect((await s.raw('GET', '/auth/login')).status).toBe(503);
    expect((await s.req('GET', '/api/me')).status).toBe(401);
  });

  it('el origen de /auth/* debe ser PUBLIC_ORIGIN', async () => {
    const s = setup();
    const res = await s.app.request('https://otro.example/auth/login');
    expect(res.status).toBe(403);
  });
});

describe('cabeceras, CORS y límites', () => {
  it('cabeceras de seguridad; cuerpos enormes 413; content-type incorrecto 415; Origin ajeno 403', async () => {
    const s = setup();
    await s.login();
    const r = await s.raw('GET', '/api/demo');
    expect(r.headers.get('x-content-type-options')).toBe('nosniff');
    expect(r.headers.get('x-frame-options')).toBe('DENY');
    expect(r.headers.get('content-security-policy')).toContain("default-src 'none'");
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(r.headers.get('access-control-allow-origin')).toBeNull();
    const big = await s.req('PUT', '/api/profile/daily-goal', { xp: 'x'.repeat(40_000) });
    expect(big.status).toBe(413);
    const txt = await s.app.request(`${ORIGIN}/api/profile/daily-goal`, { method: 'PUT', headers: { 'content-type': 'text/plain', cookie: `__Host-chedex_session=${s.jar.get('__Host-chedex_session')}` }, body: '{}' });
    expect(txt.status).toBe(415);
    const evil = await s.req('PUT', '/api/profile/daily-goal', { xp: 30 }, { origin: 'https://evil.example', cookie: `__Host-chedex_session=${s.jar.get('__Host-chedex_session')}` });
    expect(evil.status).toBe(403);
    const same = await s.req('PUT', '/api/profile/daily-goal', { xp: 30 }, { origin: ORIGIN });
    expect(same.status).toBe(200);
  });
});

describe('modo beta_open (por defecto)', () => {
  it('/api/config y /api/me informan beta; todas las lecciones accesibles sin suscripción', async () => {
    const s = setup('beta_open');
    expect((await s.req('GET', '/api/config')).json).toEqual({ billingMode: 'beta_open' });
    await s.login();
    const me = (await s.req('GET', '/api/me')).json;
    expect(me.billingMode).toBe('beta_open');
    expect(me.subscription).toMatchObject({ status: 'none', beta: true, provider: 'none' });
    expect((await s.req('GET', '/api/billing')).json.subscription).toMatchObject({ status: 'none', beta: true });
    expect((await s.req('GET', '/api/lessons/a.2')).status).toBe(403); // bloqueada solo por orden pedagógico
    await s.req('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] });
    expect((await s.req('GET', '/api/lessons/a.2')).status).toBe(200); // sin 402
    expect((await s.req('GET', '/api/lessons/nope')).status).toBe(404);
  });

  it('subscribe y cancel responden 501 «próximamente» y no escriben nada', async () => {
    const s = setup('beta_open');
    await s.login();
    const sub = await s.req('POST', '/api/billing/subscribe');
    expect(sub.status).toBe(501);
    expect(sub.json.error).toMatch(/próximamente/);
    expect((await s.req('POST', '/api/billing/cancel')).status).toBe(501);
    expect(s.db.raw.prepare('SELECT COUNT(*) AS n FROM cp_subscriptions').get()).toEqual({ n: 0 });
  });

  it('cualquier BILLING_MODE desconocido es beta_open', async () => {
    const { parseBillingMode } = await import('../../worker/billing.js');
    expect(parseBillingMode(undefined)).toBe('beta_open');
    expect(parseBillingMode('stripe')).toBe('beta_open');
    expect(parseBillingMode('dev')).toBe('dev');
  });
});

describe('modo dev (pago simulado)', () => {
  it('402 sin suscripción -> subscribe -> 200; demo siempre accesible', async () => {
    const s = setup('dev');
    await s.login();
    expect((await s.req('GET', '/api/config')).json).toEqual({ billingMode: 'dev' });
    expect((await s.req('GET', '/api/lessons/a.1')).status).toBe(200); // demo
    expect((await s.req('GET', '/api/demo', undefined, { cookie: '' })).json.lesson.id).toBe('a.1');
    expect((await s.req('GET', '/api/lessons/a.2')).status).toBe(402);
    const sub = await s.req('POST', '/api/billing/subscribe');
    expect(sub.json.subscription).toMatchObject({ status: 'active', provider: 'dev', priceEurPerMonth: 10, beta: false });
    expect((await s.req('GET', '/api/lessons/a.2')).status).toBe(403);
    expect((await s.req('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] })).status).toBe(200);
    expect((await s.req('GET', '/api/lessons/a.2')).status).toBe(200);
  });

  it('cancelar mantiene acceso hasta fin de periodo y luego lo pierde; 409 sin suscripción', async () => {
    const s = setup('dev');
    await s.login();
    expect((await s.req('POST', '/api/billing/cancel')).status).toBe(409);
    await s.req('POST', '/api/billing/subscribe');
    await s.req('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] });
    const c = await s.req('POST', '/api/billing/cancel');
    expect(c.json.subscription.status).toBe('canceled');
    expect(c.json.subscription.currentPeriodEnd).toBeTruthy();
    expect((await s.req('GET', '/api/lessons/a.2')).status).toBe(200);
    advance(29 * DAY);
    await s.login(); // la sesión sellada dura 7 días
    expect((await s.req('GET', '/api/lessons/a.2')).status).toBe(200);
    advance(2 * DAY);
    await s.login();
    expect((await s.req('GET', '/api/billing')).json.subscription.status).toBe('none');
    expect((await s.req('GET', '/api/lessons/a.2')).status).toBe(402);
  });
});

describe('mapa y bloqueos', () => {
  it('estados por orden de lecciones y requires de unidad', async () => {
    const s = setup();
    await s.login();
    const status = async () => {
      const m = (await s.req('GET', '/api/map')).json.units as any[];
      return Object.fromEntries(m.flatMap((u) => [[u.id, u.status], ...u.lessons.map((l: any) => [l.id, l.status])]));
    };
    expect(await status()).toEqual({ a: 'available', 'a.1': 'available', 'a.2': 'locked', 'a.3': 'locked', b: 'locked', 'b.1': 'locked' });
    expect((await s.req('GET', '/api/lessons/b.1')).status).toBe(403);
    await s.req('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] });
    expect(await status()).toMatchObject({ 'a.1': 'completed', 'a.2': 'available', 'a.3': 'locked', b: 'locked' });
    advance(DAY);
    await s.req('POST', '/api/lessons/a.2/complete', { correct: 4, total: 5, mistakes: [] });
    advance(DAY);
    await s.req('POST', '/api/lessons/a.3/complete', { correct: 5, total: 5, mistakes: [] });
    expect(await status()).toMatchObject({ a: 'completed', 'b.1': 'available', b: 'available' });
    expect((await s.req('GET', '/api/map')).json.units[0].lessons[1].bestScore).toBeCloseTo(0.8);
  });

  it('la API privada exige sesión', async () => {
    const s = setup();
    for (const p of ['/api/map', '/api/profile', '/api/billing', '/api/lessons/a.1'])
      expect((await s.req('GET', p)).status).toBe(401);
  });
});

describe('completar lección', () => {
  let s: ReturnType<typeof setup>;
  beforeEach(async () => { s = setup(); await s.login(); });

  it('calcula XP, no duplica XP al repetir y valida entrada', async () => {
    expect((await s.req('POST', '/api/lessons/a.1/complete', { correct: 6, total: 5, mistakes: [] })).status).toBe(400);
    expect((await s.req('POST', '/api/lessons/a.1/complete', { correct: 1.5, total: 5, mistakes: [] })).status).toBe(400);
    expect((await s.req('POST', '/api/lessons/a.1/complete', { correct: 1, total: 5, mistakes: 'x' })).status).toBe(400);

    const r1 = await s.req('POST', '/api/lessons/a.1/complete', { correct: 4, total: 5, mistakes: ['fork', 'fork'] });
    expect(r1.json.xpGained).toBe(30);
    expect(r1.json.progress).toMatchObject({ completed: true, attempts: 1 });
    expect(r1.json.profile).toMatchObject({ xp: 30, xpToday: 30, lessonsCompleted: 1, streakDays: 1, weakConcepts: { fork: 2 } });

    const dup = await s.req('POST', '/api/lessons/a.1/complete', { correct: 4, total: 5, mistakes: ['fork', 'fork'] });
    expect(dup.json.profile.xp).toBe(30);
    expect(dup.json.progress.attempts).toBe(1);
    expect(dup.json.profile.weakConcepts.fork).toBe(2);

    advance(60_000);
    const r2 = await s.req('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] });
    expect(r2.json.xpGained).toBe(2);
    expect(r2.json.progress).toMatchObject({ completed: true, attempts: 2, bestScore: 1 });
    expect(r2.json.profile.xp).toBe(32);
  });

  it('perfecto en primera vez da bonus; suspenso no da XP ni completa', async () => {
    const fail = await s.req('POST', '/api/lessons/a.1/complete', { correct: 2, total: 5, mistakes: ['pin'] });
    expect(fail.json.xpGained).toBe(0);
    expect(fail.json.progress.completed).toBe(false);
    expect(fail.json.profile).toMatchObject({ xp: 0, streakDays: 0, weakConcepts: { pin: 1 } });
    advance(60_000);
    expect((await s.req('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] })).json.xpGained).toBe(10 + 25 + 5);
  });

  it('racha por días naturales UTC: consecutivos suben, hueco reinicia, longest se conserva', async () => {
    const done = (id: string) => s.req('POST', `/api/lessons/${id}/complete`, { correct: 5, total: 5, mistakes: [] });
    await done('a.1');
    advance(DAY);
    expect((await done('a.2')).json.profile).toMatchObject({ streakDays: 2, xpToday: 40 });
    advance(DAY);
    expect((await done('a.3')).json.profile).toMatchObject({ streakDays: 3, longestStreak: 3 });
    advance(3 * DAY);
    expect((await s.req('GET', '/api/profile')).json.profile).toMatchObject({ streakDays: 0, xpToday: 0, longestStreak: 3 });
    expect((await done('b.1')).json.profile).toMatchObject({ streakDays: 1, longestStreak: 3 });
  });

  it('mismo día no suma racha dos veces', async () => {
    await s.req('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] });
    advance(60_000);
    const r = await s.req('POST', '/api/lessons/a.2/complete', { correct: 5, total: 5, mistakes: [] });
    expect(r.json.profile.streakDays).toBe(1);
  });

  it('objetivo diario configurable y validado', async () => {
    expect((await s.req('PUT', '/api/profile/daily-goal', { xp: 50 })).json.profile.dailyGoalXp).toBe(50);
    expect((await s.req('PUT', '/api/profile/daily-goal', { xp: 0 })).status).toBe(400);
    expect((await s.req('PUT', '/api/profile/daily-goal', { xp: 'mucho' })).status).toBe(400);
  });

  it('el progreso de un usuario no afecta a otro', async () => {
    await s.req('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] });
    s.jar.clear();
    lichess.account = { id: 'Beto', username: 'Beto' };
    await s.login();
    expect((await s.req('GET', '/api/me')).json.user.id).toBe('beto');
    expect((await s.req('GET', '/api/profile')).json.profile.xp).toBe(0);
    expect((await s.req('GET', '/api/lessons/a.2')).status).toBe(403);
  });
});

const pu = (id: string, order: number, level: Unit['level'], requires: string[]): Unit => ({
  id, order, title: id, description: 'd', level, requires,
  lessons: [lesson(`${id}.1`, id), lesson(`${id}.2`, id)],
});
const placementUnits: Unit[] = [
  pu('p1', 1, 'beginner', []), pu('p2', 2, 'beginner', ['p1']), pu('p3', 3, 'initiation', ['p2']),
  pu('p4', 4, 'initiation', ['p3']), pu('p5', 5, 'initiation', ['p4']),
];
const perf = (rating: number, games = 50, extra: Record<string, unknown> = {}) => ({ rating, games, rd: 80, prog: 0, ...extra });

describe('colocación por Elo de Lichess', () => {
  const loginWith = async (perfs: unknown) => {
    const s = setup('beta_open', { units: placementUnits });
    lichess.account = { id: 'Ana', username: 'Ana', perfs };
    await s.login();
    return s;
  };
  const unitMap = async (s: Awaited<ReturnType<typeof loginWith>>) =>
    Object.fromEntries(((await s.req('GET', '/api/map')).json.units as any[]).map((u) => [u.id, u]));

  it('el callback guarda solo rápidas/clásicas validadas y el token sigue sin guardarse y revocándose', async () => {
    const s = await loginWith({ rapid: perf(1180, 40), classical: perf(1350, 25), blitz: perf(2900, 900), bullet: perf(3000, 900) });
    expect(s.db.raw.prepare('SELECT * FROM cp_placement').all().map((r) => ({ ...r }))).toEqual([
      { user_id: 'ana', source: 'lichess', perf: 'classical', rating: 1350, games: 25, mode: null, fetched_at: new Date(clock).toISOString() },
    ]);
    expect(lichess.calls.map((c) => c.method)).toEqual(['POST', 'GET', 'DELETE']);
    const dump = JSON.stringify([s.db.raw.prepare('SELECT * FROM cp_users').all(), s.db.raw.prepare('SELECT * FROM cp_placement').all()]);
    expect(dump).not.toContain(TOKEN);
    const p = (await s.req('GET', '/api/placement')).json;
    expect(p).toMatchObject({ source: 'lichess', perf: 'classical', rating: 1350, games: 25, mode: 'lichess', chosen: false, recommendedUnitId: 'p3', openUnitIds: ['p1', 'p2'] });
  });

  it('se refresca en cada login sin perder la elección del usuario', async () => {
    const s = await loginWith({ rapid: perf(1100) });
    await s.req('POST', '/api/placement', { mode: 'scratch' });
    lichess.account = { id: 'Ana', username: 'Ana', perfs: { rapid: perf(1500) } };
    await s.login();
    expect(s.db.raw.prepare('SELECT rating, mode FROM cp_placement').all().map((r) => ({ ...r }))).toEqual([{ rating: 1500, mode: 'scratch' }]);
  });

  it('sin Elo fiable (provisional, pocas partidas, sin perfs): source none y mapa normal', async () => {
    for (const perfs of [
      { rapid: perf(1600, 80, { prov: true }), classical: perf(1700, 5) },
      { rapid: perf(1600, 9) },
      { blitz: perf(2000, 500) },
      undefined,
      'basura',
    ]) {
      const s = await loginWith(perfs);
      const p = (await s.req('GET', '/api/placement')).json;
      expect(p).toMatchObject({ source: 'none', perf: null, rating: null, mode: 'scratch', recommendedUnitId: null, openUnitIds: [] });
      const m = await unitMap(s);
      expect(m.p1.placedOpen).toBeUndefined();
      expect(m.p2.status).toBe('locked');
      expect((await s.req('POST', '/api/placement', { mode: 'lichess' })).status).toBe(400);
    }
  });

  it('perfs manipulados o fuera de rango se ignoran (y no rompen el login)', async () => {
    const bad = [
      perf(4001), perf(-1), perf(1500.5), { rating: '1500', games: 50 }, { rating: 1500 }, { rating: 1500, games: -3 },
      perf(1500, 50, { prov: 'no' }), perf(1500, 50, { rd: 99999 }), [1500, 50], null, 1500,
    ];
    for (const b of bad) {
      const s = await loginWith({ rapid: b, classical: b });
      expect((await s.req('GET', '/api/me')).status).toBe(200);
      expect((await s.req('GET', '/api/placement')).json).toMatchObject({ source: 'none', rating: null });
    }
    // un perf válido sobrevive a otro manipulado
    const s = await loginWith({ rapid: perf(9999), classical: perf(1450) });
    expect((await s.req('GET', '/api/placement')).json).toMatchObject({ perf: 'classical', rating: 1450 });
  });

  it('mapa: 1000-1399 abre beginner como repaso (available, sin XP) y recomienda la primera initiation', async () => {
    const s = await loginWith({ rapid: perf(1200) });
    const m = await unitMap(s);
    for (const id of ['p1', 'p2']) {
      expect(m[id]).toMatchObject({ placedOpen: true, status: 'available' });
      expect(m[id].lessons.map((l: any) => l.status)).toEqual(['available', 'available']);
      expect(m[id].recommended).toBeUndefined();
    }
    expect(m.p3).toMatchObject({ recommended: true, status: 'available' });
    expect(m.p3.placedOpen).toBeUndefined();
    expect(m.p3.lessons.map((l: any) => l.status)).toEqual(['available', 'locked']); // orden normal
    expect(m.p4.status).toBe('locked');
    expect((await s.req('GET', '/api/profile')).json.profile).toMatchObject({ xp: 0, lessonsCompleted: 0 });
    expect((await s.req('GET', '/api/lessons/p2.2')).status).toBe(200); // lección de repaso accesible
    expect((await s.req('GET', '/api/lessons/p4.1')).status).toBe(403);
  });

  it('mapa: >=1400 abre todo como repaso y recomienda la segunda initiation; <1000 empieza en la primera', async () => {
    const hi = await unitMap(await loginWith({ classical: perf(1800) }));
    for (const id of ['p1', 'p2', 'p3', 'p4', 'p5']) {
      expect(hi[id].placedOpen).toBe(true);
      expect(hi[id].lessons.every((l: any) => l.status === 'available')).toBe(true);
    }
    expect(Object.values(hi).filter((u: any) => u.recommended).map((u: any) => u.id)).toEqual(['p4']);
    const lo = await unitMap(await loginWith({ rapid: perf(600) }));
    expect(Object.values(lo).some((u: any) => u.placedOpen)).toBe(false);
    expect(lo.p1.recommended).toBe(true);
    expect(lo.p2.status).toBe('locked');
  });

  it("POST /api/placement 'scratch' desactiva los efectos y 'lichess' los reactiva", async () => {
    const s = await loginWith({ rapid: perf(1500) });
    expect((await unitMap(s)).p5.placedOpen).toBe(true);
    const r = await s.req('POST', '/api/placement', { mode: 'scratch' });
    expect(r.status).toBe(200);
    expect(r.json).toMatchObject({ mode: 'scratch', chosen: true, rating: 1500 });
    const m = await unitMap(s);
    expect(Object.values(m).some((u: any) => u.placedOpen || u.recommended)).toBe(false);
    expect(m.p2.status).toBe('locked');
    expect((await s.req('GET', '/api/lessons/p5.1')).status).toBe(403);
    expect((await s.req('POST', '/api/placement', { mode: 'lichess' })).json).toMatchObject({ mode: 'lichess', chosen: true });
    expect((await unitMap(s)).p5.placedOpen).toBe(true);
  });

  it('POST /api/placement valida la entrada y exige sesión y origen propio', async () => {
    const s = await loginWith({ rapid: perf(1500) });
    for (const body of [{}, { mode: 'otro' }, { mode: 1 }, { mode: null }, { mode: ['lichess'] }])
      expect((await s.req('POST', '/api/placement', body)).status).toBe(400);
    expect((await s.raw('POST', '/api/placement', undefined)).status).toBe(415);
    expect((await s.req('POST', '/api/placement', { mode: 'scratch' }, { origin: 'https://evil.example' })).status).toBe(403);
    const anon = setup('beta_open', { units: placementUnits });
    expect((await anon.req('GET', '/api/placement')).status).toBe(401);
    expect((await anon.req('POST', '/api/placement', { mode: 'scratch' })).status).toBe(401);
  });
});

describe('migraciones D1', () => {
  const dir = new URL('../../migrations/', import.meta.url);
  const sqlFiles = readdirSync(dir).filter((f) => f.endsWith('.sql'));

  it('solo crean tablas cp_ con IF NOT EXISTS: sin DROP, ALTER, DELETE ni UPDATE', () => {
    expect(sqlFiles.length).toBeGreaterThan(0);
    for (const f of sqlFiles) {
      const sql = readFileSync(new URL(f, dir), 'utf8').replace(/--.*$/gm, '').replace(/ON DELETE CASCADE/gi, '');
      expect(sql).not.toMatch(/\b(DROP|ALTER|DELETE|UPDATE|INSERT|REPLACE|TRUNCATE)\b/i);
      const creates = [...sql.matchAll(/CREATE\s+(?:UNIQUE\s+)?(TABLE|INDEX)\s+(IF NOT EXISTS\s+)?(\w+)/gi)];
      expect(creates.length).toBeGreaterThan(0);
      for (const c of creates) {
        expect(c[2], `${c[3]} sin IF NOT EXISTS`).toBeTruthy();
        expect(c[3]).toMatch(/^cp_|^idx_cp_/);
      }
    }
  });

  it('son idempotentes y la base de tests solo contiene tablas cp_', () => {
    const { raw } = openTestDb();
    for (const f of sqlFiles) raw.exec(readFileSync(new URL(f, dir), 'utf8')); // segunda aplicación
    const names = (raw.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]).map((r) => r.name);
    expect(names.sort()).toEqual(['cp_lesson_progress', 'cp_placement', 'cp_profiles', 'cp_subscriptions', 'cp_users', 'cp_weak_concepts']);
  });
});
