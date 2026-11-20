import { describe, expect, it } from 'vitest';
import { UNITS } from '../../src/content/index.js';
import { EXERCISES } from '../../src/pedagogy/exercises.js';
import { mirrorExercise } from '../../src/pedagogy/mirror.js';
import { leaksIn, targetsOf } from '../../scripts/lib/hint-leaks.js';

/**
 * Política de avisos (docs/estado-proyecto.md): un aviso de primer fallo (`hint`, `explanationWrong`, `wrongByMove`)
 * solo orienta. No nombra la jugada solución (SAN o UCI, ni «Re8» si la solución es «Rxe8») ni su casilla de destino,
 * salvo lo que ya diga el enunciado. La solución completa solo está en `explanationCorrect`.
 */
describe('avisos de fallo: ninguno regala la solución', () => {
  for (const u of UNITS)
    for (const l of u.lessons)
      for (const [mode, steps] of [['practice', l.practice], ['evaluation', l.evaluation]] as const)
        steps.forEach((s, i) => {
          it(`${l.id} ${mode} ${i + 1}`, () => {
            const targets = targetsOf(s.fen, s.solutionUci, s.alt);
            expect(targets.length).toBeGreaterThan(0);
            const texts: [string, string | undefined][] = [
              ['hint', s.hint],
              ['explanationWrong', s.explanationWrong],
              ...Object.entries(s.wrongByMove ?? {}).map(([uci, text]): [string, string] => [`wrongByMove[${uci}]`, text]),
            ];
            for (const [kind, text] of texts) if (text) expect(leaksIn(text, targets, s.prompt), `${kind}: «${text}»`).toEqual([]);
          });
        });

  for (const e of EXERCISES.flatMap((x) => [x, mirrorExercise(x)]))
    it(`banco ${e.id}`, () => {
      if (e.hint) expect(leaksIn(e.hint, targetsOf(e.fen, e.solutionUci, e.alt), e.prompt), `hint: «${e.hint}»`).toEqual([]);
    });

  it('el detector reconoce la solución en SAN, en UCI, con otra forma de captura y por su casilla', () => {
    const fen = '4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1'; // solución Rxd5 (d1d5)
    const t = targetsOf(fen, ['d1d5']);
    expect(leaksIn('Juega Rxd5.', t)).toEqual(['Rxd5']);
    expect(leaksIn('Prueba con Rd5+.', t)).toEqual(['Rd5']);
    expect(leaksIn('La jugada es d1d5.', t)).toContain('d1d5');
    expect(leaksIn('Lleva la torre a d5.', t)).toEqual(['d5']);
    expect(leaksIn('Lleva la torre a d5.', t, 'Captura la dama en d5.')).toEqual([]);
    expect(leaksIn('Mira la columna d y la dama sin defensa.', t)).toEqual([]);
    expect(leaksIn('Con Kd2 no ganas nada.', t)).toEqual([]);
  });

  it('el detector sigue la línea entera', () => {
    const fen = '1k6/8/8/8/8/8/R7/K6R w - - 0 1';
    const t = targetsOf(fen, ['a2a7', 'b8c8', 'h1h8']);
    expect(leaksIn('Piensa en Ra7+ y luego Rh8#.', t).sort()).toEqual(['Ra7', 'Rh8']);
  });
});
