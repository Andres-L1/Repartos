// Compartir peticiones simultáneas y reutilizar respuestas públicas de corta duración.
const responses = new Map();
const pending = new Map();
export async function requestJSON(url, { ttl = 60000 } = {}) {
  const cached = responses.get(url);
  if (cached && cached.expires > Date.now()) return cached.data;
  if (pending.has(url)) return pending.get(url);
  const task = fetch(url, { signal: AbortSignal.timeout(20000) })
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      responses.delete(url);
      responses.set(url, { data, expires: Date.now() + ttl });
      while (responses.size > 64) responses.delete(responses.keys().next().value);
      return data;
    })
    .finally(() => pending.delete(url));
  pending.set(url, task);
  return task;
}
