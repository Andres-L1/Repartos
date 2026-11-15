import type { Unit } from '../schema.js';

/**
 * Unidad 12 · Defensa precisa y cálculo largo (competitivo, 1700 Elo o más).
 * Pendiente de validación de profesores. Todas las posiciones son puzles de la base de datos de Lichess (CC0; id del
 * puzle en un comentario), casi todos con el tema de la lección; qQ0EY viene etiquetado como defensiveMove y su
 * remate (Bb8) es una interferencia de libro. Los textos son propios. Verificación con Stockfish 16
 * a profundidad 18 (scripts/verify-fase4.mts u12): cada jugada del alumno es la mejor y única, las del rival son su
 * mejor defensa o equivalentes, los mates son forzados y, en la lección de defensa, cualquier otra primera jugada
 * queda al menos 1,5 peones por debajo. Por código, test/content/unitsD.test.ts (legalidad, mates y balance final).
 */
export const unit: Unit = {
  id: 'u12',
  order: 12,
  title: 'Defensa precisa y cálculo largo',
  description:
    'Encontrar la única jugada que salva una posición, cortar y abrir líneas con interferencias y despejes, y calcular combinaciones largas que mezclan varios temas.',
  level: 'competitive',
  requires: ['u11'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u12.l01',
      unitId: 'u12',
      title: 'La única jugada que salva',
      objective:
        'Ante un jaque o una amenaza, revisar todas las respuestas y elegir la única que no pierde, aunque no sea la más natural.',
      conceptIds: ['tactics.defensive_move'],
      intro:
        'En las posiciones críticas, a menudo solo una jugada salva la partida. Pasa sobre todo cuando estás en jaque o el rival amenaza algo grave: varias respuestas parecen razonables, pero solo una aguanta. El método es el del ataque, pero al revés. Para cada candidata, mira qué jaques y amenazas le quedan al rival. Elige la casilla del rey donde se acaban los jaques, o la jugada que corta a tiempo el plan rival.',
      explanation: [
        {
          fen: '6k1/p1R1R3/1p2p1p1/7p/7P/6P1/3q2K1/8 w - - 0 1', // Lichess 7QDOY
          text: 'La dama negra da jaque y busca el jaque perpetuo. Con Kf3, Kf1, Kg1 o Kh1 los jaques siguen y la partida es tablas. En h3 solo quedan jaques que regalan la dama (Qh2+ o Qg2+): el peón negro de e6 tapa la diagonal d7-h3 y tu peón de g3, la tercera fila. Kh3 conserva la ventaja de tus torres en la séptima fila.',
          squares: ['h3', 'e6', 'g3'],
          arrows: [['g2', 'h3']],
        },
        {
          fen: '5rk1/R5p1/1pbNp3/4P3/7P/2p4P/2R2r2/6K1 w - - 0 1', // Lichess daWNm
          text: 'La torre de f2, apoyada por la de f8, ataca tu torre de c2, y el peón de c3 está a dos pasos de coronar. Rxf2 Rxf2 Kxf2 cambia las torres. Tras c2, Ra1 llega justo a tiempo a la primera fila: controla c1 y el peón no puede coronar.',
          squares: ['f2', 'c2', 'c1'],
          arrows: [
            ['c2', 'f2'],
            ['a7', 'a1'],
          ],
        },
      ],
      practice: [
        {
          fen: '5rk1/R5p1/1pbNp3/4P3/7P/2p4P/2R2r2/6K1 w - - 0 1', // Lichess daWNm
          prompt: 'Juegan blancas. Tu torre de c2 está atacada y el peón de c3 quiere avanzar. Encuentra la defensa que salva la partida.',
          solutionUci: ['c2f2', 'f8f2', 'g1f2', 'c3c2', 'a7a1'],
          hint: 'Primero quita de en medio la torre atacante; después piensa cómo llegar a tiempo a c1.',
          explanationCorrect:
            'Correcto: Rxf2 Rxf2 Kxf2 c2 Ra1. El cambio de torres quita el ataque y Ra1 controla c1: el peón no puede coronar.',
          explanationWrong:
            'Esa jugada no salva la partida. Cambia las torres en f2 y después frena el peón desde la primera fila.',
          wrongByMove: {
            a7g7: 'Rxg7+ Kxg7 y, tras Rxf2 Rxf2 Kxf2 c2, ya no te queda torre para frenar el peón: corona.',
            a7a2: 'Raa2 defiende la torre, pero Rf1+ Kh2 Rh1+: las torres negras atacan a tu rey y ganan material.',
          },
        },
        {
          fen: '8/k7/2b3p1/3q4/p7/4Q1P1/5P1P/B5K1 b - - 0 1', // Lichess ASg5e
          prompt: 'Juegan negras. La dama blanca da jaque. Sal del jaque con la única jugada que conserva la ventaja.',
          solutionUci: ['a7a8', 'f2f3', 'd5d1', 'g1f2', 'd1a1'],
          hint: 'Busca la casilla donde la dama blanca ya no tiene jaques. El alfil de a1 no tiene defensa.',
          explanationCorrect:
            'Correcto: Ka8 f3 Qd1+ Kf2 Qxa1. En a8 la dama blanca no tiene jaques útiles (Qe8+ se captura con el alfil) y amenazas Qg2#. Tras f3, el jaque en d1 te deja capturar el alfil de a1.',
          explanationWrong:
            'Esa casilla deja a la dama blanca seguir dando jaques o cambiar damas. En a8 los jaques se acaban y te queda tiempo para atacar.',
          wrongByMove: {
            a7b7: 'Kb7 permite Qe7+ y la dama blanca sigue dando jaques: no te queda tiempo para capturar el alfil.',
            a7b8: 'Kb8 permite Qe5+ y el cambio de damas: la ventaja desaparece.',
            a7a6: 'Ka6 permite Qe2+ y los jaques continúan.',
          },
        },
        {
          fen: 'r1b4k/1p3Q2/p5n1/6P1/8/5B2/PPq2K2/R7 w - - 0 1', // Lichess 8Xtgf
          prompt: 'Juegan blancas. La dama negra da jaque. Solo una casilla del rey gana; las demás dan ventaja a las negras.',
          solutionUci: ['f2g3', 'c2f5', 'a1h1'],
          hint: 'Busca la casilla desde la que los jaques que quedan se pueden capturar. Tu torre quiere ir a la columna h.',
          explanationCorrect:
            'Correcto: Kg3 Qf5 Rh1+. En g3 los jaques que quedan se capturan (Qc7+ con tu dama, Qf2+ y Qh2+ con el rey), y la torre entra por la columna h contra el rey negro.',
          explanationWrong:
            'Esa casilla deja a las negras seguir con jaques o ganar material. En g3 el rey queda a salvo y tu torre ataca por la columna h.',
          wrongByMove: {
            f2e1: 'Ke1 permite Qxb2, que ataca tu torre de a1: la ventaja pasa a las negras.',
            f2g1: 'Kg1 permite Qc5+ y Qxg5: pierdes el peón y el ataque.',
          },
        },
      ],
      evaluation: [
        {
          fen: '2r3k1/1p1Q4/4pK2/7p/2P2P2/6P1/8/q7 w - - 0 1', // Lichess eurI5
          prompt: 'Juegan blancas. La dama negra da jaque. Solo una jugada gana; todas las demás pierden.',
          solutionUci: ['f6g6', 'a1b1', 'g6h6', 'g8f8', 'd7c8'],
          hint: 'Acerca tu rey al rey negro: con el rey en g6, la dama amenaza mate en g7.',
          explanationCorrect:
            'Correcto: Kg6 Qb1+ Kh6 Kf8 Qxc8+. Con el rey en g6 amenazas Qg7#. En h6 ya no hay jaques: los peones de f4, e6 y h5 tapan las líneas. El rey negro huye y tu dama gana la torre de c8.',
          explanationWrong:
            'Esa jugada pierde. El rey tiene que ir hacia delante, a g6: desde allí apoya el mate en g7 y se esconde de los jaques.',
        },
        {
          fen: '3Q2k1/p4p2/2p4p/1p4p1/4q3/P1P2pPP/BP5K/8 b - - 0 1', // Lichess 0rDFr
          prompt: 'Juegan negras. La dama blanca da jaque. Elige la casilla del rey: solo una conserva tu ataque.',
          solutionUci: ['g8h7', 'd8d1', 'e4e2', 'd1e2', 'f3e2'],
          hint: 'Evita la casilla donde la dama blanca puede cambiarse con jaque. Tu peón de f3 apoya un mate en g2.',
          explanationCorrect:
            'Correcto: Kh7 Qd1 Qe2+ Qxe2 fxe2. En h7 no hay jaques ni cambio de damas, y amenazabas Qe2+ con mate en g2. Tras el cambio, el peón de e2 corona: el alfil blanco va por casillas claras y no controla e1.',
          explanationWrong:
            'Esa jugada no conserva el ataque. En h7 la dama blanca no tiene jaques ni puede cambiarse.',
          wrongByMove: {
            g8g7: 'Kg7 permite Qd4+: las damas se cambian con jaque y tu ataque desaparece.',
            e4e8: 'Qe8 tapa el jaque, pero Qxe8+ Kg7 Qxf7+ Kh8 Qg8# es mate.',
          },
        },
        {
          fen: '8/4p3/8/R6P/1Q1kn3/P4r2/1P1pp3/1K6 b - - 0 1', // Lichess OlOre
          prompt: 'Juegan negras. La dama blanca da jaque. Solo una jugada no pierde.',
          solutionUci: ['d4e3'],
          hint: 'De las dos casillas del rey, una lleva a una red de mate.',
          explanationCorrect:
            'Correcto: Ke3. El rey se acerca a sus peones de d2 y e2 y se aleja de la red de mate. Tras Kd3, Qb3+ Nc3+ Qxc3+ y el rey negro acaba recibiendo mate.',
          explanationWrong:
            'Esa jugada pierde: Qb3+ y la dama y la torre cazan al rey. Ke3 lo acerca a sus peones de d2 y e2.',
          wrongByMove: {
            d4d3: 'Kd3 Qb3+ Nc3+ Qxc3+ y el rey queda atrapado en una red de mate.',
          },
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u12.l02',
      unitId: 'u12',
      title: 'Interferencia y despeje',
      objective:
        'Cortar la línea por la que una pieza rival defiende a otra, y apartar con tempo una pieza propia que estorba a otra.',
      conceptIds: ['tactics.interference', 'tactics.clearance'],
      intro:
        'Dos ideas sobre líneas. Interferencia: cortar la fila, columna o diagonal por la que una pieza rival defiende a otra. Puedes poner tu pieza en medio, o dar un jaque que obligue al rey rival a meterse él mismo entre sus piezas. Despeje: apartar una pieza propia que tapa una casilla o una línea que necesita otra pieza tuya. El despeje funciona mejor con tempo: con jaque, con una captura o con una amenaza.',
      explanation: [
        {
          fen: '2r3k1/5ppp/P3p3/4r3/8/1KB1P3/5P2/2R5 w - - 0 1', // Lichess qQ0EY
          text: 'Bxe5 gana la torre, aunque deja la tuya de c1 sin defensa: Rxc1. Entonces a7, y si la torre vuelve a c8 para vigilar a8, Bb8 se interpone en su camino. El alfil corta la línea de la torre y el peón corona.',
          squares: ['b8', 'a8', 'c8'],
          arrows: [
            ['e5', 'b8'],
            ['a7', 'a8'],
          ],
        },
        {
          fen: '4r1k1/p5pp/4r3/3QpR2/8/2q5/P5PP/3R1K2 w - - 0 1', // Lichess MeZ9d
          text: 'Tu dama tapa la columna d a tu torre de d1. Qxe6+ la aparta con jaque y además elimina una torre. Tras Rxe6, Rd8+ Re8 Rxe8# (la torre de f5 controla f7).',
          squares: ['d5', 'd8', 'f7'],
          arrows: [
            ['d5', 'e6'],
            ['d1', 'd8'],
          ],
        },
      ],
      practice: [
        {
          fen: '2r3k1/5ppp/P3p3/4r3/8/1KB1P3/5P2/2R5 w - - 0 1', // Lichess qQ0EY
          prompt: 'Juegan blancas. Captura la torre de e5 y calcula la carrera del peón de a6 hasta coronar.',
          solutionUci: ['c3e5', 'c8c1', 'a6a7', 'c1c8', 'e5b8'],
          hint: 'Cuando la torre negra vuelva a la octava fila, busca una casilla para el alfil entre ella y a8.',
          explanationCorrect:
            'Correcto: Bxe5 Rxc1 a7 Rc8 Bb8. El alfil se interpone entre la torre y a8. Si Rxb8, axb8=Q+.',
          explanationWrong:
            'Esa jugada no gana. Captura en e5 y, cuando la torre vuelva a c8, interponte en b8 con el alfil.',
          wrongByMove: {
            c1g1: 'Rg1 salva tu torre, pero Rxc3+ Kxc3 Ra5 y el peón de a6 cae.',
          },
        },
        {
          fen: '1B6/1p2P1R1/k1q5/2p5/8/pP2b3/P5RK/8 b - - 0 1', // Lichess X5VNQ
          prompt: 'Juegan negras. La torre de g7 está defendida por la de g2. Gánala con un jaque que rompa esa defensa.',
          solutionUci: ['c6h6', 'h2g3', 'h6g7'],
          hint: 'Un jaque por la columna h solo deja al rey una casilla.',
          explanationCorrect:
            'Correcto: Qh6+ Kg3 Qxg7+. Tu alfil de e3 controla g1, así que el rey solo puede ir a g3, justo entre sus torres: la de g2 ya no defiende g7.',
          explanationWrong:
            'Esa jugada no gana la torre. Da jaque en h6: el rey tendrá que ir a g3 y tapará la defensa de la torre de g2.',
        },
        {
          fen: '6rk/5Qpp/8/4B3/q2P4/8/r5PP/5RK1 w - - 0 1', // Lichess TPxZw
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['f7g7', 'g8g7', 'f1f8'],
          hint: 'Tu dama tapa la columna f a la torre de f1. Apártala con jaque.',
          explanationCorrect:
            'Correcto: Qxg7+ Rxg7 Rf8#. La dama deja libre la columna f con jaque. La torre negra no puede taparse en g8 porque el alfil de e5 la clava contra el rey.',
          explanationWrong:
            'Esa jugada no da mate en dos. Tu dama estorba en la columna f: entrégala en g7 con jaque y la torre de f1 entra en f8.',
          wrongByMove: {
            e5g7: 'Bxg7+ Rxg7 y tu dama sigue tapando la columna f: no hay mate.',
          },
        },
      ],
      evaluation: [
        {
          fen: '2r4r/5k2/pp4R1/2q2pQ1/5n2/2N5/PP4P1/5K2 w - - 0 1', // Lichess MVoeE
          prompt: 'Juegan blancas. La torre de h8 está defendida por la de c8. Gana una torre.',
          solutionUci: ['g5f6', 'f7e8', 'f6h8'],
          hint: 'Un jaque de dama que solo deje al rey una casilla, en la octava fila.',
          explanationCorrect:
            'Correcto: Qf6+ Ke8 Qxh8+. La torre de g6 protege tu dama, así que el rey solo puede ir a e8, entre sus torres: la de c8 ya no defiende h8.',
          explanationWrong:
            'Esa jugada no gana la torre. Con Qf6+ el rey tiene que ir a e8 y se interpone entre sus torres.',
          wrongByMove: {
            g6g7: 'Rg7+ Ke6 y el rey escapa por el centro: la ventaja pasa a las negras.',
          },
        },
        {
          fen: '1k6/ppprb2p/4Qnp1/5p2/5P1P/P3KP2/1P6/6R1 b - - 0 1', // Lichess XOEKq
          prompt: 'Juegan negras. Gana la dama blanca.',
          solutionUci: ['e7c5', 'e3e2', 'd7e7', 'e6e7', 'c5e7'],
          hint: 'Tu alfil ocupa e7. Apártalo con jaque y la torre podrá atacar por la columna e.',
          explanationCorrect:
            'Correcto: Bc5+ Ke2 Re7 Qxe7 Bxe7. El alfil deja libre e7 con jaque y la torre clava la dama contra el rey: ganas la dama por la torre.',
          explanationWrong:
            'Esa jugada no gana la dama. Aparta el alfil de e7 con jaque y lleva la torre a e7.',
        },
        {
          fen: '8/5pkp/2B5/5Q2/PP6/4P1b1/1q5r/5RK1 b - - 0 1', // Lichess nwtVD
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['h2h1', 'c6h1', 'b2h2'],
          hint: 'La casilla del mate es h2, pero la ocupa tu torre.',
          explanationCorrect:
            'Correcto: Rh1+ y mate en h2. La torre deja libre h2 con jaque. Tras Bxh1 valen Qh2# (protegida por el alfil de g3) y Bh2# (protegido por la dama); si Kxh1, Qh2#.',
          explanationWrong:
            'Esa jugada no da mate en dos. Tu torre estorba en h2: apártala con jaque en h1 y la dama dará mate en h2.',
          wrongByMove: {
            h2f2: 'Rf2 Rxf2 Bxf2+ Qxf2 y el ataque se acaba.',
          },
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u12.l03',
      unitId: 'u12',
      title: 'Combinaciones de varios temas',
      objective:
        'Calcular combinaciones de 3 a 7 medias jugadas que encadenan jaques, clavadas, desviaciones, ataques dobles y mates.',
      conceptIds: ['tactics.deflection', 'tactics.fork', 'tactics.mate_threat'],
      intro:
        'A partir de cierto nivel, las combinaciones casi nunca usan una sola idea. Un jaque obliga a tapar y crea una clavada; un sacrificio desvía a un defensor; un peón protege la casilla de un ataque doble. Calcula la línea completa antes de empezar. En cada jugada, cuenta todas las respuestas del rival y comprueba cómo queda el material al final.',
      explanation: [
        {
          fen: '6k1/5pp1/4r2p/2q5/4Q3/3B1PP1/6KP/8 w - - 0 1', // Lichess xs2Bz
          text: 'Qa8+ obliga a tapar: Kh7 no es posible por el alfil de d3, y Re8 perdería la torre. Tras Qf8, la dama negra queda clavada y solo la defiende el rey. Bh7+ aleja al rey de g8 y Qxf8 gana la dama.',
          squares: ['a8', 'f8', 'h7'],
          arrows: [
            ['e4', 'a8'],
            ['d3', 'h7'],
          ],
        },
        {
          fen: '5rk1/1p2RRbp/p5p1/8/8/2q5/P2r2PP/5Q1K w - - 0 1', // Lichess RbWru
          text: 'Rxf8+ elimina la torre que defiende la columna f. Si Kxf8, Qf7# (la torre de e7 protege f7). Si Bxf8, el alfil abandona g7: Qf7+ Kh8 Qxf8#.',
          squares: ['f8', 'f7', 'g7'],
          arrows: [
            ['f7', 'f8'],
            ['f1', 'f7'],
          ],
        },
      ],
      practice: [
        {
          fen: '6k1/5pp1/4r2p/2q5/4Q3/3B1PP1/6KP/8 w - - 0 1', // Lichess xs2Bz
          prompt: 'Juegan blancas. Gana la dama negra.',
          solutionUci: ['e4a8', 'c5f8', 'd3h7', 'g8h7', 'a8f8'],
          hint: 'Un jaque en la octava fila obliga a tapar con la dama. Después, ¿quién la defiende?',
          explanationCorrect:
            'Correcto: Qa8+ Qf8 Bh7+ Kxh7 Qxf8. Jaque, clavada y desviación: el alfil aleja al rey y la dama de f8 se queda sin defensa.',
          explanationWrong:
            'Esa jugada no gana la dama. Da jaque en a8 para que la dama negra tape en f8; después el alfil aleja al rey con jaque.',
          wrongByMove: {
            e4h7: 'Qh7+ Kf8 y el rey escapa por e7.',
          },
        },
        {
          fen: '6k1/5pp1/1R1n1q1p/2pP4/2P4P/3Q2PB/3Nrr2/1R4K1 b - - 0 1', // Lichess ns0Im
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['f2g2', 'h3g2', 'f6f2', 'g1h2', 'f2g2'],
          hint: 'Tu torre de f2 ocupa la casilla que necesita tu dama.',
          explanationCorrect:
            'Correcto: Rg2+ Bxg2 Qf2+ Kh2 Qxg2#. La torre se entrega en g2: deja f2 libre para la dama y atrae al alfil a g2. Allí la dama da mate, protegida por la torre de e2. Si Kh1, Rh2+ Kg1 Qf2#.',
          explanationWrong:
            'Esa jugada no da mate en tres. Entrega la torre en g2 con jaque: tu dama necesita la casilla f2.',
        },
        {
          fen: 'r3r1k1/1Q2R2p/3pP1p1/p1p1qp2/8/8/P5PP/6RK w - - 0 1', // Lichess 6nGwr
          prompt: 'Juegan blancas. Gana material.',
          solutionUci: ['e7e8', 'a8e8', 'b7f7', 'g8h8', 'f7e8'],
          hint: 'El peón de e6 protege f7. Primero lleva una torre negra a e8.',
          explanationCorrect:
            'Correcto: Rxe8+ Rxe8 Qf7+ Kh8 Qxe8+. El cambio lleva la torre negra a e8. Qf7+, protegida por el peón de e6, da jaque y ataca e8 a la vez: ganas una torre.',
          explanationWrong:
            'Esa jugada no gana material. Cambia en e8 y después Qf7+ ataca a la vez al rey y a la torre.',
          wrongByMove: {
            e7h7: 'Rxh7 Qf6: las negras se defienden y la ventaja desaparece.',
          },
        },
      ],
      evaluation: [
        {
          fen: '2Q5/3N2pk/2p2pnp/8/PP1P4/1r6/2r3PP/5K2 w - - 0 1', // Lichess HDEOA
          prompt: 'Juegan blancas. Gana material.',
          solutionUci: ['d7f8', 'g6f8', 'c8f5', 'f8g6', 'f5c2'],
          hint: 'Tu caballo tapa una diagonal de tu dama y el caballo negro tapa otra. Un jaque resuelve las dos cosas.',
          explanationCorrect:
            'Correcto: Nf8+ Nxf8 Qf5+ Ng6 Qxc2. El caballo deja libre la diagonal c8-f5 y obliga al caballo negro a dejar g6. Entonces Qf5+ da jaque y ataca la torre de c2.',
          explanationWrong:
            'Esa jugada no gana material. Nf8+ abre la diagonal de tu dama y desvía al caballo de g6; después Qf5+ ataca rey y torre.',
          wrongByMove: {
            c8g8: 'Qg8+ Kxg8 Nxf6+ gxf6: te quedas sin dama y las negras amenazan Rb1#.',
            d7f6: 'Nxf6+ gxf6: la dama sola no basta y las torres negras contraatacan.',
          },
        },
        {
          fen: '8/1P6/1R6/5kpp/3Bp3/2PbP3/5KPP/1r6 b - - 0 1', // Lichess 20dzh
          prompt: 'Juegan negras. Mate en cuatro jugadas.',
          solutionUci: ['b1f1', 'f2g3', 'h5h4', 'g3h3', 'f1f3', 'g2g3', 'd3f1'],
          hint: 'Los jaques llevan al rey a h3. Después, el peón de g2 tapa la diagonal de tu alfil.',
          explanationCorrect:
            'Correcto: Rf1+ Kg3 h4+ Kh3 Rf3+ g3 Bf1#. La torre se entrega en f3 para desviar el peón de g2, y el alfil da mate por la diagonal f1-h3. Si gxf3, también Bf1#.',
          explanationWrong:
            'Esa jugada no da mate en cuatro. Empieza con Rf1+: el alfil de d3 protege f1 y quita e2 al rey.',
          wrongByMove: {
            b1b6: 'Rxb6 Bxb6 y el peón de b7 corona.',
          },
        },
        {
          fen: '4r1k1/Q4ppp/8/8/3p4/2r1q1P1/P4R1P/5RK1 w - - 0 1', // Lichess jQELo
          prompt: 'Juegan blancas. Mate en cuatro jugadas.',
          solutionUci: ['a7f7', 'g8h8', 'f7e8', 'e3e8', 'f2f8', 'e8f8', 'f1f8'],
          hint: 'El rey negro no puede capturar en f7: tu torre de f2 la protege.',
          explanationCorrect:
            'Correcto: Qxf7+ Kh8 Qxe8+ Qxe8 Rf8+ Qxf8 Rxf8#. Capturas con jaque, eliminas la torre de e8 atrayendo a la dama y las torres dobladas dan mate en la última fila.',
          explanationWrong: 'Esa jugada no da mate en cuatro. Empieza capturando en f7 con jaque.',
        },
      ],
    },
  ],
};
