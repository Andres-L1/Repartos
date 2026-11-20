import type { Unit } from '../schema.js';

/**
 * Unidad 7 · Ataques dobles y clavadas (básico, 800-1100 Elo).
 * Pendiente de validación de profesores. Cada ejercicio se verifica por código (test/content/unitsC.test.ts):
 * la solución es la mejor jugada por búsqueda de material (profundidad 3 con capturas) con al menos un peón de margen.
 */
export const unit: Unit = {
  id: 'u07',
  order: 7,
  title: 'Ataques dobles y clavadas',
  description:
    'Un paso más en táctica: ataques dobles con la dama y el alfil, horquillas de caballo y de peón, y cómo ganar material contra una pieza clavada. Aprenderás a buscar la jugada que crea dos amenazas a la vez.',
  level: 'basic',
  requires: ['u06'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u07.l01',
      unitId: 'u07',
      title: 'El ataque doble con la dama y el alfil',
      objective:
        'Encontrar jugadas de dama o alfil que atacan a la vez al rey y a una pieza sin defensa, y ganar esa pieza.',
      conceptIds: ['tactics.fork'],
      intro:
        'Un ataque doble es una jugada que crea dos amenazas a la vez. El rival solo puede atender una, así que la otra se cumple. La dama es la mejor pieza para esto porque mueve en ocho direcciones, y el alfil lo hace por las diagonales. El ataque doble más fuerte es el que incluye un jaque: el rival está obligado a salir del jaque y no tiene tiempo de salvar la otra pieza.',
      explanation: [
        {
          fen: '4k3/8/8/8/1b6/8/8/3Q2K1 w - - 0 1',
          text: 'El alfil negro de b4 no tiene defensa. Desde a4 la dama daría jaque al rey por la diagonal a4-e8 y a la vez atacaría al alfil por la fila 4. Negras deben mover el rey y la dama captura el alfil. Busca siempre casillas desde las que tu dama vea al rey y a una pieza suelta a la vez.',
          squares: ['b4', 'e8'],
          arrows: [
            ['d1', 'a4'],
            ['a4', 'e8'],
            ['a4', 'b4'],
          ],
        },
        {
          fen: '5bk1/R5pp/8/8/8/8/6PP/6K1 b - - 0 1',
          text: 'El alfil también ataca en dos direcciones. Si el alfil negro va a c5, da jaque al rey blanco por la diagonal c5-g1 y ataca a la torre de a7 por la diagonal c5-a7. Las piezas sin defensa y el rey en la misma diagonal o fila son la señal de que hay un ataque doble.',
          squares: ['a7', 'g1'],
          arrows: [
            ['f8', 'c5'],
            ['c5', 'g1'],
            ['c5', 'a7'],
          ],
        },
      ],
      practice: [
        {
          fen: '4k3/8/8/8/1b6/8/8/3Q2K1 w - - 0 1',
          prompt: 'Juegan blancas. El alfil negro no tiene defensa. Gánalo con un jaque que lo ataque a la vez.',
          solutionUci: ['d1a4'],
          hint: 'Busca una casilla desde la que la dama vea al rey de e8 y al alfil de b4.',
          explanationCorrect:
            'Correcto: Qa4+. La dama da jaque por la diagonal y ataca el alfil por la fila 4. Negras mueven el rey y la dama captura el alfil.',
          explanationWrong:
            'Esa jugada no crea dos amenazas. Hace falta un jaque que, además, ataque al alfil de b4.',
        },
        {
          fen: 'r5k1/6pp/8/8/8/8/5PPP/3Q2K1 w - - 0 1',
          prompt: 'Juegan blancas. La torre de a8 está sola. Encuentra el jaque que también la ataca.',
          solutionUci: ['d1d5'],
          hint: 'Desde el centro, la dama puede ver dos diagonales a la vez.',
          explanationCorrect:
            'Correcto: Qd5+. La dama da jaque por la diagonal d5-g8 y ataca la torre por la diagonal d5-a8. Tras mover el rey, Qxa8+.',
          explanationWrong:
            'No era esa. La dama tiene una casilla central desde la que ataca al rey y a la torre de a8 por dos diagonales distintas.',
          wrongByMove: {
            d1d8: 'Qd8+ es jaque, pero la torre de a8 captura la dama (Rxd8): has regalado la pieza más valiosa.',
          },
        },
        {
          fen: '3q2k1/6pp/8/8/8/8/6PP/R5K1 b - - 0 1',
          prompt: 'Juegan negras. La torre blanca de a1 no tiene defensa. Gánala con un jaque.',
          solutionUci: ['d8d4'],
          hint: 'La diagonal a1-h8 y la diagonal que llega a g1 se cruzan en una casilla central.',
          explanationCorrect:
            'Correcto: Qd4+. Jaque por la diagonal d4-g1 y ataque a la torre por la diagonal d4-a1. Blancas mueven el rey y Qxa1+.',
          explanationWrong:
            'Esa jugada no ataca dos cosas a la vez. Busca el jaque que también apunte a la torre de a1.',
          wrongByMove: {
            d8d1: 'Qd1+ es jaque, pero la torre captura la dama (Rxd1).',
          },
        },
      ],
      evaluation: [
        {
          fen: '1k6/8/8/8/8/r7/8/3Q2K1 w - - 0 1',
          prompt: 'Juegan blancas. Gana la torre de a3 con un ataque doble.',
          solutionUci: ['d1d6'],
          hint: 'Una casilla de la columna d ve al rey de b8 y a la torre por diagonales.',
          explanationCorrect:
            'Correcto: Qd6+. Jaque por la diagonal d6-b8 y ataque a la torre por la diagonal d6-a3. Tras mover el rey, la dama captura la torre.',
          explanationWrong:
            'Esa jugada deja que la torre escape. Hace falta un jaque que, a la vez, ataque a la torre.',
        },
        {
          fen: '5bk1/R5pp/8/8/8/8/6PP/6K1 b - - 0 1',
          prompt: 'Juegan negras. La torre blanca de a7 está sola. Gánala con el alfil.',
          solutionUci: ['f8c5'],
          hint: 'El alfil puede dar jaque al rey de g1 desde una casilla que también ve a7.',
          explanationCorrect:
            'Correcto: Bc5+. El alfil da jaque y ataca la torre. Blancas salen del jaque y Bxa7.',
          explanationWrong:
            'No era esa. El alfil tiene un jaque que también ataca a la torre de a7.',
        },
        {
          fen: '2k5/8/8/6b1/8/8/8/3QK3 w - - 0 1',
          prompt: 'Juegan blancas. El alfil de g5 no tiene defensa. Gánalo.',
          solutionUci: ['d1g4'],
          hint: 'Busca un jaque al rey de c8 desde una casilla vecina al alfil.',
          explanationCorrect:
            'Correcto: Qg4+. Jaque por la diagonal g4-c8 y ataque al alfil, que está al lado. Negras mueven el rey y Qxg5.',
          explanationWrong:
            'Así el alfil tiene tiempo de escapar. Busca un jaque que también lo ataque.',
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u07.l02',
      unitId: 'u07',
      title: 'Horquillas de caballo y de peón',
      objective:
        'Encontrar saltos de caballo y avances de peón que atacan dos piezas a la vez, sobre todo con jaque, y ganar material con ellos.',
      conceptIds: ['tactics.fork'],
      intro:
        'Ya conoces la horquilla. En este nivel aprenderás a buscarla de forma ordenada: mira dónde están el rey, la dama y las torres del rival, y comprueba si tu caballo puede llegar a una casilla que ataque a dos de ellas. El caballo es peligroso porque su ataque no se puede tapar. El peón también hace horquillas, y como vale poco, cualquier pieza que ataque vale más que él.',
      explanation: [
        {
          fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1',
          text: 'Horquilla con jaque. Desde c7 el caballo ataca al rey de e8 y a la torre de a8. El rey debe salir del jaque y el caballo captura la torre. Antes de jugar, mira las casillas a las que puede saltar tu caballo y qué piezas rivales ataca desde cada una.',
          squares: ['c7', 'e8', 'a8'],
          arrows: [
            ['d5', 'c7'],
            ['c7', 'e8'],
            ['c7', 'a8'],
          ],
        },
        {
          fen: '6k1/8/2n1n3/8/3P4/8/8/6K1 w - - 0 1',
          text: 'Horquilla de peón. Si el peón avanza a d5, ataca a los dos caballos a la vez (c6 y e6). Solo uno puede escapar y el peón captura el otro. Dos piezas rivales separadas por una casilla delante de tus peones son una oportunidad.',
          squares: ['c6', 'e6'],
          arrows: [
            ['d4', 'd5'],
            ['d5', 'c6'],
            ['d5', 'e6'],
          ],
        },
      ],
      practice: [
        {
          fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. Gana la torre de a8 con una horquilla de caballo.',
          solutionUci: ['d5c7'],
          hint: 'Busca la casilla que ataca a la vez a e8 y a a8.',
          explanationCorrect:
            'Correcto: Nc7+. El caballo da jaque y ataca la torre. El rey mueve y Nxa8.',
          explanationWrong:
            'Esa jugada no ataca dos piezas a la vez. El caballo tiene un salto que da jaque y ataca la torre.',
          wrongByMove: {
            d5f6: 'Nf6+ es jaque, pero desde f6 el caballo no ataca la torre: el rey se aparta y no ganas nada.',
          },
        },
        {
          fen: '6k1/8/2n1n3/8/3P4/8/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Los dos caballos negros atacan tu peón. Contraataca y gana una pieza.',
          solutionUci: ['d4d5'],
          hint: 'El peón captura en diagonal. ¿Desde qué casilla ataca a los dos caballos?',
          explanationCorrect:
            'Correcto: d5. El peón ataca a la vez a c6 y a e6. Solo un caballo puede escapar y capturas el otro.',
          explanationWrong:
            'Así pierdes el peón y no ganas nada. Avanza el peón a la casilla desde la que ataca a los dos caballos.',
        },
        {
          fen: '6k1/5ppp/8/8/3n4/2Q5/5PPP/6K1 b - - 0 1',
          prompt: 'Juegan negras. La dama blanca ataca tu caballo. Úsalo para ganar la dama.',
          solutionUci: ['d4e2'],
          hint: 'Busca un salto que dé jaque al rey de g1 y ataque a c3.',
          explanationCorrect:
            'Correcto: Ne2+. El caballo da jaque al rey y ataca a la dama. Blancas mueven el rey y Nxc3.',
          explanationWrong:
            'No era esa. El caballo tiene un salto con jaque que también ataca a la dama de c3.',
          wrongByMove: {
            d4f3: 'Nf3+ es jaque, pero el peón de g2 captura el caballo (gxf3) y pierdes la pieza.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4k3/8/q7/1N6/8/8/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. La dama negra ataca tu caballo. Gana la dama.',
          solutionUci: ['b5c7'],
          hint: 'Un salto del caballo ataca al rey de e8 y a la dama de a6.',
          explanationCorrect:
            'Correcto: Nc7+. Jaque y ataque a la dama. El rey sale del jaque y Nxa6.',
          explanationWrong:
            'Esa jugada no aprovecha la posición del rey y la dama. Hay una horquilla con jaque.',
        },
        {
          fen: '8/8/4n1k1/8/4KP2/8/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Gana el caballo con una horquilla de peón.',
          solutionUci: ['f4f5'],
          hint: 'El peón puede atacar al rey y al caballo a la vez; tu rey lo protege.',
          explanationCorrect:
            'Correcto: f5+. El peón da jaque y ataca el caballo. El rey negro no puede capturar el peón porque lo defiende tu rey, así que mueve y fxe6.',
          explanationWrong:
            'No era esa. El peón tiene un avance que da jaque y ataca el caballo a la vez.',
        },
        {
          fen: '3k4/8/8/8/6n1/8/8/3K3R b - - 0 1',
          prompt: 'Juegan negras. La torre blanca de h1 está lejos de su rey. Gánala.',
          solutionUci: ['g4f2'],
          hint: 'Busca la casilla que ataca a d1 y a h1 a la vez.',
          explanationCorrect:
            'Correcto: Nf2+. El caballo da jaque y ataca la torre. El rey se aparta y Nxh1.',
          explanationWrong:
            'Esa jugada no gana nada. Hay un salto con jaque que también ataca a la torre.',
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u07.l03',
      unitId: 'u07',
      title: 'Ganar la pieza clavada',
      objective:
        'Atacar una pieza clavada con un peón o con una pieza de menos valor, y crear clavadas que ganan material.',
      conceptIds: ['tactics.pin'],
      intro:
        'Una pieza clavada contra su rey no se puede mover: si se moviera, dejaría al rey en jaque. Eso la convierte en un blanco. La forma más sencilla de ganarla es atacarla con algo que valga menos, como un peón: la pieza no puede huir y el rival no puede defenderla a tiempo. Y si la clavada es contra la dama, a veces ganas la dama entera.',
      explanation: [
        {
          fen: '4k3/1p6/2n5/1B6/3P4/8/8/4K3 w - - 0 1',
          text: 'El alfil de b5 clava el caballo de c6 contra el rey de e8. El caballo no se puede mover. Si el peón avanza a d5, ataca al caballo y este no puede escapar: blancas ganan una pieza por un peón. Capturar ya con el alfil (Bxc6+ bxc6) solo sería un cambio.',
          squares: ['c6', 'e8'],
          arrows: [
            ['b5', 'e8'],
            ['d4', 'd5'],
          ],
        },
        {
          fen: '4k3/3q4/8/8/P7/8/8/4KB2 w - - 0 1',
          text: 'También puedes crear la clavada. Si el alfil va a b5, la dama de d7 queda clavada contra su rey. La dama puede capturar el alfil, pero el peón de a4 lo defiende: la dama se cambia por un alfil. Antes de clavar, comprueba que la casilla está defendida.',
          squares: ['d7', 'b5'],
          arrows: [
            ['f1', 'b5'],
            ['b5', 'e8'],
          ],
        },
      ],
      practice: [
        {
          fen: '4k3/1p6/2n5/1B6/3P4/8/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. El caballo de c6 está clavado. Gánalo con un peón.',
          solutionUci: ['d4d5'],
          hint: 'Ataca la pieza clavada con tu pieza de menos valor.',
          explanationCorrect:
            'Correcto: d5. El caballo clavado no puede huir y el peón lo captura en la jugada siguiente. Ganas una pieza por un peón.',
          explanationWrong:
            'Esa jugada no gana material. El caballo no se puede mover: atácalo con el peón.',
          wrongByMove: {
            b5c6: 'Bxc6+ bxc6 es solo un cambio de alfil por caballo. Hay una jugada que gana la pieza entera.',
          },
        },
        {
          fen: '4k3/8/3p4/4n3/8/8/5P2/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. Tu torre clava el caballo contra el rey. Gánalo.',
          solutionUci: ['f2f4'],
          hint: 'Un peón puede atacar al caballo y el caballo no puede escapar.',
          explanationCorrect:
            'Correcto: f4. El caballo está clavado y el peón lo captura en la jugada siguiente. Aunque el peón de d6 recapture, ganas un caballo por un peón.',
          explanationWrong:
            'No era esa. Ataca el caballo clavado con un peón.',
          wrongByMove: {
            e1e5: 'Rxe5+ dxe5: das una torre por un caballo. Mejor atacar el caballo con un peón.',
          },
        },
        {
          fen: '4k3/8/8/3p4/1b6/2N5/1P6/4K3 b - - 0 1',
          prompt: 'Juegan negras. Tu alfil clava el caballo blanco. Gana material.',
          solutionUci: ['d5d4'],
          hint: 'Ataca el caballo clavado con un peón.',
          explanationCorrect:
            'Correcto: d4. El caballo no puede moverse porque dejaría a su rey en jaque, y el peón lo captura en la jugada siguiente.',
          explanationWrong:
            'Esa jugada no aprovecha la clavada. Ataca el caballo con el peón.',
        },
      ],
      evaluation: [
        {
          fen: '3k4/8/4p3/3b4/8/8/2P5/3R2K1 w - - 0 1',
          prompt: 'Juegan blancas. El alfil de d5 está clavado contra su rey. Gánalo.',
          solutionUci: ['c2c4'],
          hint: 'Un peón puede atacar al alfil, y el alfil no puede capturarlo.',
          explanationCorrect:
            'Correcto: c4. El alfil no puede moverse de la columna d sin dejar a su rey en jaque, así que tampoco puede capturar el peón. Ganas una pieza por un peón.',
          explanationWrong:
            'Así no ganas nada. Ataca el alfil clavado con un peón.',
          wrongByMove: {
            d1d5: 'Rxd5+ exd5: das una torre por un alfil. Ataca el alfil con un peón.',
          },
        },
        {
          fen: '4k3/3q4/8/8/P7/8/8/4KB2 w - - 0 1',
          prompt: 'Juegan blancas. Crea una clavada que gane la dama.',
          solutionUci: ['f1b5'],
          hint: 'La dama y el rey negros están en la misma diagonal.',
          explanationCorrect:
            'Correcto: Bb5. La dama queda clavada contra su rey. Si captura el alfil, el peón de a4 recaptura: ganas la dama por un alfil.',
          explanationWrong:
            'No era esa. Busca la casilla desde la que el alfil clava la dama contra el rey.',
        },
        {
          fen: '6k1/8/8/2b2p2/8/4N3/3P4/6K1 b - - 0 1',
          prompt: 'Juegan negras. Tu alfil clava el caballo de e3. Gánalo.',
          solutionUci: ['f5f4'],
          hint: 'Un peón puede atacar al caballo clavado.',
          explanationCorrect:
            'Correcto: f4. El caballo no puede moverse y el peón lo captura en la jugada siguiente. Aunque el peón de d2 recapture, ganas un caballo por un peón.',
          explanationWrong:
            'Esa jugada no gana material. Ataca el caballo clavado con el peón.',
        },
      ],
    },
  ],
};
