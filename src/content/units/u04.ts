import type { Unit } from '../schema.js';

/**
 * Unidad 4 · Mates básicos (iniciación, 400-800 Elo).
 * Todas las posiciones de práctica y evaluación se verifican por código en test/content/unitsB.test.ts:
 * FEN legal, solución legal, jaque mate real y único (mate en 1) o mate forzado (mate en 2).
 */
export const unit: Unit = {
  id: 'u04',
  order: 4,
  title: 'Mates básicos',
  description:
    'Aprende a terminar la partida: mate de escalera y del pasillo, mate con dama o torre apoyadas por el rey, mate de la coz, mate del pastor (y cómo evitarlo) y los primeros mates en dos jugadas.',
  level: 'initiation',
  requires: ['u03'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u04.l01',
      unitId: 'u04',
      title: 'Mate de escalera y mate del pasillo',
      objective:
        'Dar mate en una jugada con las torres: la escalera (dos torres) y el mate del pasillo (el rey encerrado por sus propios peones).',
      conceptIds: ['tactics.mate_threat'],
      intro:
        'Ganar material está bien, pero la partida se gana dando jaque mate. Los dos mates más frecuentes en las partidas de principiantes se dan con torres: la escalera, donde dos torres se turnan para empujar al rey hacia el borde, y el mate del pasillo, donde el rey no puede escapar porque sus propios peones le tapan las casillas. Aprender a verlos te permite ganar y, sobre todo, no sufrirlos.',
      explanation: [
        {
          fen: '7k/1R6/8/8/8/8/8/R5K1 w - - 0 1',
          text: 'Mate de escalera. La torre de b7 corta la fila 7: el rey negro no puede pisar g7 ni h7. Ahora la otra torre da jaque en la fila 8 con Ra8 y el rey no tiene escapatoria: g7 y h7 las cubre la primera torre, g8 la cubre la segunda. Dos torres, una por fila, empujan al rey hasta el borde.',
          squares: ['g7', 'h7'],
          arrows: [
            ['b7', 'h7'],
            ['a1', 'a8'],
          ],
        },
        {
          fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
          text: 'Mate del pasillo. El rey negro está en la última fila con sus tres peones delante: f7, g7 y h7 le quitan las casillas por las que podría huir. Con Ra8 se da jaque a lo largo de la fila 8 y no hay ni casilla libre, ni pieza que se interponga, ni forma de capturar la torre. Es mate.',
          squares: ['f7', 'g7', 'h7'],
          arrows: [['a1', 'a8']],
        },
        {
          fen: '6k1/5pp1/7p/8/8/8/5PPP/R5K1 w - - 0 1',
          text: 'Cómo evitarlo: haz un hueco («luft») para tu rey. Aquí el peón negro ya jugó h6, de modo que si la torre da jaque con Ra8+ el rey escapa a h7 y no hay mate. Un solo movimiento de peón (h3, g3 o h6, según el bando) basta para que el pasillo deje de ser una trampa.',
          squares: ['h7'],
          arrows: [['g8', 'h7']],
        },
      ],
      practice: [
        {
          fen: '7k/R7/1R6/8/8/8/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Una torre ya corta la fila 7. Da mate en una jugada con la otra.',
          solutionUci: ['b6b8'],
          hint: 'El rey está en h8: busca el jaque que cubra toda la fila 8.',
          explanationCorrect:
            'Correcto: Rb8#. La torre de a7 impide g7 y h7, y la de b8 da jaque y cubre g8. Es la escalera completa.',
          explanationWrong:
            'No es mate. Para mate necesitas jaque y que el rey no pueda huir: la torre de a7 ya cubre la fila 7, así que el jaque debe darse en la fila 8 con la otra torre.',
          wrongByMove: {
            a7a8: 'Ra8+ es jaque, pero al dejar la fila 7 libre el rey escapa a g7. Mantén esa torre cortando la fila 7.',
            b6g6: 'Rg6 no da jaque; además deja al rey negro sin jugadas legales y eso sería tablas por ahogado, no victoria.',
          },
        },
        {
          fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. El rey negro está encerrado por sus peones. Da mate.',
          solutionUci: ['e1e8'],
          hint: 'La columna e está libre hasta la fila 8.',
          explanationCorrect:
            'Correcto: Re8#. Es el mate del pasillo: f7, g7 y h7 tapan al rey y la torre cubre toda la fila 8, incluida f8. El rey no puede capturarla porque está a dos casillas.',
          explanationWrong:
            'No es mate. Busca el jaque que llegue a la última fila: el rey no tiene casillas libres porque sus propios peones se las quitan.',
        },
        {
          fen: '4r1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1',
          prompt: 'Juegan negras. El rey blanco también está encerrado por sus peones. Da mate.',
          solutionUci: ['e8e1'],
          hint: 'El mismo patrón, visto desde el otro lado del tablero.',
          explanationCorrect:
            'Correcto: Re1#. El mate del pasillo funciona igual con negras: f2, g2 y h2 cierran la salida del rey blanco y no hay ninguna pieza blanca que pueda interponerse.',
          explanationWrong:
            'No es mate. El rey blanco no tiene casillas libres; solo hace falta un jaque a lo largo de la primera fila que nadie pueda parar.',
        },
      ],
      evaluation: [
        {
          fen: 'k7/6R1/7R/8/8/8/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Escalera con el rey negro en la esquina contraria. Da mate.',
          solutionUci: ['h6h8'],
          hint: 'Una torre corta la fila 7; la otra da jaque en la fila 8.',
          explanationCorrect:
            'Correcto: Rh8#. La torre de g7 cubre a7 y b7, y Rh8 da jaque y cubre b8. Es la misma escalera, en el otro lado.',
          explanationWrong:
            'No es mate. Repasa: una torre ya corta la fila 7, así que el jaque tiene que darse en la fila 8 con la otra.',
          wrongByMove: {
            g7a7: 'Ra7+ es jaque, pero la torre queda pegada al rey y sin protección: el rey la captura (Kxa7).',
          },
        },
        {
          fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
          prompt: 'Juegan blancas. Hay una torre negra en la columna d, pero algo la deja sin ayuda. Da mate.',
          solutionUci: ['d1d8'],
          hint: 'Capturar con jaque puede ser mate si nadie recaptura.',
          explanationCorrect:
            'Correcto: Rxd8#. La torre negra cubría la columna, pero la torre blanca la captura con jaque y ninguna pieza negra puede recapturar; los peones siguen tapando al rey.',
          explanationWrong:
            'No es mate. Fíjate en la torre negra de d8: está sola, y capturarla con jaque deja al rey sin salida.',
        },
        {
          fen: '6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1',
          prompt: 'Juegan blancas. El mate del pasillo también se da con la dama.',
          solutionUci: ['d1d8'],
          hint: 'La dama llega a la fila 8 por la columna d.',
          explanationCorrect:
            'Correcto: Qd8#. La dama da jaque a lo largo de la fila 8 y los tres peones siguen tapando al rey: cualquier pieza de largo alcance sirve para el mate del pasillo.',
          explanationWrong:
            'No es mate. Busca el jaque en la última fila; el rey no tiene ninguna casilla libre.',
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u04.l02',
      unitId: 'u04',
      title: 'Dama o torre apoyadas por el rey',
      objective:
        'Dar mate en una jugada con dama o torre ayudadas por tu rey, y evitar el ahogado.',
      conceptIds: ['tactics.mate_threat'],
      intro:
        'En los finales, el rey es una pieza de ataque. Un jaque de dama o torre solo es mate si todas las casillas de escape están cubiertas, y el rey propio puede cubrir muchas de ellas. En esta lección verás el patrón básico (rey junto al rey rival y pieza que da jaque a distancia) y el gran peligro de esos finales: dejar al rival sin jugadas legales y regalar tablas.',
      explanation: [
        {
          fen: 'k7/8/1K6/8/8/8/8/6Q1 w - - 0 1',
          text: 'Dama y rey. El rey blanco en b6 cubre a7, b7 y c7: el rey negro no puede acercarse. Con Qg8 la dama da jaque por la fila 8 y cubre también b8. Todas las casillas están vigiladas: es mate. El rey y la dama se reparten el trabajo: el rey cierra las casillas cercanas, la dama da el jaque desde lejos.',
          squares: ['a7', 'b7', 'b8'],
          arrows: [['g1', 'g8']],
        },
        {
          fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1',
          text: 'Torre y rey. Es la misma idea con una torre: el rey en g6 cubre g7 y h7, y Ra8 da jaque en la última fila y cubre g8. Fíjate en que el rey rival está en el borde y que los dos reyes están en «oposición» (separados por una casilla): eso es lo que permite que el rey propio quite las casillas de escape.',
          squares: ['g7', 'h7', 'g8'],
          arrows: [['a1', 'a8']],
        },
        {
          fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',
          text: 'Cuidado con el ahogado. Aquí juegan negras: su rey no está en jaque y ninguna casilla es legal (g8, g7 y h7 las vigila la dama). Si el jugador sin jugadas legales no está en jaque, la partida es tablas. Antes de mover, pregúntate siempre: después de mi jugada, ¿tiene el rival alguna jugada legal?',
          squares: ['g8', 'g7', 'h7'],
          arrows: [['f7', 'h7']],
        },
      ],
      practice: [
        {
          fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',
          prompt: 'Juegan blancas. Tu rey ayuda a la dama. Da mate en una jugada.',
          solutionUci: ['g1g7'],
          hint: 'Busca una casilla donde la dama dé jaque y esté protegida por el rey.',
          explanationCorrect:
            'Correcto: Qg7#. La dama está al lado del rey negro y protegida por tu rey de f6, así que no se puede capturar; además cubre g8 y h7.',
          explanationWrong:
            'No es mate. La dama debe dar jaque desde una casilla protegida por tu rey; si no, el rey negro la captura o se escapa.',
          wrongByMove: {
            g1g6: 'Qg6 deja al rey negro sin jugadas legales y sin estar en jaque: es ahogado, tablas. ¡Cuidado con ese error!',
            g1h1: 'Qh1+ es jaque, pero el rey negro escapa a g8. Para mate hay que cubrir también esa casilla.',
          },
        },
        {
          fen: 'k7/8/1K6/8/8/8/8/6R1 w - - 0 1',
          prompt: 'Juegan blancas. Mate con torre y rey.',
          solutionUci: ['g1g8'],
          hint: 'Tu rey ya vigila a7 y b7; falta dar el jaque por la última fila.',
          explanationCorrect:
            'Correcto: Rg8#. El rey de b6 cubre a7, b7 y c7, y la torre da jaque por la fila 8 cubriendo b8.',
          explanationWrong:
            'No es mate. Tu rey cubre a7 y b7: el jaque tiene que darse por la última fila, donde la torre vigila también b8.',
          wrongByMove: {
            g1a1: 'Ra1+ es jaque por la columna a, pero el rey negro escapa a b8. La fila 8 es la que debes tomar.',
          },
        },
        {
          fen: '6q1/8/8/8/8/5k2/8/7K b - - 0 1',
          prompt: 'Juegan negras. Mate con dama y rey contra el rey blanco en la esquina.',
          solutionUci: ['g8g2'],
          hint: 'Tu rey está en f3; la dama necesita una casilla junto al rey rival protegida por él.',
          explanationCorrect:
            'Correcto: Qg2#. La dama está protegida por el rey de f3, así que el rey blanco no puede capturarla, y cubre g1, h2 y h1.',
          explanationWrong:
            'No es mate. Busca la casilla pegada al rey blanco que tu propio rey proteja.',
          wrongByMove: {
            g8g3: 'Qg3 no da jaque y el rey blanco no tiene jugadas legales: ahogado, tablas.',
          },
        },
        {
          fen: '5k2/8/5K2/8/8/8/8/3Q4 w - - 0 1',
          prompt: 'Juegan blancas. Los reyes están frente a frente con una casilla entre medio. Da mate.',
          solutionUci: ['d1d8'],
          hint: 'La última fila está libre y tu rey cubre e7, f7 y g7.',
          explanationCorrect:
            'Correcto: Qd8#. Tu rey de f6 cubre e7, f7 y g7, y la dama da jaque en la fila 8 vigilando e8 y g8.',
          explanationWrong:
            'No es mate. Tu rey ya tapa la fila 7; el jaque debe darse por la fila 8.',
          wrongByMove: {
            d1d6: 'Qd6+ es jaque, pero el rey negro se escapa a e8 o a g8: la dama no cubre esas casillas.',
          },
        },
      ],
      evaluation: [
        {
          fen: '7k/8/6K1/8/8/8/8/1Q6 w - - 0 1',
          prompt: 'Juegan blancas. Tu rey está en g6 y la dama en b1. Da mate.',
          solutionUci: ['b1b8'],
          hint: 'El rey negro está en la esquina; falta cubrir la última fila.',
          explanationCorrect:
            'Correcto: Qb8#. El rey de g6 cubre g7 y h7, y la dama da jaque por la fila 8 vigilando g8.',
          explanationWrong:
            'No es mate. Tu rey cubre g7 y h7: solo falta el jaque a lo largo de la última fila.',
          wrongByMove: {
            b1b3: 'Qb3 no da jaque y deja al rey negro sin jugadas legales: ahogado, tablas.',
          },
        },
        {
          fen: '4k3/8/4K3/8/8/8/8/7R w - - 0 1',
          prompt: 'Juegan blancas. Los reyes están en oposición. Da mate con la torre.',
          solutionUci: ['h1h8'],
          hint: 'Tu rey cubre d7, e7 y f7. ¿Qué fila falta?',
          explanationCorrect:
            'Correcto: Rh8#. El rey de e6 impide d7, e7 y f7 y la torre da jaque en la fila 8, cubriendo d8 y f8.',
          explanationWrong:
            'No es mate. Tu rey ya cubre la fila 7; la torre debe dar el jaque en la fila 8.',
        },
        {
          fen: '1r6/8/8/8/8/8/2k5/K7 b - - 0 1',
          prompt: 'Juegan negras. Tu rey está en c2 junto al rey blanco de a1. Da mate con la torre.',
          solutionUci: ['b8a8'],
          hint: 'Tu rey cubre b1 y b2; falta cerrar la casilla a2.',
          explanationCorrect:
            'Correcto: Ra8#. El rey de c2 cubre b1 y b2 y la torre da jaque por la columna a, cubriendo a2.',
          explanationWrong:
            'No es mate. Tu rey cubre b1 y b2; el jaque debe darse por la columna a, que cierra a2.',
          wrongByMove: {
            b8b2: 'Rb2 no da jaque y deja al rey blanco sin jugadas legales: ahogado, tablas.',
          },
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u04.l03',
      unitId: 'u04',
      title: 'Mate de la coz y mate del pastor',
      objective:
        'Reconocer y dar el mate de la coz y el mate del pastor, y saber defenderte del segundo.',
      conceptIds: ['tactics.mate_threat'],
      intro:
        'Estos dos mates son famosos por una razón. El mate de la coz lo da un caballo contra un rey rodeado de sus propias piezas. El mate del pastor lo intentan muchos principiantes en las primeras jugadas, apuntando al peón de f7 (o f2), que solo está defendido por el rey. Si sabes dar el primero, sabrás ver el patrón en el tablero; si sabes defenderte del segundo, no perderás en cuatro jugadas.',
      explanation: [
        {
          fen: '6rk/5Npp/8/8/8/8/8/6K1 b - - 0 1',
          text: 'Mate de la coz (o ahogado del caballo). El rey negro en h8 está rodeado por su propia torre en g8 y los peones g7 y h7: no tiene ninguna casilla libre. El caballo en f7 da jaque (ataca h8) y nadie puede capturarlo. El caballo es la única pieza que salta sobre las demás, por eso este mate funciona cuando el rey está encajonado por sus propias piezas.',
          squares: ['f7', 'g8', 'g7', 'h7'],
          arrows: [['f7', 'h8']],
        },
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
          text: 'Mate del pastor. La dama en h5 y el alfil en c4 apuntan los dos a f7, que solo defiende el rey. Qxf7 sería mate: el alfil protege a la dama, el rey no puede capturarla y e7 y e8 las cubre la propia dama. Por ejemplo: 1.e4 e5 2.Bc4 Nc6 3.Qh5: dos piezas contra un punto débil.',
          squares: ['f7'],
          arrows: [
            ['h5', 'f7'],
            ['c4', 'f7'],
          ],
        },
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 4 4',
          text: 'Cómo defenderte. Antes de mover, mira la amenaza (Qxf7#). Hay dos formas de pararla: proteger f7 con Qf6 o Qe7, o echar a la dama con g6, que la ataca. Lo que NO vale es Nf6: parece atacar a la dama, pero no protege f7 y Qxf7 sigue siendo mate. Regla: cuando dos piezas rivales apuntan a f7 (o f2), cuenta atacantes y defensores antes de seguir con tu plan.',
          squares: ['f7'],
          arrows: [
            ['d8', 'f6'],
            ['d8', 'e7'],
          ],
        },
      ],
      practice: [
        {
          fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. El rey negro está encajonado por su torre y sus peones. Da mate con el caballo.',
          solutionUci: ['g5f7'],
          hint: 'El caballo debe atacar la casilla h8.',
          explanationCorrect:
            'Correcto: Nf7#. El caballo ataca h8; el rey no puede ir a g8 (torre), g7 ni h7 (peones) y nadie captura el caballo. Es el mate de la coz.',
          explanationWrong:
            'No es mate. El rey no tiene casillas libres: lo que falta es un jaque que no pueda capturarse; solo un caballo en f7 ataca h8 sin que nadie pueda recapturarlo.',
          wrongByMove: {
            g5h7: 'Nxh7 no da jaque y el rey negro simplemente captura el caballo (Kxh7). El caballo debe ir a f7.',
          },
        },
        {
          fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
          prompt: 'Juegan blancas. Las negras sacaron el caballo pero olvidaron proteger f7. Da mate.',
          solutionUci: ['h5f7'],
          hint: 'Dos de tus piezas atacan f7; la que captura está protegida por la otra.',
          explanationCorrect:
            'Correcto: Qxf7#. El alfil de c4 protege la dama, el rey no puede capturarla ni escapar (e7 y e8 las cubre la dama) y el caballo de f6 no llega a f7. Es el mate del pastor.',
          explanationWrong:
            'No es mate. Fíjate en el punto débil f7: la dama capturando allí, protegida por el alfil, termina la partida.',
          wrongByMove: {
            h5e5: 'Qxe5+ es jaque, pero el caballo de c6 captura la dama (Nxe5). Pierdes la dama teniendo un mate en una jugada.',
          },
        },
        {
          fen: 'rnbqk1nr/pppp1ppp/8/2b1p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3',
          prompt: 'Juegan negras. Las blancas amenazan Qxf7#. Defiéndete con una jugada sólida.',
          solutionUci: ['d8e7'],
          hint: 'Defender f7 con la dama no te cuesta material.',
          explanationCorrect:
            'Correcto: Qe7. La dama defiende f7 y también el peón de e5. Qf6 también servía. Lo importante es ver la amenaza de mate antes de seguir con tu plan.',
          explanationWrong:
            'Esa jugada no resuelve la amenaza de Qxf7# o cuesta material. Las defensas buenas son Qe7 y Qf6; Nh6 pierde el peón de e5 y g6 pierde material por Qxe5+.',
          wrongByMove: {
            g8f6: 'Nf6 parece atacar la dama, pero deja f7 sin defensa suficiente: Qxf7 es mate.',
            g7g6: 'g6 ataca la dama, pero abre la diagonal: Qxe5+ y después Qxh8 ganan material.',
            d8h4: 'Qh4 no defiende f7 y pierde la dama: la dama blanca la captura en h4.',
          },
        },
      ],
      evaluation: [
        {
          fen: 'kr6/pp6/8/3N4/8/8/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. El mate de la coz en el otro lado del tablero.',
          solutionUci: ['d5c7'],
          hint: 'El rey está en a8 rodeado de su torre y sus peones.',
          explanationCorrect:
            'Correcto: Nc7#. El caballo ataca a8; b8 la ocupa la torre y a7 y b7 los peones. Es la misma imagen del mate de la coz, reflejada.',
          explanationWrong:
            'No es mate. El caballo debe saltar a una casilla desde la que ataque a8 sin que nadie lo capture.',
          wrongByMove: {
            d5b6: 'Nb6+ es jaque, pero los peones lo capturan (axb6) y no hay mate.',
          },
        },
        {
          fen: 'rnb1k1nr/pppp1ppp/8/1Nb1p3/4P2q/3P4/PPP2PPP/R1BQKBNR b KQkq - 1 4',
          prompt: 'Juegan negras. El mate del pastor, pero a favor de las negras. Da mate.',
          solutionUci: ['h4f2'],
          hint: 'El punto débil blanco es f2, que solo protege el rey.',
          explanationCorrect:
            'Correcto: Qxf2#. El alfil de c5 protege la dama, el rey no puede capturarla ni escapar (d2 y e2 las cubre la dama). El mismo patrón, ahora contra f2.',
          explanationWrong:
            'No es mate. El peón de f2 solo lo defiende el rey; capturarlo con la dama, protegida por el alfil, termina la partida.',
          wrongByMove: {
            c5f2: 'Bxf2+ es jaque, pero no es mate: el rey blanco tiene casillas de huida. La dama debe capturar en f2.',
          },
        },
        {
          fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
          prompt: 'Juegan blancas. Otra versión del mate del pastor, con la dama en f3.',
          solutionUci: ['f3f7'],
          hint: 'La dama y el alfil apuntan al mismo punto.',
          explanationCorrect:
            'Correcto: Qxf7#. La dama en f3 también ve f7 por la columna f y el alfil la protege. Da igual por dónde llegue la dama.',
          explanationWrong:
            'No es mate. Dos piezas atacan f7 y solo el rey la defiende: captura con la dama.',
          wrongByMove: {
            c4f7: 'Bxf7+ es jaque, pero no es mate: el rey escapa a e7. La dama es la que debe capturar en f7.',
          },
        },
      ],
    },

    // ───────────────────────────── l04 ─────────────────────────────
    {
      id: 'u04.l04',
      unitId: 'u04',
      title: 'Mate en dos jugadas',
      objective:
        'Encontrar mates en dos jugadas sencillos: primero se limita al rey o se fuerza una respuesta, después se da mate.',
      conceptIds: ['tactics.mate_threat'],
      intro:
        'A veces el mate no se da en la primera jugada, pero sí en la segunda, y la clave es que la primera jugada deje al rival sin elección útil. Hay dos ideas que se repiten: encerrar al rey con una pieza (la escalera) y dar un jaque que obliga a una única respuesta, tras la cual llega el mate. Para calcular, pregúntate dos cosas: ¿qué jugadas legales tiene el rival? y ¿en cuál de ellas sigo teniendo mate?',
      explanation: [
        {
          fen: '6k1/8/8/8/8/8/2K5/R6R w - - 0 1',
          text: 'Escalera con dos torres. Primero Ra7: la torre corta la fila 7 y el rey negro solo puede ir a f8 (h8 la cubre la torre de h1 por la columna h). Después de cualquier movimiento del rey (aquí solo hay uno), Rh8 es mate. La primera jugada no da jaque, pero quita todas las casillas útiles.',
          squares: ['f7', 'g7', 'h7', 'h8'],
          arrows: [
            ['a1', 'a7'],
            ['h1', 'h8'],
          ],
        },
        {
          fen: '6k1/5ppp/8/8/7q/8/5PPP/Q5K1 w - - 0 1',
          text: 'Jaque que fuerza la respuesta. Qa8+ obliga a las negras a interponerse: solo pueden jugar Qd8 con la dama de h4 (el rey no tiene casillas). Pero entonces Qxd8 es mate, porque no hay ninguna pieza negra que pueda recapturar. Un jaque con una sola respuesta se calcula de forma fiable.',
          squares: ['d8'],
          arrows: [
            ['a1', 'a8'],
            ['h4', 'd8'],
          ],
        },
        {
          fen: 'k2K4/8/8/8/5Q2/8/8/8 w - - 0 1',
          text: 'Jugada tranquila con el rey. Con el rey blanco en d8 y el negro en a8, el rey blanco sube a c7 y lo encierra: el rey negro solo puede ir a a7, y entonces Qa4 es mate. Atención: la jugada tentadora Qc7 (dama a c7) deja al rey sin movimientos y sin estar en jaque (ahogado, tablas). Mira siempre si el rival conserva al menos una jugada legal.',
          squares: ['a7', 'b7', 'b8'],
          arrows: [
            ['d8', 'c7'],
            ['f4', 'a4'],
          ],
        },
      ],
      practice: [
        {
          fen: '4k3/8/6R1/8/8/5R2/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas. Empieza cortando la fila 7.',
          solutionUci: ['g6g7', 'e8d8', 'f3f8'],
          hint: 'La torre de g6 puede ir a la fila 7; la otra dará el mate en la fila 8.',
          explanationCorrect:
            'Correcto: Rg7 corta la fila 7. El rey solo puede ir a d8 (f8 la cubre la torre de f3), y Rf8# es mate. Primero encierras, después das jaque.',
          explanationWrong:
            'Esa jugada no fuerza el mate. La idea es cortar la fila 7 con una torre para que la otra dé mate en la última fila.',
          wrongByMove: {
            g6g8: 'Rg8+ da jaque pero el rey escapa por la fila 7 (Kd7): has gastado el jaque sin encerrar al rey.',
          },
        },
        {
          fen: '6k1/5ppp/8/8/2r5/8/Q4PPP/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas con un jaque que fuerza una única respuesta.',
          solutionUci: ['a2a8', 'c4c8', 'a8c8'],
          hint: 'El jaque en la última fila solo puede pararse con una interposición.',
          explanationCorrect:
            'Correcto: Qa8+ obliga a la torre a interponerse en c8 (no hay otra respuesta) y Qxc8# es mate: la torre queda sin protección y nada puede recapturar.',
          explanationWrong:
            'No era la solución. Mira los jaques: Qa8+ obliga a interponer la torre y después puedes capturarla con mate.',
        },
        {
          fen: '6k1/3R1ppp/8/4q3/8/8/5PPP/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas. La dama negra parece defender, pero está lejos.',
          solutionUci: ['d7d8', 'e5e8', 'd8e8'],
          hint: 'Da jaque en la última fila: ¿qué puede responder el negro?',
          explanationCorrect:
            'Correcto: Rd8+ solo se puede parar con Qe8, y Rxe8# es mate. El jaque en la última fila tiene una única respuesta, y por eso el cálculo es sencillo.',
          explanationWrong:
            'No era la solución. Busca el jaque en la última fila: tiene una única respuesta y después hay mate.',
        },
        {
          fen: '8/8/8/5K2/8/7k/8/3Q4 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas contra el rey de h3. Cuidado con el ahogado.',
          solutionUci: ['d1g1', 'h3h4', 'g1h2'],
          hint: 'Una jugada tranquila de la dama deja al rey una única casilla.',
          explanationCorrect:
            'Correcto: Qg1 deja al rey solo con h4, y Qh2# es mate (tu rey de f5 cubre g4 y g5). La jugada tranquila quita las casillas y no ahoga porque aún queda h4.',
          explanationWrong:
            'Esa jugada no fuerza el mate. Busca una casilla para la dama que deje al rey una única salida y no lo ahogue.',
          wrongByMove: {
            d1h5: 'Qh5+ da jaque, pero el rey escapa a g3 y ya no hay mate forzado.',
          },
        },
      ],
      evaluation: [
        {
          fen: '8/R7/8/8/7k/R7/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas contra el rey de h4.',
          solutionUci: ['a7g7', 'h4h5', 'a3h3'],
          hint: 'Primero corta la columna g con una torre.',
          explanationCorrect:
            'Correcto: Rg7 corta la columna g. El rey solo puede ir a h5, y Rh3# es mate (la torre de g7 cubre g4, g5 y g6).',
          explanationWrong:
            'No era la solución. Empieza cortando una columna con una torre para que el rey se quede en el borde.',
        },
        {
          fen: '6k1/5ppp/8/8/7q/R7/5PPP/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas con jaque forzado.',
          solutionUci: ['a3a8', 'h4d8', 'a8d8'],
          hint: 'Piensa en lo que pasa con la dama negra cuando tengas que interponerla.',
          explanationCorrect:
            'Correcto: Ra8+ obliga a Qd8, y Rxd8# es mate. Una interposición forzada con la pieza equivocada deja de ser una defensa.',
          explanationWrong:
            'No era la solución. El jaque en la última fila obliga a interponer y después se puede capturar con mate.',
        },
        {
          fen: '6k1/2n2ppp/8/8/3R4/8/5PPP/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['d4d8', 'c7e8', 'd8e8'],
          hint: 'El caballo negro será la única pieza que pueda interponerse.',
          explanationCorrect:
            'Correcto: Rd8+ solo se puede parar con Ne8, y Rxe8# es mate. El caballo interpuesto no está protegido.',
          explanationWrong:
            'No era la solución. Busca el jaque en la última fila que obligue al caballo a interponerse.',
        },
      ],
    },
  ],
};
