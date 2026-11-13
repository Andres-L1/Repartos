import { parsePgn, startingPosition } from 'chessops/pgn';
import { parseSan, makeSan } from 'chessops/san';
import { makeFen, parseFen } from 'chessops/fen';
import { makeUci, parseUci } from 'chessops/util';
import { Chess } from 'chessops/chess';
import type { Color } from '../types.js';

export interface ParsedMove {
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  ply: number;
  color: Color;
}

export interface ParsedGame {
  headers: Record<string, string>;
  moves: ParsedMove[];
}

/** Parsea un PGN y devuelve cabeceras y jugadas con FEN antes/después. Lanza Error en español si el PGN es ilegal. */
export function parseGame(pgn: string): ParsedGame {
  const game = parsePgn(pgn)[0];
  if (!game) throw new Error('PGN vacío o no reconocible.');

  const headers: Record<string, string> = {};
  for (const [k, v] of game.headers) headers[k] = v;

  const posResult = startingPosition(game.headers);
  if (posResult.isErr) {
    throw new Error(`Posición inicial inválida en el PGN (cabecera FEN): ${posResult.error.message}`);
  }
  const pos = posResult.unwrap();
  const moves: ParsedMove[] = [];
  let ply = 1;
  for (const node of game.moves.mainline()) {
    const move = parseSan(pos, node.san);
    if (!move) {
      const num = Math.ceil(ply / 2);
      const dots = pos.turn === 'white' ? '.' : '...';
      throw new Error(`Jugada ilegal o ambigua en el PGN: "${node.san}" (jugada ${num}${dots}).`);
    }
    const fenBefore = makeFen(pos.toSetup());
    const color: Color = pos.turn;
    const san = makeSan(pos, move);
    const uci = makeUci(move);
    pos.play(move);
    moves.push({ san, uci, fenBefore, fenAfter: makeFen(pos.toSetup()), ply: ply++, color });
  }
  if (moves.length === 0) throw new Error('El PGN no contiene ninguna jugada.');
  return { headers, moves };
}

/** Convierte una jugada UCI en SAN desde un FEN. Devuelve la propia UCI si no se puede convertir. */
export function uciToSan(fen: string, uci: string): string {
  try {
    const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
    const move = parseUci(uci);
    if (!move) return uci;
    return makeSan(pos, move);
  } catch {
    return uci;
  }
}
