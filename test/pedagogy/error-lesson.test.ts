import { describe, expect, it } from 'vitest';
import type { Chess } from 'chessops/chess';
import { makeFen } from 'chessops/fen';
import { makeSquare, parseSquare } from 'chessops/util';
import { loadPosition, playLine } from '../../src/diagnosis/chess-utils.js';
import { diagnose } from '../../src/diagnosis/index.js';
import { buildErrorLesson, describeMove, type ErrorLesson } from '../../src/pedagogy/error-lesson.js';
import { HAPPENED, lossInPieces, ruleFor, youMove, youMoved } from '../../src/pedagogy/review-copy.js';
import type { KeyError } from '../../src/review/types.js';
import type { AnalyzedMove, Level, Score } from '../../src/types.js';

const JARGON = /evaluaci[oó]n|centipe[oó]n|peones? de/i;
const CONCEPT_IDS = [
  'tactics.hanging_piece',
  'tactics.bad_exchange',
  'tactics.fork',
  'tactics.pin',
  'tactics.mate_threat',
  'tactics.discovered_attack',
];

interface Case {
  name: string;
  fen: string;
  uci: string;
  pvAfter: string[];
  /** Variante del motor desde fenBefore; pv[0] es la jugada mejor. */
  pv: string[];
  scoreBefore?: Score;
  scoreAfter?: Score;
}

/** AnalyzedMove real: fenAfter, SAN y legalidad calculados con chessops. */
function mk(c: Case): AnalyzedMove {
  const pos = loadPosition(c.fen)!;
  const played = playLine(pos, [c.uci]);
  expect(played.length, `${c.name}: jugada legal`).toBe(1);
  expect(playLine(played[0]!.pos, c.pvAfter).length, `${c.name}: pvAfter legal`).toBe(c.pvAfter.length);
  expect(playLine(pos, c.pv).length, `${c.name}: pv legal`).toBe(c.pv.length);
  return {
    ply: 21,
    color: pos.turn,
    fenBefore: c.fen,
    fenAfter: makeFen(played[0]!.pos.toSetup()),
    san: played[0]!.san,
    uci: c.uci,
    scoreBefore: c.scoreBefore ?? { cp: 0 },
    scoreAfter: c.scoreAfter ?? { cp: pos.turn === 'white' ? -300 : 300 },
    bestUci: c.pv[0]!,
    bestSan: playLine(pos, [c.pv[0]!])[0]!.san,
    pv: c.pv,
    pvAfter: c.pvAfter,
    cpLoss: 300,
    classification: 'blunder',
  };
}

/** Cadena completa y real: AnalyzedMove -> diagnose -> KeyError. */
function keyError(c: Case): KeyError {
  const move = mk(c);
  const diagnosis = diagnose(move);
  expect(diagnosis, `${c.name}: diagnóstico verificado`).not.toBeNull();
  return { gameId: 'g1', move, diagnosis: diagnosis! };
}

const C = {
  hangingMoved: {
    name: 'dama a d5 sin defensa',
    fen: '4k3/4n3/8/8/8/8/8/3QK3 w - - 0 1',
    uci: 'd1d5',
    pvAfter: ['e7d5'],
    pv: ['d1d7'],
  },
  hangingStill: {
    name: 'caballo de c3 sin defensa',
    fen: '4k3/8/8/8/1b6/2N5/8/R3K3 w - - 0 1',
    uci: 'a1b1',
    pvAfter: ['b4c3'],
    pv: ['a1c1'],
  },
  hangingTwoFree: {
    name: 'dos piezas sin defensa a la vez',
    fen: '4k2r/8/8/8/1b5B/2N5/8/R3K3 w - - 0 1',
    uci: 'a1b1',
    pvAfter: ['b4c3'],
    pv: ['a1c1'],
  },
  exchangeOwnCapture: {
    name: 'torre por peón defendido',
    fen: '4k3/8/3p4/4p3/8/8/8/4RK2 w - - 0 1',
    uci: 'e1e5',
    pvAfter: ['d6e5'],
    pv: ['f1f2'],
  },
  exchangeIgnored: {
    name: 'alfil de g5 atacado por un peón',
    fen: '4k3/8/7p/6B1/8/5N2/8/4K3 w - - 0 1',
    uci: 'e1e2',
    pvAfter: ['h6g5', 'f3g5'],
    pv: ['g5f4'],
  },
  exchangeMovedInto: {
    name: 'alfil a g5, casilla atacada',
    fen: '4k3/8/7p/8/5B2/5N2/8/4K3 w - - 0 1',
    uci: 'f4g5',
    pvAfter: ['h6g5', 'f3g5'],
    pv: ['f4e5'],
  },
  fork: {
    name: 'horquilla de caballo en f3',
    fen: '4k3/8/8/4n3/8/8/3Q1PPP/6K1 w - - 0 1',
    uci: 'g2g3',
    pvAfter: ['e5f3', 'g1g2', 'f3d2'],
    pv: ['d2e2'],
  },
  pinKing: {
    name: 'caballo clavado contra el rey',
    fen: '4k3/8/8/b2p4/8/2N5/8/4K2R w - - 0 1',
    uci: 'h1g1',
    pvAfter: ['d5d4', 'g1g2', 'd4c3'],
    pv: ['e1e2'],
  },
  pinQueen: {
    name: 'caballo clavado contra la dama',
    fen: '3r2k1/8/4p3/8/3N4/8/7P/3Q2K1 w - - 0 1',
    uci: 'h2h3',
    pvAfter: ['e6e5', 'g1h2', 'e5d4'],
    pv: ['d4f3'],
  },
  mateAllowed1: {
    name: 'mate del loco',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2',
    uci: 'g2g4',
    pvAfter: ['d8h4'],
    pv: ['e2e4'],
    scoreAfter: { mate: -1 },
  },
  mateAllowed2: {
    name: 'mate de pasillo en 2',
    fen: 'r5k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    uci: 'e1e4',
    pvAfter: ['a8a1', 'e4e1', 'a1e1'],
    pv: ['h2h3'],
    scoreAfter: { mate: -2 },
  },
  mateMissed1: {
    name: 'mate en 1 desaprovechado',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    uci: 'h2h3',
    pvAfter: ['g7g6'],
    pv: ['e1e8'],
    scoreBefore: { mate: 1 },
    scoreAfter: { cp: 800 },
  },
  discoveredCheck: {
    name: 'jaque a la descubierta (Petrov)',
    fen: 'rnbqkb1r/pppp1ppp/8/4N3/4n3/8/PPPPQPPP/RNB1KB1R b KQkq - 1 4',
    uci: 'e4f6',
    pvAfter: ['e5c6', 'f8e7', 'c6d8', 'e8d8', 'd2d4', 'a7a5'],
    pv: ['d8e7'],
  },
  discoveredQueen: {
    name: 'ataque descubierto a la dama',
    fen: '3q2k1/8/8/8/3N4/8/8/3RK3 b - - 0 1',
    uci: 'g8h8',
    pvAfter: ['d4b5', 'd8d1', 'e1d1'],
    pv: ['d8d4'],
  },
  // --- Posiciones con una segunda respuesta legítima: la pausa debe omitirse. ---
  exchangeTwoWinning: {
    name: 'dos piezas tuyas capturables saliendo ganando',
    // Además del alfil de g5 (hxg5), el caballo de a4 cae gratis con bxa4.
    fen: '4k3/8/7p/1p4B1/N7/5N2/8/4K3 w - - 0 1',
    uci: 'e1e2',
    pvAfter: ['h6g5', 'f3g5'],
    pv: ['g5f4'],
  },
  forkTwoSquares: {
    name: 'dos casillas de horquilla',
    // El caballo de e5 hace horquilla en f3 (rey y dama) y también en c4 (dama y torre de b2).
    fen: '4k3/8/8/4n3/8/8/1R1Q1PPP/6K1 w - - 0 1',
    uci: 'g2g3',
    pvAfter: ['e5f3', 'g1g2', 'f3d2'],
    pv: ['d2e2'],
  },
  discoveredTwoBlockers: {
    name: 'dos piezas rivales tapan líneas hacia la dama',
    // Contra la dama de d8: el caballo de d4 tapa la torre de d1 y el peón de b6 tapa el alfil de a5.
    fen: '3q2k1/8/1P6/B7/3N4/8/8/3RK3 b - - 0 1',
    uci: 'g8h8',
    pvAfter: ['d4b5', 'd8d1', 'e1d1'],
    pv: ['d8d4'],
  },
  mateMissedTwoPieces: {
    name: 'mate en 1 con dos torres distintas',
    // Re8# y Rd8# dan mate: «¿con qué pieza?» tiene dos respuestas.
    fen: '6k1/5ppp/8/8/8/8/5PPP/3RR1K1 w - - 0 1',
    uci: 'h2h3',
    pvAfter: ['g7g6'],
    pv: ['e1e8'],
    scoreBefore: { mate: 1 },
    scoreAfter: { cp: 800 },
  },
  mateMissed2: {
    name: 'mate en 2 desaprovechado',
    fen: '5r1k/6pp/8/8/8/8/R5PP/R5K1 w - - 0 1',
    uci: 'h2h3',
    pvAfter: ['g7g6'],
    pv: ['a2a8', 'f8a8', 'a1a8'],
    scoreBefore: { mate: 2 },
    scoreAfter: { cp: 300 },
  },
} satisfies Record<string, Case>;

const ALL = Object.values(C);
const LEVELS: Level[] = ['beginner', 'initiation', 'basic', 'intermediate', 'advanced', 'competitive'];

const texts = (l: ErrorLesson): string[] => [l.pause?.question ?? '', l.happened.text, l.why, l.best.text, l.rule];
const lesson = (c: Case, level: Level = 'beginner') => buildErrorLesson(keyError(c), level);

describe('buildErrorLesson: datos básicos', () => {
  it('copia partida, jugada, posición y concepto del error clave', () => {
    const err = keyError(C.hangingMoved);
    const l = buildErrorLesson(err, 'beginner');
    expect(l.gameId).toBe('g1');
    expect(l.ply).toBe(21);
    expect(l.fenBefore).toBe(C.hangingMoved.fen);
    expect(l.yourMoveSan).toBe('Qd5');
    expect(l.conceptId).toBe('tactics.hanging_piece');
  });

  it('cubre los 6 conceptos, cada uno con pausa, por qué y regla no vacíos', () => {
    const withPause = [C.hangingMoved, C.exchangeIgnored, C.fork, C.pinKing, C.mateAllowed1, C.discoveredCheck];
    const seen = new Set<string>();
    for (const c of withPause) {
      const l = lesson(c);
      seen.add(l.conceptId);
      expect(l.pause?.question.trim(), c.name).toBeTruthy();
      expect(l.pause!.correctSquares.length, c.name).toBeGreaterThan(0);
      expect(l.why.trim(), c.name).toBeTruthy();
      expect(l.rule.trim(), c.name).toBeTruthy();
      expect(l.rule).toBe(ruleFor(l.conceptId));
    }
    expect([...seen].sort()).toEqual([...CONCEPT_IDS].sort());
  });
});

describe('buildErrorLesson: invariantes en todos los casos reales', () => {
  for (const c of ALL) {
    describe(c.name, () => {
      it('sin jerga en beginner e initiation', () => {
        for (const level of ['beginner', 'initiation'] as Level[]) {
          for (const t of texts(lesson(c, level))) expect(t, `${level}: ${t}`).not.toMatch(JARGON);
        }
      });

      it('correctSquares y círculos salen de evidence.squares', () => {
        const err = keyError(c);
        for (const level of LEVELS) {
          const l = buildErrorLesson(err, level);
          const ev = err.diagnosis.evidence.squares;
          for (const s of l.pause?.correctSquares ?? []) expect(ev, `${level} pausa ${s}`).toContain(s);
          for (const s of l.happened.circles) expect(ev, `${level} círculo ${s}`).toContain(s);
        }
      });

      it('best.san es legal desde fenBefore y coincide con best.uci', () => {
        const l = lesson(c);
        const pos = loadPosition(l.fenBefore)!;
        const step = playLine(pos, [l.best.uci])[0];
        expect(step, `${l.best.uci} legal`).toBeDefined();
        expect(l.best.san).toBe(step!.san);
        expect(l.best.text).toContain(l.best.san);
      });

      it('las flechas incluyen la jugada mejor en tono good y la jugada del alumno en tono bad', () => {
        const err = keyError(c);
        const l = buildErrorLesson(err, 'initiation');
        expect(l.happened.arrows).toContainEqual({ from: l.best.uci.slice(0, 2), to: l.best.uci.slice(2, 4), tone: 'good' });
        expect(l.happened.arrows).toContainEqual({ from: err.move.uci.slice(0, 2), to: err.move.uci.slice(2, 4), tone: 'bad' });
      });

      it('lo ocurrido es una frase para principiantes, no la frase técnica del diagnóstico', () => {
        const err = keyError(c);
        for (const level of LEVELS) {
          const l = buildErrorLesson(err, level);
          const t = l.happened.text;
          expect(t, level).not.toBe(err.diagnosis.fact);
          expect(t).toMatch(/^[A-ZÁÉÍÓÚ].*\.$/);
          expect(t.split(/[.?!]\s/).length, `una sola frase: ${t}`).toBe(1);
          expect(err.diagnosis.evidence.squares.some((s) => t.includes(s)), `nombra una casilla: ${t}`).toBe(true);
          for (const x of texts(l)) {
            expect(x).not.toMatch(/No atendiste/i);
            expect(x, `notación repetida en: ${x}`).not.toMatch(/(\S+) \(\1\)/);
          }
        }
      });
    });
  }
});

describe('pausa por tipo', () => {
  it('pieza colgada movida: pregunta qué pieza rival puede comerse tu dama', () => {
    const l = lesson(C.hangingMoved);
    expect(l.pause?.correctSquares).toEqual(['e7']);
    expect(l.pause?.question).toContain('Qd5');
    expect(l.pause?.question).toContain('dama');
  });

  it('pieza colgada que no se movió: pregunta qué pieza tuya queda gratis', () => {
    expect(lesson(C.hangingStill).pause?.correctSquares).toEqual(['c3']);
  });

  it('dos piezas sin defensa a la vez: la respuesta no es única y no hay pausa', () => {
    const err = keyError(C.hangingTwoFree);
    expect(err.diagnosis.type).toBe('hanging_piece');
    expect(buildErrorLesson(err, 'beginner').pause).toBeUndefined();
  });

  it('cambio malo empezado por tu captura: no hay casilla comprobable y no hay pausa', () => {
    const err = keyError(C.exchangeOwnCapture);
    expect(err.diagnosis.type).toBe('bad_exchange');
    expect(buildErrorLesson(err, 'beginner').pause).toBeUndefined();
  });

  it('cambio malo sobre una pieza que ya estaba: la pieza tuya', () => {
    expect(lesson(C.exchangeIgnored).pause?.correctSquares).toEqual(['g5']);
  });

  it('cambio malo al llevar una pieza a una casilla atacada: la pieza rival que captura', () => {
    expect(lesson(C.exchangeMovedInto).pause?.correctSquares).toEqual(['h6']);
  });

  it('horquilla: la casilla desde la que ataca a dos piezas', () => {
    const l = lesson(C.fork);
    expect(l.pause?.correctSquares).toEqual(['f3']);
    expect(l.pause?.question).toContain('caballo');
    expect(l.happened.circles).toEqual(expect.arrayContaining(['g1', 'd2']));
  });

  it('clavada contra el rey: la pieza clavada', () => {
    const l = lesson(C.pinKing);
    expect(l.pause?.correctSquares).toEqual(['c3']);
    expect(l.pause?.question).toContain('rey');
  });

  it('clavada contra la dama: la pieza clavada', () => {
    const l = lesson(C.pinQueen);
    expect(l.pause?.correctSquares).toEqual(['d4']);
    expect(l.pause?.question).toContain('dama');
  });

  it('permite mate en 1: la casilla del mate', () => {
    const l = lesson(C.mateAllowed1);
    expect(l.pause?.correctSquares).toEqual(['h4']);
    expect(l.pause?.question).toContain('dama');
  });

  it('permite mate en 2: sin casilla clara para un principiante, no hay pausa', () => {
    const err = keyError(C.mateAllowed2);
    expect(err.diagnosis.type).toBe('mate_threat');
    expect(buildErrorLesson(err, 'beginner').pause).toBeUndefined();
  });

  it('mate propio desaprovechado: la pieza que da mate', () => {
    const l = lesson(C.mateMissed1);
    expect(l.pause?.correctSquares).toEqual(['e1']);
    expect(l.best.san).toBe('Re8#');
  });

  it('descubierta con jaque: la pieza rival que se aparta', () => {
    const l = lesson(C.discoveredCheck);
    expect(l.pause?.correctSquares).toEqual(['e5']);
    expect(l.pause?.question).toContain('rey');
  });

  it('descubierta contra la dama: la pieza rival que se aparta', () => {
    const l = lesson(C.discoveredQueen);
    expect(l.pause?.correctSquares).toEqual(['d4']);
    expect(l.pause?.question).toContain('dama');
  });
});

describe('material sin jerga', () => {
  it('en niveles bajos la pérdida se dice en piezas', () => {
    const l = lesson(C.discoveredCheck, 'beginner');
    expect(l.happened.text).not.toMatch(JARGON);
    expect(l.happened.text).toMatch(/un alfil o un caballo|una torre|la dama|peón|peones/);
  });
});

describe('ruleFor', () => {
  it('regla fija de la pieza colgada', () => {
    expect(ruleFor('tactics.hanging_piece')).toBe('Antes de mover, mira si tu pieza queda protegida.');
  });

  it('una frase distinta y corta por cada concepto', () => {
    const rules = CONCEPT_IDS.map(ruleFor);
    expect(new Set(rules).size).toBe(6);
    for (const r of rules) {
      expect(r).toMatch(/^[A-ZÁÉÍÓÚ¿].*\.$/);
      expect(r.split(' ').length).toBeLessThanOrEqual(16);
      expect(r).not.toMatch(JARGON);
    }
  });
});

describe('lossInPieces', () => {
  it('traduce el material a piezas', () => {
    expect(lossInPieces(100)).toBe('un peón');
    expect(lossInPieces(200)).toBe('dos peones');
    expect(lossInPieces(300)).toBe('un alfil o un caballo');
    expect(lossInPieces(500)).toBe('una torre');
    expect(lossInPieces(900)).toBe('la dama');
  });

  it('redondea y nunca usa jerga', () => {
    expect(lossInPieces(280)).toBe('un alfil o un caballo');
    for (let cp = 0; cp <= 1500; cp += 50) expect(lossInPieces(cp)).not.toMatch(JARGON);
  });
});

describe('qué pasó: texto exacto en los casos reales', () => {
  const expected: [Case, string][] = [
    [C.hangingMoved, 'Tu dama en d5 se queda sin protección, y el caballo rival de e7 la captura gratis.'],
    [C.hangingStill, 'Tu caballo en c3 ya estaba atacado y sin protección, y el alfil rival de b4 lo captura gratis.'],
    [C.exchangeOwnCapture, 'En e5 entregas tu torre y solo recibes un peón.'],
    [C.exchangeIgnored, 'En g5 entregas tu alfil y solo recibes un peón.'],
    [C.exchangeMovedInto, 'En g5 entregas tu alfil y solo recibes un peón.'],
    [C.fork, 'El caballo rival va a f3 y ataca a la vez a tu rey en g1 y a tu dama en d2.'],
    [C.pinKing, 'Tu caballo en c3 no puede moverse, porque tu rey quedaría en jaque por el alfil rival en a5, y el rival acaba ganando tu caballo.'],
    [C.pinQueen, 'Tu caballo en d4 no debe moverse, porque dejaría a tu dama en d1 atacada por la torre rival en d8, y el rival acaba ganando tu caballo.'],
    [C.mateAllowed1, 'Moviste el peón a g4 y la dama rival da jaque mate en h4.'],
    [C.mateAllowed2, 'Moviste la torre a e4 (Re4) y el rival tiene una serie de jaques que acaba en jaque mate, con la torre rival en e1.'],
    [C.mateMissed1, 'Con tu torre de e1 podías dar jaque mate en e8, y en su lugar moviste el peón a h3.'],
    [C.mateMissed2, 'Moviendo tu torre de a2 empezabas una serie de jaques que acababa en jaque mate, y en su lugar moviste el peón a h3.'],
    [C.discoveredCheck, 'El caballo rival se mueve de e5 a c6 y deja a la dama rival en e2 dando jaque a tu rey; al final pierdes más que una torre.'],
    [C.discoveredQueen, 'El caballo rival se mueve de d4 a b5 y deja a la torre rival en d1 atacando a tu dama en d8; al final pierdes algo más que un alfil o un caballo.'],
  ];
  for (const [c, text] of expected) {
    it(c.name, () => expect(lesson(c).happened.text).toBe(text));
  }
});

describe('qué pasó: concordancia de género y número por pieza', () => {
  const ROLES = ['pawn', 'knight', 'bishop', 'rook', 'queen'] as const;
  const NAME = { pawn: 'peón', knight: 'caballo', bishop: 'alfil', rook: 'torre', queen: 'dama' };
  const FEM = { pawn: false, knight: false, bishop: false, rook: true, queen: true };

  it('pieza colgada recién movida, para cada pieza propia', () => {
    for (const r of ROLES) {
      expect(HAPPENED.hangingMoved(r, 'd5', 'knight', 'e7')).toBe(
        `Tu ${NAME[r]} en d5 se queda sin protección, y el caballo rival de e7 ${FEM[r] ? 'la' : 'lo'} captura gratis.`,
      );
    }
  });

  it('pieza colgada que ya estaba atacada: «atacado» / «atacada», atacantes de cada pieza (rey incluido)', () => {
    expect(HAPPENED.hangingThreatened('pawn', 'c3', 'bishop', 'b4')).toBe(
      'Tu peón en c3 ya estaba atacado y sin protección, y el alfil rival de b4 lo captura gratis.',
    );
    expect(HAPPENED.hangingThreatened('knight', 'c3', 'bishop', 'b4')).toBe(
      'Tu caballo en c3 ya estaba atacado y sin protección, y el alfil rival de b4 lo captura gratis.',
    );
    expect(HAPPENED.hangingThreatened('bishop', 'c3', 'pawn', 'b4')).toBe(
      'Tu alfil en c3 ya estaba atacado y sin protección, y el peón rival de b4 lo captura gratis.',
    );
    expect(HAPPENED.hangingThreatened('rook', 'c3', 'king', 'b4')).toBe(
      'Tu torre en c3 ya estaba atacada y sin protección, y el rey rival de b4 la captura gratis.',
    );
    expect(HAPPENED.hangingThreatened('queen', 'c3', 'rook', 'c8')).toBe(
      'Tu dama en c3 ya estaba atacada y sin protección, y la torre rival de c8 la captura gratis.',
    );
  });

  it('pieza que tu jugada deja sin protección, con atacantes de ambos géneros', () => {
    expect(HAPPENED.hangingLeft('rook', 'a1', 'queen', 'h8')).toBe(
      'Después de tu jugada, tu torre en a1 se queda sin protección, y la dama rival de h8 la captura gratis.',
    );
    expect(HAPPENED.hangingLeft('pawn', 'e4', 'knight', 'f6')).toBe(
      'Después de tu jugada, tu peón en e4 se queda sin protección, y el caballo rival de f6 lo captura gratis.',
    );
  });

  it('cambio malo: «tu» para lo que das y «un» / «una» para lo que recibes', () => {
    for (const r of ROLES) {
      expect(HAPPENED.exchange('e5', [r], ['pawn'])).toBe(`En e5 entregas tu ${NAME[r]} y solo recibes un peón.`);
      expect(HAPPENED.exchange('e5', ['queen'], [r])).toBe(`En e5 entregas tu dama y solo recibes ${FEM[r] ? 'una' : 'un'} ${NAME[r]}.`);
    }
    expect(HAPPENED.exchange('d4', ['queen'], ['knight', 'pawn'])).toBe('En d4 entregas tu dama y solo recibes un caballo y un peón.');
    expect(HAPPENED.exchange('d4', ['rook'], ['pawn', 'pawn'])).toBe('En d4 entregas tu torre y solo recibes dos peones.');
    expect(HAPPENED.exchange('d4', ['bishop', 'knight'], ['rook'])).toBe('En d4 entregas tu alfil y tu caballo y solo recibes una torre.');
    expect(HAPPENED.exchange('d5', ['queen'], [])).toBe('En d5 entregas tu dama y no recibes nada a cambio.');
  });

  it('clavada y horquilla con piezas femeninas', () => {
    expect(HAPPENED.pinKing('rook', 'e4', 'queen', 'e7', false)).toBe(
      'Tu torre en e4 no puede moverse, porque tu rey quedaría en jaque por la dama rival en e7.',
    );
    expect(HAPPENED.pinPiece('bishop', 'd4', 'rook', 'd8', 'queen', 'd1', true)).toBe(
      'Tu alfil en d4 no debe moverse, porque dejaría a tu dama en d1 atacada por la torre rival en d8, y el rival acaba ganando tu alfil.',
    );
    expect(HAPPENED.fork('queen', 'e4', [{ role: 'rook', square: 'a8' }, { role: 'king', square: 'h7' }])).toBe(
      'La dama rival va a e4 y ataca a la vez a tu torre en a8 y a tu rey en h7.',
    );
  });
});

/**
 * Comprobaciones independientes (por fuerza bruta sobre las jugadas legales) de que la respuesta de la
 * pausa es la ÚNICA correcta para la pregunta que se hace. Los oráculos de horquilla y descubierta
 * enumeran jugadas de otra forma que el código de producción, para no validarlo consigo mismo.
 */
describe('pausa: la respuesta es la única correcta', () => {
  type M = { from: number; to: number; promotion?: 'queen' };
  const pos = (fen: string) => loadPosition(fen)!;
  const moves = (p: Chess): M[] => {
    const out: M[] = [];
    for (const [from, dests] of p.allDests()) {
      for (const to of dests) {
        const last = to >> 3 === 0 || to >> 3 === 7;
        out.push(p.board.get(from)!.role === 'pawn' && last ? { from, to, promotion: 'queen' } : { from, to });
      }
    }
    return out;
  };
  const play = (p: Chess, m: M) => {
    const n = p.clone();
    n.play(m);
    return n;
  };
  const VAL: Record<string, number> = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };

  /**
   * Horquilla. Pregunta: «¿a qué casilla puede ir <pieza> rival para atacar dos piezas tuyas a la vez y
   * ganarte una?». Una casilla responde si, tras ir allí, la pieza ataca al menos dos piezas tuyas que
   * estén de verdad en peligro: el rey (jaque), una pieza que vale más que ella o una pieza sin defensa.
   * Atacar dos peones defendidos no gana nada, así que no es una respuesta legítima.
   */
  function forkAnswers(fenAfter: string, role: string): string[] {
    const p = pos(fenAfter);
    const them = p.turn;
    const me = them === 'white' ? 'black' : 'white';
    const out = new Set<string>();
    for (const m of moves(p)) {
      if (p.board.get(m.from)!.role !== role) continue;
      const n = play(p, m);
      let hits = 0;
      for (const [s, piece] of n.board) {
        if (piece.color !== me) continue;
        if (!n.kingAttackers(s, them, n.board.occupied).has(m.to)) continue;
        const defended = n.kingAttackers(s, me, n.board.occupied).nonEmpty();
        if (piece.role === 'king' || VAL[piece.role]! > VAL[role]! || !defended) hits++;
      }
      if (hits >= 2) out.add(makeSquare(m.to));
    }
    return [...out];
  }

  /**
   * Descubierta. Pregunta: «¿qué pieza rival puede apartarse y destapar un ataque contra tu <pieza> en <c>?».
   * Una pieza rival responde si alguna de sus jugadas legales hace que OTRA pieza rival pase a atacar <c>.
   */
  function discoveryAnswers(fenAfter: string, target: string): string[] {
    const p = pos(fenAfter);
    const t = parseSquare(target)!;
    const them = p.turn;
    const before = p.kingAttackers(t, them, p.board.occupied);
    const out = new Set<string>();
    for (const m of moves(p)) {
      const n = play(p, m);
      const now = n.kingAttackers(t, them, n.board.occupied).without(m.to);
      if (now.diff(before).nonEmpty()) out.add(makeSquare(m.from));
    }
    return [...out];
  }

  /** Lo que gana quien mueve capturando en s, con recapturas óptimas de ambos (cada uno puede no capturar). */
  function gain(p: Chess, s: number, depth = 8): number {
    const victim = p.board.get(s);
    if (!victim || victim.color === p.turn || depth === 0) return 0;
    let best = 0;
    for (const m of moves(p)) if (m.to === s) best = Math.max(best, VAL[victim.role]! - gain(play(p, m), s, depth - 1));
    return best;
  }

  /** Cambio malo. Pregunta: «¿qué pieza tuya puede capturar el rival saliendo ganando?». */
  function exchangeAnswers(fenAfter: string): string[] {
    const p = pos(fenAfter);
    const out: string[] = [];
    for (const [s, piece] of p.board) {
      if (piece.color === p.turn || piece.role === 'king') continue;
      if (gain(p, s) > 0) out.push(makeSquare(s));
    }
    return out;
  }

  /** Mate propio. Pregunta: «Aquí puedes dar jaque mate en una jugada. ¿Con qué pieza?». */
  function mateAnswers(fenBefore: string): string[] {
    const p = pos(fenBefore);
    return [...new Set(moves(p).filter((m) => play(p, m).isCheckmate()).map((m) => makeSquare(m.from)))];
  }

  const check = (c: Case, answers: (err: KeyError) => string[]) => {
    const err = keyError(c);
    const l = buildErrorLesson(err, 'beginner');
    expect(l.pause, `${c.name}: hay pausa`).toBeDefined();
    const sq = l.pause!.correctSquares;
    expect(sq.length).toBeGreaterThan(0);
    for (const s of sq) expect(err.diagnosis.evidence.squares).toContain(s);
    expect(answers(err).sort()).toEqual([...sq].sort());
  };

  it('horquilla: f3 es la única casilla de ataque doble que gana material', () => {
    check(C.fork, (e) => forkAnswers(e.move.fenAfter, e.diagnosis.evidence.pieces[0]!));
  });

  it('descubierta con jaque: solo el caballo de e5 destapa un ataque contra el rey', () => {
    check(C.discoveredCheck, (e) => discoveryAnswers(e.move.fenAfter, e.diagnosis.evidence.squares[3]!));
  });

  it('descubierta contra la dama: solo el caballo de d4 destapa un ataque contra ella', () => {
    check(C.discoveredQueen, (e) => discoveryAnswers(e.move.fenAfter, e.diagnosis.evidence.squares[3]!));
  });

  it('cambio malo sobre una pieza que ya estaba: solo el alfil de g5 cae con ganancia para el rival', () => {
    check(C.exchangeIgnored, (e) => exchangeAnswers(e.move.fenAfter));
  });

  it('mate desaprovechado: solo la torre de e1 da mate', () => {
    check(C.mateMissed1, (e) => mateAnswers(e.move.fenBefore));
  });

  it('con una segunda respuesta legítima, la pausa se omite', () => {
    const cases: [Case, (e: KeyError) => string[]][] = [
      [C.forkTwoSquares, (e) => forkAnswers(e.move.fenAfter, e.diagnosis.evidence.pieces[0]!)],
      [C.discoveredTwoBlockers, (e) => discoveryAnswers(e.move.fenAfter, e.diagnosis.evidence.squares[3]!)],
      [C.exchangeTwoWinning, (e) => exchangeAnswers(e.move.fenAfter)],
      [C.mateMissedTwoPieces, (e) => mateAnswers(e.move.fenBefore)],
    ];
    for (const [c, answers] of cases) {
      const err = keyError(c);
      expect(answers(err).length, `${c.name}: el oráculo ve varias respuestas`).toBeGreaterThan(1);
      expect(buildErrorLesson(err, 'beginner').pause, c.name).toBeUndefined();
    }
  });

  it('mate desaprovechado en varias jugadas: puede empezar de más de una forma, no hay pausa', () => {
    const err = keyError(C.mateMissed2);
    expect(err.diagnosis.type).toBe('mate_threat');
    expect(buildErrorLesson(err, 'beginner').pause).toBeUndefined();
  });
});

describe('jugadas dichas con palabras (la notación solo entre paréntesis)', () => {
  it('describeMove: mover, capturar, enrocar, coronar y avance de peón', () => {
    expect(describeMove('4k3/4n3/8/8/8/8/8/3QK3 w - - 0 1', 'd1d5', 'Qd5')).toEqual({
      inf: 'mover la dama a d5',
      you: 'mueves la dama a d5',
      past: 'moviste la dama a d5',
      san: 'Qd5',
    });
    expect(youMove(describeMove('4k3/8/3p4/4p3/8/8/8/4RK2 w - - 0 1', 'e1e5', 'Rxe5+'))).toBe(
      'capturas el peón de e5 con la torre (Rxe5+)',
    );
    expect(describeMove('4k3/8/8/8/8/8/8/4K2R w K - 0 1', 'e1g1', 'O-O').inf).toBe('enrocar corto');
    expect(describeMove('4k3/8/8/8/8/8/8/R3K3 w Q - 0 1', 'e1c1', 'O-O-O').inf).toBe('enrocar largo');
    expect(describeMove('8/4P3/8/8/8/8/8/k3K3 w - - 0 1', 'e7e8q', 'e8=Q').inf).toBe('coronar el peón en e8');
    // Un avance de peón sin jaque no repite la casilla entre paréntesis.
    expect(youMoved(describeMove(C.mateAllowed1.fen, 'g2g4', 'g4'))).toBe('moviste el peón a g4');
  });

  it('ninguna pausa, «qué pasó» ni «qué debías hacer» muestra una jugada solo en notación', () => {
    for (const c of ALL) {
      const l = lesson(c);
      expect(l.pause?.question ?? 'Si mueves', c.name).not.toMatch(/Si juegas|jugaste|Después de [A-Z]/);
      expect(l.happened.text, c.name).not.toMatch(/jugaste|Después de [A-Z]/);
      // La notación de la jugada mejor, si aparece, va entre paréntesis tras las palabras.
      expect(l.best.text, c.name).toMatch(/^Una jugada mejor era (mover|capturar|enrocar|coronar) /);
    }
  });

  it('textos exactos de pausa y jugada mejor', () => {
    expect(lesson(C.hangingMoved).pause?.question).toBe(
      'Si mueves la dama a d5 (Qd5), ¿qué pieza rival puede comerse gratis tu dama en d5?',
    );
    expect(lesson(C.hangingStill).pause?.question).toBe(
      'Si mueves la torre a b1 (Rb1), ¿qué pieza tuya puede comerse gratis el rival?',
    );
    expect(lesson(C.hangingMoved).best.text).toBe('Una jugada mejor era mover la dama a d7 (Qd7+).');
    expect(lesson(C.mateMissed1).best.text).toBe('Una jugada mejor era mover la torre a e8, que daba jaque mate y ganaba la partida (Re8#).');
    expect(lesson(C.mateMissed2).best.text).toBe(
      'Una jugada mejor era mover la torre a a8 (Ra8), que empezaba una serie de jaques que terminaba en jaque mate.',
    );
  });
});

describe('qué pasó: texto de reserva', () => {
  it('sin piezas en la evidencia nombra la jugada y la casilla clave', () => {
    const err = keyError(C.hangingMoved);
    const broken: KeyError = { ...err, diagnosis: { ...err.diagnosis, evidence: { ...err.diagnosis.evidence, pieces: [] } } };
    expect(buildErrorLesson(broken, 'beginner').happened.text).toBe('Moviste la dama a d5 (Qd5) y tu rival sale ganando en d5.');
  });

  it('sin casillas solo nombra la jugada', () => {
    const err = keyError(C.fork);
    const broken: KeyError = { ...err, diagnosis: { ...err.diagnosis, evidence: { ...err.diagnosis.evidence, squares: [] } } };
    expect(buildErrorLesson(broken, 'beginner').happened.text).toBe('Moviste el peón a g3 y tu rival sale ganando.');
  });

  it('clavada sin pérdida verificada: no afirma que el rival gane la pieza', () => {
    const err = keyError(C.pinKing);
    const unverified: KeyError = {
      ...err,
      diagnosis: { ...err.diagnosis, evidence: { ...err.diagnosis.evidence, materialLostCp: undefined } },
    };
    expect(buildErrorLesson(unverified, 'beginner').happened.text).toBe(
      'Tu caballo en c3 no puede moverse, porque tu rey quedaría en jaque por el alfil rival en a5.',
    );
  });
});
