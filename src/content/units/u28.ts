import type { Unit } from '../schema.js';

/** Método ruso, unidad 9: la dama. Pendiente de validación de profesores. */
export const unit: Unit = {
  id: 'u28',
  order: 9,
  title: 'La dama',
  description:
    'Conoce a la dama, la pieza más fuerte: se mueve como una torre y como un alfil a la vez. Aprende a moverla, a capturar con ella y a no perderla en capturas peligrosas.',
  level: 'beginner',
  requires: ['u27'],
  lessons: [
    {
      id: 'u28.l01',
      unitId: 'u28',
      title: 'La dama se mueve en línea y en diagonal',
      objective: 'Mover la dama en línea recta y en diagonal, tan lejos como quiera, sin saltar otras piezas.',
      intro:
        'La dama es la pieza más fuerte. Se mueve como una torre y como un alfil a la vez. Aquí la moverás tú, muchas veces, hasta que te salga sola.',
      explanation: [
        {
          fen: '6k1/8/8/8/3Q4/8/8/7K w - - 0 1',
          squares: [
            'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4',
            'd1', 'd2', 'd3', 'd5', 'd6', 'd7', 'd8',
            'e5', 'f6', 'g7', 'h8', 'c5', 'b6', 'a7',
            'e3', 'f2', 'g1', 'c3', 'b2', 'a1',
          ],
          text: 'La dama se mueve como una torre y como un alfil juntos: en línea recta y en diagonal, tan lejos como quiera. Aquí, desde d4, tiene veintisiete casillas para elegir.',
        },
        {
          fen: '6k1/8/8/3P4/3Q4/2p5/8/7K w - - 0 1',
          squares: [
            'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4',
            'd1', 'd2', 'd3',
            'e5', 'f6', 'g7', 'h8', 'c5', 'b6', 'a7',
            'e3', 'f2', 'g1', 'c3',
          ],
          arrows: [
            ['d4', 'd5'],
            ['d4', 'c3'],
          ],
          text: 'La dama tampoco salta. Su peón de d5 le cierra el camino hacia arriba. El peón negro de c3 le cierra la diagonal: puede capturarlo, pero no seguir más allá.',
        },
      ],
      practice: [
        {
          fen: '6k1/8/8/8/8/8/8/K2Q4 w - - 0 1',
          prompt: 'Lleva la dama de d1 a h5.',
          solutionUci: ['d1h5'],
          hint: 'La casilla de destino está en una diagonal de la dama.',
          explanationCorrect: 'Muy bien. La dama subió en diagonal, como un alfil, hasta el otro lado del tablero.',
          explanationWrong: 'La dama se mueve en línea recta o en diagonal. Fíjate en cuál de las dos lleva a la casilla de destino.',
        },
        {
          fen: '8/7k/8/8/3Q4/8/8/K7 w - - 0 1',
          prompt: 'Lleva la dama de d4 a d8, en línea recta.',
          solutionUci: ['d4d8'],
          hint: 'Sube por la misma columna, como una torre.',
          explanationCorrect: 'Muy bien. Subiste por la columna, como una torre, hasta el final del tablero.',
          explanationWrong: 'Para llegar a la casilla de destino, la dama sube por su misma columna, como una torre.',
        },
        {
          fen: '7k/8/8/8/8/8/8/K5Q1 w - - 0 1',
          prompt: 'Lleva la dama de g1 a b6.',
          solutionUci: ['g1b6'],
          hint: 'La casilla de destino está en una diagonal de la dama. Mira hacia arriba y a la izquierda.',
          explanationCorrect: 'Muy bien. Recorriste la diagonal entera, pasando por f2, e3, d4 y c5.',
          explanationWrong: 'La dama se mueve en diagonal como un alfil. Elige la diagonal que sube hacia la izquierda.',
        },
      ],
      evaluation: [
        {
          fen: '6k1/8/8/8/8/8/2Q5/K7 w - - 0 1',
          prompt: 'Lleva la dama de c2 a c7.',
          solutionUci: ['c2c7'],
          hint: 'Sube por la misma columna, como una torre.',
          explanationCorrect: 'Muy bien. La dama subió por la columna, como una torre.',
          explanationWrong: 'La casilla de destino está en la misma columna que la dama. Sube en línea recta.',
        },
        {
          fen: '6k1/8/8/8/8/3P4/3Q4/K7 w - - 0 1',
          prompt: 'Tu peón de d3 tapa el camino hacia arriba. Lleva la dama de d2 a h6 por la diagonal.',
          solutionUci: ['d2h6'],
          hint: 'Sube por la diagonal que va hacia la derecha.',
          explanationCorrect: 'Muy bien. La dama no podía saltar su peón, pero la diagonal estaba libre.',
          explanationWrong: 'La dama no salta su propio peón. Usa la diagonal que va hacia la derecha.',
        },
        {
          fen: '5k2/8/8/8/8/8/8/K6Q w - - 0 1',
          prompt: 'Lleva la dama de h1 a d5.',
          solutionUci: ['h1d5'],
          hint: 'Desde la esquina, la diagonal sube hacia la izquierda.',
          explanationCorrect: 'Muy bien. Recorriste la diagonal larga hasta el centro, pasando por g2, f3 y e4.',
          explanationWrong: 'Desde la esquina de abajo a la derecha, la dama sube por la diagonal hacia la izquierda.',
        },
      ],
    },
    {
      id: 'u28.l02',
      unitId: 'u28',
      title: 'La dama captura',
      objective: 'Capturar con la dama en línea recta o en diagonal, y ver qué piezas puede alcanzar.',
      intro:
        'La dama captura igual que se mueve: en línea recta o en diagonal. Se coloca en la casilla de la pieza rival y la retira. Hoy lo practicas varias veces.',
      explanation: [
        {
          fen: '6k1/b2r4/8/8/3Q4/8/8/7K w - - 0 1',
          squares: ['d7', 'a7'],
          arrows: [
            ['d4', 'd7'],
            ['d4', 'a7'],
          ],
          text: 'La dama captura como se mueve. Desde d4 puede capturar la torre de d7, en línea recta, o el alfil de a7, en diagonal. Elige tú cuál, pero antes mira si te pueden recapturar.',
        },
        {
          fen: '6k1/3b4/3n4/8/3Q4/8/8/7K w - - 0 1',
          squares: ['d6'],
          arrows: [['d4', 'd6']],
          text: 'La dama tampoco salta al capturar. El caballo de d6 está delante del alfil de d7: la dama puede capturar el caballo, pero no el alfil, que queda detrás.',
        },
      ],
      practice: [
        {
          fen: '8/7k/8/8/3Q4/8/5r2/K7 w - - 0 1',
          prompt: 'Captura la torre negra con tu dama.',
          solutionUci: ['d4f2'],
          hint: 'La torre está en una diagonal de tu dama. Mira hacia abajo y a la derecha.',
          explanationCorrect: 'Muy bien. La dama capturó la torre en diagonal y nadie puede recapturar.',
          explanationWrong: 'La torre negra está en una diagonal de tu dama. Mira hacia abajo y a la derecha.',
        },
        {
          fen: '8/7k/8/8/3Q4/8/8/K2r4 w - - 0 1',
          prompt: 'La torre negra te da jaque. Captúrala con tu dama.',
          solutionUci: ['d4d1'],
          hint: 'La torre está en la misma columna que tu dama. Baja en línea recta.',
          explanationCorrect: 'Muy bien. Saliste del jaque capturando la torre con la dama, en línea recta.',
          explanationWrong: 'La torre que te da jaque está en la misma columna que tu dama. Captúrala bajando en línea recta.',
        },
        {
          fen: '8/7k/1r2n3/8/3Q4/8/8/K7 w - - 0 1',
          prompt: 'Hay dos piezas negras. Captura la que tu dama puede alcanzar.',
          solutionUci: ['d4b6'],
          hint: 'La dama solo captura en línea recta o en diagonal. Una de las dos piezas no está en ninguna de sus líneas.',
          explanationCorrect: 'Muy bien. El caballo no estaba en ninguna línea de la dama: solo se podía capturar la torre.',
          explanationWrong: 'Comprueba cuál de las dos piezas está en una línea recta o en una diagonal de tu dama.',
        },
      ],
      evaluation: [
        {
          fen: '6k1/8/8/8/8/2Q5/8/K3b3 w - - 0 1',
          prompt: 'Captura el alfil negro con la dama.',
          solutionUci: ['c3e1'],
          hint: 'El alfil está en una diagonal que baja hacia la derecha.',
          explanationCorrect: 'Muy bien. La dama capturó el alfil en diagonal y nadie puede recapturar.',
          explanationWrong: 'El alfil negro está en una diagonal de tu dama. Mira hacia abajo y a la derecha.',
        },
        {
          fen: '8/8/2k5/8/8/8/8/K2Q3r w - - 0 1',
          prompt: 'Captura la torre negra con la dama.',
          solutionUci: ['d1h1'],
          hint: 'La torre está en la misma fila que tu dama. Recorre la fila entera.',
          explanationCorrect: 'Muy bien. La dama recorrió la fila entera y capturó la torre.',
          explanationWrong: 'La torre negra está en la misma fila que tu dama. Captúrala en línea recta.',
        },
        {
          fen: '6k1/8/8/8/4q3/8/8/K3Q3 w - - 0 1',
          prompt: 'Dama contra dama. Captura la dama negra.',
          solutionUci: ['e1e4'],
          hint: 'Las dos damas están en la misma columna, una frente a la otra. Te toca a ti.',
          explanationCorrect: 'Muy bien. Capturaste la dama rival sin que puedan recapturar. Eso decide la partida.',
          explanationWrong: 'Las dos damas se miran en la misma columna. La que mueve primero captura a la otra.',
        },
      ],
    },
    {
      id: 'u28.l03',
      conceptIds: ['tactics.hanging_piece'],
      unitId: 'u28',
      title: 'La dama frente a otras piezas',
      objective: 'Saber cuánto vale la dama y no perderla capturando piezas protegidas: capturar la pieza que está colgada.',
      intro:
        'La dama vale por una torre y un alfil juntos, así que es muy valiosa. Por eso no debes cambiarla por una pieza protegida. Captura solo lo que está colgado.',
      explanation: [
        {
          fen: '6k1/8/8/8/3Q4/8/8/7K w - - 0 1',
          squares: ['d4'],
          text: 'Desde d4, una torre llega a 14 casillas y un alfil a 13. La dama llega a 27: es decir, 14 más 13. Vale por una torre y un alfil juntos.',
        },
        {
          fen: '4k3/8/1p6/2p5/3Q3r/8/8/6K1 w - - 0 1',
          squares: ['c5', 'h4'],
          arrows: [
            ['d4', 'c5'],
            ['d4', 'h4'],
          ],
          text: 'La dama puede capturar el peón de c5 o la torre de h4. El peón está protegido por otro peón: si lo capturas, pierdes la dama por un peón. La torre está colgada y se captura gratis.',
        },
      ],
      practice: [
        {
          fen: 'k7/7b/2p5/3p4/4Q3/8/8/6K1 w - - 0 1',
          prompt: 'Una de las dos piezas negras está colgada. Captúrala con la dama.',
          solutionUci: ['e4h7'],
          hint: 'Mira cuál de las dos piezas está protegida por un peón. La otra es la colgada.',
          explanationCorrect: 'Muy bien. El alfil estaba sin protección y lo ganaste gratis.',
          explanationWrong: 'Antes de capturar con la dama, mira si te pueden recapturar. Una de las dos piezas está protegida.',
          wrongByMove: {
            e4d5: 'La capturan. El peón de d5 está protegido por otro peón, y perderías la dama por un peón.',
          },
        },
        {
          fen: '4k3/p2n4/8/8/Q7/8/8/6K1 w - - 0 1',
          prompt: 'Una de las dos piezas negras está colgada. Captúrala con la dama.',
          solutionUci: ['a4a7'],
          hint: 'Mira cuál de las dos piezas está protegida por el rey rival.',
          explanationCorrect: 'Muy bien. El peón no tenía protección. Capturar el caballo te habría costado la dama.',
          explanationWrong: 'Antes de capturar con la dama, mira si te pueden recapturar. Una de las dos piezas está protegida.',
          wrongByMove: {
            a4d7: 'La capturan. El rey negro protege el caballo de d7, y perderías la dama por un caballo.',
          },
        },
        {
          fen: '4k3/p5r1/1n6/8/3Q4/8/8/7K w - - 0 1',
          prompt: 'Una de las dos piezas negras está colgada. Captúrala con la dama.',
          solutionUci: ['d4g7'],
          hint: 'Mira cuál de las dos piezas está protegida por un peón.',
          explanationCorrect: 'Muy bien. La torre estaba sin protección. El caballo sí estaba protegido por un peón.',
          explanationWrong: 'Antes de capturar con la dama, mira si te pueden recapturar. Una de las dos piezas está protegida.',
          wrongByMove: {
            d4b6: 'La capturan. El caballo de b6 está protegido por el peón de a7, y perderías la dama por un caballo.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4r1k1/1p6/b7/8/8/8/4Q3/7K w - - 0 1',
          prompt: 'Una de las dos piezas negras está colgada. Captúrala con la dama.',
          solutionUci: ['e2e8'],
          hint: 'Mira cuál de las dos piezas está protegida por un peón.',
          explanationCorrect: 'Muy bien. La torre no estaba protegida y además diste jaque. El alfil sí estaba protegido por un peón.',
          explanationWrong: 'Antes de capturar con la dama, mira si te pueden recapturar. Una de las dos piezas está protegida.',
          wrongByMove: {
            e2a6: 'La capturan. El alfil de a6 está protegido por el peón de b7, y perderías la dama por un alfil.',
          },
        },
        {
          fen: 'r1n5/8/5k2/8/6Q1/8/8/3b3K w - - 0 1',
          prompt: 'Una de las dos piezas negras está colgada. Captúrala con la dama.',
          solutionUci: ['g4d1'],
          hint: 'Mira cuál de las dos piezas está protegida por una torre.',
          explanationCorrect: 'Muy bien. El alfil no tenía protección. El caballo sí estaba protegido por una torre.',
          explanationWrong: 'Antes de capturar con la dama, mira si te pueden recapturar. Una de las dos piezas está protegida.',
          wrongByMove: {
            g4c8: 'La capturan. La torre de a8 protege el caballo de c8, y perderías la dama por un caballo.',
          },
        },
        {
          fen: '4k2r/5p2/8/7Q/8/8/8/6K1 w - - 0 1',
          prompt: 'Una de las dos piezas negras está colgada. Captúrala con la dama.',
          solutionUci: ['h5h8'],
          hint: 'Mira cuál de las dos piezas está protegida por el rey rival.',
          explanationCorrect: 'Muy bien. La torre no estaba protegida y además diste jaque. Capturar el peón te habría costado la dama.',
          explanationWrong: 'Antes de capturar con la dama, mira si te pueden recapturar. Una de las dos piezas está protegida.',
          wrongByMove: {
            h5f7: 'La capturan. El rey negro protege el peón de f7, y perderías la dama por un peón.',
          },
        },
      ],
    },
  ],
};
