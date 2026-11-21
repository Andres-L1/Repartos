import type { ExplainStep, Lesson, PracticeStep, Unit } from '../schema.js';

/**
 * Unidad 16 · Estrategia verificable: actividad de las piezas (competitivo, 1700-2000 Elo). PENDIENTE DE VALIDACIÓN DE PROFESORES.
 *
 * Qué valida el código y qué no. Cada posición está construida (no es una partida real) y comprobada con Stockfish 16
 * a profundidad 18 y MultiPV 8 (scripts/verify-fase4.mts, modo estrategia): la solución es la mejor jugada y toda otra
 * jugada queda al menos 60 centipeones por debajo. Esa cifra NO aparece en los textos del alumno: un motor no explica el
 * porqué. Los textos enseñan la idea (qué buscar) y citan los hechos de cada posición, y cada hecho va acompañado de una
 * afirmación (`Claim`) que scripts/lib/strategy-describe.ts comprueba con chessops (test/content/unitsF.test.ts): qué
 * peón tapa la torre, columna sin peones, casillas de entrada y qué peones ataca desde ellas, peones de la séptima fila
 * sin defensa, protectores del caballo, piezas que ataca y quién podría cambiarlo. Toda casilla citada en un texto está
 * respaldada por una afirmación. Lo que el motor y el código NO validan es la pedagogía de explicar un plan: por qué estas
 * ideas son útiles, en qué orden enseñarlas y si el alumno las entiende. Eso lo tienen que juzgar profesores.
 *
 * Política de avisos (docs/estado-proyecto.md): `hint` y `explanationWrong` solo orientan (qué fila, columna o casilla
 * estratégica buscar) y nunca nombran la jugada solución ni su casilla de destino; la solución completa solo está en
 * `explanationCorrect`.
 */

/** Afirmación sobre la posición que cita un texto; la comprueba el test (ver `Claim` en scripts/lib/strategy-describe.ts). */
export interface ClaimLike {
  k: string;
  sq?: string;
  by?: string;
}
interface Text {
  s: string;
  claims: ClaimLike[];
}
/** Un texto y las afirmaciones sobre la posición que contiene. Sin afirmaciones, el texto no puede citar casillas. */
const t = (s: string, ...claims: ClaimLike[]): Text => ({ s, claims });
const c = (k: string, sq?: string, by?: string): ClaimLike => ({ k, ...(sq ? { sq } : {}), ...(by ? { by } : {}) });

interface Row {
  fen: string;
  uci: string;
  prompt: string;
  hint: Text;
  wrong: Text;
  good: Text;
}

/** Textos y afirmaciones de cada paso, por clave `u16.l01:practice:0`, `u16.l01:evaluation:2` o `u16.l01:explanation:1`. */
export const U16_TEXTS: Record<string, { uci: string; texts: Text[] }> = {};

const NOTE = ' Las posiciones de esta lección están comprobadas con un motor de ajedrez.';

const step = (key: string, r: Row, san: string): PracticeStep => {
  U16_TEXTS[key] = { uci: r.uci, texts: [r.hint, r.wrong, r.good] };
  return {
    fen: r.fen,
    prompt: r.prompt,
    solutionUci: [r.uci],
    hint: r.hint.s,
    explanationCorrect: `${san}. ${r.good.s}`,
    explanationWrong: r.wrong.s,
  };
};

const explain = (key: string, fen: string, uci: string, x: Text, squares: string[], arrows: [string, string][]): ExplainStep => {
  U16_TEXTS[key] = { uci, texts: [x] };
  return { fen, text: x.s, squares, arrows };
};

const lesson = (
  n: number,
  title: string,
  objective: string,
  conceptId: string,
  intro: string,
  explanation: (key: (i: number) => string) => ExplainStep[],
  rows: [Row, string][],
): Lesson => {
  const id = `u16.l0${n}`;
  return {
    id,
    unitId: 'u16',
    title,
    objective,
    conceptIds: [conceptId],
    intro: intro + NOTE,
    explanation: explanation((i) => `${id}:explanation:${i}`),
    practice: rows.slice(0, 3).map(([r, san], i) => step(`${id}:practice:${i}`, r, san)),
    evaluation: rows.slice(3, 6).map(([r, san], i) => step(`${id}:evaluation:${i}`, r, san)),
  };
};

export const unit: Unit = {
  id: 'u16',
  order: 24,
  title: 'Estrategia verificable: actividad de las piezas',
  description:
    'Tres ideas de plan que se pueden comprobar en el tablero. Son la torre a una columna abierta, la torre a la séptima fila y el caballo en una casilla de avanzada.',
  level: 'competitive',
  requires: ['u12'],
  lessons: [
    lesson(
      1,
      'Torre a la columna abierta',
      'Elegir la jugada que lleva una torre a una columna sin peones cuando es la mejor del tablero.',
      'strategy.open_file',
      'Una columna abierta es una columna sin peones de ningún bando. Detrás de sus propios peones una torre no hace nada, pero en una columna abierta recorre el tablero y puede entrar en el campo rival. En esta lección buscarás esa columna y llevarás tu torre a ella.',
      (key) => [
        explain(
          key(0),
          'r5k1/3npppp/1p6/2p5/P1N5/8/2P1PPPP/4R1K1 w - - 0 1',
          'e1d1',
          t(
            'Juegan blancas. Tu torre de e1 está tapada por su propio peón de e2 y no ve nada. La columna d no tiene ningún peón: con Rd1 la torre vigila toda la columna hasta el caballo negro de d7. Primera regla: una torre pasiva busca una columna donde no la estorben sus peones.',
            c('blocked', 'e2'),
            c('openFile', 'd'),
            c('fileEnd', 'd7'),
          ),
          ['d1'],
          [['e1', 'd1']],
        ),
        explain(
          key(1),
          '1r4k1/2pn1ppp/8/p3p3/8/1PP1PN2/P4PPP/5RK1 w - - 0 1',
          'f1d1',
          t(
            'Juegan blancas. De nuevo la torre de f1 está tapada, ahora por el peón de f2, y de nuevo la columna d está libre de peones. Con Rd1 la torre se coloca frente al caballo de d7: si ese caballo se mueve, la torre ve hasta la última fila. Quien ocupa primero una columna abierta decide quién entra por ella.',
            c('blocked', 'f2'),
            c('openFile', 'd'),
            c('fileEnd', 'd7'),
          ),
          ['d1'],
          [['f1', 'd1']],
        ),
      ],
      [
        [
          {
            fen: '3r2k1/5ppp/pp1p4/4p3/8/1P1P4/P3PPPP/4R1K1 w - - 0 1',
            uci: 'e1c1',
            prompt: 'Juegan blancas. La columna c no tiene ningún peón, ni blanco ni negro. ¿Dónde colocas la torre?',
            hint: t('Tu torre tiene delante un peón propio y no ve nada. Piensa en una columna por la que sí pueda avanzar.', c('blocked', 'e2')),
            wrong: t('Esa jugada deja la torre sin trabajo. Busca la columna que le permite llegar hasta las últimas filas del rival.'),
            good: t(
              'En e1 la torre quedaba encerrada tras el peón de e2, y la columna c, en cambio, está limpia de peones. Desde c1 puede entrar en c7 y atacar allí el peón de f7. La torre negra de d8 vigila c8, pero no c7.',
              c('blocked', 'e2'),
              c('openFile', 'c'),
              c('entry', 'c7'),
              c('hit', 'f7', 'c7'),
              c('guard', 'c8', 'd8'),
            ),
          },
          'Rc1',
        ],
        [
          {
            fen: '5rk1/pp3ppp/8/3p4/3P4/PP2P3/5PPP/R5K1 w - - 0 1',
            uci: 'a1c1',
            prompt: 'Juegan blancas. Ni tú ni las negras tenéis peones en la columna c. Elige la mejor jugada.',
            hint: t('Una torre en la esquina, detrás de un peón propio, es una pieza dormida. ¿Qué columna le daría vida?', c('blocked', 'a3')),
            wrong: t('Esa jugada no despierta a la torre de la esquina. Mira por qué columna podría llegar hasta la séptima fila.'),
            good: t(
              'La torre sale de la esquina, donde la tapaba el peón de a3, a una columna sin peones. Desde c7 atacaría a la vez los peones de b7 y f7, y ninguna pieza negra controla esa casilla.',
              c('blocked', 'a3'),
              c('openFile', 'c'),
              c('entry', 'c7'),
              c('hit', 'b7', 'c7'),
              c('hit', 'f7', 'c7'),
            ),
          },
          'Rc1',
        ],
        [
          {
            fen: 'r5k1/p4ppp/1p1p4/4p3/8/1P6/P2PPPPP/1R4K1 w - - 0 1',
            uci: 'b1c1',
            prompt: 'Juegan blancas. La columna c está limpia de peones. Elige la mejor jugada para tu torre.',
            hint: t('Compara lo que ve tu torre ahora, con un peón propio delante, con lo que vería en una columna sin peones.', c('blocked', 'b3')),
            wrong: t('Esa jugada no mejora la pieza más pasiva de tu campo. Busca una columna por la que la torre llegue hasta el borde del tablero rival.'),
            good: t(
              'La torre deja la columna b, donde el peón de b3 le cerraba el paso, y se coloca en una columna sin peones. La torre negra de a8 vigila c8, pero c7 queda libre: allí atacaría los peones de a7 y f7.',
              c('blocked', 'b3'),
              c('openFile', 'c'),
              c('guard', 'c8', 'a8'),
              c('entry', 'c7'),
              c('hit', 'a7', 'c7'),
              c('hit', 'f7', 'c7'),
            ),
          },
          'Rc1',
        ],
        [
          {
            fen: 'r5k1/4pppp/pp1p4/8/PP1P4/4P3/5PPP/4R1K1 w - - 0 1',
            uci: 'e1c1',
            prompt: 'Juegan blancas. Ningún peón, tuyo o negro, queda en la columna c. ¿Qué haces con la torre?',
            hint: t('Un peón propio le cierra el paso a tu torre. Busca otra columna.', c('blocked', 'e3')),
            wrong: t('Esa jugada deja la torre sin salida hacia el campo rival. Fíjate en la columna donde no hay ningún peón.'),
            good: t(
              'En e1 la torre solo veía hasta su peón de e3; la columna c está libre. Desde c7 presionaría el peón de e7 por la séptima fila, aunque la torre negra de a8 vigila c8.',
              c('blocked', 'e3'),
              c('openFile', 'c'),
              c('entry', 'c7'),
              c('hit', 'e7', 'c7'),
              c('guard', 'c8', 'a8'),
            ),
          },
          'Rc1',
        ],
        [
          {
            fen: 'r5k1/1p3ppp/3p4/p3p3/8/4P3/PP1P1PPP/5RK1 w - - 0 1',
            uci: 'f1c1',
            prompt: 'Juegan blancas. En la columna c no hay peones de ningún color. Elige la jugada.',
            hint: t('¿Hasta dónde llega hoy tu torre antes de chocar con un peón de tu propio bando?', c('blocked', 'f2')),
            wrong: t('Esa jugada no resuelve el problema de tu torre. Busca una columna que le deje el camino libre.'),
            good: t(
              'La torre de f1 estaba detrás del peón de f2 y no podía hacer nada. La columna c no tiene peones, y desde c7 la torre atacaría b7 y f7. La torre negra de a8 vigila c8, así que la entrada buena es c7.',
              c('blocked', 'f2'),
              c('openFile', 'c'),
              c('hit', 'b7', 'c7'),
              c('hit', 'f7', 'c7'),
              c('guard', 'c8', 'a8'),
              c('entry', 'c7'),
            ),
          },
          'Rc1',
        ],
        [
          {
            fen: '5rk1/pp1p1ppp/8/4p3/1P6/3PP3/P4PPP/1R4K1 w - - 0 1',
            uci: 'b1c1',
            prompt: 'Juegan blancas. La columna c está abierta: no tiene peones ni tuyos ni rivales. Elige la mejor jugada.',
            hint: t('Tu torre vigila una columna con un peón tuyo en medio. ¿Hay otra con la vista despejada?', c('blocked', 'b4')),
            wrong: t('Esa jugada no activa la torre. Piensa en qué columna le permite entrar en el campo negro.'),
            good: t(
              'En la columna b el peón de b4 tapa la torre; la columna c, en cambio, está abierta. Desde c7 atacaría los peones de b7 y d7, y ninguna pieza negra controla esa casilla. La torre de f8 vigila c8.',
              c('blocked', 'b4'),
              c('openFile', 'c'),
              c('hit', 'b7', 'c7'),
              c('hit', 'd7', 'c7'),
              c('entry', 'c7'),
              c('guard', 'c8', 'f8'),
            ),
          },
          'Rc1',
        ],
      ],
    ),
    lesson(
      2,
      'Torre a la séptima fila',
      'Reconocer cuándo la mejor jugada es llevar una torre a la séptima fila, con el rey rival en la octava.',
      'strategy.seventh_rank',
      'La séptima fila es la fila donde empiezan los peones rivales. Una torre allí los ataca por detrás y, si el rey rival está en la octava fila, lo encierra: no puede acercarse a defender. En esta lección verás qué peones y piezas ataca la torre desde esa fila y cuándo conviene ir.',
      (key) => [
        explain(
          key(0),
          '5rk1/1p1n1ppp/3p4/8/P1B5/3P4/1P3PPP/4R1K1 w - - 0 1',
          'e1e7',
          t(
            'Juegan blancas. Con Re7 la torre llega a la séptima fila. Ataca el caballo de d7, que ninguna pieza negra defiende, y el peón de f7, que defienden la torre de f8 y el rey. Además el rey de g8 queda sin casillas en su fila y ninguna pieza negra puede capturar la torre.',
            c('rookHitsLoose', 'd7'),
            c('defendedBy', 'f7', 'f8'),
            c('defendedBy', 'f7', 'g8'),
            c('cutOff'),
            c('rookSafe'),
          ),
          ['e7'],
          [['e1', 'e7']],
        ),
        explain(
          key(1),
          '1r4k1/p4ppp/2pp4/8/P2P4/1P6/2P2PPP/4R1K1 w - - 0 1',
          'e1e7',
          t(
            'Juegan blancas. En e7 la torre ataca por detrás el peón de a7, que ninguna pieza defiende, y el de f7, que solo defiende el rey. Cada peón que las negras tienen que defender ata una pieza a la defensa, y eso les quita tiempo para atacar.',
            c('loose', 'a7'),
            c('defendedBy', 'f7', 'g8'),
          ),
          ['e7'],
          [['e1', 'e7']],
        ),
      ],
      [
        [
          {
            fen: '1r4k1/2p2ppp/1pb5/8/2B5/P2P4/2P2PPP/4R1K1 w - - 0 1',
            uci: 'e1e7',
            prompt: 'Juegan blancas. Mira la séptima fila rival: ¿puede tu torre llegar a ella con ventaja?',
            hint: t('Cuenta los peones negros que siguen en su fila de partida y mira cuáles no tienen defensa.'),
            wrong: t('Esa jugada deja la torre lejos de los peones rivales. Busca una fila que la acerque a ellos desde atrás sin que la puedan capturar.'),
            good: t(
              'La torre llega a la séptima fila y ataca el peón de c7, que ninguna pieza negra defiende, y el de f7, que solo defiende el rey. Nadie puede capturar la torre y el rey negro se queda encerrado en la octava fila.',
              c('loose', 'c7'),
              c('defendedBy', 'f7', 'g8'),
              c('rookSafe'),
              c('cutOff'),
            ),
          },
          'Re7',
        ],
        [
          {
            fen: '2r3k1/pp2bppp/8/8/2B5/1PP1P3/5PPP/3R2K1 w - - 0 1',
            uci: 'd1d7',
            prompt: 'Juegan blancas. En la séptima fila negra hay piezas y peones sin protección. ¿Cómo los atacas?',
            hint: t('Hay un alfil y un peón negros en la séptima fila que nadie defiende. ¿Puede tu torre atacarlos a la vez?', c('rookHitsLoose', 'e7'), c('rookHitsLoose', 'b7')),
            wrong: t('Esa jugada no molesta a las piezas negras. Busca una fila desde la que tu torre ataque dos objetivos sin defensa.'),
            good: t(
              'La torre ataca a la vez el alfil de e7 y el peón de b7, y ninguna pieza negra defiende ninguno de los dos. Plantea dos amenazas con una sola jugada, y la torre está a salvo.',
              c('rookHitsLoose', 'e7'),
              c('rookHitsLoose', 'b7'),
              c('rookSafe'),
            ),
          },
          'Rd7',
        ],
        [
          {
            fen: '2r3k1/1p1n1ppp/2p5/8/2B5/8/P2P1PPP/4R1K1 w - - 0 1',
            uci: 'e1e7',
            prompt: 'Juegan blancas. Una pieza menor negra está sin defensa en su segunda fila. Aprovéchalo.',
            hint: t('Una pieza negra no tiene defensa. Busca la fila desde la que tu torre puede atacarla.', c('rookHitsLoose', 'd7')),
            wrong: t('Esa jugada no crea ninguna amenaza. Mira qué pieza negra está sin defensa y desde qué fila la alcanza la torre.'),
            good: t(
              'La torre ataca el caballo de d7, que ninguna pieza defiende, y el peón de f7, que solo protege el rey. Una torre en la séptima presiona sin ayuda: las piezas negras quedan atadas a defender, y el rey encerrado en su fila no puede colaborar.',
              c('rookHitsLoose', 'd7'),
              c('defendedBy', 'f7', 'g8'),
              c('cutOff'),
            ),
          },
          'Re7',
        ],
        [
          {
            fen: '4r1k1/1p3ppp/2p2b2/4p3/2B5/P1P1P3/1P3PPP/3R2K1 w - - 0 1',
            uci: 'd1d7',
            prompt: 'Juegan blancas. El rey negro está en la octava fila. ¿Qué haces con tu torre?',
            hint: t('Busca la fila donde las negras guardan sus peones y mira cuál de ellos está sin defensa.'),
            wrong: t('Esa jugada no aprovecha la posición del rey negro. Piensa en una fila que lo encierre y deje sus peones al alcance de la torre.'),
            good: t(
              'Con la torre en la séptima fila, el rey negro queda encerrado y atacas el peón de b7, que nadie defiende, y el de f7, que solo defiende el rey. La torre de e8 y el alfil de f6 vigilan la casilla de detrás, pero no pueden echar a la torre.',
              c('cutOff'),
              c('loose', 'b7'),
              c('defendedBy', 'f7', 'g8'),
              c('guard', 'd8', 'e8'),
              c('guard', 'd8', 'f6'),
              c('rookSafe'),
            ),
          },
          'Rd7',
        ],
        [
          {
            fen: '5rk1/pp2nppp/8/3p4/PP1PP3/8/4NPPP/2R3K1 w - - 0 1',
            uci: 'c1c7',
            prompt: 'Juegan blancas. Hay dos objetivos negros sin defensa a un movimiento de tu torre. Encuéntralos.',
            hint: t('Fíjate en que hay dos objetivos sin defensa en la fila a la que puede llegar tu torre.', c('rookHitsLoose', 'b7'), c('rookHitsLoose', 'e7')),
            wrong: t('Esa jugada deja pasar la ocasión de atacar por detrás. Busca la fila donde empiezan los peones rivales.'),
            good: t(
              'La torre ataca el peón de b7 y el caballo de e7, y ninguno de los dos tiene defensa. La séptima fila es la que más rinde cuando el rey negro, en g8, se queda encerrado detrás de sus peones.',
              c('rookHitsLoose', 'b7'),
              c('rookHitsLoose', 'e7'),
              c('cutOff'),
              c('kingAt', 'g8'),
            ),
          },
          'Rc7',
        ],
        [
          {
            fen: '4r1k1/1b3ppp/pp6/4p3/2B5/2P1P3/PP3PPP/3R2K1 w - - 0 1',
            uci: 'd1d7',
            prompt: 'Juegan blancas. Hay una pieza negra sin defensa en la séptima fila. ¿Cómo la alcanzas?',
            hint: t('Una pieza negra de la séptima fila no tiene ninguna defensa. Tu torre puede llegar a esa fila.', c('rookHitsLoose', 'b7')),
            wrong: t('Esa jugada no ataca la pieza sin defensa. Busca la fila desde la que la torre la ve.'),
            good: t(
              'Con la torre en la séptima fila atacas el alfil de b7, que ninguna pieza defiende, y el peón de f7, que solo defiende el rey. La torre de e8 vigila la casilla de detrás, pero no la puede capturar.',
              c('rookHitsLoose', 'b7'),
              c('defendedBy', 'f7', 'g8'),
              c('guard', 'd8', 'e8'),
              c('rookSafe'),
            ),
          },
          'Rd7',
        ],
      ],
    ),
    lesson(
      3,
      'Caballo en una casilla de avanzada',
      'Reconocer cuándo la mejor jugada es colocar un caballo en una casilla protegida por un peón y fuera del alcance de los peones rivales.',
      'strategy.outpost',
      'Una casilla de avanzada es una casilla del campo rival que ningún peón rival puede volver a atacar. Si además la protege un peón tuyo, un caballo allí no se echa con peones: solo se puede cambiar por otra pieza. Desde esa casilla central el caballo ataca piezas y casillas del rival.',
      (key) => [
        explain(
          key(0),
          '3r2k1/5ppp/1p3b2/p7/PNP5/4P3/5PPP/1R4K1 w - - 0 1',
          'b4d5',
          t(
            'Juegan blancas. En d5 el caballo estaría protegido por el peón de c4 y ningún peón negro puede atacar esa casilla. Desde allí ataca el peón de b6 y el alfil de f6, y ese alfil no controla casillas del color de d5: no puede cambiar el caballo.',
            c('protector', 'c4'),
            c('noPawns'),
            c('knightHit', 'b6'),
            c('knightHit', 'f6'),
            c('cantTrade', 'f6'),
          ),
          ['d5'],
          [['b4', 'd5']],
        ),
        explain(
          key(1),
          'r5k1/1p3ppp/5b2/p7/1N2P3/2P5/P4PPP/3R2K1 w - - 0 1',
          'b4d5',
          t(
            'Juegan blancas. Ahora el protector es el peón de e4, pero la idea es la misma: un peón tuyo apoya la casilla d5 y ningún peón negro puede atacarla. El caballo de d5 ataca el alfil de f6 y, mientras lo apoye el peón, solo se le puede quitar cambiándolo.',
            c('protector', 'e4'),
            c('noPawns'),
            c('knightHit', 'f6'),
          ),
          ['d5'],
          [['b4', 'd5']],
        ),
      ],
      [
        [
          {
            fen: '3r2k1/1p1b1ppp/8/p7/1NP1P3/8/P4PPP/4R1K1 w - - 0 1',
            uci: 'b4d5',
            prompt: 'Juegan blancas. Ningún peón negro puede atacar ya la casilla d5. ¿Dónde está mejor tu caballo?',
            hint: t('Busca una casilla del centro que tus peones protejan y que los peones negros ya no puedan alcanzar.'),
            wrong: t('Esa jugada deja el caballo donde puede ser atacado o expulsado. Piensa en una casilla central apoyada por tus peones.'),
            good: t(
              'El caballo se coloca en el centro, protegido por dos peones, el de c4 y el de e4, y ningún peón negro puede atacarlo. La única pieza que podría cambiarlo es el alfil de d7, porque controla casillas de su color.',
              c('protector', 'c4'),
              c('protector', 'e4'),
              c('noPawns'),
              c('trade', 'd7'),
            ),
          },
          'Nd5',
        ],
        [
          {
            fen: 'r5k1/5ppp/1p2b3/p7/1NP1P3/8/P4PPP/3R2K1 w - - 0 1',
            uci: 'b4d5',
            prompt: 'Juegan blancas. En la casilla d5 tu caballo no tendría peones rivales que lo molestaran. Elige la mejor jugada.',
            hint: t('Piensa qué peones tuyos pueden proteger una casilla central del campo rival.'),
            wrong: t('Esa jugada no deja al caballo apoyado por un peón. Busca una casilla avanzada donde nadie pueda echarlo con un peón.'),
            good: t(
              'Dos peones protegen la casilla, el de c4 y el de e4, y no queda ningún peón negro que pueda atacarla. Desde allí el caballo ataca el peón de b6. El alfil de e6 podría cambiarlo, pero entonces recaptura un peón.',
              c('protector', 'c4'),
              c('protector', 'e4'),
              c('noPawns'),
              c('knightHit', 'b6'),
              c('trade', 'e6'),
            ),
          },
          'Nd5',
        ],
        [
          {
            fen: '4r1k1/4bppp/pp6/8/2P5/1P2N3/P4PPP/4R1K1 w - - 0 1',
            uci: 'e3d5',
            prompt: 'Juegan blancas. Ningún peón negro llega ya a la casilla d5. ¿Qué haces con tu caballo?',
            hint: t('Tu caballo está en el centro de tu propio campo. ¿Hay una casilla más avanzada donde ningún peón lo moleste?'),
            wrong: t('Esa jugada no gana terreno con el caballo. Busca una casilla del campo negro protegida por tu peón de la columna c.'),
            good: t(
              'El caballo sale a la casilla de avanzada: lo protege el peón de c4 y ningún peón negro puede atacarlo. Desde allí ataca a la vez el peón de b6 y el alfil de e7, y ese alfil no controla casillas de su color: no puede cambiarlo.',
              c('protector', 'c4'),
              c('noPawns'),
              c('knightHit', 'b6'),
              c('knightHit', 'e7'),
              c('cantTrade', 'e7'),
            ),
          },
          'Nd5',
        ],
        [
          {
            fen: '2r3k1/4bppp/pp6/8/1N2P3/2P5/1P3PPP/R5K1 w - - 0 1',
            uci: 'b4d5',
            prompt: 'Juegan blancas. Los peones negros ya no pueden atacar la casilla d5. Elige la jugada.',
            hint: t('Antes de colocar el caballo, comprueba qué peones negros podrían atacar la casilla; si no queda ninguno, es candidata.'),
            wrong: t('Esa jugada deja el caballo en un flanco. Piensa en acercarlo al centro, a una casilla que un peón tuyo proteja.'),
            good: t(
              'El caballo salta del flanco al centro. Lo protege el peón de e4, ningún peón negro puede acercarse a echarlo y desde allí ataca el peón de b6 y el alfil de e7. Ese alfil no puede cambiarlo.',
              c('protector', 'e4'),
              c('noPawns'),
              c('knightHit', 'b6'),
              c('knightHit', 'e7'),
              c('cantTrade', 'e7'),
            ),
          },
          'Nd5',
        ],
        [
          {
            fen: '5rk1/4bppp/pp6/8/1PP2N2/4P3/5PPP/R5K1 w - - 0 1',
            uci: 'f4d5',
            prompt: 'Juegan blancas. En la casilla d5 no hay peón negro que pueda atacar a un caballo. Elige la mejor jugada.',
            hint: t('¿Qué peón tuyo apoyaría al caballo en una casilla del campo rival?'),
            wrong: t('Esa jugada no lleva el caballo hacia el centro. Busca la casilla donde un peón tuyo lo apoye y ninguno rival lo moleste.'),
            good: t(
              'El caballo vuelve del flanco de rey al centro. Lo apoya el peón de c4 y las negras no tienen peones que lo ataquen. Ataca el peón de b6 y el alfil de e7, que no puede cambiarlo.',
              c('protector', 'c4'),
              c('noPawns'),
              c('knightHit', 'b6'),
              c('knightHit', 'e7'),
              c('cantTrade', 'e7'),
            ),
          },
          'Nd5',
        ],
        [
          {
            fen: '5rk1/4bppp/pp6/8/1PP5/4N3/4PPPP/R5K1 w - - 0 1',
            uci: 'e3d5',
            prompt: 'Juegan blancas. Ningún peón negro puede echar a un caballo de la casilla d5. ¿Qué jugada eliges?',
            hint: t('La casilla buena está protegida por un peón tuyo y es inalcanzable para los peones negros.'),
            wrong: t('Esa jugada no coloca el caballo en el puesto más fuerte. Busca la casilla protegida por tu peón de c4 donde ningún peón negro lo moleste.', c('protector', 'c4')),
            good: t(
              'El caballo sale de e3 hacia una casilla avanzada. Lo protege el peón de c4 y las negras no tienen peones que puedan echarlo. El alfil de e7, atacado por el caballo, no puede cambiarlo.',
              c('protector', 'c4'),
              c('noPawns'),
              c('knightHit', 'e7'),
              c('cantTrade', 'e7'),
            ),
          },
          'Nd5',
        ],
      ],
    ),
  ],
};
