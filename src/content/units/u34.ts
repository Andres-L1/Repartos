import type { Unit } from '../schema.js';

/**
 * Unidad 34 · Estructuras de peones (intermedio, 1100-1400 Elo).
 * Pendiente de validación de profesores. Todas las posiciones son finales de peones CONSTRUIDAS (no proceden de partidas ni
 * de jugadores): construidas, verificadas con la tablebase Syzygy de Lichess (`npx tsx scripts/verify-u34.mts`, caché
 * test/fixtures/tablebase/u34.json). En cada ejercicio la jugada del alumno es la ÚNICA que conserva el resultado (victoria
 * o tablas); toda otra jugada lo empeora. Los textos solo afirman (a) ese hecho y (b) hechos de estructura que
 * test/content/unitsU34.test.ts comprueba por código en el FEN (peón aislado, doblado, retrasado, pasado, protegido, base de
 * cadena; `after:` = en la posición tras la jugada). Nada de generalizaciones: cada texto describe solo su posición.
 */
type Fact = [pred: string, color: 'white' | 'black', square: string];
interface Pos {
  fen: string;
  /** Jugada de la solución en UCI. */
  uci: string;
  result: 'win' | 'draw';
  facts: Fact[];
  /** Texto de la explicación o explanationCorrect (los hechos que cita están en `facts`). */
  text: string;
  hint?: string;
  squares?: string[];
}

const GOAL = { win: 'Hay una sola jugada que conserva la victoria.', draw: 'Hay una sola jugada que salva las tablas.' };
const ONLY = { win: 'Es la única jugada que conserva la victoria: cualquier otra empeora el resultado según la tablebase.', draw: 'Es la única jugada que salva las tablas: cualquier otra empeora el resultado según la tablebase.' };
const WRONG = 'Con esa jugada el resultado empeora según la tablebase. Mira otra vez cómo están los peones.';

export const FACTS: Record<string, Fact[]> = {};
export const EXPLAIN_MOVES: Record<string, string> = {};

const explain = (lessonId: string, i: number, p: Pos) => {
  FACTS[`${lessonId}:${i}`] = p.facts;
  EXPLAIN_MOVES[`${lessonId}:${i}`] = p.uci;
  return {
    fen: p.fen,
    text: `${p.text} ${ONLY[p.result]}`,
    squares: p.squares ?? [],
    arrows: [[p.uci.slice(0, 2), p.uci.slice(2, 4)] as [string, string]],
  };
};
const exercise = (lessonId: string, kind: 'practice' | 'evaluation', i: number, p: Pos) => {
  FACTS[`${lessonId}:${kind}:${i}`] = p.facts;
  return {
    fen: p.fen,
    prompt: `Juegan ${p.fen.split(' ')[1] === 'w' ? 'blancas' : 'negras'}. ${GOAL[p.result]}`,
    solutionUci: [p.uci],
    hint: p.hint!,
    explanationCorrect: `${p.text} ${ONLY[p.result]}`,
    explanationWrong: WRONG,
  };
};
const lesson = (id: string, title: string, objective: string, intro: string, ex: Pos[], pr: Pos[], ev: Pos[]) => ({
  id: `u34.${id}`,
  unitId: 'u34',
  title,
  objective,
  conceptIds: ['endgame.king_pawn'],
  intro,
  explanation: ex.map((p, i) => explain(`u34.${id}`, i, p)),
  practice: pr.map((p, i) => exercise(`u34.${id}`, 'practice', i, p)),
  evaluation: ev.map((p, i) => exercise(`u34.${id}`, 'evaluation', i, p)),
});

const H_ISO = 'Busca un peón que no tenga peones de su bando en las columnas vecinas.';
const H_DBL = 'Busca dos peones del mismo bando en una misma columna.';
const H_BWD = 'Busca el peón que quedó atrás respecto a sus vecinos, con un peón rival vigilando la casilla de delante.';
const H_BLK = 'Un peón pasado no tiene peones rivales que lo frenen: piensa qué pieza puede detenerlo.';
const H_NEW = 'Mira qué peón puede quedar sin peones rivales por delante después de capturar.';
const H_PSH = 'Un peón pasado sin freno vale más cuanto más avanza.';
const H_CHN = 'Mira el peón más adelantado de la cadena: de él depende que los demás estén protegidos.';

export const unit: Unit = {
  id: 'u34',
  order: 23,
  title: 'Estructuras de peones',
  description:
    'Peones aislados, doblados y retrasados; el peón pasado (cómo detenerlo, cómo crearlo y cuándo adelantarlo) y la cadena de peones y su punto débil. Finales de peones donde la tablebase confirma la única jugada.',
  level: 'intermediate',
  requires: ['u10'],
  lessons: [
    lesson(
      'l01',
      'Peones aislados, doblados y retrasados',
      'Reconocer un peón aislado, dos peones doblados y un peón retrasado en un final de peones.',
      'Un peón aislado no tiene peones de su bando en las columnas vecinas. Dos peones doblados están en la misma columna. Un peón retrasado tiene a sus vecinos más adelantados y un peón rival vigila la casilla de delante. En cada posición de la lección identifica la debilidad y después busca la única jugada que conserva el resultado.',
      [
        {
          fen: '8/1k4p1/5p2/2Kp4/8/6P1/5P2/8 w - - 0 1',
          uci: 'c5d5',
          result: 'win',
          facts: [['isolated', 'black', 'd5']],
          text: 'El peón negro de d5 está aislado: no hay peones negros en las columnas c ni e. Con Kxd5 el rey blanco lo captura.',
          squares: ['d5'],
        },
        {
          fen: '8/3pp3/8/8/8/2P5/kPP2K2/8 b - - 0 1',
          uci: 'a2b2',
          result: 'win',
          facts: [['doubled', 'white', 'c2'], ['doubled', 'white', 'c3']],
          text: 'Las blancas tienen dos peones en la columna c, en c2 y c3: están doblados. Con Kxb2 el rey negro captura el peón de b2.',
          squares: ['c2', 'c3'],
        },
        {
          fen: '8/6p1/8/p7/2P5/1P6/2kP4/6K1 b - - 0 1',
          uci: 'c2b3',
          result: 'draw',
          facts: [['backward', 'white', 'b3']],
          text: 'El peón blanco de b3 está retrasado: su vecino de c4 está más adelantado y el peón negro de a5 vigila b4. Con Kxb3 el rey negro lo captura.',
          squares: ['b3'],
        },
      ],
      [
        {
          fen: '5k2/1p6/2p3K1/4p3/8/8/1PP5/8 w - - 0 1',
          uci: 'g6f5',
          result: 'draw',
          facts: [['isolated', 'black', 'e5']],
          text: 'El peón negro de e5 está aislado: no hay peones negros en las columnas d ni f. Con Kf5 el rey blanco se coloca al lado de ese peón y lo ataca.',
          hint: H_ISO,
        },
        {
          fen: '2K5/2ppk3/3p4/8/8/8/4P2P/8 w - - 0 1',
          uci: 'c8c7',
          result: 'win',
          facts: [['doubled', 'black', 'd6'], ['doubled', 'black', 'd7']],
          text: 'Los peones negros de d7 y d6 están doblados: dos peones en la columna d. Con Kxc7 el rey blanco captura el peón de c7.',
          hint: H_DBL,
        },
        {
          fen: '8/3p1K2/5p2/4p3/5kP1/8/3P4/8 w - - 0 1',
          uci: 'f7f6',
          result: 'draw',
          facts: [['backward', 'black', 'f6']],
          text: 'El peón negro de f6 está retrasado: su vecino de e5 está más adelantado y el peón blanco de g4 vigila g5. Con Kxf6 el rey blanco lo captura.',
          hint: H_BWD,
        },
      ],
      [
        {
          fen: '8/p2k4/1p6/5p2/6K1/8/PP6/8 w - - 0 1',
          uci: 'g4f5',
          result: 'draw',
          facts: [['isolated', 'black', 'f5']],
          text: 'El peón negro de f5 está aislado: no hay peones negros en las columnas e ni g. Con Kxf5 el rey blanco lo captura.',
          hint: H_ISO,
        },
        {
          fen: '8/3p4/2p5/8/3k4/3PP3/3P4/K7 b - - 0 1',
          uci: 'd4d3',
          result: 'win',
          facts: [['doubled', 'white', 'd2'], ['doubled', 'white', 'd3']],
          text: 'Los peones blancos de d3 y d2 están doblados: dos peones en la columna d. Con Kxd3 el rey negro captura el de d3.',
          hint: H_DBL,
        },
        {
          fen: '8/2Kp4/1p4k1/2p5/P7/8/4P3/8 w - - 0 1',
          uci: 'c7b6',
          result: 'draw',
          facts: [['backward', 'black', 'b6']],
          text: 'El peón negro de b6 está retrasado: su vecino de c5 está más adelantado y el peón blanco de a4 vigila a5... y b5 queda sin ayuda de peón. Con Kxb6 el rey blanco lo captura.',
          hint: H_BWD,
        },
      ],
    ),
    lesson(
      'l02',
      'El peón pasado: detenerlo, crearlo y adelantarlo',
      'Reconocer un peón pasado y elegir entre bloquearlo con el rey, crear uno propio con una captura o adelantarlo.',
      'Un peón pasado no tiene peones rivales por delante en su columna ni en las vecinas. En cada posición de la lección se comprueba un caso distinto: el rey que se pone delante de un peón pasado rival, la captura que deja un peón propio sin rivales por delante y el avance del peón pasado propio. La tablebase confirma en cada una la única jugada que conserva el resultado.',
      [
        {
          fen: '8/6p1/5p2/2p5/k7/3K2P1/5P2/8 w - - 0 1',
          uci: 'd3c4',
          result: 'win',
          facts: [['passed', 'black', 'c5']],
          text: 'El peón negro de c5 es pasado: no hay peones blancos en las columnas b, c ni d. Con Kc4 el rey blanco se coloca justo delante de él.',
          squares: ['c5', 'c4'],
        },
        {
          fen: '8/6k1/p7/8/7p/K4PP1/8/8 w - - 0 1',
          uci: 'g3h4',
          result: 'win',
          facts: [['after:passed', 'white', 'h4']],
          text: 'Con gxh4 las blancas capturan el peón de h4 y su nuevo peón de h4 queda pasado: ya no hay peones negros en las columnas g ni h.',
          squares: ['h4'],
        },
        {
          fen: '8/5K2/8/8/3P3p/2P5/k7/8 b - - 0 1',
          uci: 'h4h3',
          result: 'win',
          facts: [['passed', 'black', 'h4']],
          text: 'El peón negro de h4 es pasado: no hay peones blancos en las columnas g ni h. Con h3 lo adelantan las negras.',
          squares: ['h4', 'h3'],
        },
      ],
      [
        {
          fen: '8/6p1/5p2/3p4/k7/2K5/5PP1/8 w - - 0 1',
          uci: 'c3d4',
          result: 'win',
          facts: [['passed', 'black', 'd5']],
          text: 'El peón negro de d5 es pasado: no hay peones blancos en las columnas c, d ni e. Con Kd4 el rey blanco se coloca justo delante de él.',
          hint: H_BLK,
        },
        {
          fen: '8/8/4p3/k7/8/3K2p1/2P4P/8 w - - 0 1',
          uci: 'h2g3',
          result: 'win',
          facts: [['after:passed', 'white', 'g3']],
          text: 'Con hxg3 las blancas capturan el peón de g3 y su nuevo peón de g3 queda pasado: el único peón negro que queda está en la columna e.',
          hint: H_NEW,
        },
        {
          fen: '8/2K5/8/1pk5/8/3P4/7P/8 b - - 0 1',
          uci: 'b5b4',
          result: 'win',
          facts: [['passed', 'black', 'b5']],
          text: 'El peón negro de b5 es pasado: no hay peones blancos en las columnas a, b ni c. Con b4 lo adelantan las negras.',
          hint: H_PSH,
        },
      ],
      [
        {
          fen: '8/1p6/8/p7/2P4k/1P6/7P/4K3 b - - 0 1',
          uci: 'h4h3',
          result: 'draw',
          facts: [['passed', 'white', 'h2']],
          text: 'El peón blanco de h2 es pasado: no hay peones negros en las columnas g ni h. Con Kh3 el rey negro se coloca justo delante de él.',
          hint: H_BLK,
        },
        {
          fen: '8/1k6/p5Kp/6P1/8/8/3P4/8 b - - 0 1',
          uci: 'h6g5',
          result: 'win',
          facts: [['after:passed', 'black', 'g5']],
          text: 'Con hxg5 las negras capturan el peón de g5 y su nuevo peón de g5 queda pasado: el único peón blanco que queda está en la columna d.',
          hint: H_NEW,
        },
        {
          fen: '8/5p2/2P5/1kp5/8/2K5/8/8 w - - 0 1',
          uci: 'c6c7',
          result: 'win',
          facts: [['passed', 'white', 'c6']],
          text: 'El peón blanco de c6 es pasado: no hay peones negros en las columnas b, c ni d por delante de él. Con c7 lo adelantan las blancas.',
          hint: H_PSH,
        },
      ],
    ),
    lesson(
      'l03',
      'La cadena de peones y su rotura',
      'Reconocer una cadena de peones, su base y su peón más adelantado, y ver cuándo conviene atacarlo.',
      'En una cadena, cada peón está protegido por otro peón de su bando que está detrás en diagonal; el de más atrás es la base y no lo protege ningún peón. En las posiciones de esta lección se identifica la cadena y, en los ejercicios, la tablebase confirma la única jugada que conserva el resultado al romperla: capturar o atacar su peón más adelantado.',
      [
        {
          fen: '8/8/5Kp1/4p3/2P5/1P6/P7/2k5 b - - 0 1',
          uci: 'e5e4',
          result: 'draw',
          facts: [['protected', 'white', 'b3'], ['protected', 'white', 'c4'], ['base', 'white', 'a2']],
          text: 'Las blancas tienen una cadena: a2 protege a b3 y b3 protege a c4. El peón de a2 es la base, porque ningún peón lo protege.',
          squares: ['a2', 'b3', 'c4'],
        },
        {
          fen: '8/2p5/3p4/4p3/1PP5/2K5/8/5k2 w - - 0 1',
          uci: 'c3d3',
          result: 'draw',
          facts: [['protected', 'black', 'd6'], ['protected', 'black', 'e5'], ['base', 'black', 'c7']],
          text: 'Las negras tienen una cadena: c7 protege a d6 y d6 protege a e5. El peón de c7 es la base, porque ningún peón lo protege.',
          squares: ['c7', 'd6', 'e5'],
        },
        {
          fen: '8/p2K4/1p6/2p5/8/8/3P1kP1/8 w - - 0 1',
          uci: 'g2g4',
          result: 'draw',
          facts: [['protected', 'black', 'b6'], ['protected', 'black', 'c5'], ['base', 'black', 'a7']],
          text: 'Las negras tienen una cadena: a7 protege a b6 y b6 protege a c5. El peón de a7 es la base, porque ningún peón lo protege.',
          squares: ['a7', 'b6', 'c5'],
        },
      ],
      [
        {
          fen: '5k2/4p3/5p2/5Kp1/5P2/7P/8/8 w - - 0 1',
          uci: 'f4g5',
          result: 'draw',
          facts: [['protected', 'black', 'f6'], ['protected', 'black', 'g5'], ['base', 'black', 'e7']],
          text: 'Las negras tienen una cadena: e7 protege a f6 y f6 protege a g5. Con fxg5 las blancas capturan el peón más adelantado de la cadena.',
          hint: H_CHN,
        },
        {
          fen: '8/8/2p5/4p3/k2P4/2P5/1PK5/8 b - - 0 1',
          uci: 'e5d4',
          result: 'draw',
          facts: [['protected', 'white', 'c3'], ['protected', 'white', 'd4'], ['base', 'white', 'b2']],
          text: 'Las blancas tienen una cadena: b2 protege a c3 y c3 protege a d4. Con exd4 las negras capturan el peón más adelantado de la cadena.',
          hint: H_CHN,
        },
        {
          fen: '8/8/8/1p1Kp3/3P4/4P3/2k2P2/8 b - - 0 1',
          uci: 'e5d4',
          result: 'win',
          facts: [['protected', 'white', 'e3'], ['protected', 'white', 'd4'], ['base', 'white', 'f2']],
          text: 'Las blancas tienen una cadena: f2 protege a e3 y e3 protege a d4. Con exd4 las negras capturan el peón más adelantado de la cadena.',
          hint: H_CHN,
        },
      ],
      [
        {
          fen: '8/8/3p4/3pk3/K1P5/3P4/4P3/8 b - - 0 1',
          uci: 'd5c4',
          result: 'draw',
          facts: [['protected', 'white', 'd3'], ['protected', 'white', 'c4'], ['base', 'white', 'e2']],
          text: 'Las blancas tienen una cadena: e2 protege a d3 y d3 protege a c4. Con dxc4 las negras capturan el peón más adelantado de la cadena.',
          hint: H_CHN,
        },
        {
          fen: '8/1p6/2p5/3p4/5K2/3PP3/8/5k2 w - - 0 1',
          uci: 'e3e4',
          result: 'draw',
          facts: [['protected', 'black', 'c6'], ['protected', 'black', 'd5'], ['base', 'black', 'b7']],
          text: 'Las negras tienen una cadena: b7 protege a c6 y c6 protege a d5. Con e4 las blancas atacan el peón más adelantado de la cadena.',
          hint: H_CHN,
        },
        {
          fen: '1K6/8/4p3/3p4/3P4/4PPk1/8/8 w - - 0 1',
          uci: 'e3e4',
          result: 'draw',
          facts: [['protected', 'black', 'd5'], ['base', 'black', 'e6']],
          text: 'Las negras tienen una cadena: e6 protege a d5, y el peón de e6 es la base porque ningún peón lo protege. Con e4 las blancas atacan el peón de d5.',
          hint: H_CHN,
        },
      ],
    ),
  ],
};
