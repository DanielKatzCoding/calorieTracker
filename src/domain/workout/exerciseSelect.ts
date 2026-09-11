import type { Equipment, Exercise, Level, MovementPattern } from '../types';
import type { Rng } from '../random';

export const LEVEL_RANK: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };

export function canPerform(exercise: Exercise, equipment: Equipment, level: Level): boolean {
  return exercise.equipment.includes(equipment) && LEVEL_RANK[exercise.minLevel] <= LEVEL_RANK[level];
}

/**
 * Picks an exercise for a movement pattern. Prefers the hardest variant the person qualifies for,
 * avoids `exclude` (same session / previous session) when any alternative exists, seeded tie-break.
 */
export function selectExercise(
  pool: readonly Exercise[],
  pattern: MovementPattern,
  equipment: Equipment,
  level: Level,
  exclude: ReadonlySet<string>,
  rng: Rng,
): Exercise | null {
  const fits = pool.filter((e) => e.pattern === pattern && canPerform(e, equipment, level));
  if (fits.length === 0) return null;
  const fresh = fits.filter((e) => !exclude.has(e.id));
  const candidates = fresh.length > 0 ? fresh : fits;
  const top = Math.max(...candidates.map((e) => LEVEL_RANK[e.minLevel]));
  // Hardest tier, but let the tier below in too so sessions vary a little.
  const tier = candidates.filter((e) => LEVEL_RANK[e.minLevel] >= top - (candidates.length > 3 ? 1 : 0));
  return tier[Math.floor(rng() * tier.length)]!;
}
