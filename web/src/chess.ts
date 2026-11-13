import { Chess } from 'chessops/chess';
import { parseFen, makeFen } from 'chessops/fen';
import { parseUci, makeSquare, parseSquare, makeUci } from 'chessops';
import { parseSan, makeSan } from 'chessops/san';
import { chessgroundDests } from 'chessops/compat';
import type { Role } from 'chessops';

export function posFromFen(fen: string): Chess {
  const setup = parseFen(fen).unwrap();
  return Chess.fromSetup(setup).unwrap();
}

export type Dests = Map<string, string[]>;

export function legalDests(fen: string): Dests {
  return chessgroundDests(posFromFen(fen)) as Dests;
}

export function turnOf(fen: string): 'white' | 'black' {
  return fen.split(' ')[1] === 'b' ? 'black' : 'white';
}

export function isInCheck(fen: string): boolean {
  return posFromFen(fen).isCheck();
}

/** ¿El movimiento from->to es una promoción de peón? */
export function needsPromotion(fen: string, from: string, to: string): boolean {
  const pos = posFromFen(fen);
  const f = parseSquare(from);
  if (f === undefined) return false;
  const piece = pos.board.get(f);
  if (!piece || piece.role !== 'pawn') return false;
  return to.endsWith('8') || to.endsWith('1');
}

/**
 * Forma canónica del contenido: el enroque se escribe como rey a su casilla final (e1g1, e8c8),
 * no como rey-captura-torre (e1h1). Cualquier otra jugada queda igual.
 */
export function canonicalUci(fen: string, uci: string): string {
  const m = parseUci(uci);
  if (!m || !('from' in m)) return uci;
  const pos = posFromFen(fen);
  const king = pos.board.get(m.from);
  const target = pos.board.get(m.to);
  if (king?.role === 'king' && target?.role === 'rook' && target.color === king.color) {
    const rank = makeSquare(m.from)[1];
    return makeSquare(m.from) + (m.to > m.from ? 'g' : 'c') + rank;
  }
  return uci;
}

/** Aplica una jugada UCI. Devuelve null si es ilegal. */
export function applyUci(fen: string, uci: string): { fen: string; san: string } | null {
  const move = parseUci(uci);
  if (!move) return null;
  const pos = posFromFen(fen);
  if (!pos.isLegal(move)) return null;
  const san = makeSan(pos, move);
  pos.play(move);
  return { fen: makeFen(pos.toSetup()), san };
}

export function sanOfUci(fen: string, uci: string): string {
  return applyUci(fen, uci)?.san ?? uci;
}

export function lastMoveOf(uci: string): [string, string] {
  const m = parseUci(uci);
  if (!m || !('from' in m)) return [uci.slice(0, 2), uci.slice(2, 4)];
  return [makeSquare(m.from), makeSquare(m.to)];
}

const ES_PIECES: Record<string, string> = { C: 'N', A: 'B', T: 'R', D: 'Q', R: 'K' };

/** Interpreta una jugada escrita (SAN en español o inglés, o UCI) y devuelve UCI legal. */
export function parseTypedMove(fen: string, raw: string): string | null {
  const text = raw.trim().replace(/0/g, 'O').replace(/[+#!?]/g, '');
  if (!text) return null;
  const pos = posFromFen(fen);
  const uciMove = /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(text) ? parseUci(text.toLowerCase()) : undefined;
  if (uciMove) return pos.isLegal(uciMove) ? canonicalUci(fen, makeUci(uciMove)) : null;
  const candidates = new Set<string>([text]);
  const first = text[0] ?? '';
  const mapped = ES_PIECES[first];
  if (mapped) candidates.add(mapped + text.slice(1));
  for (const c of [...candidates]) candidates.add(c.replace(/=([CATD])/g, (_, p: string) => '=' + (ES_PIECES[p] ?? p)));
  for (const c of candidates) {
    const m = parseSan(pos, c);
    if (m) return canonicalUci(fen, makeUci(m));
  }
  return null;
}

export const PROMO_ROLES: { role: Role; letter: string; label: string }[] = [
  { role: 'queen', letter: 'q', label: 'Dama' },
  { role: 'rook', letter: 'r', label: 'Torre' },
  { role: 'bishop', letter: 'b', label: 'Alfil' },
  { role: 'knight', letter: 'n', label: 'Caballo' },
];
