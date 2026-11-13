/**
 * Colocación inicial según el Elo de Lichess (solo partidas RÁPIDAS y CLÁSICAS; blitz y bullet no cuentan).
 * Funciones puras: sin base de datos ni red.
 *
 * El mapeo rating -> unidades vive en UNA constante (PLACEMENT_BANDS) y se resuelve por `unit.level` y orden,
 * no por ids fijos, para que siga valiendo cuando crezca el contenido.
 */
import type { Unit } from '../src/content/schema.js';
import type { PlacementPerf } from '../src/shared/api.js';
import type { Level } from '../src/types.js';

/** Partidas mínimas en un ritmo para fiarse de su Elo (además de no ser provisional). */
export const PLACEMENT_MIN_GAMES = 10;

export interface PlacementBand {
  /** Elo mínimo (inclusive) de la banda. Gana la banda con mayor minRating que cumpla. */
  minRating: number;
  /** Niveles cuyas unidades se abren como repaso, o 'all' para todo el contenido. */
  open: readonly Level[] | 'all';
  /** Unidad recomendada: la `index`-ésima (por orden, desde 0) del nivel `level`. */
  recommend: { level: Level; index: number };
}

/**
 * CALIBRACIÓN INICIAL: estos umbrales son una estimación a ajustar con datos reales (por ejemplo, comparando el Elo
 * de Lichess con el rendimiento en las evaluaciones). Mantener ordenadas por minRating ascendente.
 *  - <1000: empieza por la primera unidad, nada de repaso.
 *  - 1000-1399: unidades 'beginner' abiertas como repaso; recomendada la primera 'initiation'.
 *  - >=1400: todo el contenido actual (0-800) abierto como repaso; recomendada la segunda 'initiation' (tácticas).
 * Al añadir contenido (basic, intermediate...) se añaden bandas o se cambian `open`/`recommend` aquí.
 */
export const PLACEMENT_BANDS: readonly PlacementBand[] = [
  { minRating: 0, open: [], recommend: { level: 'beginner', index: 0 } },
  { minRating: 1000, open: ['beginner'], recommend: { level: 'initiation', index: 0 } },
  { minRating: 1400, open: 'all', recommend: { level: 'initiation', index: 1 } },
];

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
}

function describePerf(raw: unknown): SeenPerf {
  if (raw === undefined || raw === null) return { state: 'absent' };
  const p = parsePerf(raw);
  if (!p) return { state: 'invalid' };
  const state: SeenState = p.prov ? 'provisional' : p.games < PLACEMENT_MIN_GAMES ? 'few_games' : 'reliable';
  return { state, rating: p.rating, games: p.games };
}

export function describePerfs(perfs: PerfsInput | null | undefined): PerfsSeen {
  return { perfsPresent: perfs?.present === true, rapid: describePerf(perfs?.rapid), classical: describePerf(perfs?.classical) };
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
    if (!rapid || !classical || typeof v.perfsPresent !== 'boolean') return null;
    return { perfsPresent: v.perfsPresent, rapid, classical };
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

/** Elige el mayor Elo fiable entre rápidas y clásicas (empate: rápidas). */
export function selectPerf(perfs: PerfsInput | null | undefined): PlacementSelection {
  const rapid = parsePerf(perfs?.rapid);
  const classical = parsePerf(perfs?.classical);
  const cands: [PlacementPerf, ValidPerf][] = [];
  if (isReliable(rapid)) cands.push(['rapid', rapid]);
  if (isReliable(classical)) cands.push(['classical', classical]);
  if (cands.length === 0) return { source: 'none', perf: null, rating: null, games: null };
  const [perf, best] = cands.reduce((a, b) => (b[1].rating > a[1].rating ? b : a));
  return { source: 'lichess', perf, rating: best.rating, games: best.games };
}

export interface PlacementPlan {
  recommendedUnitId: string | null;
  /** Unidades con todas sus lecciones disponibles (repaso). Puede incluir la recomendada. */
  openUnitIds: string[];
}

export function bandFor(rating: number): PlacementBand {
  let band = PLACEMENT_BANDS[0]!;
  for (const b of PLACEMENT_BANDS) if (rating >= b.minRating) band = b;
  return band;
}

/** Plan de colocación para un Elo fiable ya validado (null = sin Elo: sin efectos). */
export function planForRating(rating: number | null, content: { units: Unit[] }): PlacementPlan {
  const units = [...content.units].sort((a, b) => a.order - b.order);
  if (rating === null || units.length === 0) return { recommendedUnitId: null, openUnitIds: [] };
  const band = bandFor(rating);
  const open = units.filter((u) => band.open === 'all' || band.open.includes(u.level));
  const openIds = new Set(open.map((u) => u.id));

  const ofLevel = units.filter((u) => u.level === band.recommend.level);
  let rec: Unit | undefined = ofLevel[Math.min(band.recommend.index, ofLevel.length - 1)];
  // Contenido insuficiente para esa banda: primera unidad no abierta; si no hay, la última.
  rec ??= units.find((u) => !openIds.has(u.id)) ?? units[units.length - 1];
  return { recommendedUnitId: rec?.id ?? null, openUnitIds: open.map((u) => u.id) };
}

export interface PlacementResult extends PlacementSelection, PlacementPlan {}

/** Entrada completa: perfs de Lichess (sin validar) + contenido -> colocación. */
export function computePlacement(perfs: PerfsInput | null | undefined, content: { units: Unit[] }): PlacementResult {
  const sel = selectPerf(perfs);
  return { ...sel, ...planForRating(sel.rating, content) };
}
