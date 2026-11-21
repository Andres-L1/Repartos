/**
 * Los 6 niveles del alumno, su rango de Elo y la sugerencia a partir de lo que Lichess envió.
 * Módulo puro (sin node:) compartido por worker y web. El alumno elige; esto solo sugiere.
 * Los rangos son Elo de LICHESS en rápidas (no FIDE). Calibración con la distribución real del 2026-11-21 en
 * docs/calibracion-niveles-2026-11.md: 800, 1100, 1400, 1700 y 2000 en rápidas son los percentiles 7, 27, 54, 79 y 95.
 * El mínimo de Lichess es 400, así que por Elo solo se sugiere desde Iniciación; Principiante se elige a mano.
 */
import type { Level } from '../types.js';
import type { PlacementSeen, SeenPerf } from './api.js';

export interface LevelInfo {
  id: Level;
  label: string;
  /** Elo mínimo (inclusive). */
  minElo: number;
  /** Elo máximo (exclusivo). */
  maxElo: number;
  blurb: string;
}

export const LEVELS: readonly LevelInfo[] = [
  { id: 'beginner', label: 'Principiante', minElo: 0, maxElo: 400, blurb: 'Reglas y fundamentos' },
  { id: 'initiation', label: 'Iniciación', minElo: 400, maxElo: 800, blurb: 'Tácticas y principios básicos' },
  { id: 'basic', label: 'Básico', minElo: 800, maxElo: 1100, blurb: 'Cálculo y comprensión' },
  { id: 'intermediate', label: 'Intermedio', minElo: 1100, maxElo: 1400, blurb: 'Estrategia y planificación' },
  { id: 'advanced', label: 'Avanzado', minElo: 1400, maxElo: 1700, blurb: 'Profundización técnica' },
  { id: 'competitive', label: 'Competitivo', minElo: 1700, maxElo: 2000, blurb: 'Rendimiento y preparación' },
];

/** Nivel de un Elo; 2000 o más es Competitivo. */
export function levelForRating(rating: number): Level {
  let level: Level = LEVELS[0]!.id;
  for (const l of LEVELS) if (rating >= l.minElo) level = l.id;
  return level;
}

/** Rango de un nivel para mostrar: Elo de Lichess en rápidas. Principiante no tiene (Lichess no baja de 400). */
export function eloRange(l: LevelInfo): string {
  if (l.id === 'beginner') return 'sin Elo todavía';
  return l.id === 'competitive' ? `${l.minElo} o más` : `${l.minElo} a ${l.maxElo}`;
}

export interface LevelHint {
  perf: 'rapid' | 'classical' | 'blitz';
  rating: number;
  games: number;
  level: Level;
}

/** Partidas mínimas para que un Elo provisional dé una pista (menos que PROVISIONAL_MIN_GAMES). */
export const HINT_MIN_GAMES = 10;
/**
 * Partidas mínimas para que un Elo provisional cuente como fiable. Lichess lo marca provisional con desviación > 110
 * (±220 puntos al 95 %), cosa que también le pasa a quien vuelve tras mucho tiempo sin jugar, aunque tenga cientos de partidas.
 */
export const PROVISIONAL_MIN_GAMES = 30;

const PERFS = ['rapid', 'classical', 'blitz'] as const;
const hasRating = (p: SeenPerf): p is SeenPerf & { rating: number } => typeof p.rating === 'number';

export function suggestLevel(seen: PlacementSeen | null): { level: Level | null; hint: LevelHint | null } {
  if (!seen) return { level: null, hint: null };
  let best = -1;
  for (const k of PERFS) {
    const p = seen[k];
    const counts = p.state === 'reliable' || (p.state === 'provisional' && (p.games ?? 0) >= PROVISIONAL_MIN_GAMES);
    if (counts && hasRating(p) && p.rating > best) best = p.rating;
  }
  if (best < 0) return { level: null, hint: null };
  const level = levelForRating(best);
  let hint: LevelHint | null = null;
  for (const k of PERFS) {
    const p = seen[k];
    const g = p.games ?? 0;
    if (p.state !== 'provisional' || !hasRating(p) || g < HINT_MIN_GAMES || g >= PROVISIONAL_MIN_GAMES || p.rating <= best) continue;
    const lv = levelForRating(p.rating);
    if (lv === level) continue; // la pista solo vale si apunta a un nivel superior
    if (!hint || p.rating > hint.rating) hint = { perf: k, rating: p.rating, games: p.games ?? 0, level: lv };
  }
  return { level, hint };
}
