/**
 * Punto de entrada del Cloudflare Worker de Chedex Pulse.
 * wrangler sirve los estáticos (dist/web, SPA) directamente y solo invoca el Worker para /api/* y /auth/*.
 */
import { UNITS } from '../src/content/index.js';
import { createApp } from './app.js';
import { d1Db, type D1Like } from './db.js';
import { scheduledRun } from './puzzles.js';

export interface Env {
  /** D1: base existente chedexpulse-users. Solo se tocan tablas cp_*. */
  PULSE_DB: D1Like;
  /** Secreto de 32 bytes en base64url (wrangler secret put SESSION_SECRET). */
  SESSION_SECRET?: string;
  PUBLIC_ORIGIN?: string;
  /** DeepSeek: la clave es un secreto de Wrangler (`wrangler secret put DEEPSEEK_API_KEY`); el resto son variables opcionales. */
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_BASE_URL?: string;
  DEEPSEEK_MODEL?: string;
  AI_ENABLED?: string;
  DEEPSEEK_DAILY_TOKEN_CAP?: string;
  DEEPSEEK_MONTHLY_BUDGET_EUR?: string;
  DEEPSEEK_PRICE_IN_EUR_PER_M?: string;
  DEEPSEEK_PRICE_OUT_EUR_PER_M?: string;
  DEEPSEEK_MONTHLY_TOKEN_CAP?: string;
  ASSETS?: { fetch(req: Request): Promise<Response> };
}

let cached: ReturnType<typeof createApp> | undefined;

function appFor(env: Env) {
  cached ??= createApp({
    db: d1Db(env.PULSE_DB),
    content: { units: UNITS },
    sessionSecret: env.SESSION_SECRET,
    publicOrigin: env.PUBLIC_ORIGIN,
    ai: {
      apiKey: env.DEEPSEEK_API_KEY,
      baseUrl: env.DEEPSEEK_BASE_URL,
      model: env.DEEPSEEK_MODEL,
      enabled: env.AI_ENABLED,
      dailyTokenCap: env.DEEPSEEK_DAILY_TOKEN_CAP,
      monthlyBudgetEur: env.DEEPSEEK_MONTHLY_BUDGET_EUR,
      priceInEurPerM: env.DEEPSEEK_PRICE_IN_EUR_PER_M,
      priceOutEurPerM: env.DEEPSEEK_PRICE_OUT_EUR_PER_M,
      monthlyTokenCap: env.DEEPSEEK_MONTHLY_TOKEN_CAP,
    },
    assets: env.ASSETS,
  });
  return cached;
}

export default {
  fetch(request: Request, env: Env): Response | Promise<Response> {
    return appFor(env).fetch(request);
  },
  /** Cron Trigger cada minuto (wrangler.jsonc; cada ejecución lee ~76 filas de cp_puzzle_stats, no el depósito): rellena el depósito de puzles y limpia. Nunca lanza. */
  scheduled(event: { scheduledTime: number }, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }): void {
    ctx.waitUntil(scheduledRun(d1Db(env.PULSE_DB), event.scheduledTime, fetch));
  },
};
