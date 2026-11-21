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

const sqOf = (s: string) => parseSquare(s)!;
/** Color de la casilla: a1 es oscura. */
const colorOfSq = (s: string): 'dark' | 'light' => ((sqOf(s) & 7) + (sqOf(s) >> 3)) % 2 === 0 ? 'dark' : 'light';
/** Capturas legales de la pieza en `from`, en UCI. */
const capturesOf = (pos: Chess, from: string): string[] =>
  legalMoves(pos)
    .filter((m) => (m as { from: number }).from === sqOf(from) && pos.board.get(m.to) !== undefined)
    .map(makeUci)
    .sort();
/** Tras la jugada, el rival puede capturar en la casilla de destino. */
const recapturable = (pos: Chess, uci: string): boolean => {
  const m = legalMoves(pos).find((x) => makeUci(x) === uci)!;
  const after = playMove(pos, m);
  return legalMoves(after).some((x) => x.to === m.to);
};
const bishopFacts = {
  /** Las casillas marcadas son exactamente las de destino de la pieza; y son N. */
  destsCount:
    (from: string, n: number): Fact =>
    (pos, e) => {
      squaresAreDestsOf(from)(pos, e);
      expect(e.squares?.length).toBe(n);
    },
  /** Las capturas de la pieza en `from` son exactamente estas, y las casillas marcadas también. */
  captures:
    (from: string, ucisExpected: string[]): Fact =>
    (pos, e) => {
      expect(capturesOf(pos, from)).toEqual([...ucisExpected].sort());
      expect([...(e.squares ?? [])].sort()).toEqual(ucisExpected.map((u) => u.slice(2)).sort());
    },
};

export const FACTS: Record<string, Fact> = {
  'u25.l01:0': isMate,
  'u25.l01:1': checkWithOnly(['a8a7']),
  'u25.l02:0': mateAfter('h1h8'),
  'u25.l02:1': mateInN(2, 'e5e6'),
  'u25.l03:0': mateAfter('b1b8'),
  'u25.l03:1': mateInN(2, 'b1b7'),
  'u26.l01:0': bishopFacts.destsCount('d4', 13),
  'u26.l01:1': bishopFacts.destsCount('d4', 10),
  'u26.l02:0': bishopFacts.captures('d4', ['d4f6']),
  'u26.l02:1': bishopFacts.captures('d4', ['d4e5']),
  'u26.l03:0': (pos, e) => {
    squaresAreDestsOf('c1')(pos, e);
    expect(colorOfSq('c1')).toBe('dark');
    expect(colorOfSq('f1')).toBe('light');
    for (const s of e.squares ?? []) expect(colorOfSq(s), s).toBe('dark');
  },
  'u26.l03:1': (pos, e) => {
    bishopFacts.captures('d3', ['d3a6', 'd3g6'])(pos, e);
    expect(recapturable(pos, 'd3a6')).toBe(true); // el caballo está protegido
    expect(recapturable(pos, 'd3g6')).toBe(false); // la torre está colgada
  },
};

/** Pasos de captura segura: la solución no se puede recapturar y toda otra captura legal sí. */
export const SAFE_CAPTURE = new Set<string>([
  'u26.l02:practice:0',
  'u26.l02:evaluation:0',
  'u26.l02:evaluation:1',
  'u26.l02:evaluation:2',
  'u26.l03:practice:0',
  'u26.l03:practice:1',
  'u26.l03:practice:2',
  'u26.l03:evaluation:0',
  'u26.l03:evaluation:1',
  'u26.l03:evaluation:2',
]);
export const safeCaptureErrors = (pos: Chess, solution: string): string[] => {
  const errors: string[] = [];
  if (recapturable(pos, solution)) errors.push(`${solution}: se puede recapturar`);
  for (const m of legalMoves(pos)) {
    const u = makeUci(m);
    if (u !== solution && pos.board.get(m.to) !== undefined && !recapturable(pos, u)) errors.push(`${u}: otra captura también es gratis`);
  }
  return errors;
};

/** Hechos de color de casilla que afirman los textos de un ejercicio (casilla, color). */
export const SQUARE_COLORS: Record<string, [string, 'dark' | 'light'][]> = {
  'u26.l03:practice:2': [
    ['f1', 'light'],
    ['d6', 'dark'],
    ['c4', 'light'],
  ],
  'u26.l03:evaluation:1': [
    ['d3', 'light'],
    ['d6', 'dark'],
    ['h7', 'light'],
  ],
};
export { colorOfSq };
export { isMate, checkWithOnly, mateAfter, mateInN, squaresAreDestsOf, mateIn };
