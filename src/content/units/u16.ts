import type { ExplainStep, Lesson, PracticeStep, Unit } from '../schema.js';

/**
 * Unidad 16 · Estrategia verificable: actividad de las piezas (competitivo, 1700-2000 Elo). PENDIENTE DE VALIDACIÓN DE PROFESORES.
 *
 * Qué valida el código y qué no. Cada posición está construida (no es una partida real) y comprobada con Stockfish 16
 * a profundidad 18 y MultiPV 8 (scripts/verify-fase4.mts, modo estrategia): la solución es la mejor jugada y toda otra
 * jugada queda al menos 60 centipeones por debajo. Toda frase de valoración de esta unidad se limita a un hecho que
 * comprueba el código con chessops (scripts/lib/strategy-facts.ts; test/content/unitsF.test.ts): columna sin peones,
 * torre en la séptima fila con el rey rival en la octava, caballo protegido por un peón y fuera del alcance de los peones
 * rivales. Lo que el motor NO valida es la pedagogía de explicar un plan: por qué estas ideas son útiles, en qué orden
 * enseñarlas y si el alumno las entiende. Eso lo tienen que juzgar profesores.
 */

type Kind = 'open' | 'seventh' | 'outpost';
interface Row {
  fen: string;
  uci: string;
  san: string;
  /** Columna abierta (open) o casilla de destino (seventh, outpost). */
  at: string;
}

const PROMPT: Record<Kind, (r: Row) => string> = {
  open: (r) => `Juegan blancas. La columna ${r.at} no tiene peones de ningún bando. Elige la mejor jugada.`,
  seventh: () => 'Juegan blancas. El rey negro está en la octava fila y hay peones negros en la séptima. Elige la mejor jugada.',
  outpost: (r) => `Juegan blancas. Ningún peón negro puede atacar la casilla ${r.at}. Elige la mejor jugada.`,
};
const HINT: Record<Kind, string> = {
  open: 'Una torre rinde más en una columna sin peones.',
  seventh: 'Mira a qué fila de peones rivales puede llegar la torre.',
  outpost: 'Busca una casilla protegida por un peón propio.',
};
const GOOD: Record<Kind, (r: Row) => string> = {
  open: (r) => `Correcto: ${r.san}. La columna ${r.at} es una columna abierta, sin peones de ningún bando, y la torre la ocupa.`,
  seventh: (r) => `Correcto: ${r.san}. La torre llega a la séptima fila, con el rey negro en la octava y peones negros en la séptima.`,
  outpost: (r) => `Correcto: ${r.san}. El caballo queda en ${r.at}, protegido por un peón blanco y sin peones negros que puedan atacarlo.`,
};

const step = (kind: Kind, r: Row): PracticeStep => ({
  fen: r.fen,
  prompt: PROMPT[kind](r),
  solutionUci: [r.uci],
  hint: HINT[kind],
  explanationCorrect: `${GOOD[kind](r)} Stockfish la valora al menos 0,6 peones por encima de cualquier otra jugada.`,
  explanationWrong: `Esa no es la mejor jugada: Stockfish la valora al menos 0,6 peones por debajo de ${r.san}.`,
});

const lesson = (
  n: number,
  title: string,
  objective: string,
  conceptId: string,
  intro: string,
  kind: Kind,
  explanation: ExplainStep[],
  rows: Row[],
): Lesson => ({
  id: `u16.l0${n}`,
  unitId: 'u16',
  title,
  objective,
  conceptIds: [conceptId],
  intro,
  explanation,
  practice: rows.slice(0, 3).map((r) => step(kind, r)),
  evaluation: rows.slice(3, 6).map((r) => step(kind, r)),
});

const SF = 'Stockfish valora esa jugada al menos 0,6 peones por encima de cualquier otra.';

export const unit: Unit = {
  id: 'u16',
  order: 16,
  title: 'Estrategia verificable: actividad de las piezas',
  description:
    'Tres ideas de plan que se pueden comprobar: la torre a una columna abierta, la torre a la séptima fila y el caballo en una casilla de avanzada. Posiciones construidas y comprobadas con Stockfish a profundidad 18.',
  level: 'competitive',
  requires: ['u12'],
  lessons: [
    lesson(
      1,
      'Torre a la columna abierta',
      'Elegir la jugada que lleva una torre a una columna sin peones cuando es la mejor del tablero.',
      'strategy.open_file',
      'Una columna abierta es una columna sin peones de ningún bando. La torre es la pieza que más gana en ellas, porque ve todo el tablero. Aquí la mejor jugada es llevar una torre a la columna abierta. El motor la valora al menos 0,6 peones por encima de cualquier otra.',
      'open',
      [
        {
          fen: 'r5k1/3npppp/1p6/2p5/P1N5/8/2P1PPPP/4R1K1 w - - 0 1',
          text: `Juegan blancas. La columna d no tiene peones de ningún bando: es una columna abierta. Con Rd1 la torre blanca de e1 la ocupa. ${SF}`,
          squares: ['d1'],
          arrows: [['e1', 'd1']],
        },
        {
          fen: '1r4k1/2pn1ppp/8/p3p3/8/1PP1PN2/P4PPP/5RK1 w - - 0 1',
          text: `Juegan blancas. La columna d vuelve a estar abierta. Rd1 lleva allí la torre de f1. ${SF}`,
          squares: ['d1'],
          arrows: [['f1', 'd1']],
        },
      ],
      [
        { fen: '3r2k1/5ppp/pp1p4/4p3/8/1P1P4/P3PPPP/4R1K1 w - - 0 1', uci: 'e1c1', san: 'Rc1', at: 'c' },
        { fen: '5rk1/pp3ppp/8/3p4/3P4/PP2P3/5PPP/R5K1 w - - 0 1', uci: 'a1c1', san: 'Rc1', at: 'c' },
        { fen: 'r5k1/p4ppp/1p1p4/4p3/8/1P6/P2PPPPP/1R4K1 w - - 0 1', uci: 'b1c1', san: 'Rc1', at: 'c' },
        { fen: 'r5k1/4pppp/pp1p4/8/PP1P4/4P3/5PPP/4R1K1 w - - 0 1', uci: 'e1c1', san: 'Rc1', at: 'c' },
        { fen: 'r5k1/1p3ppp/3p4/p3p3/8/4P3/PP1P1PPP/5RK1 w - - 0 1', uci: 'f1c1', san: 'Rc1', at: 'c' },
        { fen: '5rk1/pp1p1ppp/8/4p3/1P6/3PP3/P4PPP/1R4K1 w - - 0 1', uci: 'b1c1', san: 'Rc1', at: 'c' },
      ],
    ),
    lesson(
      2,
      'Torre a la séptima fila',
      'Reconocer cuándo la mejor jugada es llevar una torre a la séptima fila, con el rey rival en la octava.',
      'strategy.seventh_rank',
      'La séptima fila es la fila donde empiezan los peones rivales. Una torre allí, con el rey rival encerrado en la octava fila, ataca los peones desde atrás y limita al rey. En las posiciones de esta lección la mejor jugada es llegar a la séptima fila, y el motor la valora al menos 0,6 peones por encima de cualquier otra.',
      'seventh',
      [
        {
          fen: '5rk1/1p1n1ppp/3p4/8/P1B5/3P4/1P3PPP/4R1K1 w - - 0 1',
          text: `Juegan blancas. Con Re7 la torre blanca de e1 llega a la séptima fila: el rey negro está en la octava y hay peones negros en la séptima. ${SF}`,
          squares: ['e7'],
          arrows: [['e1', 'e7']],
        },
        {
          fen: '1r4k1/p4ppp/2pp4/8/P2P4/1P6/2P2PPP/4R1K1 w - - 0 1',
          text: `Juegan blancas. De nuevo Re7: la torre de e1 llega a la séptima fila, con el rey negro en la octava. ${SF}`,
          squares: ['e7'],
          arrows: [['e1', 'e7']],
        },
      ],
      [
        { fen: '1r4k1/2p2ppp/1pb5/8/2B5/P2P4/2P2PPP/4R1K1 w - - 0 1', uci: 'e1e7', san: 'Re7', at: 'e7' },
        { fen: '2r3k1/pp2bppp/8/8/2B5/1PP1P3/5PPP/3R2K1 w - - 0 1', uci: 'd1d7', san: 'Rd7', at: 'd7' },
        { fen: '2r3k1/1p1n1ppp/2p5/8/2B5/8/P2P1PPP/4R1K1 w - - 0 1', uci: 'e1e7', san: 'Re7', at: 'e7' },
        { fen: '4r1k1/1p3ppp/2p2b2/4p3/2B5/P1P1P3/1P3PPP/3R2K1 w - - 0 1', uci: 'd1d7', san: 'Rd7', at: 'd7' },
        { fen: '5rk1/pp2nppp/8/3p4/PP1PP3/8/4NPPP/2R3K1 w - - 0 1', uci: 'c1c7', san: 'Rc7', at: 'c7' },
        { fen: '4r1k1/1b3ppp/pp6/4p3/2B5/2P1P3/PP3PPP/3R2K1 w - - 0 1', uci: 'd1d7', san: 'Rd7', at: 'd7' },
      ],
    ),
    lesson(
      3,
      'Caballo en una casilla de avanzada',
      'Reconocer cuándo la mejor jugada es colocar un caballo en una casilla protegida por un peón y fuera del alcance de los peones rivales.',
      'strategy.outpost',
      'Una casilla de avanzada es una casilla del campo rival donde tu caballo está protegido por un peón propio y ningún peón rival puede atacarlo. Un caballo allí no se puede echar con un peón y presiona toda la zona. En las posiciones de esta lección la mejor jugada lleva el caballo a esa casilla, y el motor la valora al menos 0,6 peones por encima de cualquier otra.',
      'outpost',
      [
        {
          fen: '3r2k1/5ppp/1p3b2/p7/PNP5/4P3/5PPP/1R4K1 w - - 0 1',
          text: `Juegan blancas. En d5 el caballo de b4 estaría protegido por el peón de c4, y ningún peón negro puede atacar esa casilla. ${SF}`,
          squares: ['d5'],
          arrows: [['b4', 'd5']],
        },
        {
          fen: 'r5k1/1p3ppp/5b2/p7/1N2P3/2P5/P4PPP/3R2K1 w - - 0 1',
          text: `Juegan blancas. Ahora el peón de e4 protege la casilla d5, y ningún peón negro puede atacarla. Nd5 es la mejor jugada. ${SF}`,
          squares: ['d5'],
          arrows: [['b4', 'd5']],
        },
      ],
      [
        { fen: '3r2k1/1p1b1ppp/8/p7/1NP1P3/8/P4PPP/4R1K1 w - - 0 1', uci: 'b4d5', san: 'Nd5', at: 'd5' },
        { fen: 'r5k1/5ppp/1p2b3/p7/1NP1P3/8/P4PPP/3R2K1 w - - 0 1', uci: 'b4d5', san: 'Nd5', at: 'd5' },
        { fen: '4r1k1/4bppp/pp6/8/2P5/1P2N3/P4PPP/4R1K1 w - - 0 1', uci: 'e3d5', san: 'Nd5', at: 'd5' },
        { fen: '2r3k1/4bppp/pp6/8/1N2P3/2P5/1P3PPP/R5K1 w - - 0 1', uci: 'b4d5', san: 'Nd5', at: 'd5' },
        { fen: '5rk1/4bppp/pp6/8/1PP2N2/4P3/5PPP/R5K1 w - - 0 1', uci: 'f4d5', san: 'Nd5', at: 'd5' },
        { fen: '5rk1/4bppp/pp6/8/1PP5/4N3/4PPPP/R5K1 w - - 0 1', uci: 'e3d5', san: 'Nd5', at: 'd5' },
      ],
    ),
  ],
};
