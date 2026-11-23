/** Auth con Lichess, configuración, temario público, /api/me, borrado de cuenta y perfil. */
import type { Hono } from 'hono';
import type { AppContext } from '../context.js';
import { requireOwnOrigin, type Env } from '../http.js';
import { clearedCookies, handleCallback, handleLogin, handleLogout } from '../auth.js';
import { isAdmin } from '../../src/shared/admin.js';
import { equippedFor } from '../shop.js';

export function registerAccountRoutes(app: Hono<Env>, k: AppContext): void {
  const { db, content, auth, requireAuth, chosenLevel, profileFor, deps } = k;
  // ---------- auth (solo Lichess) ----------
  app.get('/auth/login', (c) => handleLogin(c, auth));
  app.get('/auth/callback', (c) => handleCallback(c, auth));
  app.post('/auth/logout', (c) => handleLogout(c, auth));

  // Temario público: solo ids, títulos, orden, descripción y nivel. Nunca el contenido de las lecciones.
  app.get('/api/outline', (c) =>
    c.json({
      units: [...content.units]
        .sort((a, b) => a.order - b.order)
        .map((u) => ({
          id: u.id,
          order: u.order,
          title: u.title,
          description: u.description,
          level: u.level,
          lessons: u.lessons.map((l) => ({ id: l.id, title: l.title })),
        })),
    }),
  );

  app.get('/api/me', requireAuth, async (c) => {
    const user = c.get('user');
    const chosen = await chosenLevel(user.id);
    return c.json({
      user,
      isAdmin: isAdmin(user.id),
      equipped: await equippedFor(db, user.id),
      level: chosen ?? 'initiation',
      levelChosen: chosen !== null,
      ai: k.ai.on, // la web oculta el botón «¿Por qué?» si no hay IA
      openingsStats: k.openings.on, // la web solo ofrece «Estadísticas (Lichess)» si el administrador las activó
    });
  });

  // ---------- borrado de la cuenta ----------
  // Borra al usuario y, por ON DELETE CASCADE, todo lo suyo (progreso, tienda, repasos, nivel...). Exige Origin propio.
  app.delete('/api/account', requireAuth, async (c) => {
    requireOwnOrigin(c, deps);
    await db.batch([
      { sql: 'DELETE FROM cp_ai_usage WHERE user_id = ?', params: [c.get('user').id] },
      { sql: 'DELETE FROM cp_openings_usage WHERE user_id = ?', params: [c.get('user').id] },
      { sql: 'DELETE FROM cp_repertoire WHERE user_id = ?', params: [c.get('user').id] },
      { sql: 'DELETE FROM cp_users WHERE id = ?', params: [c.get('user').id] },
    ]);
    const res = c.json({ ok: true });
    for (const ck of clearedCookies(deps.publicOrigin!)) res.headers.append('Set-Cookie', ck);
    return res;
  });

  // ---------- perfil ----------
  app.get('/api/profile', requireAuth, async (c) => c.json({ profile: await profileFor(c.get('user').id) }));

}
