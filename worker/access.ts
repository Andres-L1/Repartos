/** Acceso restringido: lista de autorizados (cp_allowed_users) y solicitudes de acceso denegadas (cp_access_requests). */
import type { Db } from './db.js';

export type AccessMode = 'allowlist' | 'open';

export const MAX_ALLOWED = 500;
export const MAX_REQUESTS = 300;
export const REQUEST_TTL_MS = 90 * 86_400_000;

/** Registra (o actualiza) un intento denegado y deja como mucho MAX_REQUESTS filas, borrando las más antiguas. */
export async function recordDenied(db: Db, user: { id: string; username: string }, nowMs: number): Promise<void> {
  await db.batch([
    {
      sql: `INSERT INTO cp_access_requests (lichess_id, username, first_at, last_at, attempts) VALUES (?,?,?,?,1)
            ON CONFLICT(lichess_id) DO UPDATE SET username = excluded.username, last_at = excluded.last_at, attempts = attempts + 1`,
      params: [user.id, user.username, nowMs, nowMs],
    },
    {
      sql: `DELETE FROM cp_access_requests WHERE lichess_id IN (
              SELECT lichess_id FROM cp_access_requests ORDER BY last_at DESC, lichess_id LIMIT -1 OFFSET ${MAX_REQUESTS})`,
    },
  ]);
}
