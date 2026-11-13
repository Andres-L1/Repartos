/**
 * Efecto en el mapa del nivel elegido por el alumno. Función pura: se resuelve por `unit.level` y orden, sin ids fijos.
 */
import type { Unit } from '../src/content/schema.js';
import { LEVELS } from '../src/shared/levels.js';
import type { Level } from '../src/types.js';

export interface LevelPlan {
  /** Unidades abiertas como repaso (todas sus lecciones disponibles, sin XP). */
  openUnitIds: string[];
  recommendedUnitId: string | null;
  /** El nivel elegido aún no tiene contenido. */
  comingSoon: boolean;
}

export function levelPlan(level: Level, content: { units: Unit[] }): LevelPlan {
  const units = [...content.units].sort((a, b) => a.order - b.order);
  const rank = (l: Level) => LEVELS.findIndex((x) => x.id === l);
  const chosen = rank(level);
  const first = units.find((u) => u.level === level);
  if (!first) return { openUnitIds: units.map((u) => u.id), recommendedUnitId: null, comingSoon: true };
  return {
    openUnitIds: units.filter((u) => rank(u.level) < chosen).map((u) => u.id),
    recommendedUnitId: first.id,
    comingSoon: false,
  };
}
