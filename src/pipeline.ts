import { analyzeGame } from './analysis/index.js';
import { trainFromMoves } from './pedagogy/train.js';
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
  return trainFromMoves(moves, level);
}
