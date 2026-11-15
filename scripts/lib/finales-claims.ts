/**
 * Afirmaciones de los textos de los finales que no son la propia línea del ejercicio, comprobadas con la tablebase:
 * tras jugar `moves` desde `fen`, el bando al que le toca tiene el resultado `result` (win, draw o loss).
 * Las usan scripts/verify-finales.mts (que pide las posiciones a la API) y test/content/unitsE.test.ts (con la caché).
 */
export interface Claim {
  where: string;
  fen: string;
  moves: string[];
  result: 'win' | 'draw' | 'loss';
}

/** Resultado (para quien mueve) de cada posición de explicación: `uNN.lNN:i`. */
export const EXPLAIN_RESULT: Record<string, Claim['result']> = {
  'u13.l01:0': 'win',
  'u13.l01:1': 'draw',
  'u13.l02:0': 'draw',
  'u13.l02:1': 'loss',
  'u13.l03:0': 'win',
  'u13.l03:1': 'draw',
  'u14.l01:0': 'win',
  'u14.l01:1': 'draw',
  'u14.l02:0': 'draw',
  'u14.l02:1': 'draw',
  'u14.l03:0': 'win',
  'u14.l03:1': 'loss',
};

export const CLAIMS: Claim[] = [
  // u13.l01
  { where: 'u13.l01 expl. 2: Ke4', fen: '8/8/8/5k2/P7/8/8/7K b - - 0 1', moves: ['f5e4'], result: 'draw' },
  { where: 'u13.l01 expl. 2: Ke5', fen: '8/8/8/5k2/P7/8/8/7K b - - 0 1', moves: ['f5e5'], result: 'draw' },
  { where: 'u13.l01 expl. 2: Ke6', fen: '8/8/8/5k2/P7/8/8/7K b - - 0 1', moves: ['f5e6'], result: 'draw' },
  { where: 'u13.l01 práct. 1: si a3, Kc3', fen: '8/8/8/4K3/p7/8/8/7k w - - 0 1', moves: ['e5d4', 'a4a3', 'd4c3'], result: 'draw' },
  { where: 'u13.l01 práct. 1: si a2, Kb2', fen: '8/8/8/4K3/p7/8/8/7k w - - 0 1', moves: ['e5d4', 'a4a3', 'd4c3', 'a3a2', 'c3b2'], result: 'draw' },
  { where: 'u13.l01 práct. 1: Kd5 a3', fen: '8/8/8/4K3/p7/8/8/7k w - - 0 1', moves: ['e5d5', 'a4a3'], result: 'loss' },
  { where: 'u13.l01 práct. 2: espera y Kd4', fen: '8/8/8/7p/2K5/8/8/k7 b - - 0 1', moves: ['a1a2', 'c4d4'], result: 'draw' },
  { where: 'u13.l01 eval. 1: h5 Ke5', fen: '8/8/8/8/7P/2k5/8/K7 b - - 0 1', moves: ['c3d4', 'h4h5', 'd4e5'], result: 'draw' },
  { where: 'u13.l01 eval. 1: Kd3 h5', fen: '8/8/8/8/7P/2k5/8/K7 b - - 0 1', moves: ['c3d3', 'h4h5'], result: 'loss' },
  { where: 'u13.l01 eval. 2: espera y Kd4', fen: 'k7/8/8/2K5/6p1/8/8/8 b - - 0 1', moves: ['a8b8', 'c5d4'], result: 'draw' },
  { where: 'u13.l01 eval. 3: Réti, carrera', fen: '7K/8/k1P5/7p/8/8/8/8 w - - 0 1', moves: ['h8g7', 'h5h4', 'g7f6', 'h4h3', 'f6e7', 'h3h2', 'c6c7'], result: 'draw' },
  { where: 'u13.l01 eval. 3: Kh7', fen: '7K/8/k1P5/7p/8/8/8/8 w - - 0 1', moves: ['h8h7'], result: 'win' },
  // u13.l02
  { where: 'u13.l02 expl. 2: Kd7 Kf6', fen: '8/4k3/8/4K3/4P3/8/8/8 b - - 0 1', moves: ['e7d7', 'e5f6'], result: 'loss' },
  { where: 'u13.l02 expl. 2: Kf7 Kd6', fen: '8/4k3/8/4K3/4P3/8/8/8 b - - 0 1', moves: ['e7f7', 'e5d6'], result: 'loss' },
  // u13.l03
  { where: 'u13.l03 práct. 1: d5', fen: '3k4/8/8/2K5/3P4/8/8/8 w - - 0 1', moves: ['d4d5'], result: 'draw' },
  { where: 'u13.l03 práct. 3: Ke8 Kg7', fen: '8/4k3/6K1/8/7P/8/8/8 b - - 0 1', moves: ['e7e8', 'g6g7'], result: 'loss' },
  { where: 'u13.l03 eval. 1: Kf5 Kf7', fen: '5k2/8/8/6K1/5P2/8/8/8 w - - 0 1', moves: ['g5f5', 'f8f7'], result: 'draw' },
  // u14.l01
  { where: 'u14.l01 expl. 2: Kc5', fen: '7r/8/8/1k6/4P3/4K3/8/R7 b - - 0 1', moves: ['b5c5'], result: 'draw' },
  { where: 'u14.l01 expl. 2: Kc6', fen: '7r/8/8/1k6/4P3/4K3/8/R7 b - - 0 1', moves: ['b5c6'], result: 'draw' },
];
