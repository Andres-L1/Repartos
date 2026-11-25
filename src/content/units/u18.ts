import type { Unit } from '../schema.js';

/**
 * Unidad 18 · Finales prácticos: dama, alfil y caballo (Avanzado). Pendiente de validación de profesores.
 * Verificada de forma exacta con la tablebase de Lichess (Syzygy) con el mismo criterio `optimal` que u15
 * (scripts/lib/tablebase.ts): si la posición está ganada, solo se aceptan las jugadas que ganan lo antes posible
 * (menor DTM; DTZ si no hay DTM) y, en la última jugada del alumno, las de `alt` que empatan con ella; si son
 * tablas, todas las que las conservan. Las jugadas intermedias del alumno son únicas (comprobado), y donde el
 * texto dice «la única jugada» también se comprueba que no hay otra que conserve el resultado (ONLY_RESULT en
 * scripts/lib/finales-claims.ts). Las demás afirmaciones de los textos están en CLAIMS y EXPLAIN_RESULT del mismo archivo.
 * Los conceptos de finales existentes son solo `endgame.king_pawn` y `endgame.rook`; aquí se usa el primero.
 * scripts/verify-finales.mts; test/content/unitsU18.test.ts con la caché de test/fixtures/tablebase/.
 */
export const unit: Unit = {
  id: 'u18',
  order: 24,
  title: 'Finales prácticos: dama, alfil y caballo',
  description:
    'Tres finales que aparecen en partidas reales: la dama contra un peón y el mate con dama, el alfil contra el caballo (alfil bueno y alfil malo) y cómo convertir una ventaja cambiando piezas y no peones.',
  level: 'advanced',
  requires: ['u15'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u18.l01',
      unitId: 'u18',
      title: 'Dama contra peón y mate con dama',
      objective: 'Dar mate con dama y rey contra rey, y ganar con la dama contra un peón a punto de coronar sin dejar ahogado al rival.',
      conceptIds: ['endgame.king_pawn'],
      intro:
        'Con una dama contra un peón la victoria parece fácil, pero hay dos trampas: dejar al rival ahogado (sin jugadas legales y sin jaque, que es tablas) y subestimar un peón que está a un paso de coronar. Con el peón en la sexta fila la dama gana siempre; con el peón en la séptima depende de su columna y de lo cerca que esté tu rey. Aquí practicas el mate con dama y rey, y después las posiciones de dama contra peón.',
      explanation: [
        {
          fen: '8/8/8/8/8/7p/7k/4KQ2 w - - 0 1',
          text: 'Juegan blancas. El peón negro de h3 está en su sexta fila y el rey negro de h2 lo apoya. Contra un peón en la sexta fila la dama gana, incluso si es un peón de torre. Qf2+ gana: da jaque y obliga al rey a ir a h1 mientras el rey blanco se acerca.',
          squares: ['h3', 'h2'],
          arrows: [['f1', 'f2']],
        },
        {
          fen: '6Q1/8/8/8/8/8/K6p/7k w - - 0 1',
          text: 'Juegan blancas. Ahora el peón de h2, que es de torre, está en la séptima fila, el rey negro de h1 está en la esquina y el rey blanco de a2 queda lejos: son tablas. Si juegas Qg3, el rey negro queda ahogado, sin jugadas legales. Con el rey blanco en g3, en cambio, las blancas ganan.',
          squares: ['h2', 'h1', 'a2'],
        },
      ],
      practice: [
        {
          fen: '8/5K1k/8/8/1Q6/8/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Tienes dama y rey contra rey. Da mate en una jugada.',
          solutionUci: ['b4h4'],
          hint: 'Lleva la dama a la columna h: el rey blanco de f7 ya cubre las casillas de escape.',
          explanationCorrect: 'Correcto: Qh4# es mate. El rey blanco de f7 cubre g8, g7 y g6, y la dama da jaque por la columna h.',
          explanationWrong: 'Esa jugada no da mate. Busca el jaque que el rey negro no puede esquivar: el rey blanco cubre g8, g7 y g6.',
        },
        {
          fen: '8/8/4Q3/8/5K2/8/8/5k2 w - - 0 1',
          prompt: 'Juegan blancas. Dama y rey contra rey: da mate en dos jugadas. La dama ya encierra al rey; falta acercar el rey blanco.',
          solutionUci: ['f4g3', 'f1g1', 'e6e1'],
          hint: 'No des jaque todavía: una jugada tranquila del rey deja al rival una sola respuesta.',
          explanationCorrect: 'Correcto: Kg3 deja al rey negro una sola jugada, Kg1, y entonces Qe1# es mate.',
          explanationWrong: 'Esa jugada no fuerza el mate en dos. Acerca el rey blanco sin dejar ahogado al rival.',
        },
        {
          fen: '8/8/1Q6/8/4K3/2k5/2p5/8 w - - 0 1',
          prompt: 'Juegan blancas. El peón negro de c2 está a un paso de coronar y su rey lo protege. Usa la dama con jaques para ganar.',
          solutionUci: ['b6d4', 'c3b3', 'd4d2'],
          hint: 'La dama gana tiempo con jaques mientras el rey blanco se acerca.',
          explanationCorrect:
            'Correcto: Qd4+ es la jugada que gana lo antes posible. Con jaque, la dama obliga al rey negro a moverse; después Qd2 ataca el peón y el rey blanco sigue acercándose.',
          explanationWrong: 'Esa jugada no es la más precisa: la victoria se alarga. Usa la dama para dar jaque y ganar tiempo.',
        },
      ],
      evaluation: [
        {
          fen: '6k1/8/6K1/8/8/8/4Q3/8 w - - 0 1',
          prompt: 'Juegan blancas. Dama y rey contra rey: da mate en una jugada.',
          solutionUci: ['e2e8'],
          hint: 'El rey blanco de g6 cubre f7, g7 y h7; falta un jaque por la octava fila.',
          explanationCorrect: 'Correcto: Qe8# es mate. El rey blanco de g6 cubre f7, g7 y h7, y la dama da jaque por la octava fila.',
          explanationWrong: 'Esa jugada no da mate. El rey negro de g8 solo puede escapar por la octava fila: corta esa línea con jaque.',
        },
        {
          fen: '8/5K2/8/7k/8/1Q6/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Dama y rey contra rey: da mate en dos jugadas.',
          solutionUci: ['b3g3', 'h5h6', 'g3h4'],
          hint: 'Encierra al rey negro con una jugada de dama que no es jaque.',
          explanationCorrect: 'Correcto: Qg3 deja al rey negro una sola jugada, Kh6, y después Qh4# es mate (Qg6# también lo es).',
          explanationWrong: 'Esa jugada no fuerza el mate en dos. Encierra al rey negro sin darle jaque y sin dejarlo ahogado.',
        },
        {
          fen: '8/8/8/8/8/6k1/2Q1Kp2/8 w - - 0 1',
          prompt: 'Juegan blancas. El peón negro de f2 está en la séptima fila, pero tu rey de e2 está justo al lado. Centraliza la dama.',
          solutionUci: ['c2e4', 'g3h2', 'e2f2'],
          alt: ['e4g4'],
          hint: 'Lleva la dama a una casilla central desde la que controle la diagonal del rey negro.',
          explanationCorrect:
            'Correcto: Qe4 gana lo antes posible. Con el rey blanco al lado del peón, la dama puede acercarse sin dejar escapar el peón. Después valen Kxf2 y Qg4.',
          explanationWrong: 'Esa jugada no es la más precisa: la victoria se alarga o se escapa. Con tu rey tan cerca, centraliza la dama.',
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u18.l02',
      unitId: 'u18',
      title: 'Alfil contra caballo: alfil bueno y alfil malo',
      objective: 'Distinguir el alfil bueno del malo en finales con peones del mismo lado y encontrar la jugada exacta de alfil contra caballo.',
      conceptIds: ['endgame.king_pawn'],
      intro:
        'El alfil y el caballo valen lo mismo, pero en los finales con peones del mismo lado del tablero no rinden igual. Un alfil es malo cuando se mueve por casillas del mismo color que sus peones: les estorba y no puede atacar los peones rivales que están en casillas de color contrario. Es bueno cuando se mueve por casillas de color contrario. Aquí ves una pareja de posiciones casi idénticas, una ganada y otra en tablas, y practicas la jugada exacta en varios finales.',
      explanation: [
        {
          fen: '8/1B6/3K2p1/8/5n1P/k7/8/8 w - - 0 1',
          text: 'Juegan blancas. El peón de h4 está en una casilla oscura y el alfil de b7 se mueve por casillas claras: es un alfil bueno. Puede atacar el peón negro de g6, que está en casilla clara. Be4 lo ataca y las blancas ganan; Ke5 también gana.',
          squares: ['b7', 'h4', 'g6'],
          arrows: [['b7', 'e4']],
        },
        {
          fen: '8/B7/3K2p1/8/5n1P/k7/8/8 w - - 0 1',
          text: 'Juegan blancas. Es la misma posición, pero con el alfil en a7: se mueve por casillas oscuras, como el peón de h4. Es un alfil malo: no puede atacar el peón negro de g6, que está en casilla clara. La partida es tablas.',
          squares: ['a7', 'h4', 'g6'],
        },
      ],
      practice: [
        {
          fen: '8/2K3B1/3n4/2k2p2/5P2/8/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Alfil y peón contra caballo y peón. Solo una jugada gana: busca una casilla lejana desde la que el alfil ataque al caballo.',
          solutionUci: ['g7f8'],
          hint: 'El caballo de d6 solo lo protege el rey negro.',
          explanationCorrect: 'Correcto: Bf8 ataca al caballo de d6, que solo protege el rey negro. Es la única jugada que gana; las demás dejan tablas o pierden el alfil.',
          explanationWrong: 'Esa jugada no gana. Solo una jugada de alfil gana: la que ataca al caballo desde lejos.',
          wrongByMove: {
            g7d4: 'Bd4+ pierde el alfil: el rey negro de c5 lo captura.',
            g7h6: 'Bh6 deja escapar la victoria: son tablas.',
          },
        },
        {
          fen: '5K2/k7/1n6/7p/8/8/6P1/2B5 w - - 0 1',
          prompt: 'Juegan blancas. Alfil y peón contra caballo y peón. Solo una jugada gana: la que ataca al caballo de b6.',
          solutionUci: ['c1e3'],
          hint: 'El alfil puede atacar al caballo por la diagonal que pasa por c5.',
          explanationCorrect: 'Correcto: Be3 ataca al caballo de b6, que solo protege el rey negro. Es la única jugada que gana.',
          explanationWrong: 'Esa jugada no gana. Solo una jugada gana: la que ataca al caballo de b6 con el alfil.',
          wrongByMove: {
            c1b2: 'Bb2 deja escapar la victoria: son tablas.',
          },
        },
        {
          fen: '3K4/8/8/1B4Pp/8/6n1/8/4k3 w - - 0 1',
          prompt: 'Juegan blancas. El peón de g5 está en casilla oscura y el alfil de b5 se mueve por casillas claras: es un alfil bueno. Encuentra la única jugada que gana.',
          solutionUci: ['g5g6'],
          hint: 'No es una jugada de alfil.',
          explanationCorrect: 'Correcto: g6 es la única jugada que gana. El alfil de b5 se queda donde está y el peón avanza.',
          explanationWrong: 'Esa jugada no gana. Solo una jugada gana, y no la da el alfil.',
          wrongByMove: {
            b5e2: 'Be2 pierde el alfil: Nxe2.',
            b5a4: 'Ba4 deja escapar la victoria: son tablas.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4K3/3B4/1k6/7p/7P/8/8/n7 w - - 0 1',
          prompt: 'Juegan blancas. Alfil y peón contra caballo y peón. El caballo de a1 solo tiene dos casillas: b3 y c2. Quítaselas con el alfil.',
          solutionUci: ['d7a4'],
          hint: 'Una diagonal que pase por b3 y por c2.',
          explanationCorrect: 'Correcto: Ba4 controla b3 y c2, las dos casillas del caballo de a1. Es la única jugada que gana.',
          explanationWrong: 'Esa jugada no gana. Solo una gana: la que quita al caballo de a1 sus casillas b3 y c2.',
          wrongByMove: {
            d7g4: 'Bg4 deja escapar la victoria: son tablas.',
          },
        },
        {
          fen: '8/8/5p2/3k4/K7/8/7P/1nB5 w - - 0 1',
          prompt: 'Juegan blancas. El caballo de b1 solo tiene tres casillas: a3, c3 y d2. El alfil de c1 ya vigila d2. Atrapa al caballo con el rey.',
          solutionUci: ['a4b3'],
          alt: ['a4b4'],
          hint: 'El rey debe vigilar a3 y c3.',
          explanationCorrect: 'Correcto: Kb3 vigila a3 y c3, y el alfil vigila d2. Kb4 hace lo mismo y también gana; solo esas dos jugadas ganan.',
          explanationWrong: 'Esa jugada no gana. Solo ganan dos jugadas de rey: las que vigilan a3 y c3.',
          wrongByMove: {
            c1d2: 'Bd2 pierde el alfil: Nxd2.',
            a4a5: 'Ka5 deja escapar la victoria: son tablas.',
          },
        },
        {
          fen: 'k7/2K5/4B1p1/8/8/8/7P/7n b - - 0 1',
          prompt: 'Juegan negras. Tu caballo de h1 solo tiene dos casillas, f2 y g3, y en g3 lo captura el peón de h2. Salva las tablas.',
          solutionUci: ['h1f2'],
          alt: ['a8a7'],
          hint: 'Solo dos jugadas mantienen las tablas.',
          explanationCorrect: 'Correcto: Nf2 saca al caballo. Ka7 también mantiene las tablas; solo esas dos jugadas lo logran.',
          explanationWrong: 'Esa jugada pierde: solo dos jugadas mantienen las tablas.',
          wrongByMove: {
            h1g3: 'Ng3 pierde el caballo: hxg3.',
            g6g5: 'g5 pierde la partida.',
          },
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u18.l03',
      unitId: 'u18',
      title: 'Convertir la ventaja: cambiar piezas, no peones',
      objective: 'Con ventaja de material, simplificar cambiando piezas y mantener los peones en vez de cambiarlos.',
      conceptIds: ['endgame.king_pawn'],
      intro:
        'Ganar material es solo la mitad del trabajo: hay que convertirlo en victoria. La regla práctica es cambiar piezas y no cambiar peones. Cada pieza que desaparece deja menos defensas y menos contrajuego al rival; en cambio, cada peón que desaparece te quita material con el que ganar. Aquí ves posiciones concretas en las que el cambio de piezas gana y el cambio de peones solo da tablas.',
      explanation: [
        {
          fen: '8/3k4/1P2r3/8/8/8/7P/2K1R3 w - - 0 1',
          text: 'Juegan blancas. Tienen torre y dos peones contra torre. Las torres se miran en la columna e y la negra está protegida por el rey de d7. Rxe6 cambia las torres y las blancas ganan con sus dos peones. Si apartan la torre con Rf1, son tablas; si la dejan en e1, como con Kc2, pierden la torre.',
          squares: ['e1', 'e6'],
          arrows: [['e1', 'e6']],
        },
        {
          fen: '3K4/8/1P6/k7/1p6/P7/8/8 w - - 0 1',
          text: 'Juegan blancas. Tienen dos peones contra uno. Cambiar peones con axb4+ deja tablas. Mantener los peones gana: b7 y Kc7 ganan, y b7 lleva el peón de la sexta a la séptima fila.',
          squares: ['a3', 'b4', 'b6'],
          arrows: [['b6', 'b7']],
        },
      ],
      practice: [
        {
          fen: '8/8/5P2/6N1/3K1k2/5n2/3P4/8 w - - 0 1',
          prompt: 'Juegan blancas. Tienen caballo y dos peones contra caballo. Cambia las piezas y conserva los peones.',
          solutionUci: ['g5f3'],
          hint: 'El caballo negro ataca a tus peones y lo protege su rey.',
          explanationCorrect: 'Correcto: Nxf3 cambia los caballos y quedan dos peones contra un rey solo. Es la única jugada que gana.',
          explanationWrong: 'Esa jugada no gana. Con ventaja, cambia las piezas: solo el cambio de caballos gana.',
          wrongByMove: {
            d4d3: 'Kd3 deja escapar la victoria: son tablas.',
          },
        },
        {
          fen: '8/8/8/2P3K1/2pk4/3P4/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Tienen dos peones contra uno. No cambies peones: busca la única jugada que gana.',
          solutionUci: ['c5c6'],
          hint: 'El peón de c5 puede avanzar sin cambiarse.',
          explanationCorrect: 'Correcto: c6 conserva los dos peones y es la única jugada que gana.',
          explanationWrong: 'Esa jugada no gana. Solo una jugada gana, y no es cambiar los peones.',
          wrongByMove: {
            d3c4: 'dxc4 cambia los peones y deja tablas.',
          },
        },
        {
          fen: '1K2R3/P7/8/2P5/8/8/8/3kr3 w - - 0 1',
          prompt: 'Juegan blancas. Tienen torre y dos peones contra torre. Cambia las torres antes de avanzar los peones.',
          solutionUci: ['e8e1'],
          hint: 'Tu torre ataca a la torre negra, que protege su rey.',
          explanationCorrect: 'Correcto: Rxe1+ cambia las torres y los dos peones ganan contra el rey solo. Es la forma de ganar más rápida.',
          explanationWrong: 'Esa jugada no es la más precisa: la victoria se alarga o se escapa. Cambia las torres.',
        },
      ],
      evaluation: [
        {
          fen: '1k5K/2n5/4N3/8/P7/6P1/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Tienen caballo y dos peones contra caballo. Cambia las piezas para convertir la ventaja.',
          solutionUci: ['e6c7'],
          hint: 'El caballo negro lo protege el rey.',
          explanationCorrect: 'Correcto: Nxc7 cambia los caballos y gana lo antes posible. Otras jugadas de caballo también ganan, pero tardan más.',
          explanationWrong: 'Esa jugada no es la más precisa: la victoria se alarga o se escapa. Cambia los caballos.',
          wrongByMove: {
            g3g4: 'g4 deja escapar la victoria: son tablas.',
            a4a5: 'a5 deja escapar la victoria: son tablas.',
          },
        },
        {
          fen: '8/5k2/5p2/4P3/2K5/8/5P2/8 w - - 0 1',
          prompt: 'Juegan blancas. Tienen dos peones contra uno. No cambies peones: acerca el rey.',
          solutionUci: ['c4d5'],
          hint: 'El rey debe ir a una casilla que apoye al peón de e5.',
          explanationCorrect: 'Correcto: Kd5 mantiene los dos peones y gana lo antes posible. exf6 cambiaría los peones y sería tablas.',
          explanationWrong: 'Esa jugada no es la más precisa: la victoria se alarga o se escapa. Mantén los peones y acerca el rey.',
          wrongByMove: {
            e5f6: 'exf6 cambia los peones y deja tablas.',
          },
        },
        {
          fen: '8/8/2P5/1K3P2/8/8/4k3/R4r2 w - - 0 1',
          prompt: 'Juegan blancas. Tienen torre y dos peones contra torre. Cambia las torres.',
          solutionUci: ['a1f1'],
          hint: 'La torre negra la protege su rey.',
          explanationCorrect: 'Correcto: Rxf1 cambia las torres y los dos peones ganan contra el rey solo. Es la forma de ganar más rápida.',
          explanationWrong: 'Esa jugada no es la más precisa: la victoria se alarga o se escapa. Cambia las torres.',
        },
      ],
    },
  ],
};
