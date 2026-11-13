import { describe, it, expect } from 'vitest';
import type { EngineLike, EngineResult } from '../../src/analysis/engine-like.js';
import { analysisKey } from '../../src/review/config.js';
import type { ReviewGame } from '../../src/review/types.js';
import { memoryStore } from '../../web/src/review/cache.js';
import { BusyError, createReviewRunner, EngineError, NotEnoughGamesError } from '../../web/src/review/runner.js';

class FakeEngine implements EngineLike {
  calls = 0;
  inits = 0;
  closed = 0;
  failAt = Infinity;
  async init() {
    this.inits++;
  }
  async analyze(): Promise<EngineResult> {
    if (++this.calls > this.failAt) throw new Error('boom');
    return { score: { cp: 0 }, bestUci: 'e2e4', pv: [] };
  }
  async close() {
    this.closed++;
  }
}

const mk = (id: string): ReviewGame => ({
  id,
  color: 'white',
  result: 'win',
  speed: 'blitz',
  createdAt: 1,
  pgn: '[Result "*"]\n\n1. e4 e5 2. Nf3 Nc6 *\n',
});
const games = (n: number) => Array.from({ length: n }, (_, i) => mk(`g${i}`));

function setup(n = 3, engine = new FakeEngine(), store = memoryStore()) {
  const runner = createReviewRunner({ createEngine: () => engine, store, depth: 12, fetchGames: async () => games(n) });
  return { engine, store, runner };
}

describe('review runner (análisis a demanda)', () => {
  it('loadGames solo descarga: cero llamadas al motor y no lo crea', async () => {
    let created = 0;
    const engine = new FakeEngine();
    const runner = createReviewRunner({
      createEngine: () => (created++, engine),
      store: memoryStore(),
      depth: 12,
      fetchGames: async () => games(3),
    });
    const { games: g, analyses } = await runner.loadGames();
    expect(g).toHaveLength(3);
    expect(analyses).toEqual([undefined, undefined, undefined]);
    expect(created).toBe(0);
    expect(engine.calls + engine.inits).toBe(0);
  });

  it('analyzeOne analiza solo esa partida, la guarda y cierra el motor', async () => {
    const t = setup(3);
    const { games: g } = await t.runner.loadGames();
    const progress: number[] = [];
    const a = await t.runner.analyzeOne(g[1]!, (e) => progress.push(e.done));
    expect(a?.gameId).toBe('g1');
    expect(progress.length).toBeGreaterThan(0);
    expect(await t.store.get(analysisKey('g1'))).toBeDefined();
    expect(await t.store.get(analysisKey('g0'))).toBeUndefined();
    expect(await t.store.get(analysisKey('g2'))).toBeUndefined();
    expect(t.engine.inits).toBe(1);
    expect(t.engine.closed).toBe(1);
  });

  it('una partida ya guardada se devuelve en loadGames y analyzeOne no usa el motor', async () => {
    const store = memoryStore();
    const first = setup(3, new FakeEngine(), store);
    const g = (await first.runner.loadGames()).games;
    await first.runner.analyzeOne(g[0]!);
    const t = setup(3, new FakeEngine(), store);
    const loaded = await t.runner.loadGames();
    expect(loaded.analyses.map(Boolean)).toEqual([true, false, false]);
    expect((await t.runner.analyzeOne(g[0]!))?.gameId).toBe('g0');
    expect(t.engine.calls + t.engine.inits).toBe(0);
  });

  it('cancel devuelve null, no guarda y cierra el motor', async () => {
    const t = setup(3);
    const g = (await t.runner.loadGames()).games;
    const a = await t.runner.analyzeOne(g[0]!, () => t.runner.cancel());
    expect(a).toBeNull();
    expect(await t.store.get(analysisKey('g0'))).toBeUndefined();
    expect(t.engine.closed).toBe(1);
  });

  it('un error del motor lanza EngineError y no guarda esa partida', async () => {
    const engine = new FakeEngine();
    engine.failAt = 2;
    const t = setup(3, engine);
    const g = (await t.runner.loadGames()).games;
    await expect(t.runner.analyzeOne(g[0]!)).rejects.toBeInstanceOf(EngineError);
    expect(await t.store.get(analysisKey('g0'))).toBeUndefined();
    expect(engine.closed).toBe(1);
  });

  it('menos de 3 partidas válidas lanza un error identificable', async () => {
    const t = setup(2);
    const e = await t.runner.loadGames().catch((x: unknown) => x);
    expect(e).toBeInstanceOf(NotEnoughGamesError);
    expect((e as NotEnoughGamesError).available).toBe(2);
  });

  it('una segunda analyzeOne mientras corre otra se rechaza con BusyError', async () => {
    const t = setup(3);
    const g = (await t.runner.loadGames()).games;
    const first = t.runner.analyzeOne(g[0]!);
    await expect(t.runner.analyzeOne(g[1]!)).rejects.toBeInstanceOf(BusyError);
    expect((await first)?.gameId).toBe('g0');
    expect((await t.runner.analyzeOne(g[1]!))?.gameId).toBe('g1');
  });
});
