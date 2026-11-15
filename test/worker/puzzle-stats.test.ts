/** Contadores cp_puzzle_stats (migración 0010) y coste de lectura del Cron Trigger (límite del plan gratuito de D1: 5 M filas/día). */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { openTestDb } from './sqlite-db.js';
import { cleanupStmts, scheduledRun, takePuzzle } from '../../worker/puzzles.js';
import { POOL_COMBOS } from '../../src/review/srs.js';

const { puzzles } = JSON.parse(readFileSync(new URL('../fixtures/lichess-puzzles.json', import.meta.url), 'utf8')) as { puzzles: any[] };
const DAY = 86_400_000;
const NOW = 1_000_000_000_000; // minuto 46: sin limpieza
type TestDb = ReturnType<typeof openTestDb>;

const seed = (db: TestDb, n: number, o: { theme?: string; difficulty?: string; fetchedAt?: number; used?: number | null; prefix?: string } = {}) => {
  for (let i = 0; i < n; i++)
    db.raw
      .prepare("INSERT INTO cp_puzzle_pool VALUES (?, ?, ?, 1500, 'f', '[\"e2e4\"]', ?, ?)")
      .run(`${o.prefix ?? 's'}${i}`, o.theme ?? 'fork', o.difficulty ?? 'easier', o.fetchedAt ?? NOW, o.used ?? null);
};
const stat = (db: TestDb, theme = 'fork', difficulty = 'easier') =>
  db.raw.prepare('SELECT unused, last_fetched AS last FROM cp_puzzle_stats WHERE theme = ? AND difficulty = ?').get(theme, difficulty) as { unused: number; last: number } | undefined;
const truth = (db: TestDb) =>
  db.raw.prepare('SELECT theme, difficulty, SUM(used_at IS NULL) AS unused, MAX(fetched_at) AS last FROM cp_puzzle_pool GROUP BY theme, difficulty ORDER BY 1, 2').all();
const counters = (db: TestDb) =>
  db.raw.prepare('SELECT theme, difficulty, unused, last_fetched AS last FROM cp_puzzle_stats ORDER BY 1, 2').all();
const count = (db: TestDb, where: string) => (db.raw.prepare(`SELECT COUNT(*) AS n FROM cp_puzzle_pool WHERE ${where}`).get() as { n: number }).n;

describe('contadores del depósito', () => {
  it('coinciden con el depósito tras insertar, reclamar, liberar, repetir y limpiar', async () => {
    const db = openTestDb();
    seed(db, 10);
    seed(db, 4, { theme: 'pin', difficulty: 'normal', prefix: 'p', fetchedAt: NOW + 5 });
    expect(stat(db)).toEqual({ unused: 10, last: NOW });
    await takePuzzle(db, 'fork', 'easier', NOW);
    await takePuzzle(db, 'fork', 'easier', NOW);
    expect(stat(db)?.unused).toBe(8);
    db.raw.prepare('UPDATE cp_puzzle_pool SET used_at = NULL WHERE used_at = ?').run(NOW); // liberación tras una carrera perdida
    expect(stat(db)?.unused).toBe(10);
    db.raw.prepare("INSERT OR IGNORE INTO cp_puzzle_pool VALUES ('s0','fork','easier',1500,'f','[]',1,NULL)").run(); // repetido: no cuenta
    expect(stat(db)?.unused).toBe(10);
    seed(db, 250, { prefix: 'm', fetchedAt: NOW + 1 });
    await db.batch(cleanupStmts(NOW + 40 * DAY));
    expect(count(db, "theme = 'fork' AND used_at IS NULL")).toBe(200);
    expect(counters(db)).toEqual(truth(db));
  });

  it('30 reclamos concurrentes sobre 20 puzles: ninguno repetido y los contadores no se desvían', async () => {
    const db = openTestDb();
    seed(db, 20);
    const got = await Promise.all(Array.from({ length: 30 }, () => takePuzzle(db, 'fork', 'easier', NOW)));
    expect(new Set(got.filter(Boolean).map((p) => p!.puzzleId)).size).toBe(20);
    expect(stat(db)?.unused).toBe(0);
    expect(counters(db)).toEqual(truth(db));
  });

  it('el relleno de la migración recalcula desde el depósito existente y se puede repetir', () => {
    const db = openTestDb();
    seed(db, 6, { used: 7 });
    seed(db, 3, { prefix: 'n', fetchedAt: NOW + 9 });
    db.raw.exec('DELETE FROM cp_puzzle_stats');
    const mig = readFileSync(new URL('../../migrations/0010_cp_puzzle_stats.sql', import.meta.url), 'utf8');
    for (let i = 0; i < 2; i++) db.raw.exec(mig);
    expect(stat(db)).toEqual({ unused: 3, last: NOW + 9 });
    expect(counters(db)).toEqual(truth(db));
  });
});

describe('coste de lectura', () => {
  it('una ejecución del cron lee una fila por combinación más la pausa, sin importar el tamaño del depósito', async () => {
    const db = openTestDb();
    for (const c of POOL_COMBOS) seed(db, 40, { ...c, prefix: `${c.theme}${c.difficulty}` });
    seed(db, 3000, { prefix: 'usado', used: NOW - DAY });
    let read = 0;
    const sql: string[] = [];
    const spy = {
      ...db,
      all: async (q: string, p?: any[]) => {
        sql.push(q);
        const r = await db.all(q, p);
        read += r.length;
        return r;
      },
      first: async (q: string, p?: any[]) => {
        sql.push(q);
        const r = await db.first(q, p);
        read += r ? 1 : 0;
        return r;
      },
    } as unknown as typeof db;
    const f = (async () => new Response(JSON.stringify({ puzzles }))) as unknown as typeof fetch;
    await scheduledRun(spy, NOW, f);
    expect(read).toBeLessThanOrEqual(POOL_COMBOS.length + 1);
    expect(sql.some((q) => /cp_puzzle_pool/.test(q))).toBe(false);
  });

  it('cron, limpieza y toma de puzle usan índices: ningún SCAN de cp_puzzle_pool ni de cp_session_items, ni ordenación', () => {
    const db = openTestDb();
    const plan = (q: string, p: any[] = []) => (db.raw.prepare('EXPLAIN QUERY PLAN ' + q).all(...p) as { detail: string }[]).map((r) => r.detail);
    const lines = [
      ...plan('SELECT value FROM cp_cron_state WHERE key = ?', ['k']),
      ...plan('SELECT theme, difficulty, unused, last_fetched FROM cp_puzzle_stats'),
      ...plan('DELETE FROM cp_session_items WHERE created_at < ?', [1]),
      ...plan('DELETE FROM cp_puzzle_pool WHERE used_at IS NOT NULL AND used_at < ?', [1]),
      ...plan(
        'SELECT puzzle_id FROM cp_puzzle_pool WHERE theme = ? AND difficulty = ? AND used_at IS NULL AND (? IS NULL OR rating <= ?) ORDER BY fetched_at, rowid LIMIT 1',
        ['fork', 'easier', null, null],
      ),
    ];
    expect(lines.filter((l) => /^SCAN (cp_puzzle_pool|cp_session_items)/.test(l))).toEqual([]);
    expect(lines.some((l) => /TEMP B-TREE/.test(l))).toBe(false);
    expect(lines.some((l) => l.includes('idx_cp_puzzle_pool_take'))).toBe(true);
  });
});
