import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { openTestDb } from './sqlite-db.js';
import { cleanupStmts, fillPool, scheduledRun, takePuzzle } from '../../worker/puzzles.js';
import { POOL_COMBOS } from '../../src/review/srs.js';

const { puzzles } = JSON.parse(readFileSync(new URL('../fixtures/lichess-puzzles.json', import.meta.url), 'utf8')) as { puzzles: any[] };
const DAY = 86_400_000;
const NOW = 1_000_000_000_000; // 2001-09-09T01:46:40Z (minuto 46: sin limpieza)

const fakeFetch = (body: unknown, status = 200) => {
  const f = (async (url: string) => {
    f.urls.push(String(url));
    return new Response(JSON.stringify(body), { status });
  }) as unknown as typeof fetch & { urls: string[] };
  f.urls = [];
  return f;
};
type TestDb = ReturnType<typeof openTestDb>;
const seed = (db: TestDb, n: number, o: { theme?: string; difficulty?: string; rating?: number; fetchedAt?: number; used?: number | null; prefix?: string } = {}) => {
  for (let i = 0; i < n; i++)
    db.raw
      .prepare("INSERT INTO cp_puzzle_pool VALUES (?, ?, ?, ?, 'f', '[\"e2e4\"]', ?, ?)")
      .run(`${o.prefix ?? 's'}${i}`, o.theme ?? 'fork', o.difficulty ?? 'easier', o.rating ?? 1500, o.fetchedAt ?? NOW, o.used ?? null);
};
const rows = (db: TestDb, where = '1') => (db.raw.prepare(`SELECT COUNT(*) AS n FROM cp_puzzle_pool WHERE ${where}`).get() as any).n;
/** Todas las combinaciones llenas (40 sin usar y recientes) salvo las indicadas. */
const fillAllBut = (db: TestDb, except: string[] = []) => {
  for (const c of POOL_COMBOS) if (!except.includes(`${c.theme}|${c.difficulty}`)) seed(db, 40, { ...c, prefix: `${c.theme}${c.difficulty}` });
};

describe('takePuzzle (solo lee el depósito)', () => {
  it('no llama a Lichess: depósito vacío da null', async () => {
    expect(await takePuzzle(openTestDb(), 'fork', 'easier', NOW)).toBeNull();
  });
  it('no entrega el mismo puzle dos veces', async () => {
    const db = openTestDb();
    seed(db, 3);
    const ids = new Set<string>();
    for (let i = 0; i < 3; i++) ids.add((await takePuzzle(db, 'fork', 'easier', NOW))!.puzzleId);
    expect(ids.size).toBe(3);
    expect(await takePuzzle(db, 'fork', 'easier', NOW)).toBeNull();
  });
  it('tope de valoración: solo los que no lo pasan; sin ninguno, null', async () => {
    const db = openTestDb();
    seed(db, 2, { rating: 900, prefix: 'alto' });
    seed(db, 1, { rating: 780, prefix: 'bajo' });
    expect((await takePuzzle(db, 'fork', 'easier', NOW, 800))?.rating).toBe(780);
    expect(await takePuzzle(db, 'fork', 'easier', NOW, 800)).toBeNull();
    expect((await takePuzzle(db, 'fork', 'easier', NOW, null))?.rating).toBe(900);
  });
});

describe('fillPool (Cron Trigger)', () => {
  it('una sola petición, a la combinación con menos sin usar; guarda los válidos', async () => {
    const db = openTestDb();
    fillAllBut(db, ['pin|normal', 'fork|easier']);
    seed(db, 5, { theme: 'fork', difficulty: 'easier', prefix: 'fe' });
    const f = fakeFetch({ puzzles });
    expect(await fillPool(db, NOW, f)).toBe(true);
    expect(f.urls).toEqual(['https://lichess.org/api/puzzle/batch/pin?nb=50&difficulty=normal']);
    expect(rows(db, "theme = 'pin' AND difficulty = 'normal'")).toBe(3);
  });
  it('todo lleno y reciente: ninguna petición; con más de 7 días, rellena esa', async () => {
    const db = openTestDb();
    fillAllBut(db);
    const f = fakeFetch({ puzzles });
    expect(await fillPool(db, NOW + DAY, f)).toBe(false);
    db.raw.prepare("UPDATE cp_puzzle_pool SET fetched_at = ? WHERE theme = 'mate' AND difficulty = 'hardest'").run(NOW - 8 * DAY);
    expect(await fillPool(db, NOW, f)).toBe(true);
    expect(f.urls).toEqual(['https://lichess.org/api/puzzle/batch/mate?nb=50&difficulty=hardest']);
  });
  it('el puzle inválido del lote no entra', async () => {
    const db = openTestDb();
    fillAllBut(db, ['fork|easier']);
    const bad = { game: { pgn: puzzles[0].game.pgn }, puzzle: { ...puzzles[0].puzzle, id: 'bad00', solution: ['a1a1'] } };
    await fillPool(db, NOW, fakeFetch({ puzzles: [bad, puzzles[1]] }));
    expect(rows(db, "theme = 'fork' AND difficulty = 'easier'")).toBe(1);
  });
  it('tras un 429 no vuelve a llamar durante un minuto (reloj falso)', async () => {
    const db = openTestDb();
    const f = fakeFetch({}, 429);
    await fillPool(db, NOW, f);
    expect(await fillPool(db, NOW + 59_000, f)).toBe(false);
    expect(f.urls).toHaveLength(1);
    expect(await fillPool(db, NOW + 60_000, f)).toBe(true);
    expect(f.urls).toHaveLength(2);
  });
  it('scheduledRun nunca lanza: red caída, cuerpo raro o base rota', async () => {
    const db = openTestDb();
    await expect(scheduledRun(db, NOW, (async () => { throw new Error('red'); }) as unknown as typeof fetch)).resolves.toBeUndefined();
    await expect(scheduledRun(db, NOW + 60_000, fakeFetch({ nada: 1 }))).resolves.toBeUndefined();
    const broken = { ...db, all: async () => { throw new Error('D1'); }, batch: async () => { throw new Error('D1'); } };
    await expect(scheduledRun(broken, Date.UTC(2026, 0, 1, 10, 0), fakeFetch({ puzzles }))).resolves.toBeUndefined();
    expect(rows(db)).toBe(0);
  });
  it('una ejecución por minuto = como mucho una petición por minuto', async () => {
    const db = openTestDb();
    const f = fakeFetch({ puzzles });
    for (let m = 0; m < 10; m++) await scheduledRun(db, NOW + m * 60_000, f);
    expect(f.urls.length).toBeLessThanOrEqual(10);
  });
});

describe('limpieza', () => {
  it('borra elementos de sesión de más de 7 días, puzles usados hace más de 30 y deja 200 sin usar por combinación', async () => {
    const db = openTestDb();
    db.raw.prepare("INSERT INTO cp_users (id, username, created_at, last_login_at) VALUES ('ana','ana','x','x')").run();
    const item = db.raw.prepare("INSERT INTO cp_session_items (id, user_id, session_id, concept_id, kind, fen, line_json, created_at) VALUES (?, 'ana', 's', 'tactics.fork', 'bank', 'f', '[]', ?)");
    item.run('viejo', NOW - 7 * DAY - 1);
    item.run('nuevo', NOW - 7 * DAY + 1);
    seed(db, 2, { used: NOW - 31 * DAY, prefix: 'usadoViejo' });
    seed(db, 2, { used: NOW - 29 * DAY, prefix: 'usadoNuevo' });
    seed(db, 205, { fetchedAt: NOW, prefix: 'u' });
    seed(db, 3, { fetchedAt: NOW - 1, prefix: 'masViejo' });
    seed(db, 10, { theme: 'pin', prefix: 'pin' });
    await db.batch(cleanupStmts(NOW));
    expect((db.raw.prepare('SELECT id FROM cp_session_items').all() as any[]).map((r) => r.id)).toEqual(['nuevo']);
    expect(rows(db, "puzzle_id LIKE 'usadoViejo%'")).toBe(0);
    expect(rows(db, "puzzle_id LIKE 'usadoNuevo%'")).toBe(2);
    expect(rows(db, "theme = 'fork' AND used_at IS NULL")).toBe(200);
    expect(rows(db, "puzzle_id LIKE 'masViejo%'")).toBe(0); // se quedan los más recientes
    expect(rows(db, "theme = 'pin'")).toBe(10);
  });
  it('scheduledRun limpia solo a la hora en punto', async () => {
    const db = openTestDb();
    seed(db, 1, { used: 1, prefix: 'usado' });
    await scheduledRun(db, Date.UTC(2026, 0, 1, 10, 1), fakeFetch({}, 500));
    expect(rows(db)).toBe(1);
    await scheduledRun(db, Date.UTC(2026, 0, 1, 11, 0), fakeFetch({}, 500));
    expect(rows(db)).toBe(0);
  });
});
