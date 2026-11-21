import type { Unit } from '../schema.js';
import { fen } from './ruso-a-fen.js';

export const unit: Unit = {
  id: 'u24',
  order: 5,
  title: 'El enroque',
  description:
    'Aprende la jugada especial en la que el rey y la torre se mueven a la vez: el enroque corto y el largo, y las condiciones que lo impiden.',
  level: 'beginner',
  requires: ['u23'],
  lessons: [
    {
      id: 'u24.l01',
      unitId: 'u24',
      title: 'El enroque corto',
      objective: 'Hacer el enroque corto con blancas y con negras.',
      intro:
        'El enroque es una jugada especial: mueves el rey y una torre a la vez. Sirve para poner el rey a salvo y sacar la torre al juego. Empezamos por el corto.',
      explanation: [
        {
          fen: fen('Ke1 Rh1 ke8', 'w', 'K'),
          arrows: [
            ['e1', 'g1'],
            ['h1', 'f1'],
          ],
          text: 'En el enroque corto, el rey avanza dos casillas hacia la torre de h1. Después la torre salta al otro lado del rey. Es una sola jugada y solo se puede hacer una vez por partida.',
        },
        {
          fen: fen('Kg1 Rf1 ke8', 'b'),
          squares: ['g1', 'f1'],
          text: 'Así queda tras el enroque corto: el rey en g1 y la torre en f1. En notación se escribe O-O. Las negras enrocan igual: el rey de e8 va a g8 y la torre de h8 va a f8.',
        },
      ],
      practice: [
        {
          fen: fen('Ke1 Rh1 kd8', 'w', 'K'),
          prompt: 'Juegan blancas. Haz el enroque corto.',
          solutionUci: ['e1g1'],
          hint: 'Mueve el rey dos casillas hacia la torre de h1.',
          explanationCorrect: 'Muy bien. El rey fue a g1 y la torre pasó a f1 en una sola jugada.',
          explanationWrong: 'Esa jugada no es el enroque. Para enrocar mueves el rey dos casillas hacia la torre, y la torre salta al otro lado.',
          wrongByMove: {
            e1f1: 'El rey solo avanzó una casilla. En el enroque el rey avanza dos.',
          },
        },
        {
          fen: fen('Kg2 ke8 rh8', 'b', 'k'),
          prompt: 'Juegan negras. Haz el enroque corto.',
          solutionUci: ['e8g8'],
          hint: 'Las negras enrocan hacia la torre de h8, igual que las blancas.',
          explanationCorrect: 'Eso es. El rey negro fue a g8 y la torre pasó a f8.',
          explanationWrong: 'Esa jugada no es el enroque. Mueve el rey dos casillas hacia la torre de h8.',
          wrongByMove: {
            e8f8: 'El rey solo avanzó una casilla. En el enroque el rey avanza dos.',
          },
        },
        {
          fen: fen('Ke1 Ra1 Rh1 ke8 ra8 rh8', 'w', 'KQkq'),
          prompt: 'Tienes dos torres. Haz el enroque corto.',
          solutionUci: ['e1g1'],
          hint: 'El enroque corto se hace hacia el lado de la torre de h1, no hacia la de a1.',
          explanationCorrect: 'Muy bien. El corto es hacia la derecha. Con la otra torre sería el enroque largo.',
          explanationWrong: 'Esa jugada no es el enroque corto. Mueve el rey dos casillas hacia la torre de la derecha.',
          wrongByMove: {
            e1c1: 'Ese es el enroque largo, hacia la torre de a1. El corto es hacia la torre de h1.',
          },
        },
      ],
      evaluation: [
        {
          fen: fen('Kc2 ke8 ra8 rh8', 'b', 'kq'),
          prompt: 'Juegan negras. Haz el enroque corto.',
          solutionUci: ['e8g8'],
          explanationCorrect: 'Correcto. El rey fue a g8 y la torre de h8 pasó a f8.',
          explanationWrong: 'Esa jugada no es el enroque corto. Mueve el rey dos casillas hacia la torre de la derecha.',
        },
        {
          fen: fen('Ke1 Rh1 kb8', 'w', 'K'),
          prompt: 'Juegan blancas. Haz el enroque corto.',
          solutionUci: ['e1g1'],
          explanationCorrect: 'Muy bien. El rey fue a g1 y la torre de h1 pasó a f1.',
          explanationWrong: 'Esa jugada no es el enroque. Mueve el rey dos casillas hacia la torre de h1.',
        },
        {
          fen: fen('Ke1 Ra1 Rh1 kf7', 'w', 'KQ'),
          prompt: 'Con una sola jugada, deja el rey en g1 y una torre en f1.',
          solutionUci: ['e1g1'],
          explanationCorrect: 'Correcto. Solo el enroque corto deja el rey en g1 y la torre en f1.',
          explanationWrong: 'Esa jugada no deja el rey en g1 y la torre en f1. Eso solo lo consigue el enroque corto.',
        },
      ],
    },
    {
      id: 'u24.l02',
      unitId: 'u24',
      title: 'El enroque largo',
      objective: 'Hacer el enroque largo con blancas y con negras.',
      intro:
        'El enroque largo es el mismo juego hacia el otro lado. El rey va hacia la torre de la columna a. Es largo porque la torre recorre más casillas.',
      explanation: [
        {
          fen: fen('Ke1 Ra1 ke8', 'w', 'Q'),
          arrows: [
            ['e1', 'c1'],
            ['a1', 'd1'],
          ],
          text: 'En el enroque largo, el rey avanza dos casillas hacia la torre de a1. La torre pasa al otro lado del rey, a d1. Es largo porque la torre recorre tres casillas.',
        },
        {
          fen: fen('Kc1 Rd1 ke8', 'b'),
          squares: ['c1', 'd1'],
          text: 'Así queda tras el enroque largo: el rey en c1 y la torre en d1. En notación se escribe O-O-O. Las tres casillas entre el rey y la torre, b1, c1 y d1, tienen que estar libres.',
        },
      ],
      practice: [
        {
          fen: fen('Ke1 Ra1 kd8', 'w', 'Q'),
          prompt: 'Juegan blancas. Haz el enroque largo.',
          solutionUci: ['e1c1'],
          hint: 'Mueve el rey dos casillas hacia la torre de a1.',
          explanationCorrect: 'Muy bien. El rey fue a c1 y la torre pasó a d1.',
          explanationWrong: 'Esa jugada no es el enroque largo. Mueve el rey dos casillas hacia la torre de a1.',
          wrongByMove: {
            e1d1: 'El rey solo avanzó una casilla. En el enroque el rey avanza dos.',
          },
        },
        {
          fen: fen('Kg2 ke8 ra8', 'b', 'q'),
          prompt: 'Juegan negras. Haz el enroque largo.',
          solutionUci: ['e8c8'],
          hint: 'Las negras enrocan largo hacia la torre de a8.',
          explanationCorrect: 'Eso es. El rey negro fue a c8 y la torre pasó a d8.',
          explanationWrong: 'Esa jugada no es el enroque largo. Mueve el rey dos casillas hacia la torre de a8.',
          wrongByMove: {
            e8d8: 'El rey solo avanzó una casilla. En el enroque el rey avanza dos.',
          },
        },
        {
          fen: fen('Ke1 Ra1 Rh1 kg7', 'w', 'KQ'),
          prompt: 'Tienes dos torres. Haz el enroque largo.',
          solutionUci: ['e1c1'],
          hint: 'El enroque largo se hace hacia el lado de la torre de a1, no hacia la de h1.',
          explanationCorrect: 'Muy bien. El largo es hacia la izquierda. Con la otra torre sería el enroque corto.',
          explanationWrong: 'Esa jugada no es el enroque largo. Mueve el rey dos casillas hacia la torre de la izquierda.',
          wrongByMove: {
            e1g1: 'Ese es el enroque corto, hacia la torre de h1. El largo es hacia la torre de a1.',
          },
        },
      ],
      evaluation: [
        {
          fen: fen('Kb3 ke8 ra8 rh8', 'b', 'kq'),
          prompt: 'Juegan negras. Haz el enroque largo.',
          solutionUci: ['e8c8'],
          explanationCorrect: 'Correcto. El rey fue a c8 y la torre de a8 pasó a d8.',
          explanationWrong: 'Esa jugada no es el enroque largo. Mueve el rey dos casillas hacia la torre de la izquierda.',
        },
        {
          fen: fen('Ke1 Ra1 kf6', 'w', 'Q'),
          prompt: 'Juegan blancas. Haz el enroque largo.',
          solutionUci: ['e1c1'],
          explanationCorrect: 'Muy bien. El rey fue a c1 y la torre de a1 pasó a d1.',
          explanationWrong: 'Esa jugada no es el enroque largo. Mueve el rey dos casillas hacia la torre de a1.',
        },
        {
          fen: fen('Ke1 Ra1 kh5', 'w', 'Q'),
          prompt: 'Con una sola jugada, deja el rey en c1 y la torre en d1.',
          solutionUci: ['e1c1'],
          explanationCorrect: 'Correcto. Solo el enroque largo deja el rey en c1 y la torre en d1.',
          explanationWrong: 'Esa jugada no deja el rey en c1 y la torre en d1. Eso solo lo consigue el enroque largo.',
        },
      ],
    },
    {
      id: 'u24.l03',
      unitId: 'u24',
      title: 'Cuándo no se puede enrocar',
      objective: 'Reconocer las condiciones que impiden el enroque y elegir el que sí se puede.',
      intro:
        'No siempre se puede enrocar. Hay reglas claras. Aprende a comprobarlas antes de jugar y sabrás elegir el enroque correcto.',
      explanation: [
        {
          fen: fen('Ke1 Rf1 Rh1 ka8', 'w', 'K'),
          squares: ['f1'],
          text: 'No puedes enrocar si hay una pieza entre el rey y la torre. Aquí tu otra torre está en f1. Tampoco puedes si el rey o esa torre ya se movieron antes, aunque hayan vuelto a su casilla.',
        },
        {
          fen: fen('Ke1 Rh1 rf8 ka8', 'w', 'K'),
          squares: ['f1'],
          arrows: [['f8', 'f1']],
          text: 'Tampoco puedes enrocar con el rey en jaque, ni si el rey pasa por una casilla atacada, ni si llega a una casilla atacada. Aquí la torre negra ataca f1, por donde pasa el rey. Que la torre esté atacada no importa.',
        },
      ],
      practice: [
        {
          fen: fen('Ke1 Ra1 Rh1 rf8 kb8', 'w', 'KQ'),
          prompt: 'Juegan blancas. Solo puedes enrocar hacia un lado. Hazlo.',
          solutionUci: ['e1c1'],
          hint: 'Mira por qué casillas pasaría el rey hacia cada lado. Una torre negra ataca una de ellas.',
          explanationCorrect: 'Muy bien. La torre negra ataca f1, por donde pasaría el rey en el enroque corto. El largo sí se podía.',
          explanationWrong: 'Esa jugada no es el enroque que se puede. El rey no puede pasar por una casilla atacada: comprueba cada lado.',
        },
        {
          fen: fen('Ke1 Ra1 Rh1 kd6', 'w', 'Q'),
          prompt: 'La torre de h1 ya se movió antes, así que solo puedes enrocar hacia el otro lado. Hazlo.',
          solutionUci: ['e1c1'],
          hint: 'Si una torre ya se movió, con esa torre no se puede enrocar. Usa la otra.',
          explanationCorrect: 'Eso es. La torre de h1 ya se había movido, así que solo quedaba el enroque largo.',
          explanationWrong: 'Esa jugada no es el enroque que se puede. La torre que ya se movió no sirve para enrocar.',
        },
        {
          fen: fen('Ke1 Ra1 Rh1 Bf1 kb6', 'w', 'KQ'),
          prompt: 'Hay una pieza entre tu rey y una de las torres. Enroca hacia el otro lado.',
          solutionUci: ['e1c1'],
          hint: 'Mira qué lado tiene una pieza propia en medio.',
          explanationCorrect: 'Muy bien. El alfil de f1 estorbaba en el enroque corto. El largo tenía el camino libre.',
          explanationWrong: 'Esa jugada no es el enroque que se puede. Entre el rey y la torre no puede haber ninguna pieza.',
        },
      ],
      evaluation: [
        {
          fen: fen('Ke1 Ra1 Rh1 rg8 kb8', 'w', 'KQ'),
          prompt: 'Juegan blancas. Solo puedes enrocar hacia un lado. Hazlo.',
          solutionUci: ['e1c1'],
          explanationCorrect: 'Correcto. La torre negra ataca g1, donde acabaría el rey en el enroque corto. El largo sí se podía.',
          explanationWrong: 'Esa jugada no es el enroque que se puede. El rey no puede llegar a una casilla atacada: comprueba cada lado.',
        },
        {
          fen: fen('Ke1 Ra1 Rh1 re8 kb6', 'w', 'KQ'),
          prompt: 'Tu rey está en jaque, así que no puedes enrocar. Sal del jaque moviendo el rey.',
          solutionUci: ['e1d1'],
          alt: ['e1d2', 'e1f1', 'e1f2'],
          explanationCorrect: 'Muy bien. Con el rey en jaque no se puede enrocar. Había cuatro casillas seguras.',
          explanationWrong: 'Esa jugada no resuelve el jaque. Con el rey en jaque no se puede enrocar: tienes que salir de la columna de la torre.',
        },
        {
          fen: fen('Ke1 Rh1 rh8 ka8', 'w', 'K'),
          prompt: 'Tu torre de h1 está atacada, pero eso no impide enrocar. Haz el enroque corto.',
          solutionUci: ['e1g1'],
          explanationCorrect: 'Correcto. Que la torre esté atacada no impide enrocar. El rey no pasa ni llega a una casilla atacada.',
          explanationWrong: 'Esa jugada no es el enroque corto. Mueve el rey dos casillas hacia la torre de h1.',
        },
      ],
    },
  ],
};
