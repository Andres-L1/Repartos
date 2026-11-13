/**
 * Lectura del Elo de Lichess: primero rápidas y clásicas; si ninguno es fiable, blitz. Bullet y demás no cuentan.
 * Funciones puras: sin base de datos ni red. El nivel del alumno lo elige él (ver level.ts); esto solo describe lo visto.
 */
import type { PlacementPerf } from '../src/shared/api.js';
import type { Level } from '../src/types.js';

/** Partidas mínimas en un ritmo para fiarse de su Elo (además de no ser provisional). */
export const PLACEMENT_MIN_GAMES = 10;

export interface ValidPerf {
  rating: number;
  games: number;
  prov: boolean;
}

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

/** Valida estrictamente un perf de Lichess; null si falta o es sospechoso. Solo se leen rating, games, prov y rd. */
export function parsePerf(raw: unknown): ValidPerf | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const p = raw as Record<string, unknown>;
  if (!isInt(p.rating) || p.rating < 0 || p.rating > 4000) return null;
  if (!isInt(p.games) || p.games < 0 || p.games > 10_000_000) return null;
  if (p.prov !== undefined && typeof p.prov !== 'boolean') return null;
  if (p.rd !== undefined && (typeof p.rd !== 'number' || !Number.isFinite(p.rd) || p.rd < 0 || p.rd > 4000)) return null;
  return { rating: p.rating, games: p.games, prov: p.prov === true };
}

export const isReliable = (p: ValidPerf | null): p is ValidPerf => p !== null && !p.prov && p.games >= PLACEMENT_MIN_GAMES;

export interface PerfsInput {
  rapid?: unknown;
  classical?: unknown;
  blitz?: unknown;
  /** true si Lichess envió el objeto `perfs` (aunque venga vacío). Solo informativo. */
  present?: boolean;
}

export type SeenState = 'absent' | 'invalid' | 'provisional' | 'few_games' | 'reliable';
export interface SeenPerf {
  state: SeenState;
  rating?: number;
  games?: number;
}
/** Qué envió Lichess de cada ritmo y por qué cuenta o no para la colocación. */
export interface PerfsSeen {
  perfsPresent: boolean;
  rapid: SeenPerf;
  classical: SeenPerf;
  blitz: SeenPerf;
}

function describePerf(raw: unknown): SeenPerf {
  if (raw === undefined || raw === null) return { state: 'absent' };
  const p = parsePerf(raw);
  if (!p) return { state: 'invalid' };
  const state: SeenState = p.prov ? 'provisional' : p.games < PLACEMENT_MIN_GAMES ? 'few_games' : 'reliable';
  return { state, rating: p.rating, games: p.games };
}

export function describePerfs(perfs: PerfsInput | null | undefined): PerfsSeen {
  return {
    perfsPresent: perfs?.present === true,
    rapid: describePerf(perfs?.rapid), classical: describePerf(perfs?.classical),
    blitz: describePerf(perfs?.blitz),
  };
}

/** Lee el JSON guardado validando su forma; null si no es válido. */
export function parseSeen(json: string | null | undefined): PerfsSeen | null {
  try {
    const v = JSON.parse(json ?? '') as Record<string, unknown>;
    const STATES: SeenState[] = ['absent', 'invalid', 'provisional', 'few_games', 'reliable'];
    const one = (x: unknown): SeenPerf | null => {
      if (typeof x !== 'object' || x === null) return null;
      const o = x as Record<string, unknown>;
      if (!STATES.includes(o.state as SeenState)) return null;
      const out: SeenPerf = { state: o.state as SeenState };
      if (typeof o.rating === 'number' && Number.isInteger(o.rating)) out.rating = o.rating;
      if (typeof o.games === 'number' && Number.isInteger(o.games)) out.games = o.games;
      return out;
    };
    const rapid = one(v.rapid);
    const classical = one(v.classical);
    // JSON anteriores a blitz: se trata como ausente.
    const blitz = v.blitz === undefined ? ({ state: 'absent' } as SeenPerf) : one(v.blitz);
    if (!rapid || !classical || !blitz || typeof v.perfsPresent !== 'boolean') return null;
    return { perfsPresent: v.perfsPresent, rapid, classical, blitz };
  } catch {
    return null;
  }
}

export interface PlacementSelection {
  source: 'lichess' | 'none';
  perf: PlacementPerf | null;
  rating: number | null;
  games: number | null;
}

/**
 * Elige el mayor Elo fiable entre rápidas y clásicas (empate: rápidas). Si ninguno es fiable, usa blitz si es fiable.
 */
export function selectPerf(perfs: PerfsInput | null | undefined): PlacementSelection {
  const rapid = parsePerf(perfs?.rapid);
  const classical = parsePerf(perfs?.classical);
  const cands: [PlacementPerf, ValidPerf][] = [];
  if (isReliable(rapid)) cands.push(['rapid', rapid]);
  if (isReliable(classical)) cands.push(['classical', classical]);
  if (cands.length === 0) {
    const blitz = parsePerf(perfs?.blitz);
    if (isReliable(blitz)) return { source: 'lichess', perf: 'blitz', rating: blitz.rating, games: blitz.games };
    return { source: 'none', perf: null, rating: null, games: null };
  }
  const [perf, best] = cands.reduce((a, b) => (b[1].rating > a[1].rating ? b : a));
  return { source: 'lichess', perf, rating: best.rating, games: best.games };
}
