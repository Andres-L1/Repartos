import { describe, it, expect } from 'vitest';
import { analyzeWith } from '../../src/analysis/core.js';
import { parseGame } from '../../src/analysis/pgn.js';
import type { EngineLike } from '../../src/analysis/engine-like.js';
import type { EngineResult } from '../../src/analysis/engine-like.js';

/** Motor falso: devuelve resultados guionizados por FEN y registra las llamadas. */
class FakeEngine implements EngineLike {
  calls: string[] = [];
  constructor(
    private script: Record<string, EngineResult>,
    private onCall?: (n: number) => void,
  ) {}
  async init(): Promise<void> {}
  async analyze(fen: string): Promise<EngineResult> {
    this.calls.push(fen);
    this.onCall?.(this.calls.length);
    const r = this.script[fen];
    if (!r) throw new Error(`FEN sin guion: ${fen}`);
    return r;
  }
  async close(): Promise<void> {}
}

describe('analyzeWith', () => {
  it('calcula cpLoss y clasificación a partir de los resultados del motor', async () => {
    const pgn = '1. e4 e5 *';
    const g = parseGame(pgn);
    const [f0, f1, f2] = [g.moves[0]!.fenBefore, g.moves[0]!.fenAfter, g.moves[1]!.fenAfter];
    const engine = new FakeEngine({
      [f0]: { score: { cp: 30 }, bestUci: 'd2d4', pv: ['d2d4'] },
      [f1]: { score: { cp: -40 }, bestUci: 'e7e5', pv: ['e7e5'] },
      [f2]: { score: { cp: 300 }, bestUci: 'g1f3', pv: ['g1f3'] },
    });
    const res = await analyzeWith(engine, pgn);
    expect(res).toHaveLength(2);
    // Blancas: 30 -> -40 = pérdida de 70 (imprecisión).
    expect(res[0]).toMatchObject({ san: 'e4', cpLoss: 70, classification: 'inaccuracy', bestUci: 'd2d4' });
    // Negras juegan la mejor jugada: pérdida 0 aunque la evaluación cambie.
    expect(res[1]).toMatchObject({ san: 'e5', cpLoss: 0, classification: 'best' });
  });

  it('no llama al motor para la posición terminal', async () => {
    const pgn = '1. f3 e5 2. g4 Qh4# 0-1';
    const g = parseGame(pgn);
    const script: Record<string, EngineResult> = {};
    for (const m of g.moves.slice(0, 4)) {
      script[m.fenBefore] = { score: { cp: 0 }, bestUci: m.uci, pv: [m.uci] };
    }
    const engine = new FakeEngine(script);
    const progress: [number, number][] = [];
    const res = await analyzeWith(engine, pgn, { onProgress: (d, t) => progress.push([d, t]) });
    expect(res).toHaveLength(4);
    expect(engine.calls).toHaveLength(4);
    expect(engine.calls).not.toContain(g.moves[3]!.fenAfter);
    expect(res[3]!.scoreAfter).toEqual({ cp: -10000 });
  });

  it('onProgress informa total = jugadas + 1', async () => {
    const pgn = '1. e4 e5 *';
    const g = parseGame(pgn);
    const fens = [g.moves[0]!.fenBefore, g.moves[0]!.fenAfter, g.moves[1]!.fenAfter];
    const script: Record<string, EngineResult> = {};
    for (const f of fens) script[f] = { score: { cp: 0 }, bestUci: '', pv: [] };
    const progress: [number, number][] = [];
    await analyzeWith(new FakeEngine(script), pgn, { onProgress: (d, t) => progress.push([d, t]) });
    expect(progress).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
  });

  it('con signal abortada a mitad lanza AbortError y no hace más llamadas', async () => {
    const pgn = '1. e4 e5 2. Nf3 *';
    const g = parseGame(pgn);
    const fens = [g.moves[0]!.fenBefore, ...g.moves.map((m) => m.fenAfter)];
    const script: Record<string, EngineResult> = {};
    for (const f of fens) script[f] = { score: { cp: 0 }, bestUci: '', pv: [] };
    const ac = new AbortController();
    const engine = new FakeEngine(script, (n) => {
      if (n === 2) ac.abort();
    });
    const err = await analyzeWith(engine, pgn, { signal: ac.signal }).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).name).toBe('AbortError');
    expect(engine.calls).toHaveLength(2);
  });
});
