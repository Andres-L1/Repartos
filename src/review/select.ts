import { diagnose } from '../diagnosis/index.js';
import type { GameAnalysis, KeyError } from './types.js';

/**
 * Errores clave del alumno: solo sus jugadas con error grave y causa verificada.
 * Se eligen los de mayor pérdida y se devuelven en orden de jugada.
 */
export function keyErrors(a: GameAnalysis, max = 3): KeyError[] {
  const found: KeyError[] = [];
  for (const move of a.moves) {
    if (move.color !== a.color) continue;
    if (move.classification !== 'mistake' && move.classification !== 'blunder') continue;
    const diagnosis = diagnose(move);
    if (diagnosis) found.push({ gameId: a.gameId, move, diagnosis });
  }
  return found
    .sort((x, y) => y.move.cpLoss - x.move.cpLoss || x.move.ply - y.move.ply)
    .slice(0, max)
    .sort((x, y) => x.move.ply - y.move.ply);
}
