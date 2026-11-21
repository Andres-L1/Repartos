/**
 * Hechos comprobables por código de las unidades u30 a u33 (método ruso, parte C), con chessops.
 * Cada ejercicio declara un criterio (`Pred`): las jugadas aceptadas del ejercicio (`solutionUci[0]` y `alt`) deben ser
 * EXACTAMENTE las jugadas legales que lo cumplen. Lo usan test/content/unitsRusoC.test.ts y scripts/verify-metodo-ruso-c.mts.
 * La pedagogía no se valida aquí: solo hechos (casillas atacadas, legalidad, estado de la posición, regla del cuadrado).
 */
import { attacks } from 'chessops/attacks';
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSquare, makeUci, parseSquare, squareFile, squareRank } from 'chessops/util';
import type { Color, Role } from 'chessops/types';

export const load = (fen: string): Chess => Chess.fromSetup(parseFen(fen).unwrap()).unwrap();

export interface Mv {
  uci: string;
  role: Role;
  color: Color;
  from: string;
  to: string;
  capture: boolean;
  promotion?: Role;
  castle: boolean;
  /** Posición tras la jugada. */
  after: Chess;
}

const ROLE_OF: Record<string, Role> = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight', P: 'pawn' };

/** Todas las jugadas legales (el enroque como `e1g1`; la coronación en sus cuatro formas). */
export function moves(fen: string): Mv[] {
  const pos = load(fen);
  const out: Mv[] = [];
  for (const [from, dests] of pos.allDests()) {
    const piece = pos.board.get(from)!;
    for (const to of dests) {
      const castle = piece.role === 'king' && pos.board.get(to)?.color === piece.color && pos.board.get(to)?.role === 'rook';
      const toSq = castle ? (to > from ? from + 2 : from - 2) : to;
      const lastRank = squareRank(to) === 0 || squareRank(to) === 7;
      const promos: (Role | undefined)[] = piece.role === 'pawn' && lastRank ? ['queen', 'rook', 'bishop', 'knight'] : [undefined];
      for (const promotion of promos) {
        const mv = { from, to: toSq, ...(promotion ? { promotion } : {}) };
        const after = pos.clone();
        after.play(mv);
        out.push({
          uci: makeUci(mv),
          role: piece.role,
          color: piece.color,
          from: makeSquare(from),
          to: makeSquare(toSq),
          capture: !castle && (pos.board.has(to) || (piece.role === 'pawn' && squareFile(from) !== squareFile(to))),
          ...(promotion ? { promotion } : {}),
          castle,
          after,
        });
      }
    }
  }
  return out;
}

export type Pred = (m: Mv, before: Chess) => boolean;

/** Jugadas legales que cumplen el criterio, ordenadas. */
export const accepted = (fen: string, pred: Pred): string[] => {
  const pos = load(fen);
  return moves(fen).filter((m) => pred(m, pos)).map((m) => m.uci).sort();
};

const sq = (s: string) => parseSquare(s)!;
const list = (s: string | string[]) => (Array.isArray(s) ? s : s.split(','));

/** Casillas atacadas (controladas) por las piezas de un color. */
export function attackedBy(pos: Chess, color: Color): Set<string> {
  const out = new Set<string>();
  for (const [s, p] of pos.board) if (p.color === color) for (const t of attacks(p, s, pos.board.occupied)) out.add(makeSquare(t));
  return out;
}
export const CENTER = ['d4', 'e4', 'd5', 'e5'];
export const centerControlled = (pos: Chess, color: Color): string[] => CENTER.filter((c) => attackedBy(pos, color).has(c));

/** Casillas que ataca la pieza de `square` (con el tablero tal como está). */
export const attacksFrom = (fen: string, square: string): string[] => {
  const pos = load(fen);
  const p = pos.board.get(sq(square))!;
  return [...attacks(p, sq(square), pos.board.occupied)].map(makeSquare).sort();
};

export const HOME: Record<Color, Record<string, Role>> = {
  white: { b1: 'knight', g1: 'knight', c1: 'bishop', f1: 'bishop' },
  black: { b8: 'knight', g8: 'knight', c8: 'bishop', f8: 'bishop' },
};
/** Caballos y alfiles de un color que siguen en su casilla inicial. */
export const undeveloped = (pos: Chess, color: Color): string[] =>
  Object.entries(HOME[color]).filter(([s, r]) => pos.board.get(sq(s))?.role === r && pos.board.get(sq(s))?.color === color).map(([s]) => s);

/** Las torres de `color` que están en su primera fila y se «ven» entre sí (sin piezas entre ellas). */
export function rooksConnected(pos: Chess, color: Color): boolean {
  const rank = color === 'white' ? 0 : 7;
  const rooks = [...pos.board].filter(([s, p]) => p.color === color && p.role === 'rook' && squareRank(s) === rank).map(([s]) => s);
  return rooks.length >= 2 && rooks.some((a) => rooks.some((b) => a !== b && attacks({ color, role: 'rook' }, a, pos.board.occupied).has(b)));
}

/** ¿Se puede enrocar corto o largo (según `side`) en la posición? */
export const canCastle = (pos: Chess, side: 'short' | 'long'): boolean => moves(makeFenOf(pos)).some((m) => m.castle && (m.to[0] === 'g') === (side === 'short'));
const makeFenOf = (pos: Chess) => makeFen(pos.toSetup());

// ---- Constructores de criterios --------------------------------------------------------------------------------

export const P = {
  /** Pieza (K, Q, R, B, N, P) que va a una de las casillas (o a cualquiera); `capture` fija si captura. */
  piece:
    (letter: string, opts: { to?: string | string[]; from?: string | string[]; capture?: boolean } = {}): Pred =>
    (m) =>
      m.role === ROLE_OF[letter] &&
      !m.promotion &&
      (!opts.to || list(opts.to).includes(m.to)) &&
      (!opts.from || list(opts.from).includes(m.from)) &&
      (opts.capture === undefined || m.capture === opts.capture),
  castle: (side?: 'short' | 'long'): Pred => (m) => m.castle && (!side || (m.to[0] === 'g') === (side === 'short')),
  promotion: (opts: { role?: Role; capture?: boolean; notStalemate?: boolean; check?: boolean } = {}): Pred => (m) =>
    !!m.promotion &&
    (!opts.role || m.promotion === opts.role) &&
    (opts.capture === undefined || m.capture === opts.capture) &&
    (!opts.notStalemate || !m.after.isStalemate()) &&
    (!opts.check || m.after.isCheck()),
  /** Tras la jugada, la pieza movida ataca alguna casilla central. */
  attacksCenter: (letter: string): Pred => (m) =>
    m.role === ROLE_OF[letter] && [...attacks(m.after.board.get(sq(m.to))!, sq(m.to), m.after.board.occupied)].some((t) => CENTER.includes(makeSquare(t))),
  /** La pieza movida va a la casilla desde la que ataca más casillas (se calcula entre las suyas legales). */
  maxAttacks:
    (letter: string): Pred =>
    (m, before) => {
      const count = (x: Mv) => attacks(x.after.board.get(sq(x.to))!, sq(x.to), x.after.board.occupied).size();
      const mine = moves(makeFen(before.toSetup())).filter((x) => x.role === ROLE_OF[letter]);
      return m.role === ROLE_OF[letter] && count(m) === Math.max(...mine.map(count));
    },
  /** Mueve la pieza de `from` a una casilla que ninguna pieza rival ataca tras la jugada. */
  safe: (letter: string, from: string): Pred => (m) => m.role === ROLE_OF[letter] && m.from === from && !attackedBy(m.after, m.color === 'white' ? 'black' : 'white').has(m.to),
  /** Tras la jugada, la pieza propia de `square` queda protegida por otra pieza propia. */
  protects: (square: string): Pred => (m) => m.after.board.get(sq(square))?.color === m.color && attackedBy(m.after, m.color).has(square),
  /** Mueve un caballo o alfil desde su casilla inicial (desarrollar). */
  develop: (roles: ('knight' | 'bishop')[] = ['knight', 'bishop']): Pred => (m, before) => (roles as Role[]).includes(m.role) && !!HOME[m.color][m.from] && HOME[m.color][m.from] === m.role && !m.capture && before.turn === m.color,
  /** Mueve un peón a una de las casillas centrales. */
  pawnToCenter: (): Pred => (m) => m.role === 'pawn' && CENTER.includes(m.to),
  /** Tras la jugada, las torres de ese color están conectadas (y antes no lo estaban). */
  connectsRooks: (): Pred => (m, before) => !rooksConnected(before, m.color) && rooksConnected(m.after, m.color),
  /** Tras la jugada, el enroque corto (o largo) del mismo bando es legal (y antes no). */
  enablesCastle: (side: 'short' | 'long'): Pred => (m, before) => {
    const next = m.after.clone();
    next.turn = m.color;
    return !m.castle && !canCastle(before, side) && canCastle(next, side);
  },
  any: (preds: Pred[]): Pred => (m, b) => preds.some((p) => p(m, b)),
  and: (preds: Pred[]): Pred => (m, b) => preds.every((p) => p(m, b)),
};

// ---- Regla del cuadrado ------------------------------------------------------------------------------------------

export interface SquareRule {
  /** Color del bando del peón. */
  pawnColor: Color;
  pawn: string;
  king: string;
  /** Pasos que le faltan al peón para coronar (la casilla inicial cuenta como la tercera fila). */
  n: number;
  /** Distancia del rey rival (en jugadas de rey) a la casilla de coronación. */
  d: number;
  toMove: Color;
  /** Regla del cuadrado: con el turno del rey, entra en el cuadrado si d <= n; con el turno del peón, si d <= n - 1. */
  catches: boolean;
  /**
   * Caso límite (el rey queda a una casilla del cuadrado): el rey puede capturar la dama recién coronada si no está
   * protegida, y la regla del cuadrado por sí sola no lo cubre. Los ejercicios evitan estas posiciones.
   */
  borderline: boolean;
}

/** Peón y rey solitarios (más el rey del bando del peón, que debe estar lejos). */
export function squareRule(fen: string): SquareRule {
  const pos = load(fen);
  const pawns = [...pos.board].filter(([, p]) => p.role === 'pawn');
  if (pawns.length !== 1) throw new Error('la regla del cuadrado exige un solo peón');
  const [pSq, pawn] = pawns[0]!;
  const enemy: Color = pawn.color === 'white' ? 'black' : 'white';
  const kingSq = pos.board.kingOf(enemy)!;
  const promoRank = pawn.color === 'white' ? 7 : 0;
  const steps = Math.abs(promoRank - squareRank(pSq));
  const n = steps === 6 ? 5 : steps;
  const d = Math.max(Math.abs(squareFile(kingSq) - squareFile(pSq)), Math.abs(squareRank(kingSq) - promoRank));
  const defenderMoves = pos.turn === enemy;
  const reach = defenderMoves ? n : n - 1;
  return {
    pawnColor: pawn.color,
    pawn: makeSquare(pSq),
    king: makeSquare(kingSq),
    n,
    d,
    toMove: pos.turn,
    catches: d <= reach,
    borderline: d === reach + 1,
  };
}

/** Casillas del cuadrado del peón hacia el lado del rey rival (con el turno que toque); sirve para resaltarlas. */
export function squareOf(fen: string): string[] {
  const r = squareRule(fen);
  const side = r.toMove === r.pawnColor ? r.n - 1 : r.n;
  const pf = r.pawn.charCodeAt(0) - 97;
  const kf = r.king.charCodeAt(0) - 97;
  const dir = kf >= pf ? 1 : -1;
  const rank0 = Number(r.pawn[1]) - 1;
  const up = r.pawnColor === 'white' ? 1 : -1;
  const startRank = r.toMove === r.pawnColor ? rank0 + up : rank0;
  const out: string[] = [];
  for (let i = 0; i <= side; i++)
    for (let j = 0; j <= side; j++) {
      const f = pf + dir * j;
      const rk = startRank + up * i;
      if (f >= 0 && f <= 7 && rk >= 0 && rk <= 7) out.push(String.fromCharCode(97 + f) + (rk + 1));
    }
  return out.sort();
}
