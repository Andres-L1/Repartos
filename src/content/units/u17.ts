import type { Unit } from '../schema.js';

/**
 * Unidad 17 · Ataque al rey (avanzado, 1400-1700 Elo).
 * Pendiente de validación de profesores. Posiciones: puzles de la base de datos de Lichess (CC0, `GET /api/puzzle/batch/{tema}`),
 * filtrados por pocas piezas; el id del puzle va en un comentario junto a cada FEN. Textos propios.
 * Verificación: Stockfish 16, profundidad 18 (`npx tsx scripts/verify-fase4.mts u17`: en cada jugada del alumno la solución es la mejor
 * y única, el rival juega su mejor defensa o equivalentes y los mates son los más cortos) y por código en test/content/unitsU17.test.ts.
 */
export const unit: Unit = {
  id: 'u17',
  order: 26,
  title: 'Ataque al rey',
  description:
    'Sacrificar para atacar al rey: la pieza que atrae al rey a la columna h, sacrificios que abren columnas y el mate con dama y otra pieza. Combinaciones de tres a cinco medias jugadas.',
  level: 'advanced',
  requires: ['u15'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u17.l01',
      unitId: 'u17',
      title: 'El sacrificio y el rey sin refugio',
      objective:
        'Reconocer cuándo ofrecer una pieza (o h2) para atraer al rey a la columna h, y cuándo un rey sin enrocar se castiga con jaques seguidos.',
      conceptIds: ['tactics.attraction', 'tactics.mate_threat'],
      intro:
        'Delante de un rey enrocado, la casilla h7 solo la defiende el propio rey. Si ofreces ahí una pieza con jaque, el rey tiene que capturarla y queda en la columna h, donde una torre o una dama dan jaque sin que haya peones que lo tapen. Antes de sacrificar, cuenta tus atacantes y comprueba que, después de la captura, tienes jaques seguidos hasta el mate. Un rey que no ha enrocado, o que ha perdido los peones de delante, se castiga igual: jaque tras jaque hasta que no queden casillas.',
      explanation: [
        {
          // 5RWEi
          fen: 'r4rk1/5ppp/p7/1pR2N2/1np5/8/qPQ2PPP/2K4R w - - 3 21',
          text: 'La dama apunta por la diagonal. Primero Ne7+ obliga a Kh8 y deja al caballo vigilando g6 y g8. Después Qxh7+ Kxh7 y Rh5#: el rey capturó la dama y quedó atrapado en la columna h, sin casillas libres.',
          squares: ['h7', 'e7', 'h5'],
          arrows: [
            ['f5', 'e7'],
            ['c2', 'h7'],
            ['c5', 'h5'],
          ],
        },
        {
          // 2mRAO
          fen: '4Q3/6p1/7p/4pkp1/3q4/8/6PK/8 w - - 4 45',
          text: 'Un rey sin peones delante no tiene refugio. No hace falta sacrificar nada: Qf7+ Kg4 Qf3+ Kh4 y g3# lo empujan hacia el borde con jaques seguidos. Cuando el rey rival está desprotegido, busca primero los jaques.',
          squares: ['f7', 'f3', 'g3'],
          arrows: [
            ['e8', 'f7'],
            ['f7', 'f3'],
            ['g2', 'g3'],
          ],
        },
      ],
      practice: [
        {
          // 1nlZW
          fen: '1r4rk/5p1n/3p4/4pP1R/pqPp1P1P/1P3Q2/P1P5/1K4R1 w - - 1 36',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['h5h7', 'h8h7', 'f3h5'],
          hint: 'Piensa en la casilla junto al rey: solo el rey la defiende.',
          explanationCorrect:
            'Correcto: Rxh7+ Kxh7 Qh5#. El rey tuvo que capturar y la dama dio mate en la columna h; la torre le cierra la columna g.',
          explanationWrong:
            'Esa jugada no da mate en dos. Ofrece la torre: el rey solo puede capturarla y así queda a tiro de la dama.',
        },
        {
          // 3FwOK
          fen: '3r2k1/pp1b2b1/2p1pqQ1/8/2PP1P2/7R/PPB3PP/6K1 w - - 1 27',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['h3h8', 'g8h8', 'g6h7'],
          hint: 'Ofrece la torre en la octava fila: solo el rey podrá capturarla.',
          explanationCorrect:
            'Correcto: Rh8+ Kxh8 Qh7#. El alfil está clavado por la dama y no puede capturar; el rey toma la torre y la dama da mate, protegida por el alfil.',
          explanationWrong:
            'Esa jugada no da mate en dos. Sacrifica la torre con jaque: el rey tiene que capturarla y la dama da mate.',
        },
        {
          // k6w5z
          fen: '2kr3r/Qpb2pp1/7p/2p5/2P5/3qP3/PP2NPPP/2R1K2R b K - 0 16',
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['d3d2', 'e1f1', 'd2d1', 'c1d1', 'd8d1'],
          hint: 'El rey blanco no ha enrocado: empuja sus jaques hacia f1 y piensa en la primera fila.',
          explanationCorrect:
            'Correcto: Qd2+ Kf1 Qd1+ Rxd1 Rxd1#. El rey sin enrocar no tiene refugio: la dama se entrega y la torre da el mate en la primera fila.',
          explanationWrong:
            'Esa jugada no lleva al mate. Con un primer jaque el rey blanco solo puede ir a una casilla; allí un segundo jaque en la primera fila decide.',
        },
      ],
      evaluation: [
        {
          // Pidxp
          fen: 'r5rk/3p1p1p/p1b1pPpQ/1p6/5P2/1P1R4/P1B1q1PP/3R3K w - - 15 32',
          prompt: 'Juegan blancas. Mate en tres jugadas.',
          solutionUci: ['h6h7', 'h8h7', 'd3h3', 'e2h5', 'h3h5'],
          hint: 'Primero atrae al rey con un sacrificio; después la torre da jaque por la columna h.',
          explanationCorrect:
            'Correcto: Qxh7+ Kxh7 Rh3+ Qh5 Rxh5#. La dama negra se interpone y cae con mate; el peón vigila g7.',
          explanationWrong:
            'Esa jugada no lleva al mate. Primero hay que ofrecer la dama para que el rey capture; luego la torre da jaque en la columna h.',
        },
        {
          // AfXui
          fen: '6rk/pp1q1p1n/2ppn1r1/4pN1Q/4P3/P2P2P1/RPP2PK1/5R2 w - - 7 30',
          prompt: 'Juegan blancas. Mate en tres jugadas.',
          solutionUci: ['h5h7', 'h8h7', 'f1h1', 'g6h6', 'h1h6'],
          hint: 'Ofrece la dama junto al rey. Tras la captura, una torre da jaque en la columna h.',
          explanationCorrect:
            'Correcto: Qxh7+ Kxh7 Rh1+ Rh6 Rxh6#. El caballo cubre g7 y la torre negra, al interponerse, solo consigue que le den mate.',
          explanationWrong:
            'Esa jugada no lleva al mate. Ofrece la dama para atraer al rey; después la torre llega a la columna h.',
        },
        {
          // E8qiE
          fen: 'r4k1N/pnpq4/7p/3P2pQ/4P3/2b3B1/P4PPP/5K1R b - - 0 21',
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['d7b5', 'h5e2', 'b5b1', 'e2d1', 'b1d1'],
          hint: 'El rey blanco está y la dama puede dar jaque desde la columna b.',
          explanationCorrect:
            'Correcto: Qb5+ Qe2 Qb1+ Qd1 Qxd1#. Los jaques en la primera fila obligan a la dama blanca a interponerse hasta que el rey se queda sin salida.',
          explanationWrong:
            'Esa jugada no lleva al mate. Busca jaques seguidos de la dama por la columna b y la primera fila: el rey blanco está sin refugio.',
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u17.l02',
      unitId: 'u17',
      title: 'Abrir columnas con un sacrificio y mate con dama y pieza',
      objective:
        'Sacrificar una pieza para desviar a un defensor o abrir una columna, y rematar el mate con la dama junto a otra pieza.',
      conceptIds: ['tactics.deflection', 'tactics.mate_threat'],
      intro:
        'A menudo el mate no llega por fuerza bruta, sino porque un defensor deja de cumplir su función. Un sacrificio puede desviar a la torre que guarda la primera fila, o hacer que un peón capture y abra una columna para tu dama. El patrón final suele ser dama más otra pieza: la dama da el jaque y una torre, un alfil o un caballo cierran las casillas de escape. Antes de sacrificar, localiza qué pieza protege la casilla del mate y busca la forma de apartarla.',
      explanation: [
        {
          // sCGBN
          fen: '3r1r1k/pb5p/1p5q/2ppNp2/1PP5/P2Q2R1/7P/6RK w - - 0 30',
          text: 'Rg8+ obliga a la torre a capturar, y con ello deja de vigilar f7. Después Nf7#: la torre cubre g7, el peón ocupa la otra casilla y el rey no tiene escapatoria. Un sacrificio sencillo basta cuando cada captura es forzada.',
          squares: ['g8', 'f7'],
          arrows: [
            ['g1', 'g8'],
            ['e5', 'f7'],
          ],
        },
        {
          // 7dg19
          fen: '2Q2bk1/p3ppnp/3p2pB/3q2N1/8/6P1/P2r1P1P/1R4K1 w - - 2 23',
          text: 'Qxf8+ atrae al rey y deja libre la octava fila para la torre. Tras Kxf8, Rb8# es mate: el alfil vigila f8 y g7, y las demás casillas están ocupadas por piezas negras.',
          squares: ['f8', 'b8'],
          arrows: [
            ['c8', 'f8'],
            ['b1', 'b8'],
          ],
        },
      ],
      practice: [
        {
          // chFah
          fen: 'Qn2r1k1/p1p2pp1/1p3q1p/8/3b4/2P5/PP3PPP/R1B2RK1 b - - 0 16',
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['f6f2', 'f1f2', 'e8e1'],
          hint: 'La torre es la que guarda la primera fila: apártala. Fíjate también en el alfil.',
          explanationCorrect:
            'Correcto: Qxf2+ Rxf2 Re1#. La torre queda clavada por el alfil y el alfil blanco tapa a la otra torre: la primera fila no tiene defensa.',
          explanationWrong:
            'Esa jugada no da mate en dos. Sacrifica la dama para desviar a la torre que defiende la primera fila.',
        },
        {
          // A2FDZ
          fen: '2k3r1/ppp2p1p/4p1r1/3BP3/3p1b2/P2P1Q1q/1PP2PRP/6RK b - - 0 27',
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['h3h2', 'g2h2', 'g6g1'],
          hint: 'Una torre protege a la otra. Obliga a la que protege a moverse.',
          explanationCorrect:
            'Correcto: Qxh2+ Rxh2 Rxg1#. La dama estaba protegida por el alfil; la torre se desvía y deja sin defensa la casilla g1, protegida por la otra torre negra.',
          explanationWrong:
            'Esa jugada no da mate en dos. Ofrece la dama para que la torre capture y deje de proteger a la otra.',
        },
        {
          // FOpGq
          fen: '6rk/4p1qp/p3Rp2/3p1p2/3P4/2P2PrP/PP2Q1P1/6RK b - - 11 32',
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['g3h3', 'g2h3', 'g7g1'],
          hint: 'Si el peón captura, se abre la columna g para tu dama.',
          explanationCorrect:
            'Correcto: Rxh3+ gxh3 Qxg1#. El peón abandona la columna g, la dama toma la torre y la torre protege la casilla del mate.',
          explanationWrong:
            'Esa jugada no da mate en dos. Sacrifica la torre con jaque: la única captura abre la columna g.',
        },
      ],
      evaluation: [
        {
          // GqK3O
          fen: 'r6k/pbp2R2/1p2p1p1/6qp/5n2/P1PBQ3/1P4PP/6RK b - - 4 25',
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['b7g2', 'g1g2', 'g5g2'],
          hint: 'El caballo protege una casilla junto al rey: sacrifica el alfil allí.',
          explanationCorrect:
            'Correcto: Bxg2+ Rxg2 Qxg2#. El rey no puede capturar porque el caballo y la dama la protegen; la torre captura y la dama da mate.',
          explanationWrong:
            'Esa jugada no da mate en dos. Ofrece el alfil con jaque: la torre es la única que puede capturarlo.',
        },
        {
          // jxUOi
          fen: '1r3rk1/p5p1/3p1pq1/1p1bp1n1/2P3Q1/3Pp3/PP3P1R/1K5R w - - 0 25',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['h2h8', 'g8f7', 'g4d7'],
          hint: 'Una torre da jaque en la última fila y la otra la protege: el rey solo tiene una casilla.',
          explanationCorrect:
            'Correcto: Rh8+ Kf7 Qd7#. La torre protege a la; tras Kf7, la dama da mate y el rey no tiene casillas libres.',
          explanationWrong:
            'Esa jugada no da mate en dos. Da jaque con la torre, protegida por la otra torre, y remata con la dama.',
        },
        {
          // Q7I9G
          fen: '2n1r1k1/2q5/2b2p2/3p1Pp1/2pPp1P1/1pP1P1b1/1P5Q/1B2NK1R w - - 0 38',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['h2h8', 'g8f7', 'h1h7'],
          hint: 'Si la dama da jaque en la última fila, la torre de la columna h la protege y el rey no puede capturarla.',
          explanationCorrect:
            'Correcto: Qh8+ Kf7 Rh7#. El rey no puede capturar la dama porque la torre la protege; después el peón cubre e6 y g6 y Rh7 es mate.',
          explanationWrong:
            'Esa jugada no da mate en dos. Da jaque con la dama, protegida por la torre, y remata con la torre.',
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u17.l03',
      unitId: 'u17',
      title: 'Combinaciones de ataque de tres jugadas',
      objective:
        'Calcular combinaciones de ataque de cinco medias jugadas: sacrificio, respuesta forzada, jaque que obliga y mate.',
      conceptIds: ['tactics.attraction', 'tactics.deflection', 'tactics.mate_threat'],
      intro:
        'En un ataque real rara vez el mate llega con la primera jugada. La combinación típica es: sacrificio, captura forzada, jaque que obliga a una única respuesta y mate. Para calcularla, escribe mentalmente solo las jugadas con jaque o con captura: cada una deja al rival muy pocas respuestas. Si en algún punto tiene una salida que no habías visto, descarta la línea. Si todas las respuestas llevan al mate, juega.',
      explanation: [
        {
          // WaqDi
          fen: '5r1k/1p5p/p1p3B1/1b1nR3/8/1P5Q/Pq4PP/4R1K1 b - - 0 31',
          text: 'Mate de pasillo en tres tiempos: Qf2+ Kh1 Qf1+ Rxf1 Rxf1#. El primer jaque empuja al rey; el segundo desvía a la torre, la única que defendía la primera fila, y la torre da el mate.',
          squares: ['f2', 'f1'],
          arrows: [
            ['b2', 'f2'],
            ['f2', 'f1'],
            ['f8', 'f1'],
          ],
        },
        {
          // yjDV7
          fen: '5rk1/pp2Q2p/6p1/PP6/3pn3/3q3P/5P1K/3R1R2 b - - 2 35',
          text: 'Aquí el sacrificio abre la casilla f2 para el caballo. Rxf2+ Rxf2 Qg3+ Kh1 Nxf2#: la dama y el caballo se coordinan, y el rey queda encerrado sin que ninguna pieza blanca pueda capturar.',
          squares: ['f2', 'g3'],
          arrows: [
            ['f8', 'f2'],
            ['d3', 'g3'],
            ['e4', 'f2'],
          ],
        },
      ],
      practice: [
        {
          // thipi
          fen: '5rk1/6pp/1p3q2/p1p5/3r4/P1P4Q/1P3PPP/R1B2RK1 b - - 0 20',
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['f6f2', 'f1f2', 'd4d1', 'f2f1', 'f8f1'],
          hint: 'Primero desvía a la torre con la dama; después una torre da jaque en la primera fila.',
          explanationCorrect:
            'Correcto: Qxf2+ Rxf2 Rd1+ Rf1 Rfxf1#. El alfil tapa a la torre, así que la única defensa es Rf1, y se captura con mate (Rdxf1# también vale).',
          explanationWrong:
            'Esa jugada no lleva al mate en tres. Sacrifica la dama para desviar a la torre; después la torre da jaque.',
        },
        {
          // EjaYz
          fen: '2r4r/pp1kpp2/2pp1P2/8/2PP4/2N1q3/PP4PP/R2Q1R1K b - - 0 18',
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['h8h2', 'h1h2', 'c8h8', 'd1h5', 'h8h5'],
          hint: 'Ofrece una torre junto al rey para llevar al rey a la columna h; la otra torre le da jaque.',
          explanationCorrect:
            'Correcto: Rxh2+ Kxh2 Rh8+ Qh5 Rxh5#. El rey fue atraído a la columna h; la dama blanca se interpone y la torre la captura con mate.',
          explanationWrong:
            'Esa jugada no lleva al mate en tres. Entrega una torre con jaque y, tras la captura, lleva la otra torre a la columna h.',
        },
        {
          // TjK72
          fen: 'r2qk2r/ppp2p2/2pb4/4p3/4N1P1/3P2p1/PPP2PP1/RN1Q1RK1 b kq - 0 13',
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['h8h1', 'g1h1', 'd8h4', 'h1g1', 'h4h2'],
          hint: 'Atrae al rey a la esquina; el peón protegerá a la dama.',
          explanationCorrect:
            'Correcto: Rh1+ Kxh1 Qh4+ Kg1 Qh2#. El rey captura la torre, y la dama da mate protegida por el peón.',
          explanationWrong:
            'Esa jugada no lleva al mate en tres. Sacrifica la torre con jaque; después la dama baja por la columna h.',
        },
      ],
      evaluation: [
        {
          // 5ACMZ
          fen: '2q4r/4ppk1/3p2p1/p1bP4/2B1PPp1/P1N3P1/3B2K1/R1Q2R2 b - - 0 31',
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['h8h2', 'g2h2', 'c8h8', 'h2g2', 'h8h3'],
          hint: 'Entrega la torre y lleva la dama a la columna h. El peón ayudará al final.',
          explanationCorrect:
            'Correcto: Rxh2+ Kxh2 Qh8+ Kg2 Qh3#. El peón protege la dama, así que el rey no puede capturarla.',
          explanationWrong:
            'Esa jugada no lleva al mate en tres. Ofrece la torre para atraer al rey; después la dama da jaque.',
        },
        {
          // 7BmHt
          fen: 'r6N/pp1b4/1k2pp2/3pPn2/8/N3q3/PP2Q1PP/4RR1K b - - 0 22',
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['f5g3', 'h2g3', 'a8h8', 'e2h5', 'h8h5'],
          hint: 'Un salto de caballo con jaque ataca también a la dama y a la torre. Fíjate luego en la columna h.',
          explanationCorrect:
            'Correcto: Ng3+ hxg3 Rxh8+ Qh5 Rxh5#. El peón abandona la columna h, la torre captura el caballo con jaque y la dama vigila g1.',
          explanationWrong:
            'Esa jugada no lleva al mate en tres. Primero un jaque de caballo que fuerce la captura con el peón; así se abre la columna h.',
        },
        {
          // D8Nmp
          fen: '2r1r2k/1Q4Rp/p4pb1/8/1PqB4/5p2/6PP/3R2K1 w - - 0 34',
          prompt: 'Juegan blancas. Mate en tres jugadas.',
          solutionUci: ['g7h7', 'g6h7', 'd4f6', 'h8g8', 'b7g7'],
          hint: 'Ofrece la torre junto al rey. Después el alfil da jaque capturando.',
          explanationCorrect:
            'Correcto: Rxh7+ Bxh7 Bxf6+ Kg8 Qg7#. El alfil protege la dama, y el rey no puede capturarla.',
          explanationWrong:
            'Esa jugada no lleva al mate en tres. Entrega la torre con jaque; después el alfil captura con jaque y la dama remata.',
        },
      ],
    },
  ],
};
