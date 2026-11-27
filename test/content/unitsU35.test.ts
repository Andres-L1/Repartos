import { describe, expect, it } from 'vitest';
import { unit as u35 } from '../../src/content/units/u35.js';
import { leaksIn, targetsOf } from '../../scripts/lib/hint-leaks.js';
import { describeLessons } from './lesson-checks.js';

const stepsOf = (l: (typeof u35.lessons)[number]) => [...l.practice, ...l.evaluation];

/** u35 (Prevenir antes de atacar). Además de estas comprobaciones, Stockfish: `npx tsx scripts/verify-u35.mts`. */
describe('contenido u35: Prevenir antes de atacar (pendiente de validación de profesores)', () => {
  it('metadatos', () => {
    expect(u35.id).toBe('u35');
    expect(u35.level).toBe('advanced');
    expect(u35.requires).toEqual(['u11']);
    expect(u35.description.length).toBeGreaterThan(20);
    expect(u35.lessons).toHaveLength(3);
    for (const l of u35.lessons) {
      expect(l.conceptIds?.length, l.id).toBeGreaterThan(0);
      expect(stepsOf(l), l.id).toHaveLength(6);
    }
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(u35)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('los avisos de fallo no regalan la solución', () => {
    for (const l of u35.lessons)
      for (const s of stepsOf(l)) {
        const targets = targetsOf(s.fen, s.solutionUci, s.alt, s.branches);
        const texts = [s.hint, s.explanationWrong, ...Object.values(s.wrongByMove ?? {})];
        for (const t of texts) if (t) expect(leaksIn(t, targets, s.prompt), `${l.id}: «${t}»`).toEqual([]);
      }
  });

  // La solución es la única jugada que frena la amenaza y mejora >= 100 cp: la comprueba el motor (verify-u35), no esta búsqueda.
  describeLessons([u35], { engine: new Set(u35.lessons.flatMap((l) => [...l.practice.map((_, i) => `${l.id}:practice:${i}`), ...l.evaluation.map((_, i) => `${l.id}:evaluation:${i}`)])) });
});
