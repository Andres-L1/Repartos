import { describe, expect, it } from 'vitest';
import { UNITS } from '../../src/content/index.js';
import { levelPlan } from '../../worker/level.js';
import { unit as u07 } from '../../src/content/units/u07.js';
import { unit as u08 } from '../../src/content/units/u08.js';
import { unit as u09 } from '../../src/content/units/u09.js';
import type { Unit } from '../../src/content/schema.js';
import { describeLessons } from './lesson-checks.js';

const UNITS_C: Unit[] = [u07, u08, u09];

describe('contenido C: unidades 7-9 (básico, pendiente de validación de profesores)', () => {
  it('unidades con metadatos correctos, encadenadas tras u33', () => {
    expect(UNITS_C.map((u) => [u.id, u.order, u.requires])).toEqual([
      ['u07', 15, ['u33']],
      ['u08', 16, ['u07']],
      ['u09', 17, ['u08']],
    ]);
    for (const u of UNITS_C) {
      expect(u.level).toBe('basic');
      expect(u.description.length).toBeGreaterThan(20);
      expect(u.lessons.length).toBeGreaterThanOrEqual(3);
      expect(u.lessons.length).toBeLessThanOrEqual(4);
      // Toda lección nueva entra en repasos: trabaja al menos un concepto de la biblioteca.
      for (const l of u.lessons) expect(l.conceptIds?.length, l.id).toBeGreaterThan(0);
    }
  });

  it('están en el temario y el nivel Básico deja de estar «en preparación»', () => {
    for (const u of UNITS_C) expect(UNITS).toContain(u);
    expect(levelPlan('basic', { units: UNITS })).toMatchObject({ recommendedUnitId: 'u07', comingSoon: false });
    expect(levelPlan('basic', { units: UNITS }).openUnitIds).not.toContain('u07');
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(UNITS_C)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  describeLessons(UNITS_C);
});
