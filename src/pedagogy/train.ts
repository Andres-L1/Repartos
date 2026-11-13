import { diagnose } from '../diagnosis/index.js';
import type { AnalyzedMove, Level, TrainingItem } from '../types.js';
import { explain } from './explain.js';
import { recommend } from './recommend.js';

/** Jugadas analizadas -> diagnóstico -> explicación -> ejercicios (solo las jugadas no buenas). */
export function trainFromMoves(moves: AnalyzedMove[], level: Level): TrainingItem[] {
  const items: TrainingItem[] = [];
  for (const move of moves) {
    if (move.classification === 'best' || move.classification === 'good') continue;
    const diagnosis = diagnose(move);
    items.push({
      move,
      diagnosis,
      explanation: explain(diagnosis, move, level),
      exercises: recommend(diagnosis, level),
    });
  }
  return items;
}
