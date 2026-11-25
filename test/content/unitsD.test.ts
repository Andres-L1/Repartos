import { describe, expect, it } from 'vitest';
import { UNITS } from '../../src/content/index.js';
import { levelPlan } from '../../worker/level.js';
import { unit as u10 } from '../../src/content/units/u10.js';
import { unit as u11 } from '../../src/content/units/u11.js';
import { unit as u12 } from '../../src/content/units/u12.js';
import type { Unit } from '../../src/content/schema.js';
import { describeLessons } from './lesson-checks.js';

/** Fase 4 desde Intermedio. Además de estas comprobaciones, Stockfish: `npx tsx scripts/verify-fase4.mts u10 u11 u12 --bank`. */
/** `order` es el número que ve el alumno en el mapa: desde 2026-11-15 los finales (u13...) se intercalan en su nivel. */
const UNITS_D: { unit: Unit; level: Unit['level']; requires: string; order: number }[] = [
  { unit: u10, level: 'intermediate', requires: 'u09', order: 19 },
  { unit: u11, level: 'advanced', requires: 'u10', order: 21 },
  { unit: u12, level: 'competitive', requires: 'u11', order: 25 },
];

/** Sacrificios de 5 medias jugadas (atracción a una horquilla): verificados con Stockfish, aquí por balance final. */
const CALCULATION = new Set([
  'u11.l01:practice:0',
  'u11.l01:practice:1',
  'u11.l01:evaluation:1',
  'u11.l01:evaluation:2',
  // u12: líneas de 5 medias jugadas que terminan con al menos dos peones más
  'u12.l01:practice:0',
  'u12.l01:practice:1',
  'u12.l01:evaluation:0',
  'u12.l02:evaluation:1',
  'u12.l03:practice:0',
  'u12.l03:practice:2',
  'u12.l03:evaluation:0',
]);

/** u12: defensas sin ganancia de material inmediata y la carrera del peón (qQ0EY): solo Stockfish. */
const ENGINE = new Set(['u12.l01:practice:2', 'u12.l01:evaluation:1', 'u12.l02:practice:0']);

describe('contenido D: Fase 4 desde Intermedio (pendiente de validación de profesores)', () => {
  it('unidades con metadatos correctos, encadenadas en orden', () => {
    for (const { unit: u, level, requires, order } of UNITS_D) {
      expect(u.order, u.id).toBe(order);
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
    expect(levelPlan('advanced', { units: UNITS })).toMatchObject({ recommendedUnitId: 'u11', comingSoon: false });
    expect(levelPlan('competitive', { units: UNITS })).toMatchObject({ recommendedUnitId: 'u12', comingSoon: false });
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(UNITS_D.map((d) => d.unit))).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  describeLessons(
    UNITS_D.map((d) => d.unit),
    { calculation: CALCULATION, engine: ENGINE },
  );
});
