/** Repaso espaciado en D1: calendario por concepto y posiciones de errores propios. */
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import type { Stmt } from './db.js';
import { CONCEPTS } from '../src/pedagogy/concepts.js';
import { dueAfter, type ReviewPosition } from '../src/review/srs.js';

export type { ReviewPosition };
export const CONCEPT_IDS = new Set(CONCEPTS.map((c) => c.id));
export const MAX_POSITIONS = 3;
export const MAX_UNSOLVED = 100;

/** Concepto sin fila: caja 1 y vence en 1 día. Un fallo nuevo en caja > 1 la devuelve a la 1 (mismo vencimiento); en caja 1 no cambia. */
export function touchSchedule(userId: string, conceptId: string, nowMs: number): Stmt {
  return {
    sql: `INSERT INTO cp_review_schedule (user_id, concept_id, box, due_at, last_at) VALUES (?,?,1,?,NULL)
          ON CONFLICT(user_id, concept_id) DO UPDATE SET box = 1`,
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
    if (typeof conceptId !== 'string' || !CONCEPT_IDS.has(conceptId)) return 'concepto desconocido';
    if (typeof fen !== 'string' || fen.length > 100 || typeof bestUci !== 'string' || !legalMove(fen, bestUci)) return 'posición no válida';
    out.push({ ply, conceptId, fen, bestUci });
  }
  return out;
}

/** Inserta (ignorando repetidas por partida y jugada) y recorta a 100 sin resolver, borrando las más antiguas. */
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
  ];
}
