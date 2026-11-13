import { describe, expect, it } from 'vitest';
import { makeUci, parseUci } from 'chessops/util';
import { unit as u04 } from '../../src/content/units/u04.js';
import { unit as u05 } from '../../src/content/units/u05.js';
import { unit as u06 } from '../../src/content/units/u06.js';
import { CONCEPTS } from '../../src/pedagogy/concepts.js';
import type { Lesson, PracticeStep, Unit } from '../../src/content/schema.js';
import { legalMoves, load, playLine, playMove, rankMoves } from '../pedagogy/helpers.js';

const UNITS_B: Unit[] = [u04, u05, u06];
const CONCEPT_IDS = new Set(CONCEPTS.map((c) => c.id));
/** Lecciones de principios: la solución es una buena jugada de principios (no siempre única por material). */
const PRINCIPLE_LESSONS = new Set(['u06.l01', 'u06.l02', 'u06.l03']);
/** Ejercicios de defensa: la solución evita un mate y no pierde material (puede haber otras defensas válidas). */
const DEFEND = new Set(['u04.l03:practice:2']);

function mate1(fen: string): string[] {
  const pos = load(fen);
  return legalMoves(pos)
    .filter((m) => playMove(pos, m).isCheckmate())
    .map(makeUci);
}

/** Primeras jugadas tras las cuales TODA respuesta del rival permite mate en 1. */
function forcedMateIn2(fen: string): string[] {
  const pos = load(fen);
  const out: string[] = [];
  for (const m of legalMoves(pos)) {
    const n = playMove(pos, m);
    if (n.isCheckmate()) continue;
    const replies = legalMoves(n);
    if (replies.length === 0) continue;
    if (replies.every((r) => legalMoves(playMove(n, r)).some((x) => playMove(playMove(n, r), x).isCheckmate()))) {
      out.push(makeUci(m));
    }
  }
  return out;
}

/** Normaliza el enroque (e1g1) a la forma «rey captura torre» que usa el helper. */
function rankUci(fen: string, uci: string): string {
  const pos = load(fen);
  const m = parseUci(uci)!;
  const piece = pos.board.get((m as { from: number }).from);
  if (piece?.role === 'king' && Math.abs(((m as { to: number }).to & 7) - ((m as { from: number }).from & 7)) === 2) {
    const from = (m as { from: number }).from;
    const kingside = ((m as { to: number }).to & 7) > (from & 7);
    const rookSq = (from & ~7) + (kingside ? 7 : 0);
    return makeUci({ from, to: rookSq });
  }
  return uci;
}

const steps = (l: Lesson): { key: string; step: PracticeStep }[] => [
  ...l.practice.map((step, i) => ({ key: `${l.id}:practice:${i}`, step })),
  ...l.evaluation.map((step, i) => ({ key: `${l.id}:evaluation:${i}`, step })),
];

describe('contenido B: unidades 4-6', () => {
  it('unidades con metadatos correctos y 3-4 lecciones', () => {
    expect(u04.id).toBe('u04');
    expect(u05.id).toBe('u05');
    expect(u06.id).toBe('u06');
    expect(u04.requires).toEqual(['u03']);
    expect(u05.requires).toEqual(['u04']);
    expect(u06.requires).toEqual(['u05']);
    for (const u of UNITS_B) {
      expect(u.level).toBe('initiation');
      expect(u.title.length).toBeGreaterThan(3);
      expect(u.description.length).toBeGreaterThan(20);
      expect(u.lessons.length).toBeGreaterThanOrEqual(3);
      expect(u.lessons.length).toBeLessThanOrEqual(4);
    }
  });

  it('ids únicos y con el formato uNN.lNN', () => {
    const ids = UNITS_B.flatMap((u) => u.lessons.map((l) => l.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const u of UNITS_B) {
      u.lessons.forEach((l, i) => {
        expect(l.id).toBe(`${u.id}.l${String(i + 1).padStart(2, '0')}`);
        expect(l.unitId).toBe(u.id);
      });
    }
  });

  it('u05 trabaja los conceptos tácticos pedidos', () => {
    const want = ['tactics.hanging_piece', 'tactics.bad_exchange', 'tactics.fork', 'tactics.pin', 'tactics.discovered_attack'];
    const got = new Set(u05.lessons.flatMap((l) => l.conceptIds ?? []));
    for (const c of want) expect(got.has(c), c).toBe(true);
  });

  it('no usa notación española de piezas (C, A, T, D, R) en SAN', () => {
    const text = JSON.stringify(UNITS_B);
    expect(text.match(/(?<![A-Za-z0-9])[CATD]x?[a-h][1-8]/g) ?? []).toEqual([]);
  });

  for (const u of UNITS_B) {
    for (const l of u.lessons) {
      describe(l.id, () => {
        it('esquema completo y textos no vacíos', () => {
          expect(l.title.length).toBeGreaterThan(3);
          expect(l.objective.length).toBeGreaterThan(15);
          expect(l.intro.length).toBeGreaterThan(40);
          expect(l.explanation.length).toBeGreaterThanOrEqual(2);
          expect(l.explanation.length).toBeLessThanOrEqual(4);
          expect(l.practice.length).toBeGreaterThanOrEqual(3);
          expect(l.practice.length).toBeLessThanOrEqual(5);
          expect(l.evaluation.length).toBe(3);
          for (const c of l.conceptIds ?? []) expect(CONCEPT_IDS.has(c), c).toBe(true);
          for (const e of l.explanation) {
            expect(e.text.trim().length).toBeGreaterThan(40);
            expect(() => load(e.fen), e.fen).not.toThrow();
            for (const s of e.squares ?? []) expect(s).toMatch(/^[a-h][1-8]$/);
            for (const [a, b] of e.arrows ?? []) {
              expect(a).toMatch(/^[a-h][1-8]$/);
              expect(b).toMatch(/^[a-h][1-8]$/);
            }
          }
          for (const { key, step } of steps(l)) {
            expect(step.prompt.trim().length, key).toBeGreaterThan(10);
            expect(step.explanationCorrect.trim().length, key).toBeGreaterThan(20);
            expect(step.explanationWrong.trim().length, key).toBeGreaterThan(20);
            expect(step.solutionUci.length, key).toBeGreaterThan(0);
            expect(step.solutionUci.length % 2, key).toBe(1);
          }
        });

        it('la evaluación usa posiciones distintas de la práctica', () => {
          const practiceFens = new Set(l.practice.map((p) => p.fen.split(' ').slice(0, 4).join(' ')));
          for (const e of l.evaluation) {
            expect(practiceFens.has(e.fen.split(' ').slice(0, 4).join(' ')), e.fen).toBe(false);
          }
          expect(new Set(l.evaluation.map((e) => e.fen)).size).toBe(l.evaluation.length);
        });

        for (const { key, step } of steps(l)) {
          describe(key, () => {
            it('FEN legal, solución legal y jugadas erróneas legales', () => {
              expect(() => load(step.fen)).not.toThrow();
              expect(() => playLine(step.fen, step.solutionUci)).not.toThrow();
              const pos = load(step.fen);
              const legal = new Set([
                ...legalMoves(pos).map(makeUci),
                ...legalMoves(pos).map((m) => {
                  const piece = pos.board.get((m as { from: number }).from);
                  const from = (m as { from: number }).from;
                  if (piece?.role === 'king' && pos.board.get(m.to)?.role === 'rook' && pos.board.get(m.to)?.color === piece.color) {
                    return makeUci({ from, to: (m.to & 7) > (from & 7) ? from + 2 : from - 2 });
                  }
                  return makeUci(m);
                }),
              ]);
              for (const [uci, text] of Object.entries(step.wrongByMove ?? {})) {
                expect(legal.has(uci), `${uci} no es legal`).toBe(true);
                expect(uci, key).not.toBe(step.solutionUci[0]);
                expect(text.trim().length, uci).toBeGreaterThan(15);
              }
            });

            it('la solución es correcta (mate, defensa o mejor jugada táctica)', () => {
              const end = playLine(step.fen, step.solutionUci);
              if (end.isCheckmate()) {
                if (step.solutionUci.length === 1) {
                  // Mate en 1: la solución da mate real y es el único mate.
                  expect(mate1(step.fen), key).toEqual([step.solutionUci[0]]);
                } else if (step.solutionUci.length === 3) {
                  // Mate en 2 forzado: toda respuesta rival permite mate, y la jugada es la única que lo logra.
                  expect(mate1(step.fen), key).toEqual([]);
                  expect(forcedMateIn2(step.fen), key).toEqual([step.solutionUci[0]]);
                } else {
                  // Combinación más larga (trampa de Légal): la línea termina en mate y ninguna jugada
                  // intermedia del rival es ilegal (playLine ya lo comprueba). El texto aclara que es una trampa.
                  expect(step.solutionUci.length).toBeGreaterThanOrEqual(5);
                }
                return;
              }
              const ranked = rankMoves(step.fen, 3);
              const sol = rankUci(step.fen, step.solutionUci[0]!);
              const entry = ranked.find((r) => r.uci === sol);
              expect(entry, `${key}: jugada no encontrada ${sol}`).toBeDefined();
              if (DEFEND.has(key)) {
                const pos = playLine(step.fen, [step.solutionUci[0]!]);
                expect(legalMoves(pos).some((m) => playMove(pos, m).isCheckmate()), key).toBe(false);
                expect(entry!.score, key).toBeGreaterThanOrEqual(ranked[0]!.score);
                return;
              }
              const strictOk = ranked[0]!.uci === sol && ranked[0]!.score - (ranked[1]?.score ?? -Infinity) >= 100;
              if (PRINCIPLE_LESSONS.has(l.id)) {
                // Principios: la jugada no debe perder material respecto a lo mejor (margen de un peón).
                expect(strictOk || entry!.score >= ranked[0]!.score - 100, key).toBe(true);
              } else {
                expect(strictOk, `${key}: top ${JSON.stringify(ranked.slice(0, 3))}`).toBe(true);
              }
            });
          });
        }
      });
    }
  }
});
