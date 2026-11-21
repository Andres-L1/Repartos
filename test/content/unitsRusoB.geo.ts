import type { Chess } from 'chessops/chess';
import { attacks } from 'chessops/attacks';
import { SquareSet } from 'chessops/squareSet';
import { makeSquare, parseSquare } from 'chessops/util';
import type { Color } from 'chessops/types';

/** Geometría comprobable por código para los textos del método ruso (sin dependencias de vitest). */

/** Casillas por las que el rey de `color` puede moverse (sin pisar casillas atacadas), a partir de su casilla; sin contar la suya. */
export function kingRegion(pos: Chess, color: Color): string[] {
  const king = pos.board.kingOf(color)!;
  const enemy = color === 'white' ? 'black' : 'white';
  const occ = pos.board.occupied.without(king);
  let attacked = SquareSet.empty();
  for (const sq of pos.board[enemy]) attacked = attacked.union(attacks(pos.board.get(sq)!, sq, occ));
  const seen = new Set<number>([king]);
  const queue = [king];
  while (queue.length) {
    const s = queue.pop()!;
    for (const df of [-1, 0, 1])
      for (const dr of [-1, 0, 1]) {
        const f = (s & 7) + df;
        const r = (s >> 3) + dr;
        if ((df === 0 && dr === 0) || f < 0 || f > 7 || r < 0 || r > 7) continue;
        const t = r * 8 + f;
        if (seen.has(t) || attacked.has(t) || pos.board[color].has(t)) continue;
        seen.add(t);
        queue.push(t);
      }
  }
  seen.delete(king);
  return [...seen].map((x) => makeSquare(x)).sort();
}

/** ¿Están los dos alfiles de `color` en diagonales vecinas (pegadas y del mismo sentido)? */
export function bishopsAdjacent(pos: Chess, color: Color): boolean {
  const bs = [...pos.board[color].intersect(pos.board.bishop)];
  if (bs.length !== 2) return false;
  const [a, b] = bs as [number, number];
  const fr = (s: number) => (s & 7) - (s >> 3);
  const fp = (s: number) => (s & 7) + (s >> 3);
  return Math.abs(fr(a) - fr(b)) === 1 || Math.abs(fp(a) - fp(b)) === 1;
}

/** Distancia de rey (máximo de diferencia de columnas y filas) entre los dos reyes. */
export function kingDistance(pos: Chess): number {
  const w = pos.board.kingOf('white')!;
  const b = pos.board.kingOf('black')!;
  return Math.max(Math.abs((w & 7) - (b & 7)), Math.abs((w >> 3) - (b >> 3)));
}

export const sq = (s: string): number => parseSquare(s)!;
