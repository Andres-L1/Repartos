import type { Unit } from '../schema.js';

/** Método ruso, unidad 7: el alfil. Pendiente de validación de profesores. */
export const unit: Unit = {
  id: 'u26',
  order: 7,
  title: 'El alfil',
  description:
    'Conoce al alfil: cómo se mueve en diagonal, cómo captura, por qué siempre pisa casillas del mismo color y cómo saber si una pieza rival está protegida o colgada.',
  level: 'beginner',
  requires: ['u25'],
  lessons: [
    {
      id: 'u26.l01',
      unitId: 'u26',
      title: 'El alfil se mueve en diagonal',
      objective: 'Mover el alfil por las diagonales, tan lejos como quiera, sin saltar sobre otras piezas.',
      intro:
        'El alfil es la pieza de las diagonales. Cada jugador empieza con dos. Aquí vas a moverlo tú, una y otra vez, hasta que te salga solo. Verás peones y otras piezas en el tablero: por ahora son solo obstáculos u objetivos, cada una tiene su propia lección.',
      explanation: [
        {
          fen: '6k1/8/8/8/3B4/8/8/7K w - - 0 1',
          squares: ['a1', 'b2', 'c3', 'e5', 'f6', 'g7', 'h8', 'a7', 'b6', 'c5', 'e3', 'f2', 'g1'],
          arrows: [
            ['d4', 'a7'],
            ['d4', 'h8'],
            ['d4', 'a1'],
            ['d4', 'g1'],
          ],
          text: 'El alfil se mueve en diagonal. Puede ir tan lejos como quiera por cualquiera de sus cuatro diagonales. Aquí, desde d4, tiene trece casillas marcadas para elegir.',
        },
        {
          fen: '6k1/8/8/8/3B4/2P5/8/7K w - - 0 1',
          squares: ['e5', 'f6', 'g7', 'h8', 'a7', 'b6', 'c5', 'e3', 'f2', 'g1'],
          arrows: [['d4', 'c3']],
          text: 'El alfil no salta. Su peón de c3 le cierra el camino hacia abajo y a la izquierda, así que ya no puede ir a b2 ni a a1. Por las otras tres diagonales sigue libre.',
        },
      ],
      practice: [
        {
          fen: '6k1/8/8/8/8/8/8/K1B5 w - - 0 1',
          prompt: 'Lleva el alfil de c1 a f4.',
          solutionUci: ['c1f4'],
          hint: 'La diagonal que buscas sube hacia la derecha.',
          explanationCorrect: 'Muy bien. El alfil subió por la diagonal, pasando por d2 y e3 hasta f4.',
          explanationWrong: 'El alfil solo se mueve en diagonal. Busca la diagonal que sube hacia la derecha.',
          wrongByMove: {
            c1b2: 'Esa diagonal sube hacia la izquierda. Prueba con la que sube hacia la derecha.',
          },
        },
        {
          fen: 'B6k/8/8/8/8/8/8/K7 w - - 0 1',
          prompt: 'Lleva el alfil de a8 a h1 en una sola jugada.',
          solutionUci: ['a8h1'],
          hint: 'Es la diagonal más larga del tablero. Se recorre de una esquina a la otra.',
          explanationCorrect: 'Muy bien. Recorriste de una esquina a la otra la diagonal más larga, sin que nada te estorbara.',
          explanationWrong: 'El alfil puede ir tan lejos como quiera, si el camino está libre. Prueba con la diagonal más larga.',
        },
        {
          fen: '7k/8/8/8/8/3B4/8/K7 w - - 0 1',
          prompt: 'Lleva el alfil de d3 a a6.',
          solutionUci: ['d3a6'],
          hint: 'La diagonal sube hacia la izquierda.',
          explanationCorrect: 'Muy bien. Desde d3, el alfil subió hacia la izquierda pasando por c4 y b5.',
          explanationWrong: 'Fíjate en hacia dónde está la casilla de destino y elige la diagonal que va hacia allí.',
        },
      ],
      evaluation: [
        {
          fen: '7k/8/8/8/8/5B2/8/K7 w - - 0 1',
          prompt: 'Lleva el alfil de f3 a c6.',
          solutionUci: ['f3c6'],
          hint: 'La diagonal sube hacia la izquierda.',
          explanationCorrect: 'Muy bien. Subiste por la diagonal hacia la izquierda, pasando por e4 y d5.',
          explanationWrong: 'El alfil se mueve en diagonal. Mira hacia dónde está la casilla de destino.',
        },
        {
          fen: '7k/8/8/8/5P2/4B3/8/K7 w - - 0 1',
          prompt: 'Tu peón de f4 tapa una diagonal, pero otra está libre. Lleva el alfil de e3 a a7.',
          solutionUci: ['e3a7'],
          hint: 'Prueba con la diagonal que sube hacia la izquierda.',
          explanationCorrect: 'Muy bien. El alfil no puede saltar su peón, pero la otra diagonal estaba libre.',
          explanationWrong: 'El alfil no puede saltar sobre su propio peón. Elige la diagonal que no está tapada.',
        },
        {
          fen: '7k/8/8/8/8/8/8/K6B w - - 0 1',
          prompt: 'Lleva el alfil de h1 a d5.',
          solutionUci: ['h1d5'],
          hint: 'Solo hay una diagonal que sale de la esquina.',
          explanationCorrect: 'Muy bien. Desde la esquina solo hay una diagonal, y la recorriste hasta d5.',
          explanationWrong: 'Desde la esquina solo sale una diagonal. Recórrela hacia el centro.',
        },
      ],
    },
    {
      id: 'u26.l02',
      unitId: 'u26',
      title: 'El alfil captura',
      objective: 'Capturar con el alfil las piezas rivales que están en su diagonal, y ver cuáles puede alcanzar.',
      intro:
        'El alfil captura igual que se mueve: en diagonal. Se coloca en la casilla de la pieza rival y la retira del tablero. Hoy lo practicas varias veces.',
      explanation: [
        {
          fen: '6k1/8/5n2/8/3B4/8/8/7K w - - 0 1',
          squares: ['f6'],
          arrows: [['d4', 'f6']],
          text: 'El alfil captura una pieza rival que esté en su diagonal. Se coloca en esa casilla y la pieza rival sale del tablero. Aquí el alfil puede capturar el caballo de f6.',
        },
        {
          fen: '6k1/8/5n2/4p3/3B4/8/8/7K w - - 0 1',
          squares: ['e5'],
          arrows: [['d4', 'e5']],
          text: 'El alfil tampoco salta al capturar. Aquí el peón de e5 está en medio: el alfil puede capturar el peón de e5, pero no el caballo de f6, que queda detrás.',
        },
      ],
      practice: [
        {
          fen: '8/7k/8/8/3B4/8/5r2/K7 w - - 0 1',
          prompt: 'Captura la torre negra con tu alfil.',
          solutionUci: ['d4f2'],
          hint: 'La torre está en una de las diagonales de tu alfil. Mira hacia abajo.',
          explanationCorrect: 'Muy bien. Capturaste una torre con un alfil y nadie puede recapturar.',
          explanationWrong: 'La torre negra está en una diagonal de tu alfil. Mira hacia abajo y a la derecha.',
        },
        {
          fen: '7k/8/4n3/8/2B5/8/6r1/K7 w - - 0 1',
          prompt: 'Hay dos piezas negras. Captura la que tu alfil puede alcanzar.',
          solutionUci: ['c4e6'],
          hint: 'El alfil solo captura en diagonal. Una de las dos piezas no está en ninguna de sus diagonales.',
          explanationCorrect: 'Muy bien. La torre no estaba en ninguna diagonal del alfil: solo se podía capturar el caballo.',
          explanationWrong: 'Comprueba cuál de las dos piezas está en una diagonal de tu alfil.',
        },
        {
          fen: '8/7k/8/n7/8/2B5/8/K7 w - - 0 1',
          prompt: 'Captura el caballo negro con el alfil.',
          solutionUci: ['c3a5'],
          hint: 'El caballo está en una diagonal que sube hacia la izquierda.',
          explanationCorrect: 'Muy bien. El alfil subió hacia la izquierda y capturó el caballo, sin saltar nada.',
          explanationWrong: 'Mira la diagonal que sube hacia la izquierda: allí está el caballo.',
        },
      ],
      evaluation: [
        {
          fen: '7k/8/1b6/8/8/4B3/8/K7 w - - 0 1',
          prompt: 'Captura el alfil negro.',
          solutionUci: ['e3b6'],
          hint: 'Los dos alfiles están en la misma diagonal, uno frente al otro.',
          explanationCorrect: 'Muy bien. Capturaste el alfil negro y tu alfil no puede ser recapturado.',
          explanationWrong: 'Los dos alfiles se miran en la misma diagonal. El que mueve primero captura.',
        },
        {
          fen: '7k/1r6/8/8/8/8/6B1/K7 w - - 0 1',
          prompt: 'Captura la torre negra con el alfil.',
          solutionUci: ['g2b7'],
          hint: 'Es la diagonal más larga del tablero y la torre está en ella.',
          explanationCorrect: 'Muy bien. Desde el otro extremo de la gran diagonal, tu alfil capturó la torre.',
          explanationWrong: 'La torre está en la diagonal más larga del tablero. Recórrela entera.',
        },
        {
          fen: '7k/8/8/8/5q2/8/8/K1B5 w - - 0 1',
          prompt: 'La dama negra está en una diagonal de tu alfil. Captúrala.',
          solutionUci: ['c1f4'],
          hint: 'La dama y tu alfil se atacan a la vez. Pero te toca a ti.',
          explanationCorrect: 'Muy bien. Un alfil puede capturar a la dama, que es mucho más fuerte, y tu alfil no puede ser recapturado.',
          explanationWrong: 'La dama te ataca, pero tu alfil llega primero. Mira la diagonal que sube hacia la derecha.',
        },
      ],
    },
    {
      id: 'u26.l03',
      conceptIds: ['tactics.hanging_piece'],
      unitId: 'u26',
      title: 'El alfil y el color de sus casillas',
      objective: 'Saber que cada alfil pisa siempre casillas del mismo color, y capturar solo piezas colgadas, no protegidas.',
      intro:
        'Cada alfil se queda siempre en casillas del mismo color: no puede cambiar. Además, antes de capturar conviene mirar si la pieza rival está protegida.',
      explanation: [
        {
          fen: '6k1/8/8/8/8/8/8/2B4K w - - 0 1',
          squares: ['b2', 'a3', 'd2', 'e3', 'f4', 'g5', 'h6'],
          arrows: [['c1', 'h6']],
          text: 'Este alfil está en c1, una casilla oscura. Por eso solo pisará casillas oscuras, nunca claras. Es el «alfil de casillas oscuras». Su compañero, que empieza en f1, es el de casillas claras.',
        },
        {
          fen: '4k3/1p6/n5r1/8/8/3B4/8/K7 w - - 0 1',
          squares: ['a6', 'g6'],
          arrows: [
            ['d3', 'a6'],
            ['d3', 'g6'],
          ],
          text: 'El alfil puede capturar el caballo de a6 o la torre de g6. El caballo está protegido por un peón: si lo capturas, el peón recaptura. La torre está colgada, sin protección: se captura gratis.',
        },
      ],
      practice: [
        {
          fen: 'k7/7r/2p5/3p4/4B3/8/8/K7 w - - 0 1',
          prompt: 'Una de las dos piezas negras está colgada, sin protección. Captúrala con el alfil.',
          solutionUci: ['e4h7'],
          hint: 'Mira qué pieza tiene otra detrás que pueda recapturar. La otra es la colgada.',
          explanationCorrect: 'Muy bien. La torre estaba sin protección y la ganaste gratis.',
          explanationWrong: 'Antes de capturar, mira si te pueden recapturar. Una de las dos piezas está protegida; la otra, no.',
          wrongByMove: {
            e4d5: 'La capturan. El peón de d5 está protegido por otro peón, y perderías el alfil por un peón.',
          },
        },
        {
          fen: '4k3/8/7p/6p1/8/n7/8/K1B5 w - - 0 1',
          prompt: 'Una de las dos piezas negras está colgada. Captúrala con el alfil.',
          solutionUci: ['c1a3'],
          hint: 'Comprueba cuál de las dos tiene un peón detrás que pueda recapturar.',
          explanationCorrect: 'Muy bien. El caballo no tenía protección. Capturar el peón te habría costado el alfil.',
          explanationWrong: 'Mira primero si la pieza que quieres capturar está protegida. Una de las dos lo está; la otra, no.',
          wrongByMove: {
            c1g5: 'La capturan. El peón de g5 está protegido por el peón de h6, y perderías el alfil por un peón.',
          },
        },
        {
          fen: '7k/8/3r4/8/2n5/8/8/K4B2 w - - 0 1',
          prompt: 'Hay dos piezas negras. Captura la que tu alfil puede alcanzar.',
          solutionUci: ['f1c4'],
          hint: 'Tu alfil pisa siempre casillas del mismo color. Mira de qué color es la casilla de cada pieza.',
          explanationCorrect: 'Muy bien. Tu alfil es de casillas claras y la torre estaba en una casilla oscura: no podía alcanzarla nunca.',
          explanationWrong: 'Tu alfil es de casillas claras. Una de las dos piezas está en una casilla oscura, y a esa no llega.',
        },
      ],
      evaluation: [
        {
          fen: '4k3/8/8/n5p1/5p2/8/3B4/K7 w - - 0 1',
          prompt: 'Una de las dos piezas negras está colgada. Captúrala con el alfil.',
          solutionUci: ['d2a5'],
          hint: 'Mira qué pieza tiene un peón que pueda recapturar. La otra es la colgada.',
          explanationCorrect: 'Muy bien. El caballo estaba sin protección. El peón sí estaba protegido por otro peón.',
          explanationWrong: 'Antes de capturar, comprueba si te pueden recapturar. Una de las dos piezas está protegida.',
          wrongByMove: {
            d2f4: 'La capturan. El peón de f4 está protegido por el peón de g5, y perderías el alfil por un peón.',
          },
        },
        {
          fen: 'k7/7r/3n4/8/8/3B4/8/K7 w - - 0 1',
          prompt: 'Hay dos piezas negras. Captura la que tu alfil puede alcanzar.',
          solutionUci: ['d3h7'],
          hint: 'Tu alfil pisa siempre casillas del mismo color. Mira de qué color es la casilla de cada pieza.',
          explanationCorrect: 'Muy bien. Tu alfil es de casillas claras. El caballo estaba en una casilla oscura y no podía alcanzarlo.',
          explanationWrong: 'Tu alfil es de casillas claras. Una de las dos piezas está en una casilla oscura, y a esa no llega.',
        },
        {
          fen: '4k3/8/8/1p6/2p5/7r/8/K4B2 w - - 0 1',
          prompt: 'Una de las dos piezas negras está colgada. Captúrala con el alfil.',
          solutionUci: ['f1h3'],
          hint: 'Mira cuál de las dos tiene otro peón detrás que pueda recapturar.',
          explanationCorrect: 'Muy bien. La torre estaba sin protección. El peón de c4 sí estaba protegido por el peón de b5.',
          explanationWrong: 'Antes de capturar, comprueba si te pueden recapturar. Una de las dos piezas está protegida.',
          wrongByMove: {
            f1c4: 'La capturan. El peón de c4 está protegido por el peón de b5, y perderías el alfil por un peón.',
          },
        },
      ],
    },
  ],
};
