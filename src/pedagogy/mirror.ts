/**
 * Versión espejo de un ejercicio: colores cambiados y tablero volteado de arriba abajo (las columnas no cambian).
 * La posición es la misma para quien juega, pero con el otro color. Sirve para tener ejercicios de negras sin
 * escribir contenido nuevo; no toca EXERCISES.
 */
import type { Exercise } from '../types.js';

const swapCase = (s: string) => [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('');
const flipRank = (r: string) => String(9 - Number(r));

export function mirrorFen(fen: string): string {
  const [board, turn, castling, ep, ...rest] = fen.split(' ');
  const rows = board!.split('/').reverse().map(swapCase).join('/');
  const castle = castling === '-' ? '-' : [...swapCase(castling!)].sort((a, b) => 'KQkq'.indexOf(a) - 'KQkq'.indexOf(b)).join('');
  const epSq = ep === '-' || !ep ? '-' : ep[0]! + flipRank(ep[1]!);
  return [rows, turn === 'w' ? 'b' : 'w', castle, epSq, ...rest].join(' ');
}

export const mirrorUci = (uci: string): string => uci[0]! + flipRank(uci[1]!) + uci[2]! + flipRank(uci[3]!) + uci.slice(4);

const COLOR = { blanc: 'negr', negr: 'blanc' } as const;
/** Cambia blanco/negra/... (con su género y número) y voltea las casillas citadas (d5 -> d4). */
export function mirrorText(text: string): string {
  return text
    .replace(/\b(blanc|negr)(o|a|os|as)\b/gi, (_, stem: string, end: string) => {
      const to = COLOR[stem.toLowerCase() as keyof typeof COLOR];
      return (stem[0] === stem[0]!.toUpperCase() ? to[0]!.toUpperCase() + to.slice(1) : to) + end;
    })
    .replace(/\b([a-h])([1-8])\b/g, (_, f: string, r: string) => f + flipRank(r));
}

export function mirrorExercise(ex: Exercise): Exercise {
  return {
    ...ex,
    id: `${ex.id}.m`,
    fen: mirrorFen(ex.fen),
    prompt: mirrorText(ex.prompt),
    solutionUci: ex.solutionUci.map(mirrorUci),
    ...(ex.hint ? { hint: mirrorText(ex.hint) } : {}),
  };
}
