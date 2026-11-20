import { loadPosition, playLine } from '../diagnosis/chess-utils.js';
import { diagnose, diagnoseMissedTactic } from '../diagnosis/index.js';
import { ENGINE_ONLY_CONCEPT_ID } from '../pedagogy/explain.js';
import type { AnalyzedMove } from '../types.js';
import type { GameAnalysis, KeyError } from './types.js';

export type ErrorTier = 'cause' | 'tactic' | 'engine';

/** Orden de prioridad: causa tipificada, luego táctica perdida, luego solo el análisis del motor. */
const TIER_ORDER: Record<ErrorTier, number> = { cause: 0, tactic: 1, engine: 2 };

export const errorTier = (e: Pick<KeyError, 'diagnosis'>): ErrorTier =>
  !e.diagnosis ? 'engine' : e.diagnosis.type === 'missed_tactic' ? 'tactic' : 'cause';

const isSerious = (m: AnalyzedMove) => m.classification === 'mistake' || m.classification === 'blunder';

/** La mejor jugada del motor se puede enseñar: existe, es distinta de la jugada hecha y es legal en la posición. */
function bestIsPlayable(m: AnalyzedMove): boolean {
  if (!m.bestUci || m.bestUci === m.uci) return false;
  const pos = loadPosition(m.fenBefore);
  return !!pos && playLine(pos, [m.bestUci], 1).length === 1;
}

/**
 * Concepto con el que se guarda la posición del error para «Entrenar hoy». Con causa: su concepto. Sin concepto
 * (táctica perdida o solo motor): `engine.analysis`, y solo si la mejor jugada es clara: una táctica comprobada
 * o un error de más de 250 cp (blunder). Sin MultiPV no se puede asegurar que sea la única buena, así que el resto no se guarda.
 */
export function positionConcept(e: KeyError): string | undefined {
  const concept = e.diagnosis?.conceptIds[0];
  if (concept) return concept;
  return e.diagnosis?.type === 'missed_tactic' || e.move.classification === 'blunder' ? ENGINE_ONLY_CONCEPT_ID : undefined;
}

/** Jugadas del alumno con error grave (mistake o blunder). */
export function seriousMoves(a: GameAnalysis): AnalyzedMove[] {
  return a.moves.filter((m) => m.color === a.color && isSerious(m));
}

/** Imprecisiones del alumno (50 a 100 cp): no se repasan, pero se cuentan. */
export function countInaccuracies(a: GameAnalysis): number {
  return a.moves.filter((m) => m.color === a.color && m.classification === 'inaccuracy').length;
}

/**
 * Errores clave del alumno: sus jugadas con error grave. Primero los de causa verificada, luego la táctica perdida
 * (captura o jaque ganador que no jugó) y por último los que solo tienen el análisis del motor (sin causa inventada).
 * Dentro de cada grupo, mayor pérdida primero; se devuelven los `max` mejores en orden de jugada.
 */
export function keyErrors(a: GameAnalysis, max = 3): KeyError[] {
  const found: KeyError[] = [];
  for (const move of seriousMoves(a)) {
    const diagnosis = diagnose(move) ?? diagnoseMissedTactic(move);
    if (diagnosis || bestIsPlayable(move)) found.push({ gameId: a.gameId, move, diagnosis });
  }
  return found
    .sort((x, y) => TIER_ORDER[errorTier(x)] - TIER_ORDER[errorTier(y)] || y.move.cpLoss - x.move.cpLoss || x.move.ply - y.move.ply)
    .slice(0, max)
    .sort((x, y) => x.move.ply - y.move.ply);
}
