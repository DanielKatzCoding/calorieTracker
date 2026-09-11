import type { Allergen, DietPattern, FoodCategory, FoodItem } from '@/domain/types';

/**
 * Who can eat it:
 *  vegan -> everyone; veg -> contains dairy/eggs/honey; fish -> seafood; meat -> meat/poultry.
 */
export type FoodKind = 'vegan' | 'veg' | 'fish' | 'meat';

export const KIND_DIETS: Record<FoodKind, DietPattern[]> = {
  vegan: ['vegan', 'vegetarian', 'pescatarian', 'omnivore'],
  veg: ['vegetarian', 'pescatarian', 'omnivore'],
  fish: ['pescatarian', 'omnivore'],
  meat: ['omnivore'],
};

/** Foods at or below this many carbs per 100 g count as keto-friendly unless overridden. */
export const KETO_CARBS_PER_100G = 5;

export interface FoodOpts {
  /** [grams, label] for a typical serving. */
  s?: [number, string];
  a?: Allergen[];
  /** Override the automatic keto rule (e.g. berries, nuts, spices used in small amounts). */
  k?: boolean;
}

export function f(
  id: string,
  name: string,
  category: FoodCategory,
  kcal: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  kind: FoodKind,
  opts: FoodOpts = {},
): FoodItem {
  const item: FoodItem = {
    id,
    name,
    category,
    per100g: { kcal, proteinG, carbsG, fatG },
    allergens: opts.a ?? [],
    diets: KIND_DIETS[kind],
    ketoFriendly: opts.k ?? carbsG <= KETO_CARBS_PER_100G,
  };
  if (opts.s) {
    item.servingG = opts.s[0];
    item.servingLabel = opts.s[1];
  }
  return item;
}
