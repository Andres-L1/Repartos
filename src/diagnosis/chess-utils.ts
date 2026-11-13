import type { Board } from 'chessops/board';
import { Chess, normalizeMove } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import type { Color, Role, Square } from 'chessops/types';
import { makeSquare, opposite, parseUci } from 'chessops/util';
import type { AnalyzedMove } from '../types.js';

export const VALUE: Record<Role, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

const NAME: Record<Role, string> = {
  pawn: 'peón',
  knight: 'caballo',
  bishop: 'alfil',
  rook: 'torre',
  queen: 'dama',
  king: 'rey',
};
const FEMININE: Record<Role, boolean> = {
  pawn: false,
  knight: false,
  bishop: false,
  rook: true,
  queen: true,
  king: false,
};

export const sq = (s: Square): string => makeSquare(s);
export const roleName = (r: Role): string => NAME[r];
/** "el caballo", "la torre" */
export const withArticle = (r: Role): string => `${FEMININE[r] ? 'la' : 'el'} ${NAME[r]}`;
/** "el caballo en f3", "la dama en d5" */
export const describe = (r: Role, s: Square): string => `${withArticle(r)} en ${makeSquare(s)}`;
export const colorName = (c: Color): string => (c === 'white' ? 'las blancas' : 'las negras');
/**
 * Notación de jugadas: la de Lichess (SAN con letras inglesas: N, B, R, Q, K; ej. Nf3, Qxd5+).
 * Se mantiene como punto único por si algún día se ofrece otra notación.
 */
export const sanEs = (san: string): string => san;
export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export interface Step {
  uci: string;
  san: string;
  color: Color;
  role: Role;
  from: Square;
  to: Square;
  captured?: { role: Role; square: Square };
  promotion: boolean;
  /** Posición tras la jugada. */
  pos: Chess;
}

export function loadPosition(fen: string): Chess | null {
  try {
    const setup = parseFen(fen);
    if (setup.isErr) return null;
    const pos = Chess.fromSetup(setup.value);
    return pos.isErr ? null : pos.value;
  } catch {
    return null;
  }
}

/** Reproduce una línea UCI y devuelve solo el prefijo de jugadas legales. */
export function playLine(start: Chess, ucis: string[], max = 12): Step[] {
  const steps: Step[] = [];
  let pos = start;
  for (const uci of ucis.slice(0, max)) {
    const parsed = parseUci(uci);
    if (!parsed) break;
    const move = normalizeMove(pos, parsed);
    if (!pos.isLegal(move)) break;
    if (!('from' in move)) break;
    const piece = pos.board.get(move.from);
    if (!piece) break;
    const target = pos.board.get(move.to);
    let captured: Step['captured'];
    if (target && target.color !== piece.color) captured = { role: target.role, square: move.to };
    else if (piece.role === 'pawn' && !target && (move.from & 7) !== (move.to & 7)) {
      const csq = piece.color === 'white' ? move.to - 8 : move.to + 8;
      const cp = pos.board.get(csq);
      if (cp) captured = { role: cp.role, square: csq };
    }
    const san = sanEs(makeSan(pos, move));
    const next = pos.clone();
    next.play(move);
    steps.push({
      uci,
      san,
      color: piece.color,
      role: piece.role,
      from: move.from,
      to: move.to,
      captured,
      promotion: 'promotion' in move && move.promotion !== undefined,
      pos: next,
    });
    pos = next;
  }
  return steps;
}

export function materialOf(board: Board, color: Color): number {
  let total = 0;
  for (const [, p] of board) if (p.color === color) total += VALUE[p.role];
  return total;
}

/** Balance material (color menos rival) en piezas (1/3/3/5/9). */
export function balance(board: Board, color: Color): number {
  return materialOf(board, color) - materialOf(board, opposite(color));
}

/**
 * Pérdida material neta (en peones) para `me` al reproducir `steps` desde `start`,
 * medida justo después de la última captura/promoción dentro de `maxPlies`.
 */
export function settledLoss(start: Chess, steps: Step[], me: Color, maxPlies: number): number {
  let last = -1;
  for (let i = 0; i < Math.min(steps.length, maxPlies); i++) {
    const s = steps[i]!;
    if (s.captured || s.promotion) last = i;
  }
  if (last < 0) return 0;
  return balance(start.board, me) - balance(steps[last]!.pos.board, me);
}

/** ¿Puede el bando que mueve en `pos` capturar legalmente en `square`? */
export function canCaptureOn(pos: Chess, square: Square): boolean {
  for (const [, dests] of pos.allDests()) if (dests.has(square)) return true;
  return false;
}

export interface PinInfo {
  pinner: Square;
  pinnerRole: Role;
  pinned: Square;
  pinnedRole: Role;
  behind: Square;
  behindRole: Role;
  absolute: boolean;
}

const ORTHO: Array<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const DIAG: Array<[number, number]> = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

/** Clavadas (absolutas o relativas a pieza mayor) contra las piezas de `defender`. */
export function findPins(pos: Chess, defender: Color): PinInfo[] {
  const attacker = opposite(defender);
  const pins: PinInfo[] = [];
  for (const [from, piece] of pos.board) {
    if (piece.color !== attacker) continue;
    let dirs: Array<[number, number]>;
    if (piece.role === 'rook') dirs = ORTHO;
    else if (piece.role === 'bishop') dirs = DIAG;
    else if (piece.role === 'queen') dirs = [...ORTHO, ...DIAG];
    else continue;
    for (const [df, dr] of dirs) {
      let f = (from & 7) + df;
      let r = (from >> 3) + dr;
      let first: Square | undefined;
      while (f >= 0 && f < 8 && r >= 0 && r < 8) {
        const s = r * 8 + f;
        const p = pos.board.get(s);
        if (p) {
          if (first === undefined) {
            if (p.color !== defender || p.role === 'king') break;
            first = s;
          } else {
            if (p.color === defender) {
              const x = pos.board.get(first)!;
              if (p.role === 'king' || VALUE[p.role] > VALUE[x.role]) {
                pins.push({
                  pinner: from,
                  pinnerRole: piece.role,
                  pinned: first,
                  pinnedRole: x.role,
                  behind: s,
                  behindRole: p.role,
                  absolute: p.role === 'king',
                });
              }
            }
            break;
          }
        }
        f += df;
        r += dr;
      }
    }
  }
  return pins;
}

export interface Ctx {
  move: AnalyzedMove;
  me: Color;
  opp: Color;
  pos0: Chess;
  pos1: Chess;
  /** La jugada realizada, reproducida desde pos0. */
  played: Step;
  /** pvAfter reproducido (prefijo legal) desde pos1. */
  after: Step[];
}

/** Construye el contexto verificando que fenAfter es realmente fenBefore + uci. */
export function buildCtx(move: AnalyzedMove): Ctx | null {
  const pos0 = loadPosition(move.fenBefore);
  const pos1 = loadPosition(move.fenAfter);
  if (!pos0 || !pos1) return null;
  if (pos0.turn !== move.color || pos1.turn === move.color) return null;
  const played = playLine(pos0, [move.uci], 1)[0];
  if (!played) return null;
  const b = played.pos.board;
  if (b.occupied.diff(pos1.board.occupied).nonEmpty() || b.white.diff(pos1.board.white).nonEmpty()) return null;
  const after = playLine(pos1, move.pvAfter);
  return { move, me: move.color, opp: opposite(move.color), pos0, pos1, played, after };
}

/** Pérdida material neta (en peones) de la jugada realizada + las primeras `plies` jugadas de pvAfter, desde fenBefore. */
export function lossOver(ctx: Ctx, plies: number): number {
  return settledLoss(ctx.pos0, [ctx.played, ...ctx.after], ctx.me, plies + 1);
}

/** Copia de `pos` con el turno cedido al bando contrario (sin casilla de captura al paso). Null si no es válida. */
export function withTurnFlipped(pos: Chess): Chess | null {
  try {
    const setup = pos.toSetup();
    setup.turn = opposite(pos.turn);
    setup.epSquare = undefined;
    const r = Chess.fromSetup(setup);
    return r.isErr ? null : r.value;
  } catch {
    return null;
  }
}

/**
 * Amenaza previa: ¿ya podía el rival hacer esa misma secuencia de capturas (`ucis`) desde la posición
 * ANTES de la jugada del alumno, cediéndole el turno? Devuelve las jugadas reproducidas o null.
 */
export function replayAsThreat(pos0: Chess, ucis: string[]): Step[] | null {
  const flipped = withTurnFlipped(pos0);
  if (!flipped) return null;
  const steps = playLine(flipped, ucis, ucis.length);
  return steps.length === ucis.length ? steps : null;
}
