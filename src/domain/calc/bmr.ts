import type { Sex } from '../types';

export interface BmrInput {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}

/** Mifflin-St Jeor resting energy expenditure (kcal/day). */
export function mifflinStJeor({ sex, weightKg, heightCm, age }: BmrInput): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
    throw new RangeError('weight, height and age must be positive');
  }
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}
