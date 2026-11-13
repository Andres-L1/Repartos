import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { makeUci, parseUci } from 'chessops/util';
import type { Move, Role } from 'chessops/types';

const VALUE: Record<Role, number> = { pawn: 100, knight: 300, bishop: 300, rook: 500, queen: 900, king: 0 };
const MATE = 100000;

export function load(fen: string): Chess {
  const setup = parseFen(fen).unwrap();
  return Chess.fromSetup(setup).unwrap();
}

export function legalMoves(pos: Chess): Move[] {
  const out: Move[] = [];
  for (const [from, dests] of pos.allDests()) {
    for (const to of dests) {
      const piece = pos.board.get(from)!;
      const lastRank = to >> 3 === 0 || to >> 3 === 7;
      if (piece.role === 'pawn' && lastRank) out.push({ from, to, promotion: 'queen' });
      else out.push({ from, to });
    }
  }
  return out;
}

function material(pos: Chess): number {
  let s = 0;
  for (const [sq, p] of pos.board) {
    void sq;
    s += (p.color === 'white' ? 1 : -1) * VALUE[p.role];
  }
  return s;
}

/** Evaluación (punto de vista del bando que mueve) con búsqueda de capturas. */
function quiesce(pos: Chess, alpha: number, beta: number, ply: number): number {
  if (pos.isCheckmate()) return -MATE + ply;
  if (pos.isStalemate()) return 0;
  const sign = pos.turn === 'white' ? 1 : -1;
  let best = sign * material(pos);
  if (best >= beta) return best;
  alpha = Math.max(alpha, best);
  for (const m of legalMoves(pos)) {
    if (!pos.board.get(m.to) ) continue;
    const next = pos.clone();
    next.play(m);
    const v = -quiesce(next, -beta, -alpha, ply + 1);
    if (v > best) best = v;
    alpha = Math.max(alpha, v);
    if (alpha >= beta) break;
  }
  return best;
}

function search(pos: Chess, depth: number, alpha: number, beta: number, ply: number): number {
  if (pos.isCheckmate()) return -MATE + ply;
  if (pos.isStalemate()) return 0;
  if (depth === 0) return quiesce(pos, alpha, beta, ply);
  let best = -Infinity;
  for (const m of legalMoves(pos)) {
    const next = pos.clone();
    next.play(m);
    const v = -search(next, depth - 1, -beta, -alpha, ply + 1);
    if (v > best) best = v;
    alpha = Math.max(alpha, v);
    if (alpha >= beta) break;
  }
  return best;
}

/** Puntúa cada jugada legal (centipeones, desde quien mueve), ordenadas de mejor a peor. */
export function rankMoves(fen: string, depth = 3): { uci: string; score: number }[] {
  const pos = load(fen);
  const res = legalMoves(pos).map((m) => {
    const next = pos.clone();
    next.play(m);
    return { uci: makeUci(m), score: -search(next, depth - 1, -Infinity, Infinity, 1) };
  });
  return res.sort((a, b) => b.score - a.score);
}

export function playLine(fen: string, ucis: string[]): Chess {
  const pos = load(fen);
  for (const u of ucis) {
    const m = parseUci(u);
    if (!m) throw new Error(`UCI inválido: ${u}`);
    if (!pos.isLegal(m)) throw new Error(`Jugada ilegal ${u} en ${pos.turn}`);
    pos.play(m);
  }
  return pos;
}

/** Casillas de piezas del bando que mueve clavadas de forma absoluta contra su rey. */
export function pinnedPieces(pos: Chess): number[] {
  const { blockers } = pos.ctx();
  return [...blockers].filter((sq) => pos.board.get(sq)?.color === pos.turn);
}

export function playMove(pos: Chess, m: Move): Chess {
  const next = pos.clone();
  next.play(m);
  return next;
}
