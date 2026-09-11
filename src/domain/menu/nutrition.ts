import type { Allergen, DietPattern, FoodItem, Macros, Recipe, ResolvedRecipe } from '../types';

export const ALL_DIETS: DietPattern[] = ['omnivore', 'pescatarian', 'vegetarian', 'vegan', 'keto'];
/** A recipe is keto-friendly when every ingredient is and the whole dish stays under this many carbs. */
export const KETO_MAX_CARBS_PER_RECIPE_G = 15;

export const ZERO_MACROS: Macros = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    kcal: a.kcal + b.kcal,
    proteinG: a.proteinG + b.proteinG,
    carbsG: a.carbsG + b.carbsG,
    fatG: a.fatG + b.fatG,
  };
}

export function scaleMacros(m: Macros, factor: number): Macros {
  return {
    kcal: m.kcal * factor,
    proteinG: m.proteinG * factor,
    carbsG: m.carbsG * factor,
    fatG: m.fatG * factor,
  };
}

export function roundMacros(m: Macros): Macros {
  return {
    kcal: Math.round(m.kcal),
    proteinG: Math.round(m.proteinG * 10) / 10,
    carbsG: Math.round(m.carbsG * 10) / 10,
    fatG: Math.round(m.fatG * 10) / 10,
  };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(addMacros, ZERO_MACROS);
}

/** Macros for `grams` of a food. */
export function macrosForGrams(food: FoodItem, grams: number): Macros {
  return scaleMacros(food.per100g, grams / 100);
}

export class MissingFoodError extends Error {
  constructor(public readonly recipeId: string, public readonly foodId: string) {
    super(`recipe "${recipeId}" references unknown food "${foodId}"`);
  }
}

/** Derives a recipe's nutrition, allergens and diet compatibility from its ingredients. */
export function resolveRecipe(recipe: Recipe, foodsById: ReadonlyMap<string, FoodItem>): ResolvedRecipe {
  let macros = ZERO_MACROS;
  let totalGrams = 0;
  const allergens = new Set<Allergen>(recipe.extraAllergens ?? []);
  let diets = new Set<DietPattern>(ALL_DIETS.filter((d) => d !== 'keto'));
  let allKeto = true;

  for (const ing of recipe.ingredients) {
    const food = foodsById.get(ing.foodId);
    if (!food) throw new MissingFoodError(recipe.id, ing.foodId);
    macros = addMacros(macros, macrosForGrams(food, ing.grams));
    totalGrams += ing.grams;
    for (const a of food.allergens) allergens.add(a);
    diets = new Set([...diets].filter((d) => food.diets.includes(d)));
    if (!food.ketoFriendly) allKeto = false;
  }

  const ketoFriendly = allKeto && macros.carbsG <= KETO_MAX_CARBS_PER_RECIPE_G;
  return {
    ...recipe,
    macros,
    totalGrams,
    allergens: [...allergens].sort(),
    diets: [...diets].sort(),
    ketoFriendly,
  };
}

export function indexById<T extends { id: string }>(items: readonly T[]): Map<string, T> {
  return new Map(items.map((i) => [i.id, i]));
}
