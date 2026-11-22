/**
 * Estadísticas de aperturas de Lichess (explorer.lichess.ovh), opcionales y apagadas por defecto.
 * A Lichess solo se envían el FEN (sin contadores) y la fuente: nunca usuario, id de Lichess ni cookies.
 * Caché compartida en D1 (24 h), tope de llamadas nuevas por alumno y día y tope global; sin reintentos.
 */
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import type { Db, Stmt } from './db.js';
import type { OpeningsStats } from '../src/shared/api.js';

export const SOURCES = ['masters', 'lichess'] as const;
export type Source = (typeof SOURCES)[number];
export const isSource = (v: unknown): v is Source => typeof v === 'string' && (SOURCES as readonly string[]).includes(v);

export const TTL_MS = 24 * 3600_000;
export const TIMEOUT_MS = 8000;
export const MAX_FEN_LEN = 100;
export const MAX_CACHE_ROWS = 5000;
export const USAGE_KEEP_DAYS = 30;
const DEFAULT_USER_CALLS = 120;
const DEFAULT_GLOBAL_CALLS = 2000;
const GLOBAL = '*';
const EXPLORER = 'https://explorer.lichess.ovh';

export interface OpeningsSettings {
  /** OPENINGS_STATS_ENABLED: solo '1'/'true'/'on'/'yes' lo enciende (apagado si falta). */
  enabled?: string | undefined;
  userDailyCalls?: number | undefined;
  globalDailyCalls?: number | undefined;
  /** Solo lo inyectan los tests. */
  fetch?: typeof fetch | undefined;
}
export interface OpeningsRuntime {
  on: boolean;
  userCalls: number;
  globalCalls: number;
  fetch: typeof fetch;
}
export function resolveOpenings(s: OpeningsSettings | undefined): OpeningsRuntime {
  return {
    on: ['1', 'true', 'on', 'yes'].includes((s?.enabled ?? '').trim().toLowerCase()),
    userCalls: s?.userDailyCalls ?? DEFAULT_USER_CALLS,
    globalCalls: s?.globalDailyCalls ?? DEFAULT_GLOBAL_CALLS,
    fetch: s?.fetch ?? ((...a) => fetch(...a)),
  };
}

/** FEN estricto: texto corto, posición legal para chessops. Devuelve la clave (4 campos) o null. */
export function validFenKey(fen: unknown): string | null {
  if (typeof fen !== 'string' || fen.length > MAX_FEN_LEN || /[^\x20-\x7e]/.test(fen)) return null;
  const s = parseFen(fen);
  if (s.isErr) return null;
  const p = Chess.fromSetup(s.value);
  return p.isErr ? null : makeFen(p.value.toSetup()).split(' ').slice(0, 4).join(' ');
}

const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const int = (v: unknown) => (typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 ? v : 0);
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

/** Reduce la respuesta de Lichess a lo que usa la web (números y textos cortos); null si no tiene la forma esperada. */
export function reduceStats(j: unknown): OpeningsStats | null {
  const o = j as { white?: unknown; draws?: unknown; black?: unknown; moves?: unknown; opening?: { eco?: unknown; name?: unknown } | null };
  if (!o || typeof o !== 'object' || !Array.isArray(o.moves)) return null;
  const opening = o.opening && typeof o.opening === 'object' ? { eco: str(o.opening.eco, 4), name: str(o.opening.name, 120) } : null;
  return {
    white: int(o.white),
    draws: int(o.draws),
    black: int(o.black),
    opening: opening && opening.name ? opening : null,
    moves: o.moves.slice(0, 20).map((m: { uci?: unknown; san?: unknown; white?: unknown; draws?: unknown; black?: unknown }) => ({
      uci: str(m?.uci, 5),
      san: str(m?.san, 8),
      white: int(m?.white),
      draws: int(m?.draws),
      black: int(m?.black),
    })),
  };
}

export type StatsOutcome = { kind: 'ok'; stats: OpeningsStats; cached: boolean } | { kind: 'unavailable' };

/** Caché -> topes -> Lichess. Cualquier fallo (429, error, tiempo) devuelve 'unavailable'; con caché caducada se sirve esa. */
export async function openingStats(db: Db, rt: OpeningsRuntime, a: { userId: string; nowMs: number; key: string; source: Source }): Promise<StatsOutcome> {
  const row = await db.first<{ json: string; fetched_at: number }>('SELECT json, fetched_at FROM cp_openings_cache WHERE fen = ? AND source = ?', [a.key, a.source]);
  const parse = (r: { json: string }) => {
    try {
      return JSON.parse(r.json) as OpeningsStats;
    } catch {
      return null;
    }
  };
  if (row && a.nowMs - row.fetched_at < TTL_MS) {
    const hit = parse(row);
    if (hit) return { kind: 'ok', stats: hit, cached: true };
  }
  const stale = () => {
    const s = row && parse(row);
    return s ? ({ kind: 'ok', stats: s, cached: true } as const) : ({ kind: 'unavailable' } as const);
  };
  const day = dayOf(a.nowMs);
  if (rt.userCalls <= 0 || rt.globalCalls <= 0) return stale();
  // Reserva atómica: ni el alumno ni el total del día pasan de su tope aunque lleguen peticiones a la vez.
  const g = await db.first<{ calls: number }>(
    `INSERT INTO cp_openings_usage (day, user_id, calls) VALUES (?,?,1)
     ON CONFLICT(day, user_id) DO UPDATE SET calls = calls + 1 WHERE calls < ? RETURNING calls`,
    [day, GLOBAL, rt.globalCalls],
  );
  if (!g) return stale();
  const u = await db.first<{ calls: number }>(
    `INSERT INTO cp_openings_usage (day, user_id, calls) VALUES (?,?,1)
     ON CONFLICT(day, user_id) DO UPDATE SET calls = calls + 1 WHERE calls < ? RETURNING calls`,
    [day, a.userId, rt.userCalls],
  );
  const refund = (id: string) => db.run('UPDATE cp_openings_usage SET calls = MAX(calls - 1, 0) WHERE day = ? AND user_id = ?', [day, id]);
  if (!u) {
    await refund(GLOBAL);
    return stale();
  }
  let stats: OpeningsStats | null = null;
  try {
    // topGames/recentGames = 0: sin listas de partidas (más ligero). Solo FEN: sin cabeceras con datos del usuario.
    const url = `${EXPLORER}/${a.source}?fen=${encodeURIComponent(`${a.key} 0 1`)}&moves=12&topGames=0&recentGames=0`;
    const res = await rt.fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`Lichess explorer HTTP ${res.status}`); // sin cuerpo en el registro
    stats = reduceStats(await res.json());
    if (!stats) throw new Error('respuesta con forma inesperada');
  } catch (e) {
    console.error('Aperturas:', e instanceof Error ? e.message : 'fallo');
    await refund(a.userId);
    await refund(GLOBAL);
    return stale();
  }
  await db.run('INSERT OR REPLACE INTO cp_openings_cache (fen, source, json, fetched_at) VALUES (?,?,?,?)', [a.key, a.source, JSON.stringify(stats), a.nowMs]);
  return { kind: 'ok', stats, cached: false };
}

/** Limpieza horaria: caché por encima del tope (las más antiguas) o caducada hace más de 2 días, y uso de más de 30 días. */
export function openingsCleanupStmts(nowMs: number): Stmt[] {
  return [
    { sql: 'DELETE FROM cp_openings_cache WHERE fetched_at < ?', params: [nowMs - 2 * TTL_MS] },
    { sql: `DELETE FROM cp_openings_cache WHERE rowid IN (SELECT rowid FROM cp_openings_cache ORDER BY fetched_at DESC LIMIT -1 OFFSET ${MAX_CACHE_ROWS})` },
    { sql: 'DELETE FROM cp_openings_usage WHERE day < ?', params: [dayOf(nowMs - USAGE_KEEP_DAYS * 86_400_000)] },
  ];
}
