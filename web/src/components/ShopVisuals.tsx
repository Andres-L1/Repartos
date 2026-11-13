import { createElement } from 'react';
import { boardClass, piecesClass } from '../shop';

/** La ficha de Chedex (logo inclinado con la C): es la moneda. Decorativa; el número y la palabra van al lado. */
export function Coin({ size = 28, className }: { size?: number; className?: string }) {
  return <img className={`coin${className ? ` ${className}` : ''}`} src="/brand/chedex-coin.svg" width={size} height={size} alt="" aria-hidden="true" />;
}

/** Icono propio del protector de racha: un escudo con una llama dentro. */
export function ProtectorArt({ size = 64 }: { size?: number }) {
  return (
    <svg className="protector-art" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path
        d="M32 5l22 8v17c0 14-9.4 24.2-22 28.5C19.400 54.200 10 44 10 30V13z"
        fill="var(--brand-soft)"
        stroke="var(--brand)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M32 18c1 5.200 7.800 8 7.800 14.800a7.800 7.800 0 0 1-15.600 0c0-3 1.400-5 3.200-6.600.3 2.600 1.200 3.800 2.500 4.200C30.300 26.200 30.400 21.600 32 18z"
        fill="var(--brand)"
      />
    </svg>
  );
}

type PieceCode = `${'w' | 'b'}${'K' | 'Q' | 'R' | 'B' | 'N' | 'P'}`;
const ROLE: Record<string, string> = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight', P: 'pawn' };

/** Posiciones de la vista previa: [pieza, columna, fila] en un trozo de 4x4 (fila 0 = arriba). */
const SAMPLE_BOARD: [PieceCode, number, number][] = [
  ['bP', 2, 1],
  ['wN', 1, 2],
  ['wK', 3, 3],
];
const SAMPLE_PIECES: [PieceCode, number, number][] = [
  ['bK', 3, 0],
  ['bR', 0, 0],
  ['bP', 2, 1],
  ['wN', 1, 2],
  ['wB', 2, 3],
  ['wK', 0, 3],
];

/**
 * Un trozo real de tablero (4x4 casillas) con sus piezas: así se ve el tema y así se ve el juego de piezas.
 * Usa las mismas clases y reglas CSS que el tablero de las lecciones.
 */
export function MiniBoard({ board, pieces, focus = 'board', label }: { board: string; pieces: string; focus?: 'board' | 'pieces'; label: string }) {
  const sample = focus === 'pieces' ? SAMPLE_PIECES : SAMPLE_BOARD;
  return (
    <div className={`mini-board ${boardClass(board)} ${piecesClass(pieces)}`} role="img" aria-label={label}>
      <div className="mini-grid cg-wrap">
        {sample.map(([code, x, y]) =>
          createElement('piece', {
            key: `${code}${x}${y}`,
            className: `${ROLE[code[1]!]} ${code[0] === 'w' ? 'white' : 'black'}`,
            style: { left: `${x * 25}%`, top: `${y * 25}%` },
          }),
        )}
      </div>
    </div>
  );
}
