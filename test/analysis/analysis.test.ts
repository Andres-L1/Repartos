import { describe, it, expect } from 'vitest';
import { parseGame } from '../../src/analysis/pgn.js';
import { Engine } from '../../src/analysis/engine.js';
import { analyzeGame, classify } from '../../src/analysis/analyze.js';

describe('parseGame', () => {
  it('parsea un PGN válido con cabeceras y FEN', () => {
    const g = parseGame('[White "A"]\n[Black "B"]\n\n1. e4 e5 2. Nf3 *');
    expect(g.headers.White).toBe('A');
    expect(g.moves.map((m) => m.san)).toEqual(['e4', 'e5', 'Nf3']);
    expect(g.moves[0]).toMatchObject({ uci: 'e2e4', ply: 1, color: 'white' });
    expect(g.moves[1]).toMatchObject({ uci: 'e7e5', ply: 2, color: 'black' });
    expect(g.moves[0]!.fenBefore).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(g.moves[0]!.fenAfter).toBe(g.moves[1]!.fenBefore);
  });

  it('falla con un PGN ilegal', () => {
    expect(() => parseGame('1. e4 e5 2. Ke3 *')).toThrow(/ilegal/);
    expect(() => parseGame('1. e5 *')).toThrow(/ilegal/);
  });
});

describe('Engine', () => {
  it('encuentra el mate en 1 y evalúa desde blancas', async () => {
    const engine = new Engine();
    await engine.init();
    try {
      const w = await engine.analyze('6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', { depth: 6 });
      expect(w.bestUci).toBe('a1a8');
      expect(w.score).toEqual({ mate: 1 });
      // Mismo patrón con negras: mate a favor de negras => mate negativo.
      const b = await engine.analyze('r5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1', { depth: 6 });
      expect(b.bestUci).toBe('a8a1');
      expect(b.score).toEqual({ mate: -1 });
    } finally {
      await engine.close();
    }
  }, 60000);
});

describe('classify', () => {
  it('respeta los umbrales', () => {
    expect(classify(20)).toBe('best');
    expect(classify(21)).toBe('good');
    expect(classify(50)).toBe('good');
    expect(classify(100)).toBe('inaccuracy');
    expect(classify(250)).toBe('mistake');
    expect(classify(251)).toBe('blunder');
  });
});

describe('analyzeGame', () => {
  it('detecta la blunder de negras en un mate del pastor', async () => {
    // 3...Nf6?? permite Qxf7# (ya era mate en 1 tras 3...Nc6, que no defiende f7).
    const pgn = '1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0';
    const progress: number[] = [];
    const res = await analyzeGame(pgn, { depth: 8, onProgress: (d) => progress.push(d) });
    expect(res).toHaveLength(7);
    expect(progress.length).toBe(8);
    const nf6 = res[5]!;
    expect(nf6.san).toBe('Nf6');
    expect(nf6.color).toBe('black');
    // 3...Nf6 no defiende f7: la mejor era g6 (o Qe7) y se pierde el juego.
    expect(nf6.cpLoss).toBeGreaterThan(250);
    expect(nf6.classification).toBe('blunder');
    expect(nf6.pvAfter[0]).toBe('h5f7');
    const mate = res[6]!;
    expect(mate.san).toBe('Qxf7#');
    expect(mate.cpLoss).toBe(0);
    expect(mate.classification).toBe('best');
    // scoreBefore de la siguiente jugada == scoreAfter de la anterior (reutilización).
    expect(res[1]!.scoreBefore).toEqual(res[0]!.scoreAfter);
    for (const m of res) {
      expect(m.cpLoss).toBeGreaterThanOrEqual(0);
      expect(m.cpLoss).toBeLessThanOrEqual(1000);
      expect(m.bestSan.length).toBeGreaterThan(0);
    }
  }, 120000);

  it('rechaza un PGN ilegal antes de lanzar el motor', async () => {
    await expect(analyzeGame('1. e4 e5 2. Qh8 *')).rejects.toThrow(/ilegal/);
  });
});
