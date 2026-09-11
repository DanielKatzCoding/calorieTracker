import type { Level, MovementPattern } from '../types';

export interface DayTemplate {
  name: string;
  focus: string;
  /** Ordered movement slots; compounds first. Trimmed to the level's exercise count. */
  patterns: MovementPattern[];
}

/** Exercises per session by experience. */
export const EXERCISES_PER_DAY: Record<Level, number> = { beginner: 5, intermediate: 6, advanced: 7 };

const FULL_A: DayTemplate = { name: 'Full Body A', focus: 'Squat + push + pull', patterns: ['squat', 'h_push', 'h_pull', 'hinge', 'core', 'v_push', 'lunge'] };
const FULL_B: DayTemplate = { name: 'Full Body B', focus: 'Hinge + overhead + vertical pull', patterns: ['hinge', 'v_push', 'v_pull', 'lunge', 'core', 'h_push', 'carry'] };
const FULL_C: DayTemplate = { name: 'Full Body C', focus: 'Squat + push + pull, single-leg', patterns: ['squat', 'h_pull', 'h_push', 'hinge', 'core', 'v_pull', 'carry'] };
const UPPER: DayTemplate = { name: 'Upper', focus: 'Chest, back, shoulders, arms', patterns: ['h_push', 'h_pull', 'v_push', 'v_pull', 'core', 'h_push', 'h_pull'] };
const LOWER: DayTemplate = { name: 'Lower', focus: 'Quads, glutes, hamstrings', patterns: ['squat', 'hinge', 'lunge', 'core', 'carry', 'squat', 'hinge'] };
const PUSH: DayTemplate = { name: 'Push', focus: 'Chest, shoulders, triceps', patterns: ['h_push', 'v_push', 'h_push', 'v_push', 'core', 'h_push', 'core'] };
const PULL: DayTemplate = { name: 'Pull', focus: 'Back, biceps, rear delts', patterns: ['h_pull', 'v_pull', 'h_pull', 'v_pull', 'core', 'h_pull', 'carry'] };
const LEGS: DayTemplate = { name: 'Legs', focus: 'Quads, glutes, hamstrings', patterns: ['squat', 'hinge', 'lunge', 'hinge', 'core', 'squat', 'carry'] };

export const MIN_DAYS = 1;
export const MAX_DAYS = 6;

/** Weekly split by training days: full body up to 3, upper/lower at 4, then hybrids of push/pull/legs. */
export function splitFor(daysPerWeek: number, level: Level): DayTemplate[] {
  const n = Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(daysPerWeek)));
  const base: DayTemplate[] =
    n === 1 ? [FULL_A]
    : n === 2 ? [FULL_A, FULL_B]
    : n === 3 ? [FULL_A, FULL_B, FULL_C]
    : n === 4 ? [UPPER, LOWER, UPPER, LOWER]
    : n === 5 ? [UPPER, LOWER, PUSH, PULL, LEGS]
    : [PUSH, PULL, LEGS, PUSH, PULL, LEGS];
  const count = EXERCISES_PER_DAY[level];
  return base.map((d, i) => ({
    ...d,
    name: base.filter((x) => x.name === d.name).length > 1 ? `${d.name} ${base.slice(0, i + 1).filter((x) => x.name === d.name).length}` : d.name,
    patterns: d.patterns.slice(0, count),
  }));
}
