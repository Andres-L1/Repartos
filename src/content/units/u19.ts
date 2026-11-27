import type { Unit } from '../schema.js';

/**
 * Unidad 19 · Táctica de entrenamiento: ver la jugada (intermedio, 1100-1500 Elo).
 * Pendiente de validación de profesores. Posiciones: puzles de la base de datos de Lichess (CC0, `GET /api/puzzle/batch/{tema}`),
 * filtrados por pocas piezas; el id del puzle va en un comentario junto a cada FEN. Textos propios.
 * Verificación: Stockfish 16, profundidad 18 (`npx tsx scripts/verify-fase4.mts u19`, `npx tsx scripts/verify-u19.mts`: en cada jugada
 * del alumno la solución es la mejor y única, el rival juega su mejor defensa o equivalentes y los mates son los más cortos)
 * y por código en test/content/unitsU19.test.ts.
 */
export const unit: Unit = {
  id: 'u19',
  order: 22,
  title: 'Táctica de entrenamiento: ver la jugada',
  description:
    'Horquilla, clavada y ataque descubierto en posiciones reales de puzles. El objetivo es entrenar el ojo: encontrar la jugada que gana material o da mate.',
  level: 'intermediate',
  requires: ['u10'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u19.l01',
      unitId: 'u19',
      title: 'La horquilla',
      objective:
        'Encontrar la jugada que ataca dos piezas rivales a la vez (o rey y pieza) en posiciones reales.',
      conceptIds: ['tactics.fork'],
      intro:
        'Una horquilla es una jugada con la que una sola pieza amenaza a dos objetivos a la vez. El rival solo puede salvar uno. Muchas veces la primera jugada es un jaque, que obliga a responder y deja sin defensa a la otra pieza. Antes de mover, pregúntate qué piezas rivales están sueltas o poco protegidas y desde qué casilla una de tus piezas las alcanza a la vez.',
      explanation: [
        {
          // AycFA
          fen: '2k5/ppp2Rp1/4p3/6P1/2BbP2r/1P6/P1P5/1K6 w - - 1 26',
          text: 'Línea (empiezan blancas): Bxe6+ Kd8 Rd7+ Ke8 Rxd4. Al final de la línea tienes 4 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9). Observa cómo una sola pieza crea dos amenazas y el rival solo puede atender una.',
          squares: ['e6'],
          arrows: [['c4', 'e6']],
        },
        {
          // hmpJm
          fen: '1kr5/p4pp1/1p1b4/Q6p/4P3/PR1PBq2/1P3P2/1K6 b - - 1 29',
          text: 'Línea (empiezan negras): Qd1+ Ka2 Qxb3+ Kxb3 bxa5. Al final de la línea tienes 5 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9). Observa cómo una sola pieza crea dos amenazas y el rival solo puede atender una.',
          squares: ['d1'],
          arrows: [['f3', 'd1']],
        },
      ],
      practice: [
        {
          // nOYbt
          fen: 'R7/3p1p1k/P3p2p/4P3/6P1/2R4b/r7/7K b - - 0 37',
          prompt: 'Juegan negras. Encuentra la mejor jugada.',
          solutionUci: ['h3g2', 'h1g1', 'g2a8'],
          hint: 'Busca una jugada, a menudo con jaque, desde la que una misma pieza amenace dos cosas a la vez.',
          explanationCorrect:
            'Correcto: Bg2+ Kg1 Bxa8. Es la mejor jugada y la línea te deja 5 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // xcu2V
          fen: '2r3k1/6pp/p3p3/1p6/2B5/2P2P2/P4KPP/1R1r4 w - - 0 28',
          prompt: 'Juegan blancas. Encuentra la mejor jugada.',
          solutionUci: ['c4e6', 'g8f8', 'b1d1'],
          hint: 'Busca una jugada, a menudo con jaque, desde la que una misma pieza amenace dos cosas a la vez.',
          explanationCorrect:
            'Correcto: Bxe6+ Kf8 Rxd1. Es la mejor jugada y la línea te deja 6 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // s29jv
          fen: '3r4/5n2/1p1P3k/6q1/1P3N2/2P3P1/3Q4/5K2 w - - 3 38',
          prompt: 'Juegan blancas. Encuentra la mejor jugada.',
          solutionUci: ['d2h2', 'h6g7', 'f4e6', 'g7g6', 'e6g5'],
          hint: 'Busca una jugada, a menudo con jaque, desde la que una misma pieza amenace dos cosas a la vez.',
          explanationCorrect:
            'Correcto: Qh2+ Kg7 Ne6+ Kg6 Nxg5. Es la mejor jugada y la línea te deja 9 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
      ],
      evaluation: [
        {
          // if1rL
          fen: '8/5pnk/8/4Q1P1/3N3K/3q4/8/8 b - - 0 44',
          prompt: 'Juegan negras. Encuentra la mejor jugada.',
          solutionUci: ['d3d4', 'e5d4', 'g7f5', 'h4h3', 'f5d4'],
          hint: 'Busca una jugada, a menudo con jaque, desde la que una misma pieza amenace dos cosas a la vez.',
          explanationCorrect:
            'Correcto: Qxd4+ Qxd4 Nf5+ Kh3 Nxd4. Es la mejor jugada y la línea te deja 3 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // Bb6Ue
          fen: '8/5pk1/1r4P1/4R1Kp/7P/6P1/8/8 b - - 0 45',
          prompt: 'Juegan negras. Encuentra la mejor jugada.',
          solutionUci: ['f7f6', 'g5h5', 'f6e5'],
          hint: 'Busca una jugada, a menudo con jaque, desde la que una misma pieza amenace dos cosas a la vez.',
          explanationCorrect:
            'Correcto: f6+ Kxh5 fxe5. Es la mejor jugada y la línea te deja 4 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // q7BBH
          fen: '7k/7p/1R4pb/3B1p2/8/2P4P/PP2r3/6K1 b - - 0 37',
          prompt: 'Juegan negras. Encuentra la mejor jugada.',
          solutionUci: ['h6e3', 'g1f1', 'e2f2', 'f1e1', 'e3b6'],
          hint: 'Busca una jugada, a menudo con jaque, desde la que una misma pieza amenace dos cosas a la vez.',
          explanationCorrect:
            'Correcto: Be3+ Kf1 Rf2+ Ke1 Bxb6. Es la mejor jugada y la línea te deja 5 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
      ],
    },
    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u19.l02',
      unitId: 'u19',
      title: 'La clavada',
      objective:
        'Aprovechar una pieza rival que no puede moverse sin dejar expuesta otra más valiosa, en posiciones reales.',
      conceptIds: ['tactics.pin'],
      intro:
        'Una pieza clavada no puede moverse sin dejar al descubierto otra de más valor detrás (a veces el rey, y entonces no puede moverse en absoluto). Ataca la pieza clavada o aprovecha que ya no defiende bien. Antes de mover, mira las líneas de alfiles, torres y dama: busca dos piezas rivales alineadas con una pieza tuya que las vigila.',
      explanation: [
        {
          // pKsmK
          fen: '6k1/pQ3rpp/1p6/4p3/4P1P1/4qP1P/2r5/3R3K w - - 0 28',
          text: 'Línea (empiezan blancas): Rd8+ Rf8 Qd5+ Kh8 Rxf8#. La línea termina en mate. Observa qué pieza rival queda atada a su línea y cómo se aprovecha.',
          squares: ['d8'],
          arrows: [['d1', 'd8']],
        },
        {
          // DrV9S
          fen: '3N4/3q2k1/pp2pp2/3p3p/PP6/3NbP1P/6P1/2R4K w - - 1 43',
          text: 'Línea (empiezan blancas): Rc7 Qxc7 Nxe6+ Kf7 Nxc7. Al final de la línea tienes 5 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9). Observa qué pieza rival queda atada a su línea y cómo se aprovecha.',
          squares: ['c7'],
          arrows: [['c1', 'c7']],
        },
      ],
      practice: [
        {
          // f4Lls
          fen: '4k3/5p2/p3p1pp/1r1bP3/5P2/8/1P4PP/2RB2K1 w - - 3 37',
          prompt: 'Juegan blancas. Encuentra la mejor jugada.',
          solutionUci: ['d1a4', 'e8d8', 'a4b5'],
          hint: 'Mira qué pieza rival está alineada con otra más valiosa o con el rey: ¿qué pasa si no puede moverse?',
          explanationCorrect:
            'Correcto: Ba4 Kd8 Bxb5. Es la mejor jugada y la línea te deja 5 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // EcWVi
          fen: '8/p1R2pk1/4pnpp/8/1r2PKP1/5P1P/P3B3/8 b - - 1 28',
          prompt: 'Juegan negras. Encuentra la mejor jugada.',
          solutionUci: ['f6d5', 'f4e5', 'd5c7'],
          hint: 'Mira qué pieza rival está alineada con otra más valiosa o con el rey: ¿qué pasa si no puede moverse?',
          explanationCorrect:
            'Correcto: Nd5+ Ke5 Nxc7. Es la mejor jugada y la línea te deja 5 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // VAgi4
          fen: '8/3N1Qpk/7p/1p1p4/8/3q1P1P/6PK/1b6 w - - 1 45',
          prompt: 'Juegan blancas. Mate en 2 jugadas.',
          solutionUci: ['d7f6', 'h7h8', 'f7f8'],
          hint: 'Mira qué pieza rival está alineada con otra más valiosa o con el rey: ¿qué pasa si no puede moverse?',
          explanationCorrect:
            'Correcto: Nf6+ Kh8 Qf8#. La línea termina en mate.',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
      ],
      evaluation: [
        {
          // N747L
          fen: '2r5/3Q1pkp/1b4p1/3B4/1P1qP3/8/5PPP/5RK1 b - - 6 30',
          prompt: 'Juegan negras. Mate en 2 jugadas.',
          solutionUci: ['d4f2', 'f1f2', 'c8c1'],
          hint: 'Mira qué pieza rival está alineada con otra más valiosa o con el rey: ¿qué pasa si no puede moverse?',
          explanationCorrect:
            'Correcto: Qxf2+ Rxf2 Rc1#. La línea termina en mate.',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // la8AD
          fen: '7k/1b3pr1/p2Q3p/1p6/7q/P1B5/1P3PP1/6K1 w - - 0 37',
          prompt: 'Juegan blancas. Mate en 2 jugadas.',
          solutionUci: ['d6f8', 'h8h7', 'f8g7'],
          hint: 'Mira qué pieza rival está alineada con otra más valiosa o con el rey: ¿qué pasa si no puede moverse?',
          explanationCorrect:
            'Correcto: Qf8+ Kh7 Qxg7#. La línea termina en mate.',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // E2Lay
          fen: '4q2k/1p4p1/p2p4/2pn1p2/2PB4/3P2PP/PP1Q3K/8 w - - 0 29',
          prompt: 'Juegan blancas. Mate en 2 jugadas.',
          solutionUci: ['d2h6', 'h8g8', 'h6g7'],
          hint: 'Mira qué pieza rival está alineada con otra más valiosa o con el rey: ¿qué pasa si no puede moverse?',
          explanationCorrect:
            'Correcto: Qh6+ Kg8 Qxg7#. La línea termina en mate.',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
      ],
    },
    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u19.l03',
      unitId: 'u19',
      title: 'El ataque descubierto',
      objective:
        'Mover una pieza propia para que otra de detrás ataque por la línea abierta, en posiciones reales.',
      conceptIds: ['tactics.discovered_attack'],
      intro:
        'En un ataque descubierto se mueve una pieza que tapa a otra tuya, y la pieza de detrás ataca por la línea que queda abierta. La pieza que se mueve puede dar jaque o amenazar algo por su cuenta, y entonces el rival no puede atender las dos amenazas. Antes de mover, busca una torre, un alfil o una dama tuyos con una pieza propia delante en su línea.',
      explanation: [
        {
          // UfQPc
          fen: 'R1Q5/6pk/7p/8/8/3p3P/P5P1/3Knr2 b - - 0 49',
          text: 'Línea (empiezan negras): Nf3#. La línea termina en mate. Observa qué pieza se aparta y qué pieza de detrás ataca por la línea abierta.',
          squares: ['f3'],
          arrows: [['e1', 'f3']],
        },
        {
          // KTJPC
          fen: '5R2/3B4/8/2p1kp1p/1pK1n3/1P5r/8/8 w - - 2 63',
          text: 'Línea (empiezan blancas): Rxf5+ Kd6 Rd5+ Ke7 Bxh3. Al final de la línea tienes 6 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9). Observa qué pieza se aparta y qué pieza de detrás ataca por la línea abierta.',
          squares: ['f5'],
          arrows: [['f8', 'f5']],
        },
      ],
      practice: [
        {
          // u2rpt
          fen: '8/1p4Qp/2p5/3k4/4p3/P1P4P/1q4PK/8 w - - 1 57',
          prompt: 'Juegan blancas. Encuentra la mejor jugada.',
          solutionUci: ['c3c4', 'd5c4', 'g7b2'],
          hint: 'Piensa qué pieza tuya tapa la línea de otra: al moverla, ¿qué amenaza la pieza de detrás?',
          explanationCorrect:
            'Correcto: c4+ Kxc4 Qxb2. Es la mejor jugada y la línea te deja 8 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // Hy7sn
          fen: '8/5kp1/r1N1Rp1p/1n6/8/6PP/5P2/6K1 w - - 1 35',
          prompt: 'Juegan blancas. Encuentra la mejor jugada.',
          solutionUci: ['c6d8', 'f7g8', 'e6a6'],
          hint: 'Piensa qué pieza tuya tapa la línea de otra: al moverla, ¿qué amenaza la pieza de detrás?',
          explanationCorrect:
            'Correcto: Nd8+ Kg8 Rxa6. Es la mejor jugada y la línea te deja 5 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // RG85k
          fen: '8/p3rk2/4pppp/8/4Qn1q/1P6/P2PNPP1/4R1K1 b - - 1 35',
          prompt: 'Juegan negras. Encuentra la mejor jugada.',
          solutionUci: ['f4h3', 'g2h3', 'h4e4'],
          hint: 'Piensa qué pieza tuya tapa la línea de otra: al moverla, ¿qué amenaza la pieza de detrás?',
          explanationCorrect:
            'Correcto: Nh3+ gxh3 Qxe4. Es la mejor jugada y la línea te deja 6 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
      ],
      evaluation: [
        {
          // OrjFZ
          fen: '8/6R1/8/p7/P1B2P2/1P2b1P1/1r3k2/3K4 b - - 8 45',
          prompt: 'Juegan negras. Encuentra la mejor jugada.',
          solutionUci: ['b2d2', 'd1c1', 'd2d7', 'c1c2', 'd7g7'],
          hint: 'Piensa qué pieza tuya tapa la línea de otra: al moverla, ¿qué amenaza la pieza de detrás?',
          explanationCorrect:
            'Correcto: Rd2+ Kc1 Rd7+ Kc2 Rxg7. Es la mejor jugada y la línea te deja 5 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // VusEc
          fen: '6k1/6p1/2p1p3/4P2p/2q2P1P/P2r2P1/4Q1K1/5R2 b - - 4 31',
          prompt: 'Juegan negras. Encuentra la mejor jugada.',
          solutionUci: ['d3g3', 'g2g3', 'c4e2'],
          hint: 'Piensa qué pieza tuya tapa la línea de otra: al moverla, ¿qué amenaza la pieza de detrás?',
          explanationCorrect:
            'Correcto: Rxg3+ Kxg3 Qxe2. Es la mejor jugada y la línea te deja 5 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
        {
          // JxGIO
          fen: '6k1/N1R2pp1/7p/2b5/P7/6P1/2r2P1P/6K1 b - - 0 33',
          prompt: 'Juegan negras. Encuentra la mejor jugada.',
          solutionUci: ['c5f2', 'g1g2', 'c2c7'],
          hint: 'Piensa qué pieza tuya tapa la línea de otra: al moverla, ¿qué amenaza la pieza de detrás?',
          explanationCorrect:
            'Correcto: Bxf2+ Kg2 Rxc7. Es la mejor jugada y la línea te deja 6 puntos de material más que al empezar (peón 1, pieza menor 3, torre 5, dama 9).',
          explanationWrong:
            'Esa jugada no es la mejor de la posición. Repasa la idea de la lección y busca una jugada con jaque o captura que cree una amenaza que el rival no pueda parar.',
        },
      ],
    },
  ],
};
