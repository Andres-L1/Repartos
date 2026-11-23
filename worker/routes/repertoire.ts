/** Repertorio de aperturas del alumno: GET /api/repertoire, POST /api/repertoire/{add,remove,clear}. */
import type { Hono } from 'hono';
import type { AppContext } from '../context.js';
import { HttpError, readJson, type Env } from '../http.js';
import { checkRepMove, isRepColor, MAX_REP_MOVES, type RepMove } from '../../src/openings/repertoire.js';

const MAX_PER_REQUEST = 500;

export function registerRepertoireRoutes(app: Hono<Env>, k: AppContext): void {
  const { db, requireAuth } = k;
  const list = (userId: string) =>
    db.all<RepMove>('SELECT color, key, uci FROM cp_repertoire WHERE user_id = ? ORDER BY color, key, uci LIMIT ?', [userId, MAX_REP_MOVES]);
  const count = async (userId: string) => (await db.first<{ n: number }>('SELECT COUNT(*) AS n FROM cp_repertoire WHERE user_id = ?', [userId]))?.n ?? 0;

  app.get('/api/repertoire', requireAuth, async (c) => c.json({ moves: await list(c.get('user').id) }));

  app.post('/api/repertoire/add', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const b = await readJson(c);
    if (!isRepColor(b.color) || !Array.isArray(b.moves) || b.moves.length > MAX_PER_REQUEST) throw new HttpError(400, 'Petición no válida');
    const rows: RepMove[] = [];
    for (const m of b.moves as { key?: unknown; uci?: unknown }[]) {
      const ok = checkRepMove(m?.key, m?.uci);
      if (!ok) throw new HttpError(400, 'Jugada no válida');
      rows.push({ color: b.color, ...ok });
    }
    if ((await count(userId)) + rows.length > MAX_REP_MOVES) throw new HttpError(400, 'Tu repertorio está lleno');
    await db.batch(rows.map((r) => ({ sql: 'INSERT OR IGNORE INTO cp_repertoire (user_id, color, key, uci) VALUES (?,?,?,?)', params: [userId, r.color, r.key, r.uci] })));
    return c.json({ moves: await list(userId) });
  });

  app.post('/api/repertoire/remove', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const b = await readJson(c);
    if (!isRepColor(b.color) || typeof b.key !== 'string' || typeof b.uci !== 'string') throw new HttpError(400, 'Petición no válida');
    await db.run('DELETE FROM cp_repertoire WHERE user_id = ? AND color = ? AND key = ? AND uci = ?', [userId, b.color, b.key, b.uci]);
    return c.json({ moves: await list(userId) });
  });

  app.post('/api/repertoire/clear', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const b = await readJson(c);
    if (!isRepColor(b.color)) throw new HttpError(400, 'Petición no válida');
    await db.run('DELETE FROM cp_repertoire WHERE user_id = ? AND color = ?', [userId, b.color]);
    return c.json({ moves: await list(userId) });
  });
}
