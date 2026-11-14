import { describe, expect, it } from 'vitest';
import { parseUci } from 'chessops/util';
import { LESSONS } from '../../src/content/index.js';
import { EXERCISES } from '../../src/pedagogy/exercises.js';
import { mirrorExercise } from '../../src/pedagogy/mirror.js';
import { isExpectedMove } from '../../src/shared/moves.js';
import { playLine, rankMoves } from '../pedagogy/helpers.js';

/** Todos los ejercicios con solución: lecciones (práctica y evaluación), banco y espejos del banco. */
const ALL = [
  ...LESSONS.flatMap((l) => [...l.practice, ...l.evaluation].map((s, i) => ({ id: `${l.id}.${i}`, ...s }))),
  ...EXERCISES.flatMap((e) => [e, mirrorExercise(e)]).map((e) => ({ ...e, wrongByMove: undefined as Record<string, string> | undefined })),
];

describe('soluciones alternativas (alt)', () => {
  it('hay alternativas donde la revisión de 2026-11-14 las verificó con Stockfish', () => {
    const withAlt = ALL.filter((s) => s.alt?.length).map((s) => s.id);
    expect(withAlt.length).toBeGreaterThanOrEqual(8);
    expect(withAlt).toContain('ex.fork.03');
    expect(withAlt).toContain('ex.fork.03.m');
  });

  for (const s of ALL.filter((x) => x.alt?.length)) {
    describe(s.id, () => {
      const last = s.solutionUci.length - 1;
      const before = playLine(s.fen, s.solutionUci.slice(0, last));
      const want = s.solutionUci[last]!;
      const wantMates = playLine(s.fen, s.solutionUci).isCheckmate();

      it('cada alternativa es legal, distinta de la solución y no figura como error', () => {
        for (const a of s.alt!) {
          expect(a, a).not.toBe(want);
          expect(before.isLegal(parseUci(a)!), a).toBe(true);
          expect(s.wrongByMove?.[a], a).toBeUndefined();
        }
      });

      it('cada alternativa cumple lo mismo: mate si la solución es mate, nunca ahogado ni pérdida de material', () => {
        const fenBefore = s.solutionUci.length === 1 ? s.fen : null;
        const ranked = fenBefore ? rankMoves(fenBefore, 3) : [];
        // chessops escribe el enroque como rey sobre torre (e1h1); el contenido, como rey a destino (e1g1)
        const castle: Record<string, string> = { e1h1: 'e1g1', e1a1: 'e1c1', e8h8: 'e8g8', e8a8: 'e8c8' };
        const score = (u: string) => ranked.find((r) => (castle[r.uci] ?? r.uci) === u)!.score;
        for (const a of s.alt!) {
          const after = playLine(s.fen, [...s.solutionUci.slice(0, last), a]);
          if (wantMates) expect(after.isCheckmate(), a).toBe(true);
          expect(after.isStalemate(), a).toBe(false);
          // búsqueda de material a 3 medias jugadas: la alternativa no gana menos que la solución
          if (fenBefore) expect(score(a), a).toBeGreaterThanOrEqual(score(want) - 50);
        }
      });

      it('la corrección compartida acepta las alternativas solo en la última jugada', () => {
        for (const a of s.alt!) {
          expect(isExpectedMove(s.fen, s.solutionUci, last, a, s.alt), a).toBe(true);
          expect(isExpectedMove(s.fen, s.solutionUci, last, a), `${a} sin alt`).toBe(false);
        }
      });
    });
  }
});

describe('isExpectedMove', () => {
  const MATE_FEN = '7k/5K2/8/8/8/8/6Q1/8 w - - 0 1'; // u03.l04: cinco mates distintos
  it('si la solución da mate, vale cualquier mate; una jugada que no mata o ahoga, no', () => {
    for (const u of ['g2h2', 'g2h1', 'g2h3', 'g2g7', 'g2g8']) expect(isExpectedMove(MATE_FEN, ['g2h2'], 0, u), u).toBe(true);
    expect(isExpectedMove(MATE_FEN, ['g2h2'], 0, 'g2g6')).toBe(false); // ahogado
    expect(isExpectedMove(MATE_FEN, ['g2h2'], 0, 'g2g3')).toBe(false);
  });

  it('mate en la segunda jugada de una línea (u04.l04): vale otro mate', () => {
    const line = ['d1g1', 'h3h4', 'g1h2'];
    expect(isExpectedMove('8/8/8/5K2/8/7k/8/3Q4 w - - 0 1', line, 2, 'g1g4')).toBe(true);
    expect(isExpectedMove('8/8/8/5K2/8/7k/8/3Q4 w - - 0 1', line, 2, 'g1g2')).toBe(false);
  });

  it('enroque como rey sobre torre; una alternativa ilegal o fuera de la última jugada no vale', () => {
    const fen = 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 2 5';
    expect(isExpectedMove(fen, ['e1g1'], 0, 'e1h1')).toBe(true);
    expect(isExpectedMove(fen, ['e1g1'], 0, 'a2a3', ['a2a5'])).toBe(false);
    expect(isExpectedMove(fen, ['e1g1', 'e8g8', 'a2a3'], 0, 'h2h3', ['h2h3'])).toBe(false);
  });
});
