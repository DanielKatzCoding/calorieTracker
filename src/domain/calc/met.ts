import type { Intensity } from '../types';

/** MET values for general resistance training by perceived intensity. */
export const RESISTANCE_MET: Record<Intensity, number> = { light: 3.5, moderate: 5, vigorous: 6 };

/** kcal = MET x 3.5 x kg / 200 per minute. */
export function kcalBurned(met: number, weightKg: number, minutes: number): number {
  if (met < 0 || weightKg < 0 || minutes < 0) throw new RangeError('inputs must be non-negative');
  return ((met * 3.5 * weightKg) / 200) * minutes;
}
