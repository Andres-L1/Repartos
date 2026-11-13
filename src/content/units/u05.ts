import type { Unit } from '../schema.js';

/**
 * Unidad 5 · Tácticas básicas (iniciación, 400-800 Elo).
 * Cada ejercicio táctico se verifica por código: la solución es la mejor jugada por búsqueda de material
 * (profundidad 3 con búsqueda de capturas) con margen de al menos un peón sobre la segunda mejor.
 */
export const unit: Unit = {
  id: 'u05',
  order: 5,
  title: 'Tácticas básicas',
  description:
    'Gana material con tácticas sencillas: piezas colgadas y cambios desfavorables, horquillas, clavadas y jaques a la descubierta. Aprenderás a verlas en tus partidas y a no sufrirlas.',
  level: 'initiation',
  requires: ['u04'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u05.l01',
      unitId: 'u05',
      title: 'Piezas colgadas y cambios desfavorables',
      objective:
        'Antes de capturar o mover, contar atacantes y defensores: ganar las piezas sin defensa y evitar cambios que pierden material.',
      conceptIds: ['tactics.hanging_piece', 'tactics.bad_exchange'],
      intro:
        'La mayoría de las partidas de principiantes se deciden por piezas que se quedan sin protección. Una pieza «colgada» es una pieza que el rival puede capturar gratis. La táctica más barata del ajedrez es aprovechar las del rival y no dejar las tuyas. Y no toda captura es buena: si ganas un caballo pero pierdes una torre, has perdido material. La herramienta es siempre la misma: contar cuántas piezas atacan una casilla, cuántas la defienden y qué valen.',
      explanation: [
        {
          fen: '4k3/8/8/8/3n4/8/8/3RK3 w - - 0 1',
          text: 'Pieza colgada. El caballo negro de d4 está atacado por la torre de d1 y no lo defiende ninguna pieza. Puedes capturarlo sin pagar nada: Rxd4. Antes de cada jugada hazte dos preguntas: ¿hay alguna pieza rival atacada y sin defensa? y ¿hay alguna pieza mía en esa situación?',
          squares: ['d4'],
          arrows: [['d1', 'd4']],
        },
        {
          fen: '4k3/8/2p5/1n6/8/8/8/1R2K3 w - - 0 1',
          text: 'Atacada no es lo mismo que colgada. La torre ataca al caballo de b5, pero el peón de c6 lo defiende. Si juegas Rxb5 cxb5, has dado una torre (5 puntos) por un caballo (3): pierdes 2 puntos. Regla: no captures con una pieza de más valor una pieza defendida por una de menos valor.',
          squares: ['b5', 'c6'],
          arrows: [
            ['b1', 'b5'],
            ['c6', 'b5'],
          ],
        },
        {
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          text: 'Valores: peón 1, caballo 3, alfil 3, torre 5, dama 9. Un cambio es bueno si recibes más de lo que das y malo si recibes menos. Antes de capturar, cuenta: ¿cuántas de mis piezas atacan esa casilla y cuántas de las suyas la defienden? Si defienden más que atacan, o si tu primera pieza vale más que la suya, no captures.',
          squares: ['a1', 'd1', 'b1', 'c1'],
        },
      ],
      practice: [
        {
          fen: '4k3/8/8/1b6/8/3Q4/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. Una pieza negra está atacada y nadie la defiende. Captúrala.',
          solutionUci: ['d3b5'],
          hint: 'Sigue la diagonal de tu dama.',
          explanationCorrect:
            'Correcto: Qxb5+. El alfil estaba colgado: tu dama lo atacaba y ninguna pieza negra lo defendía. Además, la captura da jaque.',
          explanationWrong:
            'Hay una forma de ganar el alfil sin pagar nada: captúralo ahora, antes de que se mueva.',
          wrongByMove: {
            d3d8: 'Qd8+ da jaque, pero el rey negro captura la dama (Kxd8): una pieza propia queda colgada por tu propia jugada.',
          },
        },
        {
          fen: '4k3/1p6/2b5/8/3n4/8/8/2RQK3 w - - 0 1',
          prompt: 'Juegan blancas. Hay dos capturas posibles y solo una gana material. Elige bien.',
          solutionUci: ['d1d4'],
          hint: 'Cuenta defensores: ¿qué pieza negra está atacada y sin defensa?',
          explanationCorrect:
            'Correcto: Qxd4. El caballo estaba colgado. En cambio, Rxc6 pierde material: el peón de b7 defiende el alfil y cambiarías una torre por un alfil.',
          explanationWrong:
            'Esa jugada no gana material limpio. Una de las piezas negras está defendida por un peón y la otra no tiene defensa; captura la que está sola.',
          wrongByMove: {
            c1c6: 'Rxc6 bxc6: has dado una torre (5) por un alfil (3). El alfil estaba defendido por el peón de b7.',
          },
        },
        {
          fen: '2rqk3/8/8/3N4/8/2B5/1P6/4K3 b - - 0 1',
          prompt: 'Juegan negras. Dos capturas posibles; una gana una pieza, la otra pierde material.',
          solutionUci: ['d8d5'],
          hint: 'Mira qué pieza blanca está sin defensor y cuál está defendida por un peón.',
          explanationCorrect:
            'Correcto: Qxd5. El caballo blanco estaba colgado. Rxc3 sería un error: el peón de b2 defiende el alfil y cambiarías torre por alfil.',
          explanationWrong:
            'No era la mejor captura. Compara: el alfil de c3 lo defiende un peón; el caballo de d5, nadie.',
          wrongByMove: {
            c8c3: 'Rxc3 bxc3: pierdes una torre (5) por un alfil (3). El peón de b2 lo defendía.',
          },
        },
        {
          fen: '3rk3/8/8/3n4/4P3/8/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. El caballo está defendido por una torre, pero aun así puedes ganar material. ¿Cómo?',
          solutionUci: ['e4d5'],
          hint: 'Capturar con la pieza de menor valor cambia el balance.',
          explanationCorrect:
            'Correcto: exd5. Aunque la torre recaptura el peón, tú ganas un caballo (3) por un peón (1). Cuando una pieza está defendida, captúrala con la de menor valor.',
          explanationWrong:
            'Capturar con el peón es la forma más barata: aunque la recapturen, das 1 y recibes 3.',
        },
      ],
      evaluation: [
        {
          fen: '3rk3/8/8/8/8/3B4/8/4K3 b - - 0 1',
          prompt: 'Juegan negras. Hay una pieza blanca atacada sin defensa. Gana material.',
          solutionUci: ['d8d3'],
          hint: 'La torre y el alfil se miran por la columna d.',
          explanationCorrect:
            'Correcto: Rxd3. El alfil estaba colgado, atacado por la torre y sin ninguna defensa.',
          explanationWrong:
            'Hay una captura que gana una pieza sin pagar nada: revisa qué pieza blanca está atacada y nadie la defiende.',
          wrongByMove: {
            e8f8: 'Ese movimiento no aprovecha el alfil colgado; la oportunidad desaparece en cuanto el alfil se mueva o se defienda.',
          },
        },
        {
          fen: '6k1/8/4p3/3p4/6b1/8/8/3QK3 w - - 0 1',
          prompt: 'Juegan blancas. Hay dos capturas posibles con la dama; una es un error. Elige la buena.',
          solutionUci: ['d1g4'],
          hint: 'Mira qué pieza está defendida por un peón.',
          explanationCorrect:
            'Correcto: Qxg4. El alfil estaba colgado. Qxd5 sería un error: el peón de e6 lo defiende y perderías la dama por un peón.',
          explanationWrong:
            'Una de las capturas pierde la dama. Cuenta defensores antes de capturar.',
          wrongByMove: {
            d1d5: 'Qxd5 exd5: has dado una dama (9) por un peón (1). El peón de d5 estaba defendido.',
          },
        },
        {
          fen: '6rk/8/8/6B1/8/8/6PK/8 b - - 0 1',
          prompt: 'Juegan negras. Hay una pieza blanca atacada por tu torre y sin defensa. Gánala.',
          solutionUci: ['g8g5'],
          hint: 'La torre de g8 y el alfil están en la misma columna.',
          explanationCorrect:
            'Correcto: Rxg5. El alfil estaba colgado: atacado por la torre y sin ninguna defensa.',
          explanationWrong:
            'Hay una pieza blanca atacada y sin defensa: captúrala antes de que se mueva o se proteja.',
          wrongByMove: {
            h8g7: 'Un movimiento de rey no aprovecha el alfil colgado; la oportunidad desaparece en cuanto el alfil se mueva.',
          },
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u05.l02',
      unitId: 'u05',
      title: 'La horquilla',
      objective:
        'Encontrar ataques dobles (sobre todo con caballo, peón y con jaque) y evitar dejar dos piezas al alcance de la misma pieza rival.',
      conceptIds: ['tactics.fork'],
      intro:
        'Una horquilla es un ataque a dos piezas a la vez con una sola pieza. El rival solo puede mover una y tú te llevas la otra. Es la táctica más frecuente en las partidas de principiantes y casi siempre la hace un caballo, porque salta y no puede ser bloqueado. Si, además, una de las piezas atacadas es el rey, el rival ni siquiera puede elegir: tiene que responder al jaque.',
      explanation: [
        {
          fen: '4k3/2N5/8/3q4/8/8/8/4K3 b - - 0 1',
          text: 'Horquilla de caballo con jaque. El caballo de c7 ataca a la vez al rey (e8) y a la dama (d5). Las negras deben salir del jaque, y después el caballo captura la dama. Un caballo en c7 (o f7, o e7, o d6…) es una amenaza clásica: busca casillas desde las que el caballo ataque a dos piezas importantes.',
          squares: ['e8', 'd5'],
          arrows: [
            ['c7', 'e8'],
            ['c7', 'd5'],
          ],
        },
        {
          fen: '4k3/8/2n1n3/3P4/8/8/8/K7 b - - 0 1',
          text: 'Horquilla de peón. El peón blanco de d5 ataca a la vez los dos caballos (c6 y e6). Los caballos no pueden capturar el peón, porque ninguno ataca d5. Las negras solo pueden salvar uno de ellos. La horquilla de peón es la más barata: se gana una pieza por un peón.',
          squares: ['c6', 'e6'],
          arrows: [
            ['d5', 'c6'],
            ['d5', 'e6'],
          ],
        },
        {
          fen: '4k3/8/8/8/1n6/8/8/2R1K3 w - - 0 1',
          text: 'Cómo prevenirlas. Aquí las negras amenazan Nd3+, que atacaría a la vez al rey y a la torre de c1. Antes de mover, mira los saltos del caballo rival: ¿alguna casilla ataca a dos de tus piezas? Aquí valdría Rd1, que controla d3 (si Nd3+, Rxd3), o poner el rey y la torre fuera del alcance del salto.',
          squares: ['d3'],
          arrows: [
            ['b4', 'd3'],
            ['c1', 'd1'],
          ],
        },
      ],
      practice: [
        {
          fen: '4k3/8/N7/3q4/8/8/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. Un salto del caballo ataca al rey y a la dama a la vez.',
          solutionUci: ['a6c7'],
          hint: 'Busca la casilla desde la que el caballo ataca e8 y d5.',
          explanationCorrect:
            'Correcto: Nc7+. Da jaque al rey y ataca a la dama. Tras salir del jaque, capturas la dama: una horquilla clásica.',
          explanationWrong:
            'Hay una jugada que ataca al rey y a la dama a la vez. Revisa los saltos del caballo desde a6.',
          wrongByMove: {
            a6b4: 'Nb4 ataca solo a la dama, y la dama simplemente se aparta. La horquilla necesita atacar al rey y a la dama.',
          },
        },
        {
          fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. Un salto del caballo da jaque y ataca una torre.',
          solutionUci: ['b5c7'],
          hint: 'La torre está en a8: ¿desde dónde la ataca un caballo y a la vez da jaque a e8?',
          explanationCorrect:
            'Correcto: Nc7+. Ataca al rey y a la torre de a8; cuando el rey se mueva, Nxa8 gana la torre.',
          explanationWrong:
            'Busca una casilla desde la que el caballo ataque el rey (e8) y la torre (a8) a la vez.',
          wrongByMove: {
            b5d6: 'Nd6+ da jaque, pero no ataca la torre de a8: no hay horquilla y el rey simplemente se aparta.',
          },
        },
        {
          fen: '4k3/8/2n1n3/8/3P4/8/8/K7 w - - 0 1',
          prompt: 'Juegan blancas. Un peón puede atacar a dos piezas a la vez.',
          solutionUci: ['d4d5'],
          hint: 'Los dos caballos están a ambos lados de una misma casilla.',
          explanationCorrect:
            'Correcto: d5. El peón ataca los dos caballos y ninguno puede capturarlo; ganas una pieza por nada.',
          explanationWrong:
            'Fíjate en que los dos caballos están a ambos lados de d5: un peón allí los ataca a la vez.',
          wrongByMove: {
            a1b2: 'Un movimiento del rey no hace nada; la oportunidad está en el peón.',
          },
        },
        {
          fen: '4k3/8/8/8/1n6/8/8/2Q1K3 b - - 0 1',
          prompt: 'Juegan negras. Un salto del caballo da jaque y ataca la dama.',
          solutionUci: ['b4d3'],
          hint: 'Mira las casillas a las que puede ir el caballo: una ataca e1 y c1 a la vez.',
          explanationCorrect:
            'Correcto: Nd3+. Ataca al rey y a la dama de c1; después del jaque capturas la dama (aunque te la recapturen, ganas dama por caballo).',
          explanationWrong:
            'Revisa los saltos del caballo desde b4: uno ataca a la vez al rey y a la dama.',
          wrongByMove: {
            b4a2: 'Na2 ataca la dama pero no da jaque: la dama se aparta y no ganas nada.',
          },
        },
      ],
      evaluation: [
        {
          fen: '2r3k1/8/8/5N2/8/8/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. Un caballo, un rey y una torre: ¿qué casilla ataca a los dos?',
          solutionUci: ['f5e7'],
          hint: 'El rey está en g8 y la torre en c8.',
          explanationCorrect:
            'Correcto: Ne7+. Ataca al rey (g8) y a la torre (c8); tras la respuesta al jaque, Nxc8.',
          explanationWrong:
            'No es la mejor jugada. Busca una casilla desde la que el caballo ataque g8 y c8.',
        },
        {
          fen: '4k3/8/8/8/6n1/8/8/3R3K b - - 0 1',
          prompt: 'Juegan negras. Un salto del caballo da jaque y ataca una torre.',
          solutionUci: ['g4f2'],
          hint: 'El rey está en h1 y la torre en d1.',
          explanationCorrect:
            'Correcto: Nf2+. Ataca al rey (h1) y a la torre (d1). El rey tiene que moverse y capturas la torre.',
          explanationWrong:
            'No es la mejor. Busca una casilla desde la que el caballo ataque h1 y d1 a la vez.',
        },
        {
          fen: '4k3/8/8/8/1n1n4/8/2P5/7K w - - 0 1',
          prompt: 'Juegan blancas. Un peón puede atacar a los dos caballos.',
          solutionUci: ['c2c3'],
          hint: 'Los caballos están a ambos lados de c3.',
          explanationCorrect:
            'Correcto: c3. El peón ataca los dos caballos a la vez y ninguno lo puede capturar. Una pieza gratis a cambio de un peón.',
          explanationWrong:
            'Mira las casillas: c3 está justo en medio de los dos caballos. Un peón allí los ataca a la vez.',
          wrongByMove: {
            c2c4: 'c4 no ataca ninguna pieza; la horquilla está una casilla más cerca.',
          },
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u05.l03',
      unitId: 'u05',
      title: 'La clavada',
      objective:
        'Reconocer una clavada, distinguir la absoluta de la relativa y aprovecharla atacando a la pieza clavada.',
      conceptIds: ['tactics.pin'],
      intro:
        'Una pieza está clavada cuando no puede (o no debe) moverse porque dejaría expuesta a otra más valiosa que está detrás en la misma línea. Si lo que hay detrás es el rey, la clavada es absoluta y mover la pieza es ilegal. La gracia táctica es que la pieza clavada no puede escapar ni defender bien: se la puede atacar una y otra vez hasta ganarla.',
      explanation: [
        {
          fen: '4k3/4n3/8/8/8/8/8/4R1K1 b - - 0 1',
          text: 'Clavada absoluta. El caballo de e7 está entre la torre blanca de e1 y el rey negro de e8. Si se moviera, el rey quedaría en jaque, y eso es ilegal: el caballo no puede moverse en absoluto. Una pieza clavada de forma absoluta no puede capturar, no puede escapar y apenas puede defender.',
          squares: ['e7'],
          arrows: [['e1', 'e8']],
        },
        {
          fen: '3qk3/8/5n2/6B1/8/8/8/4K3 b - - 0 1',
          text: 'Clavada relativa. El caballo de f6 está entre el alfil de g5 y la dama de d8. Moverlo es legal, pero perderías la dama por un alfil. Por eso se considera clavado. La clavada relativa protege menos que la absoluta, pero también limita muchísimo a la pieza clavada.',
          squares: ['f6'],
          arrows: [['g5', 'd8']],
        },
        {
          fen: '4k3/1p6/2n5/1B6/3P4/8/8/4K3 w - - 0 1',
          text: 'Cómo se aprovecha. El caballo de c6 está clavado por el alfil de b5 (el rey está en e8 y d7 está libre). Si juegas d5, atacas al caballo con un peón: no puede huir porque no puede moverse, y no se puede defender bien. La receta: ataca la pieza clavada con algo de menos valor.',
          squares: ['c6'],
          arrows: [
            ['b5', 'e8'],
            ['d4', 'd5'],
          ],
        },
      ],
      practice: [
        {
          fen: '4k3/1p6/2n5/1B1P4/8/8/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. El caballo de c6 está clavado contra el rey. Gana material.',
          solutionUci: ['d5c6'],
          hint: 'Capturar con el peón es lo más barato.',
          explanationCorrect:
            'Correcto: dxc6. El caballo clavado no podía escaparse; capturas con un peón (1) una pieza de 3. Si bxc6, Bxc6+ gana además un peón.',
          explanationWrong:
            'La pieza clavada no puede huir. Ataca con la pieza de menor valor, es decir, con el peón.',
          wrongByMove: {
            b5c6: 'Bxc6+ bxc6: cambias alfil por caballo y pierdes la clavada. Captura con el peón.',
          },
        },
        {
          fen: '4k3/1p6/2n5/1B2p3/8/5N2/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. El peón de e5 solo está defendido por el caballo, que está clavado. Aprovéchalo.',
          solutionUci: ['f3e5'],
          hint: 'Una pieza clavada no puede recapturar.',
          explanationCorrect:
            'Correcto: Nxe5. El caballo clavado no puede recapturar (sería ilegal), así que ganas el peón y amenazas Nxc6+ y Bxc6+.',
          explanationWrong:
            'El peón de e5 parece defendido, pero su defensor está clavado. Capturar el peón sale gratis.',
          wrongByMove: {
            b5c6: 'Bxc6+ bxc6 Nxe5: ganas un peón, pero Nxe5 de entrada gana el peón y mantiene la clavada.',
          },
        },
        {
          fen: '4k3/8/8/3p4/1b6/2N5/1P6/4K3 b - - 0 1',
          prompt: 'Juegan negras. El caballo de c3 está clavado contra el rey por el alfil. Atácalo con un peón.',
          solutionUci: ['d5d4'],
          hint: 'El peón de d5 puede avanzar y atacar la casilla c3.',
          explanationCorrect:
            'Correcto: d4. El peón ataca al caballo clavado, que no puede moverse. La amenaza dxc3 gana una pieza.',
          explanationWrong:
            'Para ganar la pieza clavada hay que atacarla de nuevo con algo de menos valor: el peón de d5 puede hacerlo.',
          wrongByMove: {
            b4c3: 'Bxc3+ bxc3: cambias el alfil por el caballo y pierdes la clavada. Lo mejor era atacar al caballo con el peón.',
          },
        },
        {
          fen: '4k3/3r4/8/1B6/8/5N2/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. La torre de d7 está clavada contra el rey. Gana material.',
          solutionUci: ['f3e5'],
          hint: 'Ataca la torre clavada con el caballo; no puede huir.',
          explanationCorrect:
            'Correcto: Ne5. El caballo ataca la torre, que está clavada y no puede moverse. Si el rey se aparta, Nxd7 gana una torre por un caballo.',
          explanationWrong:
            'Ganas más atacando la torre clavada con una pieza de menos valor que capturándola directamente.',
          wrongByMove: {
            b5d7: 'Bxd7+ Kxd7: ganas una torre por un alfil (2 puntos), pero Ne5 ganaba mucho más.',
          },
        },
      ],
      evaluation: [
        {
          fen: '3k4/6p1/5n2/4P1B1/8/8/8/4K3 w - - 0 1',
          prompt: 'Juegan blancas. El caballo de f6 está clavado contra el rey. Gana material.',
          solutionUci: ['e5f6'],
          hint: 'Captura la pieza clavada con el peón.',
          explanationCorrect:
            'Correcto: exf6. El caballo clavado no podía moverse. Si gxf6, Bxf6+ gana además un peón.',
          explanationWrong:
            'El caballo está clavado y no puede huir; un peón puede capturarlo.',
          wrongByMove: {
            g5f6: 'Bxf6+ gxf6 exf6: cambias alfil por caballo y ganas menos. Mejor capturar con el peón.',
          },
        },
        {
          fen: '4k3/8/5n2/8/1b6/8/3R4/4K3 b - - 0 1',
          prompt: 'Juegan negras. La torre de d2 está clavada contra el rey. Gana material.',
          solutionUci: ['f6e4'],
          hint: 'Ataca la torre clavada con el caballo.',
          explanationCorrect:
            'Correcto: Ne4. El caballo ataca la torre clavada, que no puede moverse. Ganas torre por caballo.',
          explanationWrong:
            'Ataca la torre clavada con el caballo, una pieza de menos valor.',
          wrongByMove: {
            b4d2: 'Bxd2+ Kxd2: ganas una torre por un alfil, pero Ne4 era mejor.',
          },
        },
        {
          fen: '4k3/4b3/8/8/8/2N5/4R3/4K3 w - - 0 1',
          prompt: 'Juegan blancas. El alfil de e7 está clavado contra el rey. Gana material.',
          solutionUci: ['c3d5'],
          hint: 'Ataca el alfil clavado con el caballo y la torre lo protegerá desde atrás.',
          explanationCorrect:
            'Correcto: Nd5. El caballo ataca al alfil clavado, que está atacado dos veces (caballo y torre) y defendido una sola (rey). Ganas una pieza.',
          explanationWrong:
            'Ataca el alfil clavado con una pieza de menor valor, apoyada por la torre.',
          wrongByMove: {
            e2e7: 'Rxe7+ Kxe7: das una torre (5) por un alfil (3). Ataca con el caballo, que vale menos.',
          },
        },
      ],
    },

    // ───────────────────────────── l04 ─────────────────────────────
    {
      id: 'u05.l04',
      unitId: 'u05',
      title: 'El jaque a la descubierta',
      objective:
        'Reconocer cuándo una pieza tapa la línea de otra de largo alcance y usar su movimiento (con jaque o captura) para ganar material.',
      conceptIds: ['tactics.discovered_attack'],
      intro:
        'Una pieza de largo alcance (torre, alfil o dama) puede quedar tapada por otra pieza de su propio bando. Cuando la pieza que tapa se mueve, descubre el ataque. Si descubre un jaque, el rival tiene que responder al jaque y no puede atender lo que amenaza la pieza que se movió. Es una táctica muy poderosa porque dos amenazas llegan a la vez, y es tan fácil de olvidar como de ejecutar.',
      explanation: [
        {
          fen: '4k3/8/8/8/4N3/8/8/4R1K1 w - - 0 1',
          text: 'La torre de e1 apunta al rey negro, pero su propio caballo de e4 le tapa la línea. Cualquier salto del caballo descubre un jaque de la torre. Ese jaque no se puede ignorar, así que el caballo puede aprovechar su movimiento para hacer algo más: capturar una pieza o amenazar otra.',
          squares: ['e4'],
          arrows: [['e1', 'e8']],
        },
        {
          fen: '4k3/8/3N4/8/8/8/8/4R1K1 b - - 0 1',
          text: 'Esta es la posición tras mover el caballo a d6. El rey negro está en jaque por la torre. Además, el caballo de d6 ataca otras casillas (b7, c8, f7, e8…). Las negras deben responder al jaque y no pueden evitar lo que el caballo amenaza. La clave: mover la pieza que tapa con la mejor amenaza posible.',
          squares: ['d6'],
          arrows: [['e1', 'e8']],
        },
        {
          fen: 'rnbqkb1r/pppp1ppp/8/4N3/4n3/8/PPPPQPPP/RNB1KB1R b KQkq - 3 4',
          text: 'Una trampa clásica. La dama blanca de e2 apunta al caballo negro de e4, y detrás está el rey de e8 con el caballo blanco de e5 en medio. Si las negras responden con Nf6?? (retirando el caballo), el caballo de e5 se mueve con Nc6+ y descubre un jaque de la dama: después de salir del jaque, el caballo captura la dama de d8. Antes de mover, mira siempre qué pieza tuya está en una línea con el rey.',
          squares: ['e4', 'e5', 'e2'],
          arrows: [
            ['e2', 'e8'],
            ['e5', 'c6'],
          ],
        },
      ],
      practice: [
        {
          fen: '4k3/8/3q4/8/4N3/8/8/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. Mueve el caballo con jaque a la descubierta y captura algo.',
          solutionUci: ['e4d6'],
          hint: 'El caballo puede capturar una pieza y descubrir el jaque a la vez.',
          explanationCorrect:
            'Correcto: Nxd6+. El caballo captura la dama y descubre el jaque de la torre. Las negras tienen que responder al jaque y no pueden recuperar la dama.',
          explanationWrong:
            'El caballo puede moverse capturando la dama y descubriendo el jaque a la vez. Busca esa captura.',
          wrongByMove: {
            e4g5: 'Ng5+ también descubre jaque, pero no captura la dama: las negras salen del jaque y la dama se salva.',
          },
        },
        {
          fen: '4k3/8/6q1/8/4B3/8/8/4R2K w - - 0 1',
          prompt: 'Juegan blancas. El alfil tapa la torre. Úsalo para ganar la dama.',
          solutionUci: ['e4g6'],
          hint: 'El alfil puede capturar la dama mientras descubre el jaque.',
          explanationCorrect:
            'Correcto: Bxg6+. Descubres el jaque de la torre al mismo tiempo que capturas la dama. Las negras no pueden hacer las dos cosas.',
          explanationWrong:
            'El alfil captura la dama y descubre el jaque en la misma jugada. Busca la diagonal.',
          wrongByMove: {
            e4f5: 'Bf5+ descubre el jaque, pero no captura la dama directamente; Bxg6+ la gana ya.',
          },
        },
        {
          fen: 'rnbqkb1r/pppp1ppp/5n2/4N3/8/8/PPPPQPPP/RNB1KB1R w KQkq - 4 5',
          prompt: 'Juegan blancas. Las negras retiraron el caballo y olvidaron un detalle. Gana material.',
          solutionUci: ['e5c6'],
          hint: 'La dama de e2 apunta al rey negro; el caballo de e5 la tapa.',
          explanationCorrect:
            'Correcto: Nc6+. Descubre el jaque de la dama de e2 y ataca la dama de d8. Tras salir del jaque, Nxd8 gana la dama.',
          explanationWrong:
            'La dama de e2 ve al rey negro, y tu caballo está en medio. Muévelo atacando algo valioso.',
          wrongByMove: {
            e5g6: 'Ng6+ también descubre jaque, pero gana menos que Nc6+, que ataca directamente la dama.',
          },
        },
      ],
      evaluation: [
        {
          fen: '3k4/8/5q2/3N4/8/8/8/3RK3 w - - 0 1',
          prompt: 'Juegan blancas. El caballo tapa la torre. Úsalo para ganar la dama.',
          solutionUci: ['d5f6'],
          hint: 'El caballo puede capturar la dama y descubrir el jaque a la vez.',
          explanationCorrect:
            'Correcto: Nxf6+. Capturas la dama y descubres el jaque de la torre por la columna d.',
          explanationWrong:
            'Busca una captura del caballo que a la vez libere la columna d para la torre.',
          wrongByMove: {
            d5e7: 'Ne7+ descubre jaque pero no captura la dama; la dama se salva.',
          },
        },
        {
          fen: '4q1k1/5ppp/8/8/4N3/8/8/4R1K1 w - - 0 1',
          prompt: 'Juegan blancas. La torre apunta a la dama negra, pero tu caballo está en medio.',
          solutionUci: ['e4f6'],
          hint: 'Mueve el caballo con jaque: así las negras no pueden salvar la dama.',
          explanationCorrect:
            'Correcto: Nf6+. El caballo da jaque al rey y descubre el ataque de la torre sobre la dama. Si gxf6, Rxe8+ gana la dama por un caballo.',
          explanationWrong:
            'Mover el caballo sin dar jaque deja que la dama negra capture la torre. Busca el movimiento que dé jaque.',
          wrongByMove: {
            e4g5: 'Ng5 no da jaque: la dama negra captura la torre (Qxe1+) y pierdes material.',
          },
        },
        {
          fen: '4r2k/8/8/8/4n3/8/3Q4/4K3 b - - 0 1',
          prompt: 'Juegan negras. Tu caballo tapa la torre. Úsalo para ganar la dama.',
          solutionUci: ['e4d2'],
          hint: 'El caballo puede capturar la dama y descubrir el jaque a la vez.',
          explanationCorrect:
            'Correcto: Nxd2+. Capturas la dama y descubres el jaque de la torre. El rey tiene que salir del jaque; recaptura el caballo, pero has ganado una dama por un caballo.',
          explanationWrong:
            'Busca una captura del caballo que libere la columna e para la torre.',
          wrongByMove: {
            e4c3: 'Nc3+ descubre jaque, pero no captura la dama: pierdes la oportunidad de ganarla.',
          },
        },
      ],
    },
  ],
};
