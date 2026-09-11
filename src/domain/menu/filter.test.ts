import { describe, expect, it } from 'vitest';
import { FOODS_BY_ID } from '@/data/foods';
import { RECIPES } from '@/data/recipes';
import { resolveRecipe } from './nutrition';
import { eligibleRecipes, foodAllowed, isEligible, rankRecipes, scoreRecipe, type Constraints } from './filter';
import { mulberry32 } from '../random';
import type { Allergen } from '../types';

const resolved = RECIPES.map((r) => resolveRecipe(r, FOODS_BY_ID));
const byId = (id: string) => {
  const r = resolved.find((x) => x.id === id);
  if (!r) throw new Error(`missing fixture recipe ${id}`);
  return r;
};
const base: Constraints = { diet: 'omnivore', allergens: [], dislikedFoodIds: [] };

describe('isEligible: diet', () => {
  it('vegan excludes anything with meat, fish, dairy or eggs', () => {
    const c = { ...base, diet: 'vegan' as const };
    expect(isEligible(byId('chicken_rice_bowl'), 'lunch', c)).toBe(false);
    expect(isEligible(byId('salmon_rice_bowl'), 'lunch', c)).toBe(false);
    expect(isEligible(byId('greek_yogurt_parfait'), 'breakfast', c)).toBe(false);
    expect(isEligible(byId('scrambled_eggs_toast'), 'breakfast', c)).toBe(false);
    expect(isEligible(byId('tofu_scramble'), 'breakfast', c)).toBe(true);
  });

  it('vegetarian allows dairy and eggs but not fish or meat', () => {
    const c = { ...base, diet: 'vegetarian' as const };
    expect(isEligible(byId('greek_yogurt_parfait'), 'breakfast', c)).toBe(true);
    expect(isEligible(byId('scrambled_eggs_toast'), 'breakfast', c)).toBe(true);
    expect(isEligible(byId('salmon_rice_bowl'), 'lunch', c)).toBe(false);
    expect(isEligible(byId('chicken_rice_bowl'), 'lunch', c)).toBe(false);
  });

  it('pescatarian allows fish but not chicken', () => {
    const c = { ...base, diet: 'pescatarian' as const };
    expect(isEligible(byId('salmon_rice_bowl'), 'lunch', c)).toBe(true);
    expect(isEligible(byId('chicken_rice_bowl'), 'lunch', c)).toBe(false);
  });

  it('keto rejects rice dishes and accepts low-carb ones', () => {
    const c = { ...base, diet: 'keto' as const };
    expect(isEligible(byId('chicken_rice_bowl'), 'lunch', c)).toBe(false);
    expect(isEligible(byId('keto_chicken_caesar'), 'lunch', c)).toBe(true);
    expect(isEligible(byId('ribeye_asparagus'), 'dinner', c)).toBe(true);
  });

  it('respects the slot', () => {
    expect(isEligible(byId('chicken_rice_bowl'), 'breakfast', base)).toBe(false);
    expect(isEligible(byId('chicken_rice_bowl'), 'dinner', base)).toBe(true);
  });
});

describe('isEligible: allergens and dislikes', () => {
  const ALL: Allergen[] = ['gluten', 'lactose', 'nuts', 'peanuts', 'eggs', 'soy', 'shellfish', 'fish', 'sesame'];

  it.each(ALL)('%s: no eligible recipe contains a food tagged with it', (allergen) => {
    const c = { ...base, allergens: [allergen] };
    for (const slot of ['breakfast', 'lunch', 'dinner', 'snack'] as const) {
      for (const r of eligibleRecipes(resolved, slot, c)) {
        expect(r.allergens, r.id).not.toContain(allergen);
      }
    }
  });

  it('excludes recipes containing a disliked food', () => {
    const c = { ...base, dislikedFoodIds: ['broccoli'] };
    expect(isEligible(byId('chicken_rice_bowl'), 'lunch', c)).toBe(false);
    expect(isEligible(byId('tuna_salad_sandwich'), 'lunch', c)).toBe(true);
  });

  it('honours extra allergens declared on a recipe', () => {
    const r = { ...byId('banana_snack'), allergens: ['gluten' as const] };
    expect(isEligible(r, 'snack', { ...base, allergens: ['gluten'] })).toBe(false);
  });
});

describe('foodAllowed', () => {
  it('applies diet, allergens and dislikes to single foods', () => {
    const chicken = FOODS_BY_ID.get('chicken_breast')!;
    const rice = FOODS_BY_ID.get('rice_white_cooked')!;
    expect(foodAllowed(chicken, { ...base, diet: 'vegan' })).toBe(false);
    expect(foodAllowed(chicken, { ...base, diet: 'keto' })).toBe(true);
    expect(foodAllowed(rice, { ...base, diet: 'keto' })).toBe(false);
    expect(foodAllowed(rice, { ...base, dislikedFoodIds: ['rice_white_cooked'] })).toBe(false);
    expect(foodAllowed(FOODS_BY_ID.get('almonds')!, { ...base, allergens: ['nuts'] })).toBe(false);
  });
});

describe('scoring', () => {
  const ctx = { cuisines: ['italian' as const], recentRecipeIds: [], rng: () => 0 };

  it('prefers matching or neutral cuisine but never changes eligibility', () => {
    expect(scoreRecipe(byId('spaghetti_bolognese'), ctx)).toBeGreaterThan(scoreRecipe(byId('beef_stir_fry'), ctx));
    expect(scoreRecipe(byId('banana_snack'), ctx)).toBe(scoreRecipe(byId('spaghetti_bolognese'), ctx));
    expect(isEligible(byId('beef_stir_fry'), 'dinner', base)).toBe(true);
  });

  it('penalises recently used recipes', () => {
    const recent = { ...ctx, recentRecipeIds: ['spaghetti_bolognese'] };
    expect(scoreRecipe(byId('spaghetti_bolognese'), recent)).toBeLessThan(scoreRecipe(byId('beef_stir_fry'), recent));
  });

  it('ranks deterministically for a given seed', () => {
    const a = rankRecipes(resolved, { cuisines: [], recentRecipeIds: [], rng: mulberry32(7) }).map((r) => r.id);
    const b = rankRecipes(resolved, { cuisines: [], recentRecipeIds: [], rng: mulberry32(7) }).map((r) => r.id);
    expect(a).toEqual(b);
  });
});
