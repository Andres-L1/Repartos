import { describe, expect, it } from 'vitest';
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { unit as u36 } from '../../src/content/units/u36.js';
import type { Lesson, PracticeStep } from '../../src/content/schema.js';
import { leaksIn, targetsOf } from '../../scripts/lib/hint-leaks.js';
import { cacheProbe, checkLine, loadCache, moverResult, onlyResultErrors } from '../../scripts/lib/tablebase.js';
import { describeLessons } from './lesson-checks.js';

/**
 * u36 «Zugzwang, oposición y triangulación»: verificación exacta con la tablebase Syzygy de Lichess desde la caché propia
 * test/fixtures/tablebase/u36.json (sin red; `npx tsx scripts/verify-u36.mts --refresh` la refresca).
 * En cada jugada del alumno, la de la línea es la ÚNICA que conserva el resultado (ganar o tablas).
 */
const units = [u36];
const probe = cacheProbe(loadCache('test/fixtures/tablebase/u36.json'));
const load = (fen: string) => Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
const stepsOf = (l: Lesson): { key: string; step: PracticeStep }[] => [
  ...l.practice.map((step, i) => ({ key: `${l.id}:practice:${i}`, step })),
  ...l.evaluation.map((step, i) => ({ key: `${l.id}:evaluation:${i}`, step })),
];

/** Resultado (para quien mueve) que supone el texto de cada posición de explicación: `u36.lNN:i`. */
const EXPLAIN_RESULT: Record<string, string> = {
  'u36.l01:0': 'win',
  'u36.l01:1': 'draw',
  'u36.l02:0': 'loss',
  'u36.l02:1': 'draw',
  'u36.l03:0': 'win',
  'u36.l03:1': 'draw',
};
const flipTurn = (fen: string): string => fen.replace(/ [wb] /, (m) => (m === ' w ' ? ' b ' : ' w '));
const endFen = (step: PracticeStep): string => {
  const pos = load(step.fen);
  for (const u of step.solutionUci) pos.play(parseUci(u)!);
  return makeFen(pos.toSetup());
};

describe('contenido u36: zugzwang, oposición y triangulación (tablebase; pendiente de validación de profesores)', () => {
  it('metadatos', () => {
    expect([u36.id, u36.level, u36.requires]).toEqual(['u36', 'competitive', ['u18']]);
    expect(u36.lessons.length).toBe(3);
    for (const l of u36.lessons) {
      expect(l.conceptIds?.length, l.id).toBeGreaterThan(0);
      expect(l.practice.length + l.evaluation.length, l.id).toBe(6);
    }
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(u36)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  describeLessons(units, { engine: new Set(units.flatMap((u) => u.lessons.flatMap((l) => stepsOf(l).map((s) => s.key)))) });

  for (const l of u36.lessons) {
    describe(`${l.id} (tablebase)`, () => {
      l.explanation.forEach((e, i) => {
        it(`explicación ${i + 1}: resultado declarado`, () => {
          expect(probe(e.fen).category).toBe(EXPLAIN_RESULT[`${l.id}:${i}`]);
          // l01: el texto dice «la única jugada»; l03 expl. 2: Kf7 es la única jugada negra que no pierde.
          const only = l.id === 'u36.l01' ? (i === 0 ? 'f4f5' : 'c8d8') : l.id === 'u36.l03' && i === 1 ? 'e7f7' : null;
          if (only) expect(onlyResultErrors(probe, e.fen, [only])).toEqual([]);
        });
      });
      for (const { key, step } of stepsOf(l)) {
        it(`${key}: la jugada del alumno es la única que conserva el resultado`, () => {
          expect(checkLine(probe, step.fen, step.solutionUci, step.alt ?? [], 'category')).toEqual([]);
          expect(step.alt ?? []).toEqual([]);
          expect(onlyResultErrors(probe, step.fen, step.solutionUci)).toEqual([]);
          // Las demás jugadas del alumno no conservan el resultado: en tablas pierden; en posición ganada, no ganan.
          const e = probe(step.fen);
          for (const m of e.moves) if (m.uci !== step.solutionUci[0]) expect(moverResult(m), `${key} ${m.uci}`).not.toBe(e.category);
          if (e.category === 'draw') for (const m of e.moves) if (m.uci !== step.solutionUci[0]) expect(moverResult(m)).toBe('loss');
        });
        if (!key.startsWith('u36.l01'))
          it(`${key}: zugzwang: tras la línea pierde el que mueve y, con el turno cambiado, solo hay tablas`, () => {
            const end = endFen(step);
            expect(probe(end).category).toBe('loss');
            expect(probe(flipTurn(end)).category).toBe('draw');
          });
        it(`${key}: los avisos no regalan la solución`, () => {
          const targets = targetsOf(step.fen, step.solutionUci, step.alt, step.branches);
          const texts: [string, string | undefined][] = [
            ['hint', step.hint],
            ['explanationWrong', step.explanationWrong],
            ...Object.entries(step.wrongByMove ?? {}).map(([u, t]): [string, string] => [`wrongByMove[${u}]`, t]),
          ];
          for (const [kind, text] of texts) if (text) expect(leaksIn(text, targets, step.prompt), `${kind}: «${text}»`).toEqual([]);
        });
        it(`${key}: color al turno coherente con el enunciado`, () => {
          const m = step.prompt.match(/^Juegan (blancas|negras)/);
          expect(m, step.prompt).not.toBeNull();
          expect(m![1] === 'blancas').toBe(load(step.fen).turn === 'white');
        });
      }
    });
  }

  it('l03 expl. 1: la línea Kg5 Kf7 Kf5 acaba en la posición de zugzwang de l02 (ejercicio 2)', () => {
    const pos = load(u36.lessons[2]!.explanation[0]!.fen);
    for (const u of ['f4g5', 'e7f7', 'g5f5']) pos.play(parseUci(u)!);
    expect(makeFen(pos.toSetup()).split(' ')[0]).toBe(endFen(u36.lessons[1]!.practice[1]!).split(' ')[0]);
  });

  it('las posiciones finales de las líneas son legales', () => {
    for (const l of u36.lessons)
      for (const { step } of stepsOf(l)) {
        const pos = load(step.fen);
        for (const u of step.solutionUci) pos.play(parseUci(u)!);
        expect(() => makeFen(pos.toSetup())).not.toThrow();
      }
  });
});
