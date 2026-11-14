/**
 * Depósito de puzles de Lichess (API anónima) por tema y dificultad.
 * - Las peticiones de los alumnos solo leen del depósito (`takePuzzle`, nunca llama a Lichess ni lanza).
 * - Lo rellena el Cron Trigger de cada minuto (`scheduledRun`): como mucho UNA petición a Lichess por ejecución,
 *   para la combinación con menos puzles sin usar, así que nunca más de una por minuto en total.
 */
import type { Db, Stmt } from './db.js';
import { POOL_COMBOS, puzzleStart } from '../src/review/srs.js';

const TARGET_UNUSED = 40; // por debajo de esto (o con más de 7 días) la combinación se rellena
const MAX_AGE_MS = 7 * 86_400_000;
const BATCH = 50;
const KEEP_UNUSED = 200;
const DAY = 86_400_000;

export interface TakenPuzzle {
  puzzleId: string;
  rating: number;
  fen: string;
  line: string[];
}

/** Tras un 429, Lichess pide esperar un minuto: hasta entonces no se le vuelve a llamar. Guardado en D1 para que valga en cualquier isolate. */
const PAUSE_MS = 60_000;
const PAUSE_KEY = 'lichess_paused_until';

async function refill(db: Db, theme: string, difficulty: string, nowMs: number, fetchImpl: typeof fetch): Promise<void> {
  const res = await fetchImpl(
    `https://lichess.org/api/puzzle/batch/${encodeURIComponent(theme)}?nb=${BATCH}&difficulty=${encodeURIComponent(difficulty)}`,
    { headers: { Accept: 'application/json' } },
  );
  if (res.status === 429)
    await db.run('INSERT INTO cp_cron_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [PAUSE_KEY, nowMs + PAUSE_MS]);
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

/** Una petición como mucho: la combinación con menos sin usar (empate: la de relleno más antiguo). true si llamó. */
export async function fillPool(db: Db, nowMs: number, fetchImpl: typeof fetch): Promise<boolean> {
  const paused = await db.first<{ value: number }>('SELECT value FROM cp_cron_state WHERE key = ?', [PAUSE_KEY]);
  if (nowMs < (paused?.value ?? 0)) return false;
  const stats = await db.all<{ theme: string; difficulty: string; unused: number; last: number | null }>(
    'SELECT theme, difficulty, SUM(used_at IS NULL) AS unused, MAX(fetched_at) AS last FROM cp_puzzle_pool GROUP BY theme, difficulty',
  );
  const of = (t: string, d: string) => stats.find((s) => s.theme === t && s.difficulty === d);
  const need = POOL_COMBOS.map((c) => ({ ...c, unused: of(c.theme, c.difficulty)?.unused ?? 0, last: of(c.theme, c.difficulty)?.last ?? 0 }))
    .filter((c) => c.unused < TARGET_UNUSED || nowMs - c.last > MAX_AGE_MS)
    .sort((a, b) => a.unused - b.unused || a.last - b.last)[0];
  if (!need) return false;
  await refill(db, need.theme, need.difficulty, nowMs, fetchImpl);
  return true;
}

/** Limpieza: elementos de sesión de más de 7 días, puzles usados hace más de 30 y como mucho 200 sin usar por combinación. */
export function cleanupStmts(nowMs: number): Stmt[] {
  return [
    { sql: 'DELETE FROM cp_session_items WHERE created_at < ?', params: [nowMs - 7 * DAY] },
    { sql: 'DELETE FROM cp_puzzle_pool WHERE used_at IS NOT NULL AND used_at < ?', params: [nowMs - 30 * DAY] },
    {
      sql: `DELETE FROM cp_puzzle_pool WHERE puzzle_id IN (
              SELECT puzzle_id FROM (
                SELECT puzzle_id, ROW_NUMBER() OVER (PARTITION BY theme, difficulty ORDER BY fetched_at DESC, rowid DESC) AS n
                FROM cp_puzzle_pool WHERE used_at IS NULL)
              WHERE n > ${KEEP_UNUSED})`,
    },
  ];
}

/** Lo que hace el Cron Trigger de cada minuto. Nunca lanza: un fallo solo se registra y espera a la siguiente ejecución. */
export async function scheduledRun(db: Db, nowMs: number, fetchImpl: typeof fetch): Promise<void> {
  try {
    if (new Date(nowMs).getUTCMinutes() === 0) await db.batch(cleanupStmts(nowMs)); // una vez por hora basta
  } catch (e) {
    console.error('limpieza', e);
  }
  try {
    await fillPool(db, nowMs, fetchImpl);
  } catch (e) {
    console.error('relleno de puzles', e);
  }
}

export async function takePuzzle(db: Db, theme: string, difficulty: string, nowMs: number, maxRating: number | null = null): Promise<TakenPuzzle | null> {
  try {
    // Reclamo atómico: dos peticiones concurrentes nunca reciben el mismo puzle.
    const row = await db.first<{ puzzle_id: string; rating: number; fen: string; line_json: string }>(
      `UPDATE cp_puzzle_pool SET used_at = ? WHERE puzzle_id = (
         SELECT puzzle_id FROM cp_puzzle_pool WHERE theme = ? AND difficulty = ? AND used_at IS NULL AND (? IS NULL OR rating <= ?)
         ORDER BY fetched_at, rowid LIMIT 1) AND used_at IS NULL
       RETURNING puzzle_id, rating, fen, line_json`,
      [nowMs, theme, difficulty, maxRating, maxRating],
    );
    return row ? { puzzleId: row.puzzle_id, rating: row.rating, fen: row.fen, line: JSON.parse(row.line_json) as string[] } : null;
  } catch {
    return null;
  }
}
