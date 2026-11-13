import type { Score } from '../types.js';

export interface EngineResult {
  /** Siempre desde el punto de vista de las blancas. */
  score: Score;
  bestUci: string;
  pv: string[];
}

/** Cualquier motor UCI utilizable por el análisis: proceso de Node hoy, Web Worker en el navegador. */
export interface EngineLike {
  init(): Promise<void>;
  analyze(fen: string, opts?: { depth?: number }): Promise<EngineResult>;
  close(): Promise<void>;
}
