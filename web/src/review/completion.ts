import { api } from '../api';

interface Pending {
  gameId: string;
  concepts: string[];
}

const KEY = 'chedex-review-pending';
const RETRY_MS = 30_000;

function load(): Pending[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(v) ? (v as Pending[]) : [];
  } catch {
    return [];
  }
}

function save(list: Pending[]): void {
  try {
    if (list.length) window.localStorage.setItem(KEY, JSON.stringify(list));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* sin almacenamiento: la lista sigue en memoria */
  }
}

let pending: Pending[] = load();
let timer: number | undefined;

async function flush(): Promise<void> {
  const batch = pending;
  pending = [];
  const failed: Pending[] = [];
  for (const p of batch) {
    try {
      await api.completeReview(p);
    } catch {
      failed.push(p);
    }
  }
  // Solo un reintento silencioso por envío; lo que siga fallando queda para la próxima vez que se abra un repaso.
  pending = [...failed, ...pending];
  save(pending);
}

/** Avisa al servidor de que se repasó una partida. Nunca lanza ni bloquea: si falla, se reintenta una vez más tarde. */
export function reportReviewed(gameId: string, concepts: string[]): void {
  pending = [...pending.filter((p) => p.gameId !== gameId), { gameId, concepts }];
  save(pending);
  void flush().then(() => {
    if (pending.length === 0 || timer !== undefined) return;
    timer = window.setTimeout(() => {
      timer = undefined;
      void flush();
    }, RETRY_MS);
  });
}
