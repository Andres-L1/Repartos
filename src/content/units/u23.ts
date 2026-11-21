import type { Unit } from '../schema.js';
import { fen } from './ruso-a-fen.js';

export const unit: Unit = {
  id: 'u23',
  order: 4,
  title: 'El jaque',
  description:
    'Aprende qué es un jaque, cómo darlo con una torre y las tres formas de responder cuando atacan a tu rey: mover el rey, bloquear o capturar.',
  level: 'beginner',
  requires: ['u22'],
  lessons: [
    {
      id: 'u23.l01',
      unitId: 'u23',
      title: 'Qué es un jaque',
      objective: 'Reconocer un jaque y darlo con una torre.',
      intro:
        'Cuando una pieza ataca al rey rival, se dice que le da jaque. Es muy importante, porque el rey no puede quedarse en jaque. Aprende primero a darlo.',
      explanation: [
        {
          fen: fen('Kb1 Re1 ke8', 'b'),
          squares: ['e8'],
          arrows: [['e1', 'e8']],
          text: 'El jaque ocurre cuando una pieza ataca al rey rival. Aquí la torre blanca de e1 ataca al rey negro de e8, sin nada en medio. Es jaque. Un rey nunca puede quedarse en jaque: el jugador debe responder.',
        },
        {
          fen: fen('Kb1 Re1 re5 ke8', 'b'),
          squares: ['e8'],
          arrows: [['e1', 'e5']],
          text: 'Si hay una pieza en medio, no hay jaque. La torre de e1 solo llega hasta la torre negra de e5. El rey negro de e8 está a salvo.',
        },
      ],
      practice: [
        {
          fen: fen('Kg1 Rh2 kd8'),
          prompt: 'Juegan blancas. Da jaque al rey negro con la torre.',
          solutionUci: ['h2h8'],
          alt: ['h2d2'],
          hint: 'La torre tiene que quedar en la misma fila o en la misma columna que el rey negro, con el camino libre.',
          explanationCorrect: 'Muy bien. Había dos formas de dar jaque: por la fila 8 o por la columna d. Las dos atacan al rey.',
          explanationWrong: 'Esa jugada no ataca al rey. Para dar jaque la torre debe estar en su fila o en su columna, sin nada en medio.',
        },
        {
          fen: fen('Ke1 Ra1 kh8'),
          prompt: 'Da jaque con la torre. Solo hay una forma.',
          solutionUci: ['a1a8'],
          hint: 'Tu rey tapa el camino por la fila 1. Piensa en la fila del rey negro.',
          explanationCorrect: 'Eso es. Tu propio rey tapaba la fila 1, y solo quedaba la fila 8.',
          explanationWrong: 'Esa jugada no ataca al rey negro. Tu rey tapa un camino: busca el que sí queda libre.',
        },
        {
          fen: fen('Ke2 rb6 ka8', 'b'),
          prompt: 'Juegan negras. Da jaque al rey blanco con la torre.',
          solutionUci: ['b6e6'],
          alt: ['b6b2'],
          hint: 'Busca una casilla que esté en la misma columna o fila que el rey blanco.',
          explanationCorrect: 'Muy bien. Las negras también dan jaque: por la columna e o por la fila 2.',
          explanationWrong: 'Esa jugada no ataca al rey blanco. Para dar jaque la torre debe estar en su fila o en su columna, sin nada en medio.',
        },
      ],
      evaluation: [
        {
          fen: fen('Kb1 Rc3 kg7'),
          prompt: 'Juegan blancas. Da jaque al rey negro con la torre.',
          solutionUci: ['c3c7'],
          alt: ['c3g3'],
          explanationCorrect: 'Correcto. Las dos jugadas dan jaque: por la fila 7 o por la columna g.',
          explanationWrong: 'Esa jugada no ataca al rey. Para dar jaque la torre debe estar en su fila o en su columna, sin nada en medio.',
        },
        {
          fen: fen('Ke1 Rh1 ka5'),
          prompt: 'Da jaque con la torre. Solo hay una forma.',
          solutionUci: ['h1h5'],
          explanationCorrect: 'Muy bien. Tu rey tapa la fila 1, pero la torre puede subir por la columna h y mirar la fila 5.',
          explanationWrong: 'Esa jugada no ataca al rey negro. Tu rey tapa un camino: busca el que sí queda libre.',
        },
        {
          fen: fen('Kb3 rh8 ke8', 'b'),
          prompt: 'Juegan negras. Da jaque con la torre. Solo hay una forma.',
          solutionUci: ['h8h3'],
          explanationCorrect: 'Correcto. Tu rey de e8 tapa la fila 8. La torre baja por la columna h y ataca por la fila 3.',
          explanationWrong: 'Esa jugada no ataca al rey blanco. Tu rey tapa un camino: busca el que sí queda libre.',
        },
      ],
    },
    {
      id: 'u23.l02',
      unitId: 'u23',
      title: 'Responder al jaque moviendo el rey',
      objective: 'Salir de un jaque moviendo el rey a una casilla segura.',
      intro:
        'Si te dan jaque, tienes que responder: no puedes hacer otra jugada. La primera respuesta es la más natural: mover el rey a un lugar seguro.',
      explanation: [
        {
          fen: fen('Ke1 re8 kh8'),
          squares: ['e2'],
          arrows: [
            ['e1', 'd1'],
            ['e1', 'd2'],
            ['e1', 'f1'],
            ['e1', 'f2'],
          ],
          text: 'Una forma de salir del jaque es mover el rey a una casilla segura: una donde nadie lo ataque. La torre negra ataca toda la columna e. El rey puede ir a d1, d2, f1 o f2, pero no a e2.',
        },
        {
          fen: fen('Ke1 rd8 re8 kh8'),
          squares: ['d1', 'd2'],
          arrows: [
            ['e1', 'f1'],
            ['e1', 'f2'],
          ],
          text: 'Una casilla atacada no vale. Con dos torres negras, la columna d y la columna e están atacadas. El rey solo puede ir a f1 o a f2.',
        },
      ],
      practice: [
        {
          fen: fen('Kd4 rd8 kh8'),
          prompt: 'Juegan blancas. Tu rey está en jaque. Muévelo a una casilla segura.',
          solutionUci: ['d4c3'],
          alt: ['d4c4', 'd4c5', 'd4e3', 'd4e4', 'd4e5'],
          hint: 'La torre ataca toda la columna d. Sal de esa columna.',
          explanationCorrect: 'Muy bien. Había seis casillas seguras: todas las que no están en la columna d.',
          explanationWrong: 'Esa jugada no resuelve el jaque, porque el rey sigue atacado. Tienes que salir de la columna de la torre.',
        },
        {
          fen: fen('Kh1 rh8 ra2 kc6'),
          prompt: 'Tu rey está en jaque y solo tiene una casilla segura. Llévalo allí.',
          solutionUci: ['h1g1'],
          hint: 'Una torre ataca la columna h y la otra ataca la fila 2. Busca la casilla que ninguna vigila.',
          explanationCorrect: 'Eso es. Una torre vigila la columna h y la otra, la fila 2. Solo quedaba una casilla.',
          explanationWrong: 'Esa casilla está atacada. Busca la única que no vigila ninguna de las dos torres negras.',
        },
        {
          fen: fen('Ke1 Ra4 re8 kg8'),
          prompt: 'Tu rey está en jaque. Sal del jaque moviendo el rey, no la torre.',
          solutionUci: ['e1d1'],
          alt: ['e1d2', 'e1f1', 'e1f2'],
          hint: 'La torre negra ataca la columna e. Mueve el rey a una columna de al lado.',
          explanationCorrect: 'Muy bien. Hay cuatro casillas seguras, todas fuera de la columna e.',
          explanationWrong: 'Esa jugada no mueve el rey a una casilla segura. Sal de la columna de la torre negra.',
        },
      ],
      evaluation: [
        {
          fen: fen('Kh2 Rd1 kd5', 'b'),
          prompt: 'Juegan negras. Tu rey está en jaque. Muévelo a una casilla segura.',
          solutionUci: ['d5c4'],
          alt: ['d5c5', 'd5c6', 'd5e4', 'd5e5', 'd5e6'],
          explanationCorrect: 'Correcto. Las casillas seguras son las que están fuera de la columna d.',
          explanationWrong: 'Esa jugada no resuelve el jaque, porque el rey sigue atacado. Tienes que salir de la columna de la torre.',
        },
        {
          fen: fen('Ke3 Ra1 Rh7 ka8', 'b'),
          prompt: 'Juegan negras. Tu rey está en jaque y solo tiene una casilla segura. Llévalo allí.',
          solutionUci: ['a8b8'],
          explanationCorrect: 'Muy bien. Una torre vigila la columna a y la otra, la fila 7. Solo quedaba una casilla.',
          explanationWrong: 'Esa casilla está atacada. Busca la única que no vigila ninguna de las dos torres blancas.',
        },
        {
          fen: fen('Kh2 Re1 ke8 ra5', 'b'),
          prompt: 'Juegan negras. Tu rey está en jaque. Sal del jaque moviendo el rey, no la torre.',
          solutionUci: ['e8d8'],
          alt: ['e8d7', 'e8f8', 'e8f7'],
          explanationCorrect: 'Correcto. Hay cuatro casillas seguras, todas fuera de la columna e.',
          explanationWrong: 'Esa jugada no mueve el rey a una casilla segura. Sal de la columna de la torre blanca.',
        },
      ],
    },
    {
      id: 'u23.l03',
      unitId: 'u23',
      title: 'Bloquear y capturar',
      objective: 'Responder a un jaque de torre bloqueando el camino o capturando a la pieza que lo da.',
      intro:
        'Mover el rey no es la única respuesta. Si tienes otra pieza cerca, puedes bloquear el jaque o capturar a quien lo da. Ya conoces las tres.',
      explanation: [
        {
          fen: fen('Kg1 Rc3 rg8 kb8'),
          squares: ['g3'],
          arrows: [['c3', 'g3']],
          text: 'Otra respuesta es bloquear: poner una pieza entre la que da jaque y tu rey. La torre blanca va a g3 y tapa la columna g. Ya no hay jaque.',
        },
        {
          fen: fen('Ke1 Ra8 re8 kh7'),
          squares: ['e8'],
          arrows: [['a8', 'e8']],
          text: 'La tercera respuesta es capturar la pieza que da jaque. La torre blanca captura la torre negra de e8 y el jaque desaparece. Si ninguna de las tres respuestas es posible, pasa algo distinto que verás más adelante.',
        },
      ],
      practice: [
        {
          fen: fen('Ke1 Rb4 re8 kh8'),
          prompt: 'Juegan blancas. Tu rey está en jaque. Bloquéalo con la torre.',
          solutionUci: ['b4e4'],
          hint: 'Pon la torre entre la torre negra y tu rey, en la columna de los dos.',
          explanationCorrect: 'Muy bien. La torre en la columna e tapa el camino: la torre negra ya no ve a tu rey.',
          explanationWrong: 'Esa jugada no bloquea el jaque. La torre debe quedar en la columna del rey, entre él y la torre negra.',
        },
        {
          fen: fen('Kg1 Rb8 rg8 kd5'),
          prompt: 'Tu rey está en jaque. Captura con la torre a la pieza que lo da.',
          solutionUci: ['b8g8'],
          hint: 'La torre negra que da jaque está en tu misma fila.',
          explanationCorrect: 'Eso es. Al capturar la torre que daba jaque, el ataque desaparece.',
          explanationWrong: 'Esa jugada no captura a la pieza que da jaque. La torre negra de tu fila es la que ataca a tu rey.',
        },
        {
          fen: fen('Ke1 Ra8 re8 kh7'),
          prompt: 'Tu rey está en jaque. Sal del jaque sin mover el rey.',
          solutionUci: ['a8e8'],
          hint: 'Mira si tu torre puede quitar del tablero a la pieza que da jaque.',
          explanationCorrect: 'Muy bien. La torre capturó a la que daba jaque y tu rey ya no está atacado.',
          explanationWrong: 'Esa jugada no resuelve el jaque. Sin mover el rey, hay que capturar a la pieza que lo da o ponerse en medio.',
        },
      ],
      evaluation: [
        {
          fen: fen('Ka1 Rg1 kg8 rc5', 'b'),
          prompt: 'Juegan negras. Tu rey está en jaque. Bloquéalo con la torre.',
          solutionUci: ['c5g5'],
          explanationCorrect: 'Correcto. La torre negra se pone en g5 y tapa la columna g.',
          explanationWrong: 'Esa jugada no bloquea el jaque. La torre debe quedar en la columna del rey, entre él y la torre blanca.',
        },
        {
          fen: fen('Kh5 Rd1 kd8 ra1', 'b'),
          prompt: 'Juegan negras. Tu rey está en jaque. Captura con la torre a la pieza que lo da.',
          solutionUci: ['a1d1'],
          explanationCorrect: 'Muy bien. La torre negra captura la torre blanca de d1 y el jaque desaparece.',
          explanationWrong: 'Esa jugada no captura a la pieza que da jaque. La torre blanca de tu columna es la que ataca a tu rey.',
        },
        {
          fen: fen('Kb2 Re1 ke8 rh1', 'b'),
          prompt: 'Juegan negras. Tu rey está en jaque. Sal del jaque sin mover el rey.',
          solutionUci: ['h1e1'],
          explanationCorrect: 'Correcto. La torre negra capturó a la torre que daba jaque y el rey ya no está atacado.',
          explanationWrong: 'Esa jugada no resuelve el jaque. Sin mover el rey, hay que capturar a la pieza que lo da o ponerse en medio.',
        },
      ],
    },
  ],
};
