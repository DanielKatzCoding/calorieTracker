import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import type { FoodItem, ResolvedRecipe } from '@/domain/types';
import { FOODS } from '@/data/foods';
import { RECIPES } from '@/data/recipes';
import { indexById, resolveRecipe } from '@/domain/menu/nutrition';
import { customFoodRepo } from '@/storage/repos/customFoodRepo';

/** Static recipes resolved once per app load. */
export const RESOLVED_RECIPES: ResolvedRecipe[] = RECIPES.map((r) => resolveRecipe(r, indexById(FOODS)));
export const RESOLVED_RECIPES_BY_ID: ReadonlyMap<string, ResolvedRecipe> = indexById(RESOLVED_RECIPES);

export interface FoodCatalog {
  foods: FoodItem[];
  foodsById: ReadonlyMap<string, FoodItem>;
  customFoods: FoodItem[];
  loading: boolean;
}

/** Bundled foods merged with the user's custom foods, live. */
export function useFoods(): FoodCatalog {
  const custom = useLiveQuery(() => customFoodRepo().list(), []);
  return useMemo(() => {
    const customFoods = custom ?? [];
    const foods = [...FOODS, ...customFoods];
    return { foods, foodsById: indexById(foods), customFoods, loading: custom === undefined };
  }, [custom]);
}

export function searchFoods(foods: readonly FoodItem[], query: string, limit = 30): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored = foods
    .map((f) => {
      const name = f.name.toLowerCase();
      if (!terms.every((t) => name.includes(t))) return null;
      const score = (name.startsWith(q) ? 0 : 1) + (f.isCustom ? -0.5 : 0) + name.length / 1000;
      return { f, score };
    })
    .filter((x): x is { f: FoodItem; score: number } => x !== null)
    .sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((x) => x.f);
}
