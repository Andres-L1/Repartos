import type { Unit } from '../schema.js';

/**
 * Unidad 10 · Táctica II: enfilada, desviación y eliminar al defensor (intermedio, 1100-1400 Elo).
 * Pendiente de validación de profesores. Cada ejercicio se verifica por código (test/content/unitsD.test.ts:
 * mate en 2 forzado y único, o mejor jugada por material con un peón de margen) y con Stockfish 16 a profundidad 18
 * (scripts/verify-fase4.mts: la solución es la mejor, deja ventaja clara y toda jugada a 30 cp o menos está en `alt`).
 */
export const unit: Unit = {
  id: 'u10',
  order: 11,
  title: 'Táctica II: enfilada, desviación y eliminar al defensor',
  description:
    'Tres ideas tácticas nuevas: la enfilada, que ataca una pieza valiosa para ganar la que tiene detrás; la desviación, que aparta a un defensor de su tarea, y eliminar al defensor, que captura la pieza que protege a otra.',
  level: 'intermediate',
  requires: ['u09'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u10.l01',
      unitId: 'u10',
      title: 'La enfilada',
      objective:
        'Reconocer dos piezas rivales en la misma línea, la más valiosa delante, y atacarla para ganar la de detrás.',
      conceptIds: ['tactics.skewer'],
      intro:
        'La enfilada es una clavada al revés. En la clavada, la pieza de delante vale menos y no se atreve a moverse. En la enfilada, la de delante vale más (muchas veces es el rey): está obligada a apartarse y deja sin protección a la pieza que tenía detrás en la misma fila, columna o diagonal. La hacen las piezas de largo alcance: alfil, torre y dama.',
      explanation: [
        {
          fen: '4k2r/1p3ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
          text: 'El rey negro de e8 y la torre de h8 están en la octava fila, con f8 y g8 vacías. Ra8+ da jaque al rey; como no puede quedarse en la fila, tiene que salir de ella, y la torre blanca captura en h8. Señal de enfilada: rey (o dama) y otra pieza en la misma línea, con casillas vacías entre ellos.',
          squares: ['e8', 'h8'],
          arrows: [
            ['a1', 'a8'],
            ['a8', 'h8'],
          ],
        },
        {
          fen: '6r1/pp4pp/4k3/8/8/8/PP3PPP/5BK1 w - - 0 1',
          text: 'Con el alfil pasa lo mismo en diagonal. Bc4+ da jaque al rey de e6 y detrás, en la diagonal c4-g8, está la torre. El rey no puede ir a f7, que sigue en la diagonal del alfil, así que se aparta y Bxg8 gana la torre.',
          squares: ['e6', 'g8'],
          arrows: [
            ['f1', 'c4'],
            ['c4', 'g8'],
          ],
        },
      ],
      practice: [
        {
          fen: '4k2r/1p3ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
          prompt: 'Juegan blancas. El rey y la torre negros están en la misma fila. Gana la torre con una enfilada.',
          solutionUci: ['a1a8'],
          hint: 'Lleva la torre a la octava fila, donde están el rey y la torre negros.',
          explanationCorrect:
            'Correcto: Ra8+. El rey tiene que salir de la octava fila (Kd7 o Ke7) y la torre captura en h8: Rxh8.',
          explanationWrong:
            'Esa jugada no ataca al rey. Busca un jaque en la octava fila: el rey se apartará y la torre de h8 quedará a tu alcance.',
        },
        {
          fen: '2b3k1/p4ppp/1p6/8/8/3K4/P4PPP/1R6 b - - 0 1',
          prompt: 'Juegan negras. El rey blanco y su torre están en la misma diagonal. Gana la torre.',
          solutionUci: ['c8f5'],
          hint: 'Mira la diagonal que va de b1 a h7: pasa por d3.',
          explanationCorrect:
            'Correcto: Bf5+. El rey blanco no puede ir a c2, que sigue en la diagonal, y al apartarse deja la torre de b1 sin protección: Bxb1.',
          explanationWrong:
            'Esa jugada no aprovecha la diagonal b1-h7. Un jaque del alfil desde f5 obliga al rey a apartarse y deja la torre de b1 a tu alcance.',
        },
        {
          fen: '4k2r/p2p1ppp/2Q5/8/8/7b/5PPP/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Gana la torre de h8 con un jaque de la dama en la octava fila.',
          solutionUci: ['c6c8'],
          alt: ['c6a8'],
          hint: 'La dama puede llegar a la octava fila por la columna c o por la diagonal hacia a8.',
          explanationCorrect:
            'Correcto. Desde c8 o desde a8 la dama da jaque por la octava fila. El rey sale a e7 y la dama captura la torre: Qxh8. Las dos casillas sirven igual.',
          explanationWrong:
            'Esa jugada no hace la enfilada. La dama tiene que dar jaque en la octava fila, con la torre de h8 detrás del rey.',
          wrongByMove: {
            c6d7: 'Qxd7+ es jaque, pero las negras capturan la dama: Kxd7 o Bxd7.',
          },
        },
      ],
      evaluation: [
        {
          fen: '5q2/p4ppp/3k4/8/8/8/P4PPP/R3B1K1 w - - 0 1',
          prompt: 'Juegan blancas. Gana la dama negra.',
          solutionUci: ['e1b4'],
          hint: 'El rey de d6 y la dama de f8 comparten la diagonal que va de a3 a f8.',
          explanationCorrect:
            'Correcto: Bb4+. El rey no puede quedarse en la diagonal (e7 y c5 siguen atacadas) y, al apartarse, Bxf8 gana la dama.',
          explanationWrong:
            'Esa jugada no ataca la diagonal del rey y la dama. Con un jaque del alfil desde b4, el rey se aparta y la dama de f8 queda sin protección.',
          wrongByMove: {
            a1d1: 'Rd1+ es jaque, pero no hay nada detrás del rey en la columna d: la dama de f8 sigue a salvo.',
          },
        },
        {
          fen: 'r7/5pkp/6p1/8/3K3R/8/5PPP/8 b - - 0 1',
          prompt: 'Juegan negras. Gana la torre blanca.',
          solutionUci: ['a8a4'],
          hint: 'El rey blanco y su torre están en la cuarta fila.',
          explanationCorrect:
            'Correcto: Ra4+. El rey blanco tiene que salir de la cuarta fila y la torre de h4 queda sin protección: Rxh4.',
          explanationWrong:
            'Esa jugada no aprovecha la cuarta fila. Un jaque de la torre en esa fila obliga al rey a apartarse y deja la torre de h4 a tu alcance.',
        },
        {
          fen: '7k/4b1pp/p7/1p6/8/1P2K3/P5PP/6R1 b - - 0 1',
          prompt: 'Juegan negras. Gana la torre de g1.',
          solutionUci: ['e7c5'],
          hint: 'Busca la diagonal que une al rey de e3 con la torre de g1.',
          explanationCorrect:
            'Correcto: Bc5+. Jaque por la diagonal c5-g1. El rey no puede ir a f2, que sigue en la diagonal, y al apartarse Bxg1 gana la torre.',
          explanationWrong:
            'Esa jugada no ataca al rey en la diagonal de la torre. Desde c5 el alfil da jaque y, cuando el rey se aparta, captura en g1.',
          wrongByMove: {
            e7g5: 'Bg5+ es jaque, pero en la diagonal g5-c1 no hay nada detrás del rey: la torre de g1 sigue a salvo.',
          },
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u10.l02',
      unitId: 'u10',
      title: 'La desviación',
      objective:
        'Encontrar la pieza rival que hace dos tareas a la vez y obligarla a abandonar una de ellas con una captura o un jaque.',
      conceptIds: ['tactics.deflection'],
      intro:
        'Muchas piezas defienden algo: una casilla, una fila o a otra pieza. Si esa pieza tiene dos tareas a la vez, está sobrecargada: cuando cumple una, abandona la otra. La desviación consiste en obligarla a moverse, casi siempre con una captura que debe recapturar o con un jaque. Pregunta clave: ¿qué defiende cada pieza rival y qué pasa si se mueve?',
      explanation: [
        {
          fen: '3r2k1/5ppp/8/3q4/8/1Q5P/P4PP1/4R1K1 w - - 0 1',
          text: 'La torre de d8 tiene dos tareas: proteger a la dama de d5 y cubrir la octava fila. Qxd5 la obliga a elegir. Si recaptura con Rxd5, abandona la octava fila y Re8 es mate. Si no recaptura, las negras se quedan sin dama.',
          squares: ['d8', 'd5', 'e8'],
          arrows: [
            ['b3', 'd5'],
            ['e1', 'e8'],
          ],
        },
        {
          fen: '6k1/p4p1p/2p2qpP/8/6n1/2Q5/P4PP1/3R2K1 w - - 0 1',
          text: 'Aquí la dama negra de f6 tapa la diagonal de la dama blanca hacia g7, donde habría mate con el apoyo del peón de h6. Rd8+ obliga a la dama a capturar (Qxd8), porque el rey no tiene casillas. Al irse de f6, la diagonal queda abierta: Qg7#.',
          squares: ['f6', 'g7'],
          arrows: [
            ['d1', 'd8'],
            ['c3', 'g7'],
          ],
        },
      ],
      practice: [
        {
          fen: '3r2k1/5ppp/8/3q4/8/1Q5P/P4PP1/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. La torre de d8 defiende dos cosas a la vez. Aprovéchalo.',
          solutionUci: ['b3d5'],
          hint: '¿Qué pasa con la octava fila si la torre de d8 recaptura en d5?',
          explanationCorrect:
            'Correcto: Qxd5. Si Rxd5, Re8#: la torre ya no cubre la octava fila. Y si las negras no recapturan, se quedan sin dama.',
          explanationWrong:
            'Esa jugada no aprovecha que la torre de d8 está sobrecargada: defiende la dama de d5 y la octava fila a la vez.',
          wrongByMove: {
            e1e8: 'Re8+ Rxe8 Qxd5 gana la dama por la torre, pero Qxd5 gana más: si Rxd5, Re8 es mate.',
          },
        },
        {
          fen: '6k1/p4p1p/2p2qpP/8/6n1/2Q5/P4PP1/3R2K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['d1d8', 'f6d8', 'c3g7'],
          hint: 'La dama de f6 tapa la diagonal hacia g7. Oblígala a moverse con un jaque.',
          explanationCorrect:
            'Correcto: Rd8+ Qxd8 Qg7#. La dama negra tuvo que dejar f6 y la diagonal hacia g7 quedó libre; el peón de h6 apoya a la dama.',
          explanationWrong:
            'Esa jugada no da mate en dos. Busca un jaque que obligue a la dama de f6 a moverse.',
        },
        {
          fen: '3r2k1/p4pp1/2q5/6N1/8/2P2QPp/P4P1P/6K1 b - - 0 1',
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['d8d1', 'f3d1', 'c6g2'],
          hint: 'La dama blanca de f3 tapa la diagonal hacia g2. Oblígala a moverse.',
          explanationCorrect:
            'Correcto: Rd1+ Qxd1 Qg2#. La dama blanca tuvo que capturar en d1 y abrió la diagonal; el peón de h3 apoya a la dama en g2.',
          explanationWrong:
            'Esa jugada no da mate en dos. Un jaque en la primera fila obliga a la dama blanca a dejar f3.',
        },
      ],
      evaluation: [
        {
          fen: '4r1k1/p4pp1/1q5p/8/3Q4/8/P4PPP/3R2K1 b - - 0 1',
          prompt: 'Juegan negras. La torre de d1 defiende dos cosas a la vez. Aprovéchalo.',
          solutionUci: ['b6d4'],
          hint: '¿Qué pasa con la primera fila si la torre de d1 recaptura en d4?',
          explanationCorrect:
            'Correcto: Qxd4. Si Rxd4, Re1#: la torre ya no cubre la primera fila. Si las blancas no recapturan, se quedan sin dama.',
          explanationWrong:
            'Esa jugada no aprovecha que la torre de d1 defiende la dama y la primera fila a la vez.',
          wrongByMove: {
            e8e1: 'Re1+ Rxe1 Qxd4 gana la dama por la torre, pero Qxd4 gana más: si Rxd4, Re1 es mate.',
          },
        },
        {
          fen: '1r4k1/p4ppp/q7/8/1n6/5N2/P2Q1PPP/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. Gana material aprovechando a un defensor sobrecargado.',
          solutionUci: ['d2b4'],
          hint: 'La torre de b8 protege al caballo de b4. ¿Qué más defiende?',
          explanationCorrect:
            'Correcto: Qxb4. Si Rxb4, Re8#: la torre deja la octava fila. Si no recapturan, has ganado el caballo.',
          explanationWrong:
            'Esa jugada no gana nada. La torre de b8 protege al caballo y también la octava fila: captura el caballo y no podrá con las dos tareas.',
          wrongByMove: {
            e1e8: 'Re8+ Rxe8: entregas la torre y, aunque después captures el caballo, sales perdiendo material.',
          },
        },
        {
          fen: '6k1/p3bppp/q7/3n2n1/8/3P4/PP3PPP/1NQ1R1K1 w - - 0 1',
          prompt: 'Juegan blancas. Gana material. Fíjate en lo que hace el alfil de e7.',
          solutionUci: ['c1g5'],
          hint: 'El alfil de e7 protege al caballo de g5 y a la vez tapa la columna e.',
          explanationCorrect:
            'Correcto: Qxg5. Si Bxg5, la columna e queda abierta y Re8#. Si las negras no recapturan, has ganado el caballo.',
          explanationWrong:
            'Esa jugada no aprovecha al alfil de e7, que hace dos cosas: protege al caballo de g5 y tapa la columna e.',
          wrongByMove: {
            e1e7: 'Rxe7 Nxe7: cambias la torre por el alfil y pierdes material.',
          },
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u10.l03',
      unitId: 'u10',
      title: 'Eliminar al defensor',
      objective:
        'Identificar la única pieza que protege a otra (o a una casilla clave) y capturarla para ganar lo que defendía.',
      conceptIds: ['tactics.remove_defender'],
      intro:
        'Si una pieza rival está atacada y solo la protege otra, no hace falta atacarla más: basta con capturar a su defensor. El rival tiene que elegir entre recuperar el material o salvar la pieza que se queda sin protección, y no puede hacer las dos cosas. La misma idea sirve para dar mate: si una pieza defiende la casilla del mate, captúrala.',
      explanation: [
        {
          fen: '2q3k1/pp3ppp/5n2/3b2B1/8/1P6/P3NPPP/3Q2K1 w - - 0 1',
          text: 'Tu dama ataca al alfil de d5 y solo lo protege el caballo de f6. Bxf6 captura al defensor. Si gxf6, el alfil de d5 se queda sin protección y Qxd5. Si las negras salvan el alfil, te quedas con el caballo que has capturado.',
          squares: ['f6', 'd5'],
          arrows: [
            ['g5', 'f6'],
            ['d1', 'd5'],
          ],
        },
        {
          fen: 'r3n1k1/p4ppp/1q5P/8/8/2Q5/P4PP1/4R1K1 w - - 0 1',
          text: 'La dama blanca y el peón de h6 apuntan a g7: Qxg7 sería mate si no fuera por el caballo de e8, que defiende g7. Rxe8+ captura al defensor con jaque; tras Rxe8, la dama da mate en g7.',
          squares: ['e8', 'g7'],
          arrows: [
            ['e1', 'e8'],
            ['c3', 'g7'],
          ],
        },
      ],
      practice: [
        {
          fen: '2q3k1/pp3ppp/5n2/3b2B1/8/1P6/P3NPPP/3Q2K1 w - - 0 1',
          prompt: 'Juegan blancas. El alfil de d5 solo tiene un defensor. Gana material.',
          solutionUci: ['g5f6'],
          hint: '¿Qué pieza protege al alfil de d5? Captúrala.',
          explanationCorrect:
            'Correcto: Bxf6. Si gxf6, Qxd5 gana el alfil. Si las negras salvan el alfil, te quedas con el caballo.',
          explanationWrong:
            'Esa jugada no gana material. El alfil de d5 solo lo protege el caballo de f6: captura al defensor.',
        },
        {
          fen: '4r1k1/p1qn1pp1/1p5p/8/1b2B3/8/PP1N1PPP/R2Q2K1 b - - 0 1',
          prompt: 'Juegan negras. El alfil de e4 solo tiene un defensor. Gana material.',
          solutionUci: ['b4d2'],
          hint: 'Tu torre ataca e4. ¿Quién lo protege?',
          explanationCorrect:
            'Correcto: Bxd2. Si las blancas recapturan (Qxd2), Rxe4 gana el alfil. Si salvan el alfil, te quedas con el caballo.',
          explanationWrong:
            'Esa jugada no gana material. El alfil de e4 solo lo protege el caballo de d2: captura al defensor.',
        },
        {
          fen: 'r3n1k1/p4ppp/1q5P/8/8/2Q5/P4PP1/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['e1e8', 'a8e8', 'c3g7'],
          hint: 'La casilla del mate es g7. ¿Qué pieza la defiende?',
          explanationCorrect:
            'Correcto: Rxe8+ Rxe8 Qxg7#. El caballo de e8 defendía g7; sin él, el rey no puede capturar la dama porque el peón de h6 la protege.',
          explanationWrong:
            'Esa jugada no da mate en dos. El caballo de e8 defiende g7: captúralo con jaque.',
          wrongByMove: {
            c3g7: 'Qxg7+ Nxg7: el caballo de e8 defiende g7 y la dama se pierde.',
          },
        },
      ],
      evaluation: [
        {
          fen: '3r2k1/1p2qp1p/p5p1/n7/3B2b1/5N2/PPQ2PPP/R5K1 b - - 0 1',
          prompt: 'Juegan negras. Gana material.',
          solutionUci: ['g4f3'],
          hint: 'Tu torre ataca al alfil de d4. ¿Qué pieza blanca lo defiende?',
          explanationCorrect:
            'Correcto: Bxf3. Si gxf3, Rxd4 gana el alfil. Si las blancas salvan el alfil, te quedas con el caballo.',
          explanationWrong:
            'Esa jugada no gana material. El alfil de d4 solo lo protege el caballo de f3: captura al defensor.',
        },
        {
          fen: '5rk1/pp3ppp/2n5/1B2b3/7q/1P5P/P4PP1/1N1QR1K1 w - - 0 1',
          prompt: 'Juegan blancas. Gana material.',
          solutionUci: ['b5c6'],
          hint: 'Tu torre ataca al alfil de e5. ¿Quién lo defiende?',
          explanationCorrect:
            'Correcto: Bxc6. Si bxc6, Rxe5 gana el alfil. Si las negras salvan el alfil, te quedas con el caballo.',
          explanationWrong:
            'Esa jugada no gana material. El alfil de e5 solo lo protege el caballo de c6: captura al defensor.',
        },
        {
          fen: '4r1k1/p4pp1/2q5/7Q/8/6Pp/P4P1P/R3N1K1 b - - 0 1',
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['e8e1', 'a1e1', 'c6g2'],
          hint: 'La casilla del mate es g2. ¿Qué pieza blanca la defiende?',
          explanationCorrect:
            'Correcto: Rxe1+ Rxe1 Qg2#. El caballo de e1 defendía g2; sin él, el rey no puede capturar la dama porque el peón de h3 la protege.',
          explanationWrong:
            'Esa jugada no da mate en dos. El caballo de e1 defiende g2: captúralo con jaque.',
          wrongByMove: {
            c6g2: 'Qxg2+ Nxg2: el caballo de e1 defiende g2 y la dama se pierde.',
          },
        },
      ],
    },
  ],
};
