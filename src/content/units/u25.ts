import type { Unit } from '../schema.js';

/** Método ruso, unidad 6: jaque mate con torres. Pendiente de validación de profesores. */
export const unit: Unit = {
  id: 'u25',
  order: 6,
  title: 'Jaque mate con torres',
  description:
    'Aprende qué es el jaque mate y cómo darlo con una torre y con dos torres. Todo se practica sobre el tablero, con pocas piezas y muchas repeticiones.',
  level: 'beginner',
  requires: ['u24'],
  lessons: [
    {
      id: 'u25.l01',
      unitId: 'u25',
      title: '¿Qué es el jaque mate?',
      objective: 'Reconocer un jaque mate y darlo con una torre cuando el rey rival no tiene salida.',
      intro:
        'Un jaque es un ataque al rey. Si el rey no puede librarse de ese ataque, es jaque mate y la partida termina. Aquí aprenderás a reconocerlo y a darlo tú.',
      explanation: [
        {
          fen: 'k6R/8/1K6/8/8/8/8/8 b - - 0 1',
          squares: ['a8'],
          arrows: [
            ['h8', 'a8'],
            ['b6', 'a7'],
            ['b6', 'b7'],
          ],
          text: 'La torre da jaque al rey negro. El rey no puede ir a a7 ni a b7, porque las vigila el rey blanco. Tampoco a b8, que vigila la torre. No puede capturar la torre y nada puede taparla. Es jaque mate.',
        },
        {
          fen: 'k6R/8/2K5/8/8/8/8/8 b - - 0 1',
          squares: ['a7'],
          arrows: [
            ['h8', 'a8'],
            ['a8', 'a7'],
          ],
          text: 'Aquí también hay jaque, pero no es mate. El rey negro puede escapar a a7, una casilla que nadie vigila. Antes de dar jaque, mira siempre si al rey le queda alguna casilla libre.',
        },
      ],
      practice: [
        {
          fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1',
          prompt: 'Da jaque mate con la torre.',
          solutionUci: ['h1h8'],
          hint: 'Tu rey ya vigila dos casillas del rey negro. Lleva la torre a su fila.',
          explanationCorrect: 'Jaque mate. La torre ataca toda la fila, y las demás casillas del rey las vigila tu rey.',
          explanationWrong: 'Para que sea mate, el rey negro no puede tener ninguna casilla libre. Busca el jaque que le quite la última salida.',
          wrongByMove: {
            h1a1: 'No es mate. Das jaque, pero el rey negro tiene una casilla libre para escapar.',
          },
        },
        {
          fen: '8/R7/8/8/8/6K1/8/7k w - - 0 1',
          prompt: 'Da jaque mate con la torre.',
          solutionUci: ['a7a1'],
          hint: 'Esta vez el rey rival está en el borde de abajo. Lleva la torre a su fila.',
          explanationCorrect: 'Jaque mate. La torre ataca la primera fila y tu rey vigila las dos casillas de al lado.',
          explanationWrong: 'El rey negro está en el borde de abajo. Da el jaque por su fila, no por su columna.',
          wrongByMove: {
            a7h7: 'No es mate. Das jaque por la columna, pero el rey negro puede escapar a una casilla libre.',
          },
        },
        {
          fen: '8/8/8/k1K5/8/8/8/7R w - - 0 1',
          prompt: 'Da jaque mate con la torre.',
          solutionUci: ['h1a1'],
          hint: 'El rey rival está en el borde de la izquierda. Da el jaque por su columna.',
          explanationCorrect: 'Jaque mate. La torre ataca toda la columna y tu rey vigila las tres casillas de al lado.',
          explanationWrong: 'El rey negro está en la columna de la izquierda. Lleva la torre a esa columna.',
          wrongByMove: {
            h1h5: 'No da jaque. Tu propio rey tapa el camino de la torre por esa fila.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4k3/8/4K3/8/8/8/8/R7 w - - 0 1',
          prompt: 'Da jaque mate con la torre.',
          solutionUci: ['a1a8'],
          hint: 'Los dos reyes están frente a frente. La torre da el jaque por la fila del rey rival.',
          explanationCorrect: 'Jaque mate. Tu rey vigila las casillas de delante y la torre las de la fila.',
          explanationWrong: 'El rey negro está arriba del todo. Lleva la torre a esa fila para dar jaque.',
        },
        {
          fen: '8/8/8/5K1k/8/8/8/R7 w - - 0 1',
          prompt: 'Da jaque mate con la torre.',
          solutionUci: ['a1h1'],
          hint: 'El rey rival está en el borde de la derecha. Da el jaque por su columna.',
          explanationCorrect: 'Jaque mate. La torre ataca la columna del rey y tu rey vigila las casillas de al lado.',
          explanationWrong: 'El rey negro está en la columna de la derecha. Lleva la torre a esa columna.',
          wrongByMove: {
            a1a5: 'No da jaque. Tu propio rey tapa el camino de la torre por esa fila.',
          },
        },
        {
          fen: '7r/8/8/8/8/3k4/8/3K4 b - - 0 1',
          prompt: 'Juegas con negras. Da jaque mate con la torre.',
          solutionUci: ['h8h1'],
          hint: 'El rey blanco está en el borde de abajo. Da el jaque por su fila.',
          explanationCorrect: 'Jaque mate. La torre negra ataca la primera fila y tu rey vigila las casillas de delante.',
          explanationWrong: 'El rey blanco está en la primera fila. Lleva la torre a esa fila.',
        },
      ],
    },
    {
      id: 'u25.l02',
      conceptIds: ['tactics.mate_threat'],
      unitId: 'u25',
      title: 'Mate con una torre',
      objective: 'Dar mate con rey y torre contra rey: acercar el rey y dar el jaque final con la torre.',
      intro:
        'Con un rey y una torre se puede ganar siempre. La torre no puede hacerlo sola: necesita ayuda de su rey. Aprende el último golpe y cómo prepararlo.',
      explanation: [
        {
          fen: '3k4/8/3K4/8/8/8/8/7R w - - 0 1',
          squares: ['d8'],
          arrows: [
            ['d6', 'c7'],
            ['d6', 'd7'],
            ['d6', 'e7'],
            ['h1', 'h8'],
          ],
          text: 'Los reyes están frente a frente, con una casilla en medio. Se llama oposición. Tu rey vigila las tres casillas de delante del rey rival, y la torre da el jaque por la fila. Es mate.',
        },
        {
          fen: '3k4/8/8/4K3/2R5/8/8/8 w - - 0 1',
          squares: ['e6'],
          arrows: [
            ['e5', 'e6'],
            ['c4', 'c8'],
          ],
          text: 'La torre ya corta al rey por la columna c, y no puede cruzarla. Ahora tu rey sube a e6 y se pone en oposición. Después la torre da el jaque final, desde lejos.',
        },
      ],
      practice: [
        {
          fen: 'k7/8/8/K7/8/8/8/3R4 w - - 0 1',
          prompt: 'Mate en 2. Primero acerca tu rey; la torre dará el jaque al final.',
          solutionUci: ['a5b6', 'a8b8', 'd1d8'],
          hint: 'Sube tu rey para ponerlo en oposición. La torre ya corta al rey rival.',
          explanationCorrect: 'Jaque mate. Tu rey le quitó las casillas de delante y la torre dio el jaque por la fila.',
          explanationWrong: 'La torre sola no da mate. Acerca primero tu rey, hasta quedar frente al rey rival con una casilla en medio.',
        },
        {
          fen: '8/8/8/2r5/4k3/8/8/3K4 b - - 0 1',
          prompt: 'Juegas con negras. Mate en 2: acerca tu rey y da el jaque con la torre.',
          solutionUci: ['e4e3', 'd1e1', 'c5c1'],
          hint: 'Baja tu rey hasta quedar frente al rey blanco con una casilla en medio.',
          explanationCorrect: 'Jaque mate. Es la misma idea con el tablero al revés: rey en oposición y torre al final.',
          explanationWrong: 'Primero hay que acercar el rey. Ponlo frente al rey blanco, con una casilla en medio, y la torre hará el resto.',
        },
        {
          fen: '8/8/8/8/R7/8/8/4K2k w - - 0 1',
          prompt: 'Mate en 2. El rey rival está en una esquina. Acerca tu rey.',
          solutionUci: ['e1f2', 'h1h2', 'a4h4'],
          hint: 'Acerca tu rey en diagonal. La torre ya corta al rey rival.',
          explanationCorrect: 'Jaque mate. El rey rival solo podía ir en una dirección, y la torre cerró la última casilla.',
          explanationWrong: 'La torre ya tiene al rey rival encerrado en el borde. Acerca tu rey en diagonal para ayudarla.',
        },
      ],
      evaluation: [
        {
          fen: '8/8/8/4K3/7k/3R4/8/8 w - - 0 1',
          prompt: 'Mate en 2. Acerca tu rey; la torre dará el jaque al final.',
          solutionUci: ['e5f5', 'h4h5', 'd3h3'],
          hint: 'La torre ya corta al rey rival. Pon tu rey junto a él, con una columna en medio.',
          explanationCorrect: 'Jaque mate. El borde derecho, el rey en oposición y la torre al final: siempre la misma idea.',
          explanationWrong: 'Primero hay que acercar tu rey, hasta quedar frente al rey rival con una columna en medio.',
        },
        {
          fen: '3r4/8/8/8/k7/8/8/K7 b - - 0 1',
          prompt: 'Juegas con negras. Mate en 2: acerca tu rey y da el jaque con la torre.',
          solutionUci: ['a4b3', 'a1b1', 'd8d1'],
          hint: 'Acerca tu rey en diagonal. La torre ya corta al rey rival.',
          explanationCorrect: 'Jaque mate. Con negras y en otra esquina, pero la idea no cambia.',
          explanationWrong: 'La torre sola no da mate. Acerca tu rey en diagonal para que la ayude.',
        },
        {
          fen: '1k6/8/2K5/8/8/8/8/5R2 w - - 0 1',
          prompt: 'Mate en 2. Hoy tu rey ya está bien: mueve la torre para esperar.',
          solutionUci: ['f1a1', 'b8c8', 'a1a8'],
          hint: 'La torre corta al rey rival por una columna, sin dar jaque todavía.',
          explanationCorrect: 'Jaque mate. A veces la jugada buena es una jugada de espera: la torre le quitó una casilla al rey rival.',
          explanationWrong: 'Tu rey ya está en su sitio. Falta que la torre le quite una casilla al rey rival sin darle jaque todavía.',
        },
      ],
    },
    {
      id: 'u25.l03',
      conceptIds: ['tactics.mate_threat'],
      unitId: 'u25',
      title: 'El mate de las dos torres',
      objective: 'Dar mate con dos torres contra el rey, usando la escalera: una torre da jaque y la otra cierra la fila siguiente.',
      intro:
        'Con dos torres no hace falta ayuda del rey. Se turnan para dar jaque y empujan al rey rival, fila por fila, hasta el borde. Se llama mate de escalera.',
      explanation: [
        {
          fen: '7k/R7/8/8/8/8/8/1R2K3 w - - 0 1',
          squares: ['h8'],
          arrows: [
            ['a7', 'h7'],
            ['b1', 'b8'],
          ],
          text: 'Una torre vigila toda la fila 7. La otra da jaque en la fila 8. El rey negro no puede bajar a la fila 7 ni quedarse en la 8. Es jaque mate. Este es el último escalón.',
        },
        {
          fen: '8/7k/R7/8/8/8/8/1R2K3 w - - 0 1',
          squares: ['h7'],
          arrows: [
            ['b1', 'b7'],
            ['a6', 'a8'],
          ],
          text: 'Una torre ya vigila la fila 6. La otra da jaque en la fila 7: el rey solo puede subir a la fila 8. Entonces la torre que vigilaba la fila 6 sube a la fila 8, y es mate.',
        },
      ],
      practice: [
        {
          fen: '1R2K3/8/8/8/8/8/R7/7k w - - 0 1',
          prompt: 'Da jaque mate con una de las torres.',
          solutionUci: ['b8b1'],
          hint: 'Una torre ya vigila la fila de arriba del rey. La otra da el jaque en su fila.',
          explanationCorrect: 'Jaque mate. Una torre vigila la segunda fila y la otra da jaque en la primera.',
          explanationWrong: 'El rey negro está en la primera fila. Da jaque en esa fila con la torre que está libre.',
        },
        {
          fen: '8/4k3/R7/8/8/8/8/1R2K3 w - - 0 1',
          prompt: 'Mate en 2. Da jaque con una torre; la otra dará el mate.',
          solutionUci: ['b1b7', 'e7d8', 'a6a8'],
          hint: 'Da jaque en la fila del rey. La otra torre ya vigila la fila de debajo.',
          explanationCorrect: 'Jaque mate. El rey solo podía subir una fila, y la otra torre cerró el borde.',
          explanationWrong: 'Una torre ya vigila una fila. Da jaque con la otra en la fila del rey, para empujarlo hacia el borde.',
        },
        {
          fen: '8/8/7k/R7/8/8/8/1R2K3 w - - 0 1',
          prompt: 'Mate en 3. Es una escalera de dos jaques y el mate. Empieza dando jaque con una torre.',
          solutionUci: ['b1b6', 'h6g7', 'a5a7', 'g7f8', 'b6b8'],
          hint: 'Da jaque en la fila del rey. La otra torre ya le impide bajar.',
          explanationCorrect: 'Jaque mate. Las torres subieron fila por fila: jaque, jaque, mate.',
          explanationWrong: 'Una torre ya vigila una fila. Da jaque en la fila del rey con la otra, para empujarlo hacia arriba.',
        },
      ],
      evaluation: [
        {
          fen: '8/8/8/2k5/8/1r6/r7/7K b - - 0 1',
          prompt: 'Juegas con negras. Da jaque mate con una de las torres.',
          solutionUci: ['b3b1'],
          hint: 'Una torre ya vigila la fila de arriba del rey blanco. La otra da jaque en su fila.',
          explanationCorrect: 'Jaque mate. Es el mismo último escalón, pero con negras.',
          explanationWrong: 'El rey blanco está en la primera fila. Da jaque en esa fila con la torre que está libre.',
        },
        {
          fen: '1r2k3/8/8/8/8/r7/7K/8 b - - 0 1',
          prompt: 'Juegas con negras. Mate en 2: da jaque en la fila del rey y la otra torre cerrará el borde.',
          solutionUci: ['b8b2', 'h2g1', 'a3a1'],
          hint: 'Una torre ya vigila una fila. Da jaque con la otra en la fila del rey blanco.',
          explanationCorrect: 'Jaque mate. El rey blanco no tuvo más remedio que ir al borde, y allí la escalera terminó.',
          explanationWrong: 'Empuja al rey hacia el borde: da jaque en su fila con la torre que está libre.',
        },
        {
          fen: '5k2/8/8/K7/8/8/R7/4R3 w - - 0 1',
          prompt: 'Mate en 3. Aquí la escalera es en columnas. Empieza dando jaque.',
          solutionUci: ['a2f2', 'f8g7', 'e1g1', 'g7h6', 'f2h2'],
          hint: 'Da jaque por la columna del rey. La otra torre ya vigila una columna.',
          explanationCorrect: 'Jaque mate. Las torres se turnaron para empujar al rey hasta el borde de la derecha.',
          explanationWrong: 'Una torre ya vigila una columna. Da jaque con la otra para empujar al rey hacia el borde de la derecha.',
        },
      ],
    },
  ],
};
