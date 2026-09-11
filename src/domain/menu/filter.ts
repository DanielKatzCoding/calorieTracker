import type { Allergen, Cuisine, DietPattern, FoodItem, MealSlot, ResolvedRecipe } from '../types';
import type { Rng } from '../random';

/** Hard constraints. These are never relaxed by the generator. */
export interface Constraints {
  diet: DietPattern;
  allergens: Allergen[];
  dislikedFoodIds: string[];
}

export function dietAllows(c: Pick<Constraints, 'diet'>, recipe: Pick<ResolvedRecipe, 'diets' | 'ketoFriendly'>): boolean {
  return c.diet === 'keto' ? recipe.ketoFriendly : recipe.diets.includes(c.diet);
}

export function allergenFree(allergens: Allergen[], itemAllergens: Allergen[]): boolean {
  return !itemAllergens.some((a) => allergens.includes(a));
}

/** Slot-independent check: diet, allergens and disliked ingredients. */
export function matchesConstraints(recipe: ResolvedRecipe, c: Constraints): boolean {
  if (!dietAllows(c, recipe)) return false;
  if (!allergenFree(c.allergens, recipe.allergens)) return false;
  if (recipe.ingredients.some((i) => c.dislikedFoodIds.includes(i.foodId))) return false;
  return true;
}

export function isEligible(recipe: ResolvedRecipe, slot: MealSlot, c: Constraints): boolean {
  return recipe.slots.includes(slot) && matchesConstraints(recipe, c);
}

export function eligibleRecipes(recipes: readonly ResolvedRecipe[], slot: MealSlot, c: Constraints): ResolvedRecipe[] {
  return recipes.filter((r) => isEligible(r, slot, c));
}

/** Single foods a person can eat, used for the "simple plate" fallback and diary suggestions. */
export function foodAllowed(food: FoodItem, c: Constraints): boolean {
  const dietOk = c.diet === 'keto' ? !!food.ketoFriendly : food.diets.includes(c.diet);
  return dietOk && allergenFree(c.allergens, food.allergens) && !c.dislikedFoodIds.includes(food.id);
}

export interface ScoringContext {
  cuisines: Cuisine[];
  /** Recipe ids used in the last couple of days; penalised for variety. */
  recentRecipeIds: readonly string[];
  rng: Rng;
}

export const CUISINE_BONUS = 2;
export const RECENT_PENALTY = 3;
export const JITTER = 1;

/** Soft preference score; higher is better. Never affects eligibility. */
export function scoreRecipe(recipe: ResolvedRecipe, ctx: ScoringContext): number {
  let score = 0;
  if (recipe.cuisine === 'neutral' || ctx.cuisines.length === 0 || ctx.cuisines.includes(recipe.cuisine)) {
    score += CUISINE_BONUS;
  }
  if (ctx.recentRecipeIds.includes(recipe.id)) score -= RECENT_PENALTY;
  score += ctx.rng() * JITTER;
  return score;
}

export function rankRecipes(recipes: readonly ResolvedRecipe[], ctx: ScoringContext): ResolvedRecipe[] {
  return recipes
    .map((r) => ({ r, s: scoreRecipe(r, ctx) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.r);
}
