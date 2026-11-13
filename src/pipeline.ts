import { analyzeGame } from './analysis/index.js';
import { diagnose } from './diagnosis/index.js';
import { explain } from './pedagogy/explain.js';
import { recommend } from './pedagogy/recommend.js';
import type { Level, TrainingItem } from './types.js';

export interface PipelineOptions {
  level?: Level;
  depth?: number;
  onProgress?: (done: number, total: number) => void;
}

/** Fase 1: PGN -> análisis -> diagnóstico -> explicación -> ejercicios. */
export async function trainFromPgn(pgn: string, opts: PipelineOptions = {}): Promise<TrainingItem[]> {
  const level = opts.level ?? 'initiation';
  const moves = await analyzeGame(pgn, { depth: opts.depth, onProgress: opts.onProgress });
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
