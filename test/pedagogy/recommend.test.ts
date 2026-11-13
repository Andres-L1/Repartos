import { describe, expect, it } from 'vitest';
import type { Diagnosis, Level } from '../../src/types.js';
import { recommend } from '../../src/pedagogy/recommend.js';
import { EXERCISES } from '../../src/pedagogy/exercises.js';

const LEVELS: Level[] = ['beginner', 'initiation', 'basic', 'intermediate', 'advanced', 'competitive'];
const idx = (l: Level) => LEVELS.indexOf(l);

const diag = (conceptId: string): Diagnosis => ({
  type: 'fork',
  ply: 1,
  color: 'white',
  fact: 'x',
  evidence: { squares: [], pieces: [] },
  conceptIds: [conceptId],
});

describe('recommend', () => {
  it('devuelve [] sin diagnóstico', () => {
    expect(recommend(null, 'basic')).toEqual([]);
  });

  it('solo devuelve ejercicios del concepto del error', () => {
    for (const c of ['tactics.fork', 'tactics.pin', 'tactics.mate_threat']) {
      const r = recommend(diag(c), 'basic', 10);
      expect(r.length).toBeGreaterThan(0);
      expect(r.every((e) => e.conceptId === c)).toBe(true);
    }
  });

  it('respeta n (3 por defecto) y no repite', () => {
    const r = recommend(diag('tactics.hanging_piece'), 'beginner');
    expect(r).toHaveLength(3);
    expect(new Set(r.map((e) => e.id)).size).toBe(3);
    expect(recommend(diag('tactics.hanging_piece'), 'beginner', 1)).toHaveLength(1);
    expect(recommend(diag('tactics.hanging_piece'), 'beginner', 0)).toEqual([]);
  });

  it('prioriza el nivel del alumno y luego el inmediato inferior', () => {
    const r = recommend(diag('tactics.fork'), 'intermediate', 2);
    expect(r[0]!.level).toBe('intermediate');
    expect(r[1]!.level).toBe('basic');
  });

  it('con un nivel sin ejercicios cae al más cercano inferior', () => {
    // fork no tiene ejercicios 'competitive'; el más cercano es 'intermediate'
    const r = recommend(diag('tactics.fork'), 'competitive', 1);
    expect(r[0]!.level).toBe('intermediate');
  });

  it('para cada nivel, el primer resultado es el nivel más cercano disponible', () => {
    const pool = EXERCISES.filter((e) => e.conceptId === 'tactics.mate_threat');
    for (const l of LEVELS) {
      const r = recommend(diag('tactics.mate_threat'), l, 1)[0]!;
      const bestDist = Math.min(...pool.map((e) => Math.abs(idx(e.level) - idx(l))));
      expect(Math.abs(idx(r.level) - idx(l))).toBe(bestDist);
    }
  });

  it('usa el concepto del tipo si conceptIds está vacío', () => {
    const d: Diagnosis = { ...diag('x'), type: 'pin', conceptIds: [] };
    expect(recommend(d, 'basic').every((e) => e.conceptId === 'tactics.pin')).toBe(true);
  });

  it('ignora conceptos desconocidos', () => {
    expect(recommend(diag('tactics.no_existe'), 'basic')).toEqual([]);
  });
});
