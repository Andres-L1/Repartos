import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createApp } from '../../worker/app.js';
import { devBilling } from '../../worker/billing.js';
import { base64url, seal } from '../../worker/auth.js';
import { EXERCISES } from '../../src/pedagogy/exercises.js';
import { puzzleStart } from '../../src/review/srs.js';
import { openTestDb } from './sqlite-db.js';

const ORIGIN = 'https://chedexpulse.app';
const SECRET = base64url(new Uint8Array(32).map((_, i) => i * 7 + 3));
const DAY = 86_400_000;
const SESSION_TTL = DAY;
const { puzzles } = JSON.parse(readFileSync(new URL('../fixtures/lichess-puzzles.json', import.meta.url), 'utf8')) as { puzzles: any[] };

const fetch429 = () => {
  const f = (async () => {
    f.calls++;
    return new Response('{}', { status: 429 });
  }) as unknown as typeof fetch & { calls: number };
  f.calls = 0;
  return f;
};

function setup() {
  let clock = Date.UTC(2026, 0, 10, 12, 0, 0);
  const db = openTestDb();
  const fetchImpl = fetch429();
  const app = createApp({
    db, content: { units: [] }, billingMode: 'beta_open', billing: devBilling(),
    sessionSecret: SECRET, publicOrigin: ORIGIN, now: () => new Date(clock), fetchImpl,
  });
  const user = async (id: string) => {
    db.raw.prepare('INSERT INTO cp_users (id, username, created_at, last_login_at) VALUES (?,?,?,?)').run(id, id, 'x', 'x');
    const cookie = `__Host-chedex_session=${await seal({ kind: 'session', id, username: id, exp: clock + 30 * DAY }, SECRET)}`;
    return async (method: string, path: string, body?: unknown) => {
      const headers: Record<string, string> = { cookie };
      if (body !== undefined) headers['content-type'] = 'application/json';
      const res = await app.request(ORIGIN + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
      const text = await res.text();
      return { status: res.status, json: JSON.parse(text), text };
    };
  };
  const due = (userId: string, conceptId: string, box = 1, dueAt = clock - 1, weak = 1) => {
    db.raw.prepare('INSERT OR REPLACE INTO cp_review_schedule (user_id, concept_id, box, due_at, last_at) VALUES (?,?,?,?,NULL)').run(userId, conceptId, box, dueAt);
    db.raw.prepare('INSERT OR REPLACE INTO cp_weak_concepts (user_id, concept_id, count) VALUES (?,?,?)').run(userId, conceptId, weak);
  };
  const box = (userId: string, conceptId: string) =>
    db.raw.prepare('SELECT box, due_at FROM cp_review_schedule WHERE user_id = ? AND concept_id = ?').get(userId, conceptId) as { box: number; due_at: number };
  const solutionOf = (fen: string) => EXERCISES.find((e) => e.fen === fen)!.solutionUci;
  return { db, user, due, box, solutionOf, fetchImpl, now: () => clock, advance: (ms: number) => (clock += ms) };
}

describe('sesión diaria', () => {
  it('las 4 rutas exigen sesión', async () => {
    const s = setup();
    const app = createApp({ db: s.db, content: { units: [] }, billingMode: 'beta_open', billing: devBilling(), sessionSecret: SECRET, publicOrigin: ORIGIN });
    for (const [m, p] of [['GET', '/api/session/status'], ['GET', '/api/session'], ['POST', '/api/session/answer'], ['POST', '/api/session/finish']] as const)
      expect((await app.request(ORIGIN + p, { method: m })).status).toBe(401);
  });

  it('status: sin vencidos 0 y próxima fecha; con vencidos los cuenta', async () => {
    const s = setup();
    const ana = await s.user('ana');
    expect((await ana('GET', '/api/session/status')).json).toEqual({ due: 0, nextDueAt: null });
    s.due('ana', 'tactics.fork', 2, s.now() + DAY);
    expect((await ana('GET', '/api/session/status')).json).toEqual({ due: 0, nextDueAt: new Date(s.now() + DAY).toISOString() });
    s.due('ana', 'tactics.pin');
    expect((await ana('GET', '/api/session/status')).json.due).toBe(1);
  });

  it('sin vencidos: 409 con error', async () => {
    const s = setup();
    const ana = await s.user('ana');
    const r = await ana('GET', '/api/session');
    expect(r.status).toBe(409);
    expect(r.json.error).toEqual(expect.any(String));
  });

  it('crea 5 como máximo, prioriza el más fallado y no envía soluciones', async () => {
    const s = setup();
    const ana = await s.user('ana');
    const ids = ['tactics.hanging_piece', 'tactics.bad_exchange', 'tactics.fork', 'tactics.pin', 'tactics.mate_threat', 'tactics.discovered_attack'];
    ids.forEach((c, i) => s.due('ana', c, 1, s.now() - 1, i + 1));
    const r = await ana('GET', '/api/session');
    expect(r.status).toBe(200);
    expect(r.json.items).toHaveLength(5);
    expect(r.json.items[0].conceptId).toBe('tactics.discovered_attack');
    expect(r.json.items.map((i: any) => i.conceptId)).not.toContain('tactics.hanging_piece');
    expect(r.text).not.toMatch(/line|solution/i);
    for (const it of r.json.items) {
      expect(Object.keys(it).sort()).toEqual(['conceptId', 'fen', 'itemId', 'kind', 'prompt']);
      for (const m of s.solutionOf(it.fen)) expect(r.text).not.toContain(m);
    }
    // Reutiliza la sesión abierta; pasadas 24 h crea otra.
    expect((await ana('GET', '/api/session')).json.sessionId).toBe(r.json.sessionId);
    s.advance(DAY + 1);
    expect((await ana('GET', '/api/session')).json.sessionId).not.toBe(r.json.sessionId);
  });

  it('con un solo concepto repite concepto con otra posición', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork');
    const items = (await ana('GET', '/api/session')).json.items;
    expect(items.length).toBe(4); // el banco tiene 4 de horquilla y Lichess no responde
    expect(new Set(items.map((i: any) => i.fen)).size).toBe(4);
  });

  it('Lichess con 429: banco del nivel del alumno sin error; bad_exchange usa el banco sin llamar a Lichess', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork');
    let r = await ana('GET', '/api/session');
    expect(r.status).toBe(200);
    expect(r.json.items[0]).toMatchObject({ kind: 'bank', fen: EXERCISES.find((e) => e.conceptId === 'tactics.fork' && e.level === 'initiation')!.fen });
    expect(s.fetchImpl.calls).toBe(1);

    const bea = await s.user('bea');
    s.db.raw.prepare("INSERT INTO cp_user_level (user_id, level, chosen_at) VALUES ('bea','basic','x')").run();
    s.due('bea', 'tactics.bad_exchange');
    r = await bea('GET', '/api/session');
    expect(r.json.items[0]).toMatchObject({ kind: 'bank', fen: EXERCISES.find((e) => e.conceptId === 'tactics.bad_exchange' && e.level === 'basic')!.fen });
    expect(s.fetchImpl.calls).toBe(1);
  });

  it('posición propia primero; acertarla la marca resuelta', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork');
    const ex = EXERCISES.find((e) => e.id === 'ex.hanging.01')!;
    s.db.raw.prepare("INSERT INTO cp_review_positions (id, user_id, game_id, ply, concept_id, fen, best_uci, created_at) VALUES ('p1','ana','g1',10,'tactics.fork',?,?,1)").run(ex.fen, 'd1d5');
    const item = (await ana('GET', '/api/session')).json.items[0];
    expect(item).toMatchObject({ kind: 'own', fen: ex.fen });
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: 'd1d5' })).json).toEqual({ correct: true, done: true });
    expect(s.db.raw.prepare("SELECT solved_at FROM cp_review_positions WHERE id = 'p1'").get()).toEqual({ solved_at: s.now() });
  });

  it('enroque: rey sobre su torre (e1h1) cuenta como e1g1', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork');
    const fen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
    s.db.raw.prepare("INSERT INTO cp_review_positions (id, user_id, game_id, ply, concept_id, fen, best_uci, created_at) VALUES ('p1','ana','g1',10,'tactics.fork',?,?,1)").run(fen, 'e1g1');
    const item = (await ana('GET', '/api/session')).json.items[0];
    expect(item.fen).toBe(fen);
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: 'e1h1' })).json).toEqual({ correct: true, done: true });
  });

  it('línea de 3 jugadas: acierto devuelve la respuesta del rival y luego done', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork');
    const st = puzzleStart(puzzles[0].game.pgn, puzzles[0].puzzle.solution)!;
    const line = st.line.slice(0, 3);
    s.db.raw.prepare("INSERT INTO cp_puzzle_pool (puzzle_id, theme, difficulty, rating, fen, line_json, fetched_at) VALUES ('AjiNP','fork','easier',1263,?,?,?)").run(st.fen, JSON.stringify(line), s.now());
    const item = (await ana('GET', '/api/session')).json.items[0];
    expect(item).toMatchObject({ kind: 'puzzle', fen: st.fen });
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: line[0] })).json).toEqual({ correct: true, reply: line[1], done: false });
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: line[2] })).json).toEqual({ correct: true, done: true });
    // Cerrado: 404.
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: line[2] })).status).toBe(404);
  });

  it('primer fallo tryAgain; segundo done con la solución; itemId ajeno 404; entrada no válida 400', async () => {
    const s = setup();
    const ana = await s.user('ana');
    const bea = await s.user('bea');
    s.due('ana', 'tactics.fork');
    const item = (await ana('GET', '/api/session')).json.items[0];
    const r404 = await bea('POST', '/api/session/answer', { itemId: item.itemId, uci: 'a2a3' });
    expect(r404.status).toBe(404);
    expect(r404.text).not.toContain(item.fen);
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: 'nada' })).status).toBe(400);
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: 'a2a3' })).json).toEqual({ correct: false, done: false, tryAgain: true });
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: 'a2a3' })).json).toEqual({ correct: false, done: true, solution: s.solutionOf(item.fen) });
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: 'a2a3' })).status).toBe(404);
  });

  it('finish: mueve solo la caja vencida, una sola vez, y la racha avanza una vez', async () => {
    const s = setup();
    const ana = await s.user('ana');
    const bea = await s.user('bea');
    s.due('ana', 'tactics.fork', 2, s.now() - 1, 5);
    s.due('ana', 'tactics.pin', 3, s.now() - 1, 1);
    const start = (await ana('GET', '/api/session')).json;
    expect((await ana('POST', '/api/session/finish', { sessionId: start.sessionId })).status).toBe(409); // nada terminado
    // pin deja de estar vencido antes de terminar (p. ej. repasado en otra sesión)
    s.db.raw.prepare("UPDATE cp_review_schedule SET due_at = ? WHERE user_id = 'ana' AND concept_id = 'tactics.pin'").run(s.now() + DAY);
    const first = new Map<string, any>();
    for (const it of start.items) if (!first.has(it.conceptId)) first.set(it.conceptId, it);
    for (const it of first.values()) await ana('POST', '/api/session/answer', { itemId: it.itemId, uci: s.solutionOf(it.fen)[0] });
    expect((await bea('POST', '/api/session/finish', { sessionId: start.sessionId })).status).toBe(404);
    const f1 = await ana('POST', '/api/session/finish', { sessionId: start.sessionId });
    expect(f1.status).toBe(200);
    expect(f1.json.reviewed).toEqual([{ conceptId: 'tactics.fork', correct: true, misses: 0 }, { conceptId: 'tactics.pin', correct: true, misses: 0 }]);
    expect(f1.json.streak).toBe(1);
    expect(s.box('ana', 'tactics.fork')).toEqual({ box: 3, due_at: s.now() + 4 * DAY });
    expect(s.box('ana', 'tactics.pin')).toEqual({ box: 3, due_at: s.now() + DAY });
    expect(f1.json.nextDueAt).toBe(new Date(s.now() + DAY).toISOString());
    s.advance(DAY - 1); // mismo plazo, todo vencido otra vez: un segundo finish no mueve la caja ni la racha
    s.db.raw.prepare("UPDATE cp_review_schedule SET due_at = ? WHERE user_id = 'ana'").run(s.now() - 1);
    const f2 = await ana('POST', '/api/session/finish', { sessionId: start.sessionId });
    expect(f2.json.reviewed).toEqual(f1.json.reviewed);
    expect(f2.json.streak).toBe(1);
    expect(s.box('ana', 'tactics.fork').box).toBe(3);
    s.advance(1); // a las 24 h la sesión caduca también para finish
    expect((await ana('POST', '/api/session/finish', { sessionId: start.sessionId })).status).toBe(404);
    expect(s.box('ana', 'tactics.fork').box).toBe(3);
    expect(s.db.raw.prepare("SELECT COUNT(*) AS n FROM cp_session_items WHERE status = 'open'").get()).toEqual({ n: 0 });
    // Los abiertos quedaron cerrados.
    const anyItem = start.items.find((i: any) => !first.has(i.conceptId) || first.get(i.conceptId) !== i);
    if (anyItem) expect((await ana('POST', '/api/session/answer', { itemId: anyItem.itemId, uci: 'a2a3' })).status).toBe(404);
  });

  it('fallo en la sesión: la caja vuelve a la 1', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork', 4);
    const start = (await ana('GET', '/api/session')).json;
    const it = start.items[0];
    await ana('POST', '/api/session/answer', { itemId: it.itemId, uci: 'a2a3' });
    await ana('POST', '/api/session/answer', { itemId: it.itemId, uci: s.solutionOf(it.fen)[0] });
    const f = await ana('POST', '/api/session/finish', { sessionId: start.sessionId });
    expect(f.json.reviewed).toEqual([{ conceptId: 'tactics.fork', correct: false, misses: 1 }]);
    expect(s.box('ana', 'tactics.fork')).toEqual({ box: 1, due_at: s.now() + DAY });
  });

  it('coronación: la pieza elegida cuenta; a dama no vale si la solución es a caballo', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork');
    const fen = '8/1P4k1/8/8/8/8/6K1/8 w - - 0 1';
    s.db.raw.prepare("INSERT INTO cp_review_positions (id, user_id, game_id, ply, concept_id, fen, best_uci, created_at) VALUES ('p1','ana','g1',10,'tactics.fork',?,?,1)").run(fen, 'b7b8n');
    const item = (await ana('GET', '/api/session')).json.items[0];
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: 'b7b8q' })).json).toEqual({ correct: false, done: false, tryAgain: true });
    expect((await ana('POST', '/api/session/answer', { itemId: item.itemId, uci: 'b7b8n' })).json).toEqual({ correct: true, done: true });
  });

  it('caduca a las 24 h: responder da 404 y se crea una sesión nueva', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork');
    const first = (await ana('GET', '/api/session')).json;
    s.advance(SESSION_TTL);
    expect((await ana('POST', '/api/session/answer', { itemId: first.items[0].itemId, uci: 'a2a3' })).status).toBe(404);
    const second = (await ana('GET', '/api/session')).json;
    expect(second.sessionId).not.toBe(first.sessionId);
  });

  it('finish choca con el Chedex que otra petición ya registró: se revierte y aun así mueve la caja una vez', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork', 2);
    const today = new Date(s.now()).toISOString().slice(0, 10);
    s.db.raw.prepare("INSERT INTO cp_profiles (user_id, streak_days, last_active_date) VALUES ('ana', 4, ?)").run(new Date(s.now() - DAY).toISOString().slice(0, 10));
    // Como si una lección terminada a la vez ya hubiera escrito el hito de hoy antes de que finish confirme.
    s.db.raw.prepare("INSERT INTO cp_wallet_ledger (user_id, delta, reason, ref, created_at) VALUES ('ana', 1, 'streak_milestone', ?, 'x')").run(`${today}:5`);
    const start = (await ana('GET', '/api/session')).json;
    await ana('POST', '/api/session/answer', { itemId: start.items[0].itemId, uci: s.solutionOf(start.items[0].fen)[0] });
    expect((await ana('POST', '/api/session/finish', { sessionId: start.sessionId })).status).toBe(200);
    expect(s.box('ana', 'tactics.fork')).toEqual({ box: 3, due_at: s.now() + 4 * DAY });
    expect(s.db.raw.prepare("SELECT COUNT(*) AS n FROM cp_wallet_ledger WHERE user_id = 'ana'").get()).toEqual({ n: 1 });
    expect(s.db.raw.prepare("SELECT COUNT(*) AS n FROM cp_session_items WHERE status = 'done'").get()).toEqual({ n: 0 });
  });

  it('dos respuestas y dos finish en paralelo: nada se cuenta dos veces', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork', 2);
    // Racha 4 ayer: hoy llega a 5 y da un Chedex de hito (prueba el índice único con dos finish a la vez).
    s.db.raw.prepare("INSERT INTO cp_profiles (user_id, streak_days, last_active_date) VALUES ('ana', 4, ?)").run(new Date(s.now() - DAY).toISOString().slice(0, 10));
    const start = (await ana('GET', '/api/session')).json;
    const it = start.items[0];
    const uci = s.solutionOf(it.fen)[0];
    const answers = await Promise.all([1, 2].map(() => ana('POST', '/api/session/answer', { itemId: it.itemId, uci })));
    expect(answers.filter((a) => a.status === 200)).toHaveLength(1);
    expect(s.db.raw.prepare('SELECT step, attempts FROM cp_session_items WHERE id = ?').get(it.itemId)).toMatchObject({ attempts: 0 });
    const [f1, f2] = await Promise.all([1, 2].map(() => ana('POST', '/api/session/finish', { sessionId: start.sessionId })));
    expect([f1!.status, f2!.status]).toEqual([200, 200]);
    expect(f2!.json.reviewed).toEqual(f1!.json.reviewed);
    expect(s.box('ana', 'tactics.fork')).toEqual({ box: 3, due_at: s.now() + 4 * DAY });
    expect(s.db.raw.prepare("SELECT COUNT(*) AS n FROM cp_wallet_ledger WHERE user_id = 'ana' AND reason = 'streak_milestone'").get()).toEqual({ n: 1 });
    expect(s.db.raw.prepare("SELECT streak_days FROM cp_profiles WHERE user_id = 'ana'").get()).toEqual({ streak_days: 5 });
  });

  it('attempt: el reenvío de una respuesta ya contada devuelve lo mismo sin contarla otra vez', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork');
    const st = puzzleStart(puzzles[0].game.pgn, puzzles[0].puzzle.solution)!;
    const line = st.line.slice(0, 3);
    s.db.raw.prepare("INSERT INTO cp_puzzle_pool (puzzle_id, theme, difficulty, rating, fen, line_json, fetched_at) VALUES ('AjiNP','fork','easier',1263,?,?,?)").run(st.fen, JSON.stringify(line), s.now());
    const id = (await ana('GET', '/api/session')).json.items[0].itemId;
    const send = (uci: string, attempt?: number) => ana('POST', '/api/session/answer', { itemId: id, uci, attempt });
    const row = () => s.db.raw.prepare('SELECT step, attempts, status FROM cp_session_items WHERE id = ?').get(id);
    expect((await send('a2a3', 0)).status).toBe(400);
    expect((await send('a2a3', 1.5)).status).toBe(400);
    // Fallo 1 y su reenvío (la respuesta se perdió por la red): un solo fallo.
    expect((await send('a2a3', 1)).json).toEqual({ correct: false, done: false, tryAgain: true });
    expect((await send('a2a3', 1)).json).toEqual({ correct: false, done: false, tryAgain: true });
    expect(row()).toEqual({ step: 0, attempts: 1, status: 'open' });
    // Acierto y su reenvío: misma respuesta del rival, sin avanzar dos veces.
    expect((await send(line[0]!, 2)).json).toEqual({ correct: true, reply: line[1], done: false });
    expect((await send(line[0]!, 2)).json).toEqual({ correct: true, reply: line[1], done: false });
    expect(row()).toEqual({ step: 2, attempts: 1, status: 'open' });
    // Intento desfasado (ni el siguiente ni el último contado): 409.
    expect((await send(line[2]!, 5)).status).toBe(409);
    expect((await send(line[2]!, 3)).json).toEqual({ correct: true, done: true });
    expect((await send(line[2]!, 3)).json).toEqual({ correct: true, done: true }); // terminado: se repite, no 404
    expect(row()).toEqual({ step: 4, attempts: 1, status: 'done' });
  });

  it('attempt: el reenvío del segundo fallo repite la solución', async () => {
    const s = setup();
    const ana = await s.user('ana');
    s.due('ana', 'tactics.fork');
    const it0 = (await ana('GET', '/api/session')).json.items[0];
    const send = (attempt: number) => ana('POST', '/api/session/answer', { itemId: it0.itemId, uci: 'a2a3', attempt });
    await send(1);
    const second = (await send(2)).json;
    expect(second).toEqual({ correct: false, done: true, solution: s.solutionOf(it0.fen) });
    expect((await send(2)).json).toEqual(second);
    expect(s.db.raw.prepare('SELECT attempts FROM cp_session_items WHERE id = ?').get(it0.itemId)).toEqual({ attempts: 2 });
  });
});
