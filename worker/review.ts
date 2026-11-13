/** Partidas repasadas: registra la partida y suma los conceptos fallados solo la primera vez (idempotente). */
import type { Db, Stmt } from './db.js';
import { CONCEPT_IDS, parsePositions, storePositionStmts, touchSchedule } from './srs.js';
import type { ReviewPosition } from './srs.js';
export const MAX_REVIEW_CONCEPTS = 6;

/** Devuelve el cuerpo validado (conceptos sin duplicados) o un mensaje de error para responder 400. */
export function parseCompleteReview(b: Record<string, unknown>): { gameId: string; concepts: string[]; positions: ReviewPosition[] } | string {
  if (typeof b.gameId !== 'string' || !/^[A-Za-z0-9]{8}$/.test(b.gameId)) return 'gameId no válido';
  if (!Array.isArray(b.concepts) || b.concepts.length > MAX_REVIEW_CONCEPTS) return 'concepts no válido';
  if (!b.concepts.every((c) => typeof c === 'string' && CONCEPT_IDS.has(c))) return 'concepto desconocido';
  const positions = b.positions === undefined ? [] : parsePositions(b.positions);
  if (typeof positions === 'string') return positions;
  return { gameId: b.gameId, concepts: [...new Set(b.concepts as string[])], positions };
}

/**
 * Un único lote atómico: los upserts de conceptos llevan `WHERE NOT EXISTS` sobre la partida y van ANTES de
 * insertar la fila de la partida, así que solo el primer lote en confirmarse suma. `counted` se confirma
 * leyendo la marca única que este lote escribió en reviewed_at (si otro ganó la carrera, la marca es suya).
 */
export async function completeReview(db: Db, userId: string, gameId: string, concepts: string[], nowIso: string, positions: ReviewPosition[] = []): Promise<boolean> {
  const exists = await db.first<{ x: number }>('SELECT 1 AS x FROM cp_reviewed_games WHERE user_id = ? AND game_id = ?', [userId, gameId]);
  if (exists) return false;
  const nowMs = Date.parse(nowIso);
  const mark = `${nowIso}#${crypto.randomUUID()}`;
  const stmts: Stmt[] = [
    ...concepts.map(
      (id): Stmt => ({
        sql: `INSERT INTO cp_weak_concepts (user_id, concept_id, count)
              SELECT ?, ?, 1 WHERE NOT EXISTS (SELECT 1 FROM cp_reviewed_games WHERE user_id = ? AND game_id = ?)
              ON CONFLICT(user_id, concept_id) DO UPDATE SET count = count + 1`,
        params: [userId, id, userId, gameId],
      }),
    ),
    ...concepts.map((id) => touchSchedule(userId, id, nowMs)),
    ...storePositionStmts(userId, gameId, positions, nowMs),
    { sql: 'INSERT OR IGNORE INTO cp_reviewed_games (user_id, game_id, reviewed_at) VALUES (?,?,?)', params: [userId, gameId, mark] },
  ];
  await db.batch(stmts);
  const row = await db.first<{ reviewed_at: string }>('SELECT reviewed_at FROM cp_reviewed_games WHERE user_id = ? AND game_id = ?', [userId, gameId]);
  return row?.reviewed_at === mark;
}
