import type { Unit } from '../schema.js';

export const unit: Unit = {
  id: 'u02',
  order: 2,
  title: 'Capturar y proteger',
  description:
    'Aprende a capturar con cabeza: qué piezas están atacadas o protegidas, cuánto vale cada pieza y cuándo conviene (o no) hacer un cambio.',
  level: 'beginner',
  requires: ['u01'],
  lessons: [
    {
      id: 'u02.l01',
      unitId: 'u02',
      title: 'Capturar piezas',
      objective: 'Capturar piezas rivales sin protección y elegir la captura que gana más.',
      conceptIds: ['tactics.hanging_piece'],
      intro:
        'Ganar material es una de las formas más sencillas de acercarte a la victoria: si tienes más piezas que tu rival, tienes más fuerza. En esta lección aprenderás a mirar el tablero buscando piezas rivales que puedas capturar y que nadie proteja. Es el hábito más rentable para un principiante.',
      explanation: [
        {
          fen: '4k3/8/8/3n4/8/8/3R4/4K3 w - - 0 1',
          squares: ['d5'],
          arrows: [['d2', 'd5']],
          text: 'Se captura moviendo una pieza a la casilla que ocupa una pieza rival; la pieza capturada sale de la partida. Aquí la torre blanca puede comerse el caballo negro de d5. Fíjate en que el caballo no tiene ninguna pieza que lo proteja: es una captura gratuita.',
        },
        {
          fen: '4k3/8/8/8/3P4/8/3R4/4K3 w - - 0 1',
          squares: ['d4'],
          arrows: [['d2', 'd3']],
          text: 'Nunca puedes capturar tus propias piezas. Aquí la torre no puede ir a d4 porque ahí está tu peón: solo puede llegar hasta d3. Capturar es siempre opcional; lo importante es hacerlo cuando conviene.',
        },
        {
          fen: '4k3/8/8/6q1/8/8/8/2B1K3 w - - 0 1',
          squares: ['g5'],
          arrows: [
            ['c1', 'g5'],
            ['g5', 'c1'],
          ],
          text: 'Cuando dos piezas se atacan entre sí, quien tiene el turno captura primero. Aquí la dama negra ataca tu alfil, pero es tu turno: capturas la dama con el alfil y ganas una pieza que vale mucho más. Antes de mover, comprueba siempre si puedes capturar algo.',
        },
      ],
      practice: [
        {
          fen: '4k3/8/8/8/8/8/1b6/1R2K3 w - - 0 1',
          prompt: 'Captura el alfil negro, que nadie protege.',
          solutionUci: ['b1b2'],
          hint: 'Está justo delante de tu torre.',
          explanationCorrect: 'Muy bien: un alfil gratis. Si una pieza rival no está protegida, puedes capturarla sin que te la devuelvan.',
          explanationWrong: 'El alfil de b2 está sin protección y justo delante de tu torre. Captúralo.',
        },
        {
          fen: '4k3/8/2p1r3/8/3N4/8/8/6K1 w - - 0 1',
          prompt: 'Tu caballo puede capturar dos piezas. Elige la captura que más material gana.',
          solutionUci: ['d4e6'],
          hint: 'Una pieza vale mucho más que un peón. Pero comprueba también si te pueden recapturar.',
          explanationCorrect: 'Eso es: el caballo se come una torre (5 puntos) y nadie puede recapturar. El peón valía solo 1.',
          explanationWrong: 'Hay una captura mucho mejor. La torre de e6 vale 5 y no está protegida; el peón vale solo 1.',
          wrongByMove: {
            d4c6: 'Ganas un peón, pero la torre negra recaptura tu caballo: pierdes 3 y ganas 1. La torre de e6 era mucho mejor.',
          },
        },
        {
          fen: '4k3/8/8/8/2n5/8/8/4KB2 w - - 0 1',
          prompt: 'Captura el caballo negro con tu alfil.',
          solutionUci: ['f1c4'],
          hint: 'El caballo está en la diagonal del alfil.',
          explanationCorrect: 'Perfecto: el alfil recorrió la diagonal y capturó un caballo sin protección.',
          explanationWrong: 'El caballo negro está en c4, en la diagonal que sale de tu alfil de f1 (e2, d3, c4).',
        },
        {
          fen: '4k3/8/8/4b3/3P4/8/8/4K3 w - - 0 1',
          prompt: 'Tu peón está atacado por el alfil negro. ¡Captura al atacante!',
          solutionUci: ['d4e5'],
          hint: 'El peón captura en diagonal.',
          explanationCorrect: '¡Genial! Un peón (1 punto) captura un alfil (3 puntos). A veces la mejor defensa es capturar a la pieza que ataca.',
          explanationWrong: 'El alfil de e5 ataca tu peón, pero tu peón también lo ataca a él, en diagonal. Captúralo.',
          wrongByMove: {
            d4d5: 'Si avanzas, el alfil sigue en juego. Tu peón captura en diagonal: el alfil está en e5.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4k3/8/8/8/8/6q1/8/K5R1 w - - 0 1',
          prompt: 'Captura la dama negra con tu torre.',
          solutionUci: ['g1g3'],
          hint: 'Está en tu misma columna.',
          explanationCorrect: 'Correcto: ¡una dama gratis! Mira cómo ella también atacaba a tu torre: quien mueve primero gana.',
          explanationWrong: 'La dama negra de g3 está en tu columna g y no está protegida. Captúrala con la torre.',
        },
        {
          fen: '4k3/8/8/2r5/5p2/3N4/8/6K1 w - - 0 1',
          prompt: 'Tu caballo puede capturar dos piezas. Elige la captura que más gana.',
          solutionUci: ['d3c5'],
          hint: 'Compara el valor de la torre y del peón.',
          explanationCorrect: 'Muy bien: capturaste la torre, que vale 5, en lugar del peón, que vale 1.',
          explanationWrong: 'Las dos capturas son posibles, pero la torre de c5 vale cinco veces más que el peón de f4 y nadie la protege.',
          wrongByMove: {
            d3f4: 'Ganas un peón, pero dejas escapar una torre. Fíjate siempre en el valor de lo que capturas.',
          },
        },
        {
          fen: '4k3/8/8/8/2n1r3/3P4/8/6K1 w - - 0 1',
          prompt: 'Tu peón puede capturar dos piezas. Elige la captura que más material gana.',
          solutionUci: ['d3e4'],
          hint: 'Una de las piezas vale 5, la otra 3. Y si capturas el caballo, la torre recaptura.',
          explanationCorrect: '¡Excelente! El peón captura una torre y ya nadie puede recapturar. Cambiar un peón por una torre es una ganancia enorme.',
          explanationWrong: 'La torre de e4 vale más que el caballo de c4. Además, si capturas el caballo, la torre lo recaptura.',
          wrongByMove: {
            d3c4: 'Ganas un caballo, pero la torre negra recaptura tu peón. La captura de la torre era mejor.',
          },
        },
      ],
    },
    {
      id: 'u02.l02',
      unitId: 'u02',
      title: 'Piezas atacadas y protegidas',
      objective: 'Reconocer si una pieza está atacada o protegida y defender las tuyas.',
      conceptIds: ['tactics.hanging_piece'],
      intro:
        'La mayoría de las partidas entre principiantes se deciden por una pieza que se queda «colgada», es decir, atacada y sin protección. Aprender a ver qué piezas están atacadas y cuáles protegidas te ahorrará muchos disgustos y te hará ganar piezas gratis.',
      explanation: [
        {
          fen: '4k3/8/8/8/8/2n5/8/3RK3 w - - 0 1',
          squares: ['d1'],
          arrows: [['c3', 'd1']],
          text: 'Una pieza está atacada cuando una pieza rival podría capturarla en su próximo turno. Aquí el caballo negro ataca tu torre de d1. Si no haces nada, el caballo se la comerá. Antes de cada jugada, mira qué piezas tuyas están atacadas.',
        },
        {
          fen: '4k3/8/4p3/3n4/8/8/8/3QK3 w - - 0 1',
          squares: ['d5'],
          arrows: [
            ['d1', 'd5'],
            ['e6', 'd5'],
          ],
          text: 'Una pieza está protegida cuando, si la capturan, puedes recapturar. El caballo negro de d5 lo protege el peón de e6. Si tu dama lo captura, el peón recaptura y habrías cambiado una dama (9) por un caballo (3). Nunca captures una pieza protegida con una pieza que vale mucho más.',
        },
        {
          fen: '4k3/8/5n2/8/4P3/8/3P4/4K3 w - - 0 1',
          squares: ['e4'],
          arrows: [
            ['f6', 'e4'],
            ['d2', 'd3'],
          ],
          text: 'El caballo negro ataca tu peón de e4 y nada lo protege. Tienes varias formas de defenderte: mover la pieza atacada, proteger la pieza (aquí con d3, porque un peón protege en diagonal), capturar a la pieza atacante o interponer algo. Elige la que mejor encaje con tu plan.',
        },
      ],
      practice: [
        {
          fen: 'b3k3/8/8/8/4N3/8/3P4/4K3 w - - 0 1',
          prompt: 'Tu caballo de e4 está atacado por el alfil y no está protegido. Protégelo con un peón.',
          solutionUci: ['d2d3'],
          hint: 'Los peones protegen las casillas en diagonal delante de ellos.',
          explanationCorrect: 'Muy bien. El peón de d3 protege el caballo: si el alfil lo captura, recapturas el alfil.',
          explanationWrong: 'Para proteger el caballo de e4, un peón debe poder capturar en esa casilla. El peón de d2 debe ir a d3.',
          wrongByMove: {
            d2d4: 'En d4 el peón no protege a e4: los peones protegen en diagonal, no hacia delante.',
          },
        },
        {
          fen: '4k3/2p5/3b1r2/8/4N3/8/8/6K1 w - - 0 1',
          prompt: 'Tu caballo puede capturar la torre o el alfil, pero una de las dos está protegida. Elige la captura que gana material.',
          solutionUci: ['e4f6'],
          hint: 'Mira qué pieza está defendida por un peón.',
          explanationCorrect: 'Eso es: la torre de f6 no estaba protegida, así que la ganas gratis, y encima das jaque. El alfil sí tenía protector.',
          explanationWrong: 'El alfil de d6 está protegido por el peón de c7; la torre de f6 no tiene protección. Captura la torre.',
          wrongByMove: {
            e4d6: 'El alfil estaba protegido por el peón de c7: ganas un alfil, pero pierdes tu caballo. La torre sin protección era mejor.',
          },
        },
        {
          fen: '4k3/8/8/8/8/2p5/3B4/4K3 w - - 0 1',
          prompt: 'Un peón negro ataca tu alfil. ¿Puedes eliminarlo?',
          solutionUci: ['d2c3'],
          hint: 'Tu alfil también ve esa casilla.',
          explanationCorrect: 'Perfecto: capturaste al atacante y ganaste un peón. Si alguien te ataca, mira si puedes capturarlo.',
          explanationWrong: 'El peón de c3 ataca tu alfil, pero tu alfil también puede capturarlo, porque está en su diagonal.',
        },
        {
          fen: '4k3/8/1n6/8/2B5/8/8/R3K3 w - - 0 1',
          prompt: 'El caballo ataca tu alfil, que no está protegido. Protégelo llevando la torre a c1.',
          solutionUci: ['a1c1'],
          hint: 'La torre protege las casillas de su columna.',
          explanationCorrect: 'Muy bien. Ahora, si el caballo captura el alfil, la torre recaptura: ya no es una pérdida gratuita.',
          explanationWrong: 'Lleva la torre a c1: desde esa casilla protege el alfil de c4 por la columna c.',
          wrongByMove: {
            a1a4: 'La torre en a4 protegería el alfil, pero el caballo negro de b6 la ataca y la captura. Elige una casilla segura.',
            c4f7: 'El rey negro captura tu alfil en f7: está protegido por él. No es una defensa.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4k3/8/4p3/3n3b/8/8/8/3QK3 w - - 0 1',
          prompt: 'Tu dama puede capturar el caballo o el alfil. Elige la captura que gana material.',
          solutionUci: ['d1h5'],
          hint: 'Una de las dos piezas está protegida por un peón.',
          explanationCorrect: 'Muy bien: el alfil de h5 estaba sin protección y además diste jaque. El caballo lo protegía el peón de e6.',
          explanationWrong: 'El caballo de d5 está protegido por el peón de e6; el alfil de h5 no tiene protección. Captura el alfil.',
          wrongByMove: {
            d1d5: 'Si capturas el caballo, el peón de e6 recaptura tu dama: pierdes 9 por 3. Siempre mira si la pieza está protegida.',
          },
        },
        {
          fen: '4k3/8/8/8/6p1/5N2/8/4K3 w - - 0 1',
          prompt: 'El peón negro ataca tu caballo. Ponlo a salvo en e5.',
          solutionUci: ['f3e5'],
          hint: 'Dos casillas arriba y una a la izquierda.',
          explanationCorrect: 'Correcto. En e5 el caballo está fuera del alcance del peón y bien colocado en el centro.',
          explanationWrong: 'El peón de g4 ataca f3. Salta con el caballo a e5, una casilla donde nadie lo ataca.',
        },
        {
          fen: '4k3/8/1p6/r7/2b5/2Q5/8/6K1 w - - 0 1',
          prompt: 'Tu dama puede capturar la torre o el alfil. Elige la captura que gana material.',
          solutionUci: ['c3c4'],
          hint: 'La torre está protegida por un peón. ¿Y el alfil?',
          explanationCorrect: 'Muy bien: el alfil estaba solo. La torre tenía al peón de b6 como protector y la dama habría caído.',
          explanationWrong: 'La torre de a5 está protegida por el peón de b6; el alfil de c4 no tiene ningún protector.',
          wrongByMove: {
            c3a5: 'Capturas la torre, pero el peón de b6 recaptura tu dama: pierdes 9 por 5.',
          },
        },
      ],
    },
    {
      id: 'u02.l03',
      unitId: 'u02',
      title: 'El valor de las piezas',
      objective: 'Usar el valor de las piezas (1, 3, 3, 5, 9) para decidir qué capturas convienen.',
      conceptIds: ['tactics.bad_exchange'],
      intro:
        'No todas las piezas valen lo mismo. Para saber si una captura o un cambio te conviene, los jugadores usan una tabla de puntos muy sencilla. Cuando la tengas en la cabeza, podrás decidir en segundos si un cambio es bueno, malo o igualado.',
      explanation: [
        {
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          squares: ['a2', 'b1', 'c1', 'a1', 'd1'],
          text: 'La tabla de valores: peón = 1, caballo = 3, alfil = 3, torre = 5 y dama = 9. El rey no tiene valor porque perderlo es perder la partida. Un caballo vale tres peones; una torre, cinco; la dama, nueve. Esta tabla es una guía muy útil para decidir cambios.',
        },
        {
          fen: '4k3/8/8/3n4/4P3/8/8/4K3 w - - 0 1',
          squares: ['d5'],
          arrows: [['e4', 'd5']],
          text: 'Capturar una pieza de más valor con una de menos valor es un gran negocio. Aquí un peón (1) puede capturar un caballo (3): ganas 2 puntos y nadie recaptura. Los peones son las piezas ideales para atacar a otras.',
        },
        {
          fen: '4k3/8/4p3/3p4/8/8/8/3QK3 w - - 0 1',
          squares: ['d5'],
          arrows: [
            ['d1', 'd5'],
            ['e6', 'd5'],
          ],
          text: 'Cuidado con lo contrario: capturar con una pieza muy valiosa algo protegido. La dama puede comerse el peón de d5, pero el peón de e6 recaptura y habrías dado 9 puntos por 1. Un mal cambio como este se llama «perder material».',
        },
        {
          fen: 'r7/1k6/8/8/8/8/1K6/R7 w - - 0 1',
          arrows: [
            ['a1', 'a8'],
            ['a8', 'a1'],
          ],
          text: 'Un cambio es igualado cuando das y recibes lo mismo: torre por torre (5 por 5), caballo por alfil (3 por 3). Aquí, si capturas con la torre, el rey recaptura: han salido las dos torres. No ganas ni pierdes. Si vas ganando, cambiar piezas suele simplificar; si vas perdiendo, conviene evitarlo.',
        },
      ],
      practice: [
        {
          fen: '4k3/p7/8/8/R2n4/8/8/6K1 w - - 0 1',
          prompt: 'Tu torre puede capturar un peón o un caballo, y ninguno está protegido. Elige la captura que gana más.',
          solutionUci: ['a4d4'],
          hint: 'Caballo = 3, peón = 1.',
          explanationCorrect: 'Muy bien: el caballo vale 3 y el peón solo 1. Cuando todo es gratis, coge lo que más vale.',
          explanationWrong: 'Las dos son gratis, pero el caballo vale tres veces más que el peón.',
          wrongByMove: {
            a4a7: 'Ganas un peón (1 punto), pero dejas escapar un caballo (3 puntos). Mira siempre cuánto vale lo que capturas.',
          },
        },
        {
          fen: '4k3/8/4p3/3p4/b7/8/8/3QK3 w - - 0 1',
          prompt: 'Elige la captura que más material gana: tu dama puede capturar un peón o un alfil.',
          solutionUci: ['d1a4'],
          hint: 'El peón de d5 está protegido por el peón de e6.',
          explanationCorrect: 'Correcto: el alfil estaba sin protección y, además, atacaba a tu dama. Capturarlo es gratis y da jaque.',
          explanationWrong: 'El peón de d5 está protegido: si lo capturas con la dama, la pierdes por un peón. Captura el alfil de a4.',
          wrongByMove: {
            d1d5: 'El peón de e6 recaptura tu dama: pierdes 9 puntos y ganas 1. Nunca cambies una pieza valiosa por un peón.',
          },
        },
        {
          fen: '4k3/8/4p3/3q4/8/8/8/3RK3 w - - 0 1',
          prompt: 'Cambia tu torre por la dama negra.',
          solutionUci: ['d1d5'],
          hint: 'La dama negra ataca tu torre, pero es tu turno.',
          explanationCorrect: 'Excelente. Aunque el peón recaptura tu torre, has dado 5 puntos y recibido 9: ganas 4 puntos netos.',
          explanationWrong: 'La dama negra de d5 está en tu columna y vale 9. Aunque el peón la proteja, cambiar una torre (5) por una dama (9) es muy buen negocio.',
        },
        {
          fen: '4k3/8/8/8/3p4/2N5/8/4K3 b - - 0 1',
          prompt: 'Juegas con negras. Tu peón puede capturar el caballo blanco.',
          solutionUci: ['d4c3'],
          hint: 'Los peones negros capturan en diagonal hacia abajo.',
          explanationCorrect: 'Muy bien: un peón (1) por un caballo (3) es una gran ganancia.',
          explanationWrong: 'Tu peón de d4 ataca el caballo de c3, en diagonal hacia abajo a la izquierda. Captúralo.',
        },
      ],
      evaluation: [
        {
          fen: '4k3/8/8/1p1q4/2P5/8/8/4K3 w - - 0 1',
          prompt: 'Tu peón puede capturar un peón o la dama. Elige la mejor captura.',
          solutionUci: ['c4d5'],
          hint: 'La dama vale 9.',
          explanationCorrect: '¡Una dama por nada! Un peón que captura una dama es la mejor relación posible.',
          explanationWrong: 'Tu peón de c4 ataca la dama de d5 (9 puntos) y también un peón (1 punto). Captura la dama.',
          wrongByMove: {
            c4b5: 'Ganas un peón, pero la dama negra seguía a tu alcance. Mira siempre cuánto vale lo que capturas.',
          },
        },
        {
          fen: '4k3/3r4/8/7n/6Q1/8/8/6K1 w - - 0 1',
          prompt: 'Tu dama puede capturar una torre o un caballo. Elige la captura que gana material.',
          solutionUci: ['g4h5'],
          hint: 'La torre vale más, pero el rey la protege.',
          explanationCorrect: 'Muy bien: el caballo estaba solo y encima das jaque. La torre de d7 estaba protegida por el rey, y tu dama habría caído.',
          explanationWrong: 'La torre de d7 está protegida por el rey: si la capturas con la dama, la pierdes. Captura el caballo, que no tiene protección.',
          wrongByMove: {
            g4d7: 'El rey recaptura tu dama: pierdes 9 y ganas 5. Antes de capturar, comprueba si la pieza está protegida.',
          },
        },
        {
          fen: '4k3/8/8/8/2b5/3P4/8/4K3 w - - 0 1',
          prompt: 'Captura el alfil negro que ataca a tu peón.',
          solutionUci: ['d3c4'],
          hint: 'Capturas en diagonal.',
          explanationCorrect: 'Correcto: un peón (1) ha capturado un alfil (3). Tu peón atacaba a su alfil igual que él al tuyo, pero te tocaba mover.',
          explanationWrong: 'Tu peón de d3 y el alfil de c4 se atacan mutuamente. Como te toca a ti, captura primero.',
        },
      ],
    },
    {
      id: 'u02.l04',
      unitId: 'u02',
      title: 'Cambiar piezas con sentido',
      objective: 'Calcular atacantes y defensores y empezar los cambios con la pieza de menos valor.',
      conceptIds: ['tactics.bad_exchange'],
      intro:
        'Muchas capturas desencadenan una cadena: yo capturo, tú recapturas, yo vuelvo a capturar. Para saber si compensa, hay que contar cuántas piezas atacan una casilla y cuántas la defienden. Es un cálculo corto que cualquier jugador puede hacer y que te ahorra muchos errores.',
      explanation: [
        {
          fen: '4k3/8/4p3/3p4/4P3/8/8/4K3 w - - 0 1',
          squares: ['d5'],
          arrows: [
            ['e4', 'd5'],
            ['e6', 'd5'],
          ],
          text: 'Un cambio es una serie de capturas en la misma casilla. Aquí, si tu peón captura en d5, el peón de e6 recaptura: has dado un peón y has recibido un peón. Es un cambio igualado. Decide si te conviene según la situación: por ejemplo, cambiar ayuda cuando ya vas ganando.',
        },
        {
          fen: '4k3/8/4p3/3n4/8/2N5/8/3RK3 w - - 0 1',
          squares: ['d5'],
          arrows: [
            ['c3', 'd5'],
            ['d1', 'd5'],
            ['e6', 'd5'],
          ],
          text: 'Cuenta atacantes y defensores. El caballo de d5 tiene un defensor (el peón de e6) y dos atacantes (el caballo y la torre). Empieza siempre capturando con la pieza de menos valor: Cxd5, el peón recaptura, y entonces la torre captura el peón. Resultado: ganas un caballo y un peón, y pierdes un caballo.',
        },
        {
          fen: '4k3/8/8/1p6/2n5/8/8/4KB2 w - - 0 1',
          squares: ['c4'],
          arrows: [
            ['f1', 'c4'],
            ['b5', 'c4'],
          ],
          text: 'Aquí el caballo de c4 está protegido por un peón. Si lo capturas con el alfil, el peón recaptura: cambias alfil por caballo (3 por 3), un cambio igualado. Antes de capturar, pregúntate siempre: ¿me recapturan? ¿Y qué ocurre después?',
        },
      ],
      practice: [
        {
          fen: '4k3/8/3p4/4b3/8/3N4/8/4R1K1 w - - 0 1',
          prompt: 'Cambia con la pieza de menos valor: captura el alfil con el caballo, recaptura el peón y vuelve a capturar con la torre.',
          solutionUci: ['d3e5', 'd6e5', 'e1e5'],
          hint: 'Empieza con el caballo, no con la torre.',
          explanationCorrect: 'Muy bien. Ganas un alfil y un peón (4 puntos) y pierdes un caballo (3): ganas 1 punto neto. Si hubieras empezado con la torre, habrías perdido 5 por 3.',
          explanationWrong: 'Hay que empezar la cadena con la pieza que menos vale. Captura con el caballo; cuando el peón recaptura, vuelve a capturar con la torre.',
          wrongByMove: {
            e1e5: 'Si empiezas con la torre, el peón la recaptura: pierdes 5 puntos por un alfil de 3. Empieza con el caballo.',
          },
        },
        {
          fen: '4k3/8/8/8/8/5b2/8/4KQ2 w - - 0 1',
          prompt: 'El alfil negro acaba de capturar tu caballo en f3. Recaptura.',
          solutionUci: ['f1f3'],
          hint: 'Tu dama ve esa casilla por la columna f.',
          explanationCorrect: 'Perfecto: recapturaste la pieza. En un cambio, no te olvides de volver a capturar: así el cambio queda igualado.',
          explanationWrong: 'El alfil de f3 no está protegido. Tu dama lo puede capturar subiendo por la columna f.',
        },
        {
          fen: '4k3/8/4b3/3r4/4P3/8/8/3QK3 w - - 0 1',
          prompt: 'Captura la torre con tu peón; si el alfil recaptura, captura con la dama.',
          solutionUci: ['e4d5', 'e6d5', 'd1d5'],
          hint: 'Empieza con el peón: es la pieza que menos vale.',
          explanationCorrect: 'Excelente. Ganas torre y alfil (8 puntos) y solo pierdes un peón. Empezar por la pieza más barata es la clave.',
          explanationWrong: 'Si empiezas con la dama, el alfil la recaptura y pierdes 9 por 5. Empieza con el peón.',
          wrongByMove: {
            d1d5: 'Si capturas con la dama, el alfil recaptura: pierdes 9 y ganas 5. Con el peón es mucho mejor.',
          },
        },
      ],
      evaluation: [
        {
          fen: '4k3/8/8/4p3/3b4/8/2N5/3R3K w - - 0 1',
          prompt: 'Cambia con la pieza de menos valor: caballo toma alfil, el peón recaptura y tú capturas con la torre.',
          solutionUci: ['c2d4', 'e5d4', 'd1d4'],
          hint: 'Empieza con el caballo.',
          explanationCorrect: 'Muy bien: ganas alfil y peón y pierdes un caballo. Los cambios se empiezan con la pieza más barata.',
          explanationWrong: 'Empieza con el caballo, que vale menos que la torre. Después de que el peón recapture, captura con la torre.',
          wrongByMove: {
            d1d4: 'Si capturas primero con la torre, el peón recaptura y pierdes 5 por 3. Empieza con el caballo.',
          },
        },
        {
          fen: '4k3/8/8/8/8/2n5/3P4/4K3 w - - 0 1',
          prompt: 'El caballo negro acaba de capturar tu alfil en c3. Recaptura con el peón.',
          solutionUci: ['d2c3'],
          hint: 'Los peones capturan en diagonal.',
          explanationCorrect: 'Correcto: has recuperado la pieza. El cambio queda igualado: 3 por 3.',
          explanationWrong: 'El caballo de c3 no está protegido y tu peón de d2 lo captura en diagonal.',
        },
        {
          fen: '4k3/8/1p6/2r5/8/8/5B2/2R3K1 w - - 0 1',
          prompt: 'Captura la torre con la pieza de menos valor, recaptura con la torre si el peón se come el alfil.',
          solutionUci: ['f2c5', 'b6c5', 'c1c5'],
          hint: 'El alfil vale 3 y la torre 5: empieza por el alfil.',
          explanationCorrect: 'Excelente: ganas dos piezas (torre y peón) por un alfil. Cuenta siempre quién ataca y quién defiende.',
          explanationWrong: 'La torre de c5 está protegida por un peón. Empieza con el alfil: si el peón recaptura, tu torre captura el peón.',
          wrongByMove: {
            c1c5: 'Si empiezas con la torre, el peón la recaptura (pierdes 5 por 5) y tu ganancia total baja a 1 punto, frente a 3 si empiezas con el alfil.',
          },
        },
      ],
    },
  ],
};
