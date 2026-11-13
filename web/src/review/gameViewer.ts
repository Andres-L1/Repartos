import type { AnalyzedMove } from '../../../src/types';

/**
 * Visor de la partida: navegar jugada a jugada. Posición 0 = inicio (fenBefore de la primera jugada);
 * posición i = tras la jugada i. Funciones puras, sin React.
 */
export interface ViewerState {
  /** Número de jugadas de la partida (las posiciones son count + 1). */
  count: number;
  index: number;
}

export type ViewerAction =
  | { type: 'prev' }
  | { type: 'next' }
  | { type: 'first' }
  | { type: 'last' }
  | { type: 'goto'; index: number };

const clamp = (n: number, count: number): number => Math.min(Math.max(Number.isFinite(n) ? Math.trunc(n) : 0, 0), count);

export function initViewer(count: number, index = 0): ViewerState {
  const c = Math.max(0, count);
  return { count: c, index: clamp(index, c) };
}

export function viewerReducer(state: ViewerState, action: ViewerAction): ViewerState {
  const { count, index } = state;
  switch (action.type) {
    case 'prev':
      return { count, index: clamp(index - 1, count) };
    case 'next':
      return { count, index: clamp(index + 1, count) };
    case 'first':
      return { count, index: 0 };
    case 'last':
      return { count, index: count };
    case 'goto':
      return { count, index: clamp(action.index, count) };
  }
}

/** FEN del tablero en la posición `index` (0 = inicio). */
export function fenAt(moves: AnalyzedMove[], index: number): string | undefined {
  if (moves.length === 0) return undefined;
  const i = clamp(index, moves.length);
  return i === 0 ? moves[0]!.fenBefore : moves[i - 1]!.fenAfter;
}

/** Última jugada hecha para llegar a la posición `index` (undefined en el inicio). */
export function lastMoveAt(moves: AnalyzedMove[], index: number): [string, string] | undefined {
  const m = index > 0 ? moves[clamp(index, moves.length) - 1] : undefined;
  return m ? [m.uci.slice(0, 2), m.uci.slice(2, 4)] : undefined;
}

/** La jugada que llevó a la posición `index`. */
export function moveAt(moves: AnalyzedMove[], index: number): AnalyzedMove | undefined {
  return index > 0 ? moves[clamp(index, moves.length) - 1] : undefined;
}

/** Posición que el alumno tenía delante antes de jugar la jugada `ply` (0 si no existe esa jugada). */
export function indexBeforePly(moves: AnalyzedMove[], ply: number): number {
  const k = moves.findIndex((m) => m.ply === ply);
  return k < 0 ? 0 : k;
}

/** Posición justo después de la jugada `ply` (0 si no existe). */
export function indexOfPly(moves: AnalyzedMove[], ply: number): number {
  const k = moves.findIndex((m) => m.ply === ply);
  return k < 0 ? 0 : k + 1;
}
