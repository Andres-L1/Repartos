/**
 * Hechos descriptivos de cada posición de u16, calculados con chessops. Los textos de la unidad solo citan casillas y
 * afirmaciones que salen de aquí; test/content/unitsF.test.ts compara cada texto con estos hechos.
 */
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { attacks, knightAttacks, pawnAttacks, rookAttacks } from 'chessops/attacks';
import type { Color, Square } from 'chessops/types';
import { makeSquare, opposite, parseSquare, parseUci, squareFile, squareRank } from 'chessops/util';
import { checkFact } from './strategy-facts.js';

export interface StrategyFacts {
  /** Columna abierta: casillas de la columna, por delante de la torre, en la séptima y octava fila, vacías y que ninguna pieza rival controla. */
  entries: string[];
  /** Desde cada casilla de entrada de la séptima fila: peones rivales de esa fila que la torre atacaría. */
  entryHits: Record<string, string[]>;
  /** Torre que se mueve: casilla de origen y primera pieza que tenía delante en su columna (cadena vacía si estaba libre) con su color. */
  rookFrom: string;
  fromBlocker: string;
  fromBlockerOwn: boolean;
  /** Primera pieza que la torre ve por delante en su columna tras la jugada (cadena vacía si no hay ninguna) y casillas vacías de la séptima y octava fila de esa columna con las piezas rivales que las controlan. */
  fileEnd: string;
  fileGuards: Record<string, string[]>;
  /** Piezas rivales (no el rey) que la torre ataca tras la jugada y las que ninguna pieza rival defiende. */
  rookHits: string[];
  rookHitsLoose: string[];
  /** Quién defiende cada peón de `pawns7`. */
  defenders7: Record<string, string[]>;
  /** Torres rivales que ya están en esa columna. */
  rivalRooksOnFile: string[];
  /** Séptima fila: peones rivales de la séptima que la torre ataca tras la jugada, y los que ninguna pieza rival defiende. */
  pawns7: string[];
  loose7: string[];
  /** Casilla del rey rival y si la torre lo deja sin casillas libres en la séptima fila (propias piezas o la torre las cubren). */
  rivalKing: string;
  kingCutOff: boolean;
  /** Piezas rivales que podrían capturar la torre tras la jugada. */
  rookAttackers: string[];
  /** Casilla de avanzada: peones propios que protegen al caballo; peones rivales de columna vecina ya adelantados (no pueden atacarla). */
  protectors: string[];
  passedPawns: string[];
  /** Piezas y peones rivales que el caballo ataca desde la casilla; piezas que podrían cambiarlo (caballo que la ataca o alfil de su color). */
  knightHits: string[];
  tradeBy: string[];
  /** Alfiles rivales de color de casilla contrario al de la casilla de avanzada: nunca pueden cambiar el caballo. */
  cantTrade: string[];
}

const load = (fen: string) => Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
const sq = (s: Square) => makeSquare(s);
const parseSquareName = (n: string) => parseSquare(n)!;

export function describeStrategy(fen: string, firstMove: string): StrategyFacts {
  const pos = load(fen);
  const me: Color = pos.turn;
  const them = opposite(me);
  const m = parseUci(firstMove)!;
  const from = (m as { from: Square }).from;
  const mover = pos.board.get(from)!;
  const blocker: { sq: string; own: boolean } = { sq: '', own: false };
  if (mover.role === 'rook') {
    const d = me === 'white' ? 1 : -1;
    for (let r = squareRank(from) + d; r >= 0 && r <= 7; r += d) {
      const b = pos.board.get(squareFile(from) + 8 * r);
      if (b) {
        Object.assign(blocker, { sq: makeSquare(squareFile(from) + 8 * r), own: b.color === me });
        break;
      }
    }
  }
  pos.play(m);
  const to = (m as { to: Square }).to;
  const occ = pos.board.occupied;
  const rel = (s: Square) => (me === 'white' ? squareRank(s) : 7 - squareRank(s));
  const dir = me === 'white' ? 1 : -1;
  const f: StrategyFacts = { entries: [], entryHits: {}, fileEnd: '', fileGuards: {}, rookHits: [], rookHitsLoose: [], defenders7: {}, rookFrom: '', fromBlocker: '', fromBlockerOwn: false, rivalKing: '', kingCutOff: false, rivalRooksOnFile: [], pawns7: [], loose7: [], rookAttackers: [], protectors: [], passedPawns: [], knightHits: [], tradeBy: [], cantTrade: [] };
  const defenders = (target: Square, color: Color) => [...pos.board[color]].filter((s) => attacks(pos.board.get(s)!, s, occ).has(target));
  const rivalPawns = pos.board.pawn.intersect(pos.board[them]);
  const piece = pos.board.get(to)!;
  if (piece.role === 'rook') {
    f.rookFrom = sq(from);
    f.fromBlocker = blocker.sq;
    f.fromBlockerOwn = blocker.own;
    const file = squareFile(to);
    for (let r = squareRank(to) + dir; r >= 0 && r <= 7; r += dir) {
      const s = file + 8 * r;
      if (pos.board.has(s)) {
        f.fileEnd = sq(s);
        break;
      }
      if (rel(s) >= 6) {
        const g = defenders(s, them);
        f.fileGuards[sq(s)] = g.map(sq).sort();
        if (g.length === 0) f.entries.push(sq(s));
      }
    }
    const without = occ.without(to);
    for (const e of f.entries) {
      const es = parseSquareName(e);
      if (rel(es) === 6) f.entryHits[e] = [...rookAttacks(es, without).intersect(rivalPawns)].filter((s) => rel(s) === 6).map(sq).sort();
    }
    for (const s of pos.board[them]) if (pos.board.get(s)!.role === 'rook' && squareFile(s) === file) f.rivalRooksOnFile.push(sq(s));
    const hit = rookAttacks(to, occ);
    for (const s of pos.board[them]) {
      if (pos.board.get(s)!.role === 'pawn' && rel(s) === 6 && hit.has(s)) {
        f.pawns7.push(sq(s));
        f.defenders7[sq(s)] = defenders(s, them).map(sq).sort();
        if (defenders(s, them).length === 0) f.loose7.push(sq(s));
      }
      if (pos.board.get(s)!.role !== 'king' && hit.has(s)) {
        f.rookHits.push(sq(s));
        if (defenders(s, them).length === 0) f.rookHitsLoose.push(sq(s));
      }
    }
    f.rookAttackers = defenders(to, them).map(sq).sort();
    const king = pos.board.king.intersect(pos.board[them]).first()!;
    f.rivalKing = sq(king);
    f.kingCutOff = [...attacks({ role: 'king', color: them }, king, occ)].filter((s) => rel(s) === 6).every((s) => pos.board[them].has(s) || hit.has(s));
  } else {
    for (const s of pos.board[me]) if (pos.board.get(s)!.role === 'pawn' && pawnAttacks(me, s).has(to)) f.protectors.push(sq(s));
    for (const s of pos.board[them]) {
      const q = pos.board.get(s)!;
      if (q.role === 'pawn' && Math.abs(squareFile(s) - squareFile(to)) === 1 && (squareRank(s) - squareRank(to)) * dir <= 0) f.passedPawns.push(sq(s));
      if (knightAttacks(to).has(s)) f.knightHits.push(sq(s));
      if (q.role === 'knight' && knightAttacks(s).has(to)) f.tradeBy.push(sq(s));
      if (q.role === 'bishop') ((squareFile(s) + squareRank(s)) % 2 === (squareFile(to) + squareRank(to)) % 2 ? f.tradeBy : f.cantTrade).push(sq(s));
    }
  }
  for (const k of ['cantTrade', 'entries', 'rookHits', 'rookHitsLoose', 'pawns7', 'loose7', 'protectors', 'passedPawns', 'knightHits', 'tradeBy', 'rivalRooksOnFile'] as const) f[k].sort();
  return f;
}

/** Una afirmación sobre la posición que cita un texto de u16. `k` dice cuál; el resto son sus casillas. */
export interface Claim {
  k: 'openFile' | 'blocked' | 'entry' | 'hit' | 'guard' | 'fileEnd' | 'attacks' | 'loose' | 'defendedBy' | 'cutOff' | 'rookSafe' | 'rookHits' | 'rookHitsLoose' | 'protector' | 'noPawns' | 'knightHit' | 'noTrade' | 'cantTrade' | 'trade' | 'kingAt';
  /** Casilla principal. */
  sq?: string;
  /** Casilla de origen (`hit`) o de la pieza que defiende o vigila (`guard`, `defendedBy`). */
  by?: string;
}

/** ¿Es verdadera la afirmación en la posición `fen` tras la primera jugada `uci` del que mueve? */
export function checkClaim(fen: string, uci: string, c: Claim, facts = describeStrategy(fen, uci)): boolean {
  const has = (list: string[], x?: string) => x !== undefined && list.includes(x);
  switch (c.k) {
    case 'openFile': {
      const file = (c.sq ?? '').charCodeAt(0) - 97;
      for (const [s, p] of load(fen).board) if (p.role === 'pawn' && squareFile(s) === file) return false;
      return true;
    }
    case 'blocked': return facts.fromBlocker === c.sq && facts.fromBlockerOwn;
    case 'entry': return has(facts.entries, c.sq);
    case 'hit': return has(facts.entryHits[c.by ?? ''] ?? [], c.sq);
    case 'guard': return has(facts.fileGuards[c.sq ?? ''] ?? [], c.by);
    case 'fileEnd': return facts.fileEnd === c.sq;
    case 'attacks': return has(facts.pawns7, c.sq);
    case 'loose': return has(facts.loose7, c.sq);
    case 'defendedBy': return has(facts.defenders7[c.sq ?? ''] ?? [], c.by);
    case 'cutOff': return facts.kingCutOff;
    case 'rookSafe': return facts.rookAttackers.length === 0;
    case 'rookHits': return has(facts.rookHits, c.sq);
    case 'rookHitsLoose': return has(facts.rookHitsLoose, c.sq);
    case 'protector': return has(facts.protectors, c.sq);
    case 'noPawns': return facts.passedPawns.length === 0 && checkFact(fen, uci, { kind: 'outpost', square: uci.slice(2, 4) });
    case 'knightHit': return has(facts.knightHits, c.sq);
    case 'noTrade': return facts.tradeBy.length === 0;
    case 'cantTrade': return has(facts.cantTrade, c.sq);
    case 'trade': return has(facts.tradeBy, c.sq);
    case 'kingAt': return facts.rivalKing === c.sq;
  }
}
