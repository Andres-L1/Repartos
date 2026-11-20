import { describe, expect, it } from 'vitest';
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { UNITS } from '../../src/content/index.js';
import { EXERCISES } from '../../src/pedagogy/exercises.js';
import { mirrorExercise } from '../../src/pedagogy/mirror.js';
import { levelPlan } from '../../worker/level.js';
import { EXPLAIN_MOVE, checkFact, factFor, type Fact } from '../../scripts/lib/strategy-facts.js';
import { checkClaim, describeStrategy, type Claim } from '../../scripts/lib/strategy-describe.js';
import { U16_TEXTS } from '../../src/content/units/u16.js';
import { describeLessons } from './lesson-checks.js';

/**
 * Estrategia (u16, conceptos `strategy.*`): pendiente de validación de profesores. Aquí, lo comprobable por código:
 * legalidad y los hechos que sustentan cada texto (columna sin peones, torre en la séptima, caballo en casilla de
 * avanzada). Que la solución es la mejor con +60 cp la comprueba Stockfish (`npx tsx scripts/verify-fase4.mts u16 --bank`),
 * que los tests de Vitest no ejecutan. La pedagogía de explicar un plan no la valida ningún motor.
 */
const u16 = UNITS.find((u) => u.id === 'u16')!;
const load = (fen: string) => Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
const who = (fen: string) => (load(fen).turn === 'white' ? 'blancas' : 'negras');
const stepsOf = (l: (typeof u16.lessons)[number]) => [
  ...l.practice.map((step, i) => ({ key: `${l.id}:practice:${i}`, step })),
  ...l.evaluation.map((step, i) => ({ key: `${l.id}:evaluation:${i}`, step })),
];

describe('contenido F: estrategia verificable (pendiente de validación de profesores)', () => {
  it('unidad con metadatos correctos y orden único', () => {
    expect([u16.level, u16.order, u16.requires, u16.lessons.length]).toEqual(['competitive', 16, ['u12'], 3]);
    expect(new Set(UNITS.map((u) => u.order)).size).toBe(UNITS.length);
    expect(u16.lessons.map((l) => l.conceptIds)).toEqual([['strategy.open_file'], ['strategy.seventh_rank'], ['strategy.outpost']]);
    expect(levelPlan('competitive', { units: UNITS })).toMatchObject({ comingSoon: false });
  });

  it('sin emojis', () => expect(JSON.stringify(u16)).not.toMatch(/\p{Extended_Pictographic}/u));

  describeLessons([u16], { engine: new Set(u16.lessons.flatMap((l) => stepsOf(l).map((s) => s.key))) });

  for (const l of u16.lessons) {
    describe(`${l.id} (hechos)`, () => {
      l.explanation.forEach((e, i) => {
        it(`explicación ${i + 1}: la jugada ilustrada cumple el hecho del concepto`, () => {
          const uci = EXPLAIN_MOVE[`${l.id}:${i}`]!;
          expect(checkFact(e.fen, uci, factFor(l.conceptIds![0]!, uci))).toBe(true);
          expect(e.text.startsWith(`Juegan ${who(e.fen)}`)).toBe(true);
        });
      });
      for (const { key, step } of stepsOf(l)) {
        it(`${key}: el texto afirma solo hechos verdaderos y hay una sola jugada`, () => {
          const uci = step.solutionUci[0]!;
          expect(step.solutionUci.length).toBe(1);
          expect(step.alt ?? []).toEqual([]);
          expect(checkFact(step.fen, uci, factFor(l.conceptIds![0]!, uci))).toBe(true);
          expect(step.prompt.startsWith(`Juegan ${who(step.fen)}`)).toBe(true);
          if (l.conceptIds![0] === 'strategy.open_file') expect(step.prompt).toContain(`columna ${uci[2]}`);
          if (l.conceptIds![0] === 'strategy.outpost') expect(step.prompt).toContain(`casilla ${uci.slice(2, 4)}`);
        });
      }
    });
  }

  describe('textos: cada afirmación sobre la posición se comprueba con chessops', () => {
    const SQUARE = /(?<![A-Za-z0-9])[a-h][1-8](?![a-z0-9])/g;
    const rank = (txt: string) => txt.replace(/\s+/g, ' ');
    for (const [key, { uci, texts }] of Object.entries(U16_TEXTS)) {
      const fen = key.includes(':explanation:')
        ? u16.lessons.find((l) => key.startsWith(l.id))!.explanation[Number(key.split(':')[2])]!.fen
        : stepsOf(u16.lessons.find((l) => key.startsWith(l.id))!).find((s) => s.key === key)!.step.fen;
      it(`${key}: afirmaciones verdaderas y toda casilla citada respaldada`, () => {
        const facts = describeStrategy(fen, uci);
        const allowed = new Set([uci.slice(0, 2), uci.slice(2, 4)]);
        for (const { s, claims } of texts) {
          expect(s.length, rank(s)).toBeGreaterThan(0);
          for (const cl of claims as Claim[]) {
            expect(checkClaim(fen, uci, cl, facts), `${key}: ${JSON.stringify(cl)}`).toBe(true);
            if (cl.sq) allowed.add(cl.sq);
            if (cl.by) allowed.add(cl.by);
          }
          for (const [sq] of s.matchAll(SQUARE)) expect(allowed.has(sq), `${key}: casilla ${sq} sin afirmación en «${rank(s)}»`).toBe(true);
        }
      });
    }
    it('toda posición de la unidad tiene sus textos registrados', () => {
      const n = u16.lessons.reduce((acc, l) => acc + l.explanation.length + l.practice.length + l.evaluation.length, 0);
      expect(Object.keys(U16_TEXTS).length).toBe(n);
    });
    it('los textos del alumno no citan al motor ni cifras en peones (solo la nota de la introducción)', () => {
      const bad = /stockfish|centipe|\d,\d peones|\bmotor\b/i;
      for (const l of u16.lessons) {
        expect(l.intro).toContain('comprobadas con un motor de ajedrez');
        expect(l.intro.replace('comprobadas con un motor de ajedrez', '')).not.toMatch(bad);
        for (const e of l.explanation) expect(e.text).not.toMatch(bad);
        for (const { step } of stepsOf(l)) for (const x of [step.prompt, step.hint ?? '', step.explanationCorrect, step.explanationWrong]) expect(x).not.toMatch(bad);
      }
      expect(u16.description).not.toMatch(bad);
    });
    it('los textos de un mismo ejercicio no se repiten entre ejercicios de la lección', () => {
      for (const l of u16.lessons) {
        const good = stepsOf(l).map((s) => s.step.explanationCorrect);
        expect(new Set(good).size).toBe(good.length);
        const hints = stepsOf(l).map((s) => s.step.hint);
        expect(new Set(hints).size).toBe(hints.length);
      }
    });
  });

  describe('banco de estrategia y sus espejos', () => {
    const bank = EXERCISES.filter((e) => e.conceptId.startsWith('strategy.'));
    it('4 ejercicios por concepto', () => {
      for (const c of ['strategy.open_file', 'strategy.seventh_rank', 'strategy.outpost']) expect(bank.filter((e) => e.conceptId === c).length).toBe(4);
    });
    const HINT_CLAIMS: Record<string, Claim[]> = {
      'ex.openfile.01': [{ k: 'blocked', sq: 'd2' }],
      'ex.openfile.02': [{ k: 'blocked', sq: 'h3' }],
      'ex.openfile.03': [{ k: 'blocked', sq: 'd3' }],
      'ex.openfile.04': [{ k: 'blocked', sq: 'c2' }],
      'ex.seventh.01': [{ k: 'loose', sq: 'f7' }],
      'ex.seventh.02': [{ k: 'loose', sq: 'g7' }],
      'ex.seventh.03': [{ k: 'rookHitsLoose', sq: 'd7' }, { k: 'rookHitsLoose', sq: 'g7' }],
      'ex.seventh.04': [{ k: 'rookHitsLoose', sq: 'g7' }],
      'ex.outpost.01': [{ k: 'protector', sq: 'd4' }, { k: 'protector', sq: 'f4' }],
      'ex.outpost.02': [{ k: 'protector', sq: 'f4' }, { k: 'knightHit', sq: 'd7' }, { k: 'knightHit', sq: 'g6' }],
      'ex.outpost.03': [{ k: 'protector', sq: 'd4' }],
      'ex.outpost.04': [{ k: 'protector', sq: 'f4' }],
    };
    for (const e of bank) {
      it(`${e.id}: el aviso es propio del ejercicio y sus afirmaciones son verdaderas`, () => {
        const uci = e.solutionUci[0]!;
        const claims = HINT_CLAIMS[e.id]!;
        const facts = describeStrategy(e.fen, uci);
        for (const cl of claims) expect(checkClaim(e.fen, uci, cl, facts), JSON.stringify(cl)).toBe(true);
        const ok = new Set([uci.slice(0, 2), ...claims.map((x) => x.sq), ...(e.prompt.match(/[a-h][1-8]/g) ?? [])]);
        for (const sq of e.hint!.match(/(?<![A-Za-z0-9])[a-h][1-8](?![a-z0-9])/g) ?? []) expect(ok.has(sq), `${e.id}: ${sq} en «${e.hint}»`).toBe(true);
      });
    }
    it('los avisos del banco de estrategia son todos distintos', () => expect(new Set(bank.map((e) => e.hint)).size).toBe(bank.length));
    for (const e of bank.flatMap((x) => [x, mirrorExercise(x)])) {
      it(`${e.id}: legal y hecho del concepto`, () => {
        const uci = e.solutionUci[0]!;
        expect(load(e.fen).isLegal(parseUci(uci)!)).toBe(true);
        expect(e.alt ?? []).toEqual([]);
        expect(checkFact(e.fen, uci, factFor(e.conceptId, uci))).toBe(true);
        if (e.conceptId === 'strategy.open_file') expect(e.prompt).toContain(`columna ${uci[2]}`);
      });
    }
  });

  it('el comprobador de afirmaciones distingue casos falsos', () => {
    const fen = 'r5k1/1p3ppp/8/8/8/8/2P2PPP/4R1K1 w - - 0 1';
    expect(checkClaim(fen, 'e1e7', { k: 'loose', sq: 'b7' })).toBe(true);
    expect(checkClaim(fen, 'e1e7', { k: 'loose', sq: 'f7' })).toBe(false); // el rey de g8 y la torre de a8 no… f7 la defiende el rey
    expect(checkClaim(fen, 'e1e7', { k: 'defendedBy', sq: 'f7', by: 'g8' })).toBe(true);
    expect(checkClaim(fen, 'e1e7', { k: 'blocked', sq: 'e2' })).toBe(false);
    expect(checkClaim(fen, 'e1e7', { k: 'openFile', sq: 'c' })).toBe(false); // el peón de c2
  });

  it('el comprobador de hechos distingue casos falsos', () => {
    const f = (fen: string, uci: string, fact: Fact) => checkFact(fen, uci, fact);
    // la columna c tiene el peón de c2
    expect(f('3r2k1/5ppp/8/8/8/8/2P2PPP/4R1K1 w - - 0 1', 'e1c1', { kind: 'openFile', file: 'c' })).toBe(false);
    // séptima fila sin peones ni rey rival en la octava
    expect(f('8/8/6k1/8/8/8/8/4R1K1 w - - 0 1', 'e1e7', { kind: 'seventh', square: 'e7' })).toBe(false);
    // el peón negro de c6 ataca d5
    expect(f('6k1/8/2p5/8/1NP5/8/8/6K1 w - - 0 1', 'b4d5', { kind: 'outpost', square: 'd5' })).toBe(false);
  });
});
