/** GET /api/openings/stats?fen=&source=masters|lichess: estadísticas del explorador de Lichess (opcional, apagado por defecto). */
import type { Hono } from 'hono';
import type { AppContext } from '../context.js';
import { HttpError, type Env } from '../http.js';
import { isSource, openingStats, validFenKey } from '../openings.js';

export function registerOpeningsRoutes(app: Hono<Env>, k: AppContext): void {
  const { db, now, requireAuth, openings } = k;

  app.get('/api/openings/stats', requireAuth, async (c) => {
    if (!openings.on) return c.json({ disabled: true }, 404);
    const key = validFenKey(c.req.query('fen'));
    const source = c.req.query('source');
    if (!key || !isSource(source)) throw new HttpError(400, 'Petición no válida');
    const out = await openingStats(db, openings, { userId: c.get('user').id, nowMs: now().getTime(), key, source });
    if (out.kind === 'ok') return c.json({ ...out.stats, cached: out.cached });
    return c.json({ unavailable: true });
  });
}
