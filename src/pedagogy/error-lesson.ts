import type { Chess } from 'chessops/chess';
import type { Role } from 'chessops/types';
import { makeSquare, parseSquare } from 'chessops/util';
import { canCaptureOn, findPins, loadPosition, playLine } from '../diagnosis/chess-utils.js';
import type { KeyError } from '../review/types.js';
import type { Level } from '../types.js';
import { sanIn } from './explain.js';
import { BEST, PAUSE, lossInPieces, ruleFor, whyFor } from './review-copy.js';

export interface LessonArrow {
  from: string;
  to: string;
  tone: 'bad' | 'good';
}

/**
 * Mini lección de un error clave, en 5 momentos: (1) la posición antes de la jugada (fenBefore),
 * (2) una pausa opcional en la que el alumno toca una casilla, (3) qué pasó, (4) por qué importa y
 * (5) qué debía hacer, con la jugada mejor y la regla de una frase.
 */
export interface ErrorLesson {
  gameId: string;
  ply: number;
  conceptId: string;
  fenBefore: string;
  yourMoveSan: string;
  /** Solo existe si de la evidencia sale una casilla comprobable y única; si no, la interfaz se la salta. */
  pause?: { question: string; correctSquares: string[] };
  happened: { text: string; arrows: LessonArrow[]; circles: string[] };
  why: string;
  best: { uci: string; san: string; text: string };
  rule: string;
}

type Pause = ErrorLesson['pause'];

const isLow = (level: Level): boolean => level === 'beginner' || level === 'initiation';

/** El hecho verificado; en niveles bajos el material se dice en piezas, no en peones. */
function happenedText(fact: string, level: Level): string {
  if (!isLow(level)) return fact;
  return fact.replace(/(\d+) peones? de material/g, (_m, n: string) => lossInPieces(Number(n) * 100));
}

const arrow = (uci: string, tone: LessonArrow['tone']): LessonArrow => ({ from: uci.slice(0, 2), to: uci.slice(2, 4), tone });

function pieceAt(pos: Chess | null, square: string): { role: Role; color: string } | undefined {
  const s = parseSquare(square);
  return pos && s !== undefined ? pos.board.get(s) : undefined;
}

/** Casillas desde las que el bando que mueve en `pos` puede capturar legalmente en `square`. */
function capturersOn(pos: Chess, square: string): string[] {
  const target = parseSquare(square);
  if (target === undefined) return [];
  const out: string[] = [];
  for (const [from, dests] of pos.allDests()) if (dests.has(target)) out.push(makeSquare(from));
  return out;
}

/** Piezas (no rey) del bando que NO mueve en `pos` que el rival puede capturar sin recaptura posible. */
function freeCaptures(pos: Chess): Set<string> {
  const victims = pos.board[pos.turn === 'white' ? 'black' : 'white'];
  const out = new Set<string>();
  for (const [from, dests] of pos.allDests()) {
    for (const to of dests.intersect(victims)) {
      if (pos.board.get(to)?.role === 'king') continue;
      const next = pos.clone();
      const pawn = pos.board.get(from)?.role === 'pawn';
      const lastRank = to >> 3 === 0 || to >> 3 === 7;
      next.play(pawn && lastRank ? { from, to, promotion: 'queen' } : { from, to });
      if (!canCaptureOn(next, to)) out.add(makeSquare(to));
    }
  }
  return out;
}

const only = (list: string[], square: string): boolean => list.length === 1 && list[0] === square;

/**
 * Pregunta de la pausa según el tipo de error. La respuesta siempre es una casilla de evidence.squares y
 * se comprueba que sea la única correcta en el tablero; si no se puede garantizar, no hay pausa.
 */
function buildPause(err: KeyError, pos0: Chess | null, pos1: Chess | null): Pause {
  const { move, diagnosis: d } = err;
  const sq = d.evidence.squares;
  const pc = d.evidence.pieces;
  const san = move.san;
  const from = move.uci.slice(0, 2);
  const dest = move.uci.slice(2, 4);
  const mine = (square: string, role?: string) => {
    const p = pieceAt(pos0, square);
    return !!p && p.color === move.color && (role === undefined || p.role === role);
  };
  if (!pos1) return undefined;

  switch (d.type) {
    case 'hanging_piece': {
      const [victim, attacker] = sq;
      const role = pc[0];
      if (!victim || !attacker || !role) return undefined;
      if (dest === victim) {
        // La pieza colgada es la que acaba de moverse: ¿quién se la come?
        if (!only(capturersOn(pos1, victim), attacker)) return undefined;
        return { question: PAUSE.hangingMoved(san, role, victim), correctSquares: [attacker] };
      }
      if (!mine(victim, role)) return undefined;
      const free = freeCaptures(pos1);
      if (free.size !== 1 || !free.has(victim)) return undefined;
      return { question: PAUSE.hangingStill(san), correctSquares: [victim] };
    }
    case 'bad_exchange': {
      const [square, first] = sq;
      if (!square || !first) return undefined;
      // El cambio lo empieza tu captura: la casilla clave (quién recaptura) no está en la evidencia.
      if (first === from) return undefined;
      if (dest === square) {
        const role = pieceAt(pos1, square)?.role;
        if (!role || !only(capturersOn(pos1, square), first)) return undefined;
        return { question: PAUSE.exchangeMoved(san, role, square), correctSquares: [first] };
      }
      if (!mine(square)) return undefined;
      return { question: PAUSE.exchangeStill(san), correctSquares: [square] };
    }
    case 'fork': {
      const [forkSquare] = sq;
      const forker = pc[0];
      if (!forkSquare || !forker) return undefined;
      return { question: PAUSE.fork(san, forker), correctSquares: [forkSquare] };
    }
    case 'pin': {
      const [pinner, pinned, behind] = sq;
      const pinnedRole = pc[1];
      const behindRole = pc[2];
      if (!pinner || !pinned || !behind || !pinnedRole || !behindRole) return undefined;
      // La clavada debe existir ya tras tu jugada, la pieza clavada debe estar en el tablero inicial
      // y ser la única pieza tuya clavada.
      const pins = findPins(pos1, move.color);
      const same = pins.some((p) => makeSquare(p.pinner) === pinner && makeSquare(p.pinned) === pinned && makeSquare(p.behind) === behind);
      const pinnedSquares = new Set(pins.map((p) => p.pinned));
      if (!same || pinnedSquares.size !== 1 || !mine(pinned, pinnedRole)) return undefined;
      return { question: PAUSE.pin(san, behindRole), correctSquares: [pinned] };
    }
    case 'mate_threat': {
      const [mFrom, mTo] = sq;
      const ref = d.evidence.refutationUci;
      if (!mFrom || !mTo || !ref) return undefined;
      if (sanIn(move.fenBefore, ref) !== undefined) {
        // Mate propio desaprovechado: la jugada de la evidencia es tuya, desde la posición inicial.
        if (!pos0 || !mine(mFrom)) return undefined;
        const after = playLine(pos0, [ref], 1)[0];
        const question = after?.pos.isCheckmate() ? PAUSE.mateMissed1() : PAUSE.mateMissedN();
        return { question, correctSquares: [mFrom] };
      }
      // Mate del rival: solo si es en una jugada (la jugada de mate es la refutación misma).
      const mater = pc[0];
      if (!mater || !ref.startsWith(mFrom + mTo)) return undefined;
      return { question: PAUSE.mateAllowed(san, mater), correctSquares: [mTo] };
    }
    case 'discovered_attack': {
      const [, blocker, , target] = sq;
      const targetRole = pc[2];
      if (!blocker || !target || !targetRole) return undefined;
      return { question: PAUSE.discovered(san, targetRole), correctSquares: [blocker] };
    }
    default:
      return undefined;
  }
}

/** Casillas que se marcan con un círculo en «qué pasó» (siempre de evidence.squares). */
function circlesFor(err: KeyError): string[] {
  const sq = err.diagnosis.evidence.squares;
  switch (err.diagnosis.type) {
    case 'hanging_piece':
    case 'bad_exchange':
      return sq.slice(0, 1);
    case 'fork':
      return sq.slice(1);
    case 'pin':
      return sq.slice(1, 2);
    case 'mate_threat':
      return sq.slice(2, 3);
    case 'discovered_attack':
      return sq.slice(3, 4);
    default:
      return [];
  }
}

export function buildErrorLesson(err: KeyError, level: Level): ErrorLesson {
  const { move, diagnosis: d } = err;
  const conceptId = d.conceptIds[0] ?? `tactics.${d.type}`;
  const pos0 = loadPosition(move.fenBefore);
  const pos1 = loadPosition(move.fenAfter);

  const bestSan = sanIn(move.fenBefore, move.bestUci) ?? move.bestSan;
  const ref = d.evidence.refutationUci;
  const missedMate = d.type === 'mate_threat' && ref === move.bestUci;
  const bestText = bestSan.endsWith('#') ? BEST.mate1(bestSan) : missedMate ? BEST.mateN(bestSan) : BEST.plain(bestSan);

  const arrows: LessonArrow[] = [arrow(move.uci, 'bad')];
  // La jugada del rival que castiga el error (si es suya: en un mate desaprovechado es la jugada mejor).
  if (ref && ref !== move.bestUci && sanIn(move.fenAfter, ref) !== undefined) arrows.push(arrow(ref, 'bad'));
  arrows.push(arrow(move.bestUci, 'good'));

  const pause = buildPause(err, pos0, pos1);
  return {
    gameId: err.gameId,
    ply: move.ply,
    conceptId,
    fenBefore: move.fenBefore,
    yourMoveSan: move.san,
    ...(pause ? { pause } : {}),
    happened: { text: happenedText(d.fact, level), arrows, circles: circlesFor(err) },
    why: whyFor(conceptId),
    best: { uci: move.bestUci, san: bestSan, text: bestText },
    rule: ruleFor(conceptId),
  };
}
