// Caché acotada por instancia: TTL, LRU y una única carga por recurso concurrente.
export function createMemo({ maxEntries = 64, now = Date.now } = {}) {
  const entries = new Map();
  const pending = new Map();
  return {
    async get(key, ttl, load) {
      const entry = entries.get(key);
      if (entry && entry.expires > now()) {
        entries.delete(key);
        entries.set(key, entry);
        return entry.value;
      }
      if (pending.has(key)) return pending.get(key);
      const task = Promise.resolve()
        .then(load)
        .then((value) => {
          entries.delete(key);
          entries.set(key, { value, expires: now() + ttl * 1000 });
          while (entries.size > maxEntries) entries.delete(entries.keys().next().value);
          return value;
        })
        .finally(() => pending.delete(key));
      pending.set(key, task);
      return task;
    },
  };
}
