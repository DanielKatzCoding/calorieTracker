import type { ActivityLevel, GoalType, Pace, Sex } from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

/** Approximate energy content of 1 kg of body fat. */
export const KCAL_PER_KG = 7700;

export const SEX_FLOOR_KCAL: Record<Sex, number> = { female: 1200, male: 1500 };

export function tdee(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activity];
}

/** Daily kcal change needed for a weekly pace in kg. */
export function dailyDelta(pace: Pace): number {
  return (pace * KCAL_PER_KG) / 7;
}

export interface CalorieTargetInput {
  bmr: number;
  tdee: number;
  sex: Sex;
  goal: GoalType;
  pace: Pace;
}

export interface CalorieTargetResult {
  target: number;
  /** Signed daily change applied after the floor. */
  deltaKcal: number;
  floorApplied: boolean;
}

/** Applies the goal delta and a safety floor (never below 1200 F / 1500 M or 90% of BMR). */
export function calorieTarget({ bmr, tdee: total, sex, goal, pace }: CalorieTargetInput): CalorieTargetResult {
  if (goal === 'maintain') return { target: total, deltaKcal: 0, floorApplied: false };
  const delta = dailyDelta(pace);
  if (goal === 'gain') return { target: total + delta, deltaKcal: delta, floorApplied: false };

  const floor = Math.max(SEX_FLOOR_KCAL[sex], bmr * 0.9);
  const raw = total - delta;
  if (raw >= floor) return { target: raw, deltaKcal: -delta, floorApplied: false };
  // The floor can exceed TDEE for very small/sedentary people; never prescribe a surplus when losing.
  const target = Math.min(floor, total);
  return { target, deltaKcal: target - total, floorApplied: true };
}
