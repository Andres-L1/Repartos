/** Repaso espaciado en D1: calendario por concepto y posiciones de errores propios. */
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import type { SqlValue, Stmt } from './db.js';
import { CONCEPTS } from '../src/pedagogy/concepts.js';
import { ENGINE_ONLY_CONCEPT_ID } from '../src/pedagogy/explain.js';
import { dueAfter, type ReviewPosition } from '../src/review/srs.js';

export type { ReviewPosition };
export const CONCEPT_IDS = new Set(CONCEPTS.map((c) => c.id));
/** Posiciones propias sin concepto (táctica perdida o solo motor): se guardan, pero no cuentan como concepto fallado ni se repasan por calendario. */
export const POSITION_CONCEPT_IDS = new Set([...CONCEPT_IDS, ENGINE_ONLY_CONCEPT_ID]);
export const MAX_POSITIONS = 3;
export const MAX_UNSOLVED = 100;
/** Topes por usuario de lo que crece sin límite si el cliente inventa ids: se conservan los más recientes. */
export const MAX_SOLVED = 200;
export const MAX_REVIEWED_GAMES = 500;
export const MAX_WEAK_CONCEPTS = 300;

/**
 * +1 al contador de un concepto fallado. Un concepto nuevo solo entra si el usuario tiene menos de MAX_WEAK_CONCEPTS
 * (el cliente legítimo manda ids de concepto del temario, muy por debajo; un cliente que inventa ids no llena la tabla).
 * `extraWhere` (con sus `extraParams`) condiciona la sentencia entera.
 */
export function weakConceptStmt(userId: string, conceptId: string, extraWhere = '1', extraParams: SqlValue[] = []): Stmt {
  return {
    sql: `INSERT INTO cp_weak_concepts (user_id, concept_id, count)
          SELECT ?, ?, 1 WHERE (${extraWhere})
            AND (EXISTS (SELECT 1 FROM cp_weak_concepts WHERE user_id = ? AND concept_id = ?)
                 OR (SELECT COUNT(*) FROM cp_weak_concepts WHERE user_id = ?) < ${MAX_WEAK_CONCEPTS})
          ON CONFLICT(user_id, concept_id) DO UPDATE SET count = count + 1`,
    params: [userId, conceptId, ...extraParams, userId, conceptId, userId],
  };
}

/** Concepto sin fila: caja 1 y vence en 1 día. Un fallo nuevo la devuelve a la caja 1 y adelanta el vencimiento a 1 día como mucho. */
export function touchSchedule(userId: string, conceptId: string, nowMs: number): Stmt {
  return {
    sql: `INSERT INTO cp_review_schedule (user_id, concept_id, box, due_at, last_at) VALUES (?,?,1,?,NULL)
          ON CONFLICT(user_id, concept_id) DO UPDATE SET box = 1, due_at = MIN(cp_review_schedule.due_at, excluded.due_at)`,
    params: [userId, conceptId, dueAfter(1, nowMs)],
  };
}

function legalMove(fen: string, uci: string): boolean {
  try {
    const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
    const m = parseUci(uci);
    return !!m && pos.isLegal(m);
  } catch {
    return false;
  }
}

/** Valida las posiciones enviadas por el cliente: devuelve la lista o un mensaje para responder 400. */
export function parsePositions(raw: unknown): ReviewPosition[] | string {
  if (!Array.isArray(raw) || raw.length > MAX_POSITIONS) return 'positions no válido';
  const out: ReviewPosition[] = [];
  for (const p of raw as Record<string, unknown>[]) {
    if (!p || typeof p !== 'object') return 'positions no válido';
    const { ply, conceptId, fen, bestUci } = p;
    if (typeof ply !== 'number' || !Number.isInteger(ply) || ply < 1 || ply > 1000) return 'ply no válido';
    if (typeof conceptId !== 'string' || !POSITION_CONCEPT_IDS.has(conceptId)) return 'concepto desconocido';
    if (typeof fen !== 'string' || fen.length > 100 || typeof bestUci !== 'string' || !legalMove(fen, bestUci)) return 'posición no válida';
    out.push({ ply, conceptId, fen, bestUci });
  }
  return out;
}

/** Inserta (ignorando repetidas por partida y jugada) y recorta a 100 sin resolver y 200 resueltas, borrando las más antiguas. */
export function storePositionStmts(userId: string, gameId: string, positions: ReviewPosition[], nowMs: number): Stmt[] {
  if (!positions.length) return [];
  return [
    ...positions.map(
      (p): Stmt => ({
        sql: `INSERT OR IGNORE INTO cp_review_positions (id, user_id, game_id, ply, concept_id, fen, best_uci, created_at)
              VALUES (?,?,?,?,?,?,?,?)`,
        params: [crypto.randomUUID(), userId, gameId, p.ply, p.conceptId, p.fen, p.bestUci, nowMs],
      }),
    ),
    {
      sql: `DELETE FROM cp_review_positions WHERE user_id = ? AND solved_at IS NULL AND id NOT IN (
              SELECT id FROM cp_review_positions WHERE user_id = ? AND solved_at IS NULL
              ORDER BY created_at DESC, rowid DESC LIMIT ${MAX_UNSOLVED})`,
      params: [userId, userId],
    },
    {
      sql: `DELETE FROM cp_review_positions WHERE user_id = ? AND solved_at IS NOT NULL AND id NOT IN (
              SELECT id FROM cp_review_positions WHERE user_id = ? AND solved_at IS NOT NULL
              ORDER BY solved_at DESC, rowid DESC LIMIT ${MAX_SOLVED})`,
      params: [userId, userId],
    },
  ];
}
