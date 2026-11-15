import { describe, expect, it } from 'vitest';
import { UNITS } from '../../src/content/index.js';
import { levelPlan } from '../../worker/level.js';
import { unit as u10 } from '../../src/content/units/u10.js';
import type { Unit } from '../../src/content/schema.js';
import { describeLessons } from './lesson-checks.js';

/** Fase 4 desde Intermedio. Además de estas comprobaciones, Stockfish: `npx tsx scripts/verify-fase4.mts u10 --bank`. */
const UNITS_D: { unit: Unit; level: Unit['level']; requires: string }[] = [{ unit: u10, level: 'intermediate', requires: 'u09' }];

describe('contenido D: Fase 4 desde Intermedio (pendiente de validación de profesores)', () => {
  it('unidades con metadatos correctos, encadenadas en orden', () => {
    for (const { unit: u, level, requires } of UNITS_D) {
      expect(u.order, u.id).toBe(Number(u.id.slice(1)));
      expect(u.requires, u.id).toEqual([requires]);
      expect(u.level, u.id).toBe(level);
      expect(u.description.length).toBeGreaterThan(20);
      expect(u.lessons.length).toBeGreaterThanOrEqual(3);
      expect(u.lessons.length).toBeLessThanOrEqual(4);
      for (const l of u.lessons) expect(l.conceptIds?.length, l.id).toBeGreaterThan(0);
    }
  });

  it('están en el temario y sus niveles dejan de estar «en preparación»', () => {
    for (const { unit: u } of UNITS_D) expect(UNITS).toContain(u);
    expect(levelPlan('intermediate', { units: UNITS })).toMatchObject({ recommendedUnitId: 'u10', comingSoon: false });
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(UNITS_D.map((d) => d.unit))).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  describeLessons(UNITS_D.map((d) => d.unit));
});
