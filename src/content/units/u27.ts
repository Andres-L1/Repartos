import type { Unit } from '../schema.js';

/**
 * Método ruso, unidad 8: mate con dos alfiles y el rey. Pendiente de validación de profesores.
 * Las jugadas de técnica y las líneas hasta el mate están verificadas con la tablebase de Lichess (DTM mínimo).
 */
export const unit: Unit = {
  id: 'u27',
  order: 8,
  title: 'Mate con dos alfiles y el rey',
  description:
    'Con rey y un alfil no se puede ganar, pero con rey y dos alfiles sí. Aprende el mate final, la barrera de los alfiles, la ayuda del rey y la técnica completa hasta el mate.',
  level: 'beginner',
  requires: ['u26'],
  lessons: [
    {
      id: 'u27.l01',
      unitId: 'u27',
      title: 'Un alfil no basta, dos sí',
      objective: 'Saber que rey y dos alfiles ganan, y dar el mate final en una esquina con los dos alfiles y el rey.',
      intro:
        'Un rey con un solo alfil nunca puede dar mate: son tablas. Con dos alfiles sí se gana siempre. Empezamos por el final: cómo se da el mate.',
      explanation: [
        {
          fen: '4k3/8/8/8/8/8/8/4KB2 w - - 0 1',
          squares: ['f1'],
          text: 'Un rey y un solo alfil contra un rey no pueden dar mate nunca, juegues como juegues. Es un empate: tablas. Hace falta una pieza más.',
        },
        {
          fen: '4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1',
          squares: ['c1', 'f1'],
          text: 'Con un segundo alfil, de casillas de otro color, sí es una victoria forzada. El rey rival no puede evitar el mate. El alfil de c1 y el de f1 pisan casillas de colores distintos.',
        },
      ],
      practice: [
        {
          fen: '7k/8/3BB1K1/8/8/8/8/8 w - - 0 1',
          prompt: 'Da jaque mate con uno de los alfiles.',
          solutionUci: ['d6e5'],
          hint: 'El rey rival está en la esquina. Un alfil ya vigila la casilla de al lado; el otro tiene que dar el jaque.',
          explanationCorrect: 'Jaque mate. Un alfil da jaque, el otro cierra la casilla de al lado y tu rey vigila las otras dos.',
          explanationWrong: 'El rey rival está en la esquina. Busca el alfil que, moviéndose, dé jaque sin dejar ninguna casilla libre.',
        },
        {
          fen: 'k7/8/1K1BB3/8/8/8/8/8 w - - 0 1',
          prompt: 'Da jaque mate con uno de los alfiles.',
          solutionUci: ['e6d5'],
          hint: 'El rey rival está en la esquina de arriba a la izquierda. Un alfil da el jaque por la diagonal larga.',
          explanationCorrect: 'Jaque mate. El alfil da jaque por la diagonal larga y el otro y tu rey vigilan todas las casillas de escape.',
          explanationWrong: 'El rey rival está en una esquina. Solo un alfil puede dar el jaque sin dejar casillas libres.',
        },
        {
          fen: '8/8/8/2B5/2B5/8/2K5/k7 w - - 0 1',
          prompt: 'Da jaque mate con uno de los alfiles.',
          solutionUci: ['c5d4'],
          hint: 'El rey rival está en la esquina de abajo a la izquierda. Da el jaque por la diagonal larga.',
          explanationCorrect: 'Jaque mate. Los alfiles están uno junto al otro y el rey cierra el resto. Es el mismo mate, en otra esquina.',
          explanationWrong: 'El rey rival está en la esquina. Busca el jaque desde la diagonal larga que no le deje ninguna casilla.',
        },
      ],
      evaluation: [
        {
          fen: '8/8/8/8/8/3BB1K1/8/7k w - - 0 1',
          prompt: 'Da jaque mate con uno de los alfiles.',
          solutionUci: ['d3e4'],
          hint: 'El rey rival está en la esquina de abajo a la derecha. Da el jaque por la diagonal larga.',
          explanationCorrect: 'Jaque mate. El mismo mate de siempre, ahora en la esquina de abajo a la derecha.',
          explanationWrong: 'El rey rival está en la esquina. Busca el alfil que da jaque por la diagonal larga.',
        },
        {
          fen: '8/8/8/5B2/5B2/8/5K2/7k w - - 0 1',
          prompt: 'Da jaque mate con uno de los alfiles.',
          solutionUci: ['f5e4'],
          hint: 'Los alfiles están en la misma columna, uno sobre el otro. Uno da el jaque por la diagonal larga.',
          explanationCorrect: 'Jaque mate. Con los alfiles en columna el mate es igual: uno da jaque y el otro y tu rey cierran lo demás.',
          explanationWrong: 'El rey rival está en la esquina. Solo un alfil, moviéndose a la diagonal larga, da mate.',
        },
        {
          fen: '7K/8/3bb1k1/8/8/8/8/8 b - - 0 1',
          prompt: 'Juegas con negras. Da jaque mate con uno de los alfiles.',
          solutionUci: ['d6e5'],
          hint: 'El rey blanco está en la esquina. Un alfil da el jaque por la diagonal larga.',
          explanationCorrect: 'Jaque mate. Con negras es exactamente igual: un alfil da jaque y el otro y el rey cierran el resto.',
          explanationWrong: 'El rey blanco está en la esquina. Busca el alfil que dé jaque por la diagonal larga.',
        },
      ],
    },
    {
      id: 'u27.l02',
      unitId: 'u27',
      title: 'La barrera y el rey',
      objective: 'Formar la barrera con los dos alfiles en diagonales vecinas y acercar el rey para ayudarlos.',
      intro:
        'Para llegar al mate hace falta una barrera: dos alfiles en diagonales vecinas. Después tu rey se acerca y ayuda. Cada paso se practica por separado.',
      explanation: [
        {
          fen: '8/4k3/8/8/5B2/7B/6K1/8 b - - 0 1',
          squares: ['d8', 'e8', 'f6', 'f7', 'f8', 'g6', 'g7', 'g8', 'h4', 'h5', 'h7', 'h8'],
          text: 'Los dos alfiles forman una barrera: el alfil de f4 y el alfil de h3 vigilan dos diagonales seguidas. El rey negro no puede cruzarla y solo se mueve por la zona marcada. El rey de g2 protege el alfil de h3.',
        },
        {
          fen: '8/8/6k1/8/3K1B2/7B/8/8 w - - 0 1',
          squares: ['e5'],
          arrows: [['d4', 'e5']],
          text: 'Los alfiles solos no bastan: el rey también ayuda. Tu rey se acerca al rey rival, siempre sin ponerse a su lado. Aquí lo mejor es llevarlo a e5.',
        },
      ],
      practice: [
        {
          fen: '8/8/B7/8/K5k1/8/8/2B5 w - - 0 1',
          prompt: 'Forma la barrera con los dos alfiles. Mueve un alfil para que queden en diagonales vecinas.',
          solutionUci: ['a6d3'],
          hint: 'Mueve uno de los alfiles a una diagonal pegada a la del otro.',
          explanationCorrect: 'Bien. Los alfiles quedan en diagonales vecinas: forman una barrera que el rey rival no puede cruzar.',
          explanationWrong: 'Busca una jugada tras la cual los dos alfiles estén en diagonales vecinas, una pegada a la otra.',
        },
        {
          fen: '8/3K4/8/2bk4/2b5/8/8/8 b - - 0 1',
          prompt: 'Juegas con negras. Forma la barrera: mueve un alfil para que queden en diagonales vecinas.',
          solutionUci: ['c5d6'],
          hint: 'Mueve uno de los alfiles a una diagonal pegada a la del otro.',
          explanationCorrect: 'Bien. Los dos alfiles quedan en diagonales vecinas y forman la barrera, también con negras.',
          explanationWrong: 'Busca una jugada tras la cual los dos alfiles estén en diagonales vecinas, una pegada a la otra.',
        },
        {
          fen: '8/8/7B/3K1B2/8/6k1/8/8 w - - 0 1',
          prompt: 'Los alfiles ya forman la barrera. Ahora acerca tu rey al rey rival.',
          solutionUci: ['d5e4'],
          hint: 'Mueve el rey en diagonal hacia el rey rival. No te pongas a su lado.',
          explanationCorrect: 'Bien. Tu rey se acerca al rey rival y ayuda a los alfiles a empujarlo.',
          explanationWrong: 'Los alfiles ya hacen su trabajo. Ahora mueve el rey hacia el rey rival, sin acercarte demasiado.',
        },
      ],
      evaluation: [
        {
          fen: '8/8/8/k7/2BK4/4B3/8/8 w - - 0 1',
          prompt: 'Los alfiles ya forman la barrera. Ahora acerca tu rey al rey rival.',
          solutionUci: ['d4c3'],
          hint: 'Mueve el rey hacia el rey rival, sin quedar a su lado.',
          explanationCorrect: 'Bien. Tu rey se acerca al rey rival, apoyando a los alfiles, y sigue sin ponerse a su lado.',
          explanationWrong: 'Los alfiles ya hacen su trabajo. Ahora mueve el rey hacia el rey rival, sin acercarte demasiado.',
        },
        {
          fen: '3k1b2/8/b7/8/8/8/3K4/8 b - - 0 1',
          prompt: 'Juegas con negras. Forma la barrera: mueve un alfil para que queden en diagonales vecinas.',
          solutionUci: ['f8c5'],
          hint: 'Mueve el alfil que está en la fila de arriba. Debe quedar en una diagonal pegada a la del otro.',
          explanationCorrect: 'Bien. Los dos alfiles quedan en diagonales vecinas y forman la barrera.',
          explanationWrong: 'Busca una jugada tras la cual los dos alfiles estén en diagonales vecinas, una pegada a la otra.',
        },
        {
          fen: '8/8/3BB3/1k1K4/8/8/8/8 w - - 0 1',
          prompt: 'Mejora la barrera: mueve un alfil para que queden en diagonales vecinas.',
          solutionUci: ['d6c5'],
          hint: 'Mueve uno de los alfiles sin romper la barrera: deben seguir en diagonales vecinas.',
          explanationCorrect: 'Bien. Los alfiles quedan en diagonales vecinas, y el rey rival no puede cruzarlas.',
          explanationWrong: 'Busca una jugada tras la cual los dos alfiles estén en diagonales vecinas, una pegada a la otra.',
        },
      ],
    },
    {
      id: 'u27.l03',
      conceptIds: ['tactics.mate_threat'],
      unitId: 'u27',
      title: 'La técnica completa',
      objective: 'Dar mate con rey y dos alfiles contra rey, jugando paso a paso las mejores jugadas hasta el final.',
      intro:
        'Ahora lo juntas todo. Barrera, rey que ayuda, rey rival empujado a la esquina y mate. Las jugadas que verás son las más rápidas posibles.',
      explanation: [
        {
          fen: '4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1',
          squares: ['c1', 'f1'],
          text: 'En esta posición hay mate forzado en 15 jugadas. Se logra en tres pasos: formar la barrera con los alfiles, acercar el rey y empujar al rey rival a una esquina.',
        },
        {
          fen: '6k1/3B4/3B2K1/8/8/8/8/8 w - - 0 1',
          squares: ['g8'],
          arrows: [
            ['d7', 'e6'],
            ['d6', 'e5'],
          ],
          text: 'Con el rey rival ya en el borde, un alfil da jaque y lo obliga a ir a la esquina. Entonces el otro alfil da el mate. Aquí son dos jugadas.',
        },
      ],
      practice: [
        {
          fen: '1k6/4BB2/2K5/8/8/8/8/8 w - - 0 1',
          prompt: 'Mate en 4. Juega la técnica: cada jugada acerca el mate.',
          solutionUci: ['c6b6', 'b8c8', 'f7e6', 'c8b8', 'e7d6', 'b8a8', 'e6d5'],
          hint: 'Primero lleva el rey junto a los alfiles. Después usa los alfiles para quitar casillas al rey rival.',
          explanationCorrect: 'Jaque mate. Tu rey ayudó, los alfiles cerraron el paso y el rey rival terminó en la esquina.',
          explanationWrong: 'Cada jugada tiene que quitarle una casilla más al rey rival. Piensa cómo ayuda tu rey a los alfiles.',
        },
        {
          fen: '8/8/8/8/8/4BK2/2B5/5k2 w - - 0 1',
          prompt: 'Mate en 5. Juega la técnica: cada jugada acerca el mate.',
          solutionUci: ['e3d2', 'f1g1', 'f3g3', 'g1f1', 'c2d3', 'f1g1', 'd2e3', 'g1h1', 'd3e4'],
          hint: 'Los alfiles tienen que quedar en diagonales vecinas. Tu rey ayuda desde atrás.',
          explanationCorrect: 'Jaque mate. Los alfiles y el rey empujaron al rey rival fila a fila hasta la esquina.',
          explanationWrong: 'Cada jugada tiene que quitarle una casilla más al rey rival. Piensa en la barrera y en tu rey.',
        },
        {
          fen: '8/8/8/8/5B1k/3B1K2/8/8 w - - 0 1',
          prompt: 'Mate en 6. Juega la técnica: cada jugada acerca el mate.',
          solutionUci: ['d3g6', 'h4h3', 'f4g5', 'h3h2', 'f3f2', 'h2h3', 'g6f5', 'h3h2', 'g5f4', 'h2h1', 'f5e4'],
          hint: 'Usa los alfiles para cerrar las casillas del rey rival, y acerca tu rey cuando haga falta.',
          explanationCorrect: 'Jaque mate. Seis jugadas, y cada una dejó al rey rival con menos casillas.',
          explanationWrong: 'Cada jugada tiene que quitarle una casilla más al rey rival. Mira qué alfil puede ayudar.',
        },
      ],
      evaluation: [
        {
          fen: '8/8/8/8/8/1k6/4bb2/2K5 b - - 0 1',
          prompt: 'Juegas con negras. Mate en 3. Juega la técnica.',
          solutionUci: ['f2e3', 'c1b1', 'e2d3', 'b1a1', 'e3d4'],
          hint: 'Cada alfil se coloca para quitar una casilla al rey rival. El rey rival ya está en el borde.',
          explanationCorrect: 'Jaque mate. Con negras es la misma técnica: barrera, esquina y mate.',
          explanationWrong: 'Cada jugada tiene que quitarle una casilla más al rey rival. Piensa qué alfil puede ayudar.',
        },
        {
          fen: '8/K7/2k5/8/1b6/1b6/8/8 b - - 0 1',
          prompt: 'Juegas con negras. Mate en 4. Juega la técnica.',
          solutionUci: ['c6c7', 'a7a6', 'b3c4', 'a6a7', 'b4c5', 'a7a8', 'c4d5'],
          hint: 'Primero lleva el rey junto a los alfiles. Después usa los alfiles para quitar casillas.',
          explanationCorrect: 'Jaque mate. Tu rey ayudó, los alfiles cerraron el paso y el rey rival acabó en la esquina.',
          explanationWrong: 'Cada jugada tiene que quitarle una casilla más al rey rival. Piensa cómo ayuda tu rey.',
        },
        {
          fen: '8/8/5k1K/5b2/8/6b1/8/8 b - - 0 1',
          prompt: 'Juegas con negras. Mate en 5. Juega la técnica.',
          solutionUci: ['f5g4', 'h6h7', 'f6f7', 'h7h6', 'g3f4', 'h6h7', 'g4f5', 'h7h8', 'f4e5'],
          hint: 'Los alfiles tienen que quedar en diagonales vecinas. Tu rey ayuda desde atrás.',
          explanationCorrect: 'Jaque mate. Barrera, rey que ayuda, esquina y mate, como en la técnica de siempre.',
          explanationWrong: 'Cada jugada tiene que quitarle una casilla más al rey rival. Piensa en la barrera y en tu rey.',
        },
      ],
    },
  ],
};
