import type { PracticeStep, Unit } from '../schema.js';

/**
 * Unidad 36 · Zugzwang, oposición y triangulación (competitivo, 1700-2000 Elo). Pendiente de validación de profesores.
 * Posiciones construidas (no son de partidas), verificadas de forma exacta con la tablebase Syzygy de Lichess
 * (`npx tsx scripts/verify-u36.mts`, caché propia test/fixtures/tablebase/u36.json; test/content/unitsU36.test.ts):
 * en cada jugada del alumno la de la línea es la ÚNICA que conserva el resultado (ganar o tablas), y el rival juega la
 * defensa que más resiste. En las lecciones 2 y 3, tras la jugada del alumno el rival queda en una posición perdida que,
 * con el turno cambiado, solo sería tablas (zugzwang). Las posiciones con peones d5/d6 y las de oposición con peón e4/e5
 * llevan además su versión en espejo (colores cambiados), que la tablebase trata igual.
 * Las posiciones de explicación y las afirmaciones de los textos que no son la línea se comprueban en el test.
 */
/** Ejercicio de una jugada en el que la tablebase da una única jugada que conserva el resultado. */
const one = (
  fen: string,
  uci: string,
  prompt: string,
  hint: string,
  explanationCorrect: string,
  explanationWrong: string,
): PracticeStep => ({ fen, prompt, solutionUci: [uci], hint, explanationCorrect, explanationWrong });

const WIN_WRONG = 'Esa jugada deja escapar la victoria. ';
const LOSE_WRONG = 'Esa jugada pierde la partida. ';

export const unit: Unit = {
  id: 'u36',
  order: 31,
  title: 'Zugzwang, oposición y triangulación',
  description:
    'Finales de peones con pocas piezas: la oposición directa y a distancia, el zugzwang (a quien le toca mover, empeora) y la triangulación, que pierde un tiempo con el rey. Todas las posiciones están comprobadas con tablebase.',
  level: 'competitive',
  requires: ['u18'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u36.l01',
      unitId: 'u36',
      title: 'Oposición directa y oposición a distancia',
      objective: 'Colocar el rey en oposición, directa o a distancia, en el momento exacto en que decide el final de rey y peón contra rey.',
      conceptIds: ['endgame.king_pawn'],
      intro:
        'Dos reyes están en oposición cuando quedan en la misma columna con un número impar de casillas entre ellos y le toca mover al otro bando. Con una casilla de por medio es la oposición directa; con tres, la oposición a distancia. Aquí la tablebase confirma que, en cada posición, hay una sola jugada que conserva el resultado, y es la que coloca el rey en esa oposición.',
      explanation: [
        {
          fen: '8/5k2/8/8/4PK2/8/8/8 w - - 0 1',
          text: 'Juegan blancas. Kf5 deja los reyes en la columna f con f6 en medio y con las negras al turno: oposición directa. Es la única jugada que gana; cualquier otra no gana.',
          squares: ['f5', 'f6', 'f7'],
          arrows: [['f4', 'f5']],
        },
        {
          fen: '2k5/8/8/8/3KP3/8/8/8 b - - 0 1',
          text: 'Juegan negras. Kd8 deja los reyes en la columna d con tres casillas entre ellos (d5, d6 y d7): oposición a distancia. Es la única jugada que salva las tablas; cualquier otra pierde.',
          squares: ['d4', 'd8'],
          arrows: [['c8', 'd8']],
        },
      ],
      practice: [
        one(
          '8/3k4/8/8/3KP3/8/8/8 w - - 0 1',
          'd4d5',
          'Juegan blancas. El rey negro está en d7 y tu peón en e4. Gana la partida.',
          'Pon tu rey en la misma columna que el rey negro, con una casilla entre los dos.',
          'Correcto: Kd5. Los reyes quedan en la columna d con d6 en medio y juegan las negras: oposición directa. Es la única jugada que gana.',
          WIN_WRONG + 'Busca la casilla que te da la oposición directa.',
        ),
        one(
          '8/4k3/8/3K4/4P3/8/8/8 b - - 0 1',
          'e7d7',
          'Juegan negras. El rey blanco está en d5 y su peón en e4. Haz tablas.',
          'Ponte frente al rey blanco, en su misma columna, con una casilla entre los dos.',
          'Correcto: Kd7. Los reyes quedan en la columna d con d6 en medio y juegan las blancas: la oposición es tuya. Es la única jugada que salva las tablas; cualquier otra pierde.',
          LOSE_WRONG + 'Ponte frente al rey blanco, en su misma columna.',
        ),
        one(
          '8/4k3/8/4PK2/8/8/8/8 b - - 0 1',
          'e7f7',
          'Juegan negras. El rey blanco está en f5 y su peón en e5. Haz tablas.',
          'Ponte frente al rey blanco, en su misma columna, con una casilla entre los dos.',
          'Correcto: Kf7. Los reyes quedan en la columna f con f6 en medio y juegan las blancas. Es la única jugada que salva las tablas; cualquier otra pierde.',
          LOSE_WRONG + 'Ponte frente al rey blanco, en su misma columna.',
        ),
      ],
      evaluation: [
        one(
          '4k3/8/8/8/3KP3/8/8/8 b - - 0 1',
          'e8d8',
          'Juegan negras. El rey blanco está en d4 y su peón en e4; los reyes están lejos. Haz tablas.',
          'Busca la oposición a distancia: la misma columna que el rey blanco, con tres casillas entre los dos.',
          'Correcto: Kd8. Los reyes quedan en la columna d con tres casillas entre ellos (d5, d6 y d7): oposición a distancia. Es la única jugada que salva las tablas.',
          LOSE_WRONG + 'Solo una casilla da la oposición a distancia.',
        ),
        one(
          '4k3/8/8/8/4PK2/8/8/8 b - - 0 1',
          'e8f8',
          'Juegan negras. El rey blanco está en f4 y su peón en e4. Haz tablas.',
          'Busca la oposición a distancia: la misma columna que el rey blanco, con tres casillas entre los dos.',
          'Correcto: Kf8. Los reyes quedan en la columna f con tres casillas entre ellos (f5, f6 y f7). Es la única jugada que salva las tablas; cualquier otra pierde.',
          LOSE_WRONG + 'Solo una casilla da la oposición a distancia.',
        ),
        one(
          '8/8/8/4pk2/8/8/8/6K1 w - - 0 1',
          'g1f1',
          'Juegan blancas. El rey negro está en f5 y su peón en e5 (avanza hacia abajo). Haz tablas.',
          'Busca la oposición a distancia: la misma columna que el rey negro, con tres casillas entre los dos.',
          'Correcto: Kf1. Los reyes quedan en la columna f con tres casillas entre ellos (f2, f3 y f4). Es la única jugada que salva las tablas; cualquier otra pierde.',
          LOSE_WRONG + 'Solo una casilla da la oposición a distancia.',
        ),
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u36.l02',
      unitId: 'u36',
      title: 'Zugzwang: a quien le toca mover, empeora',
      objective: 'Reconocer una posición en la que el rival, al tener que mover, lo pierde todo, y llegar a ella con tu jugada.',
      conceptIds: ['endgame.king_pawn'],
      intro:
        'Zugzwang es la situación en la que a un bando le toca mover y cualquier jugada le perjudica. En un final de peones no se puede pasar, y con los peones bloqueados solo mueven los reyes. En estas posiciones, con los peones d5 y d6 bloqueados, la tablebase confirma que una sola jugada del rey lleva al rival a una posición perdida que, con el turno cambiado, solo sería tablas.',
      explanation: [
        {
          fen: '8/1k6/3p4/1K1P4/8/8/8/8 b - - 0 1',
          text: 'Juegan negras y todas sus jugadas pierden: es zugzwang. Los peones están bloqueados y el rey negro tiene que ceder terreno.',
          squares: ['b5', 'b7'],
        },
        {
          fen: '8/1k6/3p4/1K1P4/8/8/8/8 w - - 0 1',
          text: 'La misma posición, pero juegan blancas: solo hay tablas. El turno decide el resultado, y por eso importa llegar a la posición anterior con las negras al turno.',
          squares: ['b5', 'b7'],
        },
      ],
      practice: [
        one(
          '8/1k6/3p4/3P4/1K6/8/8/8 w - - 0 1',
          'b4b5',
          'Juegan blancas. Gana la partida: deja a las negras sin buena jugada.',
          'Pon tu rey frente al rey negro, con una casilla entre los dos.',
          'Correcto: Kb5. Las negras tienen que mover y todas sus jugadas pierden: zugzwang. Con las blancas al turno, esa posición solo sería tablas.',
          WIN_WRONG + 'Busca la posición en la que, al mover, las negras lo pierdan todo.',
        ),
        one(
          '8/5k2/3p4/3P4/5K2/8/8/8 w - - 0 1',
          'f4f5',
          'Juegan blancas. Gana la partida: deja a las negras sin buena jugada.',
          'Pon tu rey frente al rey negro, con una casilla entre los dos.',
          'Correcto: Kf5. Las negras tienen que mover y todas sus jugadas pierden: zugzwang. Con las blancas al turno, esa posición solo sería tablas.',
          WIN_WRONG + 'Busca la posición en la que, al mover, las negras lo pierdan todo.',
        ),
        one(
          '8/8/8/1k6/3p4/3P4/K7/8 b - - 0 1',
          'b5a4',
          'Juegan negras. Gana la partida: deja a las blancas sin buena jugada.',
          'Pon tu rey frente al rey blanco, con una casilla entre los dos.',
          'Correcto: Ka4. Las blancas tienen que mover y todas sus jugadas pierden: zugzwang. Con las negras al turno, esa posición solo sería tablas.',
          WIN_WRONG + 'Busca la posición en la que, al mover, las blancas lo pierdan todo.',
        ),
      ],
      evaluation: [
        one(
          '8/1k6/3p4/3P4/2K5/8/8/8 w - - 0 1',
          'c4b5',
          'Juegan blancas. Gana la partida: deja a las negras sin buena jugada.',
          'Pon tu rey frente al rey negro, con una casilla entre los dos.',
          'Correcto: Kb5. Las negras tienen que mover y todas sus jugadas pierden: zugzwang. Con las blancas al turno, esa posición solo sería tablas.',
          WIN_WRONG + 'Busca la posición en la que, al mover, las negras lo pierdan todo.',
        ),
        one(
          '8/8/8/4k3/3p4/3P4/5K2/8 b - - 0 1',
          'e5f4',
          'Juegan negras. Gana la partida: deja a las blancas sin buena jugada.',
          'Pon tu rey frente al rey blanco, con una casilla entre los dos.',
          'Correcto: Kf4. Las blancas tienen que mover y todas sus jugadas pierden: zugzwang. Con las negras al turno, esa posición solo sería tablas.',
          WIN_WRONG + 'Busca la posición en la que, al mover, las blancas lo pierdan todo.',
        ),
        one(
          '8/8/8/5k2/3p4/3P4/6K1/8 b - - 0 1',
          'f5g4',
          'Juegan negras. Gana la partida: deja a las blancas sin buena jugada.',
          'Pon tu rey frente al rey blanco, con una casilla entre los dos.',
          'Correcto: Kg4. Las blancas tienen que mover y todas sus jugadas pierden: zugzwang. Con las negras al turno, esa posición solo sería tablas.',
          WIN_WRONG + 'Busca la posición en la que, al mover, las blancas lo pierdan todo.',
        ),
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u36.l03',
      unitId: 'u36',
      title: 'Triangulación: perder un tiempo con el rey',
      objective: 'Dar un rodeo de tres casillas con el rey para llegar a la posición de zugzwang con el turno cambiado.',
      conceptIds: ['endgame.king_pawn'],
      intro:
        'A veces la posición de zugzwang existe, pero si el rey va a ella directamente le toca mover al propio bando y solo hay tablas. Como los peones están bloqueados no hay jugada de espera, así que el rey da un rodeo por tres casillas contiguas: pierde un tiempo y llega al mismo sitio con el turno cambiado. En los ejercicios, la tablebase confirma que el camino directo no gana y que el rodeo sí.',
      explanation: [
        {
          fen: '8/4k3/3p4/3P4/5K2/8/8/8 w - - 0 1',
          text: 'Juegan blancas. Kg5 Kf7 Kf5 recorre el triángulo f4, g5, f5 y gana: los reyes quedan en f5 y f7 con las negras al turno, la posición de zugzwang de la lección anterior.',
          squares: ['f4', 'g5', 'f5'],
          arrows: [
            ['f4', 'g5'],
            ['g5', 'f5'],
          ],
        },
        {
          fen: '8/4k3/3p4/3P1K2/8/8/8/8 b - - 0 1',
          text: 'Si las blancas hubieran ido directas a f5, juegan negras y solo hay tablas: Kf7 es su única jugada que no pierde. El camino directo desperdicia la ventaja.',
          squares: ['f5', 'f7'],
        },
      ],
      practice: [
        {
          fen: '4k3/8/3p4/3P4/5K2/8/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Gana la partida: ir directo al rey negro no sirve.',
          solutionUci: ['f4g5', 'e8f7', 'g5f5'],
          hint: 'Pierde un tiempo: da un rodeo con el rey antes de ir frente al rey negro.',
          explanationCorrect:
            'Correcto: Kg5, Kf7 y Kf5. El rey blanco recorre el triángulo f4, g5, f5 y llega a la posición de zugzwang con las negras al turno. Ir directo no gana.',
          explanationWrong: WIN_WRONG + 'Ir directo no sirve: hay que perder un tiempo con el rey.',
        },
        {
          fen: '8/2k5/3p4/3P4/1K6/8/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Gana la partida: ir directo al rey negro no sirve.',
          solutionUci: ['b4a5', 'c7b7', 'a5b5'],
          hint: 'Pierde un tiempo: da un rodeo con el rey antes de ir frente al rey negro.',
          explanationCorrect:
            'Correcto: Ka5, Kb7 y Kb5. El rey blanco recorre el triángulo b4, a5, b5 y llega a la posición de zugzwang con las negras al turno. Ir directo no gana.',
          explanationWrong: WIN_WRONG + 'Ir directo no sirve: hay que perder un tiempo con el rey.',
        },
        {
          fen: '8/8/8/5k2/3p4/3P4/4K3/8 b - - 0 1',
          prompt: 'Juegan negras. Gana la partida: ir directo al rey blanco no sirve.',
          solutionUci: ['f5g4', 'e2f2', 'g4f4'],
          hint: 'Pierde un tiempo: da un rodeo con el rey antes de ir frente al rey blanco.',
          explanationCorrect:
            'Correcto: Kg4, Kf2 y Kf4. El rey negro recorre el triángulo f5, g4, f4 y llega a la posición de zugzwang con las blancas al turno. Ir directo no gana.',
          explanationWrong: WIN_WRONG + 'Ir directo no sirve: hay que perder un tiempo con el rey.',
        },
      ],
      evaluation: [
        {
          fen: '2k5/8/3p4/3P4/1K6/8/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Gana la partida: ir directo al rey negro no sirve.',
          solutionUci: ['b4a5', 'c8b7', 'a5b5'],
          hint: 'Pierde un tiempo: da un rodeo con el rey antes de ir frente al rey negro.',
          explanationCorrect:
            'Correcto: Ka5, Kb7 y Kb5. El rey blanco recorre el triángulo b4, a5, b5 y llega a la posición de zugzwang con las negras al turno. Ir directo no gana.',
          explanationWrong: WIN_WRONG + 'Ir directo no sirve: hay que perder un tiempo con el rey.',
        },
        {
          fen: '8/8/8/5k2/3p4/3P4/8/4K3 b - - 0 1',
          prompt: 'Juegan negras. Gana la partida: ir directo al rey blanco no sirve.',
          solutionUci: ['f5g4', 'e1f2', 'g4f4'],
          hint: 'Pierde un tiempo: da un rodeo con el rey antes de ir frente al rey blanco.',
          explanationCorrect:
            'Correcto: Kg4, Kf2 y Kf4. El rey negro recorre el triángulo f5, g4, f4 y llega a la posición de zugzwang con las blancas al turno. Ir directo no gana.',
          explanationWrong: WIN_WRONG + 'Ir directo no sirve: hay que perder un tiempo con el rey.',
        },
        {
          fen: '8/8/8/1k6/3p4/3P4/2K5/8 b - - 0 1',
          prompt: 'Juegan negras. Gana la partida: ir directo al rey blanco no sirve.',
          solutionUci: ['b5a4', 'c2b2', 'a4b4'],
          hint: 'Pierde un tiempo: da un rodeo con el rey antes de ir frente al rey blanco.',
          explanationCorrect:
            'Correcto: Ka4, Kb2 y Kb4. El rey negro recorre el triángulo b5, a4, b4 y llega a la posición de zugzwang con las blancas al turno. Ir directo no gana.',
          explanationWrong: WIN_WRONG + 'Ir directo no sirve: hay que perder un tiempo con el rey.',
        },
      ],
    },
  ],
};
