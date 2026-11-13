import type { Lesson, Unit } from '../src/content/schema.js';
import type { LessonStatus, MapUnit } from '../src/shared/api.js';

export interface ContentSource {
  units: Unit[];
}

export function findLesson(content: ContentSource, id: string): Lesson | undefined {
  for (const u of content.units) for (const l of u.lessons) if (l.id === id) return l;
  return undefined;
}

export interface ProgressRow {
  completed: boolean;
  bestScore: number;
}

/** Estado de cada lección y unidad según el progreso. */
export interface PlacementEffect {
  /** Unidades abiertas por colocación: todas sus lecciones 'available' (nunca 'completed': no se regala progreso). */
  openUnitIds: ReadonlySet<string>;
  recommendedUnitId: string | null;
}
const NO_PLACEMENT: PlacementEffect = { openUnitIds: new Set(), recommendedUnitId: null };

export function computeStatuses(
  units: Unit[],
  progress: Map<string, ProgressRow>,
  placement: PlacementEffect = NO_PLACEMENT,
): { unitStatus: Map<string, LessonStatus>; lessonStatus: Map<string, LessonStatus> } {
  const done = (id: string) => progress.get(id)?.completed === true;
  const unitDone = (u: Unit) => u.lessons.every((l) => done(l.id));
  const byId = new Map(units.map((u) => [u.id, u]));
  // Una unidad abierta por colocación también cuenta como cumplida para desbloquear la siguiente.
  const unlocked = (u: Unit) =>
    placement.openUnitIds.has(u.id) ||
    u.requires.every((r) => {
      const req = byId.get(r);
      return req !== undefined && (unitDone(req) || placement.openUnitIds.has(r));
    });

  const unitStatus = new Map<string, LessonStatus>();
  const lessonStatus = new Map<string, LessonStatus>();
  for (const u of units) {
    const open = unlocked(u);
    unitStatus.set(u.id, u.lessons.length > 0 && unitDone(u) ? 'completed' : open ? 'available' : 'locked');
    u.lessons.forEach((l, i) => {
      let s: LessonStatus;
      if (done(l.id)) s = 'completed';
      else if (l.demo) s = 'available'; // la demo es siempre accesible
      else if (placement.openUnitIds.has(u.id)) s = 'available';
      else if (open && (i === 0 || done(u.lessons[i - 1]!.id))) s = 'available';
      else s = 'locked';
      lessonStatus.set(l.id, s);
    });
  }
  return { unitStatus, lessonStatus };
}

export function buildMap(
  units: Unit[],
  progress: Map<string, ProgressRow>,
  placement: PlacementEffect = NO_PLACEMENT,
): MapUnit[] {
  const { unitStatus, lessonStatus } = computeStatuses(units, progress, placement);
  return units.map((u) => ({
    id: u.id,
    order: u.order,
    title: u.title,
    description: u.description,
    level: u.level,
    status: unitStatus.get(u.id)!,
    ...(placement.openUnitIds.has(u.id) ? { placedOpen: true } : {}),
    ...(placement.recommendedUnitId === u.id ? { recommended: true } : {}),
    lessons: u.lessons.map((l) => {
      const p = progress.get(l.id);
      return {
        id: l.id,
        title: l.title,
        objective: l.objective,
        demo: l.demo === true,
        status: lessonStatus.get(l.id)!,
        ...(p ? { bestScore: p.bestScore } : {}),
      };
    }),
  }));
}

export interface XpInput {
  correct: number;
  total: number;
  alreadyCompleted: boolean;
  passed: boolean;
}
export const REPEAT_XP = 2;
export function computeXp({ correct, total, alreadyCompleted, passed }: XpInput): number {
  if (!passed) return 0;
  if (alreadyCompleted) return REPEAT_XP;
  return 10 + 5 * correct + (correct === total ? 5 : 0);
}

export function passMarkFor(lesson: Lesson, total: number): number {
  return lesson.passMark ?? Math.max(1, total - 1);
}

export const dayOf = (d: Date): string => d.toISOString().slice(0, 10);
export const yesterdayOf = (d: Date): string => dayOf(new Date(d.getTime() - 86_400_000));
