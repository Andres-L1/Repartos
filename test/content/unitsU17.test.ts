import { describe, expect, it } from 'vitest';
import { unit as u17 } from '../../src/content/units/u17.js';
import { describeLessons } from './lesson-checks.js';

/** u17 (Ataque al rey). Además de estas comprobaciones, Stockfish: `npx tsx scripts/verify-fase4.mts u17`. */
describe('contenido u17: Ataque al rey (pendiente de validación de profesores)', () => {
  it('metadatos', () => {
    expect(u17.id).toBe('u17');
    expect(u17.level).toBe('advanced');
    expect(u17.requires).toEqual(['u15']);
    expect(u17.description.length).toBeGreaterThan(20);
    expect(u17.lessons).toHaveLength(3);
    for (const l of u17.lessons) expect(l.conceptIds?.length, l.id).toBeGreaterThan(0);
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(u17)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  describeLessons([u17]);
});
