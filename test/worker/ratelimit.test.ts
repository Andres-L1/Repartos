import { describe, expect, it } from 'vitest';
import { createOpenApp } from './helpers.js';

const noDb = {} as never;
const base = { db: noDb, content: { units: [] }, sessionSecret: undefined, publicOrigin: undefined };

describe('límite de peticiones', () => {
  it('devuelve 429 cuando el binding rechaza, con la IP de Cloudflare como clave', async () => {
    const keys: string[] = [];
    const app = createOpenApp({ ...base, apiLimiter: { limit: async ({ key }) => (keys.push(key), { success: false }) } });
    const r = await app.request('/api/outline', { headers: { 'cf-connecting-ip': '1.2.3.4' } });
    expect(r.status).toBe(429);
    expect(keys).toEqual(['1.2.3.4']);
  });
  it('usa el límite estricto en /auth y no limita lo demás', async () => {
    const app = createOpenApp({ ...base, authLimiter: { limit: async () => ({ success: false }) }, apiLimiter: { limit: async () => ({ success: true }) } });
    expect((await app.request('/auth/login')).status).toBe(429);
    expect((await app.request('/api/nada')).status).toBe(404);
  });
});
