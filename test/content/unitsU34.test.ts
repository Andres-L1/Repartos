import { describe, expect, it } from 'vitest';
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { EXPLAIN_MOVES, FACTS, unit as u34 } from '../../src/content/units/u34.js';
import { cacheProbe, checkLine, loadCache, onlyResultErrors } from '../../scripts/lib/tablebase.js';
import { describeLessons } from './lesson-checks.js';

/**
 * u34 (Estructuras de peones). Finales de peones verificados con la tablebase Syzygy de Lichess (cach茅
 * test/fixtures/tablebase/u34.json; `npx tsx scripts/verify-u34.mts` la rellena y repite la comprobaci贸n con la red):
 * en cada ejercicio la jugada del alumno es la 脷NICA que conserva el resultado (ganado o tablas). Adem谩s, cada hecho
 * estructural que afirma un texto (pe贸n aislado, doblado, retrasado, pasado, cadena) se comprueba por c贸digo en el FEN.
 */
const CACHE = 'test/fixtures/tablebase/u34.json';
type C = 'white' | 'black';
const opp = (c: C): C => (c === 'white' ? 'black' : 'white');
const dir = (c: C) => (c === 'white' ? 1 : -1);
const file = (q: number) => q & 7;
const rank = (q: number) => q >> 3;
const sqOf = (name: string) => (name.charCodeAt(0) - 97) + 8 * (Number(name[1]) - 1);
const pawnsOf = (p: Chess, c: C) => [...p.board.pawn.intersect(p.board[c])];
const has = (p: Chess, c: C, q: number) => p.board.get(q)?.role === 'pawn' && p.board.get(q)?.color === c;

const PRED: Record<string, (p: Chess, c: C, q: number) => boolean> = {
  // sin peones propios en las columnas vecinas
  isolated: (p, c, q) => has(p, c, q) && !pawnsOf(p, c).some((x) => Math.abs(file(x) - file(q)) === 1),
  // otro pe贸n propio en la misma columna
  doubled: (p, c, q) => has(p, c, q) && pawnsOf(p, c).some((x) => x !== q && file(x) === file(q)),
  // peones vecinos todos m谩s adelantados y la casilla de delante atacada por un pe贸n rival
  backward: (p, c, q) => {
    if (!has(p, c, q)) return false;
    const nb = pawnsOf(p, c).filter((x) => Math.abs(file(x) - file(q)) === 1);
    if (!nb.length || nb.some((x) => (rank(x) - rank(q)) * dir(c) <= 0)) return false;
    const stop = rank(q) + dir(c);
    return pawnsOf(p, opp(c)).some((x) => Math.abs(file(x) - file(q)) === 1 && rank(x) + dir(opp(c)) === stop);
  },
  // sin peones rivales por delante en su columna ni en las vecinas
  passed: (p, c, q) => has(p, c, q) && !pawnsOf(p, opp(c)).some((x) => Math.abs(file(x) - file(q)) <= 1 && (rank(x) - rank(q)) * dir(c) > 0),
  // protegido por un pe贸n propio en diagonal por detr谩s
  protected: (p, c, q) => has(p, c, q) && pawnsOf(p, c).some((x) => Math.abs(file(x) - file(q)) === 1 && rank(q) - rank(x) === dir(c)),
  // pe贸n propio sin protecci贸n de pe贸n (base de una cadena)
  base: (p, c, q) => has(p, c, q) && !PRED.protected!(p, c, q),
};

describe('contenido u34: Estructuras de peones (pendiente de validaci贸n de profesores)', () => {
  it('metadatos', () => {
    expect(u34.id).toBe('u34');
    expect(u34.level).toBe('intermediate');
    expect(u34.requires).toEqual(['u10']);
    expect(u34.description.length).toBeGreaterThan(20);
    expect(u34.lessons).toHaveLength(3);
    for (const l of u34.lessons) {
      expect(l.conceptIds?.length, l.id).toBeGreaterThan(0);
      expect(l.practice, l.id).toHaveLength(3);
      expect(l.evaluation, l.id).toHaveLength(3);
    }
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(u34)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  const stepsOf = (l: (typeof u34.lessons)[number]) => [
    ...l.practice.map((step, i) => ({ key: `${l.id}:practice:${i}`, step })),
    ...l.evaluation.map((step, i) => ({ key: `${l.id}:evaluation:${i}`, step })),
  ];
  // Ninguna soluci贸n gana material por b煤squeda: la correcci贸n la da la tablebase (abajo).
  describeLessons([u34], { engine: new Set(u34.lessons.flatMap((l) => stepsOf(l).map((s) => s.key))) });

  const probe = cacheProbe(loadCache(CACHE));
  describe('tablebase (cach茅)', () => {
    for (const l of u34.lessons) {
      for (const { key, step } of stepsOf(l)) {
        it(`${key}: la jugada es la 煤nica que conserva el resultado`, () => {
          expect(checkLine(probe, step.fen, step.solutionUci, step.alt ?? [], 'category'), key).toEqual([]);
          if (step.solutionUci.length === 1) expect(onlyResultErrors(probe, step.fen, step.solutionUci, step.alt ?? []), key).toEqual([]);
        });
      }
      l.explanation.forEach((e, i) => {
        it(`${l.id} explicaci贸n ${i + 1}: la jugada ilustrada es la 煤nica que conserva el resultado`, () => {
          const mv = EXPLAIN_MOVES[`${l.id}:${i}`];
          expect(mv, 'falta la jugada en EXPLAIN_MOVES').toBeDefined();
          expect(onlyResultErrors(probe, e.fen, [mv!])).toEqual([]);
        });
      });
    }
  });

  describe('hechos estructurales que afirman los textos', () => {
    for (const [key, facts] of Object.entries(FACTS)) {
      it(key, () => {
        const [lessonKey, kind, idx] = key.split(':') as [string, string, string];
        const lesson = u34.lessons.find((l) => l.id === lessonKey)!;
        const fen = kind === 'practice' ? lesson.practice[Number(idx)]!.fen : kind === 'evaluation' ? lesson.evaluation[Number(idx)]!.fen : lesson.explanation[Number(kind)]!.fen;
        const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
        // `after:<pred>` se comprueba en la posici髇 tras la jugada de la soluci髇 (o la ilustrada en la explicaci髇).
        const mv = kind === 'practice' ? lesson.practice[Number(idx)]!.solutionUci[0] : kind === 'evaluation' ? lesson.evaluation[Number(idx)]!.solutionUci[0] : EXPLAIN_MOVES[key];
        const after = pos.clone();
        after.play(parseUci(mv!)!);
        for (const [pred, color, square] of facts) {
          const isAfter = pred.startsWith('after:');
          expect(PRED[pred.replace('after:', '')]!(isAfter ? after : pos, color, sqOf(square)), `${pred} ${color} ${square}`).toBe(true);
        }
      });
    }
    it('toda explicaci贸n y todo ejercicio tiene al menos un hecho', () => {
      for (const l of u34.lessons) {
        l.explanation.forEach((_, i) => expect(FACTS[`${l.id}:${i}`], `${l.id}:${i}`).toBeDefined());
        l.practice.forEach((_, i) => expect(FACTS[`${l.id}:practice:${i}`], `${l.id}:practice:${i}`).toBeDefined());
        l.evaluation.forEach((_, i) => expect(FACTS[`${l.id}:evaluation:${i}`], `${l.id}:evaluation:${i}`).toBeDefined());
      }
    });
  });
});
