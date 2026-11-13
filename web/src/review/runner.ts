import { analyzeWith } from '../../../src/analysis/core';
import type { EngineLike } from '../../../src/analysis/engine-like';
import { analysisKey } from '../../../src/review/config';
import { MIN_GAMES } from '../../../src/review/report';
import type { GameAnalysis, ReviewGame } from '../../../src/review/types';
import type { LichessError } from '../../../src/lichess/fetch';
import type { AnalysisStore } from './cache';

export type ReviewEvent =
  | { type: 'games'; games: ReviewGame[] }
  | { type: 'progress'; gameIndex: number; done: number; total: number }
  | { type: 'game-ready'; gameIndex: number; analysis: GameAnalysis }
  | { type: 'error'; error: LichessError | Error }
  | { type: 'done' };

/** Menos de MIN_GAMES partidas válidas: `available` dice cuántas hay. */
export class NotEnoughGamesError extends Error {
  readonly code = 'not-enough-games' as const;
  constructor(readonly available: number) {
    super(`Se necesitan al menos ${MIN_GAMES} partidas y hay ${available}.`);
    this.name = 'NotEnoughGamesError';
  }
}

/** El motor de análisis no arrancó o falló a mitad. */
export class EngineError extends Error {
  readonly code = 'engine' as const;
  constructor(message: string) {
    super(message);
    this.name = 'EngineError';
  }
}

const isAbort = (e: unknown) => (e as { name?: string })?.name === 'AbortError';

export interface ReviewRunner {
  start(onEvent: (e: ReviewEvent) => void): Promise<void>;
  cancel(): void;
}

export function createReviewRunner(deps: {
  engine: EngineLike;
  store: AnalysisStore;
  fetchGames: (signal: AbortSignal) => Promise<ReviewGame[]>;
  depth: number;
}): ReviewRunner {
  let running: Promise<void> | null = null;
  let ac: AbortController | null = null;

  async function run(onEvent: (e: ReviewEvent) => void, signal: AbortSignal): Promise<void> {
    let engineStarted = false;
    try {
      const games = await deps.fetchGames(signal);
      if (signal.aborted) return;
      if (games.length < MIN_GAMES) {
        onEvent({ type: 'error', error: new NotEnoughGamesError(games.length) });
        return;
      }
      onEvent({ type: 'games', games });
      for (let i = 0; i < games.length; i++) {
        if (signal.aborted) return;
        const game = games[i]!;
        const key = analysisKey(game.id);
        let analysis = await deps.store.get(key).catch(() => undefined);
        if (!analysis) {
          try {
            if (!engineStarted) {
              engineStarted = true;
              await deps.engine.init();
            }
            const moves = await analyzeWith(deps.engine, game.pgn, {
              depth: deps.depth,
              signal,
              onProgress: (done, total) => {
                if (!signal.aborted) onEvent({ type: 'progress', gameIndex: i, done, total });
              },
            });
            analysis = { gameId: game.id, color: game.color, moves };
          } catch (e) {
            if (signal.aborted || isAbort(e)) return;
            throw new EngineError(e instanceof Error ? e.message : 'El motor de análisis falló.');
          }
          await deps.store.put(key, analysis).catch(() => undefined);
        }
        if (signal.aborted) return;
        onEvent({ type: 'game-ready', gameIndex: i, analysis });
      }
      onEvent({ type: 'done' });
    } catch (e) {
      if (signal.aborted || isAbort(e)) return;
      onEvent({ type: 'error', error: e instanceof Error ? e : new Error(String(e)) });
    } finally {
      if (engineStarted) await deps.engine.close().catch(() => undefined);
    }
  }

  return {
    start(onEvent) {
      // Una sola ejecución a la vez: una segunda llamada se une a la que ya está en marcha.
      if (running) return running;
      ac = new AbortController();
      running = run(onEvent, ac.signal).finally(() => {
        running = null;
        ac = null;
      });
      return running;
    },
    cancel() {
      ac?.abort();
    },
  };
}
