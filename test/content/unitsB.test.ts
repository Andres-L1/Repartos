import { describe, expect, it } from 'vitest';
import { unit as u04 } from '../../src/content/units/u04.js';
import { unit as u05 } from '../../src/content/units/u05.js';
import { unit as u06 } from '../../src/content/units/u06.js';
import type { Unit } from '../../src/content/schema.js';
import { describeLessons } from './lesson-checks.js';

const UNITS_B: Unit[] = [u04, u05, u06];

describe('contenido B: unidades 4-6', () => {
  it('unidades con metadatos correctos y 3-4 lecciones', () => {
    expect(u04.id).toBe('u04');
    expect(u05.id).toBe('u05');
    expect(u06.id).toBe('u06');
    expect(u04.requires).toEqual(['u03']);
    expect(u05.requires).toEqual(['u04']);
    expect(u06.requires).toEqual(['u05']);
    for (const u of UNITS_B) {
      expect(u.level).toBe('initiation');
      expect(u.title.length).toBeGreaterThan(3);
      expect(u.description.length).toBeGreaterThan(20);
      expect(u.lessons.length).toBeGreaterThanOrEqual(3);
      expect(u.lessons.length).toBeLessThanOrEqual(4);
    }
  });

  it('u05 trabaja los conceptos tácticos pedidos', () => {
    const want = ['tactics.hanging_piece', 'tactics.bad_exchange', 'tactics.fork', 'tactics.pin', 'tactics.discovered_attack'];
    const got = new Set(u05.lessons.flatMap((l) => l.conceptIds ?? []));
    for (const c of want) expect(got.has(c), c).toBe(true);
  });

  describeLessons(UNITS_B, {
    principleLessons: new Set(['u06.l01', 'u06.l02', 'u06.l03']),
    defend: new Set(['u04.l03:practice:2']),
  });
});
