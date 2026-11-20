import type { Unit } from '../schema.js';

/**
 * Unidad 13 · Finales de rey y peón (básico, 800-1100 Elo). Pendiente de validación de profesores.
 * Verificada de forma exacta con la tablebase de Lichess (Syzygy): en cada jugada del alumno se aceptan exactamente
 * las jugadas que conservan el resultado teórico (la de la línea y las de `alt`), y las respuestas del rival son de
 * las que más resisten (scripts/verify-finales.mts; test/content/unitsE.test.ts con la caché de test/fixtures/tablebase/).
 */
export const unit: Unit = {
  id: 'u13',
  order: 10,
  title: 'Finales de rey y peón',
  description:
    'Los finales con reyes y peones: la regla del cuadrado para saber si un rey alcanza a un peón, la oposición entre los reyes y las casillas clave. Verás también el rey delante del peón y el peón de torre.',
  level: 'basic',
  requires: ['u09'],
  lessons: [
    // ───────────────────────────── l01 ─────────────────────────────
    {
      id: 'u13.l01',
      unitId: 'u13',
      title: 'La regla del cuadrado',
      objective: 'Saber, sin calcular jugada a jugada, si un rey alcanza a un peón pasado que corre a coronar.',
      conceptIds: ['endgame.king_pawn'],
      intro:
        'Un peón pasado es el que no tiene peones rivales delante ni en las columnas de al lado: solo el rey puede pararlo. Para saber si llega a tiempo, imagina un cuadrado. Un lado va desde el peón hasta su casilla de coronación y el cuadrado se dibuja hacia el lado del rey rival. Si el rey puede entrar en el cuadrado con su jugada, alcanza al peón; si no, el peón corona. Ojo: si le toca mover al bando del peón, cuenta el cuadrado desde la casilla a la que va a avanzar.',
      explanation: [
        {
          fen: '8/8/8/5k2/P7/8/8/7K w - - 0 1',
          text: 'Juegan blancas. El peón de a4 avanza a a5 y su cuadrado pasa a ser a5, d5, d8 y a8. El rey negro de f5 no puede entrar en él en una jugada: el peón corona y las blancas ganan.',
          squares: ['a5', 'd5', 'd8', 'a8'],
          arrows: [['a4', 'a8']],
        },
        {
          fen: '8/8/8/5k2/P7/8/8/7K b - - 0 1',
          text: 'La misma posición, pero juegan negras. Ahora el cuadrado se cuenta con el peón en a4: a4, e4, e8 y a8. El rey entra en él con Ke4, Ke5 o Ke6 y alcanza al peón antes de que corone: tablas.',
          squares: ['a4', 'e4', 'e8', 'a8'],
          arrows: [['f5', 'e5']],
        },
      ],
      practice: [
        {
          fen: '8/8/8/4K3/p7/8/8/7k w - - 0 1',
          prompt: 'Juegan blancas. El peón negro de a4 corre a coronar en a1. Entra en su cuadrado con el rey para alcanzarlo.',
          solutionUci: ['e5d4'],
          hint: 'Dibuja el cuadrado del peón: parte de su casilla y llega a la última fila. ¿Qué casilla de ese cuadrado alcanza tu rey?',
          explanationCorrect:
            'Correcto: Kd4. El rey ya está dentro del cuadrado: si a3, Kc3, y si a2, Kb2. El peón no llega a coronar y la partida es tablas.',
          explanationWrong:
            'Con esa jugada el rey se queda fuera del cuadrado del peón y este corona antes de que llegue.',
          wrongByMove: {
            e5d5: 'Kd5 se acerca, pero d5 está fuera del cuadrado: tras a3 el rey ya no alcanza al peón.',
          },
        },
        {
          fen: '8/8/8/7p/2K5/8/8/k7 b - - 0 1',
          prompt: 'Juegan negras. Tu peón de h5 quiere coronar en h1 y el rey blanco está en c4. Gana la partida.',
          solutionUci: ['h5h4'],
          hint: 'Si el peón avanza ya, su cuadrado cambia: dibújalo. ¿Puede el rey blanco entrar en él?',
          explanationCorrect:
            'Correcto: h4. Con el peón en h4, el cuadrado es h4, e4, e1 y h1, y el rey de c4 no puede entrar en él en una jugada: el peón corona.',
          explanationWrong:
            'Esa jugada pierde un tiempo. Con el peón aún en h5, el cuadrado es h5, d5, d1 y h1, y el rey blanco entra en él (por ejemplo, con Kd4): alcanza al peón.',
        },
        {
          fen: '8/8/8/5K2/1p6/8/8/7k w - - 0 1',
          prompt: 'Juegan blancas. El peón negro de b4 corre a coronar en b1. Alcánzalo con el rey: tienes que acertar en cada jugada.',
          solutionUci: ['f5e4', 'b4b3', 'e4d3', 'b3b2', 'd3c2'],
          hint: 'Primero entra en el cuadrado del peón. Después, síguelo en diagonal hacia su casilla de coronación.',
          explanationCorrect:
            'Correcto: Ke4, Kd3 y Kc2. El rey entra en el cuadrado y sigue al peón de cerca; si corona, Kxb1. Tablas.',
          explanationWrong:
            'Con esa jugada el rey queda fuera del cuadrado del peón y ya no lo alcanza. Cada jugada del rey tiene que mantenerlo dentro del cuadrado.',
        },
      ],
      evaluation: [
        {
          fen: '8/8/8/8/7P/2k5/8/K7 b - - 0 1',
          prompt: 'Juegan negras. El peón blanco de h4 corre a coronar en h8. ¿Puede tu rey alcanzarlo?',
          solutionUci: ['c3d4'],
          hint: 'Dibuja el cuadrado del peón: de su casilla hasta la última fila.',
          explanationCorrect:
            'Correcto: Kd4. El rey entra en el cuadrado por su esquina: si h5, Ke5, y el rey alcanza al peón antes de h8. Tablas.',
          explanationWrong: 'Esa jugada deja al rey fuera del cuadrado: el peón corona antes de que llegue.',
          wrongByMove: {
            c3d3: 'Kd3 se acerca, pero d3 está fuera del cuadrado: tras h5 el rey ya no llega.',
          },
        },
        {
          fen: 'k7/8/8/2K5/6p1/8/8/8 b - - 0 1',
          prompt: 'Juegan negras. Gana la partida con tu peón de g4.',
          solutionUci: ['g4g3'],
          hint: 'Cuenta el cuadrado del peón si avanza ahora y si espera una jugada.',
          explanationCorrect:
            'Correcto: g3. Con el peón en g3, el cuadrado es g3, e3, e1 y g1, y el rey de c5 no puede entrar en él: el peón corona.',
          explanationWrong:
            'Esa jugada da tiempo al rey blanco: con el peón aún en g4, Kd4 entra en el cuadrado (g4, d4, d1, g1) y alcanza al peón.',
        },
        {
          fen: '7K/8/k1P5/7p/8/8/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Tu rey está lejos del peón de h5 y tu peón de c6 está a punto de caer. Salva la partida.',
          solutionUci: ['h8g7'],
          hint: 'Busca una jugada que acerque el rey a la vez al peón de h5 y a tu peón de c6.',
          explanationCorrect:
            'Correcto: Kg7. El rey se acerca a la vez a los dos peones. Si las negras corren con el peón (h4, h3...), el rey blanco llega a e7 a tiempo de apoyar a c6 y corona también. Si van a por tu peón, ganas el tiempo que necesitas para entrar en el cuadrado de h5. Tablas: es el famoso estudio de Réti.',
          explanationWrong:
            'Esa jugada no sirve a la vez para los dos peones. El rey no llega a tiempo de parar el peón de h5 ni de apoyar el de c6, y las negras ganan.',
          wrongByMove: {
            h8h7: 'Kh7 se acerca al peón de h5, pero ya no puede ayudar a tu peón de c6: las negras ganan.',
          },
        },
      ],
    },

    // ───────────────────────────── l02 ─────────────────────────────
    {
      id: 'u13.l02',
      unitId: 'u13',
      title: 'La oposición',
      objective: 'Usar la oposición entre los reyes para defender un final de rey y peón contra rey, o para ganarlo.',
      conceptIds: ['endgame.king_pawn'],
      intro:
        'Los reyes nunca pueden estar en casillas vecinas. Cuando están en la misma columna con una sola casilla entre ellos, se dice que están en oposición. La tiene el bando al que NO le toca mover: el otro está obligado a ceder paso. En los finales de rey y peón contra rey, el defensor hace tablas si mantiene la oposición frente al rey rival. El atacante gana si consigue que el defensor tenga que mover y ceder.',
      explanation: [
        {
          fen: '8/4k3/8/4K3/4P3/8/8/8 w - - 0 1',
          text: 'Los reyes están en oposición en la columna e, con e6 en medio. Juegan blancas y no pueden avanzar: el peón de e4 está tapado por su propio rey y, vaya donde vaya el rey blanco, el negro vuelve a ponerse delante. Son tablas.',
          squares: ['e5', 'e6', 'e7'],
        },
        {
          fen: '8/4k3/8/4K3/4P3/8/8/8 b - - 0 1',
          text: 'La misma posición con negras al turno: ahora la oposición es de las blancas. El rey negro tiene que ceder paso: si Kd7, Kf6, y si Kf7, Kd6. El rey blanco avanza delante de su peón y las blancas ganan.',
          squares: ['e5', 'e6', 'e7'],
          arrows: [['e5', 'f6']],
        },
      ],
      practice: [
        {
          fen: '8/8/8/4k3/8/3K4/4P3/8 b - - 0 1',
          prompt: 'Juegan negras. El rey blanco quiere adelantarse a su peón. Toma la oposición y haz tablas.',
          solutionUci: ['e5d5'],
          hint: 'Pon tu rey enfrente del rey blanco, en su misma columna, con una casilla entre los dos.',
          explanationCorrect:
            'Correcto: Kd5. Los reyes quedan frente a frente en la columna d, con d4 en medio, y juegan las blancas: su rey no puede pasar. Tablas.',
          explanationWrong:
            'Con esa jugada el rey blanco gana la oposición y se adelanta a su peón, y el final se pierde. Busca la casilla enfrente de su rey.',
        },
        {
          fen: '8/8/4k3/8/4K3/8/4P3/8 w - - 0 1',
          prompt: 'Juegan blancas. Los reyes están en oposición, pero te toca mover a ti. Gana la partida.',
          solutionUci: ['e2e3'],
          alt: ['e4d4', 'e4f4'],
          hint: 'Tu peón todavía puede avanzar una casilla sin estorbar a tu rey.',
          explanationCorrect:
            'Correcto. e3 es una jugada de espera: los reyes siguen en oposición, pero ahora le toca al negro y tiene que ceder paso. Kd4 y Kf4 también ganan, porque el peón conserva sus jugadas de espera para más adelante.',
          explanationWrong:
            'Esa jugada retira el rey: el negro se pone delante de tu peón y mantiene la oposición. Tablas. Con el peón en e2 te queda una jugada de espera.',
        },
        {
          fen: '8/8/4k3/8/3K4/3P4/8/8 b - - 0 1',
          prompt: 'Juegan negras. Defiende el final manteniendo la oposición en cada jugada.',
          solutionUci: ['e6d6', 'd4c4', 'd6c6', 'd3d4', 'c6d6'],
          hint: 'Cada vez que el rey blanco se mueva, ponte enfrente de él con una casilla entre los dos.',
          explanationCorrect:
            'Correcto: Kd6, Kc6 y Kd6. Siempre enfrente del rey blanco y, cuando el peón llega a d4, delante de él. El rey blanco no consigue pasar: tablas.',
          explanationWrong: 'Esa jugada cede la oposición: el rey blanco se adelanta a su peón y el final se pierde.',
        },
      ],
      evaluation: [
        {
          fen: '8/8/2k5/8/3K4/3P4/8/8 b - - 0 1',
          prompt: 'Juegan negras. Haz tablas.',
          solutionUci: ['c6d6'],
          hint: 'La casilla buena está en la columna del rey blanco.',
          explanationCorrect: 'Correcto: Kd6. Tomas la oposición frente al rey de d4 y le cierras el paso: tablas.',
          explanationWrong:
            'Con esa jugada el rey blanco se adelanta a su peón (a c5, d5 o e5) y gana. Ponte enfrente de él.',
        },
        {
          fen: '8/8/8/5k2/8/4K3/5P2/8 b - - 0 1',
          prompt: 'Juegan negras. El rey blanco se ha colocado a un lado de su peón. ¿Dónde pones el tuyo?',
          solutionUci: ['f5e5'],
          hint: 'Ponte enfrente del rey blanco.',
          explanationCorrect:
            'Correcto: Ke5. Oposición en la columna e: el rey blanco no puede pasar por d4, e4 ni f4, que tocan a tu rey. Tablas.',
          explanationWrong: 'Esa jugada cede la oposición: el rey blanco avanza delante de su peón y gana.',
        },
        {
          fen: '8/8/5k2/8/4K3/4P3/8/8 b - - 0 1',
          prompt: 'Juegan negras. Mantén la oposición hasta asegurar las tablas.',
          solutionUci: ['f6e6', 'e4f4', 'e6f6', 'e3e4', 'f6e6'],
          hint: 'Responde a cada jugada del rey blanco poniéndote enfrente.',
          explanationCorrect:
            'Correcto: Ke6, Kf6 y Ke6. Tu rey siempre enfrente del blanco y, cuando el peón avanza a e4, delante de él. Tablas.',
          explanationWrong: 'Esa jugada cede la oposición: el rey blanco se adelanta a su peón y el final se pierde.',
        },
      ],
    },

    // ───────────────────────────── l03 ─────────────────────────────
    {
      id: 'u13.l03',
      unitId: 'u13',
      title: 'Casillas clave, rey delante y peón de torre',
      objective:
        'Llevar el rey a las casillas clave por delante del peón y reconocer cuándo el peón de torre solo da tablas.',
      conceptIds: ['endgame.king_pawn'],
      intro:
        'Las casillas clave de un peón son las casillas que, si las ocupa el rey del atacante, aseguran la coronación haga lo que haga el defensor. Para un peón que todavía no ha pasado de su cuarta fila, son las tres casillas situadas dos filas por delante de él. Por eso en estos finales el rey va delante y el peón espera: así el peón guarda jugadas de espera para ganar la oposición. El peón de torre (columnas a y h) es la excepción: si el rey defensor llega a la esquina de coronación, son tablas.',
      explanation: [
        {
          fen: '4k3/8/8/4K3/4P3/8/8/8 w - - 0 1',
          text: 'Las casillas clave del peón de e4 son d6, e6 y f6. El rey blanco llega a cualquiera de ellas en una jugada (Kd6, Ke6 o Kf6) y el peón corona, por mucho que defienda el rey negro.',
          squares: ['d6', 'e6', 'f6'],
        },
        {
          fen: '7k/8/6K1/7P/8/8/8/8 w - - 0 1',
          text: 'Con el peón de torre no basta con llegar delante: el rey negro ya está en h8, la casilla de coronación. Si el peón avanza, el negro va y viene entre g8 y h8. Cuando el peón llegue a h7, el negro queda ahogado o el rey blanco tiene que soltar el peón. Tablas.',
          squares: ['h8', 'g8'],
        },
      ],
      practice: [
        {
          fen: '3k4/8/8/2K5/3P4/8/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Lleva el rey a una casilla clave de tu peón de d4.',
          solutionUci: ['c5d6'],
          alt: ['c5c6'],
          hint: 'Las casillas clave de un peón en la cuarta fila están dos filas por delante: en su columna y en las dos vecinas.',
          explanationCorrect:
            'Correcto. Desde d6 o desde c6 tu rey ocupa una casilla clave y el peón corona. Las dos valen igual.',
          explanationWrong: 'Esa jugada no lleva el rey a una casilla clave y el negro llega a tiempo de defender.',
          wrongByMove: {
            d4d5: 'd5 adelanta el peón antes que el rey: el rey negro se pone delante y son tablas.',
          },
        },
        {
          fen: '8/8/3k4/8/8/4K3/3P4/8 w - - 0 1',
          prompt: 'Juegan blancas. ¿Avanzas el peón o el rey? Elige la jugada que gana.',
          solutionUci: ['e3d4'],
          alt: ['e3e4'],
          hint: 'El rey va delante; el peón espera atrás para tener jugadas de espera.',
          explanationCorrect:
            'Correcto: el rey avanza (Kd4 o Ke4) y el peón se queda en d2. Así el rey se acerca a las casillas clave y el peón conserva sus jugadas de espera para ganar la oposición más tarde.',
          explanationWrong:
            'Esa jugada no gana. Si avanzas el peón, gastas sus jugadas de espera y el rey negro se pone delante; si el rey no avanza, el negro mantiene la oposición. Primero el rey.',
        },
        {
          fen: '8/4k3/6K1/8/7P/8/8/8 b - - 0 1',
          prompt: 'Juegan negras. Las blancas tienen un peón de torre. Salva la partida.',
          solutionUci: ['e7f8'],
          hint: 'Busca el camino más corto hacia la esquina h8.',
          explanationCorrect:
            'Correcto: Kf8. Tu rey se acerca a g8 y h8, y con el rey en la esquina el peón de torre no puede coronar: tablas.',
          explanationWrong:
            'Con esa jugada el rey blanco llega antes a g7 y te cierra el camino a la esquina: el peón corona.',
        },
      ],
      evaluation: [
        {
          fen: '5k2/8/8/6K1/5P2/8/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Gana la partida.',
          solutionUci: ['g5f6'],
          alt: ['g5g6'],
          hint: 'Las casillas clave de un peón en la cuarta fila están dos filas por delante: en su columna y en las dos vecinas.',
          explanationCorrect:
            'Correcto. Kf6 o Kg6 llevan el rey a una casilla clave del peón de f4, y la coronación ya no se puede impedir.',
          explanationWrong: 'Esa jugada no lleva el rey a una casilla clave y el negro consigue defenderse.',
          wrongByMove: {
            g5f5: 'Kf5 se pone delante del peón, pero no en una casilla clave: tras Kf7 el negro toma la oposición y hace tablas.',
          },
        },
        {
          fen: '8/8/2k5/8/8/2K5/3P4/8 w - - 0 1',
          prompt: 'Juegan blancas. ¿Peón o rey? Gana la partida.',
          solutionUci: ['c3d4'],
          alt: ['c3c4'],
          hint: 'Recuerda: primero avanza el rey.',
          explanationCorrect:
            'Correcto: Kd4 o Kc4. El rey avanza hacia las casillas clave y el peón de d2 se queda con sus jugadas de espera.',
          explanationWrong:
            'Esa jugada no gana: si avanza el peón, el rey negro se planta delante; si el rey no avanza, el negro mantiene la oposición. Primero el rey.',
        },
        {
          fen: '8/3k4/1K6/8/P7/8/8/8 w - - 0 1',
          prompt: 'Juegan blancas. Tienes un peón de torre. Gana la partida.',
          solutionUci: ['b6b7'],
          hint: 'El rey negro quiere llegar a la esquina a8. Ciérrale el paso.',
          explanationCorrect:
            'Correcto: Kb7. Tu rey controla a8, b8 y c8, y el negro ya no puede llegar a la esquina: el peón avanza y corona.',
          explanationWrong:
            'Con esa jugada el rey negro se acerca a la esquina a8 y, con el peón de torre, eso le basta para hacer tablas.',
        },
      ],
    },
  ],
};
