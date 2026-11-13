/** Depósito de puzles de Lichess (API anónima) por tema y dificultad. `takePuzzle` nunca lanza: ante cualquier fallo devuelve null. */
import type { Db, Stmt } from './db.js';
import { puzzleStart } from '../src/review/srs.js';

const MIN_UNUSED = 10;
const MAX_AGE_MS = 7 * 86_400_000;
const BATCH = 50;

export interface TakenPuzzle {
  puzzleId: string;
  rating: number;
  fen: string;
  line: string[];
}

const inflight = new Map<string, Promise<void>>(); // una sola petición a la vez por tema y dificultad
/** Tras un 429, Lichess pide esperar un minuto: hasta entonces no se le vuelve a llamar (por Db = por isolate en producción). */
const PAUSE_MS = 60_000;
const pausedUntil = new WeakMap<Db, number>();

async function refill(db: Db, theme: string, difficulty: string, nowMs: number, fetchImpl: typeof fetch): Promise<void> {
  const res = await fetchImpl(
    `https://lichess.org/api/puzzle/batch/${encodeURIComponent(theme)}?nb=${BATCH}&difficulty=${encodeURIComponent(difficulty)}`,
    { headers: { Accept: 'application/json' } },
  );
  if (res.status === 429) pausedUntil.set(db, nowMs + PAUSE_MS);
  if (!res.ok) return;
  const list = ((await res.json()) as { puzzles?: unknown }).puzzles;
  if (!Array.isArray(list)) return;
  const stmts: Stmt[] = [];
  for (const p of list as any[]) {
    const id = p?.puzzle?.id;
    const rating = p?.puzzle?.rating;
    const solution = p?.puzzle?.solution;
    if (typeof id !== 'string' || !Number.isFinite(rating) || typeof p?.game?.pgn !== 'string' || !Array.isArray(solution) || !solution.every((m) => typeof m === 'string')) continue;
    const start = puzzleStart(p.game.pgn, solution);
    if (!start) continue;
    stmts.push({
      sql: `INSERT OR IGNORE INTO cp_puzzle_pool (puzzle_id, theme, difficulty, rating, fen, line_json, fetched_at, used_at)
            VALUES (?,?,?,?,?,?,?,NULL)`,
      params: [id, theme, difficulty, Math.round(rating), start.fen, JSON.stringify(start.line), nowMs],
    });
  }
  await db.batch(stmts);
}

export async function takePuzzle(
  db: Db,
  theme: string,
  difficulty: string,
  nowMs: number,
  fetchImpl: typeof fetch = fetch,
): Promise<TakenPuzzle | null> {
  try {
    const st = await db.first<{ unused: number; last: number | null }>(
      'SELECT SUM(used_at IS NULL) AS unused, MAX(fetched_at) AS last FROM cp_puzzle_pool WHERE theme = ? AND difficulty = ?',
      [theme, difficulty],
    );
    const stale = (st?.unused ?? 0) < MIN_UNUSED || st?.last == null || nowMs - st.last > MAX_AGE_MS;
    if (stale && nowMs >= (pausedUntil.get(db) ?? 0)) {
      const key = `${theme}|${difficulty}`;
      let p = inflight.get(key);
      if (!p) {
        p = refill(db, theme, difficulty, nowMs, fetchImpl)
          .catch(() => {}) // 429, red o cuerpo inválido: se sirve lo que haya en el depósito
          .finally(() => inflight.delete(key));
        inflight.set(key, p);
      }
      await p;
    }
    // Reclamo atómico: dos peticiones concurrentes nunca reciben el mismo puzle.
    const row = await db.first<{ puzzle_id: string; rating: number; fen: string; line_json: string }>(
      `UPDATE cp_puzzle_pool SET used_at = ? WHERE puzzle_id = (
         SELECT puzzle_id FROM cp_puzzle_pool WHERE theme = ? AND difficulty = ? AND used_at IS NULL
         ORDER BY fetched_at, rowid LIMIT 1) AND used_at IS NULL
       RETURNING puzzle_id, rating, fen, line_json`,
      [nowMs, theme, difficulty],
    );
    return row ? { puzzleId: row.puzzle_id, rating: row.rating, fen: row.fen, line: JSON.parse(row.line_json) as string[] } : null;
  } catch {
    return null;
  }
}
