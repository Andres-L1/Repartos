import { describe, it, expect } from 'vitest';
import type { EngineLike, EngineResult } from '../../src/analysis/engine-like.js';
import { analysisKey } from '../../src/review/config.js';
import type { ReviewGame } from '../../src/review/types.js';
import { memoryStore } from '../../web/src/review/cache.js';
import { createReviewRunner, NotEnoughGamesError, type ReviewEvent } from '../../web/src/review/runner.js';

class FakeEngine implements EngineLike {
  calls = 0;
  closed = 0;
  failAt = Infinity;
  async init() {}
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
  const runner = createReviewRunner({ engine, store, depth: 12, fetchGames: async () => games(n) });
  const events: ReviewEvent[] = [];
  return { engine, store, runner, events, run: () => runner.start((e) => events.push(e)) };
}

describe('review runner', () => {
  it('analiza en orden y emite game-ready partida a partida, y done al final', async () => {
    const t = setup(3);
    await t.run();
    const ready = t.events.filter((e) => e.type === 'game-ready');
    expect(ready.map((e) => (e as { gameIndex: number }).gameIndex)).toEqual([0, 1, 2]);
    expect(t.events[0]!.type).toBe('games');
    expect(t.events.at(-1)!.type).toBe('done');
    expect(t.engine.closed).toBe(1);
  });

  it('con la caché llena no llama al motor', async () => {
    const store = memoryStore();
    await setup(3, new FakeEngine(), store).run();
    const t = setup(3, new FakeEngine(), store);
    await t.run();
    expect(t.engine.calls).toBe(0);
    expect(t.events.filter((e) => e.type === 'game-ready')).toHaveLength(3);
    expect(t.events.at(-1)!.type).toBe('done');
  });

  it('cancel detiene el análisis sin emitir done', async () => {
    const t = setup(3);
    const p = t.runner.start((e) => {
      t.events.push(e);
      if (e.type === 'game-ready') t.runner.cancel();
    });
    await p;
    expect(t.events.filter((e) => e.type === 'game-ready')).toHaveLength(1);
    expect(t.events.some((e) => e.type === 'done' || e.type === 'error')).toBe(false);
    expect(t.engine.closed).toBe(1);
  });

  it('un error del motor emite error y conserva lo ya guardado', async () => {
    const engine = new FakeEngine();
    engine.failAt = 7; // la partida 0 usa 5 posiciones; falla dentro de la 1
    const t = setup(3, engine);
    await t.run();
    const err = t.events.at(-1)!;
    expect(err.type).toBe('error');
    expect((err as { error: Error }).error.name).toBe('EngineError');
    expect(await t.store.get(analysisKey('g0'))).toBeDefined();
    expect(await t.store.get(analysisKey('g1'))).toBeUndefined();
  });

  it('menos de 3 partidas válidas emite un error identificable', async () => {
    const t = setup(2);
    await t.run();
    expect(t.events).toHaveLength(1);
    const e = t.events[0] as { type: 'error'; error: Error };
    expect(e.error).toBeInstanceOf(NotEnoughGamesError);
    expect((e.error as NotEnoughGamesError).available).toBe(2);
  });

  it('dos start simultáneos no solapan el análisis', async () => {
    const t = setup(3);
    const a = t.run();
    const b = t.run();
    await Promise.all([a, b]);
    expect(t.events.filter((e) => e.type === 'game-ready')).toHaveLength(3);
    expect(t.engine.calls).toBeGreaterThan(0);
  });
});
