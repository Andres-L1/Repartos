import type { Unit } from '../schema.js';

/**
 * Unidad 8 · Descubiertas y cálculo de capturas (básico, 800-1100 Elo).
 * Pendiente de validación de profesores. Cada ejercicio se verifica por código (test/content/unitsC.test.ts):
 * mate único en 1 o la mejor jugada por búsqueda de material con al menos un peón de margen.
 */
export const unit: Unit = {
  id: 'u08',
  order: 8,
  title: 'Descubiertas y cálculo de capturas',
  description:
    'Ataques a la descubierta con y sin jaque, el jaque doble, y cómo contar atacantes y defensores para saber en qué orden capturar. Empezarás a calcular dos y tres jugadas seguidas.',
  level: 'basic',
  requires: ['u07'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u08.l01',
      unitId: 'u08',
      title: 'El ataque a la descubierta',
      objective:
        'Mover una pieza que tapa a otra para descubrir un ataque, eligiendo un movimiento que también amenace algo, sobre todo un jaque.',
      conceptIds: ['tactics.discovered_attack'],
      intro:
        'En un ataque a la descubierta mueves una pieza y, al apartarse, deja ver el ataque de la pieza que estaba detrás. Ya viste el jaque a la descubierta. Aquí el ataque descubierto va contra la dama o una torre, y la pieza que se mueve debe crear otra amenaza, mejor un jaque. Así el rival tiene dos problemas y solo puede resolver uno.',
      explanation: [
        {
          fen: '6k1/3q1ppp/8/8/8/3B4/5PPP/3R2K1 w - - 0 1',
          text: 'La torre de d1 apunta a la dama de d7, pero el alfil de d3 la tapa. Si el alfil se mueve, la torre ataca a la dama. Lo mejor es que el alfil se mueva dando jaque: Bxh7+. Negras deben atender el jaque y la torre captura la dama. Ojo: si el alfil se mueve sin jaque, la dama captura tu torre.',
          squares: ['d7', 'd3'],
          arrows: [
            ['d3', 'h7'],
            ['d1', 'd7'],
          ],
        },
        {
          fen: '4r1k1/5ppp/8/4n3/8/8/5PPP/4Q1K1 b - - 0 1',
          text: 'Lo mismo con negras: la torre de e8 apunta a la dama de e1 y el caballo de e5 la tapa. Si el caballo salta a f3 con jaque, blancas tienen que salir del jaque y la torre captura la dama. Cuando veas una pieza tuya entre una pieza de largo alcance y la dama rival, busca el movimiento con jaque.',
          squares: ['e1', 'e5'],
          arrows: [
            ['e5', 'f3'],
            ['e8', 'e1'],
          ],
        },
      ],
      practice: [
        {
          fen: '6k1/3q1ppp/8/8/8/3B4/5PPP/3R2K1 w - - 0 1',
          prompt: 'Juegan blancas. Descubre el ataque de la torre contra la dama moviendo el alfil con jaque.',
          solutionUci: ['d3h7'],
          hint: 'El alfil puede dar jaque capturando un peón.',
          explanationCorrect:
            'Correcto: Bxh7+. Negras deben atender el jaque (Kxh7 o Kh8) y la torre captura la dama de d7.',
          explanationWrong:
            'Si el alfil se mueve sin dar jaque, la dama tiene tiempo de capturar tu torre de d1. Busca el movimiento con jaque.',
          wrongByMove: {
            d3b5: 'Bb5 ataca la dama, pero no es jaque: la dama captura tu torre con jaque (Qxd1+).',
          },
        },
        {
          fen: '4r1k1/5ppp/8/4n3/8/8/5PPP/4Q1K1 b - - 0 1',
          prompt: 'Juegan negras. Gana la dama blanca con una descubierta.',
          solutionUci: ['e5f3'],
          hint: 'El caballo debe moverse dando jaque al rey de g1.',
          explanationCorrect:
            'Correcto: Nf3+. Blancas deben atender el jaque (por ejemplo gxf3) y la torre captura la dama: Rxe1+.',
          explanationWrong:
            'Sin jaque, la dama blanca escapa o captura tu torre. Mueve el caballo dando jaque.',
          wrongByMove: {
            e5d3: 'Nd3 ataca la dama, pero no es jaque: la dama captura tu torre (Qxe8+).',
          },
        },
        {
          fen: '3q2k1/1p3ppp/2n5/3P4/8/8/5PPP/3RK3 w - - 0 1',
          prompt: 'Juegan blancas. Tu peón tapa la torre de d1. Captura y descubre un ataque contra la dama.',
          solutionUci: ['d5c6'],
          hint: 'El peón captura en diagonal y, al irse de la columna d, la torre ve la dama.',
          explanationCorrect:
            'Correcto: dxc6. Ganas el caballo y, a la vez, la torre ataca la dama de d8. Negras tienen que salvar la dama y no pueden recuperar la pieza con ventaja.',
          explanationWrong:
            'El peón puede capturar el caballo y descubrir el ataque de la torre contra la dama a la vez.',
        },
      ],
      evaluation: [
        {
          fen: '4qrk1/6pp/8/8/4B3/8/5PPP/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. El alfil tapa la torre de e1. Muévelo con jaque y gana material.',
          solutionUci: ['e4d5'],
          hint: 'El alfil puede dar jaque al rey de g8 por la diagonal que pasa por f7.',
          explanationCorrect:
            'Correcto: Bd5+. Negras deben atender el jaque y la torre ataca la dama. Como mucho salvan algo de material tapando con la torre, pero pierden la dama por una torre.',
          explanationWrong:
            'No era la mejor. Busca el movimiento del alfil que da jaque y descubre el ataque de la torre contra la dama.',
        },
        {
          fen: '3r2k1/5ppp/8/8/3n4/8/3Q1PPP/6K1 b - - 0 1',
          prompt: 'Juegan negras. Gana la dama blanca con una descubierta.',
          solutionUci: ['d4f3'],
          hint: 'El caballo debe dar jaque a g1 desde una casilla que la dama no controle.',
          explanationCorrect:
            'Correcto: Nf3+. Blancas deben atender el jaque y la torre de d8 captura la dama de d2.',
          explanationWrong:
            'Sin jaque, la dama blanca escapa o captura tu torre. Busca el salto con jaque.',
          wrongByMove: {
            d4e2: 'Ne2+ es jaque, pero la dama captura el caballo (Qxe2) y ya no hay descubierta.',
          },
        },
        {
          fen: '6k1/6q1/8/8/3R4/8/1B3PPP/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Tu torre tapa la diagonal del alfil hacia la dama. Muévela con jaque.',
          solutionUci: ['d4d8'],
          hint: 'La torre puede dar jaque por la octava fila.',
          explanationCorrect:
            'Correcto: Rd8+. Si el rey sale, el alfil captura la dama. Si la dama tapa en f8, Rxf8+ y ganas dama por torre.',
          explanationWrong:
            'No era esa. Mueve la torre con jaque para que el alfil de b2 ataque a la dama.',
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u08.l02',
      unitId: 'u08',
      title: 'El jaque doble',
      objective:
        'Reconocer el jaque doble, saber que solo se responde moviendo el rey y usarlo para ganar material o dar mate.',
      conceptIds: ['tactics.discovered_attack'],
      intro:
        'El jaque doble es la descubierta más fuerte: la pieza que se mueve da jaque y la que estaba detrás también. Contra dos jaques no sirve tapar ni capturar, porque solo se puede quitar uno. La única defensa es mover el rey. Por eso el jaque doble suele ganar la dama o dar mate, aunque la pieza que se mueve quede atacada.',
      explanation: [
        {
          fen: '4k3/1q6/8/8/4N3/8/5PPP/4R1K1 w - - 0 1',
          text: 'Si el caballo salta a d6, da jaque al rey de e8 y además descubre el jaque de la torre de e1: es un jaque doble. Negras solo pueden mover el rey. Desde d6 el caballo ataca también a la dama de b7, que cae en la jugada siguiente.',
          squares: ['d6', 'b7'],
          arrows: [
            ['e4', 'd6'],
            ['e1', 'e8'],
            ['d6', 'b7'],
          ],
        },
        {
          fen: '3qkb2/3p2pp/8/8/4N3/8/5PPP/4R1K1 w - - 0 1',
          text: 'El jaque doble también da mate. El rey de e8 está rodeado por sus propias piezas: dama en d8, alfil en f8 y peón en d7. Con Nd6 el caballo y la torre dan jaque a la vez. El rey no puede ir a e7 (lo ataca la torre) ni a f7 (lo ataca el caballo). Es mate.',
          squares: ['e8', 'e7', 'f7'],
          arrows: [
            ['e4', 'd6'],
            ['e1', 'e8'],
          ],
        },
      ],
      practice: [
        {
          fen: '4k3/1q6/8/8/4N3/8/5PPP/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. Da un jaque doble que también ataque a la dama.',
          solutionUci: ['e4d6'],
          hint: 'El caballo debe dar jaque desde una casilla que también vea b7.',
          explanationCorrect:
            'Correcto: Nd6+. Jaque del caballo y de la torre a la vez. Negras solo pueden mover el rey y el caballo captura la dama.',
          explanationWrong:
            'No era el mejor salto. Busca el que da jaque con el caballo y con la torre a la vez y además ataca la dama.',
          wrongByMove: {
            e4c5: 'Nc5+ ataca la dama, pero solo da jaque la torre: negras tapan con la dama en e7 y solo ganas dama por torre.',
          },
        },
        {
          fen: '4r1k1/5ppp/8/4n3/8/8/1Q3PPP/4K3 b - - 0 1',
          prompt: 'Juegan negras. Da un jaque doble que gane la dama blanca.',
          solutionUci: ['e5d3'],
          hint: 'El caballo da jaque al rey de e1 desde una casilla que ve b2.',
          explanationCorrect:
            'Correcto: Nd3+. Jaque doble del caballo y de la torre. El rey blanco tiene que moverse y el caballo captura la dama de b2.',
          explanationWrong:
            'No era ese salto. Busca el jaque doble que además ataca a la dama.',
        },
        {
          fen: '3qkb2/3p2pp/8/8/4N3/8/5PPP/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. Da mate en una jugada con un jaque doble.',
          solutionUci: ['e4d6'],
          hint: 'El rey negro no tiene casillas libres si el caballo controla f7.',
          explanationCorrect:
            'Correcto: Nd6#. Jaque doble: no se puede tapar ni capturar, y el rey no tiene casillas. Mate.',
          explanationWrong:
            'Esa jugada no es mate. Busca el jaque doble en el que el caballo también controla f7.',
          wrongByMove: {
            e4f6: 'Nf6+ es jaque doble, pero el rey escapa a f7. Hace falta que el caballo controle esa casilla.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4r1k1/6pp/8/4n3/8/8/3P2PP/3QKB2 b - - 0 1',
          prompt: 'Juegan negras. Da mate en una jugada con un jaque doble.',
          solutionUci: ['e5d3'],
          hint: 'El rey blanco solo podría escapar por f2.',
          explanationCorrect:
            'Correcto: Nd3#. El caballo y la torre dan jaque a la vez, y el caballo controla f2. El rey no tiene casillas: mate.',
          explanationWrong:
            'Esa jugada no es mate. Busca el jaque doble que también quita la casilla f2.',
          wrongByMove: {
            e5f3: 'Nf3+ es jaque doble, pero el rey escapa a f2.',
          },
        },
        {
          fen: 'R2N3k/6pp/5r2/8/8/8/6PP/6K1 w - - 0 1',
          prompt: 'Juegan blancas. Da mate en una jugada.',
          solutionUci: ['d8f7'],
          hint: 'Si das un jaque sencillo, la torre negra puede tapar. Hace falta un jaque doble.',
          explanationCorrect:
            'Correcto: Nf7#. Jaque del caballo y de la torre de a8 a la vez. La torre negra no puede tapar dos jaques y el rey no tiene casillas.',
          explanationWrong:
            'Esa jugada permite que la torre negra tape en f8. Busca el jaque doble.',
        },
        {
          fen: '6k1/1b3ppp/8/8/4n3/2p5/P6P/3Q3K b - - 0 1',
          prompt: 'Juegan negras. Da un jaque doble que gane la dama blanca.',
          solutionUci: ['e4f2'],
          hint: 'El caballo da jaque al rey de h1 desde una casilla que también ve d1.',
          explanationCorrect:
            'Correcto: Nf2+. Jaque del caballo y del alfil de b7 a la vez. El rey tiene que moverse y el caballo captura la dama.',
          explanationWrong:
            'No era ese salto. Busca el jaque doble que también ataca a la dama de d1.',
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u08.l03',
      unitId: 'u08',
      title: 'Contar atacantes y defensores',
      objective:
        'Contar cuántas piezas atacan y defienden una casilla y capturar en el orden correcto: primero con la pieza de menos valor.',
      conceptIds: ['tactics.hanging_piece', 'tactics.bad_exchange'],
      intro:
        'Una pieza defendida también se puede ganar si la atacas más veces de las que la defienden. Pero el orden importa: en una serie de capturas, cada pieza que capturas puede ser recapturada. Regla práctica: cuenta atacantes y defensores, y empieza a capturar con tu pieza de menos valor. Si empiezas con la más valiosa, puedes perderla aunque tengas más atacantes.',
      explanation: [
        {
          fen: '6k1/5bpp/8/3n4/8/1B6/5PPP/3R2K1 w - - 0 1',
          text: 'El caballo de d5 está atacado dos veces (alfil de b3 y torre de d1) y defendido una vez (alfil de f7). Empieza con el alfil: Bxd5 Bxd5 Rxd5 y ganas un caballo. Si empiezas con la torre, Rxd5 Bxd5 Bxd5, das una torre (5) por caballo y alfil (6): ganas un punto en vez de un caballo entero.',
          squares: ['d5'],
          arrows: [
            ['b3', 'd5'],
            ['d1', 'd5'],
            ['f7', 'd5'],
          ],
        },
        {
          fen: '3r2k1/5ppp/8/4p3/3N4/2P5/4KPPP/3R4 b - - 0 1',
          text: 'Cuenta antes de capturar. El caballo de d4 lo defienden la torre de d1 y el peón de c3. Si negras capturan con el peón (exd4 cxd4), ganan un caballo por un peón. Si capturan con la torre, el peón recaptura: han dado una torre por un caballo.',
          squares: ['d4', 'c3'],
          arrows: [
            ['e5', 'd4'],
            ['c3', 'd4'],
          ],
        },
      ],
      practice: [
        {
          fen: '6k1/5bpp/8/3n4/8/1B6/5PPP/3R2K1 w - - 0 1',
          prompt: 'Juegan blancas. El caballo de d5 está atacado dos veces y defendido una. Captura en el orden correcto.',
          solutionUci: ['b3d5'],
          hint: 'Empieza por la pieza de menos valor.',
          explanationCorrect:
            'Correcto: Bxd5. Si negras recapturan con el alfil, Rxd5 y has ganado un caballo. Empezar por la pieza barata es la regla.',
          explanationWrong:
            'Ese orden no es el bueno. Captura primero con la pieza de menos valor.',
          wrongByMove: {
            d1d5: 'Rxd5 Bxd5 Bxd5: das una torre (5) por caballo y alfil (6), y te queda mucho menos de lo que podías ganar.',
          },
        },
        {
          fen: '3r2k1/5ppp/8/4p3/3N4/2P5/4KPPP/3R4 b - - 0 1',
          prompt: 'Juegan negras. Puedes capturar el caballo de dos formas. Elige la que gana material.',
          solutionUci: ['e5d4'],
          hint: 'El caballo está defendido por un peón: captura con tu pieza más barata.',
          explanationCorrect:
            'Correcto: exd4. Si blancas recapturan con el peón, has ganado un caballo por un peón.',
          explanationWrong:
            'No es la mejor captura. Con el peón ganas el caballo sin arriesgar la torre.',
          wrongByMove: {
            d8d4: 'Rxd4 cxd4: el peón recaptura y has dado una torre (5) por un caballo (3).',
          },
        },
        {
          fen: '6k1/5pp1/3b3p/4n3/8/8/1B3PPP/Q5K1 w - - 0 1',
          prompt: 'Juegan blancas. Tu alfil y tu dama apuntan juntos al caballo de e5. Gana material.',
          solutionUci: ['b2e5'],
          hint: 'El alfil está delante de la dama en la diagonal: captura con él.',
          explanationCorrect:
            'Correcto: Bxe5. Si el alfil de d6 recaptura, la dama captura en e5. Ganas un caballo: dos atacantes contra un defensor.',
          explanationWrong:
            'Ataca el caballo dos veces y solo lo defiende un alfil. Captura con la pieza de delante, el alfil.',
        },
      ],
      evaluation: [
        {
          fen: '5rk1/5rpp/8/8/8/5B2/5P1P/3Q2K1 b - - 0 1',
          prompt: 'Juegan negras. El alfil de f3 está atacado por tus dos torres y defendido solo por la dama. Gana material.',
          solutionUci: ['f7f3'],
          hint: 'Captura con la torre de delante.',
          explanationCorrect:
            'Correcto: Rxf3. Si la dama recaptura, la otra torre captura la dama. Ganas un alfil limpio.',
          explanationWrong:
            'Hay dos atacantes contra un defensor. Captura el alfil con la torre de delante.',
        },
        {
          fen: '3r4/4kppp/4p3/3n4/2P5/8/5PPP/3RK3 w - - 0 1',
          prompt: 'Juegan blancas. El caballo de d5 está defendido dos veces. Gana material.',
          solutionUci: ['c4d5'],
          hint: 'Captura con tu pieza más barata.',
          explanationCorrect:
            'Correcto: cxd5. Si negras recapturan, has cambiado un peón por un caballo.',
          explanationWrong:
            'La captura buena es con el peón: das 1 y recibes 3.',
          wrongByMove: {
            d1d5: 'Rxd5 exd5: el peón recaptura y has dado una torre por un caballo.',
          },
        },
        {
          fen: 'q5k1/1b3ppp/8/8/4N3/3B3P/5PP1/6K1 b - - 0 1',
          prompt: 'Juegan negras. Tu alfil y tu dama apuntan juntos al caballo de e4. Gana material.',
          solutionUci: ['b7e4'],
          hint: 'Captura con la pieza de delante de la diagonal.',
          explanationCorrect:
            'Correcto: Bxe4. Si el alfil de d3 recaptura, la dama captura en e4. Dos atacantes contra un defensor: ganas un caballo.',
          explanationWrong:
            'Ataca el caballo dos veces y solo lo defiende un alfil. Captura primero con el alfil.',
        },
      ],
    },
  ],
};
