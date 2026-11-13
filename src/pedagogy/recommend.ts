import type { Diagnosis, Exercise, Level } from '../types.js';
import { EXERCISES } from './exercises.js';

export const LEVEL_ORDER: Level[] = [
  'beginner',
  'initiation',
  'basic',
  'intermediate',
  'advanced',
  'competitive',
];

/** 0 = nivel del alumno, 1 = inmediato inferior, luego el resto por cercanía (inferiores antes). */
function priority(exLevel: Level, studentLevel: Level): number {
  const diff = LEVEL_ORDER.indexOf(exLevel) - LEVEL_ORDER.indexOf(studentLevel);
  if (diff === 0) return 0;
  if (diff === -1) return 1;
  return diff < 0 ? -diff : diff + 0.5;
}

/**
 * Capa 4. Ejercicios del concepto del error, priorizando el nivel del alumno y el inmediato inferior.
 * Devuelve [] si no hay diagnóstico fiable.
 */
export function recommend(d: Diagnosis | null, level: Level, n = 3): Exercise[] {
  if (!d || n <= 0) return [];
  const conceptIds = d.conceptIds.length ? d.conceptIds : [`tactics.${d.type}`];
  const candidates = EXERCISES.filter((e) => conceptIds.includes(e.conceptId));
  return candidates
    .map((e, i) => ({
      e,
      conceptRank: conceptIds.indexOf(e.conceptId),
      p: priority(e.level, level),
      i,
    }))
    .sort((a, b) => a.p - b.p || a.conceptRank - b.conceptRank || a.i - b.i)
    .slice(0, n)
    .map((x) => x.e);
}
