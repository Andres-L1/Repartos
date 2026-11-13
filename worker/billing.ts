/**
 * Facturación. Dos modos (variable BILLING_MODE):
 *  - 'beta_open' (por defecto): sin pagos. Todas las lecciones accesibles; subscribe/cancel -> 501.
 *  - 'dev' (solo local): proveedor simulado, activa 30 días al instante. Nunca cobros reales.
 *
 * Dónde enchufar Stripe (modo test) más adelante: implementar `BillingProvider`, ampliar el contrato HTTP
 * (Checkout es asíncrono) y añadir un webhook que persista en cp_subscriptions. Claves solo por secretos de Worker.
 */
import type { BillingMode, SubscriptionStatus } from '../src/shared/api.js';

export interface SubscriptionRecord {
  status: SubscriptionStatus;
  provider: 'dev' | 'stripe';
  /** ISO. */
  currentPeriodEnd?: string;
  externalId?: string;
}

export interface BillingProvider {
  readonly name: 'dev' | 'stripe';
  subscribe(userId: string, now: Date): Promise<SubscriptionRecord> | SubscriptionRecord;
  /** Devuelve el nuevo estado tras cancelar (se mantiene el acceso hasta currentPeriodEnd). */
  cancel(userId: string, current: SubscriptionRecord, now: Date): Promise<SubscriptionRecord> | SubscriptionRecord;
}

export const PERIOD_DAYS = 30;

export function devBilling(): BillingProvider {
  return {
    name: 'dev',
    subscribe(_userId, now) {
      const end = new Date(now.getTime() + PERIOD_DAYS * 86_400_000);
      return { status: 'active', provider: 'dev', currentPeriodEnd: end.toISOString() };
    },
    cancel(_userId, current) {
      return { ...current, status: 'canceled' };
    },
  };
}

/** Cualquier valor distinto de 'dev' cae en beta_open (más seguro: nunca habilita pagos por error). */
export function parseBillingMode(v: string | undefined): BillingMode {
  return v === 'dev' ? 'dev' : 'beta_open';
}
