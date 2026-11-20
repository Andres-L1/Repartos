import { describe, expect, it, vi } from 'vitest';
import type { AnalyzedMove, Diagnosis } from '../../src/types.js';

// El diagnóstico real depende de posiciones; aquí se controla por ply: 'cause', 'tactic' o ninguno (solo motor).
const kind = new Map<number, 'cause' | 'tactic'>();
const dx = (m: AnalyzedMove, type: Diagnosis['type'], conceptIds: string[]): Diagnosis => ({
  type, ply: m.ply, color: m.color, fact: 'f', evidence: { squares: [], pieces: [] }, conceptIds,
});
vi.mock('../../src/diagnosis/index.js', () => ({
  diagnose: (m: AnalyzedMove): Diagnosis | null => (kind.get(m.ply) === 'cause' || !kind.size ? dx(m, 'fork', ['fork']) : null),
  diagnoseMissedTactic: (m: AnalyzedMove): Diagnosis | null => (kind.get(m.ply) === 'tactic' ? dx(m, 'missed_tactic', []) : null),
}));

import { countInaccuracies, errorTier, keyErrors, positionConcept, seriousMoves } from '../../src/review/select.js';
import { game, mv } from './helpers.js';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
/** Jugada con posición real (la mejor jugada, e2e4, es legal) para que el motor pueda enseñarse sin causa. */
const real = (ply: number, cls: 'mistake' | 'blunder' | 'inaccuracy', cp: number) => ({ ...mv(ply, 'white', cls, cp), fenBefore: START, uci: 'a2a3', bestUci: 'e2e4' });

describe('keyErrors', () => {
  it('ignora jugadas del rival', () => {
    expect(keyErrors(game('g', [mv(2, 'black', 'blunder', 500)]))).toEqual([]);
  });
  it('sin causa ni táctica, un error grave con mejor jugada legal se enseña como solo motor; las imprecisiones no', () => {
    kind.clear();
    kind.set(9, 'cause'); // hace que diagnose devuelva null para el resto
    const r = keyErrors(game('g', [real(1, 'blunder', 500), real(3, 'inaccuracy', 80), mv(5, 'white', 'mistake', 200)]));
    expect(r.map((k) => [k.move.ply, errorTier(k)])).toEqual([[1, 'engine']]);
    kind.clear();
  });
  it('un error sin causa y sin mejor jugada legal que enseñar se descarta (nunca se inventa)', () => {
    kind.clear();
    kind.set(9, 'cause');
    expect(keyErrors(game('g', [mv(1, 'white', 'blunder', 500)]))).toEqual([]);
    kind.clear();
  });
  it('prioridad: causa, luego táctica perdida, luego solo motor; tope 3 y orden de jugada', () => {
    kind.clear();
    kind.set(1, 'tactic');
    kind.set(3, 'cause');
    kind.set(5, 'tactic');
    kind.set(7, 'cause');
    // ply 9 y 11: solo motor, con la mayor pérdida de todas
    const moves = [real(1, 'blunder', 400), real(3, 'mistake', 120), real(5, 'mistake', 300), real(7, 'mistake', 150), real(9, 'blunder', 900), real(11, 'blunder', 800)];
    const r = keyErrors(game('g', moves));
    expect(r.map((k) => [k.move.ply, errorTier(k)])).toEqual([[1, 'tactic'], [3, 'cause'], [7, 'cause']]);
    kind.clear();
  });
  it('con 5 candidatos con causa devuelve los 3 de mayor pérdida en orden de ply', () => {
    kind.clear();
    const moves = [mv(1, 'white', 'mistake', 100), mv(3, 'white', 'blunder', 600), mv(5, 'white', 'mistake', 300), mv(7, 'white', 'mistake', 150), mv(9, 'white', 'blunder', 450)];
    expect(keyErrors(game('g', moves)).map((k) => k.move.ply)).toEqual([3, 5, 9]);
  });
  it('respeta max y devuelve [] sin errores', () => {
    kind.clear();
    expect(keyErrors(game('g', [mv(1, 'white', 'blunder', 500), mv(3, 'white', 'blunder', 400)]), 1)).toHaveLength(1);
    expect(keyErrors(game('g', [mv(1, 'white', 'good')]))).toEqual([]);
  });
});

describe('conteos y posición guardada', () => {
  it('cuenta graves e imprecisiones solo del alumno', () => {
    const g = game('g', [real(1, 'blunder', 500), real(3, 'inaccuracy', 80), real(5, 'inaccuracy', 70), mv(2, 'black', 'blunder', 500), mv(4, 'black', 'inaccuracy', 60)]);
    expect(seriousMoves(g)).toHaveLength(1);
    expect(countInaccuracies(g)).toBe(2);
  });
  it('positionConcept: con causa su concepto; táctica perdida o blunder sin causa, engine.analysis; mistake sin causa, nada', () => {
    const m = (cls: 'mistake' | 'blunder') => mv(1, 'white', cls, 300);
    expect(positionConcept({ gameId: 'g', move: m('mistake'), diagnosis: dx(m('mistake'), 'fork', ['tactics.fork']) })).toBe('tactics.fork');
    expect(positionConcept({ gameId: 'g', move: m('mistake'), diagnosis: dx(m('mistake'), 'missed_tactic', []) })).toBe('engine.analysis');
    expect(positionConcept({ gameId: 'g', move: m('blunder'), diagnosis: null })).toBe('engine.analysis');
    expect(positionConcept({ gameId: 'g', move: m('mistake'), diagnosis: null })).toBeUndefined();
  });
});
