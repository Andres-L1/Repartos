import type { Unit } from '../schema.js';
import { fen } from './ruso-a-fen.js';

export const unit: Unit = {
  id: 'u22',
  order: 3,
  title: 'La torre',
  description:
    'Mueve la torre por columnas y filas, captura con ella, rodea los obstáculos y aprende cuándo una torre está protegida y cuándo está colgada.',
  level: 'beginner',
  requires: ['u21'],
  lessons: [
    {
      id: 'u22.l01',
      unitId: 'u22',
      title: 'Cómo se mueve la torre',
      objective: 'Mover la torre en línea recta, sin saltar, y rodear un obstáculo con dos jugadas.',
      intro:
        'La torre va en línea recta, por columnas y por filas, tan lejos como quiera. Pero no salta por encima de nada. Hoy la mueves en distintas posiciones.',
      explanation: [
        {
          fen: fen('Kh1 Rd4 ka8'),
          arrows: [
            ['d4', 'a4'],
            ['d4', 'h4'],
            ['d4', 'd1'],
            ['d4', 'd8'],
          ],
          text: 'La torre se mueve en línea recta: por su columna o por su fila, en las dos direcciones. Puede recorrer todas las casillas que quiera si el camino está libre. Desde d4 llega a 14 casillas.',
        },
        {
          fen: fen('Kd6 Rd4 kh8'),
          squares: ['d6'],
          arrows: [
            ['d4', 'd5'],
            ['d4', 'd1'],
            ['d4', 'a4'],
            ['d4', 'h4'],
          ],
          text: 'La torre no salta por encima de otras piezas. Tu rey en d6 le cierra el camino hacia arriba: solo llega hasta d5. Hacia abajo y hacia los lados sigue libre.',
        },
      ],
      practice: [
        {
          fen: fen('Kb1 Ra5 kg8'),
          prompt: 'Juegan blancas. Mueve la torre hasta el borde derecho del tablero, sin salirte de su fila.',
          solutionUci: ['a5h5'],
          hint: 'Sigue por la fila de la torre hasta que no queden más casillas.',
          explanationCorrect: 'Muy bien. La torre recorrió toda la fila 5 de una sola jugada, porque no había nada en medio.',
          explanationWrong: 'La torre tiene que quedarse en su fila y llegar al último borde de la derecha. Se mueve en línea recta.',
          wrongByMove: {
            a5a8: 'Has subido por la columna a. Pedíamos ir por la fila, hacia la derecha.',
          },
        },
        {
          fen: fen('Kd4 Ra4 kh8'),
          prompt: 'Tu rey tapa la fila 4 y la torre no puede saltarlo. Lleva la torre a h5 en dos jugadas.',
          solutionUci: ['a4a5', 'h8g8', 'a5h5'],
          hint: 'Primero cambia de fila para rodear al rey. Después ve a la casilla de llegada.',
          explanationCorrect: 'Eso es. Para rodear un obstáculo se hace un rodeo: primero cambias de fila y después recorres la fila libre.',
          explanationWrong: 'Esa jugada no deja a la torre lista para llegar a h5 en la siguiente. Busca una fila donde el camino hasta h5 esté libre.',
          wrongByMove: {
            a4c4: 'La torre llega hasta c4, pero el rey le cierra el paso hacia h5.',
          },
        },
        {
          fen: fen('Kf2 Rh1 kd6'),
          prompt: 'Lleva la torre de h1 a a8 en dos jugadas.',
          solutionUci: ['h1h8', 'd6c6', 'h8a8'],
          branches: [{ at: 0, line: ['h1a1', 'd6c6', 'a1a8'] }],
          hint: 'La torre tiene que pasar por una esquina. Hay dos esquinas posibles.',
          explanationCorrect: 'Muy bien. De una esquina a la esquina contraria se llega en dos jugadas, pasando por otra esquina.',
          explanationWrong: 'Esa jugada no deja a la torre en línea con la casilla de llegada. Busca una esquina desde la que se vea a8.',
        },
      ],
      evaluation: [
        {
          fen: fen('Kb2 Re6 kh8'),
          prompt: 'Juegan blancas. Mueve la torre hasta el borde inferior del tablero, sin salirte de su columna.',
          solutionUci: ['e6e1'],
          explanationCorrect: 'Correcto. La torre bajó por toda la columna e, de la fila 6 a la fila 1.',
          explanationWrong: 'La torre debe quedarse en su columna y bajar hasta la última fila. Se mueve en línea recta.',
        },
        {
          fen: fen('Ke4 Rh4 kg8'),
          prompt: 'Tu rey tapa la fila 4. Lleva la torre de h4 a a3 en dos jugadas.',
          solutionUci: ['h4h3', 'g8f8', 'h3a3'],
          explanationCorrect: 'Muy bien. Primero cambiaste de fila para esquivar al rey y después recorriste la fila 3.',
          explanationWrong: 'Esa jugada no deja a la torre lista para llegar a a3 en la siguiente. Busca una fila libre que lleve a a3.',
        },
        {
          fen: fen('Kc1 rg3 ke8', 'b'),
          prompt: 'Juegan negras. Mueve la torre negra hasta el borde izquierdo del tablero, sin salirte de su fila.',
          solutionUci: ['g3a3'],
          explanationCorrect: 'Correcto. La torre negra recorrió toda la fila 3 hacia la izquierda.',
          explanationWrong: 'La torre debe quedarse en su fila y llegar al último borde de la izquierda. Se mueve en línea recta.',
        },
      ],
    },
    {
      id: 'u22.l02',
      unitId: 'u22',
      title: 'Cómo captura la torre',
      objective: 'Capturar con la torre la primera pieza rival que encuentra en su camino.',
      intro:
        'La torre captura igual que se mueve: en línea recta. Hay que fijarse en una cosa: solo captura la primera pieza que encuentra.',
      explanation: [
        {
          fen: fen('Kh1 Rd4 rd7 kg8'),
          squares: ['d7'],
          arrows: [['d4', 'd7']],
          text: 'La torre captura moviéndose hasta la casilla de una pieza rival. La pieza capturada sale del tablero y tu torre ocupa su lugar. Aquí la torre blanca puede capturar la torre negra de d7.',
        },
        {
          fen: fen('Kh1 Rd1 rd5 rd8 kg7'),
          squares: ['d8'],
          arrows: [['d1', 'd5']],
          text: 'La torre no salta ni para capturar. Solo puede capturar la primera pieza que encuentra. La torre de d8 está detrás de la de d5, así que ahora no se puede capturar.',
        },
      ],
      practice: [
        {
          fen: fen('Kb1 Rh4 ra4 kg8'),
          prompt: 'Juegan blancas. Captura la torre negra.',
          solutionUci: ['h4a4'],
          hint: 'La torre negra está en tu misma fila y el camino está libre.',
          explanationCorrect: 'Muy bien. Recorriste la fila 4 y capturaste. La torre se queda en la casilla de la pieza capturada.',
          explanationWrong: 'La torre captura en línea recta. Busca la torre negra en tu misma fila o columna.',
        },
        {
          fen: fen('Kb2 Re1 re4 re8 kg6'),
          prompt: 'Captura la torre negra que tu torre puede alcanzar.',
          solutionUci: ['e1e4'],
          hint: 'Hay dos torres negras en tu columna. Solo puedes llegar a una.',
          explanationCorrect: 'Eso es. La torre solo captura la primera pieza que encuentra. La de atrás quedaba tapada por la otra.',
          explanationWrong: 'La torre no salta. De las dos torres negras de tu columna, solo puedes capturar la que está más cerca.',
        },
        {
          fen: fen('Kb1 Rh3 rh8 kd6', 'b'),
          prompt: 'Juegan negras. Captura la torre blanca con tu torre.',
          solutionUci: ['h8h3'],
          hint: 'La torre blanca está en tu misma columna, más abajo.',
          explanationCorrect: 'Muy bien. La torre negra bajó por la columna h y capturó. Las negras capturan igual que las blancas.',
          explanationWrong: 'La torre captura en línea recta. Busca la torre blanca en tu misma columna o fila.',
        },
      ],
      evaluation: [
        {
          fen: fen('Kf1 Rc1 rc6 kg8'),
          prompt: 'Juegan blancas. Captura la torre negra.',
          solutionUci: ['c1c6'],
          explanationCorrect: 'Correcto. La torre subió por la columna c y capturó. No había nada en medio.',
          explanationWrong: 'La torre captura en línea recta. Busca la torre negra en tu misma columna o fila.',
        },
        {
          fen: fen('Kb1 Ra5 rd5 rg5 kh8'),
          prompt: 'Captura la torre negra que tu torre puede alcanzar.',
          solutionUci: ['a5d5'],
          explanationCorrect: 'Muy bien. La torre captura la primera pieza que encuentra, y la torre de g5 queda detrás.',
          explanationWrong: 'La torre no salta. De las dos torres negras de tu fila, solo puedes capturar la que está más cerca.',
        },
        {
          fen: fen('Kh1 Re2 re7 kc8', 'b'),
          prompt: 'Juegan negras. Captura la torre blanca con tu torre.',
          solutionUci: ['e7e2'],
          explanationCorrect: 'Correcto. La torre negra bajó por la columna e y capturó la torre blanca.',
          explanationWrong: 'La torre captura en línea recta. Busca la torre blanca en tu misma columna o fila.',
        },
      ],
    },
    {
      id: 'u22.l03',
      conceptIds: ['tactics.hanging_piece'],
      unitId: 'u22',
      title: 'Torre y rey: protegida o colgada',
      objective: 'Distinguir una torre protegida de una torre colgada y actuar en consecuencia.',
      intro:
        'Una torre puede estar a salvo o en peligro. Todo depende de si algo la protege. Hoy aprendes a mirarlo antes de mover.',
      explanation: [
        {
          fen: fen('Ke3 Rd4 rd8 kh8'),
          squares: ['d4'],
          arrows: [
            ['d8', 'd4'],
            ['e3', 'd4'],
          ],
          text: 'Una pieza protegida es una pieza que, si la capturan, puedes recapturar. Tu rey de e3 protege la torre de d4. Si la torre negra la captura, el rey recaptura.',
        },
        {
          fen: fen('Kh1 Rd4 rd8 ka8'),
          squares: ['d4'],
          arrows: [['d8', 'd4']],
          text: 'Una pieza colgada es una pieza atacada que nadie protege. Aquí tu rey está lejos y no cuida la torre de d4. La torre negra la puede capturar gratis.',
        },
      ],
      practice: [
        {
          fen: fen('Kf2 Rd4 rd8 kc8'),
          prompt: 'Juegan blancas. Tu torre está atacada. Protégela moviendo el rey.',
          solutionUci: ['f2e3'],
          hint: 'El rey protege las 8 casillas que lo rodean. Acércalo a la torre.',
          explanationCorrect: 'Muy bien. Con el rey en e3 la torre queda protegida: si la capturan, el rey recaptura.',
          explanationWrong: 'Esa jugada no deja el rey junto a la torre. Para protegerla, el rey tiene que estar a una casilla de ella.',
          wrongByMove: {
            f2f3: 'El rey sigue a dos casillas de la torre. Así no la protege.',
          },
        },
        {
          fen: fen('Kh3 Rd1 rg1 rd5 ke6'),
          prompt: 'Captura la torre negra que no está protegida.',
          solutionUci: ['d1g1'],
          hint: 'Una de las torres negras tiene al rey negro a su lado. La otra está sola.',
          explanationCorrect: 'Eso es. La torre de g1 estaba colgada: nadie la protegía, y la capturaste gratis.',
          explanationWrong: 'Esa torre está protegida o no se puede capturar. Busca la torre negra que no tiene al rey negro a su lado.',
          wrongByMove: {
            d1d5: 'Esa torre está protegida por el rey negro. Te la recapturaría: habrías cambiado una torre por otra.',
          },
        },
        {
          fen: fen('Ke2 Rd4 rh4 kg5'),
          prompt: 'Tu torre está atacada. Llévala a una casilla donde el rey la proteja y la torre negra no pueda capturarla.',
          solutionUci: ['d4d3'],
          alt: ['d4d2', 'd4d1'],
          hint: 'La torre tiene que quedar pegada a tu rey y fuera de la fila de la torre negra.',
          explanationCorrect: 'Muy bien. Junto a tu rey, la torre queda protegida. Cualquiera de las tres casillas valía.',
          explanationWrong: 'Esa casilla no sirve: o no está junto a tu rey, o sigue en la fila de la torre negra.',
          wrongByMove: {
            d4h4: 'Esa torre negra está protegida por el rey negro. Te la recapturaría y habrías cambiado una torre por otra.',
          },
        },
      ],
      evaluation: [
        {
          fen: fen('Ke3 Rc5 rh5 kg6'),
          prompt: 'Juegan blancas. Tu torre está atacada. Protégela moviendo el rey.',
          solutionUci: ['e3d4'],
          explanationCorrect: 'Correcto. Con el rey en d4 la torre de c5 queda protegida.',
          explanationWrong: 'Esa jugada no deja el rey junto a la torre. Para protegerla, el rey tiene que estar a una casilla de ella.',
        },
        {
          fen: fen('Kg1 Rf2 rb2 rf6 ke7'),
          prompt: 'Captura la torre negra que no está protegida.',
          solutionUci: ['f2b2'],
          explanationCorrect: 'Muy bien. La torre de f6 tenía al rey negro al lado. La de b2 estaba sola.',
          explanationWrong: 'Esa torre está protegida o no se puede capturar. Busca la torre negra que no tiene al rey negro a su lado.',
        },
        {
          fen: fen('Kd2 Re4 rh4 kg5'),
          prompt: 'Tu torre está atacada. Llévala a una casilla donde el rey la proteja y la torre negra no pueda capturarla.',
          solutionUci: ['e4e3'],
          alt: ['e4e2', 'e4e1'],
          explanationCorrect: 'Correcto. Junto a tu rey, la torre queda protegida. Cualquiera de las tres casillas valía.',
          explanationWrong: 'Esa casilla no sirve: o no está junto a tu rey, o sigue en la fila de la torre negra.',
        },
      ],
    },
  ],
};
