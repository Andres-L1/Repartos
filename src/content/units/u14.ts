import type { Unit } from '../schema.js';

/**
 * Unidad 14 · Finales de torre (intermedio, 1100-1400 Elo). Pendiente de validación de profesores.
 * Verificada de forma exacta con la tablebase de Lichess (Syzygy): en cada jugada del alumno se aceptan exactamente
 * las jugadas que conservan el resultado teórico (la de la línea y las de `alt`) (scripts/verify-finales.mts;
 * test/content/unitsE.test.ts con la caché de test/fixtures/tablebase/). Cada paso es de una sola jugada del alumno:
 * en estos finales la tablebase acepta varias jugadas en cuanto se alarga la línea.
 */
export const unit: Unit = {
  id: 'u14',
  order: 21,
  title: 'Finales de torre',
  description:
    'Los finales de torre y peón contra torre: cortar al rey rival con la torre para ganar, y defender con jaques por detrás para hacer tablas. Verás también cómo salir del jaque hacia el peón en la posición de Lucena.',
  level: 'intermediate',
  requires: ['u10'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u14.l01',
      unitId: 'u14',
      title: 'Cortar al rey con la torre',
      objective: 'Usar la torre para cortar al rey rival en una columna y ganar un final de torre y peón contra torre.',
      conceptIds: ['endgame.rook'],
      intro:
        'En los finales de torre, la torre vale más por lo que impide que por lo que captura. Si tu peón avanza y el rey rival está a un lado, coloca la torre en la columna que ese rey tiene que cruzar. Así queda cortado: no puede acercarse al peón ni a tu rey. Es la primera idea para ganar estos finales: cortar primero y avanzar después.',
      explanation: [
        {
          fen: '7r/8/8/1k6/4P3/4K3/8/R7 w - - 0 1',
          text: 'Juegan blancas. El rey negro de b5 está al otro lado de la columna c. Con Rc1, la torre blanca de a1 se coloca en esa columna. El rey negro no puede cruzarla y el rey y el peón blancos avanzan sin que nadie los pare. Es la única jugada que gana.',
          squares: ['c1', 'c5'],
          arrows: [['a1', 'c1']],
        },
        {
          fen: '7r/8/8/1k6/4P3/4K3/8/R7 b - - 0 1',
          text: 'La misma posición, pero juegan negras. Ahora el rey negro llega antes que la torre blanca a la columna c: con Kc5 o Kc6 la cruza y las blancas ya no pueden cortarlo. Tablas.',
          squares: ['c5', 'c6'],
          arrows: [['b5', 'c5']],
        },
      ],
      practice: [
        {
          fen: '7r/8/1k6/8/4P3/4K3/8/R7 w - - 0 1',
          prompt: 'Juegan blancas. El rey negro de b6 quiere acercarse al peón. Córtalo con la torre.',
          solutionUci: ['a1c1'],
          hint: 'La columna que el rey negro tiene que cruzar es la c.',
          explanationCorrect:
            'Correcto: Rc1. La torre corta la columna c: el rey negro no puede acercarse al peón y las blancas ganan.',
          explanationWrong:
            'Esa jugada deja pasar al rey negro: cruza la columna c y las blancas dejan de ganar. Hay que cortarlo con la torre.',
        },
        {
          fen: 'r7/8/1k6/8/4P3/4K3/8/7R w - - 0 1',
          prompt: 'Juegan blancas. Tu torre blanca de h1 puede cortar al rey negro de b6. Gana la partida.',
          solutionUci: ['h1c1'],
          hint: 'Pon la torre en la columna c.',
          explanationCorrect:
            'Correcto: Rc1. La torre llega a la columna c desde el otro lado del tablero y deja cortado al rey negro. Las blancas ganan.',
          explanationWrong:
            'Esa jugada deja pasar al rey negro y la victoria se escapa. La torre tiene que cortar la columna c.',
        },
        {
          fen: '7r/8/6k1/8/3P4/3K4/8/R7 w - - 0 1',
          prompt: 'Juegan blancas. El rey negro de g6 está al otro lado del peón. Córtalo con la torre.',
          solutionUci: ['a1f1'],
          hint: 'El rey negro tiene que cruzar la columna f.',
          explanationCorrect:
            'Correcto: Rf1. La torre corta la columna f: el rey negro queda lejos del peón y las blancas ganan.',
          explanationWrong:
            'Esa jugada deja pasar al rey negro: cruza la columna f y las blancas dejan de ganar.',
        },
      ],
      evaluation: [
        {
          fen: 'r7/8/8/6k1/3P4/3K4/8/7R w - - 0 1',
          prompt: 'Juegan blancas. Corta al rey negro de g5 con la torre.',
          solutionUci: ['h1f1'],
          hint: 'La columna que el rey negro quiere cruzar es la f.',
          explanationCorrect: 'Correcto: Rf1. Cortas la columna f: el rey negro no puede acercarse y las blancas ganan.',
          explanationWrong: 'Esa jugada deja pasar al rey negro y la victoria se escapa. Corta la columna f.',
        },
        {
          fen: 'r7/8/6k1/8/3P4/3K4/8/7R w - - 0 1',
          prompt: 'Juegan blancas. Gana la partida cortando al rey negro de g6.',
          solutionUci: ['h1f1'],
          hint: 'La torre tiene que ir a la columna que el rey negro debe cruzar.',
          explanationCorrect: 'Correcto: Rf1. La columna f queda cortada y el peón avanza con el rey blanco: ganan las blancas.',
          explanationWrong: 'Esa jugada permite que el rey negro cruce la columna f y las blancas dejan de ganar.',
        },
        {
          fen: '1r6/8/1k6/8/4P3/4K3/8/7R w - - 0 1',
          prompt: 'Juegan blancas. El rey negro de b6 está en la columna de su torre. Gana la partida.',
          solutionUci: ['h1c1'],
          alt: ['h1b1'],
          hint: 'Corta la columna c; también hay una jugada con jaque que conserva la victoria.',
          explanationCorrect:
            'Correcto. Rc1 corta la columna c. Rb1+ también gana: da jaque en la columna b y conserva la victoria.',
          explanationWrong: 'Esa jugada deja pasar al rey negro y la victoria se escapa. Busca cortar la columna c.',
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u14.l02',
      unitId: 'u14',
      title: 'Defender: jaques por detrás',
      objective: 'Hacer tablas con la torre defensora: vigilar la sexta fila y dar jaques por detrás cuando el peón avanza.',
      conceptIds: ['endgame.rook'],
      intro:
        'Cuando defiendes un final de torre contra torre y peón, tu torre tiene dos tareas. Mientras el peón está en la quinta fila, colócala en la sexta (la tercera fila contando desde tu lado) para que el rey rival no pueda entrar. Cuando el peón llega a la sexta fila, cambia de plan: da jaques por detrás, desde lejos, para que el rey rival no encuentre refugio. Este método es la posición de Philidor.',
      explanation: [
        {
          fen: '4k3/8/r7/3KP3/8/8/8/6R1 b - - 0 1',
          text: 'Juegan negras. La torre negra de a6 vigila toda la sexta fila. El rey blanco de d5 no puede entrar en ella y el peón de e5 no tiene el apoyo que necesita. Esta es la defensa de la tercera fila, la posición de Philidor, y las negras hacen tablas.',
          squares: ['a6', 'b6', 'c6', 'd6'],
        },
        {
          fen: '2k5/R7/2KP4/8/8/8/8/1r6 b - - 0 1',
          text: 'Juegan negras. El peón ya está en d6 y la torre de la sexta fila no sirve. Rc1+ es la única jugada que salva la partida: es un jaque por detrás, con la torre negra lejos del rey blanco de c6.',
          squares: ['c1', 'c6'],
          arrows: [['b1', 'c1']],
        },
      ],
      practice: [
        {
          fen: '3k4/R7/2KP4/8/8/8/8/7r b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de d6 está en la sexta fila. Salva la partida con un jaque por detrás.',
          solutionUci: ['h1c1'],
          hint: 'Da jaque al rey blanco desde su misma columna, lejos de él.',
          explanationCorrect:
            'Correcto: Rc1+. Es un jaque por detrás: la torre queda lejos del rey blanco de c6 y las negras hacen tablas.',
          explanationWrong: 'Esa jugada no basta: el peón y el rey blanco avanzan y las blancas ganan. Hacía falta el jaque por detrás.',
        },
        {
          fen: '4k3/R7/3KP3/8/8/8/8/7r b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de e6 ya está en la sexta fila. Salva la partida.',
          solutionUci: ['h1d1'],
          hint: 'Jaque por detrás: busca la columna del rey blanco.',
          explanationCorrect:
            'Correcto: Rd1+. Jaque por detrás al rey blanco de d6: la torre negra queda a distancia y las negras hacen tablas.',
          explanationWrong: 'Esa jugada deja avanzar al peón sin molestias y las blancas ganan. Hacía falta un jaque por detrás.',
        },
        {
          fen: '4k3/7R/3PK3/8/8/8/8/1r6 b - - 0 1',
          prompt: 'Juegan negras. El rey blanco está en e6 y su peón en d6. Salva la partida.',
          solutionUci: ['b1e1'],
          hint: 'Da jaque desde la columna del rey blanco, a distancia.',
          explanationCorrect:
            'Correcto: Re1+. Jaque por detrás al rey blanco de e6: con la torre lejos, las negras hacen tablas.',
          explanationWrong: 'Esa jugada no basta y las blancas ganan. Con el peón en la sexta fila, el recurso es el jaque por detrás.',
        },
      ],
      evaluation: [
        {
          fen: '5k2/R7/3P1K2/8/8/8/8/1r6 b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de d6 está en la sexta fila y el rey blanco en f6. Salva la partida.',
          solutionUci: ['f8e8'],
          hint: 'No es un jaque: acerca el rey al peón para que controle d7 y d8.',
          explanationCorrect:
            'Correcto: Ke8. El rey negro controla d7 y d8 y el peón no puede avanzar. A veces la defensa es el rey, no la torre.',
          explanationWrong: 'Esa jugada pierde. Aquí lo único que sirve es acercar el rey al peón.',
        },
        {
          fen: '2k5/R7/2K1P3/8/8/8/8/1r6 b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de e6 amenaza avanzar. Salva la partida con el rey.',
          solutionUci: ['c8d8'],
          hint: 'Acerca el rey al peón: tiene que controlar e7 y e8.',
          explanationCorrect: 'Correcto: Kd8. El rey negro controla e7 y e8 y el peón no puede avanzar. Tablas.',
          explanationWrong: 'Esa jugada pierde. El rey negro tiene que ir hacia el peón.',
        },
        {
          fen: '3k4/R7/4PK2/8/8/8/8/6r1 b - - 0 1',
          prompt: 'Juegan negras. El rey blanco está en f6 y su peón en e6. Salva la partida.',
          solutionUci: ['g1f1'],
          hint: 'Jaque por detrás, desde la columna del rey blanco.',
          explanationCorrect:
            'Correcto: Rf1+. Jaque por detrás al rey blanco de f6, con la torre negra lejos. Las negras hacen tablas.',
          explanationWrong: 'Esa jugada no basta y las blancas ganan. El recurso es el jaque por detrás.',
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u14.l03',
      unitId: 'u14',
      title: 'Ganar: salir del jaque hacia el peón',
      objective: 'Dar los primeros pasos de la posición de Lucena: sacar al rey del jaque pegándolo al peón de la séptima fila.',
      conceptIds: ['endgame.rook'],
      intro:
        'La posición de Lucena es la gran técnica del bando que gana: un peón en la séptima fila, el rey propio cerca de él y el rey rival cortado. El rival da jaques por detrás con su torre. La solución es sacar al rey del jaque acercándolo al peón y usar después la torre como puente contra los jaques que vengan. En esta lección practicas el primer paso: salir del jaque hacia el peón.',
      explanation: [
        {
          fen: '8/2P1k3/1K6/8/5R2/8/8/1r6 w - - 0 1',
          text: 'Juegan blancas, en jaque por la torre negra de b1. Con Kc6 el rey sale del jaque y se pega al peón de c7. Es la única jugada que conserva la victoria: hay que salir del jaque hacia el peón.',
          squares: ['c6', 'c7'],
          arrows: [['b6', 'c6']],
        },
        {
          fen: '2K5/2P1k3/8/8/5R2/8/8/1r6 b - - 0 1',
          text: 'Juegan negras. El rey blanco ya está delante del peón, en c8, y la torre blanca de f4 está lista para hacer de puente. Pase lo que pase, las blancas ganan.',
          squares: ['c8', 'c7'],
        },
      ],
      practice: [
        {
          fen: '8/2P1k3/8/2K5/3R4/8/8/2r5 w - - 0 1',
          prompt: 'Juegan blancas, en jaque por la torre negra de c1. Sal del jaque hacia el peón.',
          solutionUci: ['c5b6'],
          hint: 'Busca la casilla que toca al peón de c7.',
          explanationCorrect: 'Correcto: Kb6. El rey sale del jaque y se pega al peón de c7. Las blancas ganan.',
          explanationWrong:
            'Esa jugada no conserva la victoria. El rey tiene que salir del jaque pegándose al peón de c7.',
        },
        {
          fen: '8/2P1k3/8/1K6/5R2/8/8/1r6 w - - 0 1',
          prompt: 'Juegan blancas, en jaque por la torre negra de b1. Sal del jaque hacia el peón.',
          solutionUci: ['b5c6'],
          hint: 'La casilla buena está justo debajo del peón de c7.',
          explanationCorrect: 'Correcto: Kc6. El rey sale del jaque y se pega al peón de c7. Las blancas ganan.',
          explanationWrong: 'Esa jugada no conserva la victoria. El rey tiene que ir a la casilla que toca al peón de c7.',
        },
        {
          fen: '8/3k1P2/6K1/8/2R5/8/6r1/8 w - - 0 1',
          prompt: 'Juegan blancas, en jaque por la torre negra de g2. Sal del jaque hacia el peón.',
          solutionUci: ['g6f6'],
          hint: 'La casilla buena está justo debajo del peón de f7.',
          explanationCorrect: 'Correcto: Kf6. El rey sale del jaque y se pega al peón de f7. Las blancas ganan.',
          explanationWrong: 'Esa jugada no conserva la victoria. El rey tiene que ir a la casilla que toca al peón de f7.',
        },
      ],
      evaluation: [
        {
          fen: '8/3k1P2/8/5K2/4R3/8/8/5r2 w - - 0 1',
          prompt: 'Juegan blancas, en jaque por la torre negra de f1. Sal del jaque hacia el peón.',
          solutionUci: ['f5g6'],
          hint: 'Busca la casilla que toca al peón de f7.',
          explanationCorrect: 'Correcto: Kg6. El rey sale del jaque y se pega al peón de f7. Las blancas ganan.',
          explanationWrong: 'Esa jugada no conserva la victoria. El rey tiene que salir del jaque pegándose al peón.',
        },
        {
          fen: '8/3k1P2/8/6K1/2R5/8/8/6r1 w - - 0 1',
          prompt: 'Juegan blancas, en jaque por la torre negra de g1. Sal del jaque hacia el peón.',
          solutionUci: ['g5f6'],
          hint: 'La casilla buena está justo debajo del peón de f7.',
          explanationCorrect: 'Correcto: Kf6. El rey sale del jaque y se pega al peón de f7. Las blancas ganan.',
          explanationWrong: 'Esa jugada no conserva la victoria. El rey tiene que ir a la casilla que toca al peón.',
        },
        {
          fen: '8/2P1k3/8/2K5/5R2/8/8/2r5 w - - 0 1',
          prompt: 'Juegan blancas, en jaque por la torre negra de c1. Sal del jaque hacia el peón.',
          solutionUci: ['c5b6'],
          hint: 'Busca la casilla que toca al peón de c7.',
          explanationCorrect: 'Correcto: Kb6. El rey sale del jaque y se pega al peón de c7. Las blancas ganan.',
          explanationWrong: 'Esa jugada no conserva la victoria. El rey tiene que salir del jaque pegándose al peón.',
        },
      ],
    },
  ],
};
