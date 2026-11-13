import type { Unit } from '../schema.js';

export const unit: Unit = {
  id: 'u03',
  order: 3,
  title: 'Reglas especiales y fin de partida',
  description:
    'Aprende el jaque y el jaque mate, el enroque, la promoción del peón, la captura al paso y todas las formas de terminar en tablas. Con esto ya conoces todas las reglas del ajedrez.',
  level: 'beginner',
  requires: ['u02'],
  lessons: [
    {
      id: 'u03.l01',
      unitId: 'u03',
      title: 'El jaque y cómo salir de él',
      objective: 'Reconocer un jaque y salir de él de las tres formas posibles: mover el rey, capturar o interponer.',
      intro:
        'El objetivo del ajedrez es atacar al rey rival de forma que no pueda escapar. El primer paso es entender el jaque: un aviso de que tu rey está atacado. Cuando recibas un jaque estás obligado a salir de él antes de hacer cualquier otra cosa, y saber cómo hacerlo es una de las habilidades más importantes del juego.',
      explanation: [
        {
          fen: '4k3/8/8/8/8/8/8/4RK2 b - - 0 1',
          squares: ['e8'],
          arrows: [['e1', 'e8']],
          text: 'Cuando una pieza ataca al rey rival se dice que hay jaque. Aquí la torre blanca de e1 ataca al rey negro por la columna e. Un rey nunca puede quedar en jaque después de tu jugada: si te dan jaque, tu único trabajo en ese turno es salir de él. Hay tres formas de hacerlo: mover el rey, capturar a la pieza que da jaque o interponer una pieza en medio.',
        },
        {
          fen: '4k3/8/8/8/8/8/8/4RK2 b - - 0 1',
          squares: ['e7'],
          arrows: [
            ['e8', 'd8'],
            ['e8', 'f8'],
            ['e8', 'd7'],
            ['e8', 'f7'],
          ],
          text: 'Primera forma: mover el rey a una casilla que no esté atacada. Aquí el rey no puede ir a e7, porque la torre sigue atacando toda la columna e, pero sí a d8, f8, d7 o f7. Recuerda: el rey solo se mueve una casilla.',
        },
        {
          fen: '4k3/8/8/8/7b/8/8/4R1K1 b - - 0 1',
          squares: ['e1'],
          arrows: [['h4', 'e1']],
          text: 'Segunda forma: capturar la pieza que da jaque. El alfil negro de h4 puede capturar la torre de e1 y el jaque desaparece. Siempre que puedas, comprueba si la pieza que da jaque se puede capturar: además de salvarte, ganas material.',
        },
        {
          fen: '4k3/8/3b4/8/8/8/8/4R1K1 b - - 0 1',
          squares: ['e7'],
          arrows: [['d6', 'e7']],
          text: 'Tercera forma: interponer una pieza entre la que da jaque y el rey. El alfil negro puede ir a e7 y tapar la columna. Solo se puede interponer contra piezas que atacan en línea (torre, alfil, dama). Contra un caballo, un peón o un rey no se puede interponer: hay que capturar o mover el rey.',
        },
      ],
      practice: [
        {
          fen: '7k/8/8/8/8/8/4r3/4K3 w - - 0 1',
          prompt: 'La torre negra te da jaque. Captúrala con tu rey (nadie la protege).',
          solutionUci: ['e1e2'],
          hint: 'La torre está justo al lado de tu rey.',
          explanationCorrect: 'Muy bien: saliste del jaque capturando a la pieza que lo daba y ganaste una torre.',
          explanationWrong: 'Estás en jaque y la torre de e2 está a un paso de tu rey y sin protección. La mejor salida es capturarla.',
          wrongByMove: {
            e1d1: 'También sales del jaque, pero dejas escapar una torre gratis. Si puedes capturar a la pieza que da jaque, hazlo.',
            e1f1: 'También sales del jaque, pero dejas escapar una torre gratis. Si puedes capturar a la pieza que da jaque, hazlo.',
          },
        },
        {
          fen: '4r1k1/8/8/8/8/8/5P2/2B1K3 w - - 0 1',
          prompt: 'Estás en jaque por la torre. Sal del jaque interponiendo el alfil.',
          solutionUci: ['c1e3'],
          hint: 'Tapa la columna e en una casilla protegida por tu peón de f2.',
          explanationCorrect: 'Perfecto: interpusiste una pieza y, además, el peón de f2 protege el alfil de e3, así que la torre no puede capturarlo gratis.',
          explanationWrong: 'Interponer significa poner una pieza entre la torre y tu rey. El alfil de c1 puede llegar a e3, que está en la columna e y protegida por tu peón.',
          wrongByMove: {
            e1d1: 'Es válido mover el rey, pero hoy tocaba interponer el alfil en e3.',
            e1d2: 'Es válido mover el rey, pero hoy tocaba interponer el alfil en e3.',
          },
        },
        {
          fen: '4r1k1/8/8/8/b7/8/3P1P2/4K3 w - - 0 1',
          prompt: 'Estás en jaque. Solo hay una forma legal de salir. Encuéntrala.',
          solutionUci: ['e1f1'],
          hint: 'Revisa las casillas libres alrededor de tu rey: algunas están atacadas por el alfil.',
          explanationCorrect: 'Correcto. d1 estaba atacada por el alfil, d2 y f2 ocupadas por tus peones y e2 por la torre: la única casilla segura era f1.',
          explanationWrong: 'No hay piezas para capturar ni interponer. Tu rey solo tiene una casilla segura: d1 está atacada por el alfil y e2 por la torre.',
        },
        {
          fen: '4k3/8/8/8/8/8/R7/4K3 w - - 0 1',
          prompt: 'Da jaque al rey negro llevando la torre a la fila 8.',
          solutionUci: ['a2a8'],
          hint: 'El rey está en la fila 8: sube por la columna a.',
          explanationCorrect: 'Muy bien: desde a8 la torre ataca toda la fila 8 y el rey negro está en jaque. Todavía puede escapar, así que aún no es mate.',
          explanationWrong: 'Para dar jaque, la torre debe atacar al rey. El rey negro está en la fila 8: lleva la torre a esa fila.',
        },
      ],
      evaluation: [
        {
          fen: '7k/8/8/8/8/5n2/6P1/4K3 w - - 0 1',
          prompt: 'El caballo negro te da jaque. Captúralo con tu peón.',
          solutionUci: ['g2f3'],
          hint: 'Los peones capturan en diagonal.',
          explanationCorrect: 'Muy bien: contra un caballo no se puede interponer, pero sí capturarlo. Y ganaste una pieza.',
          explanationWrong: 'No se puede interponer contra un caballo. Tu peón de g2 puede capturarlo en f3, que es la mejor salida.',
          wrongByMove: {
            e1f1: 'Sales del jaque, pero dejas un caballo gratis. Siempre que puedas, captura a la pieza que da jaque.',
          },
        },
        {
          fen: 'R6k/6r1/8/8/8/8/8/4K3 b - - 0 1',
          prompt: 'Estás en jaque con negras. Interpón la torre en g8.',
          solutionUci: ['g7g8'],
          hint: 'Tu torre sube una casilla y tapa la fila 8.',
          explanationCorrect: 'Correcto. La torre en g8 tapa el jaque y además está protegida por tu rey.',
          explanationWrong: 'Para interponer, coloca la torre en la línea de jaque, entre la torre blanca y tu rey: la casilla g8.',
          wrongByMove: {
            h8h7: 'También sales del jaque moviendo el rey, pero hoy practicamos la interposición con la torre.',
          },
        },
        {
          fen: '3rkb2/3p1p2/8/8/8/8/8/4R1K1 b - - 0 1',
          prompt: 'Estás en jaque y solo hay una jugada legal. Encuéntrala.',
          solutionUci: ['f8e7'],
          hint: 'Tus piezas tapan las casillas del rey. Solo puedes interponer.',
          explanationCorrect: 'Muy bien: tu rey estaba rodeado de sus propias piezas, así que la única salida era interponer el alfil en e7.',
          explanationWrong: 'El rey no puede moverse y ninguna pieza puede capturar la torre. Solo queda interponer: el alfil de f8 puede ir a e7.',
        },
      ],
    },
    {
      id: 'u03.l02',
      unitId: 'u03',
      title: 'El jaque mate',
      objective: 'Entender cuándo un jaque es mate y encontrar mates en una jugada.',
      intro:
        'El jaque mate es el final feliz de una partida: el rey está en jaque y no hay forma de evitarlo. En ese momento la partida termina y gana quien ha dado el mate. En esta lección vas a aprender a reconocer un mate y a encontrar los más sencillos, que son los que verás en casi todas las partidas.',
      explanation: [
        {
          fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1',
          squares: ['g8'],
          arrows: [['a1', 'a8']],
          text: 'Hay jaque mate cuando el rey está en jaque y no puede evitarlo: ni mover el rey, ni capturar a la pieza que ataca, ni interponer algo. Aquí Ta8 da jaque y es mate: el rey negro está encerrado por sus propios peones, y no hay forma de escapar. Se llama mate del pasillo. Cuando hay mate, la partida termina inmediatamente.',
        },
        {
          fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1',
          arrows: [
            ['a1', 'a8'],
            ['e8', 'd7'],
          ],
          text: 'Cuidado: un jaque no siempre es mate. Aquí Ta8 da jaque, pero el rey negro puede escapar a d7 (o a f7), fuera de la fila 8. Antes de dar jaque, comprueba las casillas de escape del rey rival: si queda alguna libre, no es mate.',
        },
        {
          fen: 'k7/8/1K6/8/8/8/8/6Q1 w - - 0 1',
          squares: ['a8'],
          arrows: [['g1', 'g8']],
          text: 'Un mate muy común es dama (o torre) y rey contra rey. Aquí Dg8 da jaque en la fila 8. Las casillas a7 y b7 las controla tu rey, y b8 la controla la dama: no hay escapatoria. Tu rey participa en el ataque y es una pieza más: úsalo siempre que puedas.',
        },
      ],
      practice: [
        {
          fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
          prompt: 'Mate en 1: da jaque mate al rey negro.',
          solutionUci: ['e1e8'],
          hint: 'Los peones tapan las casillas de escape del rey negro. Lleva la torre a la última fila.',
          explanationCorrect: '¡Jaque mate! La torre ataca la fila 8, el rey no puede moverse (sus peones le tapan la salida) y nadie puede capturar ni interponer.',
          explanationWrong: 'El rey negro está encerrado por sus propios peones. Si das jaque en la fila 8, no podrá escapar: lleva la torre a e8.',
          wrongByMove: {
            e1e7: 'Atacas los peones, pero no das jaque. Para dar mate, la torre tiene que atacar al rey: llega hasta la fila 8.',
          },
        },
        {
          fen: '7k/8/6K1/8/8/8/8/5Q2 w - - 0 1',
          prompt: 'Mate en 1: da jaque mate con la dama.',
          solutionUci: ['f1f8'],
          hint: 'Tu rey ya controla g7 y h7. Falta atacar al rey en la fila 8.',
          explanationCorrect: '¡Mate! Tu rey controla g7 y h7, la dama controla g8 y da jaque. El rey no tiene escapatoria.',
          explanationWrong: 'Tu rey controla g7 y h7. Si la dama da jaque desde f8, el rey no tiene casilla libre.',
          wrongByMove: {
            f1h1: 'Das jaque en la columna h, pero el rey escapa a g8. No es mate.',
          },
        },
        {
          fen: '7k/R7/6K1/8/8/8/8/8 w - - 0 1',
          prompt: 'Mate en 1: da jaque mate con la torre.',
          solutionUci: ['a7a8'],
          hint: 'Mueve la torre a la fila 8. Tu rey cubre g7 y h7.',
          explanationCorrect: '¡Mate! La torre da jaque en la fila 8 y el rey no puede ir a g7 ni h7 (los cubre tu rey) ni a g8 (lo cubre la torre).',
          explanationWrong: 'El rey negro está en la esquina y tu rey cubre g7 y h7. Con la torre en la fila 8, no tendrá salida.',
          wrongByMove: {
            a7h7: 'Das jaque, pero el rey escapa a g8. No es mate.',
          },
        },
        {
          fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
          prompt: 'Mate en 1: es el famoso «mate del pastor». ¿Dónde das jaque mate?',
          solutionUci: ['h5f7'],
          hint: 'La dama y el alfil apuntan juntos a la misma casilla.',
          explanationCorrect: '¡Jaque mate en f7! La dama es protegida por el alfil de c4, así que el rey no puede capturarla, y sus propias piezas le cierran las demás casillas.',
          explanationWrong: 'La casilla f7 la atacan a la vez tu dama y tu alfil. Si capturas allí con la dama, el rey no puede recapturar y no tiene escapatoria.',
        },
      ],
      evaluation: [
        {
          fen: 'r5k1/8/8/8/8/8/5PPP/6K1 b - - 0 1',
          prompt: 'Juegas con negras. Mate en 1.',
          solutionUci: ['a8a1'],
          hint: 'Baja la torre hasta la primera fila: los peones blancos tapan la salida del rey.',
          explanationCorrect: '¡Jaque mate! Es el mate del pasillo, pero esta vez con negras. El rey blanco está atrapado por sus propios peones.',
          explanationWrong: 'El rey blanco está encerrado por sus peones de f2, g2 y h2. Lleva la torre a la primera fila.',
        },
        {
          fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1',
          prompt: 'Mate en 1: da jaque mate con la torre.',
          solutionUci: ['h1h8'],
          hint: 'Tu rey controla a7 y b7.',
          explanationCorrect: '¡Mate! Tu rey cubre a7 y b7 y la torre cubre toda la fila 8.',
          explanationWrong: 'Tu rey ya controla a7 y b7. Si la torre da jaque en la fila 8 no habrá escapatoria.',
          wrongByMove: {
            h1a1: 'Das jaque en la columna a, pero el rey escapa a b8. No es mate.',
          },
        },
        {
          fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
          prompt: 'Mate en 1: encuentra el mate con el caballo.',
          solutionUci: ['g5f7'],
          hint: 'El rey negro está encerrado por sus propias piezas. Busca un salto que dé jaque.',
          explanationCorrect: '¡Jaque mate! Es el «mate ahogado»: el rey está rodeado de sus propias piezas y el caballo, que no se puede capturar ni bloquear, da jaque.',
          explanationWrong: 'El rey negro no tiene casillas libres porque sus piezas se las tapan. Un salto del caballo a f7 da jaque y no se puede evitar.',
        },
      ],
    },
    {
      id: 'u03.l03',
      unitId: 'u03',
      title: 'Enroque, promoción y captura al paso',
      objective: 'Aplicar las tres jugadas especiales: enrocar, promocionar el peón y capturar al paso.',
      intro:
        'Hay tres jugadas especiales que no se parecen a ninguna otra y que a casi todos los principiantes les sorprenden: el enroque, que protege al rey; la promoción, que convierte un peón en una pieza poderosa; y la captura al paso, una forma especial de capturar un peón. Conocerlas te hará jugar con mucha más seguridad.',
      explanation: [
        {
          fen: '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1',
          arrows: [
            ['e1', 'g1'],
            ['h1', 'f1'],
            ['e1', 'c1'],
            ['a1', 'd1'],
          ],
          text: 'El enroque es la única jugada en la que mueves dos piezas a la vez: el rey se desplaza dos casillas hacia una torre y esa torre salta por encima y se coloca a su lado. Hacia la torre del lado del rey se llama enroque corto (e1-g1) y hacia la otra, enroque largo (e1-c1). Sirve para poner al rey a salvo y activar la torre. Se juega moviendo el rey dos casillas.',
        },
        {
          fen: '4kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1',
          squares: ['f1'],
          arrows: [['f8', 'f1']],
          text: 'Condiciones del enroque: ni el rey ni la torre se han movido antes; no hay piezas entre ellos; el rey no está en jaque y no pasa por casillas atacadas ni termina en una. Aquí la torre negra ataca f1, por donde pasaría el rey: el enroque corto no es legal, pero el largo sí.',
        },
        {
          fen: '4k3/P7/8/8/8/8/8/4K3 w - - 0 1',
          squares: ['a8'],
          arrows: [['a7', 'a8']],
          text: 'Cuando un peón llega a la última fila, se promociona: debes cambiarlo por una dama, torre, alfil o caballo (nunca por un rey ni por otro peón). Casi siempre se elige la dama, que es la pieza más fuerte. Con la promoción, un humilde peón puede convertirse en la pieza decisiva de la partida.',
        },
        {
          fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
          squares: ['d6'],
          arrows: [['e5', 'd6']],
          text: 'La captura al paso: si un peón avanza dos casillas y queda justo al lado de un peón rival, este puede capturarlo como si solo hubiera avanzado una. Aquí el peón negro acaba de ir de d7 a d5 y tu peón de e5 puede capturarlo en d6. Solo se puede hacer en el turno inmediatamente siguiente.',
        },
      ],
      practice: [
        {
          fen: '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1',
          prompt: 'Enroca corto (hacia la torre de h1).',
          solutionUci: ['e1g1'],
          hint: 'Mueve el rey dos casillas a la derecha.',
          explanationCorrect: '¡Enroque corto! El rey está en g1 y la torre en f1: el rey queda más seguro y la torre más activa.',
          explanationWrong: 'Para enrocar corto, mueve el rey dos casillas hacia la torre de h1: de e1 a g1. La torre saltará sola a f1.',
        },
        {
          fen: 'r3k2r/8/8/8/8/8/8/4K3 b kq - 0 1',
          prompt: 'Juegas con negras. Enroca largo (hacia la torre de a8).',
          solutionUci: ['e8c8'],
          hint: 'Mueve el rey dos casillas a la izquierda.',
          explanationCorrect: 'Muy bien. Para enrocar largo se mueve el rey dos casillas hacia la torre de a8 y la torre salta a d8.',
          explanationWrong: 'El enroque largo se hace moviendo el rey dos casillas hacia la torre de a8: de e8 a c8.',
        },
        {
          fen: '4k3/6P1/8/8/8/8/8/4K3 w - - 0 1',
          prompt: 'Promociona el peón en dama.',
          solutionUci: ['g7g8q'],
          hint: 'El peón avanza a la última fila y se transforma en una dama.',
          explanationCorrect: '¡Dama nueva! Y además da jaque. Casi siempre conviene promocionar en dama.',
          explanationWrong: 'El peón de g7 avanza a g8 y allí se promociona. Elige dama, la pieza más poderosa.',
          wrongByMove: {
            g7g8n: 'También es una promoción válida, pero la dama es mucho más fuerte. Salvo casos raros, elige siempre dama.',
          },
        },
        {
          fen: '4k3/8/8/2pP4/8/8/8/4K3 w - c6 0 1',
          prompt: 'El rival acaba de jugar c7-c5. Captura su peón al paso.',
          solutionUci: ['d5c6'],
          hint: 'Capturas como si el peón solo hubiera avanzado una casilla: tu peón termina en c6.',
          explanationCorrect: '¡Captura al paso! Tu peón terminó en c6 y el peón de c5 desapareció, aunque no estaba en c6. Solo se puede hacer justo después de que el peón avance dos.',
          explanationWrong: 'La captura al paso se hace en diagonal, a la casilla por la que pasó el peón rival: tu peón de d5 va a c6.',
          wrongByMove: {
            d5d6: 'Avanzar no captura. Hoy tocaba capturar al paso en c6.',
          },
        },
        {
          fen: '1r2k3/P7/8/8/8/8/8/4K3 w - - 0 1',
          prompt: 'Promociona capturando la torre negra.',
          solutionUci: ['a7b8q'],
          hint: 'El peón también captura en diagonal al promocionar.',
          explanationCorrect: 'Excelente: ganaste una torre y una dama nueva, y además das jaque. Un peón puede capturar y promocionar a la vez.',
          explanationWrong: 'El peón de a7 puede capturar en diagonal la torre de b8, y al llegar a la última fila se promociona.',
          wrongByMove: {
            a7a8q: 'Promocionar en a8 también funciona, pero capturar la torre de b8 te da mucho más material.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4k3/pppp4/8/8/8/8/PPPPPPPP/R3K2R w KQ - 0 1',
          prompt: 'Enroca largo (hacia la torre de a1).',
          solutionUci: ['e1c1'],
          hint: 'Mueve el rey dos casillas a la izquierda.',
          explanationCorrect: 'Correcto: enroque largo, con el rey en c1 y la torre en d1.',
          explanationWrong: 'El enroque largo es hacia la torre de a1: el rey se mueve dos casillas, de e1 a c1.',
        },
        {
          fen: '4k3/8/8/8/3pP3/8/8/4K3 b - e3 0 1',
          prompt: 'Juegas con negras. El rival acaba de jugar e2-e4. Captura su peón al paso.',
          solutionUci: ['d4e3'],
          hint: 'Capturas como si el peón blanco solo hubiera avanzado a e3.',
          explanationCorrect: 'Muy bien: capturaste al paso, y tu peón negro terminó en e3.',
          explanationWrong: 'La captura al paso lleva tu peón en diagonal a e3, la casilla por la que pasó el peón blanco.',
          wrongByMove: {
            d4d3: 'Avanzar no captura. Tocaba capturar al paso en e3.',
          },
        },
        {
          fen: '4k3/8/8/8/8/8/3p4/6K1 b - - 0 1',
          prompt: 'Juegas con negras. Promociona el peón en dama.',
          solutionUci: ['d2d1q'],
          hint: 'El peón negro llega a la fila 1.',
          explanationCorrect: 'Correcto: dama nueva con jaque. Los peones negros se promocionan en la fila 1.',
          explanationWrong: 'Tu peón de d2 baja a d1 y se promociona. Elige dama.',
        },
      ],
    },
    {
      id: 'u03.l04',
      unitId: 'u03',
      title: 'Las tablas',
      objective: 'Conocer las formas de tablas (ahogado, repetición, material insuficiente, 50 jugadas) y evitar el ahogado cuando ganas.',
      intro:
        'No todas las partidas acaban con un ganador: a veces hay empate, que en ajedrez se llama tablas. Conocer las formas de tablas te ayuda a salvar partidas que parecían perdidas y, sobre todo, a no tirar por la borda partidas ganadas con un descuido.',
      explanation: [
        {
          fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',
          squares: ['h8'],
          arrows: [
            ['f7', 'g8'],
            ['f7', 'g7'],
            ['f7', 'h7'],
          ],
          text: 'El ahogado: si al jugador que tiene el turno no le quedan jugadas legales y su rey no está en jaque, la partida termina en tablas. Aquí las negras no pueden mover el rey a g8, g7 ni h7, y no tienen más piezas: es ahogado, un empate. Es el error más doloroso cuando vas ganando: antes de dar la última jugada, comprueba que al rival le quede algún movimiento.',
        },
        {
          fen: 'r3k3/8/8/8/8/8/8/R3K3 w - - 0 1',
          arrows: [
            ['e1', 'd1'],
            ['e8', 'd8'],
          ],
          text: 'Repetición de posición: si la misma posición se repite tres veces (con el mismo jugador a mover), cualquiera de los dos puede reclamar tablas. A menudo ocurre en una persecución de jaques sin fin (jaque perpetuo): un jugador en situación peor puede salvarse repitiendo jaques.',
        },
        {
          fen: '4k3/8/8/8/8/8/8/4KB2 w - - 0 1',
          squares: ['f1'],
          text: 'Material insuficiente: si ningún bando tiene piezas suficientes para dar mate, la partida es tablas. Ocurre con rey contra rey, o rey y alfil (o caballo) contra rey. Con solo un alfil, es imposible dar mate. En cambio, una torre, una dama o un peón sí son suficientes (el peón puede promocionar).',
        },
        {
          fen: '4k3/8/8/8/8/8/8/R3K3 w - - 90 100',
          text: 'La regla de las 50 jugadas: si en 50 jugadas de cada bando (100 medias jugadas en total) no se ha movido ningún peón ni se ha capturado ninguna pieza, cualquiera de los dos puede reclamar tablas. Impide que una partida sin progreso se alargue eternamente. Por eso, cuando ganas con torre contra rey, tienes tiempo de sobra para dar mate, pero no para jugar al azar.',
        },
      ],
      practice: [
        {
          fen: '7k/5K2/8/8/8/8/6Q1/8 w - - 0 1',
          prompt: 'Mate en 1, pero cuidado: hay una jugada de dama que ahoga al rey (hay varias formas de dar mate).',
          solutionUci: ['g2h2'],
          hint: 'La dama puede dar jaque por la columna h.',
          explanationCorrect: '¡Jaque mate! Tu rey controla g8 y g7, y la dama da jaque por la columna h. Evitaste el ahogado.',
          explanationWrong: 'Cuidado con dejar al rey sin movimientos sin darle jaque: eso es ahogado. Da jaque, por ejemplo con la dama en h2.',
          wrongByMove: {
            g2g6: '¡Ahogado! El rey negro no está en jaque pero no tiene ninguna casilla libre ni más piezas: la partida es tablas. Hay que dar jaque.',
          },
        },
        {
          fen: 'k7/8/2K5/8/8/8/8/1Q6 w - - 0 1',
          prompt: 'Mate en 1: encuentra el mate (¡y evita el ahogado!).',
          solutionUci: ['b1b7'],
          hint: 'La dama debe dar jaque protegida por tu rey.',
          explanationCorrect: '¡Jaque mate! La dama en b7 está protegida por tu rey, así que no se puede capturar, y el rey negro está sin salida.',
          explanationWrong: 'Tu rey controla b7. Si la dama va a b7 da jaque protegida y es mate.',
          wrongByMove: {
            b1b6: '¡Ahogado! El rey negro no está en jaque pero no puede moverse a ninguna casilla: tablas. Hay que dar jaque.',
          },
        },
        {
          fen: '8/8/8/8/8/5K2/7k/6R1 b - - 0 1',
          prompt: 'Juegas con negras y vas perdiendo, pero la torre blanca está sin protección. Salva la partida.',
          solutionUci: ['h2g1'],
          hint: 'Si capturas la última pieza que le queda, ninguno puede dar mate.',
          explanationCorrect: '¡Tablas! Al capturar la torre solo quedan los dos reyes: material insuficiente para dar mate. Salvaste una partida perdida.',
          explanationWrong: 'La torre blanca de g1 no está protegida y está al lado de tu rey. Si la capturas, solo quedarán los dos reyes.',
        },
      ],
      evaluation: [
        {
          fen: '7k/2R5/6K1/8/8/8/8/8 w - - 0 1',
          prompt: 'Mate en 1: da mate con la torre (¡y evita el ahogado!).',
          solutionUci: ['c7c8'],
          hint: 'Da jaque en la fila 8.',
          explanationCorrect: '¡Mate! Tu rey controla g7 y h7 y la torre da jaque en la fila 8.',
          explanationWrong: 'La torre debe dar jaque al rey, no solo quitarle casillas: llévala a la fila 8.',
          wrongByMove: {
            c7g7: '¡Ahogado! El rey negro no está en jaque pero no puede moverse: tablas. Hay que dar jaque.',
          },
        },
        {
          fen: '8/8/8/8/8/8/1k6/B6K b - - 0 1',
          prompt: 'Juegas con negras y estás en jaque por el alfil. Salva la partida.',
          solutionUci: ['b2a1'],
          hint: 'Si capturas el alfil, nadie puede dar mate.',
          explanationCorrect: '¡Tablas! Al capturar el alfil solo quedan los dos reyes: material insuficiente.',
          explanationWrong: 'Captura el alfil con tu rey: sales del jaque y solo quedan los dos reyes, así que la partida es tablas.',
        },
        {
          fen: '7k/2Q5/5K2/8/8/8/8/8 w - - 0 1',
          prompt: 'Mate en 1: da mate con la dama (¡y evita el ahogado!).',
          solutionUci: ['c7g7'],
          hint: 'La dama debe dar jaque protegida por tu rey.',
          explanationCorrect: '¡Jaque mate! La dama en g7 está protegida por tu rey: el rey negro no puede capturarla ni escapar.',
          explanationWrong: 'La dama debe dar jaque protegida por el rey: Dg7 es mate.',
          wrongByMove: {
            c7f7: '¡Ahogado! El rey negro no está en jaque pero no tiene ninguna casilla libre: tablas. Hay que dar jaque.',
          },
        },
      ],
    },
  ],
};
