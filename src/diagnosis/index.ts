import type { AnalyzedMove, Diagnosis } from '../types.js';
import { buildCtx } from './chess-utils.js';
import { badExchange } from './rules/bad_exchange.js';
import { discoveredAttack } from './rules/discovered_attack.js';
import { fork } from './rules/fork.js';
import { hangingPiece } from './rules/hanging_piece.js';
import { mateThreat } from './rules/mate_threat.js';
import { pin } from './rules/pin.js';
import type { Rule } from './rules/types.js';

/**
 * De más específica / mayor evidencia a menos. La primera que verifica gana.
 * badExchange va antes que hangingPiece: si hay recaptura, el hecho es un cambio (p. ej. alfil por peón),
 * no una pieza "sin defensa"; hangingPiece exige que no haya recaptura posible, así que no se solapan.
 */
const RULES: Rule[] = [mateThreat, fork, pin, discoveredAttack, badExchange, hangingPiece];

/**
 * Capa 2: causa verificada de un error, reproduciendo las líneas del motor en chessops.
 * Devuelve null si no hay certeza (nunca inventa).
 */
export function diagnose(move: AnalyzedMove): Diagnosis | null {
  if (move.classification === 'best' || move.classification === 'good') return null;
  try {
    const ctx = buildCtx(move);
    if (!ctx) return null;
    for (const rule of RULES) {
      const d = rule(ctx);
      if (d) return d;
    }
  } catch {
    return null;
  }
  return null;
}
