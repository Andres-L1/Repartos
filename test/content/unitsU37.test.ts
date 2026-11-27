import { describe, expect, it } from 'vitest';
import { unit as u37 } from '../../src/content/units/u37.js';
import { describeLessons } from './lesson-checks.js';

/** u37 (Ideas de apertura por color). Además de estas comprobaciones, Stockfish: `npx tsx scripts/verify-u37.mts`. */
describe('contenido u37: Ideas de apertura por color (pendiente de validación de profesores)', () => {
  it('metadatos', () => {
    expect(u37.id).toBe('u37');
    expect(u37.level).toBe('basic');
    expect(u37.requires).toEqual(['u33']);
    expect(u37.lessons).toHaveLength(2);
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(u37)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  // Las jugadas de apertura no ganan material: basta que no pierdan más de un peón en la búsqueda del test (el motor lo confirma aparte).
  describeLessons([u37], { principleLessons: new Set(u37.lessons.map((l) => l.id)) });
});
