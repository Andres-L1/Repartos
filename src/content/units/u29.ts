import type { Unit } from '../schema.js';

/**
 * Método ruso, unidad 10: casillas bomba, rey ahogado y mate de dama. Pendiente de validación de profesores.
 * Mates y ahogados comprobados con chessops; las líneas completas del mate de dama, con la tablebase de Lichess.
 */
export const unit: Unit = {
  id: 'u29',
  order: 10,
  title: 'Casillas bomba y rey ahogado',
  description:
    'Aprende a dar mate con la dama en las casillas junto al rey rival, a no ahogar al rey cuando vas ganando y a dar el mate de dama paso a paso.',
  level: 'beginner',
  requires: ['u28'],
  lessons: [
    {
      id: 'u29.l01',
      unitId: 'u29',
      title: 'Las casillas bomba',
      objective: 'Reconocer las casillas junto al rey rival y dar mate con la dama colocada allí cuando está protegida.',
      intro:
        'Llamamos casillas bomba a las casillas pegadas al rey rival. Una dama que cae allí da jaque con mucha fuerza. Pero hay que mirar si la dama queda protegida.',
      explanation: [
        {
          fen: '7k/Q7/6K1/8/8/8/8/8 w - - 0 1',
          squares: ['g8', 'g7', 'h7'],
          arrows: [['a7', 'g7']],
          text: 'Las casillas bomba son las que están pegadas al rey rival: g8, g7 y h7. Si la dama cae en g7 o en h7, tu rey la protege. El rey negro no puede capturarla ni escapar: es jaque mate.',
        },
        {
          fen: '7k/8/8/8/8/8/8/K5Q1 w - - 0 1',
          squares: ['g8', 'g7', 'h7'],
          arrows: [['g1', 'g7']],
          text: 'Pero si la dama cae en una casilla bomba sin protección, no es mate. Aquí, con la dama en g7, el rey negro simplemente la captura. Antes de colocarla, comprueba siempre que algo la protege.',
        },
      ],
      practice: [
        {
          fen: 'k7/8/2K5/8/8/8/8/1Q6 w - - 0 1',
          prompt: 'Da jaque mate con la dama, colocándola en una casilla bomba protegida por tu rey.',
          solutionUci: ['b1b7'],
          hint: 'Tu rey protege una casilla pegada al rey rival. Lleva la dama allí.',
          explanationCorrect: 'Jaque mate. La dama está en una casilla bomba y tu rey la protege: no se puede capturar.',
          explanationWrong: 'Busca la casilla pegada al rey rival que tu rey también vigila. Allí la dama da mate.',
          wrongByMove: {
            b1b8: 'La capturan. La dama queda pegada al rey rival, pero nada la protege, y el rey la captura.',
          },
        },
        {
          fen: '8/8/8/8/8/5K2/Q7/7k w - - 0 1',
          prompt: 'Da jaque mate con la dama, colocándola en una casilla bomba protegida.',
          solutionUci: ['a2g2'],
          hint: 'El rey rival está en la esquina. Tu rey protege una de las casillas pegadas a él.',
          explanationCorrect: 'Jaque mate. La dama está en una casilla bomba y tu rey la protege.',
          explanationWrong: 'Busca la casilla pegada al rey rival que tu rey también vigila. Allí la dama da mate.',
          wrongByMove: {
            a2h2: 'La capturan. La dama queda pegada al rey rival, pero nada la protege, y el rey la captura.',
          },
        },
        {
          fen: '7k/8/7B/8/8/8/8/K5Q1 w - - 0 1',
          prompt: 'Da jaque mate con la dama. Esta vez no la protege tu rey, sino otra pieza.',
          solutionUci: ['g1g7'],
          hint: 'Tu alfil protege una casilla pegada al rey rival. Lleva la dama allí.',
          explanationCorrect: 'Jaque mate. La dama está protegida por el alfil, así que el rey no puede capturarla.',
          explanationWrong: 'Busca la casilla pegada al rey rival que tu alfil también vigila. Allí la dama da mate.',
          wrongByMove: {
            g1g8: 'La capturan. La dama queda pegada al rey rival, pero nada la protege, y el rey la captura.',
          },
        },
      ],
      evaluation: [
        {
          fen: '8/8/8/8/8/2K5/7Q/k7 w - - 0 1',
          prompt: 'Da jaque mate con la dama, colocándola en una casilla bomba protegida por tu rey.',
          solutionUci: ['h2b2'],
          hint: 'El rey rival está en la esquina de abajo a la izquierda. Tu rey protege una casilla pegada a él.',
          explanationCorrect: 'Jaque mate. La dama está en una casilla bomba, protegida por tu rey.',
          explanationWrong: 'Busca la casilla pegada al rey rival que tu rey también vigila. Allí la dama da mate.',
          wrongByMove: {
            h2a2: 'La capturan. La dama queda pegada al rey rival, pero nada la protege, y el rey la captura.',
          },
        },
        {
          fen: 'K7/8/8/8/8/8/Q7/5B1k w - - 0 1',
          prompt: 'Da jaque mate con la dama. La protege otra pieza, no tu rey.',
          solutionUci: ['a2g2'],
          hint: 'Tu alfil protege una casilla pegada al rey rival. Lleva la dama allí.',
          explanationCorrect: 'Jaque mate. El alfil protege la dama, y el rey rival no puede capturarla ni escapar.',
          explanationWrong: 'Busca la casilla pegada al rey rival que tu alfil también vigila. Allí la dama da mate.',
          wrongByMove: {
            a2h2: 'La capturan. La dama queda pegada al rey rival, pero nada la protege, y el rey la captura.',
          },
        },
        {
          fen: 'K7/8/2k5/8/8/8/8/1q6 b - - 0 1',
          prompt: 'Juegas con negras. Da jaque mate con la dama, en una casilla bomba protegida por tu rey.',
          solutionUci: ['b1b7'],
          hint: 'Tu rey protege una casilla pegada al rey blanco. Lleva la dama allí.',
          explanationCorrect: 'Jaque mate. Con negras es igual: casilla bomba protegida por tu rey.',
          explanationWrong: 'Busca la casilla pegada al rey blanco que tu rey también vigila. Allí la dama da mate.',
          wrongByMove: {
            b1b8: 'La capturan. La dama queda pegada al rey blanco, pero nada la protege, y el rey la captura.',
          },
        },
      ],
    },
    {
      id: 'u29.l02',
      unitId: 'u29',
      title: 'El rey ahogado',
      objective: 'Reconocer el ahogado, que es tablas, y evitarlo cuando vas ganando con la dama.',
      intro:
        'Un rey está ahogado si no está en jaque, pero no puede mover y su bando tampoco. Es tablas, aunque tengas una dama de ventaja. Aprende a evitarlo.',
      explanation: [
        {
          fen: 'k7/2Q5/1K6/8/8/8/8/8 b - - 0 1',
          squares: ['a8'],
          arrows: [
            ['c7', 'a7'],
            ['c7', 'b8'],
            ['b6', 'b7'],
          ],
          text: 'El rey negro no está en jaque. Pero no puede ir a a7, b7 ni b8, y no tiene más piezas. No puede mover: está ahogado. La partida es tablas, aunque las blancas tengan una dama de más.',
        },
        {
          fen: 'k7/1Q6/1K6/8/8/8/8/8 b - - 0 1',
          squares: ['a8'],
          arrows: [['b7', 'a8']],
          text: 'Con la dama en b7, protegida por tu rey, sí es mate: el rey negro está en jaque y no puede escapar. Una sola casilla de diferencia: mate o tablas. Antes de mover, comprueba siempre que haya jaque.',
        },
      ],
      practice: [
        {
          fen: 'k7/8/1K6/8/8/8/8/2Q5 w - - 0 1',
          prompt: 'Da jaque mate con la dama, pero ¡cuidado! Hay jugadas que ahogan al rey.',
          solutionUci: ['c1c8'],
          hint: 'La dama tiene que dar jaque. Si le quitas todas las casillas sin dar jaque, es ahogado.',
          explanationCorrect: 'Jaque mate. Daba jaque y le quitaba las casillas que quedaban. Otras jugadas parecidas ahogaban al rey.',
          explanationWrong: 'No basta con quitarle casillas al rey: la dama debe dar jaque. Sin jaque y sin casillas, es ahogado.',
          wrongByMove: {
            c1c7: 'Ahogado. El rey negro no está en jaque y no puede mover: tablas, con una dama de ventaja.',
            c1f4: 'Ahogado. El rey negro no está en jaque y no puede mover: tablas, con una dama de ventaja.',
          },
        },
        {
          fen: '1Q6/8/8/8/8/2K5/8/k7 w - - 0 1',
          prompt: 'Da jaque mate con la dama, sin ahogar al rey.',
          solutionUci: ['b8b2'],
          hint: 'El rey rival está en la esquina. La dama debe dar jaque, protegida por tu rey.',
          explanationCorrect: 'Jaque mate. La dama da jaque desde una casilla que tu rey protege.',
          explanationWrong: 'La dama tiene que dar jaque. Si el rey no tiene casillas y no hay jaque, es ahogado.',
          wrongByMove: {
            b8b3: 'Ahogado. El rey negro no está en jaque y no puede mover: tablas, con una dama de ventaja.',
          },
        },
        {
          fen: '7k/Q7/5K2/8/8/8/8/8 w - - 0 1',
          prompt: 'Ejercicio al revés: encuentra la única jugada que deja al rey negro ahogado.',
          solutionUci: ['a7f7'],
          hint: 'La dama no debe dar jaque, y el rey negro no debe tener ninguna casilla libre.',
          explanationCorrect: 'Ahogado. El rey negro no está en jaque y no tiene casillas libres: tablas. Así se ve cómo es un ahogado.',
          explanationWrong: 'Para ahogar, la dama no da jaque, pero deja al rey negro sin ninguna casilla libre.',
        },
      ],
      evaluation: [
        {
          fen: '8/8/8/8/8/Q7/5K2/7k w - - 0 1',
          prompt: 'Da jaque mate con la dama, sin ahogar al rey.',
          solutionUci: ['a3h3'],
          hint: 'La dama tiene que dar jaque. Si le quitas todas las casillas sin dar jaque, es ahogado.',
          explanationCorrect: 'Jaque mate. Daba jaque desde una casilla protegida por tu rey.',
          explanationWrong: 'No basta con quitarle casillas al rey: la dama debe dar jaque. Sin jaque y sin casillas, es ahogado.',
          wrongByMove: {
            a3g3: 'Ahogado. El rey negro no está en jaque y no puede mover: tablas, con una dama de ventaja.',
            a3d6: 'Ahogado. El rey negro no está en jaque y no puede mover: tablas, con una dama de ventaja.',
          },
        },
        {
          fen: 'K7/8/1k6/8/8/8/8/2q5 b - - 0 1',
          prompt: 'Juegas con negras. Da jaque mate con la dama, sin ahogar al rey.',
          solutionUci: ['c1c8'],
          hint: 'La dama tiene que dar jaque. Si le quitas todas las casillas sin dar jaque, es ahogado.',
          explanationCorrect: 'Jaque mate. Con negras es igual: la dama da jaque y le quita las casillas que quedaban.',
          explanationWrong: 'No basta con quitarle casillas al rey: la dama debe dar jaque. Sin jaque y sin casillas, es ahogado.',
          wrongByMove: {
            c1c7: 'Ahogado. El rey blanco no está en jaque y no puede mover: tablas, con una dama de ventaja.',
            c1f4: 'Ahogado. El rey blanco no está en jaque y no puede mover: tablas, con una dama de ventaja.',
          },
        },
        {
          fen: 'k7/7Q/2K5/8/8/8/8/8 w - - 0 1',
          prompt: 'Ejercicio al revés: encuentra la única jugada que deja al rey negro ahogado.',
          solutionUci: ['h7c7'],
          hint: 'La dama no debe dar jaque, y el rey negro no debe tener ninguna casilla libre.',
          explanationCorrect: 'Ahogado. El rey negro no está en jaque y no tiene casillas libres: tablas.',
          explanationWrong: 'Para ahogar, la dama no da jaque, pero deja al rey negro sin ninguna casilla libre.',
        },
      ],
    },
    {
      id: 'u29.l03',
      unitId: 'u29',
      title: 'El mate de dama',
      objective: 'Dar mate con rey y dama contra rey, acercando el rey, quitando casillas con la dama y evitando el ahogado.',
      intro:
        'Con rey y dama se gana siempre. La dama quita casillas, tu rey se acerca y al final la dama da mate protegida por el rey. El peligro está en ahogar al rival por prisa.',
      explanation: [
        {
          fen: '4k3/8/6K1/8/8/8/8/3Q4 w - - 0 1',
          squares: ['f6'],
          arrows: [['g6', 'f6']],
          text: 'La dama ya vigila la columna d. Tu rey se acerca a f6 y el rey negro solo puede ir a f8. Entonces la dama da jaque mate. Primero se acerca el rey y luego mata la dama.',
        },
        {
          fen: '7k/8/5K2/5Q2/8/8/8/8 w - - 0 1',
          squares: ['g6', 'f7'],
          arrows: [
            ['f5', 'g6'],
            ['f6', 'f7'],
          ],
          text: 'Cuidado: aquí hay dos jugadas que dejan al rey negro sin casillas y sin jaque. La dama a g6 y el rey a f7 ahogan al rey. Son tablas. Antes de mover, comprueba que hay jaque o que queda una casilla libre.',
        },
      ],
      practice: [
        {
          fen: '4k3/8/6K1/8/8/8/8/3Q4 w - - 0 1',
          prompt: 'Mate en 2. Primero acerca tu rey; la dama dará el mate al final.',
          solutionUci: ['g6f6', 'e8f8', 'd1d8'],
          hint: 'Acerca tu rey al rey rival, sin ponerte a su lado. La dama sigue vigilando.',
          explanationCorrect: 'Jaque mate. El rey se acercó, el rey negro solo tenía una salida, y la dama le dio mate protegida por tu rey.',
          explanationWrong: 'Para dar mate, la dama necesita la ayuda del rey. Acércalo al rey rival, sin ponerte a su lado.',
        },
        {
          fen: '2k5/8/5K2/8/8/8/8/6Q1 w - - 0 1',
          prompt: 'Mate en 3. Empieza quitando casillas al rey rival con la dama.',
          solutionUci: ['g1a7', 'c8d8', 'a7b7', 'd8e8', 'b7e7'],
          alt: ['b7c8'],
          hint: 'Empieza con una jugada de dama que le quite casillas al rey rival.',
          explanationCorrect: 'Jaque mate. La dama le fue quitando casillas, tu rey la protegía de lejos, y el mate llegó en la casilla de al lado.',
          explanationWrong: 'La dama debe quitar casillas al rey rival sin ahogarlo. Piensa qué jugada le deja menos espacio.',
        },
        {
          fen: '6k1/8/4K3/8/8/8/8/7Q w - - 0 1',
          prompt: 'Mate en 2. ¡Cuidado con el ahogado!',
          solutionUci: ['e6f6', 'g8f8', 'h1a8'],
          alt: ['h1h8'],
          hint: 'Acerca el rey. Una jugada de dama tentadora deja al rey rival sin movimientos.',
          explanationCorrect: 'Jaque mate. Primero se acercó el rey, y la dama dio jaque desde la fila de abajo del rey rival.',
          explanationWrong: 'Cuidado: una jugada de dama deja al rey rival sin movimientos y sin jaque. Acerca primero tu rey.',
          wrongByMove: {
            h1h6: 'Ahogado. El rey negro no está en jaque y no puede mover: tablas, con una dama de ventaja.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4K3/8/8/3k4/8/8/7q/8 b - - 0 1',
          prompt: 'Juegas con negras. Mate en 2. Primero acerca tu rey; la dama dará el mate.',
          solutionUci: ['d5e6', 'e8d8', 'h2b8'],
          hint: 'Acerca tu rey al rey rival, sin ponerte a su lado. La dama sigue vigilando.',
          explanationCorrect: 'Jaque mate. Con negras es igual: el rey se acerca y la dama da el mate al final.',
          explanationWrong: 'Para dar mate, la dama necesita la ayuda del rey. Acércalo al rey rival, sin ponerte a su lado.',
        },
        {
          fen: '3k4/8/2Q5/5K2/8/8/8/8 w - - 0 1',
          prompt: 'Mate en 3. Empieza quitando casillas al rey rival con la dama.',
          solutionUci: ['c6b7', 'd8e8', 'f5e6', 'e8d8', 'b7d7'],
          alt: ['b7b8'],
          hint: 'Empieza con una jugada de dama que le quite casillas al rey rival.',
          explanationCorrect: 'Jaque mate. La dama encerró al rey rival, tu rey se acercó para protegerla y llegó el mate.',
          explanationWrong: 'La dama debe quitar casillas al rey rival sin ahogarlo. Piensa qué jugada le deja menos espacio.',
        },
        {
          fen: '1q6/8/8/8/8/8/6k1/4K3 b - - 0 1',
          prompt: 'Juegas con negras. Mate en 3. Empieza quitando casillas al rey rival con la dama.',
          solutionUci: ['b8b2', 'e1d1', 'g2f3', 'd1e1', 'b2c1'],
          alt: ['b2e2'],
          hint: 'Empieza con una jugada de dama que le quite casillas al rey rival.',
          explanationCorrect: 'Jaque mate. La dama le quitó casillas, tu rey se acercó y el mate llegó protegido por tu rey.',
          explanationWrong: 'La dama debe quitar casillas al rey rival sin ahogarlo. Piensa qué jugada le deja menos espacio.',
        },
      ],
    },
  ],
};
