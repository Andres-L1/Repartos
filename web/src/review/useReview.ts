import { useCallback, useEffect, useRef, useState } from 'react';
import { REVIEW_DEPTH } from '../../../src/review/config';
import type { GameAnalysis, ReviewGame } from '../../../src/review/types';
import { fetchRecentGames } from '../../../src/lichess/fetch';
import { pickGames } from '../../../src/lichess/games';
import { BrowserEngine } from '../engine/browser-engine';
import { useSession } from '../session';
import { indexedDbStore } from './cache';
import { createReviewRunner, type ReviewRunner } from './runner';

/** Estado de la lista: sin buscar, buscando, lista cargada o fallo de Lichess. */
export type ReviewStatus = 'idle' | 'loading-games' | 'loaded' | 'error';
export type GameStatus = 'pending' | 'analyzing' | 'ready' | 'error';

export interface UseReview {
  status: ReviewStatus;
  games: ReviewGame[];
  /** Estado de cada partida, alineado con `games`. */
  statuses: GameStatus[];
  /** Análisis de cada partida, alineado con `games` (`undefined` = sin analizar). */
  analyses: (GameAnalysis | undefined)[];
  analyzedCount: number;
  /** Avance de la partida que se está analizando. */
  progress?: { gameIndex: number; done: number; total: number };
  /** Fallo al buscar las partidas (Lichess). */
  error?: Error;
  /** Fallo del motor en la partida `gameIndex`. */
  gameError?: { gameIndex: number; error: Error };
  load(): void;
  analyze(index: number): void;
  /** Cancela el análisis en curso (la partida vuelve a «sin analizar»). */
  cancel(): void;
}

const store = indexedDbStore();

export function useReview(): UseReview {
  const { user } = useSession();
  const username = user?.username ?? '';
  const [status, setStatus] = useState<ReviewStatus>('idle');
  const [games, setGames] = useState<ReviewGame[]>([]);
  const [analyses, setAnalyses] = useState<(GameAnalysis | undefined)[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [progress, setProgress] = useState<UseReview['progress']>();
  const [error, setError] = useState<Error>();
  const [gameError, setGameError] = useState<UseReview['gameError']>();
  const runner = useRef<ReviewRunner | null>(null);
  const loading = useRef<AbortController | null>(null);
  const running = useRef(false);

  const getRunner = useCallback(() => {
    // El motor lo crea el runner en el primer «Analizar», no al cargar la lista.
    runner.current ??= createReviewRunner({
      createEngine: () => new BrowserEngine(),
      store,
      depth: REVIEW_DEPTH,
      fetchGames: async (signal) => pickGames(await fetchRecentGames(username, { signal }), username, 10),
    });
    return runner.current;
  }, [username]);

  useEffect(
    () => () => {
      loading.current?.abort();
      runner.current?.cancel();
    },
    [],
  );

  const load = useCallback(() => {
    if (!username || loading.current) return;
    const ac = new AbortController();
    loading.current = ac;
    setStatus('loading-games');
    setError(undefined);
    getRunner()
      .loadGames(ac.signal)
      .then(({ games: g, analyses: a }) => {
        if (ac.signal.aborted) return;
        setGames(g);
        setAnalyses(a);
        setStatus('loaded');
      })
      .catch((e: unknown) => {
        if (ac.signal.aborted) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setStatus('error');
      })
      .finally(() => {
        if (loading.current === ac) loading.current = null;
      });
  }, [username, getRunner]);

  const analyze = useCallback(
    (index: number) => {
      const game = games[index];
      if (!game || running.current || analyses[index]) return;
      running.current = true;
      setBusy(index);
      setProgress(undefined);
      setGameError(undefined);
      getRunner()
        .analyzeOne(game, (e) => setProgress({ gameIndex: index, done: e.done, total: e.total }))
        .then((a) => {
          if (a) setAnalyses((prev) => prev.map((x, i) => (i === index ? a : x)));
        })
        .catch((e: unknown) => setGameError({ gameIndex: index, error: e instanceof Error ? e : new Error(String(e)) }))
        .finally(() => {
          running.current = false;
          setBusy(null);
          setProgress(undefined);
        });
    },
    [games, analyses, getRunner],
  );

  const cancel = useCallback(() => runner.current?.cancel(), []);

  const statuses: GameStatus[] = games.map((_, i) =>
    analyses[i] ? 'ready' : busy === i ? 'analyzing' : gameError?.gameIndex === i ? 'error' : 'pending',
  );
  return {
    status,
    games,
    statuses,
    analyses,
    analyzedCount: analyses.filter(Boolean).length,
    progress,
    error,
    gameError,
    load,
    analyze,
    cancel,
  };
}
