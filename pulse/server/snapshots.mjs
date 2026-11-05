const SOURCE =
  'https://raw.githubusercontent.com/Andres-L1/Repartos/main/pulse/public/snapshots/latest.json';
function valid(data) {
  return (
    data.schema === 1 &&
    Number.isFinite(Date.parse(data.generatedAt)) &&
    Array.isArray(data.fide?.players) &&
    Array.isArray(data.interest?.players)
  );
}
export function summarize(data) {
  return {
    ...data,
    fide: {
      ...data.fide,
      players: data.fide.players.map(({ history, ...player }) => player),
      federations: (data.fide.federations || []).map(({ history, ...federation }) => ({
        ...federation,
        current: history?.find((row) => row.month === data.fide.month) || null,
      })),
    },
    interest: {
      ...data.interest,
      players: data.interest.players.map(({ history, ...player }) => player),
    },
  };
}
export function createSnapshotReader({ memo, fetcher }) {
  // Solo se retiene la última copia de cada origen; evita repetir cuerpos sin cambios.
  const previous = new Map();
  return (request, env) => {
    const origin = new URL(request.url).origin;
    return memo.get(`snapshot:${origin}`, 600, async () => {
      let data,
        delivery = 'github';
      const old = previous.get(origin);
      try {
        const response = await fetcher(SOURCE, {
          headers: old?.etag ? { 'If-None-Match': old.etag } : {},
          signal: AbortSignal.timeout(10000),
        });
        if (response.status === 304 && old) data = old.data;
        else {
          if (!response.ok) throw new Error('source');
          const text = await response.text();
          if (text.length > 3000000) throw new Error('size');
          data = JSON.parse(text);
          if (!valid(data)) throw new Error('schema');
          previous.set(origin, { data, etag: response.headers.get('ETag') });
          while (previous.size > 4) previous.delete(previous.keys().next().value);
        }
      } catch {
        if (old) {
          data = old.data;
          delivery = 'last-good';
        } else {
          delivery = 'bundled';
          const fallback = await env.ASSETS.fetch(
            new Request(new URL('/snapshots/latest.json', request.url)),
          );
          if (!fallback.ok) throw new Error('missing');
          data = await fallback.json();
          if (!valid(data)) throw new Error('schema');
        }
      }
      const envelope = {
        ...data,
        status: 'ok',
        delivery,
        stale: Date.now() - Date.parse(data.generatedAt) > 48 * 3600000,
      };
      return {
        data: envelope,
        summary: summarize(envelope),
        players: new Map(data.fide.players.map((player) => [player.id, player])),
        interest: new Map(data.interest.players.map((player) => [player.id, player])),
      };
    });
  };
}
