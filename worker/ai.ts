/**
 * Explicaciones breves con IA (DeepSeek, formato compatible con OpenAI). Solo en el servidor: la clave nunca llega al navegador.
 * La IA complementa el método (lecciones verificadas por código): solo redacta un porqué corto a partir de hechos calculados por código.
 * Consumo mínimo: caché compartida en D1, tope por alumno y día, tope global de tokens, sin reintentos ni streaming.
 */
import type { Db, Stmt } from './db.js';
import type { AiUsage } from '../src/shared/api.js';

/** Súbela al cambiar SYSTEM o el formato de los hechos: invalida la caché de golpe. */
export const PROMPT_VERSION = 'v2';
export const SYSTEM = [
  'Eres un entrenador de ajedrez para un alumno principiante. Recibes HECHOS comprobados de una posición y, a veces, el texto del método que el alumno ya leyó.',
  'Aporta solo lo que falta: el porqué, con una sola idea clara, usando únicamente los hechos.',
  'Reglas: máximo 3 frases y 300 caracteres; español sencillo y directo; sin saludos, sin «recuerda que», sin cierres tipo «espero que te ayude»;',
  'no repitas ni parafrasees el texto del método; no repitas la jugada ni la posición; no te repitas; sin emojis, listas, markdown ni enlaces;',
  'no culpes; sin cifras de motor; no inventes planes, variantes ni teoría que no esté en los hechos. Responde solo con la explicación.',
  'Ejemplo 1. Hechos: Jugada del alumno: Qxd5 (la dama captura el peón). Tras esa jugada, negras pueden capturar la dama con el peón y no se podría recapturar.',
  'Respuesta: Dejaste la dama frente a un peón que la ataca. Una pieza tan valiosa no debe ponerse donde una pieza menor la captura gratis.',
  'Ejemplo 2. Hechos: Jugada correcta: Nf6+ (el caballo da jaque). Texto del método: El caballo ataca al rey y a la torre.',
  'Respuesta: Como el rey está en jaque, el rival tiene que atender eso primero y ya no puede salvar la torre en ese turno.',
].join(' ');

export const MAX_TOKENS = 120;
export const TIMEOUT_MS = 8000;
const DEFAULT_USER_CALLS = 8;
const DEFAULT_TOKEN_CAP = 150_000;
const DEFAULT_BUDGET_EUR = 10;
const DEFAULT_MONTH_TOKEN_CAP = 1_500_000;
/** El corte mensual llega antes del tope, para dejar margen. */
const CUT = 0.9;
const MAX_CHARS = 300;
const GLOBAL = '*';
const CACHED = '*cache';
export const MAX_CACHE_ROWS = 3000;
export const USAGE_KEEP_DAYS = 30;

export type AiTransport = (req: { system: string; user: string; maxTokens: number }) => Promise<{ text: string; tokensIn: number; tokensOut: number }>;

/** Configuración (variables del Worker). `transport` solo lo inyectan los tests. */
export interface AiSettings {
  apiKey?: string | undefined;
  baseUrl?: string | undefined;
  model?: string | undefined;
  /** AI_ENABLED: '0'/'false'/'off' apaga; si falta, se activa solo con clave. */
  enabled?: string | undefined;
  dailyTokenCap?: string | undefined;
  userDailyCalls?: number | undefined;
  /** Presupuesto mensual en euros (por defecto 10) y tarifas en euros por millón de tokens (sin tarifas no se estima el gasto: manda el tope de tokens). */
  monthlyBudgetEur?: string | undefined;
  priceInEurPerM?: string | undefined;
  priceOutEurPerM?: string | undefined;
  monthlyTokenCap?: string | undefined;
  transport?: AiTransport | undefined;
}

export interface AiRuntime {
  on: boolean;
  userCalls: number;
  tokenCap: number;
  budgetEur: number;
  /** Tarifas €/millón de tokens; null hasta que el administrador las rellene. */
  prices: { inP: number; outP: number } | null;
  monthTokenCap: number;
  transport: AiTransport | undefined;
}

const pos = (v: string | undefined, d: number) => {
  const n = Number(v);
  return v?.trim() && Number.isFinite(n) && n > 0 ? n : d;
};

export function resolveAi(s: AiSettings | undefined): AiRuntime {
  const transport = s?.transport ?? (s?.apiKey ? deepseekTransport({ apiKey: s.apiKey, baseUrl: s.baseUrl, model: s.model }) : undefined);
  const off = ['0', 'false', 'off', 'no'].includes((s?.enabled ?? '').trim().toLowerCase());
  const inP = pos(s?.priceInEurPerM, 0);
  const outP = pos(s?.priceOutEurPerM, 0);
  return {
    on: !!transport && !off,
    userCalls: s?.userDailyCalls ?? DEFAULT_USER_CALLS,
    tokenCap: Math.floor(pos(s?.dailyTokenCap, DEFAULT_TOKEN_CAP)),
    budgetEur: pos(s?.monthlyBudgetEur, DEFAULT_BUDGET_EUR),
    prices: inP && outP ? { inP, outP } : null,
    monthTokenCap: Math.floor(pos(s?.monthlyTokenCap, DEFAULT_MONTH_TOKEN_CAP)),
    transport,
  };
}

/** fetch a `${baseUrl}/chat/completions`: temperatura baja, pocas salidas, 8 s, sin reintentos ni streaming. */
export function deepseekTransport(c: { apiKey: string; baseUrl?: string | undefined; model?: string | undefined }, fetchImpl: typeof fetch = fetch): AiTransport {
  const url = `${(c.baseUrl || 'https://api.deepseek.com').replace(/\/+$/, '')}/chat/completions`;
  return async ({ system, user, maxTokens }) => {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${c.apiKey}` },
      body: JSON.stringify({
        model: c.model || 'deepseek-chat',
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        temperature: 0.2,
        max_tokens: Math.min(maxTokens, MAX_TOKENS),
        stream: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`); // sin cuerpo en el registro: podría citar la petición
    const j = (await res.json()) as { choices?: { message?: { content?: unknown } }[]; usage?: { prompt_tokens?: unknown; completion_tokens?: unknown } };
    const text = j.choices?.[0]?.message?.content;
    if (typeof text !== 'string') throw new Error('respuesta sin texto');
    // Entrada = prompt_tokens completo (sin descuento por caché de DeepSeek): el gasto estimado sale por exceso, nunca por defecto.
    const n = (v: unknown, est: number) => (typeof v === 'number' && v >= 0 ? Math.round(v) : est);
    return { text, tokensIn: n(j.usage?.prompt_tokens, Math.ceil((system.length + user.length) / 3)), tokensOut: n(j.usage?.completion_tokens, Math.ceil(text.length / 3)) };
  };
}

const words = (t: string) => new Set(t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-zñ0-9]{4,}/g) ?? []);
const overlap = (a: Set<string>, b: Set<string>) => {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return a.size ? n / a.size : 0;
};

/**
 * Valida y recorta la respuesta: ≤3 frases y ≤300 caracteres; null si está vacía, trae emojis, enlaces, markdown, saludos o cierres,
 * si repite frases entre sí o si coincide en gran parte con el texto del método (`method`).
 */
export function cleanReply(raw: string, method = ''): string | null {
  if (/\n\s*([-*•]|\d+[.)])\s/.test(raw) || /^\s*([-*•#>]|\d+[.)])\s/.test(raw)) return null; // listas
  const t = raw.replace(/\s+/g, ' ').trim();
  if (!t || /\p{Extended_Pictographic}|https?:|www\.|[*_`#[\]<>|~]/u.test(t)) return null;
  if (/^¡?(hola|claro|por supuesto|vale)\b|recuerda que|espero que|te ayude/i.test(t)) return null;
  const sentences = (t.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).map((x) => x.trim()).filter(Boolean).slice(0, 3);
  while (sentences.length > 1 && sentences.join(' ').length > MAX_CHARS) sentences.pop();
  const out = sentences.join(' ');
  if (!out || out.length > MAX_CHARS) return null;
  const sets = sentences.map(words);
  for (let i = 1; i < sets.length; i++) for (let j = 0; j < i; j++) if (sets[i]!.size >= 3 && overlap(sets[i]!, sets[j]!) >= 0.6) return null;
  if (method && overlap(words(out), words(method)) >= 0.6) return null;
  return out;
}

export async function cacheKey(parts: string[]): Promise<string> {
  const data = new TextEncoder().encode([PROMPT_VERSION, ...parts].join('\u0001'));
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const monthOf = (ms: number) => dayOf(ms).slice(0, 7);

const bump = (day: string, id: string, calls: number, tokens: number) => ({
  sql: `INSERT INTO cp_ai_usage (day, user_id, calls, tokens) VALUES (?,?,?,?)
        ON CONFLICT(day, user_id) DO UPDATE SET calls = calls + excluded.calls, tokens = tokens + excluded.tokens`,
  params: [day, id, calls, tokens],
});
const bumpMonth = (month: string, calls: number, cached: number, tin: number, tout: number) => ({
  sql: `INSERT INTO cp_ai_month (month, calls, cached, tokens_in, tokens_out) VALUES (?,?,?,?,?)
        ON CONFLICT(month) DO UPDATE SET calls = calls + excluded.calls, cached = cached + excluded.cached,
          tokens_in = tokens_in + excluded.tokens_in, tokens_out = tokens_out + excluded.tokens_out`,
  params: [month, calls, cached, tin, tout],
});
const refund = (db: Db, day: string, userId: string) =>
  db.run('UPDATE cp_ai_usage SET calls = MAX(calls - 1, 0) WHERE day = ? AND user_id = ?', [day, userId]);

interface Month { calls: number; cached: number; tokens_in: number; tokens_out: number }
const readMonth = async (db: Db, month: string): Promise<Month> =>
  (await db.first<Month>('SELECT calls, cached, tokens_in, tokens_out FROM cp_ai_month WHERE month = ?', [month])) ?? { calls: 0, cached: 0, tokens_in: 0, tokens_out: 0 };

/** Consumo del mes frente al tope: en euros si hay tarifas; si no, en tokens (entrada + salida). Corta al 90 %. */
export function monthStatus(ai: AiRuntime, m: Month) {
  const tokens = m.tokens_in + m.tokens_out;
  const spendEur = ai.prices ? (m.tokens_in * ai.prices.inP + m.tokens_out * ai.prices.outP) / 1e6 : null;
  const used = spendEur ?? tokens;
  const limit = ai.prices ? ai.budgetEur : ai.monthTokenCap;
  return { tokens, spendEur, pct: Math.round((used / limit) * 100), cut: used >= limit * CUT };
}

export type Outcome =
  | { kind: 'ok'; text: string; cached: boolean }
  | { kind: 'user_limit' | 'global_limit' | 'budget' | 'unavailable' };

/** Caché, topes y llamada. `user` = hechos comprobados (nunca datos personales); `method` = texto que el alumno ya vio. Lecturas por clave primaria. */
export async function explain(db: Db, ai: AiRuntime, a: { userId: string; nowMs: number; key: string; user: string; method?: string }): Promise<Outcome> {
  if (!ai.on || !ai.transport) return { kind: 'unavailable' };
  const day = dayOf(a.nowMs);
  const month = monthOf(a.nowMs);
  const hit = await db.first<{ text: string }>('SELECT text FROM cp_ai_cache WHERE key = ?', [a.key]);
  if (hit) {
    await db.batch([bump(day, CACHED, 1, 0), bumpMonth(month, 0, 1, 0, 0)]);
    return { kind: 'ok', text: hit.text, cached: true };
  }
  if (monthStatus(ai, await readMonth(db, month)).cut) return { kind: 'budget' }; // el mensual manda
  if (ai.userCalls <= 0) return { kind: 'user_limit' };
  const g = await db.first<{ tokens: number }>('SELECT tokens FROM cp_ai_usage WHERE day = ? AND user_id = ?', [day, GLOBAL]);
  if ((g?.tokens ?? 0) >= ai.tokenCap) return { kind: 'global_limit' };
  // Reserva atómica de una llamada nueva del alumno: no pasa del tope aunque lleguen peticiones a la vez.
  const got = await db.first<{ calls: number }>(
    `INSERT INTO cp_ai_usage (day, user_id, calls, tokens) VALUES (?,?,1,0)
     ON CONFLICT(day, user_id) DO UPDATE SET calls = calls + 1 WHERE calls < ? RETURNING calls`,
    [day, a.userId, ai.userCalls],
  );
  if (!got) return { kind: 'user_limit' };
  let res: Awaited<ReturnType<AiTransport>>;
  try {
    res = await ai.transport({ system: SYSTEM, user: a.user, maxTokens: MAX_TOKENS });
  } catch (e) {
    console.error('IA:', e instanceof Error ? e.message : 'fallo'); // sin cuerpos ni claves
    await refund(db, day, a.userId);
    return { kind: 'unavailable' };
  }
  const tin = Math.max(0, Math.round(res.tokensIn) || 0);
  const tout = Math.max(0, Math.round(res.tokensOut) || 0);
  // Los tokens se gastaron aunque la respuesta no valga.
  await db.batch([bump(day, GLOBAL, 1, tin + tout), bump(day, a.userId, 0, tin + tout), bumpMonth(month, 1, 0, tin, tout)]);
  const text = cleanReply(res.text, a.method);
  if (!text) {
    await refund(db, day, a.userId);
    return { kind: 'unavailable' };
  }
  const won = await db.first<{ key: string }>(
    'INSERT OR IGNORE INTO cp_ai_cache (key, text, created_at, tokens) VALUES (?,?,?,?) RETURNING key',
    [a.key, text, a.nowMs, tin + tout],
  );
  if (won) return { kind: 'ok', text, cached: false };
  // Otro alumno la generó a la vez: se sirve la suya y a este no se le cobra la llamada.
  await refund(db, day, a.userId);
  const w = await db.first<{ text: string }>('SELECT text FROM cp_ai_cache WHERE key = ?', [a.key]);
  return { kind: 'ok', text: w?.text ?? text, cached: true };
}

/** Panel de administración: hoy y mes en curso. */
export async function usageOverview(db: Db, ai: AiRuntime, nowMs: number): Promise<AiUsage> {
  const rows = await db.all<{ user_id: string; calls: number; tokens: number }>(
    'SELECT user_id, calls, tokens FROM cp_ai_usage WHERE day = ? AND user_id IN (?, ?)',
    [dayOf(nowMs), GLOBAL, CACHED],
  );
  const g = rows.find((r) => r.user_id === GLOBAL);
  const m = await readMonth(db, monthOf(nowMs));
  const st = monthStatus(ai, m);
  return {
    available: ai.on,
    today: { calls: g?.calls ?? 0, tokens: g?.tokens ?? 0, cached: rows.find((r) => r.user_id === CACHED)?.calls ?? 0 },
    month: { calls: m.calls, cached: m.cached, tokens: st.tokens, spendEur: st.spendEur, pct: st.pct, cut: st.cut },
    pricesMissing: !ai.prices,
  };
}

/** Limpieza horaria: caché por encima del tope (las más antiguas, recorriendo solo el índice por created_at), uso diario de más de 30 días y meses de más de un año. */
export function aiCleanupStmts(nowMs: number): Stmt[] {
  return [
    { sql: `DELETE FROM cp_ai_cache WHERE rowid IN (SELECT rowid FROM cp_ai_cache ORDER BY created_at DESC LIMIT -1 OFFSET ${MAX_CACHE_ROWS})` },
    { sql: 'DELETE FROM cp_ai_usage WHERE day < ?', params: [dayOf(nowMs - USAGE_KEEP_DAYS * 86_400_000)] },
    { sql: 'DELETE FROM cp_ai_month WHERE month < ?', params: [monthOf(nowMs - 400 * 86_400_000)] },
  ];
}
