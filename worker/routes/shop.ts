/** Tienda: catálogo, compra y equipar. */
import type { Hono } from 'hono';
import type { AppContext } from '../context.js';
import { HttpError, readJson, type Env } from '../http.js';
import { buildShop, buyItem, equipItem } from '../shop.js';

export function registerShopRoutes(app: Hono<Env>, k: AppContext): void {
  const { db, now, requireAuth, loadProfile, profileFor } = k;
  // ---------- tienda ----------
  const shopFor = async (userId: string) => buildShop(db, userId, (await profileFor(userId)).streakDays);

  app.get('/api/shop', requireAuth, async (c) => c.json(await shopFor(c.get('user').id)));

  const readItemId = (v: unknown): string => {
    if (typeof v !== 'string' || !/^[a-z0-9_-]{1,40}$/.test(v)) throw new HttpError(400, 'itemId no válido');
    return v;
  };

  // Solo se lee itemId: cualquier precio u otro campo del cuerpo se ignora (el precio lo fija el catálogo del servidor).
  app.post('/api/shop/buy', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const itemId = readItemId((await readJson(c)).itemId);
    await loadProfile(userId); // asegura fila de perfil
    const r = await buyItem(db, userId, itemId, now().toISOString());
    if (r === 'unknown') throw new HttpError(404, 'Objeto no encontrado');
    if (r === 'owned') throw new HttpError(400, 'Ya tienes este objeto');
    if (r === 'max') throw new HttpError(400, 'Ya tienes el máximo de protectores');
    if (r === 'funds') throw new HttpError(400, 'No tienes Chedex suficientes');
    return c.json(await shopFor(userId));
  });

  app.post('/api/shop/equip', requireAuth, async (c) => {
    const userId = c.get('user').id;
    const b = await readJson(c);
    if (b.kind !== 'pieces' && b.kind !== 'board') throw new HttpError(400, "kind debe ser 'pieces' o 'board'");
    const itemId = readItemId(b.itemId);
    const r = await equipItem(db, userId, b.kind, itemId);
    if (r === 'unknown') throw new HttpError(404, 'Objeto no encontrado');
    if (r === 'bad_kind') throw new HttpError(400, 'El objeto no es de ese tipo');
    if (r === 'not_owned') throw new HttpError(400, 'No tienes este objeto');
    return c.json(await shopFor(userId));
  });

}
