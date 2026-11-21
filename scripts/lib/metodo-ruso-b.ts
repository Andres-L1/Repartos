/**
 * Método ruso, parte B (u25 a u29): unidades, pasos que verifica la tablebase y afirmaciones de los textos que dependen de ella.
 * Lo usan test/content/unitsRusoB.test.ts (solo la caché) y scripts/verify-metodo-ruso.mts (pide a la API lo que falte).
 * Caché propia (no positions.json) para no mezclarla con la de otras unidades.
 */
import type { Lesson, PracticeStep, Unit } from '../../src/content/schema.ts';
import { unit as u25 } from '../../src/content/units/u25.ts';
import { unit as u26 } from '../../src/content/units/u26.ts';

export const RUSO_B: Unit[] = [u25, u26];

export const CACHE_RUSO_B = 'test/fixtures/tablebase/metodo-ruso-b.json';

export const stepsOf = (l: Lesson): { key: string; step: PracticeStep }[] => [
  ...l.practice.map((step, i) => ({ key: `${l.id}:practice:${i}`, step })),
  ...l.evaluation.map((step, i) => ({ key: `${l.id}:evaluation:${i}`, step })),
];

/** Pasos que no acaban en mate pero se verifican con la tablebase (jugadas de técnica: gana lo antes posible). */
export const TB_SINGLE = new Set<string>([]);

/** Todo paso con una línea de mate de 2 o más jugadas del alumno, o marcado en TB_SINGLE, lo verifica la tablebase. */
export const isTb = (key: string, step: PracticeStep): boolean => step.solutionUci.length >= 3 || TB_SINGLE.has(key);

export interface TbStep {
  key: string;
  fen: string;
  line: string[];
  alt: string[];
}
export const tbSteps = (): TbStep[] =>
  RUSO_B.flatMap((u) => u.lessons.flatMap(stepsOf))
    .filter(({ key, step }) => isTb(key, step))
    .map(({ key, step }) => ({ key, fen: step.fen, line: step.solutionUci, alt: step.alt ?? [] }));

/** Afirmaciones de los textos (explicaciones) sobre el resultado teórico: posición, jugadas previas y resultado para quien mueve. */
export const TB_CLAIMS: { where: string; fen: string; moves: string[]; result: 'win' | 'draw' | 'loss' }[] = [];
