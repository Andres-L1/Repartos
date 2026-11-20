import type { Unit } from '../schema.js';

/**
 * Unidad 15 · Finales de torre, nivel Avanzado (1400-1700 Elo). Pendiente de validación de profesores.
 * Verificada de forma exacta con la tablebase de Lichess (Syzygy), con el criterio `optimal` de scripts/lib/tablebase.ts:
 * si la posición está ganada, se aceptan solo las jugadas que ganan lo antes posible (menor DTM) y, en la última jugada
 * del alumno, las de `alt` que empatan con ella; una jugada que gana pero alarga el final cuenta como degradación.
 * Si son tablas, se aceptan todas las jugadas que las conservan (las que no son la de la línea, en `alt`). En las jugadas
 * intermedias del alumno, las alternativas igual de buenas van en `branches`, cada una con su continuación precalculada
 * (scripts/gen-branches.mts); en el resto de líneas largas de la unidad la jugada intermedia es única (comprobado).
 * scripts/verify-finales.mts; test/content/unitsE.test.ts con la caché de test/fixtures/tablebase/.
 */
export const unit: Unit = {
  id: 'u15',
  order: 14,
  title: 'Finales de torre: nivel Avanzado',
  description:
    'El puente de Lucena completo y la defensa de Philidor en sus dos fases. Además, tres reglas: peón de torre y de alfil, torre detrás del peón pasado y regla de las columnas.',
  level: 'advanced',
  requires: ['u14'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u15.l01',
      unitId: 'u15',
      title: 'Lucena completo: el puente',
      objective: 'Ganar la posición de Lucena de principio a fin: jaque desde lejos, puente en la cuarta fila y salida del rey.',
      conceptIds: ['endgame.rook'],
      intro:
        'En la posición de Lucena el peón está en la séptima fila, su rey delante y el rey rival cortado. Para ganar hay que sacar al rey de la casilla de coronación sin que los jaques lo frenen. El método completo tiene tres partes: un jaque que aleja al rey rival, el puente (la torre en la cuarta fila) y la salida del rey hacia el peón. Aquí practicas cada parte y la secuencia entera.',
      explanation: [
        {
          fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1',
          text: 'Juegan blancas. Posición de Lucena: el peón está en b7, el rey blanco en b8 y la torre de c1 corta al rey negro de d8. Rd1+ y Rc4 ganan igual de rápido; Ra1 solo hace tablas.',
          squares: ['b7', 'b8', 'd8', 'c1'],
          arrows: [['c1', 'd1']],
        },
        {
          fen: '8/1P2k3/8/1K6/3R4/8/8/1r6 w - - 0 1',
          text: 'Juegan blancas. El rey está en b5 y la torre de d4 espera. Rb4 la coloca en la columna b y tapa los jaques de la torre negra de b1. Kc6 y Ka6 también ganan, pero más despacio; si el rey blanco va a a4, c4, a5 o c5, la partida es tablas.',
          squares: ['b4', 'b1'],
          arrows: [['d4', 'b4']],
        },
      ],
      practice: [
        {
          fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1',
          prompt: 'Juegan blancas. Es una posición de Lucena: el rey negro de d8 está cortado. Da el primer paso del método.',
          solutionUci: ['c1d1'],
          alt: ['c1c4'],
          hint: 'Un jaque desde la primera fila lleva a la torre a la columna del rey negro.',
          explanationCorrect:
            'Correcto: Rd1+ aleja al rey negro y prepara el puente. Rc4 también gana igual de rápido, así que se acepta.',
          explanationWrong:
            'Esa jugada no es la más precisa: la partida pasa a tablas o la victoria se alarga. El método de Lucena empieza con una jugada de torre que prepara el puente.',
          wrongByMove: {
            c1a1: 'Ra1 deja escapar la victoria: las negras hacen tablas.',
            c1c2: 'Rc2 pierde la torre: Rxc2.',
          },
        },
        {
          fen: '1K6/1P2k3/8/8/8/8/r7/3R4 w - - 0 1',
          prompt: 'Juegan blancas. El rey negro ya salió de la columna d. Construye el puente con la torre y saca al rey hacia el peón.',
          solutionUci: ['d1d4', 'e7e6', 'b8c7', 'a2c2', 'c7b6'],
          hint: 'La torre va a la cuarta fila. Después el rey sale del refugio hacia el peón.',
          explanationCorrect:
            'Correcto: Rd4 construye el puente y el rey sale con Kc7 y Kb6. Cuando el rey llegue a b6, la torre de d4 podrá interponerse en los jaques.',
          explanationWrong:
            'Esa jugada no es la más precisa: la victoria se alarga o se escapa. Hace falta el puente en la cuarta fila y la salida del rey.',
          wrongByMove: {
            d1d3: 'Esa torre todavía gana, pero tarda más que construir el puente en la cuarta fila.',
            d1d2: 'Rd2 deja escapar la victoria: las negras hacen tablas.',
          },
        },
        {
          fen: '8/1P2k3/8/1K6/3R4/8/8/1r6 w - - 0 1',
          prompt: 'Juegan blancas. El rey está en b5 y la torre en d4. Tapa los jaques de la torre negra y termina el método.',
          solutionUci: ['d4b4', 'b1b4', 'b5b4'],
          hint: 'La torre blanca puede interponerse en la columna b, delante del rey.',
          explanationCorrect: 'Correcto: Rb4 es el puente. Si las negras cambian con Rxb4+, Kxb4 y el peón de b7 corona.',
          explanationWrong:
            'Esa jugada no es la más precisa: la partida pasa a tablas o la victoria se alarga. Hay que tapar el jaque con la torre.',
          wrongByMove: {
            b5a4: 'Ka4 deja al rey sin refugio: las negras hacen tablas.',
            b5c6: 'Ese paso del rey todavía gana, pero tarda más que construir el puente con la torre.',
          },
        },
      ],
      evaluation: [
        {
          fen: '3r4/R7/8/8/8/8/1p2K3/1k6 b - - 0 1',
          prompt:
            'Juegan negras. Es la posición de Lucena con los colores cambiados: el rey blanco de e2 está cortado. Construye el puente y saca al rey hacia el peón.',
          solutionUci: ['d8d5', 'e2e3', 'b1c2', 'a7c7', 'c2b3'],
          hint: 'El puente se construye en la quinta fila, con la torre de d8.',
          explanationCorrect:
            'Correcto: Rd5 construye el puente y el rey sale con Kc2 y Kb3. Es el mismo método con los colores cambiados.',
          explanationWrong:
            'Esa jugada no es la más precisa: la victoria se alarga o se escapa. Primero el puente en la quinta fila y después la salida del rey.',
        },
        {
          fen: '6R1/8/8/4r3/6k1/8/3K2p1/8 b - - 0 1',
          prompt: 'Juegan negras, en jaque por la torre blanca de g8. Tapa el jaque con tu torre y termina el método.',
          solutionUci: ['e5g5', 'g8g5', 'g4g5'],
          hint: 'Interpón la torre negra en la columna g, delante del rey.',
          explanationCorrect: 'Correcto: Rg5 es el puente. Si las blancas cambian con Rxg5+, Kxg5 y el peón de g2 corona.',
          explanationWrong:
            'Esa jugada no es la más precisa: la partida pasa a tablas o la victoria se alarga. Hay que tapar el jaque con la torre.',
        },
        {
          fen: '5r2/7R/8/8/8/8/6p1/4K1k1 b - - 0 1',
          prompt: 'Juegan negras. El rey blanco de e1 está cortado por la columna f. Da el primer paso del método.',
          solutionUci: ['f8e8'],
          alt: ['f8f5'],
          hint: 'Un jaque desde la octava fila lleva a la torre a la columna del rey blanco.',
          explanationCorrect:
            'Correcto: Re8+ aleja al rey blanco y prepara el puente. Rf5 también gana igual de rápido, así que se acepta.',
          explanationWrong:
            'Esa jugada no es la más precisa: la partida pasa a tablas o la victoria se alarga. El método empieza con una jugada de torre que prepara el puente.',
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u15.l02',
      unitId: 'u15',
      title: 'Philidor completo: dos fases',
      objective: 'Defender un final de torre y peón contra torre en las dos fases de Philidor y reconocer cuándo cambiar de una a otra.',
      conceptIds: ['endgame.rook'],
      intro:
        'La defensa de Philidor tiene dos fases. Mientras el peón no pasa de la quinta fila, la torre defensora vigila la sexta fila y el rey rival no puede entrar. Cuando el peón llega a la sexta fila, la torre se aleja del rey y da jaques por detrás. Saber cuándo cambiar de plan es lo que salva la partida. Aquí practicas las dos fases y el paso de una a otra.',
      explanation: [
        {
          fen: '5k2/8/7r/3KP3/8/8/8/5R2 b - - 0 1',
          text: 'Juegan negras. Primera fase: el peón blanco de e5 todavía no ha pasado de la quinta fila. La torre negra de h6 vigila la sexta fila, el rey blanco de d5 no puede entrar y las negras hacen tablas.',
          squares: ['h6', 'd5', 'e5'],
        },
        {
          fen: '4k3/R7/3PK3/8/8/8/8/1r6 b - - 0 1',
          text: 'Juegan negras. Segunda fase: el peón de d6 ya está en la sexta fila y el rey blanco de e6 lo apoya. Re1+ es la única jugada que salva la partida: es un jaque por detrás, con la torre lejos del rey.',
          squares: ['e1', 'e6'],
          arrows: [['b1', 'e1']],
        },
      ],
      practice: [
        {
          fen: '4k2r/8/8/3KP3/8/8/1R6/8 b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de e5 está en la quinta fila y tu torre de h8 queda lejos. Salva la partida.',
          solutionUci: ['h8h6'],
          alt: ['h8h1', 'h8h3', 'h8h4', 'e8f7'],
          hint: 'La defensa clásica vigila la sexta fila.',
          explanationCorrect:
            'Correcto: Rh6 vigila la sexta fila y el rey blanco no puede entrar. Rh1, Rh3, Rh4 y Kf7 también mantienen las tablas, y la tablebase las acepta.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
        {
          fen: '3k4/8/r3P3/5K2/8/8/7R/8 b - - 0 1',
          prompt: 'Juegan negras. El peón blanco ya llegó a la sexta fila, en e6. Cambia de plan: aleja la torre para dar jaques por detrás.',
          solutionUci: ['a6a1'],
          alt: ['a6a3', 'a6a4'],
          hint: 'Lleva la torre al otro extremo de la columna a, detrás del peón.',
          explanationCorrect:
            'Correcto: Ra1 pasa a la primera fila, detrás del peón, para dar jaques lejos del rey blanco. Ra3 y Ra4 también mantienen las tablas.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
        {
          fen: '3k4/R7/2KP4/8/8/8/8/6r1 b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de d6 está en la sexta fila y el rey blanco en c6. Salva la partida con un jaque por detrás.',
          solutionUci: ['g1c1'],
          hint: 'Da jaque desde la columna del rey blanco, a distancia.',
          explanationCorrect: 'Correcto: Rc1+. Es la única jugada que salva la partida: jaque por detrás, con la torre lejos del rey blanco.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
        {
          fen: '4k2r/8/8/3KP3/8/8/R7/8 b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de e5 todavía no pasó de la quinta fila. Defiende y, cuando avance, cambia de plan.',
          solutionUci: ['h8h6', 'e5e6', 'h6h1'],
          alt: ['h6h3', 'h6h4'],
          // Cinco jugadas igual de buenas en la primera (tablas); cada una lleva su propia continuación verificada.
          branches: [
            { at: 0, line: ['h8h1', 'e5e6', 'h1b1'], alt: ['h1c1', 'h1d1', 'h1e1', 'h1f1', 'h1g1', 'h1h3', 'h1h4', 'e8e7', 'e8d8', 'e8f8'] },
            { at: 0, line: ['h8h3', 'e5e6', 'h3h1'], alt: ['h3b3', 'h3c3', 'h3d3', 'h3e3', 'h3f3', 'h3g3', 'h3h4', 'e8e7', 'e8d8', 'e8f8'] },
            { at: 0, line: ['h8h4', 'e5e6', 'h4h1'], alt: ['h4h3', 'h4b4', 'h4f4', 'h4g4', 'e8e7', 'e8d8', 'e8f8'] },
            { at: 0, line: ['e8f7', 'e5e6', 'f7f6'], alt: ['f7e7'] },
          ],
          hint: 'Primero vigila la sexta fila; cuando el peón llegue a ella, lleva la torre lejos del rey blanco.',
          explanationCorrect:
            'Correcto: las dos fases de Philidor seguidas. Primero la torre vigila la sexta fila y, cuando el peón llega a ella, se aleja del rey para dar jaques por detrás. En la primera jugada valen también Rh1, Rh3, Rh4 y Kf7; la tablebase las acepta todas y el rival responde según la que elijas.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
      ],
      evaluation: [
        {
          fen: '4k3/8/4P2r/3K4/8/8/8/6R1 b - - 0 1',
          prompt: 'Juegan negras. El peón blanco está en e6 y tu torre de h6 lo ataca, pero el rey blanco lo protege. Aleja la torre para dar jaques por detrás.',
          solutionUci: ['h6h2'],
          alt: ['h6h3', 'h6h4', 'e8e7'],
          hint: 'Con el peón en la sexta fila, la torre debe estar lejos del rey blanco.',
          explanationCorrect:
            'Correcto: Rh2. La torre se aleja de la sexta fila para dar jaques por detrás. Rh3, Rh4 y Ke7 también mantienen las tablas.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
        {
          fen: '4k3/6R1/3PK3/8/8/8/8/1r6 b - - 0 1',
          prompt: 'Juegan negras. El rey blanco está en e6, delante de su peón de d6. Salva la partida.',
          solutionUci: ['b1e1'],
          hint: 'Jaque por detrás, desde la columna del rey blanco.',
          explanationCorrect: 'Correcto: Re1+. Jaque por detrás al rey blanco de e6; es la única jugada que mantiene las tablas.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
        {
          fen: '3k4/7R/2KP4/8/8/8/8/r7 b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de d6 y su rey de c6 amenazan con avanzar. Salva la partida con un jaque.',
          solutionUci: ['a1c1'],
          alt: ['a1a6'],
          hint: 'Hay dos jaques que salvan la partida; uno es por detrás.',
          explanationCorrect: 'Correcto: Rc1+, jaque por detrás. Ra6+ también salva la partida, y la tablebase la acepta.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u15.l03',
      unitId: 'u15',
      title: 'Tablas y columnas: peón de torre, de alfil y torre detrás del peón',
      objective: 'Aplicar tres ideas de los finales de torre: jaques por detrás con peón de torre o de alfil, torre detrás del peón pasado y regla de las columnas.',
      conceptIds: ['endgame.rook'],
      intro:
        'Tres ideas más para los finales de torre. Con peón de torre o de alfil en la sexta fila, el defensor hace tablas si da jaques por detrás desde la columna del rey rival. Con un peón pasado, la torre trabaja mejor detrás de él. Y para cortar al rey rival cuenta cuántas columnas lo separan del peón: si son tres o más, la torre puede cortarlo.',
      explanation: [
        {
          fen: '8/4k3/8/P1K4R/8/6r1/8/8 b - - 0 1',
          text: 'Juegan negras. El peón blanco de a5 es pasado. La torre negra de g3 se coloca detrás con Ra3 y las negras hacen tablas. Con Rg8, la torre se queda lejos de la columna a y las blancas ganan.',
          squares: ['a3', 'a5'],
          arrows: [['g3', 'a3']],
        },
        {
          fen: '7r/8/1k6/8/4P3/4K3/8/R7 w - - 0 1',
          text: 'Juegan blancas. Regla de las columnas: el rey negro de b6 está a tres columnas del peón de e4. Con Rc1 la torre corta la columna c y las blancas ganan. Con el rey negro en c6, d6 o c5 no hay corte posible y son tablas.',
          squares: ['c1', 'b6', 'e4'],
          arrows: [['a1', 'c1']],
        },
      ],
      practice: [
        {
          fen: '3k4/7R/PK6/8/8/8/8/3r4 b - - 0 1',
          prompt: 'Juegan negras. Las blancas tienen un peón de torre en a6 y su rey en b6. Salva la partida con un jaque por detrás.',
          solutionUci: ['d1b1'],
          hint: 'La torre da jaque desde la columna b, lejos del rey blanco.',
          explanationCorrect:
            'Correcto: Rb1+. Con el peón de torre, el jaque por detrás desde la columna del rey blanco mantiene las tablas.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
        {
          fen: '5k2/R7/5PK1/8/8/8/8/1r6 b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de alfil está en f6 y el rey blanco en g6. Salva la partida.',
          solutionUci: ['b1g1'],
          hint: 'Jaque por detrás desde la columna del rey blanco, lejos de él.',
          explanationCorrect: 'Correcto: Rg1+. Con el peón de alfil en la sexta fila, el jaque lejano por detrás es la única defensa.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
        {
          fen: '8/3k4/8/R4K1P/8/1r6/8/8 b - - 0 1',
          prompt: 'Juegan negras. El peón pasado blanco de h5 quiere avanzar. Coloca tu torre detrás de él.',
          solutionUci: ['b3h3'],
          alt: ['d7e7', 'd7e8'],
          hint: 'Detrás del peón es por debajo de él, en la columna h.',
          explanationCorrect:
            'Correcto: Rh3 coloca la torre detrás del peón de h5 y las negras hacen tablas. Ke7 y Ke8 también mantienen las tablas.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
      ],
      evaluation: [
        {
          fen: 'r7/8/6k1/8/3P4/3K4/8/7R w - - 0 1',
          prompt: 'Juegan blancas. El rey negro de g6 está a tres columnas del peón de d4. Aplica la regla de las columnas.',
          solutionUci: ['h1f1'],
          hint: 'Corta con la torre la columna que el rey negro tiene que cruzar.',
          explanationCorrect: 'Correcto: Rf1 corta la columna f y las blancas ganan.',
          explanationWrong: 'Esa jugada no es la más precisa: la victoria se alarga o se escapa. Hay que cortar la columna f.',
        },
        {
          fen: '7r/8/8/1k6/4P3/4K3/8/R7 b - - 0 1',
          prompt: 'Juegan negras. Tu rey está a tres columnas del peón de e4 y la torre blanca amenaza con cortarlo. Cruza la columna c.',
          solutionUci: ['b5c5'],
          alt: ['b5c6'],
          hint: 'El rey tiene que pasar a la columna c antes de que la torre la corte.',
          explanationCorrect: 'Correcto: Kc5 cruza la columna c y las negras hacen tablas. Kc6 también lo consigue.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
        {
          fen: '4k3/R7/4KP2/8/8/8/8/7r b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de alfil está en f6 y el rey blanco en e6. Salva la partida.',
          solutionUci: ['h1e1'],
          hint: 'Jaque por detrás desde la columna del rey blanco.',
          explanationCorrect: 'Correcto: Re1+. Jaque por detrás: es la única jugada que mantiene las tablas.',
          explanationWrong: 'Esa jugada no basta: las blancas ganan.',
        },
      ],
    },
  ],
};
