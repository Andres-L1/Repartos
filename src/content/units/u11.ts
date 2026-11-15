import type { Unit } from '../schema.js';

/**
 * Unidad 11 · Cálculo: atracción, jugada intermedia y mates en tres (avanzado, 1400-1700 Elo).
 * Pendiente de validación de profesores. Las líneas son de 3 a 5 medias jugadas: se verifican con Stockfish 16 a
 * profundidad 18 (scripts/verify-fase4.mts: cada jugada del alumno es la mejor y única, las del rival son su mejor
 * defensa o equivalentes, y los mates son forzados) y por código en test/content/unitsD.test.ts (legalidad, mate real
 * y, en las líneas largas sin mate, que el alumno termina con al menos dos peones más de material).
 */
export const unit: Unit = {
  id: 'u11',
  order: 11,
  title: 'Cálculo: atracción, jugada intermedia y mates en tres',
  description:
    'Combinaciones de varias jugadas: atraer al rey o a una pieza a una casilla mala con un sacrificio, intercalar una jugada forzante antes de recapturar y calcular mates en tres jugadas hasta el final.',
  level: 'advanced',
  requires: ['u10'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u11.l01',
      unitId: 'u11',
      title: 'La atracción',
      objective:
        'Sacrificar material para obligar al rey o a una pieza a ocupar una casilla donde sufre una horquilla o un mate.',
      conceptIds: ['tactics.attraction'],
      intro:
        'En la atracción ofreces una pieza que el rival está obligado a capturar, normalmente porque es jaque y no hay otra respuesta. La pieza que captura queda en una casilla mala: el rey en el radio de una horquilla de caballo, o una torre que tapa la última salida de su propio rey. Antes de sacrificar, calcula la línea completa: cada jugada del rival debe ser forzada y al final tienes que recuperar más de lo que entregaste.',
      explanation: [
        {
          fen: '6k1/1p4pp/pqn5/4N3/8/6B1/PP4PP/5R1K w - - 0 1',
          text: 'El caballo de e5 llegaría a d7, desde donde ataca b6 (la dama) y f8. Si el rey estuviera en f8, Nd7+ sería horquilla. Rf8+ lo lleva allí: el rey no puede ir a h8 (sigue en la octava fila) y tiene que capturar, Kxf8. Después, Nd7+ y Nxb6: entregas la torre y ganas la dama.',
          squares: ['f8', 'd7', 'b6'],
          arrows: [
            ['f1', 'f8'],
            ['e5', 'd7'],
          ],
        },
        {
          fen: '5r1k/p5pp/7N/3Q4/8/8/Pq3PPP/6K1 w - - 0 1',
          text: 'Aquí la atracción prepara el mate de la coz. Qg8+ no se puede capturar con el rey porque el caballo de h6 protege g8; la torre tiene que capturar, Rxg8, y queda tapando la única casilla libre del rey. Nf7 es mate: el rey está encerrado por sus propias piezas.',
          squares: ['g8', 'f7'],
          arrows: [
            ['d5', 'g8'],
            ['h6', 'f7'],
          ],
        },
      ],
      practice: [
        {
          fen: '6k1/1p4pp/pqn5/4N3/8/6B1/PP4PP/5R1K w - - 0 1',
          prompt: 'Juegan blancas. Gana la dama negra con un sacrificio que atrae al rey.',
          solutionUci: ['f1f8', 'g8f8', 'e5d7', 'f8f7', 'd7b6'],
          hint: 'Desde d7 el caballo atacaría a la vez f8 y b6. ¿Cómo llevas al rey a f8?',
          explanationCorrect:
            'Correcto: Rf8+ Kxf8 Nd7+ y Nxb6. Diste una torre y ganaste la dama: el rey tuvo que ir a la casilla de la horquilla.',
          explanationWrong:
            'Esa jugada no lleva al rey a f8. Con Rf8+ el rey está obligado a capturar y después el caballo hace horquilla en d7.',
          wrongByMove: {
            e5d7: 'Nd7 ataca la dama, pero sin jaque: la dama se aparta y no ganas nada.',
          },
        },
        {
          fen: '5r1k/pp4pp/6b1/8/4n3/PQN5/1P4PP/6K1 b - - 0 1',
          prompt: 'Juegan negras. Gana la dama blanca con un sacrificio que atrae al rey.',
          solutionUci: ['f8f1', 'g1f1', 'e4d2', 'f1e2', 'd2b3'],
          hint: 'Desde d2 el caballo atacaría a la vez f1 y b3. ¿Cómo llevas al rey a f1?',
          explanationCorrect:
            'Correcto: Rf1+ Kxf1 Nd2+ y Nxb3. El rey tuvo que capturar y quedó al alcance de la horquilla.',
          explanationWrong:
            'Esa jugada no lleva al rey a f1. Con Rf1+ el rey está obligado a capturar y después el caballo hace horquilla en d2.',
          wrongByMove: {
            e4d2: 'Nd2 ataca la dama, pero sin jaque: la dama se aparta y no ganas nada.',
          },
        },
        {
          fen: '5r1k/p5pp/7N/3Q4/8/8/Pq3PPP/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en dos jugadas.',
          solutionUci: ['d5g8', 'f8g8', 'h6f7'],
          hint: 'Si una torre negra estuviera en g8, el rey no tendría ninguna casilla libre.',
          explanationCorrect:
            'Correcto: Qg8+ Rxg8 Nf7#. La torre fue atraída a g8 y encerró a su propio rey: mate de la coz.',
          explanationWrong:
            'Esa jugada no da mate en dos. Ofrece la dama en g8: el rey no puede capturarla y la torre, al hacerlo, encierra a su rey.',
          wrongByMove: {
            h6f7: 'Nf7+ Rxf7: la torre de f8 captura el caballo.',
          },
        },
      ],
      evaluation: [
        {
          fen: '6k1/pQ3ppp/8/8/3q4/7n/P5PP/5R1K b - - 0 1',
          prompt: 'Juegan negras. Mate en dos jugadas.',
          solutionUci: ['d4g1', 'f1g1', 'h3f2'],
          hint: 'Si una torre blanca estuviera en g1, el rey no tendría ninguna casilla libre.',
          explanationCorrect:
            'Correcto: Qg1+ Rxg1 Nf2#. El rey no puede capturar en g1 porque el caballo de h3 la protege; la torre captura y encierra a su rey.',
          explanationWrong:
            'Esa jugada no da mate en dos. Ofrece la dama en g1: solo la torre puede capturarla y así encierra a su propio rey.',
        },
        {
          fen: '6k1/ppq3pp/2n5/6N1/8/8/PP4PP/2B2R1K w - - 0 1',
          prompt: 'Juegan blancas. Gana la dama negra.',
          solutionUci: ['f1f8', 'g8f8', 'g5e6', 'f8e7', 'e6c7'],
          hint: 'Desde e6 el caballo atacaría a la vez f8 y c7.',
          explanationCorrect:
            'Correcto: Rf8+ Kxf8 Ne6+ y Nxc7. El rey tuvo que capturar la torre y quedó en el radio de la horquilla.',
          explanationWrong:
            'Esa jugada no gana la dama. Atrae al rey a f8 con un jaque: desde e6 el caballo atacará al rey y a la dama.',
          wrongByMove: {
            g5e6: 'Ne6 ataca la dama, pero sin jaque: la dama se aparta y no ganas nada.',
          },
        },
        {
          fen: '3r2k1/pp3ppp/8/8/6n1/1Q6/PP2P1PP/7K b - - 0 1',
          prompt: 'Juegan negras. Gana la dama blanca.',
          solutionUci: ['d8d1', 'b3d1', 'g4f2', 'h1g1', 'f2d1'],
          hint: 'Desde f2 el caballo daría jaque al rey de h1 y atacaría d1.',
          explanationCorrect:
            'Correcto: Rd1+ Qxd1 Nf2+ y Nxd1. La dama tuvo que capturar la torre y quedó en la horquilla del caballo.',
          explanationWrong:
            'Esa jugada no gana la dama. Un jaque en d1 obliga a la dama a capturar; después el caballo salta a f2 con jaque.',
          wrongByMove: {
            g4f2: 'Nf2+ es jaque, pero tras Kg1 la dama blanca está en b3 y el caballo no la ataca.',
          },
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u11.l02',
      unitId: 'u11',
      title: 'La jugada intermedia',
      objective:
        'Antes de hacer la recaptura que todos esperan, buscar un jaque o una captura forzante que gane material extra.',
      conceptIds: ['tactics.intermezzo'],
      intro:
        'Cuando el rival captura una pieza, la reacción automática es recapturar. Un jugador fuerte se pregunta antes: ¿tengo algo mejor? Una jugada intermedia es un jaque o una amenaza que el rival tiene que atender ya. Después haces la recaptura, que no se ha escapado, y te quedas con lo que ganaste en medio. Funciona cuando la pieza que vas a recapturar no puede huir ni defenderse mientras tanto.',
      explanation: [
        {
          fen: '4r1k1/pp3pp1/7p/8/8/5N2/PP1q1PPP/4R1K1 w - - 0 1',
          text: 'Las negras acaban de capturar tu dama en d2. Si recapturas ya (Nxd2), la torre negra captura la tuya con jaque (Rxe1+) y sales perdiendo material. En cambio, Rxe8+ captura primero la torre con jaque; tras Kh7, Nxd2 recupera la dama. Has ganado una torre entera.',
          squares: ['e8', 'd2'],
          arrows: [
            ['e1', 'e8'],
            ['f3', 'd2'],
          ],
        },
        {
          fen: '7k/pp3rpp/8/6N1/8/8/PP2qPPP/4R1K1 w - - 0 1',
          text: 'La dama negra acaba de capturar en e2. Antes de Rxe2, el caballo captura la torre de f7 con jaque: Nxf7+. Las negras tienen que mover el rey y la dama de e2 sigue sin poder escapar.',
          squares: ['f7', 'e2'],
          arrows: [
            ['g5', 'f7'],
            ['e1', 'e2'],
          ],
        },
      ],
      practice: [
        {
          fen: '4r1k1/pp3pp1/7p/8/8/5N2/PP1q1PPP/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. Las negras acaban de capturar tu dama en d2. Recupérala ganando además material.',
          solutionUci: ['e1e8', 'g8h7', 'f3d2'],
          hint: 'Antes de recapturar, mira si puedes capturar algo con jaque.',
          explanationCorrect:
            'Correcto: Rxe8+ Kh7 Nxd2. El jaque no dejó tiempo a las negras y la dama de d2 seguía sin escapatoria: ganas una torre.',
          explanationWrong:
            'Esa jugada no gana nada extra. Primero Rxe8+, con jaque, y después recuperas la dama.',
          wrongByMove: {
            f3d2: 'Nxd2 recupera la dama, pero Rxe1+ captura tu torre con jaque y sales perdiendo material. Antes había una jugada intermedia.',
          },
        },
        {
          fen: '3rn1k1/ppQ2ppp/8/8/8/7P/PP3PP1/3R2K1 b - - 0 1',
          prompt: 'Juegan negras. Las blancas acaban de capturar tu dama en c7. Recupérala ganando además material.',
          solutionUci: ['d8d1', 'g1h2', 'e8c7'],
          hint: 'Antes de recapturar, mira si puedes capturar algo con jaque.',
          explanationCorrect:
            'Correcto: Rxd1+ Kh2 Nxc7. Primero la torre con jaque y después la dama, que no podía escapar.',
          explanationWrong:
            'Esa jugada no gana nada extra. Primero Rxd1+, con jaque, y después recuperas la dama con el caballo.',
          wrongByMove: {
            e8c7: 'Nxc7 recupera la dama, pero Rxd8+ Ne8 Rxe8# es mate: tu torre de d8 se quedó sin defensa en la última fila.',
          },
        },
        {
          fen: '7k/pp3rpp/8/6N1/8/8/PP2qPPP/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. La dama negra acaba de capturar en e2. Encuentra la jugada intermedia.',
          solutionUci: ['g5f7'],
          hint: 'Un jaque que además capture una pieza.',
          explanationCorrect:
            'Correcto: Nxf7+. Tras mover el rey, Rxe2 recupera la dama: has ganado la torre de f7 por el camino.',
          explanationWrong:
            'Esa jugada no es la intermedia. Nxf7+ captura la torre con jaque y la dama de e2 sigue a tu alcance.',
          wrongByMove: {
            e1e2: 'Rxe2 recupera la dama, pero pierdes la ocasión de capturar antes la torre de f7 con jaque.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4r1k1/pp2Qppp/8/8/6n1/8/PP3RPP/7K b - - 0 1',
          prompt: 'Juegan negras. Las blancas acaban de capturar tu dama en e7. Encuentra la jugada intermedia.',
          solutionUci: ['g4f2'],
          hint: 'El caballo tiene una captura con jaque.',
          explanationCorrect:
            'Correcto: Nxf2+. Tras Kg1, Rxe7 recupera la dama: el caballo ganó la torre de f2 por el camino.',
          explanationWrong:
            'Esa jugada no es la intermedia. Primero Nxf2+, con jaque, y después Rxe7.',
          wrongByMove: {
            e8e7: 'Rxe7 recupera la dama, pero te pierdes la torre de f2: Nxf2+ era la jugada intermedia.',
          },
        },
        {
          fen: 'k7/ppr3pp/8/1N6/8/8/PPPq2PP/1K1R4 w - - 0 1',
          prompt: 'Juegan blancas. La dama negra acaba de capturar en d2. Encuentra la jugada intermedia.',
          solutionUci: ['b5c7'],
          hint: 'Un jaque que además capture una pieza.',
          explanationCorrect:
            'Correcto: Nxc7+. Tras mover el rey, Rxd2 recupera la dama: has ganado la torre de c7 por el camino.',
          explanationWrong:
            'Esa jugada no es la intermedia. Nxc7+ captura la torre con jaque y la dama de d2 sigue a tu alcance.',
          wrongByMove: {
            d1d2: 'Rxd2 recupera la dama, pero pierdes la ocasión de capturar antes la torre de c7 con jaque.',
          },
        },
        {
          fen: '4r1k1/3n1ppp/pQ6/8/8/7P/PP3PP1/4R1K1 b - - 0 1',
          prompt: 'Juegan negras. Las blancas acaban de capturar tu dama en b6. Recupérala ganando además material.',
          solutionUci: ['e8e1', 'g1h2', 'd7b6'],
          hint: 'Antes de recapturar, mira si puedes capturar algo con jaque.',
          explanationCorrect:
            'Correcto: Rxe1+ Kh2 Nxb6. La torre capturó con jaque y el caballo recuperó la dama.',
          explanationWrong:
            'Esa jugada no gana nada extra. Primero Rxe1+, con jaque, y después Nxb6.',
          wrongByMove: {
            d7b6: 'Nxb6 recupera la dama, pero Rxe8# es mate: tu torre de e8 se quedó sin defensa en la última fila.',
          },
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u11.l03',
      unitId: 'u11',
      title: 'Mates en tres jugadas',
      objective:
        'Calcular una línea forzada de tres jugadas hasta el mate, comprobando todas las respuestas del rival.',
      conceptIds: ['tactics.mate_threat'],
      intro:
        'Para dar mate en tres hay que ver la posición final antes de mover. El método: empieza por las jugadas más forzantes (jaques, capturas, amenazas de mate), y para cada una cuenta todas las respuestas del rival. Si alguna escapa, la línea no sirve. Los sacrificios de dama y torre son normales en estos mates: lo que importa es que el rey no tenga salida al final.',
      explanation: [
        {
          fen: '5rk1/pp3Npp/1q6/8/2Q5/8/PP4PP/7K w - - 0 1',
          text: 'Nh6+ es jaque doble: el caballo y la dama de c4, que se ha destapado, dan jaque a la vez, y ante un jaque doble solo vale mover el rey. Kh8 es forzado (f7 está atacada). Qg8+ no se puede capturar con el rey porque el caballo protege g8: Rxg8 y Nf7#.',
          squares: ['h6', 'g8', 'f7'],
          arrows: [
            ['f7', 'h6'],
            ['c4', 'g8'],
          ],
        },
        {
          fen: '5rk1/p4p1p/1q4p1/7Q/8/5R2/PB4PP/7K w - - 0 1',
          text: 'El alfil de b2 controla g7 y h8. Qxh7+ Kxh7 abre la columna h; Rh3+ obliga a Kg8, y Rh8 es mate porque el alfil protege la torre y el rey no tiene casillas.',
          squares: ['h7', 'h8', 'g7'],
          arrows: [
            ['h5', 'h7'],
            ['f3', 'h3'],
            ['b2', 'h8'],
          ],
        },
      ],
      practice: [
        {
          fen: '5rk1/pp3Npp/1q6/8/2Q5/8/PP4PP/7K w - - 0 1',
          prompt: 'Juegan blancas. Mate en tres jugadas.',
          solutionUci: ['f7h6', 'g8h8', 'c4g8', 'f8g8', 'h6f7'],
          hint: 'Empieza con un jaque doble.',
          explanationCorrect:
            'Correcto: Nh6+ Kh8 Qg8+ Rxg8 Nf7#. Jaque doble, sacrificio de dama y mate de la coz.',
          explanationWrong:
            'Esa jugada no da mate en tres. El caballo puede dar un jaque doble que deja al rey una sola casilla.',
        },
        {
          fen: '6k1/p4ppp/2Q5/3r4/3n3q/8/PP3PPP/5RK1 b - - 0 1',
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['d4e2', 'g1h1', 'h4h2', 'h1h2', 'd5h5'],
          hint: 'El caballo en e2 quitaría al rey las casillas g1 y g3.',
          explanationCorrect:
            'Correcto: Ne2+ Kh1 Qxh2+ Kxh2 Rh5#. El caballo de e2 cubre g1 y g3, y la torre da mate por la columna h.',
          explanationWrong:
            'Esa jugada no da mate en tres. Empieza con un jaque de caballo que cubra g1 y g3.',
          wrongByMove: {
            h4h2: 'Qxh2+ Kxh2 Rh5+ Kg1: sin el caballo en e2, el rey escapa por g1.',
          },
        },
        {
          fen: '5rk1/p4p1p/1q4p1/7Q/8/5R2/PB4PP/7K w - - 0 1',
          prompt: 'Juegan blancas. Mate en tres jugadas.',
          solutionUci: ['h5h7', 'g8h7', 'f3h3', 'h7g8', 'h3h8'],
          hint: 'Abre la columna h para la torre; el alfil de b2 ya controla g7 y h8.',
          explanationCorrect:
            'Correcto: Qxh7+ Kxh7 Rh3+ Kg8 Rh8#. El alfil protege la torre en h8 y cubre g7.',
          explanationWrong:
            'Esa jugada no da mate en tres. Sacrifica la dama en h7 para abrir la columna h.',
        },
      ],
      evaluation: [
        {
          fen: 'r5k1/pp4pp/1q6/8/Q7/8/PP3nPP/5RK1 b - - 0 1',
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['f2h3', 'g1h1', 'b6g1', 'f1g1', 'h3f2'],
          hint: 'Si el caballo se mueve, la dama de b6 da jaque por la diagonal.',
          explanationCorrect:
            'Correcto: Nh3+ Kh1 Qg1+ Rxg1 Nf2#. Jaque doble, sacrificio de dama en g1 y mate de la coz.',
          explanationWrong:
            'Esa jugada no da mate en tres. Busca el jaque doble: caballo y dama a la vez.',
        },
        {
          fen: '1q3rk1/pp3ppp/8/3NR3/7Q/8/PP3PPP/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Mate en tres jugadas.',
          solutionUci: ['d5e7', 'g8h8', 'h4h7', 'h8h7', 'e5h5'],
          hint: 'Un caballo en e7 cubre g8 y g6.',
          explanationCorrect:
            'Correcto: Ne7+ Kh8 Qxh7+ Kxh7 Rh5#. El caballo de e7 quita g8 y g6, y la torre da mate por la columna h.',
          explanationWrong:
            'Esa jugada no da mate en tres. Empieza con un jaque de caballo que cubra g8 y g6.',
        },
        {
          fen: '6k1/pb3ppp/5r2/8/7q/6P1/P4P1P/1Q3RK1 b - - 0 1',
          prompt: 'Juegan negras. Mate en tres jugadas.',
          solutionUci: ['h4h2', 'g1h2', 'f6h6', 'h2g1', 'h6h1'],
          hint: 'El alfil de b7 controla g2 y h1. Abre la columna h.',
          explanationCorrect:
            'Correcto: Qxh2+ Kxh2 Rh6+ Kg1 Rh1#. El alfil protege la torre en h1 y cubre g2.',
          explanationWrong:
            'Esa jugada no da mate en tres. Sacrifica la dama en h2 para abrir la columna h.',
        },
      ],
    },
  ],
};
