import { useCallback, useEffect, useRef, useState } from 'react';
import { REVIEW_DEPTH } from '../../../src/review/config';
import type { GameAnalysis, ReviewGame } from '../../../src/review/types';
import { fetchRecentGames } from '../../../src/lichess/fetch';
import { pickGames } from '../../../src/lichess/games';
import { BrowserEngine } from '../engine/browser-engine';
import { useSession } from '../session';
import { indexedDbStore } from './cache';
import { createReviewRunner, type ReviewRunner } from './runner';

export type ReviewStatus = 'idle' | 'loading-games' | 'analyzing' | 'done' | 'error';

export interface UseReview {
  status: ReviewStatus;
  games: ReviewGame[];
  ready: GameAnalysis[];
  progress?: { gameIndex: number; done: number; total: number };
  error?: Error;
  start(): void;
  cancel(): void;
}

const store = indexedDbStore();

export function useReview(): UseReview {
  const { user } = useSession();
  const username = user?.username ?? '';
  const [status, setStatus] = useState<ReviewStatus>('idle');
  const [games, setGames] = useState<ReviewGame[]>([]);
  const [ready, setReady] = useState<GameAnalysis[]>([]);
  const [progress, setProgress] = useState<UseReview['progress']>();
  const [error, setError] = useState<Error>();
  const runner = useRef<ReviewRunner | null>(null);

  useEffect(() => () => runner.current?.cancel(), []);

  const start = useCallback(() => {
    if (!username || runner.current) return;
    // Motor nuevo en cada intento: así «Reintentar» recupera un motor caído.
    const r = createReviewRunner({
      engine: new BrowserEngine(),
      store,
      depth: REVIEW_DEPTH,
      fetchGames: async (signal) => pickGames(await fetchRecentGames(username, { signal }), username, 10),
    });
    runner.current = r;
    setStatus('loading-games');
    setGames([]);
    setReady([]);
    setProgress(undefined);
    setError(undefined);
    void r
      .start((e) => {
        if (runner.current !== r) return;
        if (e.type === 'games') {
          setGames(e.games);
          setStatus('analyzing');
        } else if (e.type === 'progress') setProgress({ gameIndex: e.gameIndex, done: e.done, total: e.total });
        else if (e.type === 'game-ready') setReady((prev) => [...prev, e.analysis]);
        else if (e.type === 'error') {
          setError(e.error);
          setStatus('error');
        } else setStatus('done');
      })
      .finally(() => {
        if (runner.current === r) runner.current = null;
      });
  }, [username]);

  const cancel = useCallback(() => {
    const r = runner.current;
    if (!r) return;
    runner.current = null;
    r.cancel();
    setStatus('idle');
    setGames([]);
    setReady([]);
    setProgress(undefined);
  }, []);

  return { status, games, ready, progress, error, start, cancel };
}
