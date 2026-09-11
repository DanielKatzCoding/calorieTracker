import type { Exercise, Level, Prescription } from '../types';

const COMPOUND_PATTERNS = new Set(['squat', 'hinge', 'h_push', 'h_pull', 'v_push', 'v_pull']);

/** Sets, rep range and rest by level; the first slots of a session count as its compounds. */
export function prescribe(exercise: Exercise, level: Level, slotIndex: number): Prescription {
  const base = { exerciseId: exercise.id };
  if (exercise.timed) {
    const holds: Record<Level, [number, number]> = { beginner: [20, 40], intermediate: [30, 60], advanced: [45, 90] };
    const [repMin, repMax] = holds[level];
    return { ...base, sets: 3, repMin, repMax, restSec: 60, timed: true };
  }
  if (exercise.bodyweight) {
    const reps: Record<Level, [number, number]> = { beginner: [8, 12], intermediate: [10, 15], advanced: [12, 20] };
    const [repMin, repMax] = reps[level];
    return { ...base, sets: 3, repMin, repMax, restSec: level === 'beginner' ? 75 : 60 };
  }
  const compound = slotIndex < 2 && COMPOUND_PATTERNS.has(exercise.pattern);
  switch (level) {
    case 'beginner':
      return { ...base, sets: 3, repMin: 10, repMax: 12, restSec: 75 };
    case 'intermediate':
      return compound
        ? { ...base, sets: 4, repMin: 8, repMax: 12, restSec: 90 }
        : { ...base, sets: 3, repMin: 10, repMax: 12, restSec: 75 };
    case 'advanced':
      return compound
        ? { ...base, sets: 4, repMin: 6, repMax: 10, restSec: 120 }
        : { ...base, sets: 3, repMin: 10, repMax: 15, restSec: 75 };
  }
}

const SECONDS_PER_SET = 45;
const WARMUP_MIN = 5;

export function estimateMinutes(prescriptions: readonly Prescription[]): number {
  const work = prescriptions.reduce((s, p) => s + p.sets * (SECONDS_PER_SET + p.restSec), 0);
  return Math.round(work / 60) + WARMUP_MIN;
}
