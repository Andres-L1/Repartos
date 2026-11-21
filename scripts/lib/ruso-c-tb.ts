/**
 * Qué posiciones de u33 (regla del cuadrado y coronación) se comprueban con la tablebase de Lichess, y qué resultado
 * se espera de cada una. Lo comparten scripts/verify-metodo-ruso-c.mts (pide a la API lo que falte) y
 * test/content/unitsRusoC.test.ts (solo lee la caché test/fixtures/tablebase/metodo-ruso-c.json).
 */
import { makeFen } from 'chessops/fen';
import { unit as u33 } from '../../src/content/units/u33.ts';
import { moves, squareRule } from './ruso-c.ts';

export const TB_CACHE_PATH = 'test/fixtures/tablebase/metodo-ruso-c.json';

export interface TbStep {
  key: string;
  fen: string;
  line: string[];
  alt: string[];
}
/** Ejercicios de la lección de la regla del cuadrado (criterio `category`: todas las jugadas que conservan el resultado). */
export const tbSteps = (): TbStep[] => {
  const l = u33.lessons[2]!;
  return [
    ...l.practice.map((s, i) => ({ key: `u33.l03:practice:${i}`, s })),
    ...l.evaluation.map((s, i) => ({ key: `u33.l03:evaluation:${i}`, s })),
  ].map(({ key, s }) => ({ key, fen: s.fen, line: s.solutionUci, alt: s.alt ?? [] }));
};

/** Resultado (para el bando que mueve) que supone el texto de cada explicación de la regla del cuadrado. */
export const squareExplainExpect = (fen: string): 'draw' | 'win' | 'loss' => {
  const r = squareRule(fen);
  return r.catches ? 'draw' : r.toMove === r.pawnColor ? 'win' : 'loss';
};
export const squareExplains = (): { key: string; fen: string }[] => u33.lessons[2]!.explanation.map((e, i) => ({ key: `u33.l03:explanation:${i}`, fen: e.fen }));

/** Posiciones tras cada coronación del ejercicio del ahogado (u33.l02, práctica 3): reina, torre, alfil y caballo. */
export const promotionFens = (): { promotion: string; fen: string }[] => {
  const fen = u33.lessons[1]!.practice[2]!.fen;
  return moves(fen)
    .filter((m) => m.promotion)
    .map((m) => ({ promotion: m.promotion!, fen: makeFen(m.after.toSetup()) }));
};
