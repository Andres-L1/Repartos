import type { Unit } from '../schema.js';
import { fen } from './ruso-a-fen.js';

export const unit: Unit = {
  id: 'u21',
  order: 2,
  title: 'El rey',
  description:
    'Conoce a la pieza más importante. Aprende a mover el rey, a capturar con él y a saber qué casillas le están prohibidas, incluidas las que protege el rey rival.',
  level: 'beginner',
  requires: ['u20'],
  lessons: [
    {
      id: 'u21.l01',
      unitId: 'u21',
      title: 'Cómo se mueve el rey',
      objective: 'Mover el rey una casilla en cualquier dirección, también desde el borde o la esquina.',
      intro:
        'El rey es la pieza más importante: si lo pierdes, pierdes la partida. No es rápido, pero es fácil de entender. Se mueve poco a poco.',
      explanation: [
        {
          fen: fen('Ke4 ka8'),
          arrows: [
            ['e4', 'd3'],
            ['e4', 'd4'],
            ['e4', 'd5'],
            ['e4', 'e3'],
            ['e4', 'e5'],
            ['e4', 'f3'],
            ['e4', 'f4'],
            ['e4', 'f5'],
          ],
          text: 'El rey se mueve una sola casilla, en cualquier dirección: arriba, abajo, a los lados o en diagonal. Desde el centro tiene 8 casillas a su alrededor.',
        },
        {
          fen: fen('Kh1 ka8'),
          arrows: [
            ['h1', 'g1'],
            ['h1', 'g2'],
            ['h1', 'h2'],
          ],
          text: 'En el borde o en una esquina tiene menos casillas. Desde h1 solo puede ir a g1, g2 o h2. Un rey en la esquina tiene menos libertad.',
        },
      ],
      practice: [
        {
          fen: fen('Kd4 kh8'),
          prompt: 'Juegan blancas. Mueve el rey una casilla en diagonal, hacia arriba y a la derecha.',
          solutionUci: ['d4e5'],
          hint: 'En diagonal significa que cambias de columna y de fila a la vez.',
          explanationCorrect: 'Muy bien. El rey subió una fila y se movió una columna a la derecha: eso es una diagonal.',
          explanationWrong: 'Esa jugada no es en diagonal hacia arriba y a la derecha. Tienes que subir una fila y, a la vez, ir una columna a la derecha.',
          wrongByMove: {
            d4d5: 'El rey subió, pero sin cambiar de columna. Eso no es en diagonal.',
          },
        },
        {
          fen: fen('Ka1 kh8'),
          prompt: 'Lleva el rey de a1 a c3 en dos jugadas.',
          solutionUci: ['a1b2', 'h8h7', 'b2c3'],
          hint: 'El rey avanza una casilla cada vez. Busca una casilla que esté al lado de a1 y también al lado de c3.',
          explanationCorrect: 'Eso es. El rey recorre dos casillas en dos jugadas, siempre una cada vez, en diagonal.',
          explanationWrong: 'Esa jugada no te acerca a c3 en la siguiente. Busca la casilla que toca a la vez a1 y a c3.',
          wrongByMove: {
            a1a2: 'Desde a2 no puedes llegar a c3 en una jugada: está a dos columnas de distancia.',
          },
        },
        {
          fen: fen('Kh1 kd8'),
          prompt: 'El rey está en la esquina h1. Muévelo en diagonal.',
          solutionUci: ['h1g2'],
          hint: 'Desde una esquina solo hay una diagonal hacia dentro del tablero.',
          explanationCorrect: 'Muy bien. Desde la esquina h1 solo hay una casilla en diagonal.',
          explanationWrong: 'Esa jugada no es en diagonal. Desde una esquina solo hay una casilla diagonal: la que sube y va hacia la izquierda.',
          wrongByMove: {
            h1h2: 'Esa jugada sube en línea recta. Una diagonal cambia de columna y de fila a la vez.',
          },
        },
      ],
      evaluation: [
        {
          fen: fen('Kh1 ke5', 'b'),
          prompt: 'Juegan negras. Mueve el rey negro una casilla hacia abajo y a la izquierda.',
          solutionUci: ['e5d4'],
          explanationCorrect: 'Correcto. Las negras avanzan hacia abajo, pero el rey se mueve igual: una casilla.',
          explanationWrong: 'Esa jugada no baja y va a la izquierda a la vez. Cambia de fila hacia abajo y de columna hacia la izquierda.',
        },
        {
          fen: fen('Kh1 kb8'),
          prompt: 'Lleva el rey de h1 a f3 en dos jugadas.',
          solutionUci: ['h1g2', 'b8a8', 'g2f3'],
          explanationCorrect: 'Muy bien. Dos pasos en diagonal llevan el rey de h1 a f3.',
          explanationWrong: 'Esa jugada no te acerca a f3 en la siguiente. Busca la casilla que toca a la vez h1 y f3.',
        },
        {
          fen: fen('Kc6 ka8'),
          prompt: 'Mueve el rey una casilla hacia atrás, hacia la fila 1.',
          solutionUci: ['c6c5'],
          explanationCorrect: 'Correcto. El rey puede ir hacia atrás igual que hacia delante.',
          explanationWrong: 'Esa jugada no baja una casilla en línea recta. Hacia atrás es hacia la fila 1, sin cambiar de columna.',
        },
      ],
    },
    {
      id: 'u21.l02',
      unitId: 'u21',
      title: 'Capturas y casillas prohibidas',
      objective: 'Capturar con el rey y no pisar casillas atacadas por una pieza rival.',
      intro:
        'El rey también captura, pero con cuidado. Hay casillas donde no puede ir. Hoy aprendes a verlas.',
      explanation: [
        {
          fen: fen('Ke4 kh8 rd5'),
          squares: ['d5'],
          arrows: [['e4', 'd5']],
          text: 'El rey captura como cualquier pieza: va a la casilla de la pieza rival y la sustituye. Aquí el rey blanco puede capturar la torre negra de d5, porque nada la protege.',
        },
        {
          fen: fen('Ke1 kh8 rd8'),
          squares: ['d1', 'd2'],
          arrows: [['d8', 'd1']],
          text: 'El rey nunca puede ir a una casilla atacada por una pieza rival. La torre negra ataca toda la columna d. Por eso el rey no puede ir a d1 ni a d2. Sí puede ir a e2, f1 y f2.',
        },
      ],
      practice: [
        {
          fen: fen('Kc3 kh8 rd4'),
          prompt: 'Juegan blancas. Captura la torre negra con el rey.',
          solutionUci: ['c3d4'],
          hint: 'La torre está pegada a tu rey, en diagonal.',
          explanationCorrect: 'Muy bien. El rey capturó la torre porque nada la protegía.',
          explanationWrong: 'El rey captura yendo a la casilla de la torre. La torre está a una sola casilla de distancia.',
        },
        {
          fen: fen('Kd4 kh8 rc5 rc8 re3'),
          prompt: 'Una torre negra está protegida por la otra y la otra no. Captura con el rey la que no está protegida.',
          solutionUci: ['d4e3'],
          hint: 'Una torre protege a otra si la ve en línea recta. Fíjate en cuál de las dos no tiene ninguna ayuda.',
          explanationCorrect: 'Eso es. El rey no puede capturar una pieza protegida, porque quedaría en una casilla atacada. La otra torre sí estaba sola.',
          explanationWrong: 'El rey solo puede capturar una pieza que nadie protege. Busca la torre que no esté a la vista de otra pieza negra.',
        },
        {
          fen: fen('Ke1 kh8 rd8 rf8'),
          prompt: 'Tu rey solo tiene una casilla segura. Llévalo allí.',
          solutionUci: ['e1e2'],
          hint: 'Las torres negras atacan dos columnas enteras. Busca la columna que queda libre.',
          explanationCorrect: 'Muy bien. Las torres atacan las columnas d y f, así que la única casilla segura estaba delante del rey.',
          explanationWrong: 'Esa casilla está atacada. Las torres negras controlan las columnas d y f: el rey debe quedarse entre ellas.',
        },
      ],
      evaluation: [
        {
          fen: fen('Ka1 Re4 kf5', 'b'),
          prompt: 'Juegan negras. Captura la torre blanca con el rey.',
          solutionUci: ['f5e4'],
          explanationCorrect: 'Correcto. El rey negro captura igual que el blanco. Nada protegía esa torre.',
          explanationWrong: 'El rey captura yendo a la casilla de la torre blanca. Está justo a su lado, en diagonal.',
        },
        {
          fen: fen('Ka1 Re1 Re6 Rg4 kf5', 'b'),
          prompt: 'Juegan negras. Una torre blanca está protegida y la otra no. Captura la que no lo está.',
          solutionUci: ['f5g4'],
          explanationCorrect: 'Muy bien. La torre de e6 está protegida por la de e1. La de g4 no tiene ayuda: esa sí se podía capturar.',
          explanationWrong: 'El rey solo puede capturar una pieza que nadie protege. Busca la torre blanca que no esté a la vista de otra pieza.',
        },
        {
          fen: fen('Ka1 Rf1 Rh1 kg8', 'b'),
          prompt: 'Juegan negras. Tu rey solo tiene una casilla segura. Llévalo allí.',
          solutionUci: ['g8g7'],
          explanationCorrect: 'Correcto. Las torres blancas atacan las columnas f y h, así que solo queda la casilla de delante.',
          explanationWrong: 'Esa casilla está atacada. Las torres blancas controlan las columnas f y h: el rey debe quedarse entre ellas.',
        },
      ],
    },
    {
      id: 'u21.l03',
      unitId: 'u21',
      title: 'El rey frente al rey rival',
      objective: 'Entender que los reyes no pueden quedar pegados y que el rey rival protege las casillas de su alrededor.',
      intro:
        'Los dos reyes no pueden estar juntos. Cada rey protege las casillas que lo rodean. Esto cambia lo que puede hacer el otro.',
      explanation: [
        {
          fen: fen('Ke4 ke6'),
          squares: ['d5', 'e5', 'f5'],
          arrows: [
            ['e6', 'd5'],
            ['e6', 'e5'],
            ['e6', 'f5'],
          ],
          text: 'Un rey ataca las 8 casillas que lo rodean. Por eso los dos reyes nunca pueden quedar pegados. Aquí el rey blanco no puede ir a d5, e5 ni f5: están al lado del rey negro.',
        },
        {
          fen: fen('Ke4 kg6 rf5'),
          squares: ['f5'],
          arrows: [['g6', 'f5']],
          text: 'El rey tampoco puede capturar una pieza que protege el otro rey. La torre negra de f5 está protegida por el rey de g6. Si el rey blanco la capturara, quedaría pegado al rey negro.',
        },
      ],
      practice: [
        {
          fen: fen('Kh5 kf6 ra4'),
          prompt: 'Juegan blancas. Tu rey solo tiene una casilla segura. Llévalo allí.',
          solutionUci: ['h5h6'],
          hint: 'El rey negro ataca las casillas de su alrededor y la torre ataca una fila entera. Mira qué casilla queda libre.',
          explanationCorrect: 'Muy bien. El rey negro ataca g5 y g6, y la torre ataca toda la fila 4. Solo quedaba una casilla.',
          explanationWrong: 'Esa casilla está atacada por el rey negro o por la torre. Busca la única que ninguno controla.',
        },
        {
          fen: fen('Ke1 ke3 rd8'),
          prompt: 'Con el rey negro tan cerca, solo una casilla es segura. Llévalo allí.',
          solutionUci: ['e1f1'],
          hint: 'El rey negro vigila las casillas que lo rodean y la torre vigila una columna entera. Mira la fila 1.',
          explanationCorrect: 'Eso es. El rey negro vigila d2, e2 y f2, y la torre vigila la columna d. Solo quedaba una.',
          explanationWrong: 'Esa casilla está atacada por el rey negro o por la torre. Busca la única que ninguno controla.',
        },
        {
          fen: fen('Ke4 kc6 rd5 rf3'),
          prompt: 'Una torre negra está protegida por el rey rival y la otra no. Captura la que no está protegida.',
          solutionUci: ['e4f3'],
          hint: 'El rey negro protege las casillas que lo rodean. Una de las torres no está a su lado.',
          explanationCorrect: 'Muy bien. El rey negro protege la torre de d5, pero no la de f3. Esa sí se puede capturar.',
          explanationWrong: 'El rey solo captura una pieza que nadie protege. Fíjate en cuál de las dos torres tiene al rey negro a su lado.',
        },
      ],
      evaluation: [
        {
          fen: fen('Kc2 Rh4 ka3', 'b'),
          prompt: 'Juegan negras. Tu rey solo tiene una casilla segura. Llévalo allí.',
          solutionUci: ['a3a2'],
          explanationCorrect: 'Correcto. El rey blanco vigila b2 y b3, y la torre blanca vigila a4 y b4. Solo quedaba una casilla.',
          explanationWrong: 'Esa casilla está atacada por el rey blanco o por la torre. Busca la única que ninguno controla.',
        },
        {
          fen: fen('Kg1 kg3 rh8'),
          prompt: 'Juegan blancas. Solo una casilla es segura. Llévalo allí.',
          solutionUci: ['g1f1'],
          explanationCorrect: 'Muy bien. El rey negro vigila f2, g2 y h2, y la torre vigila la columna h. Solo quedaba una casilla.',
          explanationWrong: 'Esa casilla está atacada por el rey negro o por la torre. Busca la única que ninguno controla.',
        },
        {
          fen: fen('Ke5 kd7 rd6 rf4'),
          prompt: 'Juegan blancas. Captura con el rey la torre que no está protegida.',
          solutionUci: ['e5f4'],
          explanationCorrect: 'Correcto. El rey negro protege la torre de d6, pero no la de f4.',
          explanationWrong: 'El rey solo captura una pieza que nadie protege. Fíjate en cuál de las dos torres tiene al rey negro a su lado.',
        },
      ],
    },
  ],
};
