import { expect } from 'vitest';
import type { Chess } from 'chessops/chess';
import { makeUci, makeSquare, parseSquare } from 'chessops/util';
import type { Move } from 'chessops/types';
import type { ExplainStep } from '../../src/content/schema.js';
import { legalMoves, playMove } from '../pedagogy/helpers.js';

/** Hechos que afirma el texto de cada explicación, comprobados con chessops (clave `uNN.lNN:índice`). */
type Fact = (pos: Chess, e: ExplainStep) => void;

const ucis = (pos: Chess) => legalMoves(pos).map(makeUci).sort();
const mateIn = (pos: Chess, n: number): Move[] =>
  legalMoves(pos).filter((m) => {
    const q = playMove(pos, m);
    if (q.isCheckmate()) return true;
    if (n === 1 || q.isStalemate() || q.isInsufficientMaterial()) return false;
    const rs = legalMoves(q);
    return rs.length > 0 && rs.every((r) => mateIn(playMove(q, r), n - 1).length > 0);
  });

/** El jugador al turno ya está en jaque mate. */
const isMate: Fact = (pos) => expect(pos.isCheckmate()).toBe(true);
/** Jaque que no es mate: las únicas jugadas legales son estas. */
const checkWithOnly =
  (moves: string[]): Fact =>
  (pos) => {
    expect(pos.isCheck()).toBe(true);
    expect(pos.isCheckmate()).toBe(false);
    expect(ucis(pos)).toEqual(moves.sort());
  };
/** Tras esta jugada hay jaque mate. */
const mateAfter =
  (uci: string): Fact =>
  (pos) => {
    const m = legalMoves(pos).find((x) => makeUci(x) === uci)!;
    expect(m, uci).toBeDefined();
    expect(playMove(pos, m).isCheckmate()).toBe(true);
  };
/** Mate forzado en n con esta primera jugada. */
const mateInN =
  (n: number, uci: string): Fact =>
  (pos) => {
    expect(mateIn(pos, n).map(makeUci)).toContain(uci);
    if (n > 1) expect(mateIn(pos, n - 1)).toEqual([]);
  };
/** Las casillas marcadas son exactamente las del destino legal de la pieza en `from`. */
const squaresAreDestsOf =
  (from: string): Fact =>
  (pos, e) => {
    const dests = [...(pos.dests(parseSquare(from)!) ?? [])].map((s) => makeSquare(s)).sort();
    expect([...(e.squares ?? [])].sort()).toEqual(dests);
  };

export const FACTS: Record<string, Fact> = {
  'u25.l01:0': isMate,
  'u25.l01:1': checkWithOnly(['a8a7']),
  'u25.l02:0': mateAfter('h1h8'),
  'u25.l02:1': mateInN(2, 'e5e6'),
  'u25.l03:0': mateAfter('b1b8'),
  'u25.l03:1': mateInN(2, 'b1b7'),
};
export { isMate, checkWithOnly, mateAfter, mateInN, squaresAreDestsOf, mateIn };
