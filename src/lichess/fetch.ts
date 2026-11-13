import type { LichessGame } from '../review/types.js';
import { gamesUrl, parseNdjson } from './games.js';

export type LichessErrorKind = 'not_found' | 'rate_limited' | 'network' | 'bad_response';

export class LichessError extends Error {
  kind: LichessErrorKind;
  constructor(kind: LichessErrorKind, message: string) {
    super(message);
    this.name = 'LichessError';
    this.kind = kind;
  }
}

export async function fetchRecentGames(
  username: string,
  opts: { signal?: AbortSignal; fetchImpl?: typeof fetch } = {},
): Promise<LichessGame[]> {
  const doFetch = opts.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await doFetch(gamesUrl(username), {
      headers: { Accept: 'application/x-ndjson' },
      signal: opts.signal,
    });
  } catch (e) {
    if (opts.signal?.aborted || (e as { name?: string })?.name === 'AbortError') throw e;
    throw new LichessError('network', 'No se pudo conectar con Lichess.');
  }
  if (res.status === 404) throw new LichessError('not_found', 'Ese usuario no existe en Lichess.');
  if (res.status === 429) throw new LichessError('rate_limited', 'Lichess pide esperar un poco.');
  if (!res.ok) throw new LichessError('bad_response', `Lichess respondió con el código ${res.status}.`);

  let text: string;
  try {
    text = await res.text();
  } catch (e) {
    if (opts.signal?.aborted || (e as { name?: string })?.name === 'AbortError') throw e;
    throw new LichessError('network', 'Se cortó la conexión con Lichess.');
  }
  const games = parseNdjson(text);
  if (text.trim() && games.length === 0) throw new LichessError('bad_response', 'Lichess devolvió algo inesperado.');
  return games;
}
