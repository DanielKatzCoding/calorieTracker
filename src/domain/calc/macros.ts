import type { DietPattern, GoalType, Macros } from '../types';

export const PROTEIN_G_PER_KG: Record<GoalType, number> = { lose: 2.0, maintain: 1.6, gain: 1.8 };
const MIN_PROTEIN_G_PER_KG = 1.6;
const MIN_CARBS_G = 50;
const KETO_CARBS_G = 30;
const KETO_PROTEIN_G_PER_KG = 1.6;

export interface MacroInput {
  targetKcal: number;
  weightKg: number;
  goalWeightKg: number;
  goal: GoalType;
  diet: DietPattern;
}

/** Body weight used for protein: goal weight when far above it, to avoid absurd protein targets. */
export function proteinBasisKg(weightKg: number, goalWeightKg: number): number {
  return weightKg > goalWeightKg + 15 ? goalWeightKg : weightKg;
}

function assemble(targetKcal: number, proteinG: number, fatG: number): Macros {
  const carbsG = Math.max(0, (targetKcal - proteinG * 4 - fatG * 9) / 4);
  return {
    kcal: Math.round(targetKcal),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
  };
}

export function macroSplit({ targetKcal, weightKg, goalWeightKg, goal, diet }: MacroInput): Macros {
  if (targetKcal <= 0) throw new RangeError('targetKcal must be positive');
  const basis = proteinBasisKg(weightKg, goalWeightKg);

  if (diet === 'keto') {
    const proteinG = basis * KETO_PROTEIN_G_PER_KG;
    const fatG = Math.max(0, (targetKcal - KETO_CARBS_G * 4 - proteinG * 4) / 9);
    return {
      kcal: Math.round(targetKcal),
      proteinG: Math.round(proteinG),
      carbsG: KETO_CARBS_G,
      fatG: Math.round(fatG),
    };
  }

  let proteinG = basis * PROTEIN_G_PER_KG[goal];
  let fatPct = goal === 'gain' ? 0.25 : 0.3;
  const carbsFor = (p: number, f: number) => (targetKcal - p * 4 - (targetKcal * f)) / 4;

  if (carbsFor(proteinG, fatPct) < MIN_CARBS_G) fatPct = 0.2;
  if (carbsFor(proteinG, fatPct) < MIN_CARBS_G) proteinG = Math.min(proteinG, basis * MIN_PROTEIN_G_PER_KG);

  return assemble(targetKcal, proteinG, (targetKcal * fatPct) / 9);
}

export function macroKcal(m: Pick<Macros, 'proteinG' | 'carbsG' | 'fatG'>): number {
  return m.proteinG * 4 + m.carbsG * 4 + m.fatG * 9;
}
