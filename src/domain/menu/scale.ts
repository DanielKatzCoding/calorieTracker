import type { Macros, ResolvedRecipe } from '../types';
import { scaleMacros } from './nutrition';

export const MIN_SCALE = 0.5;
export const MAX_SCALE = 2;
export const SCALE_STEP = 0.25;
export const SCALES: readonly number[] = Array.from(
  { length: Math.round((MAX_SCALE - MIN_SCALE) / SCALE_STEP) + 1 },
  (_, i) => MIN_SCALE + i * SCALE_STEP,
);

/** Portion factor in [0.5, 2] (step 0.25) whose energy is closest to the target. */
export function bestScale(recipeKcal: number, targetKcal: number): number {
  if (recipeKcal <= 0) return 1;
  let best = SCALES[0]!;
  let bestErr = Infinity;
  for (const s of SCALES) {
    const err = Math.abs(recipeKcal * s - targetKcal);
    if (err < bestErr) {
      bestErr = err;
      best = s;
    }
  }
  return best;
}

export const PROTEIN_WEIGHT = 0.5;

/** Lower is better: relative kcal miss plus a penalty for falling short of the slot's protein. */
export function mealCost(macros: Macros, targetKcal: number, targetProteinG: number): number {
  const kcalErr = Math.abs(macros.kcal - targetKcal) / targetKcal;
  const proteinShort = Math.max(0, targetProteinG - macros.proteinG) / Math.max(targetProteinG, 1);
  return kcalErr + PROTEIN_WEIGHT * proteinShort;
}

export interface ScaledChoice {
  recipe: ResolvedRecipe;
  scale: number;
  macros: Macros;
  cost: number;
}

export function scaleRecipe(recipe: ResolvedRecipe, scale: number): Macros {
  return scaleMacros(recipe.macros, scale);
}

/** Picks the candidate (already ranked by preference) whose best portion fits the slot best. */
export function chooseMeal(
  ranked: readonly ResolvedRecipe[],
  targetKcal: number,
  targetProteinG: number,
  maxCandidates = 8,
): ScaledChoice | null {
  let best: ScaledChoice | null = null;
  for (const recipe of ranked.slice(0, maxCandidates)) {
    const scale = bestScale(recipe.macros.kcal, targetKcal);
    const macros = scaleRecipe(recipe, scale);
    const cost = mealCost(macros, targetKcal, targetProteinG);
    if (!best || cost < best.cost) best = { recipe, scale, macros, cost };
  }
  return best;
}
