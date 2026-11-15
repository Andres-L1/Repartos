import { api, ApiError } from '../api';
import type { CompleteReviewBody, CompleteReviewResponse } from '../../../src/shared/api';
import type { ReviewPosition } from '../../../src/review/srs';

interface Pending {
  /** Cuenta que repasó la partida: un aviso nunca se envía con la sesión de otra persona del mismo navegador. */
  userId: string;
  gameId: string;
  concepts: string[];
  positions?: ReviewPosition[];
}

const KEY = 'chedex-review-pending';
const RETRY_MS = 30_000;
const MAX_PENDING = 50;

/** Error que no se arregla reintentando (cuerpo rechazado): se descarta en vez de reenviarlo para siempre. */
const isPermanent = (e: unknown) => e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 401 && e.status !== 429;

export interface ReporterDeps {
  send: (b: CompleteReviewBody) => Promise<CompleteReviewResponse>;
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null;
  setTimer: (f: () => void, ms: number) => number;
}

/** Avisos de partidas repasadas con reintento; sobreviven a recargas (localStorage) y se separan por cuenta. */
export function createReviewReporter(deps: ReporterDeps) {
  let user: string | null = null;
  let timer: number | undefined;

  const load = (): Pending[] => {
    try {
      const raw = deps.storage?.getItem(KEY);
      const v = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(v) ? (v as Pending[]).filter((p) => typeof p?.userId === 'string' && typeof p.gameId === 'string') : [];
    } catch {
      return [];
    }
  };
  let pending = load();

  const save = () => {
    try {
      if (pending.length) deps.storage?.setItem(KEY, JSON.stringify(pending));
      else deps.storage?.removeItem(KEY);
    } catch {
      /* sin almacenamiento: la lista sigue en memoria */
    }
  };

  async function flush(): Promise<void> {
    const me = user;
    const mine = pending.filter((p) => p.userId === me);
    if (!me || !mine.length) return;
    pending = pending.filter((p) => p.userId !== me);
    const failed: Pending[] = [];
    for (const p of mine) {
      try {
        await deps.send({ gameId: p.gameId, concepts: p.concepts, ...(p.positions ? { positions: p.positions } : {}) });
      } catch (e) {
        if (!isPermanent(e)) failed.push(p);
      }
    }
    pending = [...failed, ...pending].slice(-MAX_PENDING);
    save();
  }

  const retryLater = () => {
    if (timer !== undefined || !pending.some((p) => p.userId === user)) return;
    timer = deps.setTimer(() => {
      timer = undefined;
      void flush();
    }, RETRY_MS);
  };

  return {
    /** Cuenta con la sesión abierta (null al salir). Al fijarla se reintenta lo que quedó pendiente de ella. */
    setUser(id: string | null): void {
      user = id;
      if (id) void flush().then(retryLater);
    },
    /** Avisa al servidor de que se repasó una partida. Nunca lanza ni bloquea: si falla, se reintenta una vez más tarde. */
    report(gameId: string, concepts: string[], positions?: ReviewPosition[]): void {
      if (!user) return;
      pending = [...pending.filter((p) => !(p.userId === user && p.gameId === gameId)), { userId: user, gameId, concepts, positions }].slice(-MAX_PENDING);
      save();
      void flush().then(retryLater);
    },
    pendingCount: (): number => pending.length,
  };
}

function browserStorage(): ReporterDeps['storage'] {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const reporter = createReviewReporter({
  send: (b) => api.completeReview(b),
  storage: browserStorage(),
  setTimer: (f, ms) => window.setTimeout(f, ms),
});

export const setReviewUser = reporter.setUser;
export const reportReviewed = reporter.report;
