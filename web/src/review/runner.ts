import { analyzeWith } from '../../../src/analysis/core';
import type { EngineLike } from '../../../src/analysis/engine-like';
import { analysisKey } from '../../../src/review/config';
import { MIN_GAMES } from '../../../src/review/report';
import type { GameAnalysis, ReviewGame } from '../../../src/review/types';
import type { AnalysisStore } from './cache';

/** Eventos de `analyzeOne`. Los fallos se lanzan como excepción, no como evento. */
export type AnalyzeEvent = { type: 'progress'; done: number; total: number };

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

/** Ya hay otra partida analizándose: solo se analiza una a la vez. */
export class BusyError extends Error {
  readonly code = 'busy' as const;
  constructor() {
    super('Ya se está analizando otra partida.');
    this.name = 'BusyError';
  }
}

const isAbort = (e: unknown) => (e as { name?: string })?.name === 'AbortError';

export interface LoadedGames {
  games: ReviewGame[];
  /** Análisis ya guardados, alineados con `games` (`undefined` = sin analizar). */
  analyses: (GameAnalysis | undefined)[];
}

export interface ReviewRunner {
  /** Solo descarga las partidas y consulta la caché: no toca el motor. */
  loadGames(signal?: AbortSignal): Promise<LoadedGames>;
  /**
   * Analiza solo la partida dada (la caché es un atajo). Devuelve `null` si se canceló.
   * Lanza BusyError si ya hay otra en curso (se rechaza, no se encola) y EngineError si el motor falla.
   * El motor se crea en el primer análisis y se cierra al terminar, fallar o cancelar.
   */
  analyzeOne(game: ReviewGame, onEvent?: (e: AnalyzeEvent) => void): Promise<GameAnalysis | null>;
  cancel(): void;
}

export function createReviewRunner(deps: {
  createEngine: () => EngineLike;
  store: AnalysisStore;
  fetchGames: (signal: AbortSignal) => Promise<ReviewGame[]>;
  depth: number;
}): ReviewRunner {
  let ac: AbortController | null = null;

  return {
    async loadGames(signal) {
      const games = await deps.fetchGames(signal ?? new AbortController().signal);
      if (games.length < MIN_GAMES) throw new NotEnoughGamesError(games.length);
      const analyses = await Promise.all(games.map((g) => deps.store.get(analysisKey(g.id)).catch(() => undefined)));
      return { games, analyses };
    },

    async analyzeOne(game, onEvent) {
      if (ac) throw new BusyError();
      const mine = new AbortController();
      ac = mine;
      const signal = mine.signal;
      const key = analysisKey(game.id);
      let engine: EngineLike | null = null;
      try {
        const cached = await deps.store.get(key).catch(() => undefined);
        if (signal.aborted) return null;
        if (cached) return cached;
        engine = deps.createEngine();
        await engine.init();
        const moves = await analyzeWith(engine, game.pgn, {
          depth: deps.depth,
          signal,
          onProgress: (done, total) => {
            if (!signal.aborted) onEvent?.({ type: 'progress', done, total });
          },
        });
        if (signal.aborted) return null;
        const analysis: GameAnalysis = { gameId: game.id, color: game.color, moves };
        await deps.store.put(key, analysis).catch(() => undefined);
        return analysis;
      } catch (e) {
        if (signal.aborted || isAbort(e)) return null;
        throw new EngineError(e instanceof Error ? e.message : 'El motor de análisis falló.');
      } finally {
        if (engine) await engine.close().catch(() => undefined);
        if (ac === mine) ac = null;
      }
    },

    cancel() {
      ac?.abort();
    },
  };
}
