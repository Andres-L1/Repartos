/** Administración del acceso: autorizados y solicitudes denegadas. Solo la administración (comprobado aquí, en el servidor). */
import type { Hono } from 'hono';
import type { AppContext } from '../context.js';
import { HttpError, readJson, requireOwnOrigin, type Ctx, type Env } from '../http.js';
import { isAdmin } from '../../src/shared/admin.js';
import { isValidUsername } from '../../src/lichess/games.js';
import { MAX_ALLOWED, MAX_REQUESTS } from '../access.js';
import type { AccessOverview } from '../../src/shared/api.js';

export function registerAdminRoutes(app: Hono<Env>, k: AppContext): void {
  const { db, now, requireAuth, deps } = k;

  const requireAdmin = async (c: Ctx, next: () => Promise<void>) => {
    if (!isAdmin(c.get('user').id)) return c.json({ error: 'Solo para la administración' }, 403);
    if (c.req.method !== 'GET') requireOwnOrigin(c, deps);
    await next();
  };
  app.use('/api/admin/*', requireAuth, requireAdmin);

  const overview = async (): Promise<AccessOverview> => {
    const allowed = await db.all<{ lichess_id: string; username: string | null; added_at: number | null }>(
      `SELECT lichess_id, username, added_at FROM cp_allowed_users ORDER BY lichess_id LIMIT ${MAX_ALLOWED}`,
    );
    const requests = await db.all<{ lichess_id: string; username: string | null; first_at: number | null; last_at: number | null; attempts: number | null }>(
      `SELECT lichess_id, username, first_at, last_at, attempts FROM cp_access_requests ORDER BY last_at DESC LIMIT ${MAX_REQUESTS}`,
    );
    return {
      allowed: allowed.map((r) => ({ id: r.lichess_id, username: r.username ?? r.lichess_id, addedAt: r.added_at ?? 0 })),
      requests: requests.map((r) => ({
        id: r.lichess_id, username: r.username ?? r.lichess_id, firstAt: r.first_at ?? 0, lastAt: r.last_at ?? 0, attempts: r.attempts ?? 1,
      })),
      maxAllowed: MAX_ALLOWED,
    };
  };

  /** Autoriza un id: valida tope y duplicados. El nombre debe ser exactamente el de Lichess (no se consulta a Lichess). */
  async function allow(id: string, username: string, by: string) {
    if (isAdmin(id)) throw new HttpError(409, 'Esa cuenta es de administración y ya tiene acceso');
    const count = await db.first<{ n: number }>('SELECT COUNT(*) AS n FROM cp_allowed_users');
    if ((count?.n ?? 0) >= MAX_ALLOWED) throw new HttpError(409, `Has llegado al máximo de ${MAX_ALLOWED} alumnos autorizados`);
    if (await db.first('SELECT 1 FROM cp_allowed_users WHERE lichess_id = ?', [id])) throw new HttpError(409, 'Ese usuario ya está autorizado');
    await db.batch([
      { sql: 'INSERT INTO cp_allowed_users (lichess_id, username, added_at, added_by) VALUES (?,?,?,?)', params: [id, username, now().getTime(), by] },
      { sql: 'DELETE FROM cp_access_requests WHERE lichess_id = ?', params: [id] },
    ]);
  }

  const idParam = (c: Ctx) => {
    const raw = c.req.param('id') ?? '';
    if (!isValidUsername(raw)) throw new HttpError(400, 'Usuario no válido');
    return raw.toLowerCase();
  };

  app.get('/api/admin/access', async (c) => c.json(await overview()));

  app.post('/api/admin/allowed', async (c) => {
    const body = await readJson(c);
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    if (!isValidUsername(username)) throw new HttpError(400, 'Escribe el nombre de usuario de Lichess (2 a 30 letras, números, guion o guion bajo)');
    await allow(username.toLowerCase(), username, c.get('user').id);
    return c.json(await overview());
  });

  app.delete('/api/admin/allowed/:id', async (c) => {
    const id = idParam(c);
    if (!(await db.first('SELECT 1 FROM cp_allowed_users WHERE lichess_id = ?', [id]))) throw new HttpError(404, 'Ese usuario no está en la lista');
    await db.run('DELETE FROM cp_allowed_users WHERE lichess_id = ?', [id]);
    return c.json(await overview());
  });

  app.post('/api/admin/requests/:id/approve', async (c) => {
    const id = idParam(c);
    const r = await db.first<{ username: string | null }>('SELECT username FROM cp_access_requests WHERE lichess_id = ?', [id]);
    if (!r) throw new HttpError(404, 'No hay solicitud de ese usuario');
    await allow(id, r.username ?? id, c.get('user').id);
    return c.json(await overview());
  });

  app.delete('/api/admin/requests/:id', async (c) => {
    await db.run('DELETE FROM cp_access_requests WHERE lichess_id = ?', [idParam(c)]);
    return c.json(await overview());
  });
}
