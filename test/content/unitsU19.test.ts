import { describe, expect, it } from 'vitest';
import { unit as u19 } from '../../src/content/units/u19.js';
import { describeLessons } from './lesson-checks.js';

/** Sin ganancia de material visible a profundidad 3 (sacrificios o líneas largas): se verifican con Stockfish d18 (scripts/verify-u19.mts). */
const ENGINE = new Set(['u19.l01:evaluation:0', 'u19.l01:evaluation:2', 'u19.l03:evaluation:0']);

/** u19 (Táctica de entrenamiento: ver la jugada). Además de estas comprobaciones, Stockfish: `npx tsx scripts/verify-fase4.mts u19`. */
describe('contenido u19: Táctica de entrenamiento: ver la jugada (pendiente de validación de profesores)', () => {
  it('metadatos', () => {
    expect(u19.id).toBe('u19');
    expect(u19.level).toBe('intermediate');
    expect(u19.requires).toEqual(['u10']);
    expect(u19.description.length).toBeGreaterThan(20);
    expect(u19.lessons).toHaveLength(3);
    for (const l of u19.lessons) expect(l.conceptIds?.length, l.id).toBeGreaterThan(0);
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(u19)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  describeLessons([u19], { engine: ENGINE });
});
