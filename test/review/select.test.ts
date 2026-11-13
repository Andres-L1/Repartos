import { describe, expect, it, vi } from 'vitest';
import type { AnalyzedMove, Diagnosis } from '../../src/types.js';

// El diagnóstico real depende de posiciones; aquí se controla por ply.
const noDiag = new Set<number>();
vi.mock('../../src/diagnosis/index.js', () => ({
  diagnose: (m: AnalyzedMove): Diagnosis | null =>
    noDiag.has(m.ply)
      ? null
      : { type: 'fork', ply: m.ply, color: m.color, fact: 'f', evidence: { squares: [], pieces: [] }, conceptIds: ['fork'] },
}));

import { keyErrors } from '../../src/review/select.js';
import { game, mv } from './helpers.js';

describe('keyErrors', () => {
  it('ignora jugadas del rival', () => {
    expect(keyErrors(game('g', [mv(2, 'black', 'blunder', 500)]))).toEqual([]);
  });
  it('ignora errores sin diagnóstico y jugadas que no son mistake/blunder', () => {
    noDiag.clear();
    noDiag.add(1);
    const r = keyErrors(game('g', [mv(1, 'white', 'blunder', 500), mv(3, 'white', 'inaccuracy', 80), mv(5, 'white', 'mistake', 200)]));
    expect(r.map((k) => k.move.ply)).toEqual([5]);
    noDiag.clear();
  });
  it('con 5 candidatos devuelve los 3 de mayor pérdida en orden de ply', () => {
    const moves = [mv(1, 'white', 'mistake', 100), mv(3, 'white', 'blunder', 600), mv(5, 'white', 'mistake', 300), mv(7, 'white', 'mistake', 150), mv(9, 'white', 'blunder', 450)];
    expect(keyErrors(game('g', moves)).map((k) => k.move.ply)).toEqual([3, 5, 9]);
  });
  it('respeta max y devuelve [] sin errores', () => {
    expect(keyErrors(game('g', [mv(1, 'white', 'blunder', 500), mv(3, 'white', 'blunder', 400)]), 1)).toHaveLength(1);
    expect(keyErrors(game('g', [mv(1, 'white', 'good')]))).toEqual([]);
  });
});
