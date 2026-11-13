/**
 * Los 6 niveles del alumno, su rango de Elo y la sugerencia a partir de lo que Lichess envió.
 * Módulo puro (sin node:) compartido por worker y web. El alumno elige; esto solo sugiere.
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

export interface LevelHint {
  perf: 'rapid' | 'classical' | 'blitz';
  rating: number;
  games: number;
  level: Level;
}

/** Partidas mínimas para que un Elo provisional merezca una pista. */
export const HINT_MIN_GAMES = 30;

const PERFS = ['rapid', 'classical', 'blitz'] as const;
const hasRating = (p: SeenPerf): p is SeenPerf & { rating: number } => typeof p.rating === 'number';

export function suggestLevel(seen: PlacementSeen | null): { level: Level | null; hint: LevelHint | null } {
  if (!seen) return { level: null, hint: null };
  let best = -1;
  for (const k of PERFS) {
    const p = seen[k];
    if (p.state === 'reliable' && hasRating(p) && p.rating > best) best = p.rating;
  }
  if (best < 0) return { level: null, hint: null };
  const level = levelForRating(best);
  let hint: LevelHint | null = null;
  for (const k of PERFS) {
    const p = seen[k];
    if (p.state !== 'provisional' || !hasRating(p) || (p.games ?? 0) < HINT_MIN_GAMES || p.rating <= best) continue;
    const lv = levelForRating(p.rating);
    if (lv === level) continue; // la pista solo vale si apunta a un nivel superior
    if (!hint || p.rating > hint.rating) hint = { perf: k, rating: p.rating, games: p.games ?? 0, level: lv };
  }
  return { level, hint };
}
