/**
 * Ayuda para escribir las FEN de u20-u24 sin errores: `fen('Ke1 Ra1 ke8', 'w')`.
 * Mayúscula = blancas, minúscula = negras; letra de pieza en inglés (K, Q, R, B, N, P) y casilla.
 * Las FEN resultantes se validan con chessops en test/content/unitsRusoA.test.ts.
 */
export function fen(pieces: string, turn: 'w' | 'b' = 'w', castling = '-'): string {
  const board: string[][] = Array.from({ length: 8 }, () => Array<string>(8).fill(''));
  for (const p of pieces.split(/\s+/).filter(Boolean)) {
    const file = p.charCodeAt(1) - 97;
    const rank = Number(p[2]) - 1;
    board[7 - rank]![file] = p[0]!;
  }
  const rows = board.map((r) => {
    let s = '';
    let n = 0;
    for (const c of r) {
      if (c === '') n++;
      else {
        if (n) s += n;
        n = 0;
        s += c;
      }
    }
    return s + (n ? n : '');
  });
  return `${rows.join('/')} ${turn} ${castling} - 0 1`;
}
