import { describe, expect, it } from 'vitest';
import { FOODS, FOODS_BY_ID } from '@/data/foods';
import { RECIPES } from '@/data/recipes';
import { resolveRecipe } from './nutrition';
import { generateDailyMenu, KCAL_TOLERANCE, PROTEIN_FLOOR, swapMeal, type MenuInput, type MenuProfile } from './generator';
import { matchesConstraints } from './filter';
import { slotsFor } from './slots';
import type { ResolvedRecipe } from '../types';

const resolved = RECIPES.map((r) => resolveRecipe(r, FOODS_BY_ID));
const byId = new Map(resolved.map((r) => [r.id, r]));

const profiles: { name: string; profile: MenuProfile; kcal: number; proteinG: number }[] = [
  { name: 'omnivore 3 meals', profile: { diet: 'omnivore', allergens: [], dislikedFoodIds: [], cuisines: [], mealsPerDay: 3 }, kcal: 2200, proteinG: 160 },
  { name: 'vegan, gluten+nuts free, 5 meals', profile: { diet: 'vegan', allergens: ['gluten', 'nuts'], dislikedFoodIds: [], cuisines: ['asian', 'indian'], mealsPerDay: 5 }, kcal: 1800, proteinG: 110 },
  { name: 'keto, lactose free, 4 meals', profile: { diet: 'keto', allergens: ['lactose'], dislikedFoodIds: [], cuisines: ['american'], mealsPerDay: 4 }, kcal: 2000, proteinG: 130 },
  { name: 'pescatarian 6 meals', profile: { diet: 'pescatarian', allergens: ['shellfish'], dislikedFoodIds: ['tuna_canned'], cuisines: ['mediterranean', 'nordic'], mealsPerDay: 6 }, kcal: 2600, proteinG: 170 },
  { name: 'vegetarian small deficit', profile: { diet: 'vegetarian', allergens: ['eggs'], dislikedFoodIds: ['mushrooms'], cuisines: ['italian'], mealsPerDay: 3 }, kcal: 1500, proteinG: 100 },
  { name: 'omnivore bulk 4 meals', profile: { diet: 'omnivore', allergens: ['sesame'], dislikedFoodIds: ['salmon'], cuisines: ['mexican'], mealsPerDay: 4 }, kcal: 3400, proteinG: 160 },
];

function input(p: (typeof profiles)[number], seed: number, extra: Partial<MenuInput> = {}): MenuInput {
  return {
    profile: p.profile,
    targets: { kcal: p.kcal, proteinG: p.proteinG },
    recipes: resolved,
    foods: FOODS,
    seed,
    dateKey: '2026-09-12',
    now: '2026-09-12T08:00:00.000Z',
    ...extra,
  };
}

describe('generateDailyMenu', () => {
  it('is deterministic for a seed and differs across seeds', () => {
    const a = generateDailyMenu(input(profiles[0]!, 1));
    const b = generateDailyMenu(input(profiles[0]!, 1));
    expect(a).toEqual(b);
    const seeds = new Set(Array.from({ length: 10 }, (_, s) => JSON.stringify(generateDailyMenu(input(profiles[0]!, s)).meals.map((m) => m.recipeId))));
    expect(seeds.size).toBeGreaterThan(3);
  });

  it.each(profiles)('$name: hits targets and respects every hard constraint across 50 seeds', (p) => {
    const slotOrder = slotsFor(p.profile.mealsPerDay).map((s) => s.slot);
    for (let seed = 0; seed < 50; seed++) {
      const menu = generateDailyMenu(input(p, seed));
      expect(menu.meals.map((m) => m.slot), `seed ${seed}`).toEqual(slotOrder);
      expect(menu.warnings.some((w) => w.code === 'INSUFFICIENT_OPTIONS' || w.code === 'FALLBACK_SIMPLE_PLATE'), `seed ${seed} fell back`).toBe(false);
      expect(Math.abs(menu.totals.kcal - p.kcal), `seed ${seed} kcal ${menu.totals.kcal}`).toBeLessThanOrEqual(p.kcal * KCAL_TOLERANCE + 1);
      expect(menu.totals.proteinG, `seed ${seed} protein`).toBeGreaterThanOrEqual(p.proteinG * PROTEIN_FLOOR - 0.5);
      for (const meal of menu.meals) {
        const r = meal.inlineRecipe ?? byId.get(meal.recipeId);
        expect(r, meal.recipeId).toBeDefined();
        expect(matchesConstraints(r!, p.profile), `${meal.recipeId} violates constraints`).toBe(true);
        expect(meal.scale).toBeGreaterThanOrEqual(0.5);
        expect(meal.scale).toBeLessThanOrEqual(2);
      }
      expect(new Set(menu.meals.map((m) => m.recipeId)).size, `seed ${seed} repeats`).toBe(menu.meals.length);
    }
  });

  it('avoids recently used recipes when alternatives exist', () => {
    const first = generateDailyMenu(input(profiles[0]!, 3));
    const recent = first.meals.map((m) => m.recipeId);
    let overlap = 0;
    for (let seed = 0; seed < 20; seed++) {
      const next = generateDailyMenu(input(profiles[0]!, seed, { recentRecipeIds: recent }));
      overlap += next.meals.filter((m) => recent.includes(m.recipeId)).length;
    }
    expect(overlap).toBeLessThanOrEqual(3);
  });

  it('prefers the preferred cuisines when they cover the slot', () => {
    let matches = 0;
    let total = 0;
    for (let seed = 0; seed < 20; seed++) {
      const menu = generateDailyMenu(input(profiles[5]!, seed));
      for (const m of menu.meals) {
        const r = byId.get(m.recipeId)!;
        total++;
        if (r.cuisine === 'mexican' || r.cuisine === 'neutral') matches++;
      }
    }
    expect(matches / total).toBeGreaterThan(0.5);
  });
});

describe('fallback ladder', () => {
  const tiny: ResolvedRecipe[] = resolved.filter((r) => r.id === 'oatmeal_banana_pb' || r.id === 'chicken_rice_bowl' || r.id === 'banana_snack');
  const p = profiles[0]!;

  it('widens to an adjacent slot before synthesising', () => {
    // No dinner-only recipes in the tiny DB, but chicken_rice_bowl covers lunch+dinner -> used for both.
    const menu = generateDailyMenu({ ...input(p, 1), recipes: tiny });
    expect(menu.meals).toHaveLength(3);
    expect(menu.warnings.some((w) => w.code === 'FEW_OPTIONS')).toBe(true);
  });

  it('synthesises a simple plate from single foods when no recipe fits', () => {
    const menu = generateDailyMenu({ ...input(p, 1), recipes: tiny.filter((r) => r.id !== 'chicken_rice_bowl') });
    const dinner = menu.meals.find((m) => m.slot === 'dinner');
    expect(dinner?.inlineRecipe).toBeDefined();
    expect(dinner!.inlineRecipe!.ingredients.length).toBeGreaterThanOrEqual(2);
    expect(matchesConstraints(dinner!.inlineRecipe!, p.profile)).toBe(true);
    expect(menu.warnings.filter((w) => w.code === 'FALLBACK_SIMPLE_PLATE')).toHaveLength(2);
  });

  it('simple plate honours diet and allergens', () => {
    const vegan: MenuProfile = { diet: 'vegan', allergens: ['soy', 'gluten'], dislikedFoodIds: [], cuisines: [], mealsPerDay: 3 };
    const menu = generateDailyMenu({ ...input(p, 5), profile: vegan, recipes: [] });
    for (const m of menu.meals) {
      expect(m.inlineRecipe).toBeDefined();
      expect(matchesConstraints(m.inlineRecipe!, vegan)).toBe(true);
    }
  });

  it('reports INSUFFICIENT_OPTIONS instead of throwing when nothing at all is edible', () => {
    const impossible: MenuProfile = { diet: 'vegan', allergens: ['soy', 'gluten', 'nuts', 'peanuts', 'sesame'], dislikedFoodIds: FOODS.filter((f) => f.category === 'legume' || f.category === 'protein' || f.category === 'dairy').map((f) => f.id), cuisines: [], mealsPerDay: 3 };
    const menu = generateDailyMenu({ ...input(p, 1), profile: impossible, recipes: [] });
    expect(menu.meals).toHaveLength(0);
    expect(menu.warnings.filter((w) => w.code === 'INSUFFICIENT_OPTIONS')).toHaveLength(3);
  });
});

describe('swapMeal', () => {
  const p = profiles[0]!;

  it('changes only the target slot and excludes rejected recipes', () => {
    const menu = generateDailyMenu(input(p, 11));
    const before = menu.meals.map((m) => m.recipeId);
    const swapped = swapMeal(menu, 1, input(p, 99));
    const after = swapped.meals.map((m) => m.recipeId);
    expect(after[0]).toBe(before[0]);
    expect(after[2]).toBe(before[2]);
    expect(after[1]).not.toBe(before[1]);
    expect(swapped.meals[1]!.slot).toBe('lunch');

    const again = swapMeal(swapped, 1, input(p, 100), [before[1]!]);
    expect(again.meals[1]!.recipeId).not.toBe(before[1]);
    expect(again.meals[1]!.recipeId).not.toBe(after[1]);
  });

  it('keeps the day within tolerance after a swap', () => {
    for (let seed = 0; seed < 20; seed++) {
      const menu = generateDailyMenu(input(p, seed));
      const swapped = swapMeal(menu, 2, input(p, seed + 1000));
      expect(Math.abs(swapped.totals.kcal - p.kcal)).toBeLessThanOrEqual(p.kcal * KCAL_TOLERANCE + 1);
    }
  });

  it('returns the menu unchanged for an invalid index', () => {
    const menu = generateDailyMenu(input(p, 1));
    expect(swapMeal(menu, 9, input(p, 2))).toBe(menu);
  });
});
