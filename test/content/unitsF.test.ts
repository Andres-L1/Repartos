import { describe, expect, it } from 'vitest';
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { UNITS } from '../../src/content/index.js';
import { EXERCISES } from '../../src/pedagogy/exercises.js';
import { mirrorExercise } from '../../src/pedagogy/mirror.js';
import { levelPlan } from '../../worker/level.js';
import { EXPLAIN_MOVE, checkFact, factFor, type Fact } from '../../scripts/lib/strategy-facts.js';
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

  describe('banco de estrategia y sus espejos', () => {
    const bank = EXERCISES.filter((e) => e.conceptId.startsWith('strategy.'));
    it('4 ejercicios por concepto', () => {
      for (const c of ['strategy.open_file', 'strategy.seventh_rank', 'strategy.outpost']) expect(bank.filter((e) => e.conceptId === c).length).toBe(4);
    });
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
