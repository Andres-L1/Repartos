import { describe, it, expect } from 'vitest';
import { levelPlan } from '../../worker/level.js';
import type { Unit } from '../../src/content/schema.js';

const u = (id: string, order: number, level: Unit['level']): Unit => ({ id, order, title: id, description: 'd', level, requires: [], lessons: [] });
const content = { units: [u('i2', 5, 'initiation'), u('b1', 1, 'beginner'), u('b2', 2, 'beginner'), u('i1', 4, 'initiation'), u('s1', 6, 'basic')] };

describe('levelPlan', () => {
  it('nivel con contenido: abre los inferiores y recomienda su primera unidad', () => {
    expect(levelPlan('initiation', content)).toEqual({ openUnitIds: ['b1', 'b2'], recommendedUnitId: 'i1', comingSoon: false });
    expect(levelPlan('basic', content)).toEqual({ openUnitIds: ['b1', 'b2', 'i1', 'i2'], recommendedUnitId: 's1', comingSoon: false });
  });
  it('Principiante: no abre nada y recomienda la primera', () => {
    expect(levelPlan('beginner', content)).toEqual({ openUnitIds: [], recommendedUnitId: 'b1', comingSoon: false });
  });
  it('nivel sin contenido: abre todo, sin recomendada y comingSoon', () => {
    expect(levelPlan('advanced', content)).toEqual({ openUnitIds: ['b1', 'b2', 'i1', 'i2', 's1'], recommendedUnitId: null, comingSoon: true });
    expect(levelPlan('competitive', { units: [] })).toEqual({ openUnitIds: [], recommendedUnitId: null, comingSoon: true });
  });
});
