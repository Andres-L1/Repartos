import { describe, expect, it } from 'vitest';
import type { Level } from '../../src/types.js';
import { CONCEPTS } from '../../src/pedagogy/concepts.js';
import { EXERCISES } from '../../src/pedagogy/exercises.js';

const LEVELS: Level[] = ['beginner', 'initiation', 'basic', 'intermediate', 'advanced', 'competitive'];
const KNOWN_PLACEHOLDERS = new Set([
  'hecho',
  'jugada',
  'mejor',
  'pieza',
  'Pieza',
  'piezas',
  'casilla',
  'casillas',
  'refutacion',
  'perdida',
]);

describe('biblioteca de conceptos', () => {
  it('tiene exactamente los 6 ids esperados', () => {
    expect(CONCEPTS.map((c) => c.id).sort()).toEqual(
      [
        'tactics.bad_exchange',
        'tactics.discovered_attack',
        'tactics.fork',
        'tactics.hanging_piece',
        'tactics.mate_threat',
        'tactics.pin',
      ].sort(),
    );
  });

  for (const c of CONCEPTS) {
    describe(c.id, () => {
      it('campos obligatorios rellenos', () => {
        expect(c.category).toBeTruthy();
        expect(c.name).toBeTruthy();
        expect(c.definition.length).toBeGreaterThan(20);
        expect(c.detection.length).toBeGreaterThan(20);
        expect(LEVELS).toContain(c.recommendedLevel);
        expect(c.learningObjectives.length).toBeGreaterThan(0);
        expect(c.evaluationCriteria.length).toBeGreaterThan(0);
      });

      it('6 niveles rellenos, con el hecho verificado y solo placeholders conocidos', () => {
        expect(Object.keys(c.explanations).sort()).toEqual([...LEVELS].sort());
        for (const l of LEVELS) {
          const t = c.explanations[l];
          expect(t.length, l).toBeGreaterThan(40);
          expect(t, l).toContain('{hecho}');
          for (const m of t.matchAll(/\{(\w+)\}/g)) {
            expect(KNOWN_PLACEHOLDERS.has(m[1]!), `${l}: {${m[1]}}`).toBe(true);
          }
        }
      });

      it('los ids de ejercicios existen, pertenecen al concepto y cubren todo el banco', () => {
        const byId = new Map(EXERCISES.map((e) => [e.id, e]));
        for (const id of c.exerciseIds) {
          expect(byId.get(id)?.conceptId, id).toBe(c.id);
        }
        const fromBank = EXERCISES.filter((e) => e.conceptId === c.id).map((e) => e.id);
        expect([...c.exerciseIds].sort()).toEqual(fromBank.sort());
      });
    });
  }
});
