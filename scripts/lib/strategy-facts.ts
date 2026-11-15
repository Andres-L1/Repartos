/**
 * Hechos de los textos de estrategia (u16) comprobables con código (chessops). El motor no valida pedagogía: cada
 * frase de valoración de un texto de u16 se limita a uno de estos hechos, y aquí se verifica en la posición real.
 * Las usan test/content/unitsF.test.ts y el diseño (docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md).
 */
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { parseSquare, parseUci, squareFile, squareRank } from 'chessops/util';

export type Fact =
  /** La columna no tiene peones de ningún bando (antes de la jugada). */
  | { kind: 'openFile'; file: string }
  /** Tras la jugada, la torre del que mueve está en su séptima fila y el rey rival en su octava o hay un peón rival en la séptima. */
  | { kind: 'seventh'; square: string }
  /** Tras la jugada, el caballo de `square` está protegido por un peón propio y ningún peón rival puede atacarlo nunca. */
  | { kind: 'outpost'; square: string }
  /** El peón rival de `square` no tiene peones propios en las columnas vecinas (peón aislado). */
  | { kind: 'isolated'; square: string }
  /** La torre de `square` queda en la columna `file` y no hay ninguna pieza entre ella y la última fila rival (columna libre). */
  | { kind: 'clearFile'; square: string };

const load = (fen: string) => Chess.fromSetup(parseFen(fen).unwrap()).unwrap();

export function checkFact(fen: string, firstMove: string, f: Fact): boolean {
  const pos = load(fen);
  const me = pos.turn;
  const m = parseUci(firstMove)!;
  const after = pos.clone();
  after.play(m);
  switch (f.kind) {
    case 'openFile': {
      const file = f.file.charCodeAt(0) - 97;
      for (const [sq, p] of pos.board) if (p.role === 'pawn' && squareFile(sq) === file) return false;
      return true;
    }
    case 'seventh': {
      const sq = parseSquare(f.square)!;
      const p = after.board.get(sq);
      if (p?.role !== 'rook' || p.color !== me) return false;
      const rel = (s: number) => (me === 'white' ? squareRank(s) : 7 - squareRank(s));
      if (rel(sq) !== 6) return false;
      for (const [s, q] of after.board) {
        if (q.color === me) continue;
        if (q.role === 'king' && rel(s) === 7) return true;
        if (q.role === 'pawn' && rel(s) === 6) return true;
      }
      return false;
    }
    case 'outpost': {
      const sq = parseSquare(f.square)!;
      const p = after.board.get(sq);
      if (p?.role !== 'knight' || p.color !== me) return false;
      const dir = me === 'white' ? 1 : -1;
      const file = squareFile(sq);
      const rank = squareRank(sq);
      let protectedByPawn = false;
      for (const [s, q] of after.board) {
        if (q.role !== 'pawn') continue;
        const df = Math.abs(squareFile(s) - file);
        if (q.color === me && df === 1 && squareRank(s) === rank - dir) protectedByPawn = true;
        // un peón rival puede atacar la casilla si está en columna vecina y todavía por delante (desde su punto de vista)
        if (q.color !== me && df === 1 && (squareRank(s) - rank) * dir > 0) return false;
      }
      return protectedByPawn;
    }
    case 'isolated': {
      const sq = parseSquare(f.square)!;
      const p = pos.board.get(sq);
      if (p?.role !== 'pawn' || p.color === me) return false;
      for (const [s, q] of pos.board) if (q.role === 'pawn' && q.color === p.color && Math.abs(squareFile(s) - squareFile(sq)) === 1) return false;
      return true;
    }
    case 'clearFile': {
      const sq = parseSquare(f.square)!;
      const p = after.board.get(sq);
      if (p?.role !== 'rook' || p.color !== me) return false;
      const dir = me === 'white' ? 1 : -1;
      for (let r = squareRank(sq) + dir; r >= 0 && r <= 7; r += dir) if (after.board.has(squareFile(sq) + 8 * r)) return false;
      return true;
    }
  }
}

/** Hecho que sustenta el texto de un ejercicio de estrategia, según su concepto y su solución. */
export function factFor(conceptId: string, uci: string): Fact {
  if (conceptId === 'strategy.open_file') return { kind: 'openFile', file: uci[2]! };
  if (conceptId === 'strategy.seventh_rank') return { kind: 'seventh', square: uci.slice(2, 4) };
  return { kind: 'outpost', square: uci.slice(2, 4) };
}

/** Primera jugada que ilustra cada posición de explicación de u16 (`uNN.lNN:i`). */
export const EXPLAIN_MOVE: Record<string, string> = {
  'u16.l01:0': 'e1d1',
  'u16.l01:1': 'f1d1',
  'u16.l02:0': 'e1e7',
  'u16.l02:1': 'e1e7',
  'u16.l03:0': 'b4d5',
  'u16.l03:1': 'b4d5',
};
