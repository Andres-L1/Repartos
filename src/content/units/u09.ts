import type { Unit } from '../schema.js';

/**
 * Unidad 9 · Patrones de mate (básico, 800-1100 Elo).
 * Pendiente de validación de profesores. Cada ejercicio se verifica por código (test/content/unitsC.test.ts):
 * mate en 1 único, o mate en 2 forzado con una sola primera jugada que lo consigue.
 */
export const unit: Unit = {
  id: 'u09',
  order: 9,
  title: 'Patrones de mate',
  description:
    'Mates que se repiten en las partidas: el mate del pasillo con sacrificio, el mate de la coz y los mates de dama apoyada por alfil o caballo. Aprenderás a calcular mates en dos jugadas.',
  level: 'basic',
  requires: ['u08'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u09.l01',
      unitId: 'u09',
      title: 'El mate del pasillo con sacrificio',
      objective:
        'Ver cuándo la última fila del rival solo la defiende una pieza y quitarla con un sacrificio para dar mate en dos.',
      conceptIds: ['tactics.mate_threat'],
      intro:
        'Ya conoces el mate del pasillo: el rey está encerrado detrás de sus peones y una torre o la dama le da jaque en la última fila. Muchas veces el rival tiene una pieza que defiende esa fila. Si atacas la fila con dos piezas y él solo la defiende con una, puedes entregar la primera: al capturarla, la defensa desaparece y la segunda pieza da mate.',
      explanation: [
        {
          fen: '2r3k1/5ppp/8/8/8/8/3Q1PPP/3R2K1 w - - 0 1',
          text: 'La dama y la torre están en la columna d. La torre negra de c8 defiende la octava fila. Qd8+ obliga a Rxd8 (el rey no tiene casillas), y entonces la torre captura en d8 y da mate: Rxd8#. Dos atacantes contra un defensor en la última fila es la señal.',
          squares: ['d8', 'c8'],
          arrows: [
            ['d2', 'd8'],
            ['d1', 'd8'],
          ],
        },
        {
          fen: '3qr1k1/5ppp/8/8/4R3/8/4QPPP/6K1 w - - 0 1',
          text: 'Otra forma: la torre de e8 está defendida solo por la dama de d8. Rxe8+ Qxe8 y la dama blanca, que estaba detrás, captura en e8 con mate: Qxe8#. Cuenta siempre cuántas piezas atacan la última fila y cuántas la defienden.',
          squares: ['e8'],
          arrows: [
            ['e4', 'e8'],
            ['e2', 'e8'],
            ['d8', 'e8'],
          ],
        },
      ],
      practice: [
        {
          fen: '2r3k1/5ppp/8/8/8/8/3Q1PPP/3R2K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['d2d8', 'c8d8', 'd1d8'],
          hint: 'Entrega la dama en la octava fila; la torre viene detrás.',
          explanationCorrect:
            'Correcto: Qd8+ Rxd8 Rxd8#. La única defensa de la octava fila era la torre de c8 y desapareció al capturar la dama.',
          explanationWrong:
            'Esa jugada da tiempo a negras. Busca el sacrificio en la octava fila que obliga a capturar.',
        },
        {
          fen: '3r2k1/3q1ppp/8/8/8/8/5PPP/2R3K1 b - - 0 1',
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['d7d1', 'c1d1', 'd8d1'],
          hint: 'La primera fila blanca solo la defiende la torre de c1.',
          explanationCorrect:
            'Correcto: Qd1+ Rxd1 Rxd1#. Al capturar la dama, la torre blanca deja de defender la primera fila.',
          explanationWrong:
            'No era esa. Entrega la dama en una casilla que la torre blanca tenga que capturar: así deja la primera fila y tu torre da mate.',
        },
        {
          fen: '3qr1k1/5ppp/8/8/4R3/8/4QPPP/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['e4e8', 'd8e8', 'e2e8'],
          hint: 'La torre negra de la última fila solo la defiende la dama.',
          explanationCorrect:
            'Correcto: Rxe8+ Qxe8 Qxe8#. Torre y dama atacan e8 dos veces y solo la defendía la dama negra.',
          explanationWrong:
            'Esa jugada no fuerza nada. Busca una captura con jaque en la última fila rival que obligue a la dama a recapturar.',
        },
      ],
      evaluation: [
        {
          fen: '1r5k/6pp/8/8/8/4Q3/5PPP/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['e3e8', 'b8e8', 'e1e8'],
          hint: 'La dama y la torre están en la columna e; la octava fila solo la defiende la torre de b8.',
          explanationCorrect:
            'Correcto: Qe8+ Rxe8 Rxe8#. Al capturar la dama, la torre negra abandona su defensa y la tuya da mate.',
          explanationWrong:
            'No era esa. Entrega la dama en la octava fila: la torre negra tiene que capturarla.',
        },
        {
          fen: '4r1k1/5ppp/4q3/8/8/8/6PP/R6K b - - 0 1',
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['e6e1', 'a1e1', 'e8e1'],
          hint: 'La primera fila blanca solo la defiende la torre de a1.',
          explanationCorrect:
            'Correcto: Qe1+ Rxe1 Rxe1#. La torre blanca tuvo que capturar y la primera fila quedó sin defensa.',
          explanationWrong:
            'Esa jugada no fuerza el mate. Piensa en entregar la dama con jaque para desviar a la torre blanca de la primera fila.',
        },
        {
          fen: '1q2r1k1/5ppp/8/8/8/8/4RPPP/4Q1K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['e2e8', 'b8e8', 'e1e8'],
          hint: 'Cuenta: dos piezas blancas atacan la torre negra de la última fila y solo una negra la defiende.',
          explanationCorrect:
            'Correcto: Rxe8+ Qxe8 Qxe8#. La dama negra era la única defensa de e8.',
          explanationWrong:
            'No era esa. Empieza capturando con la torre: tras la recaptura, tu dama da mate.',
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u09.l02',
      unitId: 'u09',
      title: 'El mate de la coz',
      objective:
        'Reconocer el mate de caballo contra un rey rodeado de sus propias piezas y prepararlo con un sacrificio de dama.',
      conceptIds: ['tactics.mate_threat'],
      intro:
        'El mate de la coz (o mate ahogado) lo da un caballo a un rey que no puede moverse porque sus propias piezas le quitan todas las casillas. Suele ocurrir con el rey en la esquina. A veces falta una casilla por tapar: entonces se entrega la dama justo al lado del rey para que una torre la capture y cierre la última salida.',
      explanation: [
        {
          fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
          text: 'El rey de h8 está rodeado por su torre de g8 y sus peones de g7 y h7. Si el caballo salta a f7, da jaque y nada puede taparlo ni capturarlo. Es mate de la coz: Nf7#.',
          squares: ['h8', 'g8', 'g7', 'h7'],
          arrows: [['g5', 'f7']],
        },
        {
          fen: '5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1',
          text: 'Aquí la casilla g8 está libre. La dama se entrega en g8 con jaque: el rey no puede capturarla porque la defiende el caballo de h6, así que la torre la captura (Rxg8). Ahora el rey está encerrado y el caballo da mate en f7. Este sacrificio se llama mate de Philidor.',
          squares: ['g8', 'f7'],
          arrows: [
            ['d5', 'g8'],
            ['h6', 'f7'],
          ],
        },
      ],
      practice: [
        {
          fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en una jugada.',
          solutionUci: ['g5f7'],
          hint: 'El rey negro está rodeado por sus propias piezas.',
          explanationCorrect:
            'Correcto: Nf7#. El rey no tiene casillas porque sus piezas se las quitan, y el jaque del caballo no se puede tapar.',
          explanationWrong:
            'No es mate. Busca el salto del caballo que da jaque al rey de h8.',
        },
        {
          fen: '5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['d5g8', 'f8g8', 'h6f7'],
          hint: 'Entrega la dama al lado del rey, en una casilla que defiende el caballo.',
          explanationCorrect:
            'Correcto: Qg8+ Rxg8 Nf7#. La torre cerró la última salida del rey al capturar la dama.',
          explanationWrong:
            'Así no es mate en dos. Hay que forzar a una pieza negra a ocupar la última casilla de escape del rey.',
          wrongByMove: {
            h6f7: 'El caballo da jaque, pero la torre negra lo captura.',
          },
        },
        {
          fen: '6k1/8/8/8/6n1/8/6PP/6RK b - - 0 1',
          prompt: 'Juegan negras. Mate en una jugada.',
          solutionUci: ['g4f2'],
          hint: 'El rey blanco está encerrado por su torre y sus peones.',
          explanationCorrect:
            'Correcto: Nf2#. El rey de h1 no tiene casillas y el jaque del caballo no se puede tapar.',
          explanationWrong:
            'No es mate. Busca el salto que da jaque al rey de h1.',
        },
      ],
      evaluation: [
        {
          fen: '6k1/8/8/8/3q4/7n/6PP/5R1K b - - 0 1',
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['d4g1', 'f1g1', 'h3f2'],
          hint: 'Entrega la dama en una casilla al lado del rey que defiende tu caballo.',
          explanationCorrect:
            'Correcto: Qg1+ Rxg1 Nf2#. La torre blanca ocupó g1 al capturar y el rey quedó encerrado.',
          explanationWrong:
            'Así no es mate en dos. Hay que forzar a una pieza blanca a ocupar la última casilla de escape del rey.',
          wrongByMove: {
            h3f2: 'El caballo da jaque, pero la torre blanca lo captura.',
          },
        },
        {
          fen: 'kr6/pp6/8/3N4/8/8/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en una jugada.',
          solutionUci: ['d5c7'],
          hint: 'El rey de a8 está encerrado por su torre y sus peones.',
          explanationCorrect:
            'Correcto: Nc7#. Mate de la coz en la otra esquina: el rey no tiene casillas y nada puede capturar el caballo.',
          explanationWrong:
            'No es mate. Busca el salto que da jaque al rey de a8 desde una casilla que ninguna pieza negra controla.',
        },
        {
          fen: '4r2k/6pp/7N/8/2Q5/8/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['c4g8', 'e8g8', 'h6f7'],
          hint: 'Mira qué casillas defiende tu caballo: allí puedes entregar la dama.',
          explanationCorrect:
            'Correcto: Qg8+ Rxg8 Nf7#. El mismo patrón desde otra casilla: la dama se entrega en g8 y el caballo remata.',
          explanationWrong:
            'No era esa. Entrega la dama donde tu caballo la defiende, para que la torre la capture y cierre la salida del rey.',
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u09.l03',
      unitId: 'u09',
      title: 'La dama apoyada por alfil o caballo',
      objective:
        'Dar mate con la dama pegada al rey enroscado cuando un alfil o un caballo defiende esa casilla.',
      conceptIds: ['tactics.mate_threat'],
      intro:
        'La dama sola no puede dar mate pegada al rey, porque el rey la captura. Pero si otra pieza defiende esa casilla, la dama se coloca al lado del rey y le quita casi todas sus salidas. Los casos más frecuentes en el enroque son h7, g7 y g2, apoyados por un alfil en la diagonal o por un caballo.',
      explanation: [
        {
          fen: '5rk1/5ppp/8/7Q/8/3B4/8/6K1 w - - 0 1',
          text: 'El alfil de d3 apunta a h7. La dama captura en h7 con jaque y el rey no puede capturarla porque el alfil la defiende. La torre de f8 le quita la única salida. Es mate: Qxh7#.',
          squares: ['h7'],
          arrows: [
            ['d3', 'h7'],
            ['h5', 'h7'],
          ],
        },
        {
          fen: '6k1/5p1p/8/5N2/8/8/8/3Q2K1 w - - 0 1',
          text: 'El caballo de f5 controla g7. Si la dama llega a g7, da jaque pegada al rey, el caballo la defiende y la dama además controla f8 y h8. Siempre que una pieza menor defienda la casilla vecina al rey, busca cómo llevar la dama allí.',
          squares: ['g7', 'f8', 'h8'],
          arrows: [['f5', 'g7']],
        },
      ],
      practice: [
        {
          fen: '5rk1/5ppp/8/7Q/8/3B4/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en una jugada.',
          solutionUci: ['h5h7'],
          hint: 'El alfil de d3 defiende una casilla al lado del rey.',
          explanationCorrect:
            'Correcto: Qxh7#. La dama está defendida por el alfil, el rey no puede capturarla y no tiene casillas libres.',
          explanationWrong:
            'No es mate. Busca la casilla pegada al rey que defiende tu alfil.',
          wrongByMove: {
            h5f7: 'Qxf7+ es jaque, pero la torre de f8 captura la dama (Rxf7).',
          },
        },
        {
          fen: '4r1k1/5p1p/8/5N2/3Q4/8/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en una jugada.',
          solutionUci: ['d4g7'],
          hint: 'El caballo de f5 defiende una casilla al lado del rey.',
          explanationCorrect:
            'Correcto: Qg7#. El caballo defiende la dama y la dama controla f8 y h8. El rey no tiene salida.',
          explanationWrong:
            'No es mate. Lleva la dama a la casilla que defiende tu caballo.',
        },
        {
          fen: '6k1/1b6/8/6q1/8/8/5PPP/4R1K1 b - - 0 1',
          prompt: 'Juegan negras. Mate en una jugada.',
          solutionUci: ['g5g2'],
          hint: 'Tu alfil apunta a la casilla del rey rival por la gran diagonal.',
          explanationCorrect:
            'Correcto: Qxg2#. El alfil defiende la dama y el rey blanco no tiene casillas.',
          explanationWrong:
            'No es mate. Captura con la dama en una casilla que tu alfil defienda.',
        },
      ],
      evaluation: [
        {
          fen: '5rk1/5pp1/8/6N1/8/3Q4/8/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en una jugada.',
          solutionUci: ['d3h7'],
          hint: 'El caballo de g5 defiende una casilla al lado del rey.',
          explanationCorrect:
            'Correcto: Qh7#. El caballo defiende la dama, la torre de f8 tapa la salida y h8 lo controla la dama.',
          explanationWrong:
            'No es mate. Busca la casilla pegada al rey que defiende tu caballo.',
        },
        {
          fen: '6k1/8/8/8/6nq/8/5PP1/5RK1 b - - 0 1',
          prompt: 'Juegan negras. Mate en una jugada.',
          solutionUci: ['h4h2'],
          hint: 'Tu caballo de g4 defiende una casilla al lado del rey blanco.',
          explanationCorrect:
            'Correcto: Qh2#. El caballo defiende la dama, la torre de f1 tapa la salida del rey y no hay defensa.',
          explanationWrong:
            'No es mate. Lleva la dama a la casilla que defiende tu caballo.',
        },
        {
          fen: '6k1/5p1p/6pQ/8/8/8/1B6/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en una jugada.',
          solutionUci: ['h6g7'],
          hint: 'Tu alfil apunta al enroque rival por la gran diagonal.',
          explanationCorrect:
            'Correcto: Qg7#. El alfil defiende la dama y la dama controla f8 y h8.',
          explanationWrong:
            'No es mate. Busca la casilla que tu alfil defiende y lleva allí la dama.',
        },
      ],
    },
  ],
};
