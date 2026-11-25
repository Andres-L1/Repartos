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
  'u15.l01:0': 'win',
  'u15.l01:1': 'win',
  'u15.l02:0': 'draw',
  'u15.l02:1': 'draw',
  'u15.l03:0': 'draw',
  'u15.l03:1': 'win',
  'u18.l01:0': 'win',
  'u18.l01:1': 'draw',
  'u18.l02:0': 'win',
  'u18.l02:1': 'draw',
  'u18.l03:0': 'win',
  'u18.l03:1': 'win',
};

/**
 * Pasos cuyo texto dice «la única jugada» (o «solo esas dos»): las jugadas que conservan el resultado de la posición
 * son EXACTAMENTE la de la línea y, en un ejercicio de una jugada, las de `alt`. Lo comprueban verify-finales.mts y unitsU18.test.ts.
 */
export const ONLY_RESULT: string[] = [
  'u18.l02:practice:0',
  'u18.l02:practice:1',
  'u18.l02:practice:2',
  'u18.l02:evaluation:0',
  'u18.l02:evaluation:1',
  'u18.l02:evaluation:2',
  'u18.l03:practice:0',
  'u18.l03:practice:1',
];

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
  // u15.l01
  { where: 'u15.l01 expl. 1: Ra1', fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1', moves: ['c1a1'], result: 'draw' },
  { where: 'u15.l01 expl. 2: Ka4', fen: '8/1P2k3/8/1K6/3R4/8/8/1r6 w - - 0 1', moves: ['b5a4'], result: 'draw' },
  { where: 'u15.l01 expl. 2: Kc4', fen: '8/1P2k3/8/1K6/3R4/8/8/1r6 w - - 0 1', moves: ['b5c4'], result: 'draw' },
  { where: 'u15.l01 expl. 2: Ka5', fen: '8/1P2k3/8/1K6/3R4/8/8/1r6 w - - 0 1', moves: ['b5a5'], result: 'draw' },
  { where: 'u15.l01 expl. 2: Kc5', fen: '8/1P2k3/8/1K6/3R4/8/8/1r6 w - - 0 1', moves: ['b5c5'], result: 'draw' },
  { where: 'u15.l01 expl. 2: Kc6 gana', fen: '8/1P2k3/8/1K6/3R4/8/8/1r6 w - - 0 1', moves: ['b5c6'], result: 'loss' },
  { where: 'u15.l01 expl. 2: Ka6 gana', fen: '8/1P2k3/8/1K6/3R4/8/8/1r6 w - - 0 1', moves: ['b5a6'], result: 'loss' },
  { where: 'u15.l01 práct. 1: Rc2 pierde la torre', fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1', moves: ['c1c2'], result: 'win' },
  { where: 'u15.l01 práct. 2: Rd3 gana', fen: '1K6/1P2k3/8/8/8/8/r7/3R4 w - - 0 1', moves: ['d1d3'], result: 'loss' },
  { where: 'u15.l01 práct. 2: Rd2 tablas', fen: '1K6/1P2k3/8/8/8/8/r7/3R4 w - - 0 1', moves: ['d1d2'], result: 'draw' },
  // u15.l03
  { where: 'u15.l03 expl. 1: Rg8 pierde', fen: '8/4k3/8/P1K4R/8/6r1/8/8 b - - 0 1', moves: ['g3g8'], result: 'win' },
  { where: 'u15.l03 expl. 2: Kc6 tablas', fen: '7r/8/2k5/8/4P3/4K3/8/R7 w - - 0 1', moves: [], result: 'draw' },
  { where: 'u15.l03 expl. 2: Kd6 tablas', fen: '7r/8/3k4/8/4P3/4K3/8/R7 w - - 0 1', moves: [], result: 'draw' },
  { where: 'u15.l03 expl. 2: Kc5 tablas', fen: '7r/8/8/2k5/4P3/4K3/8/R7 w - - 0 1', moves: [], result: 'draw' },
  // u18
  { where: 'u18.l01 expl. 1: Qf2+ gana', fen: '8/8/8/8/8/7p/7k/4KQ2 w - - 0 1', moves: ['f1f2'], result: 'loss' },
  { where: 'u18.l01 expl. 2: Qg3 tablas', fen: '6Q1/8/8/8/8/8/K6p/7k w - - 0 1', moves: ['g8g3'], result: 'draw' },
  { where: 'u18.l01 expl. 2: con el rey blanco en g3 ganan', fen: '6Q1/8/8/8/8/6K1/7p/7k w - - 0 1', moves: [], result: 'win' },
  { where: 'u18.l02 expl. 1: Be4 gana', fen: '8/1B6/3K2p1/8/5n1P/k7/8/8 w - - 0 1', moves: ['b7e4'], result: 'loss' },
  { where: 'u18.l02 expl. 1: Ke5 gana', fen: '8/1B6/3K2p1/8/5n1P/k7/8/8 w - - 0 1', moves: ['d6e5'], result: 'loss' },
  { where: 'u18.l02 práct. 1: Bd4+ pierde el alfil', fen: '8/2K3B1/3n4/2k2p2/5P2/8/8/8 w - - 0 1', moves: ['g7d4'], result: 'win' },
  { where: 'u18.l02 práct. 1: Bh6 tablas', fen: '8/2K3B1/3n4/2k2p2/5P2/8/8/8 w - - 0 1', moves: ['g7h6'], result: 'draw' },
  { where: 'u18.l02 práct. 2: Bb2 tablas', fen: '5K2/k7/1n6/7p/8/8/6P1/2B5 w - - 0 1', moves: ['c1b2'], result: 'draw' },
  { where: 'u18.l02 práct. 3: Be2 pierde el alfil', fen: '3K4/8/8/1B4Pp/8/6n1/8/4k3 w - - 0 1', moves: ['b5e2'], result: 'win' },
  { where: 'u18.l02 práct. 3: Ba4 tablas', fen: '3K4/8/8/1B4Pp/8/6n1/8/4k3 w - - 0 1', moves: ['b5a4'], result: 'draw' },
  { where: 'u18.l02 eval. 1: Bg4 tablas', fen: '4K3/3B4/1k6/7p/7P/8/8/n7 w - - 0 1', moves: ['d7g4'], result: 'draw' },
  { where: 'u18.l02 eval. 2: Bd2 pierde el alfil', fen: '8/8/5p2/3k4/K7/8/7P/1nB5 w - - 0 1', moves: ['c1d2'], result: 'win' },
  { where: 'u18.l02 eval. 2: Ka5 tablas', fen: '8/8/5p2/3k4/K7/8/7P/1nB5 w - - 0 1', moves: ['a4a5'], result: 'draw' },
  { where: 'u18.l02 eval. 3: Ng3 pierde el caballo', fen: 'k7/2K5/4B1p1/8/8/8/7P/7n b - - 0 1', moves: ['h1g3'], result: 'win' },
  { where: 'u18.l02 eval. 3: g5 pierde', fen: 'k7/2K5/4B1p1/8/8/8/7P/7n b - - 0 1', moves: ['g6g5'], result: 'win' },
  { where: 'u18.l03 expl. 1: Rxe6 gana', fen: '8/3k4/1P2r3/8/8/8/7P/2K1R3 w - - 0 1', moves: ['e1e6'], result: 'loss' },
  { where: 'u18.l03 expl. 1: Rf1 tablas', fen: '8/3k4/1P2r3/8/8/8/7P/2K1R3 w - - 0 1', moves: ['e1f1'], result: 'draw' },
  { where: 'u18.l03 expl. 1: Kc2 pierde la torre', fen: '8/3k4/1P2r3/8/8/8/7P/2K1R3 w - - 0 1', moves: ['c1c2'], result: 'win' },
  { where: 'u18.l03 expl. 2: axb4+ tablas', fen: '3K4/8/1P6/k7/1p6/P7/8/8 w - - 0 1', moves: ['a3b4'], result: 'draw' },
  { where: 'u18.l03 expl. 2: b7 gana', fen: '3K4/8/1P6/k7/1p6/P7/8/8 w - - 0 1', moves: ['b6b7'], result: 'loss' },
  { where: 'u18.l03 expl. 2: Kc7 gana', fen: '3K4/8/1P6/k7/1p6/P7/8/8 w - - 0 1', moves: ['d8c7'], result: 'loss' },
  { where: 'u18.l03 práct. 1: Kd3 tablas', fen: '8/8/5P2/6N1/3K1k2/5n2/3P4/8 w - - 0 1', moves: ['d4d3'], result: 'draw' },
  { where: 'u18.l03 práct. 2: dxc4 tablas', fen: '8/8/8/2P3K1/2pk4/3P4/8/8 w - - 0 1', moves: ['d3c4'], result: 'draw' },
  { where: 'u18.l03 eval. 1: g4 tablas', fen: '1k5K/2n5/4N3/8/P7/6P1/8/8 w - - 0 1', moves: ['g3g4'], result: 'draw' },
  { where: 'u18.l03 eval. 1: a5 tablas', fen: '1k5K/2n5/4N3/8/P7/6P1/8/8 w - - 0 1', moves: ['a4a5'], result: 'draw' },
  { where: 'u18.l03 eval. 2: exf6 tablas', fen: '8/5k2/5p2/4P3/2K5/8/5P2/8 w - - 0 1', moves: ['e5f6'], result: 'draw' },
];
