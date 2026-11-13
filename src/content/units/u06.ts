import type { Unit } from '../schema.js';

/**
 * Unidad 6 · Principios de apertura (iniciación, 400-800 Elo).
 * Las lecciones 1-3 trabajan principios (la solución es una buena jugada de principios y se comprueba que
 * es legal y no pierde material); la lección 4 usa trampas verificadas por mate o por ganancia de material.
 * Notación de jugadas: SAN con letras inglesas (N, B, R, Q, K, O-O), como en Lichess.
 */
export const unit: Unit = {
  id: 'u06',
  order: 6,
  title: 'Principios de apertura',
  description:
    'Los principios que te hacen jugar bien las primeras jugadas: controla el centro, desarrolla tus piezas, enroca pronto, no muevas la misma pieza dos veces ni saques la dama demasiado pronto, y conoce las trampas que castigan romper estas ideas.',
  level: 'initiation',
  requires: ['u05'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u06.l01',
      unitId: 'u06',
      title: 'Controla el centro',
      objective:
        'Entender por qué las casillas centrales importan y empezar la partida ocupando o atacando el centro con peones y piezas.',
      intro:
        'Las cuatro casillas del centro (d4, e4, d5 y e5) son las más importantes del tablero. Desde el centro, tus piezas llegan rápido a cualquier lado; desde el borde, apenas alcanzan nada. Por eso casi todas las aperturas empiezan con un peón central (1.e4 o 1.d4). Quien domina el centro suele tener más espacio y más opciones.',
      explanation: [
        {
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          text: 'Estas cuatro casillas, d4, e4, d5 y e5, son el centro. Con 1.e4 (o 1.d4) ocupas el centro con un peón y, además, abres el camino a tu alfil y a tu dama. El peón de e4 también controla d5 y f5, así que el rival no puede ocupar esas casillas con piezas sin que las pueda atacar.',
          squares: ['d4', 'e4', 'd5', 'e5'],
          arrows: [['e2', 'e4']],
        },
        {
          fen: '4k3/8/8/8/4N3/8/8/4K3 w - - 0 1',
          text: 'Un caballo en el centro ataca ocho casillas (c3, c5, d2, d6, f2, f6, g3 y g5). El mismo caballo en una esquina solo ataca dos. Por eso se dice «un caballo en el borde es un caballo en la ruina»: las piezas valen más cuanto más cerca del centro estén.',
          squares: ['e4'],
          arrows: [
            ['e4', 'c3'],
            ['e4', 'c5'],
            ['e4', 'd2'],
            ['e4', 'd6'],
            ['e4', 'f2'],
            ['e4', 'f6'],
            ['e4', 'g3'],
            ['e4', 'g5'],
          ],
        },
        {
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
          text: 'Tras 1.e4 e5 los dos bandos ocupan el centro. Ahora hay que seguir luchando por él: 2.Nf3 desarrolla un caballo y ataca el peón de e5 a la vez. Fíjate en la idea: cada jugada de apertura debería hacer algo útil por el centro, no solo mover una pieza porque sí.',
          squares: ['e5'],
          arrows: [['g1', 'f3']],
        },
      ],
      practice: [
        {
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          prompt: 'Juegan blancas. Es la primera jugada de la partida. Ocupa el centro con un peón.',
          solutionUci: ['e2e4'],
          hint: 'Mueve el peón del rey dos casillas.',
          explanationCorrect:
            'Correcto: 1.e4. Ocupas el centro, controlas d5 y f5 y abres el camino a tu alfil y a tu dama. 1.d4 es igual de buena.',
          explanationWrong:
            'Esa jugada no hace nada por el centro. Prueba con un peón central: e4 o d4.',
          wrongByMove: {
            a2a3: 'a3 no hace nada por el centro ni desarrolla piezas; es una jugada perdida en la apertura.',
            h2h4: 'h4 no ayuda al centro y debilita la posición de tu rey.',
          },
        },
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
          prompt: 'Juegan blancas. Ya hay peones centrales y piezas fuera. ¿Cómo sigues peleando por el centro?',
          solutionUci: ['d2d4'],
          hint: 'Un segundo peón central ataca el peón de e5.',
          explanationCorrect:
            'Correcto: 3.d4. Atacas el peón de e5 y ocupas más centro. Si ...exd4, recuperarás el peón con Nxd4 y tendrás un caballo central.',
          explanationWrong:
            'Busca una jugada que ataque el peón central negro: d4 es la forma natural.',
          wrongByMove: {
            a2a3: 'a3 no hace nada por el centro. Mueve un peón central o desarrolla una pieza.',
          },
        },
        {
          fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
          prompt: 'Juegan negras. Las blancas abrieron con 1.e4. Responde ocupando también el centro.',
          solutionUci: ['e7e5'],
          hint: 'Imita al rival: mueve el peón del rey dos casillas.',
          explanationCorrect:
            'Correcto: 1...e5. Ocupas el centro y controlas d4 y f4. 1...d5 y 1...c5 también son buenas respuestas.',
          explanationWrong:
            'Esa jugada deja el centro a las blancas. Responde con un peón central.',
          wrongByMove: {
            a7a6: 'a6 no hace nada por el centro y es una jugada perdida.',
            h7h6: 'h6 no ayuda al centro ni desarrolla piezas.',
          },
        },
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4',
          prompt: 'Juegan blancas. Las negras capturaron en d4. Recupera el peón con una pieza que quede en el centro.',
          solutionUci: ['f3d4'],
          hint: 'El caballo de f3 puede capturar el peón de d4.',
          explanationCorrect:
            'Correcto: 4.Nxd4. Recuperas el peón y tu caballo queda en el centro, atacando casillas importantes.',
          explanationWrong:
            'Hay un peón negro en d4 que puedes recuperar con una pieza. Hacerlo deja a tu caballo en el centro.',
          wrongByMove: {
            d1d4: 'Qxd4 recupera el peón, pero tras ...Nxd4 pierdes la dama. Recaptura con el caballo.',
          },
        },
      ],
      evaluation: [
        {
          fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
          prompt: 'Juegan negras. Las blancas abrieron con 1.d4. Disputa el centro.',
          solutionUci: ['d7d5'],
          hint: 'Un peón central responde a un peón central.',
          explanationCorrect:
            'Correcto: 1...d5. Disputas el centro con un peón y controlas e4 y c4. Es la respuesta más natural a 1.d4.',
          explanationWrong:
            'Prueba con un peón central: d5 es la respuesta clásica a 1.d4.',
          wrongByMove: {
            h7h5: 'h5 no hace nada por el centro y debilita tu rey.',
          },
        },
        {
          fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
          prompt: 'Juegan blancas. Las negras atacaron tu peón central con ...d5. Gana un peón sin perder el centro.',
          solutionUci: ['e4d5'],
          hint: 'Captura el peón que ataca al tuyo.',
          explanationCorrect:
            'Correcto: 2.exd5. Capturas el peón central; si la dama lo recupera con ...Qxd5, tu desarrollo seguirá con tempo (por ejemplo Nc3).',
          explanationWrong:
            'Si no capturas, las negras capturan tu peón de e4 y pierdes un peón. Captura primero.',
          wrongByMove: {
            e4e5: 'e5 evita el cambio, pero cede el peón de d5 sin compensación y deja de luchar por el centro.',
          },
        },
        {
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2',
          prompt: 'Juegan negras. Las blancas atacan tu peón central con d4. No lo dejes sin respuesta.',
          solutionUci: ['e5d4'],
          hint: 'Si no capturas, las blancas capturan en e5.',
          explanationCorrect:
            'Correcto: 2...exd4. Capturas el peón en el centro; tras 3.Qxd4 Nc6 desarrollas con tempo contra la dama.',
          explanationWrong:
            'Si no capturas en d4, las blancas capturan en e5 y ganan un peón central.',
          wrongByMove: {
            a7a6: 'a6 no resuelve nada: las blancas capturan dxe5 y ganan un peón.',
          },
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u06.l02',
      unitId: 'u06',
      title: 'Desarrolla tus piezas y enroca',
      objective:
        'Sacar caballos y alfiles antes que las demás piezas, y enrocar pronto para poner el rey a salvo.',
      intro:
        'Desarrollar significa sacar tus piezas de su casilla inicial hacia casillas activas. Cuantas más piezas participen antes, más ventaja tendrás. El orden habitual es: caballos y alfiles primero, después enrocar (que pone el rey a salvo y activa una torre) y, al final, dama y torres. Quien termina de desarrollar antes puede atacar mientras el rival aún está terminando de ordenar su casa.',
      explanation: [
        {
          fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          text: 'Cada bando tiene dos piezas menores fuera: los caballos en c6/f6 y f3, y el alfil de c4. Todas apuntan al centro. Esta es la idea: caballos y alfiles primero, hacia casillas donde atacan algo y no estorban. Fíjate en que el alfil de c4 apunta a f7, la casilla más débil del campo negro.',
          squares: ['c4', 'f3', 'c6', 'f6'],
          arrows: [['c4', 'f7']],
        },
        {
          fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 2 5',
          text: 'Ya están fuera los dos caballos y el alfil, y la casilla entre el rey y la torre está libre. Es el momento de enrocar: O-O. El rey va a g1 y la torre a f1. En una jugada pones el rey detrás de los peones y activas la torre. Un rey en el centro corre peligro en cuanto se abren columnas.',
          squares: ['e1', 'g1', 'h1', 'f1'],
          arrows: [
            ['e1', 'g1'],
            ['h1', 'f1'],
          ],
        },
        {
          fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 3 5',
          text: 'Así queda el rey blanco tras O-O: en g1, protegido por los peones de f2, g2 y h2. La torre de f1 ya participa. Pon como regla enrocar en las primeras 10 jugadas. Para poder hacerlo no deben haberse movido ni el rey ni esa torre, no debe haber piezas entre ellos y el rey no puede estar en jaque ni cruzar casillas atacadas.',
          squares: ['g1', 'f1'],
        },
      ],
      practice: [
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
          prompt: 'Juegan blancas. Desarrolla una pieza menor hacia una casilla activa.',
          solutionUci: ['f1c4'],
          hint: 'El alfil de rey tiene una diagonal abierta hacia f7.',
          explanationCorrect:
            'Correcto: 3.Bc4. El alfil sale a una casilla activa y apunta a f7. 3.Bb5 y 3.Nc3 también son buenas jugadas de desarrollo.',
          explanationWrong:
            'Esa jugada no desarrolla una pieza menor. Saca un alfil o un caballo a una casilla donde ataque algo.',
          wrongByMove: {
            a2a3: 'a3 no desarrolla ninguna pieza; es una jugada perdida mientras el rival sigue desarrollando.',
            d1e2: 'Qe2 saca la dama antes que alfiles y caballos y, además, bloquea el desarrollo de tu alfil de f1.',
          },
        },
        {
          fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 2 5',
          prompt: 'Juegan blancas. Ya desarrollaste varias piezas y la casilla entre rey y torre está libre. Pon el rey a salvo.',
          solutionUci: ['e1g1'],
          hint: 'Mueve el rey dos casillas hacia la torre de h1.',
          explanationCorrect:
            'Correcto: O-O. El rey queda en g1 detrás de sus peones y la torre pasa a f1, lista para jugar. Enrocar pronto es uno de los principios más importantes.',
          explanationWrong:
            'Con tus piezas ya desarrolladas, lo más útil es enrocar. Un rey en el centro corre peligro si se abren columnas.',
          wrongByMove: {
            a2a3: 'a3 no mejora tu posición: lo importante ahora es poner el rey a salvo.',
          },
        },
        {
          fen: 'rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 4 4',
          prompt: 'Juegan negras. Tu alfil y tu caballo ya están fuera y f8 y g8 están libres. Pon el rey a salvo.',
          solutionUci: ['e8g8'],
          hint: 'Enroca corto con las negras.',
          explanationCorrect:
            'Correcto: 4...O-O. El rey queda en g8 detrás de f7, g7 y h7 y la torre pasa a f8. Las negras enrocan igual que las blancas.',
          explanationWrong:
            'Con las piezas menores ya desarrolladas, el siguiente paso natural es enrocar.',
          wrongByMove: {
            a7a6: 'a6 no ayuda en nada ahora: el rey sigue en el centro y las blancas pueden aprovecharlo.',
          },
        },
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 4 3',
          prompt: 'Juegan negras. Te queda un caballo por desarrollar. Hazlo con una jugada activa.',
          solutionUci: ['g8f6'],
          hint: 'El caballo de rey sale a f6 y ataca el peón de e4.',
          explanationCorrect:
            'Correcto: 3...Nf6. Desarrollas el segundo caballo, atacas el peón de e4 y preparas el enroque.',
          explanationWrong:
            'Tienes un caballo sin sacar; desarrollarlo hacia el centro es más útil que cualquier jugada de peón de banda.',
          wrongByMove: {
            h7h6: 'h6 no desarrolla ninguna pieza; mientras tanto las blancas siguen organizándose.',
            d8h4: 'Qh4 saca la dama pronto y el caballo de f3 la ataca: pierdes la dama.',
          },
        },
      ],
      evaluation: [
        {
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
          prompt: 'Juegan blancas. Desarrolla un caballo atacando algo del centro.',
          solutionUci: ['g1f3'],
          hint: 'El caballo de rey puede atacar el peón de e5.',
          explanationCorrect:
            'Correcto: 2.Nf3. Desarrollas un caballo hacia el centro y atacas el peón de e5.',
          explanationWrong:
            'Mejor desarrollar un caballo hacia el centro que mover otro peón o sacar la dama.',
          wrongByMove: {
            h2h3: 'h3 no desarrolla ninguna pieza: gastas un tiempo sin necesidad.',
          },
        },
        {
          fen: 'rnbqk2r/ppp2ppp/3p1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6',
          prompt: 'Juegan blancas. Tienes cuatro piezas menores fuera y el camino libre. ¿Qué haces?',
          solutionUci: ['e1g1'],
          hint: 'Pon el rey a salvo.',
          explanationCorrect:
            'Correcto: O-O. Con los cuatro caballos y alfiles activos, el enroque pone el rey a salvo y conecta tu torre.',
          explanationWrong:
            'Con tanto desarrollo hecho, el siguiente paso es enrocar. Seguir moviendo piezas deja el rey en el centro.',
          wrongByMove: {
            a2a3: 'a3 no es lo más urgente: el rey sigue en el centro.',
          },
        },
        {
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
          prompt: 'Juegan negras. Tu peón de e5 está atacado. Defiéndelo desarrollando una pieza.',
          solutionUci: ['b8c6'],
          hint: 'Un caballo puede defender e5 y desarrollarse a la vez.',
          explanationCorrect:
            'Correcto: 2...Nc6. Defiendes el peón de e5 y desarrollas un caballo en una sola jugada.',
          explanationWrong:
            'El peón de e5 está atacado y conviene defenderlo con una jugada útil. Un caballo puede hacerlo desarrollándose.',
          wrongByMove: {
            h7h6: 'h6 no defiende el peón de e5: las blancas lo capturan con Nxe5.',
          },
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u06.l03',
      unitId: 'u06',
      title: 'No repitas piezas ni saques la dama pronto',
      objective:
        'Evitar mover la misma pieza varias veces en la apertura y no sacar la dama demasiado pronto.',
      intro:
        'Dos errores muy frecuentes en la apertura son mover la misma pieza una y otra vez (mientras el rival desarrolla las suyas) y sacar la dama demasiado pronto. La dama es la pieza más valiosa y, si sale pronto, el rival la ataca con piezas menores y gana tiempo (cada ataque te obliga a mover otra vez). Cada jugada de la apertura debería poner una pieza nueva en juego.',
      explanation: [
        {
          fen: 'rnbqkb1r/pppp1ppp/5n2/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 2 3',
          text: 'Las blancas sacaron la dama con 2.Qh5 y las negras la atacaron con ...Nf6 desarrollando una pieza. Ahora la dama tiene que huir: las negras han desarrollado con tempo y las blancas, además de no haber desarrollado nada, han perdido una jugada. La dama es tan valiosa que cualquier pieza menor la puede perseguir; mejor que salga cuando sea seguro.',
          squares: ['h5', 'f6'],
          arrows: [['f6', 'h5']],
        },
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p1N1/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 3 3',
          text: 'Aquí las blancas movieron el mismo caballo por segunda vez, 3.Ng5, solo para atacar f7. Pero f7 está defendido por el rey y, peor, ¡el caballo está sin defensa y la dama lo captura con ...Qxg5! Mover la misma pieza dos veces tiene un coste: mientras tanto, las demás siguen en casa y no pueden ayudarte.',
          squares: ['g5', 'f7'],
          arrows: [['d8', 'g5']],
        },
        {
          fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4',
          text: 'Así debe verse una apertura sana: cada jugada ha sacado una pieza nueva (caballos de f3, c3, c6 y f6, y el alfil de c4). Ningún caballo se ha movido dos veces y la dama sigue en casa, protegida. El siguiente paso es enrocar. Regla: en la apertura, una jugada, una pieza nueva.',
          squares: ['f3', 'c3', 'c4', 'c6', 'f6'],
        },
      ],
      practice: [
        {
          fen: 'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2',
          prompt: 'Juegan negras. La dama blanca ataca tu peón de e5. Defiéndelo y desarrolla a la vez.',
          solutionUci: ['b8c6'],
          hint: 'Un caballo puede defender e5 y desarrollarse.',
          explanationCorrect:
            'Correcto: 2...Nc6. Defiendes e5, desarrollas un caballo y dejas que la dama blanca se quede sin plan. Si luego llega Bc4, vigila f7: la dama y el alfil apuntarían a ese punto débil.',
          explanationWrong:
            'El peón de e5 está atacado. Defiéndelo con una pieza que se desarrolle: así ganas tiempo.',
          wrongByMove: {
            a7a6: 'a6 no defiende e5 ni desarrolla: la dama blanca captura Qxe5+.',
            g8f6: 'Nf6 ataca la dama pero deja e5 sin defender: Qxe5+ gana un peón con jaque.',
          },
        },
        {
          fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          prompt: 'Juegan blancas. Ya sacaste un caballo y un alfil. Continúa con un movimiento útil sin repetir piezas.',
          solutionUci: ['c2c3'],
          hint: 'Prepara el avance d4 con un peón.',
          explanationCorrect:
            'Correcto: 4.c3. Preparas d4 para ocupar el centro sin mover otra vez una pieza ya desarrollada. 4.d3 y 4.O-O también serían buenas.',
          explanationWrong:
            'Tienes varias formas buenas, pero evita repetir piezas ya desarrolladas. Una jugada de peón central o enrocar es más útil.',
          wrongByMove: {
            f3g5: 'Ng5 mueve el caballo por segunda vez y lo deja sin defensa: ...Qxg5 gana una pieza.',
          },
        },
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 4 3',
          prompt: 'Juegan negras. Desarrolla una pieza nueva en vez de sacar la dama.',
          solutionUci: ['f8c5'],
          hint: 'El alfil de rey tiene la diagonal abierta hacia f2.',
          explanationCorrect:
            'Correcto: 3...Bc5. Desarrollas una pieza nueva a una casilla activa que apunta a f2. 3...Nf6 también era buena.',
          explanationWrong:
            'Prefiere sacar una pieza menor nueva antes que mover la dama o repetir caballos.',
          wrongByMove: {
            d8h4: 'Qh4 saca la dama pronto: el caballo de f3 la captura (Nxh4) y pierdes la dama.',
          },
        },
      ],
      evaluation: [
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
          prompt: 'Juegan negras. Desarrolla una pieza nueva en vez de sacar la dama.',
          solutionUci: ['g8f6'],
          hint: 'El caballo de rey sale a f6.',
          explanationCorrect:
            'Correcto: 3...Nf6. Desarrollas el segundo caballo, atacas e4 y preparas enrocar. Cada jugada, una pieza nueva.',
          explanationWrong:
            'Prefiere desarrollar un caballo antes que mover la dama o un peón de banda.',
          wrongByMove: {
            d8h4: 'Qh4 saca la dama pronto: el caballo de f3 la captura (Nxh4).',
          },
        },
        {
          fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          prompt: 'Juegan blancas. Te queda un caballo por desarrollar. No repitas el caballo de f3.',
          solutionUci: ['b1c3'],
          hint: 'El caballo de dama sale a c3.',
          explanationCorrect:
            'Correcto: 4.Nc3. Sacas la pieza que te falta en lugar de mover otra vez el caballo de f3.',
          explanationWrong:
            'Tienes un caballo todavía en casa. Desarróllalo en lugar de repetir una pieza.',
          wrongByMove: {
            f3g5: 'Ng5 mueve el mismo caballo por segunda vez, mientras tu caballo de b1 sigue en casa.',
          },
        },
        {
          fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4',
          prompt: 'Juegan negras. Las blancas preparan d4. Desarrolla tu último caballo y ataca e4.',
          solutionUci: ['g8f6'],
          hint: 'El caballo de rey sale a f6.',
          explanationCorrect:
            'Correcto: 4...Nf6. Desarrollas la pieza que faltaba y atacas el peón de e4.',
          explanationWrong:
            'Desarrolla el caballo de g8 antes que mover la dama o repetir piezas.',
          wrongByMove: {
            d8h4: 'Qh4 es sacar la dama pronto: el caballo de f3 la captura (Nxh4).',
          },
        },
      ],
    },

    // ───────────────────────────── l04 ─────────────────────────────
    {
      id: 'u06.l04',
      unitId: 'u06',
      title: 'Trampas que castigan romper los principios',
      objective:
        'Reconocer trampas típicas de apertura y entender que las evitas siguiendo los principios.',
      intro:
        'Las trampas más famosas aprovechan que el rival rompió un principio: no desarrolló, sacó la dama pronto, movió peones que debilitan el rey o se dejó una pieza sin defensa. Conocerlas te sirve para dos cosas: darlas cuando el rival cae y, sobre todo, evitarlas, porque casi todas se evitan con sentido común: desarrolla, enroca y protege tus piezas.',
      explanation: [
        {
          fen: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
          text: 'El mate del loco es el más rápido: 1.f3 e5 2.g4?? Qh4#. Las blancas movieron dos peones del flanco de rey y dejaron abierta la diagonal h4-e1 sin ninguna pieza que pueda interponerse. Moral: no muevas los peones delante del rey sin necesidad en la apertura.',
          squares: ['h4', 'e1'],
          arrows: [['h4', 'e1']],
        },
        {
          fen: 'rn1qkbnr/ppp2p1p/3p2p1/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5',
          text: 'La trampa de Légal: las negras clavaron el caballo de f3 con ...Bg4 y quieren ganar una pieza. Pero 5.Nxe5! deja la dama en el aire a propósito: si 5...Bxd1, 6.Bxf7+ Ke7 7.Nd5#. Es un mate con tres piezas menores. Los principios la evitan: si las negras hubieran enrocado o desarrollado en lugar de clavar, no habría trampa.',
          squares: ['e5', 'f7', 'd5'],
          arrows: [
            ['f3', 'e5'],
            ['c4', 'f7'],
            ['c3', 'd5'],
          ],
        },
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p1N1/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 3 3',
          text: 'Mover el caballo por segunda vez (3.Ng5) deja la pieza sin protección: 3...Qxg5 gana un caballo. Muchas trampas son así de simples: una pieza se queda sin protección porque el rival no contó atacantes y defensores. Antes de mover, repasa tus piezas: ¿cuáles están sin defensa?',
          squares: ['g5'],
          arrows: [['d8', 'g5']],
        },
      ],
      practice: [
        {
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2',
          prompt: 'Juegan negras. Las blancas movieron f3 y g4 y debilitaron su rey. Castígalo.',
          solutionUci: ['d8h4'],
          hint: 'Mira la diagonal que lleva de h4 a e1.',
          explanationCorrect:
            'Correcto: 2...Qh4#. Es el mate del loco: la diagonal h4-e1 está abierta y el rey no tiene casillas ni piezas que se interpongan.',
          explanationWrong:
            'Hay un mate en una jugada. Fíjate en la diagonal que llega al rey blanco desde h4.',
          wrongByMove: {
            e5e4: 'e4 pierde la oportunidad: la dama puede dar mate ahora mismo.',
          },
        },
        {
          fen: 'rnbqkbnr/ppppp2p/5p2/6p1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
          prompt: 'Juegan blancas. Las negras debilitaron la diagonal del rey con ...f6 y ...g5. Castígalo.',
          solutionUci: ['d1h5'],
          hint: 'Mira la diagonal h5-e8.',
          explanationCorrect:
            'Correcto: 3.Qh5#. Las jugadas ...f6 y ...g5 dejaron la diagonal abierta y el rey sin casillas libres. Los peones que se mueven delante del rey son su escudo; si los mueves, debilitas tu propio rey.',
          explanationWrong:
            'Hay un mate en una jugada. Fíjate en la diagonal que llega al rey negro desde h5.',
          wrongByMove: {
            e4e5: 'e5 no hace daño al rey: el mate está en la diagonal h5-e8.',
          },
        },
        {
          fen: 'r1b1kbnr/pppp1ppp/2n5/4p3/2B1P2q/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          prompt: 'Juegan blancas. Las negras sacaron la dama pronto. Castígalo.',
          solutionUci: ['f3h4'],
          hint: 'La dama negra está atacada por un caballo y no está protegida.',
          explanationCorrect:
            'Correcto: 4.Nxh4. La dama negra salió pronto y quedó atacada por un caballo sin defensa: la ganas gratis. Por eso conviene sacar la dama cuando sea seguro.',
          explanationWrong:
            'La dama negra está atacada por una de tus piezas y nadie la defiende. Captúrala.',
          wrongByMove: {
            c4f7: 'Bxf7+ es jaque, pero te desvía de lo esencial: la dama negra está colgada y capturarla directamente es más limpio.',
          },
        },
        {
          fen: 'rn1qkbnr/ppp2p1p/3p2p1/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5',
          prompt: 'Juegan blancas. Las negras clavaron el caballo y quieren ganar tu dama. Sacrifícala para dar mate.',
          solutionUci: ['f3e5', 'g4d1', 'c4f7', 'e8e7', 'c3d5'],
          hint: 'Empieza capturando el peón de e5 con el caballo; si las negras capturan tu dama, tendrás un mate con tres piezas.',
          explanationCorrect:
            'Correcto: Nxe5! Bxd1 Bxf7+ Ke7 Nd5#. Es la trampa de Légal. Si las negras no capturan la dama, ganas un peón y una posición excelente.',
          explanationWrong:
            'Hay un sacrificio de dama que lleva a un mate en pocas jugadas. Empieza con el caballo de f3.',
          wrongByMove: {
            c3d5: 'Nd5 no es la idea: la combinación empieza con el sacrificio Nxe5.',
          },
        },
      ],
      evaluation: [
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p1N1/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 3 3',
          prompt: 'Juegan negras. El caballo blanco salió dos veces y está sin defensa. Gana material.',
          solutionUci: ['d8g5'],
          hint: 'La dama ve el caballo por la diagonal.',
          explanationCorrect:
            'Correcto: 3...Qxg5. El caballo no tenía defensa. Mover la misma pieza dos veces dejó una pieza colgada.',
          explanationWrong:
            'Una pieza blanca está atacada y sin defensa. Cuenta qué pieza puedes capturar gratis.',
          wrongByMove: {
            c6d4: 'Nd4 no gana nada: la pieza colgada es el caballo de g5.',
          },
        },
        {
          fen: 'r1bqkbnr/pppp1ppp/2n5/4Q3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 3',
          prompt: 'Juegan negras. La dama blanca salió pronto, capturó en e5 con jaque y quedó sin protección. Castígalo.',
          solutionUci: ['c6e5'],
          hint: 'Estás en jaque: ¿puedes capturar la pieza que lo da?',
          explanationCorrect:
            'Correcto: 3...Nxe5. La dama blanca capturó un peón con jaque, pero no estaba protegida y el caballo de c6 la captura. Sacar la dama pronto y capturar sin mirar defensores es muy peligroso.',
          explanationWrong:
            'Estás en jaque por una dama que nadie protege. Capturarla resuelve el jaque y gana material.',
          wrongByMove: {
            d8e7: 'Qe7 evita el jaque pero deja pasar la dama blanca gratis; capturarla era mucho mejor.',
          },
        },
        {
          fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
          prompt: 'Juegan blancas. Las negras no defendieron f7 y desarrollaron el alfil. Castígalo.',
          solutionUci: ['h5f7'],
          hint: 'Dos de tus piezas atacan f7 y solo lo defiende el rey.',
          explanationCorrect:
            'Correcto: 4.Qxf7#. Es el mate del pastor: el alfil de c4 protege la dama y el rey no puede huir. Se evita con ...Qe7 o ...Qf6 antes de que llegue la dama.',
          explanationWrong:
            'Hay un mate en una jugada: f7 solo está defendido por el rey y tienes dos piezas que lo atacan.',
          wrongByMove: {
            c4f7: 'Bxf7+ es jaque, pero no es mate: el rey escapa a e7. La dama es la que debe capturar en f7.',
          },
        },
      ],
    },
  ],
};
