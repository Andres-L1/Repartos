import type { Unit } from '../schema.js';
import { fen } from './ruso-a-fen.js';

/** Posición inicial completa de las negras (con la colocación de las blancas que se indique aparte). */
const NEGRAS = 'ra8 nb8 bc8 qd8 ke8 bf8 ng8 rh8 pa7 pb7 pc7 pd7 pe7 pf7 pg7 ph7';
const BLANCAS = 'Ra1 Nb1 Bc1 Qd1 Ke1 Bf1 Ng1 Rh1 Pa2 Pb2 Pc2 Pd2 Pe2 Pf2 Pg2 Ph2';

export const unit: Unit = {
  id: 'u20',
  order: 1,
  title: 'El tablero y las coordenadas',
  description:
    'Aprende a leer el tablero como un mapa: columnas, filas, casillas claras y oscuras, diagonales y dónde empieza cada pieza. Lo practicas moviendo una torre, sin prisa.',
  level: 'beginner',
  requires: [],
  lessons: [
    {
      id: 'u20.l01',
      unitId: 'u20',
      title: 'Columnas y filas',
      objective: 'Nombrar cualquier casilla con su letra y su número, y llegar a ella con una torre.',
      intro:
        'El tablero es como un mapa y cada casilla tiene su dirección. Hoy aprendes a leerla. Con una torre irás de casilla en casilla para practicar.',
      explanation: [
        {
          fen: fen('Kh1 kh8'),
          squares: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
          arrows: [['e1', 'e8']],
          text: 'El tablero tiene 8 columnas. Se nombran con letras, de la a a la h, de izquierda a derecha. Aquí ves marcada la columna e. Las blancas siempre juegan desde abajo.',
        },
        {
          fen: fen('Ka1 ka8'),
          squares: ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'],
          arrows: [['a4', 'h4']],
          text: 'El tablero tiene 8 filas. Se numeran del 1 al 8, de abajo hacia arriba. Aquí ves marcada la fila 4. Cada casilla es una letra y un número: donde se cruzan la columna e y la fila 4 está la casilla e4.',
        },
      ],
      practice: [
        {
          fen: fen('Kc1 Rh1 ka8'),
          prompt: 'Juegan blancas. Mueve la torre a la casilla h6.',
          solutionUci: ['h1h6'],
          hint: 'La torre ya está en la columna h. Sube hasta la fila 6.',
          explanationCorrect: 'Muy bien. La casilla h6 es la columna h con la fila 6. Primero se dice la letra y después el número.',
          explanationWrong: 'Esa jugada no te deja en h6. La letra h es la columna y el 6 es la fila. Recuerda que las filas se cuentan hacia arriba.',
          wrongByMove: {
            h1h5: 'Te has quedado una fila antes. La fila 6 está un paso más arriba.',
            c1c2: 'Has movido el rey, no la torre. La torre es la pieza con forma de castillo.',
          },
        },
        {
          fen: fen('Kg1 Rh4 ka8'),
          prompt: 'Mueve la torre a la casilla b4.',
          solutionUci: ['h4b4'],
          hint: 'La casilla de llegada está en la misma fila que la torre. Avanza hacia la izquierda.',
          explanationCorrect: 'Eso es. La torre recorrió la fila 4 hasta la columna b. Las letras van de la a a la h, de izquierda a derecha.',
          explanationWrong: 'Esa jugada no llega a b4. El 4 es la fila de tu torre: tienes que moverte hacia la izquierda, hasta la columna b.',
          wrongByMove: {
            h4h2: 'La torre ha bajado por la columna h. La casilla b4 está en la misma fila que tu torre.',
          },
        },
        {
          fen: fen('Kh1 Rc1 ke8'),
          squares: ['c6'],
          prompt: 'Lleva la torre a la casilla marcada.',
          solutionUci: ['c1c6'],
          hint: 'Mira la columna de la casilla marcada. Después cuenta las filas hasta llegar a ella.',
          explanationCorrect: 'Muy bien. La casilla marcada se llama c6: columna c, fila 6. Ahora sabes ponerle nombre a una casilla.',
          explanationWrong: 'Esa jugada no llega a la casilla marcada. Primero mira en qué columna está, y después cuántas filas sube.',
          wrongByMove: {
            c1c5: 'Te has quedado una fila antes de la casilla marcada. Sube un paso más.',
          },
        },
      ],
      evaluation: [
        {
          fen: fen('Kb1 ke8 rf8', 'b'),
          prompt: 'Juegan negras. Mueve la torre negra a la casilla f3.',
          solutionUci: ['f8f3'],
          explanationCorrect: 'Correcto. Las negras juegan desde arriba, pero las columnas y las filas se leen igual: f3 es la columna f y la fila 3.',
          explanationWrong: 'Esa jugada no llega a f3. La torre baja por su columna hasta la fila 3, que se cuenta desde abajo.',
        },
        {
          fen: fen('Kb1 Ra5 ke8'),
          squares: ['g5'],
          prompt: 'Lleva la torre a la casilla marcada.',
          solutionUci: ['a5g5'],
          explanationCorrect: 'Muy bien. La casilla marcada se llama g5: columna g, fila 5.',
          explanationWrong: 'Esa jugada no llega a la casilla marcada. La torre y la casilla están en la misma fila: muévete de lado.',
        },
        {
          fen: fen('Kg1 Rd2 kh8'),
          prompt: 'Mueve la torre a la casilla d7.',
          solutionUci: ['d2d7'],
          explanationCorrect: 'Correcto. La torre subió por la columna d hasta la fila 7.',
          explanationWrong: 'Esa jugada no llega a d7. La torre ya está en la columna d: solo tiene que subir hasta la fila 7.',
        },
      ],
    },
    {
      id: 'u20.l02',
      unitId: 'u20',
      title: 'Casillas claras y oscuras',
      objective: 'Saber si una casilla es clara u oscura con la regla de la esquina.',
      intro:
        'Las casillas alternan entre claras y oscuras. Hay un truco muy sencillo para no equivocarte nunca con el color. Después lo practicas con la torre.',
      explanation: [
        {
          fen: fen('Ke1 ke8'),
          squares: ['h1', 'a8'],
          text: 'Mira la esquina de abajo a la derecha: la casilla h1 es clara. Para las negras, su esquina a la derecha es a8, y también es clara. Regla: la casilla de la esquina de cada jugador a su derecha es clara.',
        },
        {
          fen: fen('Ka1 ka8'),
          squares: ['d4', 'e4', 'd5', 'e5'],
          text: 'Desde una esquina, los colores se alternan. Así d4 es oscura, e4 es clara, d5 es clara y e5 es oscura. Las casillas que se tocan por una esquina tienen el mismo color.',
        },
      ],
      practice: [
        {
          fen: fen('Ra1 Kh3 ke8'),
          prompt: 'Juegan blancas. Mueve la torre a una casilla clara de la fila 1.',
          solutionUci: ['a1b1'],
          alt: ['a1d1', 'a1f1', 'a1h1'],
          hint: 'La casilla a1 es oscura. Las casillas se alternan: oscura, clara, oscura, clara.',
          explanationCorrect: 'Muy bien. En la fila 1 las casillas claras son b1, d1, f1 y h1. Cualquiera de las cuatro valía.',
          explanationWrong: 'Esa casilla es oscura o no está en la fila 1. Recuerda: la esquina de la derecha de cada jugador es clara, y los colores se alternan.',
          wrongByMove: {
            a1c1: 'La casilla c1 es oscura. Entre una casilla clara y otra clara siempre hay una oscura.',
          },
        },
        {
          fen: fen('Kc3 Rh1 ka5'),
          prompt: 'Mueve la torre a una casilla oscura de la columna h.',
          solutionUci: ['h1h2'],
          alt: ['h1h4', 'h1h6', 'h1h8'],
          hint: 'La casilla h1 es clara. Las casillas de la columna también se alternan.',
          explanationCorrect: 'Eso es. En la columna h las casillas oscuras son h2, h4, h6 y h8.',
          explanationWrong: 'Esa casilla es clara o no está en la columna h. Parte de h1, que es clara, y cuenta alternando colores.',
          wrongByMove: {
            h1h3: 'La casilla h3 es clara. Entre dos casillas claras hay una oscura.',
          },
        },
        {
          fen: fen('Kf2 rh8 kb6', 'b'),
          prompt: 'Juegan negras. Mueve la torre negra a una casilla clara de la fila 8.',
          solutionUci: ['h8g8'],
          alt: ['h8e8', 'h8c8', 'h8a8'],
          hint: 'La casilla h8 es oscura. La esquina de la derecha de las negras es clara.',
          explanationCorrect: 'Muy bien. En la fila 8 las casillas claras son a8, c8, e8 y g8.',
          explanationWrong: 'Esa casilla es oscura o no está en la fila 8. La esquina de la derecha de las negras es clara y los colores se alternan desde ella.',
          wrongByMove: {
            h8f8: 'La casilla f8 es oscura. Entre dos casillas claras de la fila 8 siempre hay una oscura.',
          },
        },
      ],
      evaluation: [
        {
          fen: fen('Kf1 Rh5 kb8'),
          prompt: 'Mueve la torre a una casilla oscura de la fila 5.',
          solutionUci: ['h5g5'],
          alt: ['h5e5', 'h5c5', 'h5a5'],
          explanationCorrect: 'Correcto. En la fila 5 las casillas oscuras son a5, c5, e5 y g5.',
          explanationWrong: 'Esa casilla es clara o no está en la fila 5. Piensa en el color de la casilla de la esquina y cuenta alternando.',
        },
        {
          fen: fen('Kg1 Rc1 kh5'),
          prompt: 'Mueve la torre a una casilla clara de la columna c.',
          solutionUci: ['c1c2'],
          alt: ['c1c4', 'c1c6', 'c1c8'],
          explanationCorrect: 'Muy bien. En la columna c las casillas claras son c2, c4, c6 y c8.',
          explanationWrong: 'Esa casilla es oscura o no está en la columna c. La casilla c1 es oscura, así que la siguiente es clara.',
        },
        {
          fen: fen('Kg1 kf8 rb8', 'b'),
          squares: ['b3'],
          prompt: 'Juegan negras. Lleva la torre a la casilla marcada. Después te decimos su color.',
          solutionUci: ['b8b3'],
          explanationCorrect: 'Muy bien. La casilla marcada es b3 y es clara. Se alternan: b1 clara, b2 oscura, b3 clara.',
          explanationWrong: 'Esa jugada no llega a la casilla marcada. Mira su columna y su fila, y baja hasta ella.',
        },
      ],
    },
    {
      id: 'u20.l03',
      unitId: 'u20',
      title: 'Diagonales',
      objective: 'Reconocer una diagonal por sus casillas y llegar a ella con una torre.',
      intro:
        'Una diagonal es un camino de casillas que se tocan por las esquinas. Más adelante la usarás mucho. Hoy aprendes a reconocerla.',
      explanation: [
        {
          fen: fen('Kh1 ka8'),
          squares: ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'],
          arrows: [['a1', 'h8']],
          text: 'Una diagonal une casillas del mismo color que se tocan por las esquinas. La más larga va de a1 a h8, con 8 casillas. En cada paso subes una fila y una columna a la vez.',
        },
        {
          fen: fen('Ka1 kh8'),
          squares: ['h1', 'g2', 'f3', 'e4', 'd5', 'c6', 'b7', 'a8'],
          arrows: [['h1', 'a8']],
          text: 'La otra diagonal larga va de h1 a a8. Hay muchas diagonales más cortas. Por ejemplo, la que va de c1 a h6 tiene 6 casillas: c1, d2, e3, f4, g5 y h6.',
        },
      ],
      practice: [
        {
          fen: fen('Kg3 Rd1 kf8'),
          prompt: 'Juegan blancas. Lleva la torre a una casilla de la diagonal que va de a1 a h8.',
          solutionUci: ['d1d4'],
          alt: ['d1a1'],
          hint: 'Esa diagonal sube una fila y una columna a la vez. Busca una casilla suya que esté en tu fila o en tu columna.',
          explanationCorrect: 'Muy bien. En esa diagonal la columna y la fila coinciden: d es la cuarta letra y la fila es la 4. La torre también llegaba a la esquina a1.',
          explanationWrong: 'Esa casilla no está en la diagonal. Piensa en cuántas columnas hay desde la a: la casilla debe estar a la misma cantidad de filas desde abajo.',
        },
        {
          fen: fen('Kc1 Rb3 kg8'),
          prompt: 'Lleva la torre a una casilla de la diagonal que va de h1 a a8.',
          solutionUci: ['b3b7'],
          alt: ['b3f3'],
          hint: 'Esa diagonal baja de a8 hacia h1. Busca casillas suyas en tu fila o en tu columna.',
          explanationCorrect: 'Eso es. La diagonal de h1 a a8 pasa por b7 y por f3, y la torre podía llegar a las dos.',
          explanationWrong: 'Esa casilla no está en la diagonal de h1 a a8. Esa diagonal pasa por una casilla de tu columna y otra de tu fila.',
        },
        {
          fen: fen('Kg1 Re8 ka5'),
          prompt: 'Lleva la torre a una casilla de la diagonal que va de c1 a h6.',
          solutionUci: ['e8e3'],
          hint: 'Esa diagonal sube desde c1 hacia h6. Busca la casilla suya que esté en tu columna.',
          explanationCorrect: 'Muy bien. La diagonal de c1 a h6 pasa por e3, que está en la columna de tu torre.',
          explanationWrong: 'Esa casilla no está en la diagonal de c1 a h6. Mira qué casilla de esa diagonal está en tu columna.',
        },
      ],
      evaluation: [
        {
          fen: fen('Ke3 Rh1 kb5'),
          prompt: 'Lleva la torre a una casilla de la diagonal que va de a1 a h8.',
          solutionUci: ['h1h8'],
          alt: ['h1a1'],
          explanationCorrect: 'Correcto. Las dos esquinas de la diagonal larga están al alcance de la torre.',
          explanationWrong: 'Esa casilla no está en la diagonal de a1 a h8. Esa diagonal empieza y acaba en dos esquinas.',
        },
        {
          fen: fen('Kb2 Re1 kg6'),
          prompt: 'Lleva la torre a una casilla de la diagonal que va de h1 a a8.',
          solutionUci: ['e1e4'],
          alt: ['e1h1'],
          explanationCorrect: 'Muy bien. La diagonal de h1 a a8 pasa por e4 y por h1, y la torre llegaba a las dos.',
          explanationWrong: 'Esa casilla no está en la diagonal de h1 a a8. Cuenta desde la esquina h1: en cada paso subes una fila y vas una columna a la izquierda.',
        },
        {
          fen: fen('Kg2 Rf1 kh5'),
          prompt: 'Lleva la torre a una casilla de la diagonal que va de a3 a f8.',
          solutionUci: ['f1f8'],
          explanationCorrect: 'Correcto. Esa diagonal tiene 6 casillas: a3, b4, c5, d6, e7 y f8. La torre llegó al final.',
          explanationWrong: 'Esa casilla no está en esa diagonal. Mira qué casilla de la diagonal está en tu columna.',
        },
      ],
    },
    {
      id: 'u20.l04',
      unitId: 'u20',
      title: 'La posición inicial',
      objective: 'Saber dónde empieza cada pieza y colocarla mentalmente con la regla del color.',
      intro:
        'Antes de jugar hay que saber cómo se coloca el tablero. Cada pieza tiene su sitio. Aquí lo aprendes y lo practicas con la torre.',
      explanation: [
        {
          fen: fen(`${BLANCAS} ${NEGRAS}`),
          squares: ['a1', 'h1', 'a8', 'h8'],
          text: 'Las blancas ocupan las filas 1 y 2, y las negras las filas 7 y 8. En la fila de atrás van, de izquierda a derecha: torre, caballo, alfil, dama, rey, alfil, caballo y torre. Las torres están en las esquinas.',
        },
        {
          fen: fen(`${BLANCAS} ${NEGRAS}`),
          squares: ['d1', 'e1', 'd8', 'e8'],
          text: 'La dama empieza en la casilla de su color: la dama blanca en d1, que es clara, y la negra en d8, que es oscura. El rey ocupa la casilla de al lado: e1 las blancas y e8 las negras. Los peones llenan las filas 2 y 7.',
        },
      ],
      practice: [
        {
          fen: fen(`Ra1 Rh1 Ke1 ${NEGRAS}`),
          prompt: 'Juegan blancas. La torre que empieza en h1 es la de la derecha. Llévala a la casilla h6.',
          solutionUci: ['h1h6'],
          hint: 'La torre sube por la columna h, que está libre.',
          explanationCorrect: 'Muy bien. La torre de h1 es la de la derecha. La de la izquierda empieza en a1.',
          explanationWrong: 'Esa jugada no lleva la torre a h6. La torre de la derecha está en h1: tiene que subir por su columna.',
          wrongByMove: {
            a1a6: 'Has movido la otra torre, la de a1. La que debes mover empieza en h1.',
          },
        },
        {
          fen: fen(`${BLANCAS} ra8 ke8 rh8`, 'b'),
          prompt: 'Juegan negras. Mueve la torre negra que empieza en a8 hasta la casilla a3.',
          solutionUci: ['a8a3'],
          hint: 'Las negras avanzan hacia abajo. Esa torre baja por la columna a.',
          explanationCorrect: 'Eso es. La torre baja por la columna a hasta la fila 3, justo delante del peón blanco.',
          explanationWrong: 'Esa jugada no lleva la torre a a3. La torre de a8 baja por su columna, hacia la fila 1.',
          wrongByMove: {
            h8h3: 'Has movido la torre de la derecha, la de h8. La que debes mover empieza en a8.',
          },
        },
        {
          fen: fen(`Ra1 Ke1 ${NEGRAS}`),
          prompt: 'La dama blanca empieza en d1, la casilla clara de la fila 1. Lleva la torre de a1 a esa casilla.',
          solutionUci: ['a1d1'],
          hint: 'La torre va por la fila 1 hacia la derecha. El camino está libre.',
          explanationCorrect: 'Muy bien. La casilla d1 es la de la dama blanca: la dama siempre empieza en la casilla de su color.',
          explanationWrong: 'Esa jugada no llega a d1. La torre se mueve por la fila 1, hacia la derecha, hasta la cuarta columna.',
          wrongByMove: {
            a1c1: 'Te has quedado una columna antes. La casilla de la dama es la que está justo al lado del rey.',
          },
        },
      ],
      evaluation: [
        {
          fen: fen(`${BLANCAS} ra8 ke8`, 'b'),
          prompt: 'Juegan negras. La dama negra empieza en d8. Lleva la torre negra de a8 a esa casilla.',
          solutionUci: ['a8d8'],
          explanationCorrect: 'Correcto. La dama negra empieza en d8, que es una casilla oscura: la dama busca su color.',
          explanationWrong: 'Esa jugada no llega a d8. La torre se mueve por la fila 8, hacia la derecha, hasta justo antes del rey.',
        },
        {
          fen: fen(`Rh1 Ke1 ${NEGRAS}`),
          prompt: 'El alfil blanco que está junto al rey empieza en f1. Lleva la torre de h1 a esa casilla.',
          solutionUci: ['h1f1'],
          explanationCorrect: 'Muy bien. El alfil de rey empieza en f1, al lado del rey y de un caballo. Allí hay un hueco para la torre.',
          explanationWrong: 'Esa jugada no llega a f1. La torre se mueve por la fila 1, hacia la izquierda, dos casillas.',
        },
        {
          fen: fen(`Ra1 Kg1 ${NEGRAS}`),
          prompt: 'El rey blanco empieza en e1. Lleva la torre de a1 a esa casilla.',
          solutionUci: ['a1e1'],
          explanationCorrect: 'Correcto. El rey blanco empieza en e1, una casilla oscura, justo a la derecha de la dama.',
          explanationWrong: 'Esa jugada no llega a e1. La torre se mueve por la fila 1, hacia la derecha, hasta la quinta columna.',
        },
      ],
    },
  ],
};
