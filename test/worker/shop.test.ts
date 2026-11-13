import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createApp } from '../../worker/app.js';
import { devBilling } from '../../worker/billing.js';
import { base64url } from '../../worker/auth.js';
import { CATALOG, PROTECTOR_MAX, STREAK_DAYS_PER_CHEDEX, getItem } from '../../src/shop/catalog.js';
import type { Lesson, Unit } from '../../src/content/schema.js';
import { openTestDb } from './sqlite-db.js';

const ORIGIN = 'https://chedexpulse.app';
const SECRET = base64url(new Uint8Array(32).map((_, i) => i * 7 + 3));
const DAY = 86_400_000;

const lesson = (id: string, unitId: string, extra: Partial<Lesson> = {}): Lesson => ({
  id, unitId, title: id, objective: id, intro: 'i', explanation: [], practice: [], evaluation: [], ...extra,
});
const units: Unit[] = [
  { id: 'a', order: 1, title: 'A', description: 'd', level: 'beginner', requires: [], lessons: [lesson('a.1', 'a', { demo: true })] },
];

let clock = Date.UTC(2026, 0, 1, 12, 0, 0);
let account = 'ana';

function setup() {
  clock = Date.UTC(2026, 0, 1, 12, 0, 0);
  const db = openTestDb();
  const app = createApp({
    db, content: { units }, billingMode: 'beta_open', billing: devBilling(),
    sessionSecret: SECRET, publicOrigin: ORIGIN, now: () => new Date(clock),
  });
  /** Un cliente con su propia cookie, sobre la misma app y base. */
  const client = async (name: string) => {
    const jar = new Map<string, string>();
    const ck = () => [...jar].filter(([, v]) => v !== '').map(([k, v]) => `${k}=${v}`).join('; ');
    const raw = async (method: string, path: string, body?: unknown, extra: Record<string, string> = {}, rawBody?: string) => {
      const headers: Record<string, string> = { ...extra };
      if (body !== undefined || rawBody !== undefined) headers['content-type'] = 'application/json';
      if (ck() && !('cookie' in headers)) headers.cookie = ck();
      const res = await app.request(ORIGIN + path, { method, headers, body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)) });
      if (!('cookie' in extra)) for (const sc of res.headers.getSetCookie()) {
        const [pair] = sc.split(';');
        const i = pair!.indexOf('=');
        jar.set(pair!.slice(0, i), pair!.slice(i + 1));
      }
      return res;
    };
    const login = async () => {
      account = name;
      const start = await raw('GET', '/auth/login');
      const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
      await raw('GET', `/auth/callback?code=abc123&state=${state}`);
    };
    const req = async (method: string, path: string, body?: unknown, extra: Record<string, string> = {}): Promise<{ status: number; json: any }> => {
      let res = await raw(method, path, body, extra);
      // La sesión dura 7 días: en pruebas de muchos días se vuelve a entrar (salvo que el test controle la cookie).
      if (res.status === 401 && !('cookie' in extra) && jar.size > 0) { await login(); res = await raw(method, path, body, extra); }
      let json: any = null;
      try { json = JSON.parse(await res.text()); } catch { /* sin JSON */ }
      return { status: res.status, json };
    };
    await login();
    const done = () => req('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] });
    const shop = async () => (await req('GET', '/api/shop')).json;
    const buy = (itemId: unknown, extra: Record<string, unknown> = {}) => req('POST', '/api/shop/buy', { itemId, ...extra });
    const equip = (kind: unknown, itemId: unknown) => req('POST', '/api/shop/equip', { kind, itemId });
    return { req, raw, done, shop, buy, equip, name };
  };
  /** Ingreso directo al libro (para probar compras sin jugar 5 días). */
  const grant = (userId: string, n: number, ref = `seed${Math.random()}`) =>
    db.raw.prepare("INSERT INTO cp_wallet_ledger (user_id, delta, reason, ref, created_at) VALUES (?,?,'streak_milestone',?,'x')").run(userId, n, ref);
  return { db, client, grant };
}

beforeEach(() => {
  vi.stubGlobal('fetch', async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input);
    const method = init.method ?? 'GET';
    if (url === 'https://lichess.org/api/token' && method === 'POST')
      return new Response(JSON.stringify({ access_token: 'lip_x', token_type: 'Bearer' }), { status: 200 });
    if (url === 'https://lichess.org/api/account') return new Response(JSON.stringify({ id: account, username: account }), { status: 200 });
    if (url === 'https://lichess.org/api/token' && method === 'DELETE') return new Response(null, { status: 204 });
    throw new Error(`fetch inesperado: ${method} ${url}`);
  });
});
afterEach(() => vi.unstubAllGlobals());

const GEO = getItem('geo')!.price;
const PROT = getItem('protector')!.price;

describe('Chedex por racha', () => {
  it('constante de diseño: 5 días por Chedex', () => expect(STREAK_DAYS_PER_CHEDEX).toBe(5));

  it('+1 en los días 5 y 10 (día a día), nada entre medias; /api/shop lo refleja', async () => {
    const s = setup();
    const u = await s.client('ana');
    const earned: number[] = [];
    for (let d = 1; d <= 10; d++) {
      const r = await u.done();
      expect(r.json.profile.streakDays).toBe(d);
      earned.push(r.json.chedexEarned);
      if (d === 4) expect(await u.shop()).toMatchObject({ balance: 0, streak: { days: 4, daysToNextChedex: 1, daysPerChedex: 5 } });
      advance(DAY);
    }
    expect(earned).toEqual([0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const sh = await u.shop();
    expect(sh).toMatchObject({ balance: 2, earnedTotal: 2, streak: { days: 10, daysToNextChedex: 5 } });
  });

  it('daysToNextChedex: racha 0 -> 5; 1 -> 4; 5 -> 5', async () => {
    const s = setup();
    const u = await s.client('ana');
    expect((await u.shop()).streak).toMatchObject({ days: 0, daysToNextChedex: 5 });
    await u.done();
    expect((await u.shop()).streak).toMatchObject({ days: 1, daysToNextChedex: 4 });
  });

  it('doble envío (mismo día, mismo resultado, dentro y fuera de 10 s) no ingresa dos veces', async () => {
    const s = setup();
    const u = await s.client('ana');
    for (let d = 1; d <= 4; d++) { await u.done(); advance(DAY); }
    const a = await u.done(); // día 5
    expect(a.json.chedexEarned).toBe(1);
    const b = await u.done(); // reenvío inmediato
    expect(b.json.chedexEarned).toBe(0);
    advance(60_000);
    const c = await u.done(); // mismo día, más tarde
    expect(c.json.chedexEarned).toBe(0);
    expect((await u.shop()).balance).toBe(1);
    const rows = s.db.raw.prepare("SELECT COUNT(*) AS n FROM cp_wallet_ledger WHERE reason='streak_milestone'").get() as { n: number };
    expect(rows.n).toBe(1);
  });

  it('la clave única del libro impide el segundo ingreso del mismo hito (carrera) y revierte el lote', async () => {
    const s = setup();
    const u = await s.client('ana');
    for (let d = 1; d <= 4; d++) { await u.done(); advance(DAY); }
    // Simula que otra petición concurrente ya ingresó el hito del día 5.
    const today = new Date(clock).toISOString().slice(0, 10);
    s.grant('ana', 1, `${today}:5`);
    const r = await u.done();
    expect(r.status).toBe(200);
    expect(r.json.chedexEarned).toBe(0);
    expect((await u.shop()).balance).toBe(1);
  });

  it('racha rota y vuelta a 5: se gana otra vez; lo ganado no se pierde', async () => {
    const s = setup();
    const u = await s.client('ana');
    for (let d = 1; d <= 5; d++) { await u.done(); advance(DAY); }
    expect((await u.shop()).balance).toBe(1);
    advance(3 * DAY); // se rompe
    expect((await u.shop()).streak.days).toBe(0);
    expect((await u.shop()).balance).toBe(1);
    const got: number[] = [];
    for (let d = 1; d <= 5; d++) { got.push((await u.done()).json.chedexEarned); advance(DAY); }
    expect(got).toEqual([0, 0, 0, 0, 1]);
    expect(await u.shop()).toMatchObject({ balance: 2, earnedTotal: 2 });
  });

  it('una lección suspensa no cuenta para la racha ni para Chedex', async () => {
    const s = setup();
    const u = await s.client('ana');
    const r = await u.req('POST', '/api/lessons/a.1/complete', { correct: 0, total: 5, mistakes: [] });
    expect(r.json).toMatchObject({ chedexEarned: 0, protectorUsed: false });
    expect((await u.shop()).streak.days).toBe(0);
  });
});

const advance = (ms: number) => (clock += ms);

describe('protector de racha', () => {
  async function withProtector(s: ReturnType<typeof setup>, days = 3) {
    const u = await s.client('ana');
    for (let d = 1; d <= days; d++) { await u.done(); advance(DAY); }
    // advance dejó el reloj en el día siguiente al último estudiado
    s.grant('ana', PROT);
    expect((await u.buy('protector')).status).toBe(200);
    return u;
  }

  it('hueco de exactamente 1 día: se consume uno y la racha continúa (hoy suma como normal)', async () => {
    const s = setup();
    const u = await withProtector(s); // último estudio: día 3; ahora es día 4
    advance(DAY); // día 5: ayer (día 4) sin estudiar
    // La lectura cubre el hueco sin consumir
    expect((await u.req('GET', '/api/profile')).json.profile.streakDays).toBe(3);
    expect((await u.shop()).protectors.count).toBe(1);
    const r = await u.done();
    expect(r.json).toMatchObject({ protectorUsed: true, chedexEarned: 0 });
    expect(r.json.profile.streakDays).toBe(4);
    expect((await u.shop()).protectors.count).toBe(0);
  });

  it('hueco de 1 día que cruza un hito: el Chedex del día 5 se gana', async () => {
    const s = setup();
    const u = await withProtector(s, 4); // último estudio día 4; ahora día 5 (sin estudiar aún)
    advance(DAY); // día 6 -> hueco de 1 día (el 5)
    const r = await u.done(); // racha 5
    expect(r.json).toMatchObject({ protectorUsed: true, chedexEarned: 1 });
  });

  it('hueco de 2 días: NO se consume y la racha se reinicia', async () => {
    const s = setup();
    const u = await withProtector(s);
    advance(2 * DAY); // último estudio día 3, ahora día 6: 2 días naturales sin estudiar
    expect((await u.req('GET', '/api/profile')).json.profile.streakDays).toBe(0);
    const r = await u.done();
    expect(r.json).toMatchObject({ protectorUsed: false });
    expect(r.json.profile.streakDays).toBe(1);
    expect((await u.shop()).protectors.count).toBe(1);
  });

  it('sin protector, hueco de 1 día reinicia', async () => {
    const s = setup();
    const u = await s.client('ana');
    await u.done();
    advance(2 * DAY);
    expect((await u.done()).json).toMatchObject({ protectorUsed: false, profile: { streakDays: 1 } });
  });

  it('doble envío tras consumir no consume otro protector', async () => {
    const s = setup();
    const u = await withProtector(s);
    s.grant('ana', PROT);
    await u.buy('protector'); // 2 protectores
    advance(DAY);
    expect((await u.done()).json.protectorUsed).toBe(true);
    expect((await u.done()).json.protectorUsed).toBe(false);
    advance(60_000);
    expect((await u.done()).json.protectorUsed).toBe(false);
    expect((await u.shop()).protectors.count).toBe(1);
  });
});

describe('compras', () => {
  it('saldo suficiente: descuenta el precio del servidor, ignora precio del cuerpo, queda poseído', async () => {
    const s = setup();
    const u = await s.client('ana');
    s.grant('ana', 5);
    const r = await u.buy('geo', { price: 0, delta: 100, balance: 999 });
    expect(r.status).toBe(200);
    expect(r.json.balance).toBe(5 - GEO);
    const item = r.json.items.find((i: any) => i.id === 'geo');
    expect(item).toMatchObject({ owned: true, equipped: false, price: GEO });
    const row = s.db.raw.prepare("SELECT delta, ref FROM cp_wallet_ledger WHERE reason='purchase'").get() as { delta: number; ref: string };
    expect(row).toEqual({ delta: -GEO, ref: 'geo' });
  });

  it('saldo insuficiente: 400 y nada cambia', async () => {
    const s = setup();
    const u = await s.client('ana');
    s.grant('ana', GEO - 1);
    const r = await u.buy('geo', { price: 0 });
    expect(r.status).toBe(400);
    expect((await u.shop()).balance).toBe(GEO - 1);
    expect(s.db.raw.prepare('SELECT COUNT(*) AS n FROM cp_inventory').get()).toEqual({ n: 0 });
  });

  it('el saldo nunca queda negativo (compras seguidas hasta agotar)', async () => {
    const s = setup();
    const u = await s.client('ana');
    s.grant('ana', 4);
    expect((await u.buy('pizarra')).status).toBe(200);
    expect((await u.buy('bosque')).status).toBe(200);
    expect((await u.buy('papel')).status).toBe(400);
    expect((await u.buy('protector')).status).toBe(400);
    const min = s.db.raw.prepare('SELECT SUM(delta) AS b FROM cp_wallet_ledger').get() as { b: number };
    expect(min.b).toBe(0);
  });

  it('ya poseído (comprado o gratis): 400, sin segundo cobro', async () => {
    const s = setup();
    const u = await s.client('ana');
    s.grant('ana', 20);
    expect((await u.buy('pizarra')).status).toBe(200);
    expect((await u.buy('pizarra')).status).toBe(400);
    expect((await u.buy('cburnett')).status).toBe(400); // gratis
    expect((await u.shop()).balance).toBe(20 - getItem('pizarra')!.price);
  });

  it('protector: se compra varias veces hasta el máximo; con el máximo lleno, 400 sin cobrar', async () => {
    const s = setup();
    const u = await s.client('ana');
    s.grant('ana', 20);
    for (let i = 1; i <= PROTECTOR_MAX; i++) {
      const r = await u.buy('protector');
      expect(r.status).toBe(200);
      expect(r.json.protectors).toEqual({ count: i, max: PROTECTOR_MAX });
    }
    const before = (await u.shop()).balance;
    expect((await u.buy('protector')).status).toBe(400);
    expect((await u.shop()).balance).toBe(before);
  });

  it('id desconocido: 404; entradas inválidas: 400; sin sesión: 401; origen ajeno: 403; sin JSON: 415', async () => {
    const s = setup();
    const u = await s.client('ana');
    expect((await u.buy('no-existe')).status).toBe(404);
    for (const bad of [undefined, 5, null, {}, ['geo'], '', 'GEO', '../x', 'a'.repeat(100)])
      expect((await u.buy(bad)).status).toBe(400);
    expect((await u.raw('POST', '/api/shop/buy', undefined)).status).toBe(415);
    expect((await u.raw('POST', '/api/shop/buy', undefined, {}, '[]')).status).toBe(400);
    expect((await u.raw('POST', '/api/shop/buy', undefined, {}, 'no json')).status).toBe(400);
    expect((await u.raw('POST', '/api/shop/buy', undefined, {}, JSON.stringify({ itemId: 'geo', pad: 'x'.repeat(20_000) }))).status).toBe(413);
    expect((await u.req('POST', '/api/shop/buy', { itemId: 'geo' }, { origin: 'https://evil.example' })).status).toBe(403);
    const anon = await setup().client('x');
    const noCookie = (m: string, p: string, b?: unknown) => anon.req(m, p, b, { cookie: '' });
    expect((await noCookie('GET', '/api/shop')).status).toBe(401);
    expect((await noCookie('POST', '/api/shop/buy', { itemId: 'geo' })).status).toBe(401);
    expect((await noCookie('POST', '/api/shop/equip', { kind: 'board', itemId: 'clasico' })).status).toBe(401);
  });

  it('el catálogo del servidor lo expone tal cual (precios, free)', async () => {
    const s = setup();
    const u = await s.client('ana');
    const sh = await u.shop();
    expect(sh.items.map((i: any) => [i.id, i.price, i.free])).toEqual(CATALOG.map((i) => [i.id, i.price, i.price === 0]));
    expect(sh.items.filter((i: any) => i.owned).map((i: any) => i.id).sort()).toEqual(['cburnett', 'clasico']);
  });
});

describe('equipar y /api/me', () => {
  it('usuario nuevo: equipado por defecto, saldo 0, 0 protectores (sin filas)', async () => {
    const s = setup();
    const u = await s.client('ana');
    expect(await u.shop()).toMatchObject({ balance: 0, earnedTotal: 0, protectors: { count: 0, max: PROTECTOR_MAX }, equipped: { pieces: 'cburnett', board: 'clasico' } });
    expect((await u.req('GET', '/api/me')).json.equipped).toEqual({ pieces: 'cburnett', board: 'clasico' });
  });

  it('equipar lo poseído funciona y /api/me lo refleja; lo no poseído da 400', async () => {
    const s = setup();
    const u = await s.client('ana');
    expect((await u.equip('board', 'pizarra')).status).toBe(400);
    s.grant('ana', 10);
    await u.buy('pizarra');
    const r = await u.equip('board', 'pizarra');
    expect(r.status).toBe(200);
    expect(r.json.equipped).toEqual({ pieces: 'cburnett', board: 'pizarra' });
    expect(r.json.items.find((i: any) => i.id === 'pizarra').equipped).toBe(true);
    expect(r.json.items.find((i: any) => i.id === 'clasico').equipped).toBe(false);
    expect((await u.req('GET', '/api/me')).json.equipped).toEqual({ pieces: 'cburnett', board: 'pizarra' });
    await u.buy('geo');
    expect((await u.equip('pieces', 'geo')).json.equipped).toEqual({ pieces: 'geo', board: 'pizarra' });
    // vuelve a un objeto gratis
    expect((await u.equip('board', 'clasico')).json.equipped).toEqual({ pieces: 'geo', board: 'clasico' });
  });

  it('kind inválido, kind que no corresponde, protector y id desconocido', async () => {
    const s = setup();
    const u = await s.client('ana');
    for (const kind of ['protector', 'x', '', 1, null, undefined]) expect((await u.equip(kind, 'clasico')).status).toBe(400);
    expect((await u.equip('pieces', 'clasico')).status).toBe(400); // es un tablero
    expect((await u.equip('board', 'protector')).status).toBe(400);
    expect((await u.equip('board', 'nada')).status).toBe(404);
    expect((await u.equip('board', 7)).status).toBe(400);
    expect((await u.req('POST', '/api/shop/equip', { kind: 'board', itemId: 'clasico' }, { origin: 'https://evil.example' })).status).toBe(403);
  });
});

describe('aislamiento entre usuarios', () => {
  it('saldo, inventario, equipado y protectores son por usuario', async () => {
    const s = setup();
    const ana = await s.client('ana');
    const luis = await s.client('luis');
    s.grant('ana', 10);
    await ana.buy('pizarra');
    await ana.buy('protector');
    await ana.equip('board', 'pizarra');
    const l = await luis.shop();
    expect(l).toMatchObject({ balance: 0, protectors: { count: 0 }, equipped: { board: 'clasico' } });
    expect(l.items.find((i: any) => i.id === 'pizarra').owned).toBe(false);
    expect((await luis.equip('board', 'pizarra')).status).toBe(400);
    expect((await luis.buy('geo')).status).toBe(400);
    expect((await luis.req('GET', '/api/me')).json.equipped.board).toBe('clasico');
    expect((await ana.shop()).balance).toBe(10 - getItem('pizarra')!.price - PROT);
  });

  it('la racha y el hito de uno no afectan al otro', async () => {
    const s = setup();
    const ana = await s.client('ana');
    const luis = await s.client('luis');
    for (let d = 1; d <= 5; d++) { await ana.done(); advance(DAY); }
    expect((await ana.shop()).balance).toBe(1);
    expect((await luis.shop())).toMatchObject({ balance: 0, streak: { days: 0 } });
  });
});
