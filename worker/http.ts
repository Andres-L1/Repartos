/** Piezas HTTP comunes de las rutas: errores con estado, validadores y lectura de JSON. */
import type { Context } from 'hono';
import type { User } from '../src/shared/api.js';

export type Env = { Variables: { user: User } };
export type Ctx = Context<Env>;

export class HttpError extends Error {
  constructor(public status: 400 | 401 | 402 | 403 | 404 | 409 | 413 | 415 | 501, message: string) {
    super(message);
  }
}

export const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
export const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export async function readJson(c: Context): Promise<Record<string, unknown>> {
  const ct = c.req.header('content-type') ?? '';
  if (!ct.toLowerCase().includes('application/json')) throw new HttpError(415, 'Content-Type debe ser application/json');
  let v: unknown;
  try {
    v = JSON.parse(await c.req.text());
  } catch {
    throw new HttpError(400, 'JSON no válido');
  }
  if (!isObj(v)) throw new HttpError(400, 'Se esperaba un objeto JSON');
  return v;
}
