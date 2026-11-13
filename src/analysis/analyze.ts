import type { AnalyzedMove } from '../types.js';
import { analyzeWith } from './core.js';
import { Engine } from './engine.js';

export { classify, scoreToCp } from './core.js';

export interface AnalyzeOptions {
  /** Profundidad de búsqueda (por defecto 12). */
  depth?: number;
  /** Se llama tras analizar cada posición: (hechas, total). */
  onProgress?: (done: number, total: number) => void;
}

export async function analyzeGame(pgn: string, opts: AnalyzeOptions = {}): Promise<AnalyzedMove[]> {
  const engine = new Engine();
  await engine.init();
  try {
    return await analyzeWith(engine, pgn, opts);
  } finally {
    await engine.close();
  }
}
