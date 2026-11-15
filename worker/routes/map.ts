/** Mapa de unidades y nivel elegido. */
import type { Hono } from 'hono';
import type { AppContext } from '../context.js';
import { HttpError, readJson, type Env } from '../http.js';
import type { LevelCard, LevelInfo } from '../../src/shared/api.js';
import { LEVELS, suggestLevel } from '../../src/shared/levels.js';
import { levelPlan } from '../level.js';
import { parseSeen } from '../placement.js';
import { buildMap } from '../progress.js';

export function registerMapRoutes(app: Hono<Env>, k: AppContext): void {
  const { db, content, now, requireAuth, progressMap, isLevel, chosenLevel, levelEffect } = k;
  app.get('/api/map', requireAuth, async (c) => {
    const userId = c.get('user').id;
    return c.json({ units: buildMap(content.units, await progressMap(userId), await levelEffect(userId)) });
  });

  async function levelInfoFor(userId: string): Promise<LevelInfo> {
    const chosen = await chosenLevel(userId);
    const seenRow = await db.first<{ seen_json: string }>('SELECT seen_json FROM cp_placement_seen WHERE user_id = ?', [userId]);
    const { level, hint } = suggestLevel(parseSeen(seenRow?.seen_json));
    const levels: LevelCard[] = LEVELS.map((l) => ({ ...l, available: content.units.some((u) => u.level === l.id) }));
    return { chosen, suggested: level, hint, levels, comingSoon: chosen !== null && levelPlan(chosen, content).comingSoon };
  }

  app.get('/api/level', requireAuth, async (c) => c.json(await levelInfoFor(c.get('user').id)));

  app.put('/api/level', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const b = await readJson(c);
    if (!isLevel(b.level)) throw new HttpError(400, 'level debe ser uno de los 6 niveles');
    await db.run(
      `INSERT INTO cp_user_level (user_id, level, chosen_at) VALUES (?,?,?)
       ON CONFLICT(user_id) DO UPDATE SET level = excluded.level, chosen_at = excluded.chosen_at`,
      [userId, b.level, now().toISOString()],
    );
    return c.json(await levelInfoFor(userId));
  });

}
