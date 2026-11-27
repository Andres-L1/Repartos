import { Chess } from 'chessops/chess';
import { makeFen } from 'chessops/fen';
import { makeUci } from 'chessops';
import { parseSan } from 'chessops/san';
import type { PracticeStep, Unit } from '../schema.js';

/**
 * Unidad 37 · Ideas de apertura por color (basic, 800-1100 Elo). Pendiente de validación de profesores.
 * Todas las posiciones salen de líneas de src/openings/openings.json (cada `line` es prefijo de una línea del libro; el nombre es el de
 * la línea más corta que pasa por ella). Cada ejercicio pide una clase de jugada (peón central, desarrollo o enroque).
 * Verificación (`npx tsx scripts/verify-u37.mts`, Stockfish 16, profundidad 18): la solución es la mejor jugada de la posición,
 * las demás de su clase quedan >= 16 cp por debajo, y cada jugada de `wrongByMove` queda >= 30 cp por debajo.
 */
export interface Spec {
  /** Línea del libro en SAN, la última jugada es la solución. */
  line: string;
  /** Nombre del libro para esa línea. */
  name: string;
  kind: 'center' | 'develop' | 'castle';
  why: string;
  wrong?: Record<string, 'queen' | 'twice'>;
}

const KIND = {
  center: {
    ask: 'Mueve un peón central (columna d o e).',
    hint: 'Los peones centrales ocupan casillas del centro y abren camino a las piezas.',
    wrong: 'No es la mejor jugada de peón central en esta posición. El enunciado pide un peón de la columna d o e: elige el que apoye o libere más piezas.',
  },
  develop: {
    ask: 'Desarrolla un caballo o un alfil que aún esté en su casilla inicial.',
    hint: 'Saca una pieza que aún no se haya movido y que mire hacia el centro.',
    wrong: 'El enunciado pide sacar un caballo o un alfil que aún no se ha movido, y solo una opción es la mejor aquí. Fíjate en qué casillas controla la pieza.',
  },
  castle: {
    ask: 'Pon al rey a salvo: enroca.',
    hint: 'El rey sale del centro hacia la esquina, junto a una torre.',
    wrong: 'Hay que enrocar: el rey se mueve dos casillas hacia la torre del flanco de rey.',
  },
} as const;

const WRONG = {
  queen: 'Mueves la dama cuando aún quedan piezas por sacar. Stockfish (profundidad 18) la valora al menos 0,3 peones peor que la jugada del libro.',
  twice: 'Mueves otra vez una pieza que ya había salido. Stockfish (profundidad 18) la valora al menos 0,3 peones peor que la jugada del libro.',
} as const;

const pgn = (sans: string[]) => sans.map((s, i) => (i % 2 === 0 ? `${i / 2 + 1}.${s}` : s)).join(' ');

/** Posición antes de la última jugada de `line` y la jugada en UCI (enroque como e1g1). */
export function parseLine(line: string) {
  const sans = line.split(' ');
  const last = sans.pop()!;
  const pos = Chess.default();
  for (const s of sans) pos.play(parseSan(pos, s)!);
  const fen = makeFen(pos.toSetup());
  const m = parseSan(pos, last)!;
  let uci = makeUci(m);
  if (last === 'O-O') uci = uci.slice(0, 2) + (pos.turn === 'white' ? 'g1' : 'g8');
  return { fen, uci, sans, last, color: pos.turn };
}

export const fenBefore = (line: string) => parseLine(line).fen;

function ex(s: Spec): PracticeStep {
  const { fen, uci, sans, last, color } = parseLine(s.line);
  const k = KIND[s.kind];
  const wrongByMove = s.wrong ? Object.fromEntries(Object.entries(s.wrong).map(([u, w]) => [u, WRONG[w]])) : undefined;
  return {
    fen,
    prompt: `Juegan ${color === 'white' ? 'blancas' : 'negras'}. Línea: ${pgn(sans)}. ${k.ask}`,
    solutionUci: [uci],
    hint: k.hint,
    explanationCorrect: `Correcto: ${last}. ${s.why} Es también la mejor jugada de la posición para Stockfish (profundidad 18). Nombre en el libro de aperturas: «${s.name}».`,
    explanationWrong: k.wrong,
    ...(wrongByMove ? { wrongByMove } : {}),
  };
}

/** Los ejercicios de cada lección, también usados por scripts/verify-u37.mts. */
export const SPECS: Record<'l01' | 'l02', Spec[]> = {
  l01: [
    { line: 'e4 e5 Nf3 Nc6 Bc4 Bc5 Nc3 Nf6 O-O O-O d3', name: 'Italian Game: Giuoco Pianissimo', kind: 'center', why: 'El peón de d3 apoya el peón de e4 y el alfil de c4, y abre la diagonal del alfil de c1.', wrong: { d1e1: 'queen', c4b5: 'twice' } },
    { line: 'e4 e5 Nf3 Nc6 d4 exd4', name: 'Scotch Game', kind: 'center', why: 'El peón de e5 captura el peón blanco de d4 y Negras se queda con un peón menos del centro rival.', wrong: { d8f6: 'queen', d8e7: 'queen' } },
    { line: 'e4 e6 d4 d5', name: 'French Defense', kind: 'center', why: 'El peón de d5 ocupa una casilla central y ataca el peón de e4.', wrong: { d8e7: 'queen' } },
    { line: 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4', name: "Petrov's Defense: Classical Attack", kind: 'center', why: 'El peón de d4 ocupa una casilla central, controla c5 y e5 y deja salir al alfil de c1.', wrong: { f3d4: 'twice', f3g1: 'twice' } },
    { line: 'e4 e5 Nf3 Nc6 d4 exd4 Bc4 Bc5 O-O d6', name: 'Scotch Game: Scotch Gambit, Cochrane-Anderssen Variation', kind: 'center', why: 'El peón de d6 protege el alfil de c5 y abre el camino al alfil de c8.', wrong: { c6a5: 'twice', d8e7: 'queen' } },
    { line: 'e4 e5 Nf3', name: "King's Knight Opening", kind: 'develop', why: 'El caballo sale de g1 hacia el centro y ataca el peón de e5.', wrong: { d1h5: 'queen', d1g4: 'queen' } },
  ],
  l02: [
    { line: 'e4 e5 Nf3 Nc6 Bc4 Bc5 Nc3 Nf6 O-O O-O', name: 'Italian Game: Giuoco Pianissimo', kind: 'castle', why: 'El rey negro sale de la columna e: pasa a g8 y la torre a f8.', wrong: { c5e7: 'twice', c6d4: 'twice' } },
    { line: 'e4 e5 Nf3 Nc6 Bc4 Bc5 Nc3 Nf6', name: 'Four Knights Game: Italian Variation', kind: 'develop', why: 'El caballo sale de g8, controla d5 y ataca el peón de e4.', wrong: { c5e7: 'twice', c6d4: 'twice' } },
    { line: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O', name: 'Ruy Lopez: Closed', kind: 'castle', why: 'El rey negro sale de la columna e: pasa a g8 y la torre a f8.', wrong: { f6g8: 'twice' } },
    { line: 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3', name: "Petrov's Defense: Classical Attack, Marshall Variation", kind: 'develop', why: 'El alfil sale de f1 y ataca el caballo de e4.', wrong: { f3d2: 'twice', f3g1: 'twice' } },
    { line: 'e4 e5 Nf3 d6 d4 Nd7 Bc4 c6 O-O Be7', name: 'Philidor Defense: Hanham Variation, Steiner Variation', kind: 'develop', why: 'El alfil sale de f8 y protege el peón de d6.', wrong: { d7b6: 'twice', d8a5: 'queen' } },
    { line: 'd4 d5 c4 e6 Nf3 Nf6 Nc3 Nc6 Bg5 Be7 e3 O-O', name: "Queen's Gambit Declined", kind: 'castle', why: 'El rey negro sale de la columna e: pasa a g8 y la torre a f8.' },
  ],
};

const e = (k: keyof typeof SPECS) => SPECS[k].map(ex);

export const unit: Unit = {
  id: 'u37',
  order: 19,
  title: 'Ideas de apertura por color',
  description:
    'Tres ideas de apertura (peón central, desarrollo y enroque) en líneas reales del libro de aperturas, con blancas y con negras. Cada ejercicio parte de una línea con nombre y pide una jugada de esa idea.',
  level: 'basic',
  requires: ['u33'],
  lessons: [
    {
      id: 'u37.l01',
      unitId: 'u37',
      title: 'Peón central y primera pieza',
      objective: 'Elegir el peón central que apoya a las piezas y sacar la primera pieza, en líneas del libro de aperturas, con blancas y con negras.',
      conceptIds: ['strategy.open_file'],
      intro:
        'Los peones de las columnas d y e ocupan o controlan casillas del centro. Cuando se mueven, también abren el camino a los alfiles y a la dama. También hay que sacar piezas menores de casa. Aquí practicas esas ideas en líneas que están en el libro de aperturas; cada enunciado dice qué tipo de jugada hay que hacer.',
      explanation: [
        {
          fen: fenBefore('e4 e6 d4 d5'),
          text: 'Línea French Defense. Blancas ocupan e4 y d4 con peones: el de e4 controla d5 y f5, el de d4 controla c5 y e5. Negras responden con un peón central.',
          squares: ['e4', 'd4', 'd5'],
          arrows: [['d7', 'd5']],
        },
        {
          fen: fenBefore('e4 e5 Nf3 Nc6 Bc4 Bc5 Nc3 Nf6 O-O O-O d3'),
          text: 'Si Blancas juega el peón a d3, apoya el peón de e4 y el alfil de c4, y deja libre la diagonal del alfil de c1. Un peón central bien elegido ayuda a varias piezas a la vez.',
          squares: ['d3', 'e4', 'c4'],
          arrows: [['d2', 'd3']],
        },
      ],
      practice: e('l01').slice(0, 3),
      evaluation: e('l01').slice(3),
    },
    {
      id: 'u37.l02',
      unitId: 'u37',
      title: 'Desarrollar piezas y enrocar',
      objective: 'Sacar el caballo o el alfil que aún está en casa y enrocar cuando la línea lo permite, en líneas reales del libro.',
      conceptIds: ['strategy.open_file'],
      intro:
        'Desarrollar es sacar las piezas menores de su casilla inicial: fuera de casa controlan más casillas. Enrocar saca al rey de la columna e y acerca una torre al centro; se hace con una sola jugada, moviendo el rey dos casillas hacia la torre. Cada enunciado dice qué tipo de jugada hay que hacer.',
      explanation: [
        {
          fen: fenBefore('e4 e5 Nf3'),
          text: 'Tras 1.e4 e5 el caballo de g1 sigue en casa. Desde f3 ataca el peón de e5 y controla d4. Es el tipo de jugada que pide el enunciado: sacar una pieza menor.',
          squares: ['g1', 'f3', 'e5'],
          arrows: [['g1', 'f3']],
        },
        {
          fen: fenBefore('e4 e5 Nf3 Nc6 Bc4 Bc5 Nc3 Nf6 O-O O-O'),
          text: 'Blancas ya ha enrocado. Negras tiene el rey en e8 y la torre en h8, con las casillas f8 y g8 libres: puede enrocar. El rey irá a g8 y la torre a f8.',
          squares: ['e8', 'h8', 'g8', 'f8'],
          arrows: [['e8', 'g8'], ['h8', 'f8']],
        },
      ],
      practice: e('l02').slice(0, 3),
      evaluation: e('l02').slice(3),
    },
  ],
};
