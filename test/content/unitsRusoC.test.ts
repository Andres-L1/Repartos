import { describe, expect, it } from 'vitest';
import { attacks } from 'chessops/attacks';
import { parseSquare } from 'chessops/util';
import type { Lesson, PracticeStep, Unit } from '../../src/content/schema.js';
import { unit as u30 } from '../../src/content/units/u30.js';
import { unit as u31 } from '../../src/content/units/u31.js';
import { unit as u32 } from '../../src/content/units/u32.js';
import { unit as u33 } from '../../src/content/units/u33.js';
import { leaksIn, targetsOf } from '../../scripts/lib/hint-leaks.js';
import { accepted, attackedBy, attacksFrom, canCastle, centerControlled, load, moves, P, rooksConnected, squareRule, undeveloped, type Pred } from '../../scripts/lib/ruso-c.js';
import { promotionFens, squareExplainExpect, squareExplains, tbSteps, TB_CACHE_PATH } from '../../scripts/lib/ruso-c-tb.js';
import { cacheProbe, checkLine, loadCache, moverResult, tbKey } from '../../scripts/lib/tablebase.js';
import { describeLessons } from './lesson-checks.js';

/**
 * Método ruso, parte C: u30 (caballo), u31 (peón), u32 (cuatro ideas básicas) y u33 (al paso, coronación y regla del
 * cuadrado). Todo el contenido está «pendiente de validación de profesores». El código comprueba HECHOS (legalidad,
 * casillas atacadas, estado de la posición, regla del cuadrado con la tablebase de Lichess); la pedagogía de los
 * principios de u32 la valida un profesor. Las unidades se importan por su archivo: aún no están en el registro.
 */
const UNITS_RUSO_C: Unit[] = [u30, u31, u32, u33];

const steps = (l: Lesson): { key: string; step: PracticeStep }[] => [
  ...l.practice.map((step, i) => ({ key: `${l.id}:practice:${i}`, step })),
  ...l.evaluation.map((step, i) => ({ key: `${l.id}:evaluation:${i}`, step })),
];
const ALL_KEYS = UNITS_RUSO_C.flatMap((u) => u.lessons.flatMap((l) => steps(l).map((s) => s.key)));

/** Criterio de cada ejercicio: las jugadas aceptadas son EXACTAMENTE las legales que lo cumplen (u33.l03 y u33.l02:practice:2 van con la tablebase). */
const N = (to: string | string[]): Pred => P.piece('N', { to });
const PAWN = (to: string): Pred => P.piece('P', { to });
const EP = (to: string): Pred => P.piece('P', { to, capture: true });
const CRITERIA: Record<string, Pred> = {
  'u30.l01:practice:0': N('c3'),
  'u30.l01:practice:1': N('e6'),
  'u30.l01:practice:2': N('c2'),
  'u30.l01:evaluation:0': N('g5'),
  'u30.l01:evaluation:1': N('d3'),
  'u30.l01:evaluation:2': N('h3'),
  'u30.l02:practice:0': N('h3'),
  'u30.l02:practice:1': P.piece('N', { capture: true }),
  'u30.l02:practice:2': P.piece('N', { to: 'e6', capture: true }),
  'u30.l02:evaluation:0': N('c6'),
  'u30.l02:evaluation:1': P.piece('N', { capture: true }),
  'u30.l02:evaluation:2': P.piece('N', { to: 'b5', capture: true }),
  'u30.l03:practice:0': N(['d4', 'd5', 'e4', 'e5']),
  'u30.l03:practice:1': P.maxAttacks('N'),
  'u30.l03:practice:2': P.safe('N', 'd4'),
  'u30.l03:evaluation:0': N(['d4', 'd5', 'e4', 'e5']),
  'u30.l03:evaluation:1': P.maxAttacks('N'),
  'u30.l03:evaluation:2': P.and([P.piece('P'), P.protects('d4')]),
  'u31.l01:practice:0': PAWN('c4'),
  'u31.l01:practice:1': PAWN('d4'),
  'u31.l01:practice:2': P.piece('P', { to: ['b4', 'g4'] }),
  'u31.l01:evaluation:0': PAWN('d5'),
  'u31.l01:evaluation:1': PAWN('e4'),
  'u31.l01:evaluation:2': PAWN('a4'),
  'u31.l02:practice:0': P.piece('P', { capture: true }),
  'u31.l02:practice:1': P.piece('P', { capture: true }),
  'u31.l02:practice:2': P.piece('P', { capture: true }),
  'u31.l02:evaluation:0': P.piece('P', { capture: true }),
  'u31.l02:evaluation:1': P.piece('P', { capture: true }),
  'u31.l02:evaluation:2': EP('b3'),
  'u31.l03:practice:0': P.piece('P'),
  'u31.l03:practice:1': P.piece('P', { capture: true }),
  'u31.l03:practice:2': P.piece('P'),
  'u31.l03:evaluation:0': P.piece('P'),
  'u31.l03:evaluation:1': P.piece('P', { capture: true }),
  'u31.l03:evaluation:2': P.piece('P'),
  'u32.l01:practice:0': P.pawnToCenter(),
  'u32.l01:practice:1': P.attacksCenter('N'),
  'u32.l01:practice:2': P.pawnToCenter(),
  'u32.l01:evaluation:0': P.pawnToCenter(),
  'u32.l01:evaluation:1': P.attacksCenter('N'),
  'u32.l01:evaluation:2': P.pawnToCenter(),
  'u32.l02:practice:0': P.develop(),
  'u32.l02:practice:1': P.develop(['bishop']),
  'u32.l02:practice:2': P.develop(['knight']),
  'u32.l02:evaluation:0': P.develop(),
  'u32.l02:evaluation:1': P.develop(['bishop']),
  'u32.l02:evaluation:2': P.develop(['knight']),
  'u32.l03:practice:0': P.castle(),
  'u32.l03:practice:1': P.castle('long'),
  'u32.l03:practice:2': P.and([P.piece('B', { from: 'f1' }), P.enablesCastle('short')]),
  'u32.l03:evaluation:0': P.castle(),
  'u32.l03:evaluation:1': P.castle('long'),
  'u32.l03:evaluation:2': P.enablesCastle('short'),
  'u32.l04:practice:0': P.connectsRooks(),
  'u32.l04:practice:1': P.connectsRooks(),
  'u32.l04:practice:2': P.and([P.castle(), P.connectsRooks()]),
  'u32.l04:evaluation:0': P.connectsRooks(),
  'u32.l04:evaluation:1': P.connectsRooks(),
  'u32.l04:evaluation:2': P.and([P.castle(), P.connectsRooks()]),
  'u33.l01:practice:0': EP('h6'),
  'u33.l01:practice:1': EP('e3'),
  'u33.l01:practice:2': EP('d6'),
  'u33.l01:evaluation:0': EP('b6'),
  'u33.l01:evaluation:1': EP('g3'),
  'u33.l01:evaluation:2': EP('h6'),
  'u33.l02:practice:0': P.promotion({ role: 'queen' }),
  'u33.l02:practice:1': P.promotion({ role: 'queen', capture: true }),
  'u33.l02:evaluation:0': P.promotion({ role: 'queen' }),
  'u33.l02:evaluation:1': P.promotion({ role: 'queen', capture: true }),
  'u33.l02:evaluation:2': P.promotion({ role: 'queen', check: true }),
};
const WITH_TABLEBASE = new Set([...ALL_KEYS.filter((k) => k.startsWith('u33.l03:')), 'u33.l02:practice:2']);

describe('método ruso, parte C: u30 a u33 (pendiente de validación de profesores)', () => {
  it('unidades con metadatos correctos, encadenadas (u29 -> u30 -> u31 -> u32 -> u33)', () => {
    expect(UNITS_RUSO_C.map((u) => [u.id, u.order, u.level, u.requires, u.lessons.length])).toEqual([
      ['u30', 11, 'beginner', ['u29'], 3],
      ['u31', 12, 'beginner', ['u30'], 3],
      ['u32', 13, 'initiation', ['u31'], 4],
      ['u33', 14, 'initiation', ['u32'], 3],
    ]);
    for (const u of UNITS_RUSO_C) {
      expect(u.description.length).toBeGreaterThan(20);
      for (const l of u.lessons) {
        expect(l.explanation.length, l.id).toBe(l.id === 'u33.l03' ? 3 : l.id === 'u30.l03' ? 3 : 2);
        expect(l.practice.length, l.id).toBe(3);
        expect(l.evaluation.length, l.id).toBe(3);
      }
    }
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(UNITS_RUSO_C)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('frases de 30 palabras o menos', () => {
    const texts: string[] = [];
    for (const u of UNITS_RUSO_C) {
      texts.push(u.description);
      for (const l of u.lessons) {
        texts.push(l.objective, l.intro, ...l.explanation.map((e) => e.text));
        for (const { step } of steps(l)) texts.push(step.prompt, step.explanationCorrect, step.explanationWrong, ...(step.hint ? [step.hint] : []), ...Object.values(step.wrongByMove ?? {}));
      }
    }
    for (const t of texts) for (const s of t.split(/[.!?]+\s*/)) expect(s.trim().split(/\s+/).filter(Boolean).length, s).toBeLessThanOrEqual(30);
  });

  // Forma, legalidad y textos. La corrección de cada solución la fijan los criterios de abajo (y la tablebase), no la búsqueda de material.
  describeLessons(UNITS_RUSO_C, { engine: new Set(ALL_KEYS) });

  describe('cada ejercicio: las jugadas aceptadas son exactamente las legales que cumplen el enunciado', () => {
    for (const key of ALL_KEYS.filter((k) => !WITH_TABLEBASE.has(k))) {
      it(key, () => {
        const crit = CRITERIA[key];
        expect(crit, `falta el criterio de ${key}`).toBeDefined();
        const step = UNITS_RUSO_C.flatMap((u) => u.lessons.flatMap(steps)).find((s) => s.key === key)!.step;
        expect(step.solutionUci.length, key).toBe(1);
        expect([step.solutionUci[0]!, ...(step.alt ?? [])].sort(), key).toEqual(accepted(step.fen, crit!));
      });
    }
  });

  describe('avisos de primer fallo: ninguno regala la solución (política de docs/estado-proyecto.md)', () => {
    for (const u of UNITS_RUSO_C)
      for (const l of u.lessons)
        for (const { key, step } of steps(l))
          it(key, () => {
            const targets = targetsOf(step.fen, step.solutionUci, step.alt, step.branches);
            expect(targets.length).toBeGreaterThan(0);
            const texts: [string, string | undefined][] = [['hint', step.hint], ['explanationWrong', step.explanationWrong], ...Object.entries(step.wrongByMove ?? {})];
            for (const [kind, text] of texts) if (text) expect(leaksIn(text, targets, step.prompt), `${kind}: «${text}»`).toEqual([]);
          });
  });

  describe('flechas de las explicaciones: cada flecha es un ataque o una jugada legal', () => {
    for (const u of UNITS_RUSO_C)
      for (const l of u.lessons)
        l.explanation.forEach((e, i) =>
          it(`${l.id} explicación ${i + 1}`, () => {
            const pos = load(e.fen);
            for (const [a, b] of e.arrows ?? []) {
              const from = parseSquare(a)!;
              const piece = pos.board.get(from);
              expect(piece, `${a} sin pieza`).toBeDefined();
              const ok = attacks(piece!, from, pos.board.occupied).has(parseSquare(b)!) || moves(e.fen).some((m) => m.from === a && m.to === b);
              expect(ok, `${a}->${b}`).toBe(true);
            }
          }),
        );
  });

  describe('afirmaciones de los textos comprobadas por código', () => {
    const fenOf = (l: Lesson, i: number) => l.explanation[i]!.fen;
    const sqs = (...s: string[]) => s.sort();
    it('u30: el caballo controla 8 casillas en el centro, 4 en el borde y 2 en la esquina', () => {
      expect(attacksFrom(fenOf(u30.lessons[0]!, 0), 'd4')).toHaveLength(8);
      expect(attacksFrom(fenOf(u30.lessons[0]!, 1), 'h1').sort()).toEqual(sqs('f2', 'g3'));
      expect(attacksFrom(fenOf(u30.lessons[2]!, 0), 'e4')).toHaveLength(8);
      expect(attacksFrom(fenOf(u30.lessons[2]!, 1), 'a4').sort()).toEqual(sqs('b2', 'b6', 'c3', 'c5'));
    });
    it('u30: salta sobre peones, captura y no cae sobre piezas propias; caballo protegido', () => {
      const salto = moves(fenOf(u30.lessons[1]!, 0)).filter((m) => m.role === 'knight').map((m) => m.uci);
      expect(salto.sort()).toEqual(['b1a3', 'b1c3']);
      const cap = moves(fenOf(u30.lessons[1]!, 1)).filter((m) => m.role === 'knight');
      expect(cap.some((m) => m.uci === 'd4c6')).toBe(false);
      expect(cap.find((m) => m.uci === 'd4f5')?.capture).toBe(true);
      const pos = load(fenOf(u30.lessons[2]!, 2));
      expect(attackedBy(pos, 'black').has('d4') && attackedBy(pos, 'white').has('d4')).toBe(true);
    });
    it('u31: pasos, doble paso, captura en diagonal y peones bloqueados', () => {
      const pawn = (fen: string) => moves(fen).filter((m) => m.role === 'pawn').map((m) => m.uci).sort();
      expect(pawn(fenOf(u31.lessons[0]!, 0))).toEqual(['e4e5']);
      expect(pawn(fenOf(u31.lessons[0]!, 1))).toEqual(['e2e3', 'e2e4']);
      expect(moves(fenOf(u31.lessons[1]!, 0)).filter((m) => m.role === 'pawn' && m.capture).map((m) => m.uci).sort()).toEqual(['e4d5', 'e4f5']);
      expect(pawn(fenOf(u31.lessons[1]!, 1))).toEqual([]);
      expect(pawn(fenOf(u31.lessons[2]!, 0))).toEqual([]);
      expect(pawn(fenOf(u31.lessons[2]!, 1))).toEqual(['c3c4']);
    });
    it('u32: control del centro, desarrollo, rey en el centro, enroque y torres conectadas', () => {
      const l1 = load(fenOf(u32.lessons[0]!, 1));
      expect(attackedBy(l1, 'white').has('d5') && attackedBy(l1, 'white').has('f5')).toBe(true); // peón e4
      expect(centerControlled(l1, 'white').sort()).toEqual(['d4', 'd5', 'e5']);
      expect(undeveloped(load(fenOf(u32.lessons[1]!, 0)), 'white').sort()).toEqual(['c1', 'f1']);
      expect(undeveloped(load(fenOf(u32.lessons[1]!, 1)), 'white').sort()).toEqual(['b1', 'c1', 'f1']);
      expect(load(fenOf(u32.lessons[2]!, 0)).isCheck()).toBe(true);
      const fenCastle = fenOf(u32.lessons[2]!, 1);
      expect(canCastle(load(fenCastle), 'short')).toBe(true);
      const after = moves(fenCastle).find((m) => m.uci === 'e1g1')!.after;
      expect([after.board.get(parseSquare('g1')!)?.role, after.board.get(parseSquare('f1')!)?.role]).toEqual(['king', 'rook']);
      expect(rooksConnected(load(fenOf(u32.lessons[3]!, 0)), 'white')).toBe(true);
      const start = load(fenOf(u32.lessons[3]!, 1));
      expect(rooksConnected(start, 'white')).toBe(false);
      expect(['b1', 'c1', 'd1', 'e1', 'f1', 'g1'].filter((s) => start.board.has(parseSquare(s)!))).toHaveLength(6);
    });
    it('u33: al paso solo en la jugada inmediata, coronación y ahogado', () => {
      const ep = moves(fenOf(u33.lessons[0]!, 0)).find((m) => m.uci === 'e5d6')!;
      expect(ep.capture).toBe(true);
      expect(ep.after.board.has(parseSquare('d5')!)).toBe(false);
      expect(moves(fenOf(u33.lessons[0]!, 1)).some((m) => m.uci === 'e5d6')).toBe(false);
      expect(moves(fenOf(u33.lessons[1]!, 0)).filter((m) => m.promotion).map((m) => m.promotion).sort()).toEqual(['bishop', 'knight', 'queen', 'rook']);
      const q = moves(fenOf(u33.lessons[1]!, 1)).filter((m) => m.promotion);
      expect(q.find((m) => m.promotion === 'queen')!.after.isStalemate()).toBe(true);
      expect(q.find((m) => m.promotion === 'rook')!.after.isStalemate()).toBe(false);
      const l1 = u33.lessons[0]!;
      for (const step of [...l1.practice, ...l1.evaluation.slice(0, 2)]) {
        const m = moves(step.fen).find((x) => x.uci === step.solutionUci[0])!;
        // Al paso de verdad: la casilla de llegada está vacía y la captura es legal gracias a la casilla al paso del FEN.
        expect(load(step.fen).board.has(parseSquare(m.to)!), step.fen).toBe(false);
        expect(m.capture, step.fen).toBe(true);
      }
      // Última evaluación: sin casilla al paso en el FEN, el peón de g5 no puede capturar en f6.
      expect(moves(u33.lessons[0]!.evaluation[2]!.fen).some((m) => m.uci === 'g5f6')).toBe(false);
    });
  });

  describe('u33.l02 ejercicio del ahogado: tablebase y chessops', () => {
    const cache = loadCache(TB_CACHE_PATH);
    const probe = cacheProbe(cache);
    it('con dama es ahogado; la única coronación que ni ahoga ni tira la victoria es la torre', () => {
      const step = u33.lessons[1]!.practice[2]!;
      const ok = moves(step.fen)
        .filter((m) => m.promotion && !m.after.isStalemate() && probe(promotionFens().find((p) => tbKey(p.fen) === tbKey(fenAfter(m)))!.fen).category === 'loss')
        .map((m) => m.uci);
      expect(ok).toEqual(step.solutionUci);
      expect(moves(step.fen).find((m) => m.promotion === 'queen')!.after.isStalemate()).toBe(true);
    });
  });

  describe('u33.l03 regla del cuadrado: tablebase de Lichess (caché) y comprobación geométrica con chessops', () => {
    const cache = loadCache(TB_CACHE_PATH);
    const probe = cacheProbe(cache);
    for (const s of tbSteps()) {
      it(s.key, () => {
        // Criterio `category`: las jugadas aceptadas son exactamente las que conservan el resultado.
        expect(checkLine(probe, s.fen, s.line, s.alt, 'category')).toEqual([]);
        const r = squareRule(s.fen);
        expect(r.borderline, 'caso límite: el rey capturaría la dama recién coronada').toBe(false);
        const strong = r.toMove === r.pawnColor ? 'win' : 'loss';
        expect(probe(s.fen).category).toBe(r.catches ? 'draw' : strong);
        // El rey del bando del peón está lejos: la regla del cuadrado decide sola.
        const pos = load(s.fen);
        const pk = pos.board.kingOf(r.pawnColor)!;
        const ps = parseSquare(r.pawn)!;
        expect(Math.max(Math.abs((pk & 7) - (ps & 7)), Math.abs((pk >> 3) - (ps >> 3)))).toBeGreaterThanOrEqual(3);
        // Si juega el rey defensor, la jugada de la solución lo deja dentro del cuadrado (regla geométrica).
        if (r.toMove !== r.pawnColor) {
          const m = moves(s.fen).find((x) => x.uci === s.line[0])!;
          expect(squareRule(fenAfter(m)).catches, `${s.line[0]} deja al rey fuera del cuadrado`).toBe(true);
        }
      });
    }
    for (const e of squareExplains()) {
      it(e.key, () => {
        expect(squareRule(e.fen).borderline).toBe(false);
        expect(probe(e.fen).category).toBe(squareExplainExpect(e.fen));
      });
    }
    it('la caché trae el resultado correcto en los dos turnos del mismo peón (sanity de moverResult)', () => {
      const e = probe(tbSteps()[0]!.fen);
      expect(e.moves.filter((m) => moverResult(m) === e.category).length).toBeGreaterThan(0);
    });
  });
});

import { makeFen } from 'chessops/fen';
import type { Mv } from '../../scripts/lib/ruso-c.js';
const fenAfter = (m: Mv): string => makeFen(m.after.toSetup());
