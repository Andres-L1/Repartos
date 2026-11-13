import { describe, expect, it } from 'vitest';
import { makeFen } from 'chessops/fen';
import { loadPosition, playLine } from '../../src/diagnosis/chess-utils.js';
import { diagnose } from '../../src/diagnosis/index.js';
import { buildErrorLesson, type ErrorLesson } from '../../src/pedagogy/error-lesson.js';
import { lossInPieces, ruleFor } from '../../src/pedagogy/review-copy.js';
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

      it('el texto de lo ocurrido parte del hecho verificado', () => {
        const err = keyError(c);
        expect(buildErrorLesson(err, 'advanced').happened.text).toBe(err.diagnosis.fact);
        expect(buildErrorLesson(err, 'beginner').happened.text.trim()).toBeTruthy();
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
