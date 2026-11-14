/**
 * Carreras contra D1 REAL en local (workerd/miniflare vía getPlatformProxy de wrangler), no contra node:sqlite:
 * cada consulta es una llamada asíncrona a la base, así que 20 peticiones en paralelo sí se intercalan entre
 * la lectura y la escritura. Base temporal y aislada (nunca la de .wrangler ni la remota).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import { createApp } from '../../worker/app.js';
import { devBilling } from '../../worker/billing.js';
import { base64url, seal } from '../../worker/auth.js';
import { d1Db, type D1Like } from '../../worker/db.js';
import { EXERCISES } from '../../src/pedagogy/exercises.js';
import type { Lesson, Unit } from '../../src/content/schema.js';

const ORIGIN = 'https://chedexpulse.app';
const SECRET = base64url(new Uint8Array(32).map((_, i) => i * 7 + 3));
const DAY = 86_400_000;
const N = 20;
const clock = Date.UTC(2026, 0, 10, 12, 0, 0);
const today = new Date(clock).toISOString().slice(0, 10);
const yesterday = new Date(clock - DAY).toISOString().slice(0, 10);
const lesson: Lesson = { id: 'a.1', unitId: 'a', title: 'T', objective: 'O', intro: 'i', explanation: [], practice: [], evaluation: [] };
const units: Unit[] = [{ id: 'a', order: 1, title: 'A', description: 'd', level: 'beginner', requires: [], lessons: [lesson] }];

let proxy: Awaited<ReturnType<typeof getPlatformProxy<{ PULSE_DB: D1Like & { prepare(sql: string): any } }>>>;
let dir: string;
let d1: D1Like & { prepare(sql: string): any };

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), 'cp-d1-'));
  proxy = await getPlatformProxy({ configPath: 'wrangler.jsonc', persist: { path: dir } });
  d1 = proxy.env.PULSE_DB;
  const mig = new URL('../../migrations/', import.meta.url);
  for (const f of readdirSync(mig).filter((n) => n.endsWith('.sql')).sort())
    for (const sql of readFileSync(new URL(f, mig), 'utf8').replace(/--.*$/gm, '').split(';').map((s) => s.trim()).filter(Boolean))
      await d1.prepare(sql).run();
}, 60_000);

afterAll(async () => {
  await proxy?.dispose();
  rmSync(dir, { recursive: true, force: true });
});

const q = async <T>(sql: string, ...params: unknown[]) => (await d1.prepare(sql).bind(...params).first()) as T;
const exec = (sql: string, ...params: unknown[]) => d1.prepare(sql).bind(...params).run();

async function user(id: string) {
  const app = createApp({
    db: d1Db(d1), content: { units }, billingMode: 'beta_open', billing: devBilling(),
    sessionSecret: SECRET, publicOrigin: ORIGIN, now: () => new Date(clock),
    fetchImpl: (async () => new Response('{}', { status: 429 })) as unknown as typeof fetch,
  });
  await exec('INSERT INTO cp_users (id, username, created_at, last_login_at) VALUES (?,?,?,?)', id, id, 'x', 'x');
  const cookie = `__Host-chedex_session=${await seal({ kind: 'session', id, username: id, exp: clock + 30 * DAY }, SECRET)}`;
  return async (method: string, path: string, body?: unknown) => {
    const res = await app.request(ORIGIN + path, {
      method, headers: { cookie, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, json: JSON.parse(await res.text()) };
  };
}
const due = (userId: string, conceptId: string, box = 2) =>
  Promise.all([
    exec('INSERT INTO cp_review_schedule (user_id, concept_id, box, due_at, last_at) VALUES (?,?,?,?,NULL)', userId, conceptId, box, clock - 1),
    exec('INSERT INTO cp_weak_concepts (user_id, concept_id, count) VALUES (?,?,1)', userId, conceptId),
  ]);
const streak4 = (userId: string) => exec('INSERT INTO cp_profiles (user_id, streak_days, last_active_date) VALUES (?,4,?)', userId, yesterday);
const solutionOf = (fen: string) => EXERCISES.find((e) => e.fen === fen)!.solutionUci;
const all = <T>(f: (i: number) => Promise<T>) => Promise.all(Array.from({ length: N }, (_, i) => f(i)));

describe('carreras en D1 local real (20 peticiones a la vez)', () => {
  it('answer: 20 fallos iguales del mismo intento cuentan un solo fallo', async () => {
    const ana = await user('r_ans1');
    await due('r_ans1', 'tactics.fork');
    const it0 = (await ana('GET', '/api/session')).json.items[0];
    const rs = await all(() => ana('POST', '/api/session/answer', { itemId: it0.itemId, uci: 'a2a3', attempt: 1 }));
    expect(rs.every((r) => r.status === 200)).toBe(true);
    expect(rs.every((r) => JSON.stringify(r.json) === JSON.stringify({ correct: false, done: false, tryAgain: true }))).toBe(true);
    expect(await q('SELECT step, attempts, status FROM cp_session_items WHERE id = ?', it0.itemId)).toEqual({ step: 0, attempts: 1, status: 'open' });
  });

  it('answer sin attempt (cliente antiguo): 20 aciertos a la vez avanzan una sola vez', async () => {
    const ana = await user('r_ans2');
    await due('r_ans2', 'tactics.fork');
    const it0 = (await ana('GET', '/api/session')).json.items[0];
    const uci = solutionOf(it0.fen)[0];
    const rs = await all(() => ana('POST', '/api/session/answer', { itemId: it0.itemId, uci }));
    expect(rs.filter((r) => r.status === 200 && r.json.correct === true).length).toBeGreaterThanOrEqual(1);
    expect(rs.some((r) => r.status === 200 && r.json.correct === false)).toBe(false);
    expect(await q('SELECT attempts, status FROM cp_session_items WHERE id = ?', it0.itemId)).toEqual({ attempts: 0, status: 'done' });
  });

  it('finish: 20 a la vez mueven la caja una vez, la racha una vez y pagan un Chedex', async () => {
    const ana = await user('r_fin');
    await due('r_fin', 'tactics.fork');
    await streak4('r_fin');
    const s = (await ana('GET', '/api/session')).json;
    const it0 = s.items[0];
    expect((await ana('POST', '/api/session/answer', { itemId: it0.itemId, uci: solutionOf(it0.fen)[0], attempt: 1 })).json.correct).toBe(true);
    const rs = await all(() => ana('POST', '/api/session/finish', { sessionId: s.sessionId }));
    expect(rs.map((r) => r.status)).toEqual(Array(N).fill(200));
    expect(await q('SELECT box, due_at FROM cp_review_schedule WHERE user_id = ? AND concept_id = ?', 'r_fin', 'tactics.fork')).toEqual({ box: 3, due_at: clock + 4 * DAY });
    expect(await q("SELECT COUNT(*) AS n FROM cp_wallet_ledger WHERE user_id = ? AND reason = 'streak_milestone'", 'r_fin')).toEqual({ n: 1 });
    expect(await q('SELECT streak_days, last_active_date FROM cp_profiles WHERE user_id = ?', 'r_fin')).toEqual({ streak_days: 5, last_active_date: today });
    expect(await q("SELECT COUNT(*) AS n FROM cp_session_items WHERE user_id = ? AND status IN ('done','open')", 'r_fin')).toEqual({ n: 0 });
  });

  it('review complete: 20 a la vez suman cada concepto una vez y solo una respuesta dice counted', async () => {
    const ana = await user('r_rev');
    const rs = await all(() => ana('POST', '/api/review/complete', { gameId: 'abcd1234', concepts: ['tactics.fork', 'tactics.pin'] }));
    expect(rs.filter((r) => r.json.counted === true)).toHaveLength(1);
    expect(await q("SELECT SUM(count) AS n FROM cp_weak_concepts WHERE user_id = ?", 'r_rev')).toEqual({ n: 2 });
    expect(await q('SELECT box FROM cp_review_schedule WHERE user_id = ? AND concept_id = ?', 'r_rev', 'tactics.fork')).toEqual({ box: 1 });
  });

  it('lesson complete: 20 envíos iguales a la vez dan XP, intento, racha y Chedex una sola vez', async () => {
    const ana = await user('r_les');
    await streak4('r_les');
    const rs = await all(() => ana('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: ['tactics.fork'] }));
    expect(rs.map((r) => r.status)).toEqual(Array(N).fill(200));
    const xp = rs.map((r) => r.json.xpGained).filter((x) => x > 0);
    expect(xp).toHaveLength(1);
    expect(await q('SELECT xp, xp_today, streak_days FROM cp_profiles WHERE user_id = ?', 'r_les')).toEqual({ xp: xp[0], xp_today: xp[0], streak_days: 5 });
    expect(await q('SELECT attempts FROM cp_lesson_progress WHERE user_id = ?', 'r_les')).toEqual({ attempts: 1 });
    expect(await q('SELECT count FROM cp_weak_concepts WHERE user_id = ?', 'r_les')).toEqual({ count: 1 });
    expect(await q("SELECT COUNT(*) AS n FROM cp_wallet_ledger WHERE user_id = ? AND reason = 'streak_milestone'", 'r_les')).toEqual({ n: 1 });
  });

  it('lesson complete sin hito de Chedex: 20 envíos iguales a la vez dan XP e intento una sola vez', async () => {
    const ana = await user('r_les2');
    await exec('INSERT INTO cp_profiles (user_id, streak_days, last_active_date) VALUES (?,1,?)', 'r_les2', yesterday);
    const rs = await all(() => ana('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: ['tactics.fork'] }));
    expect(rs.map((r) => r.status)).toEqual(Array(N).fill(200));
    const xp = rs.map((r) => r.json.xpGained).filter((x) => x > 0);
    expect(xp).toHaveLength(1);
    expect(await q('SELECT xp, xp_today, streak_days FROM cp_profiles WHERE user_id = ?', 'r_les2')).toEqual({ xp: xp[0], xp_today: xp[0], streak_days: 2 });
    expect(await q('SELECT attempts FROM cp_lesson_progress WHERE user_id = ?', 'r_les2')).toEqual({ attempts: 1 });
    expect(await q('SELECT count FROM cp_weak_concepts WHERE user_id = ?', 'r_les2')).toEqual({ count: 1 });
  });

  it('lección y finish del mismo día a la vez: la racha avanza una vez y un solo Chedex', async () => {
    const ana = await user('r_mix');
    await due('r_mix', 'tactics.fork');
    await streak4('r_mix');
    const s = (await ana('GET', '/api/session')).json;
    await ana('POST', '/api/session/answer', { itemId: s.items[0].itemId, uci: solutionOf(s.items[0].fen)[0], attempt: 1 });
    const rs = await all((i) =>
      i % 2 ? ana('POST', '/api/session/finish', { sessionId: s.sessionId }) : ana('POST', '/api/lessons/a.1/complete', { correct: 5, total: 5, mistakes: [] }),
    );
    expect(rs.map((r) => r.status)).toEqual(Array(N).fill(200));
    expect(await q('SELECT streak_days FROM cp_profiles WHERE user_id = ?', 'r_mix')).toEqual({ streak_days: 5 });
    expect(await q("SELECT COUNT(*) AS n FROM cp_wallet_ledger WHERE user_id = ? AND reason = 'streak_milestone'", 'r_mix')).toEqual({ n: 1 });
    expect(await q('SELECT box FROM cp_review_schedule WHERE user_id = ? AND concept_id = ?', 'r_mix', 'tactics.fork')).toEqual({ box: 3 });
  });
});
