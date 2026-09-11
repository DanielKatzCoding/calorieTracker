import { KCAL_PER_KG } from './energy';

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export function bmiCategory(value: number): BmiCategory {
  if (value < 18.5) return 'underweight';
  if (value < 25) return 'normal';
  if (value < 30) return 'overweight';
  return 'obese';
}

/**
 * Weeks to reach the goal weight given the signed daily kcal change actually applied.
 * Null when there is no change to make or the delta points the wrong way.
 */
export function projectedWeeksToGoal(weightKg: number, goalWeightKg: number, deltaKcal: number): number | null {
  const diff = goalWeightKg - weightKg;
  if (Math.abs(diff) < 0.05 || deltaKcal === 0) return null;
  if (Math.sign(diff) !== Math.sign(deltaKcal)) return null;
  const kgPerWeek = (Math.abs(deltaKcal) * 7) / KCAL_PER_KG;
  return Math.abs(diff) / kgPerWeek;
}
