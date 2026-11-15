/** Facturación (beta abierta o proveedor simulado en dev). */
import type { Hono } from 'hono';
import type { AppContext } from '../context.js';
import { HttpError, type Env } from '../http.js';
import type { SubscriptionRecord } from '../billing.js';

export function registerBillingRoutes(app: Hono<Env>, k: AppContext): void {
  const { db, billing, billingMode, now, requireAuth, subscriptionFor } = k;
  // ---------- facturación ----------
  const saveSub = (userId: string, r: SubscriptionRecord) =>
    db.run(
      `INSERT INTO cp_subscriptions (user_id, status, provider, current_period_end, external_id) VALUES (?,?,?,?,?)
       ON CONFLICT(user_id) DO UPDATE SET status=excluded.status, provider=excluded.provider,
         current_period_end=excluded.current_period_end, external_id=excluded.external_id`,
      [userId, r.status, r.provider, r.currentPeriodEnd ?? null, r.externalId ?? null],
    );
  const comingSoon = () => {
    if (billingMode === 'beta_open') throw new HttpError(501, 'Los pagos llegarán próximamente. Ahora estamos en beta abierta.');
  };

  app.get('/api/billing', requireAuth, async (c) => c.json({ subscription: await subscriptionFor(c.get('user').id) }));

  app.post('/api/billing/subscribe', requireAuth, async (c) => {
    comingSoon();
    const userId = c.get('user').id;
    if ((await subscriptionFor(userId)).status === 'active') return c.json({ subscription: await subscriptionFor(userId) }); // idempotente
    await saveSub(userId, await billing.subscribe(userId, now()));
    return c.json({ subscription: await subscriptionFor(userId) });
  });

  app.post('/api/billing/cancel', requireAuth, async (c) => {
    comingSoon();
    const userId = c.get('user').id;
    const cur = await subscriptionFor(userId);
    if (cur.status === 'none') throw new HttpError(409, 'No hay suscripción que cancelar');
    if (cur.status === 'canceled') return c.json({ subscription: cur });
    const row = await db.first<{ external_id: string | null }>(
      'SELECT external_id FROM cp_subscriptions WHERE user_id = ?',
      [userId],
    );
    await saveSub(
      userId,
      await billing.cancel(
        userId,
        {
          status: cur.status,
          provider: cur.provider === 'stripe' ? 'stripe' : 'dev',
          currentPeriodEnd: cur.currentPeriodEnd,
          externalId: row?.external_id ?? undefined,
        },
        now(),
      ),
    );
    return c.json({ subscription: await subscriptionFor(userId) });
  });

}
