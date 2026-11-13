import type { Lesson, Unit } from './schema.js';
import { unit as u01 } from './units/u01.js';
import { unit as u02 } from './units/u02.js';
import { unit as u03 } from './units/u03.js';
import { unit as u04 } from './units/u04.js';
import { unit as u05 } from './units/u05.js';
import { unit as u06 } from './units/u06.js';

export const UNITS: Unit[] = [u01, u02, u03, u04, u05, u06].sort((a, b) => a.order - b.order);
export const LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons);
export const getLesson = (id: string): Lesson | undefined => LESSONS.find((l) => l.id === id);
export const getUnit = (id: string): Unit | undefined => UNITS.find((u) => u.id === id);

export const lessonsForConcept = (conceptId: string): { id: string; title: string }[] =>
  LESSONS.filter((l) => l.conceptIds?.includes(conceptId)).map((l) => ({ id: l.id, title: l.title }));
