import { describe, expect, it } from 'vitest';
import { lessonsForConcept } from '../../src/content/index.js';

describe('lessonsForConcept', () => {
  it.each([
    'tactics.hanging_piece',
    'tactics.bad_exchange',
    'tactics.fork',
    'tactics.pin',
    'tactics.mate_threat',
    'tactics.discovered_attack',
  ])('%s resolves to at least one lesson', (c) => {
    const r = lessonsForConcept(c);
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]).toEqual({ id: expect.any(String), title: expect.any(String) });
  });
  it('unknown concept returns []', () => {
    expect(lessonsForConcept('tactics.nope')).toEqual([]);
  });
});
