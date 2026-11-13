import type { GameAnalysis } from '../../../src/review/types';

/** Almacén de análisis por clave (la clave incluye profundidad y motor). */
export interface AnalysisStore {
  get(key: string): Promise<GameAnalysis | undefined>;
  put(key: string, v: GameAnalysis): Promise<void>;
}

export function memoryStore(): AnalysisStore {
  const m = new Map<string, GameAnalysis>();
  return {
    get: async (k) => m.get(k),
    put: async (k, v) => {
      m.set(k, v);
    },
  };
}

const DB_NAME = 'chedex-review';
const STORE = 'analyses';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB no disponible'));
    req.onblocked = () => reject(new Error('IndexedDB bloqueado'));
  });
}

function run<T>(db: IDBDatabase, mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = f(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** IndexedDB persistente; si no existe o falla en cualquier momento, degrada a memoria. */
export function indexedDbStore(): AnalysisStore {
  const fallback = memoryStore();
  let dbp: Promise<IDBDatabase | null> | null = null;
  const db = () => {
    if (!dbp) {
      try {
        dbp = typeof indexedDB === 'undefined' ? Promise.resolve(null) : openDb().catch(() => null);
      } catch {
        dbp = Promise.resolve(null);
      }
    }
    return dbp;
  };
  return {
    async get(key) {
      const d = await db();
      if (d) {
        try {
          const v = await run<GameAnalysis | undefined>(d, 'readonly', (s) => s.get(key));
          if (v) return v;
        } catch {
          // cae a memoria
        }
      }
      return fallback.get(key);
    },
    async put(key, v) {
      await fallback.put(key, v);
      const d = await db();
      if (!d) return;
      try {
        await run(d, 'readwrite', (s) => s.put(v, key));
      } catch {
        // solo memoria
      }
    },
  };
}
