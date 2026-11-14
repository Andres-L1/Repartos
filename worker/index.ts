/**
 * Punto de entrada del Cloudflare Worker de Chedex Pulse.
 * wrangler sirve los estáticos (dist/web, SPA) directamente y solo invoca el Worker para /api/* y /auth/*.
 */
import { UNITS } from '../src/content/index.js';
import { createApp } from './app.js';
import { devBilling, parseBillingMode } from './billing.js';
import { d1Db, type D1Like } from './db.js';
import { scheduledRun } from './puzzles.js';

export interface Env {
  /** D1: base existente chedexpulse-users. Solo se tocan tablas cp_*. */
  PULSE_DB: D1Like;
  /** Secreto de 32 bytes en base64url (wrangler secret put SESSION_SECRET). */
  SESSION_SECRET?: string;
  PUBLIC_ORIGIN?: string;
  /** 'beta_open' (por defecto) | 'dev' (solo local). */
  BILLING_MODE?: string;
  ASSETS?: { fetch(req: Request): Promise<Response> };
}

let cached: ReturnType<typeof createApp> | undefined;

function appFor(env: Env) {
  cached ??= createApp({
    db: d1Db(env.PULSE_DB),
    content: { units: UNITS },
    billingMode: parseBillingMode(env.BILLING_MODE),
    billing: devBilling(),
    sessionSecret: env.SESSION_SECRET,
    publicOrigin: env.PUBLIC_ORIGIN,
    assets: env.ASSETS,
  });
  return cached;
}

export default {
  fetch(request: Request, env: Env): Response | Promise<Response> {
    return appFor(env).fetch(request);
  },
  /** Cron Trigger de cada minuto (wrangler.jsonc): rellena el depósito de puzles y limpia. Nunca lanza. */
  scheduled(event: { scheduledTime: number }, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }): void {
    ctx.waitUntil(scheduledRun(d1Db(env.PULSE_DB), event.scheduledTime, fetch));
  },
};
