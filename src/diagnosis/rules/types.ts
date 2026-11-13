import type { Diagnosis } from '../../types.js';
import type { Ctx } from '../chess-utils.js';

export type Rule = (ctx: Ctx) => Diagnosis | null;
