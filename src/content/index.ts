import type { Lesson, Unit } from './schema.js';
import { unit as u01 } from './units/u01.js';
import { unit as u02 } from './units/u02.js';
import { unit as u03 } from './units/u03.js';
import { unit as u04 } from './units/u04.js';
import { unit as u05 } from './units/u05.js';
import { unit as u06 } from './units/u06.js';
import { unit as u07 } from './units/u07.js';
import { unit as u08 } from './units/u08.js';
import { unit as u09 } from './units/u09.js';
import { unit as u10 } from './units/u10.js';
import { unit as u11 } from './units/u11.js';
import { unit as u12 } from './units/u12.js';
import { unit as u13 } from './units/u13.js';
import { unit as u14 } from './units/u14.js';

export const UNITS: Unit[] = [u01, u02, u03, u04, u05, u06, u07, u08, u09, u10, u11, u12, u13, u14].sort((a, b) => a.order - b.order);
export const LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons);
export const getLesson = (id: string): Lesson | undefined => LESSONS.find((l) => l.id === id);
export const getUnit = (id: string): Unit | undefined => UNITS.find((u) => u.id === id);

export const lessonsForConcept = (conceptId: string): { id: string; title: string }[] =>
  LESSONS.filter((l) => l.conceptIds?.includes(conceptId)).map((l) => ({ id: l.id, title: l.title }));
