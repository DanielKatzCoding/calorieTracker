import { describe, expect, it } from 'vitest';
import type { FoodItem, Recipe } from '../types';
import { indexById, macrosForGrams, MissingFoodError, resolveRecipe } from './nutrition';

const chicken: FoodItem = {
  id: 'chicken',
  name: 'Chicken',
  category: 'protein',
  per100g: { kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
  allergens: [],
  diets: ['omnivore'],
  ketoFriendly: true,
};
const rice: FoodItem = {
  id: 'rice',
  name: 'Rice',
  category: 'grain',
  per100g: { kcal: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3 },
  allergens: [],
  diets: ['omnivore', 'pescatarian', 'vegetarian', 'vegan'],
  ketoFriendly: false,
};
const cheese: FoodItem = {
  id: 'cheese',
  name: 'Cheese',
  category: 'dairy',
  per100g: { kcal: 400, proteinG: 25, carbsG: 1, fatG: 33 },
  allergens: ['lactose'],
  diets: ['omnivore', 'pescatarian', 'vegetarian'],
  ketoFriendly: true,
};
const foods = indexById([chicken, rice, cheese]);

describe('macrosForGrams', () => {
  it('scales per-100g values', () => {
    expect(macrosForGrams(rice, 200)).toEqual({ kcal: 260, proteinG: 5.4, carbsG: 56, fatG: 0.6 });
  });
});

describe('resolveRecipe', () => {
  const base: Recipe = {
    id: 'bowl',
    name: 'Bowl',
    slots: ['lunch'],
    cuisine: 'neutral',
    ingredients: [
      { foodId: 'chicken', grams: 150 },
      { foodId: 'rice', grams: 200 },
    ],
    prepMinutes: 20,
  };

  it('sums macros and grams from ingredients', () => {
    const r = resolveRecipe(base, foods);
    expect(r.totalGrams).toBe(350);
    expect(r.macros.kcal).toBeCloseTo(165 * 1.5 + 260);
    expect(r.macros.proteinG).toBeCloseTo(46.5 + 5.4);
  });

  it('diet compatibility is the intersection of ingredient diets', () => {
    expect(resolveRecipe(base, foods).diets).toEqual(['omnivore']);
    const veg = resolveRecipe({ ...base, ingredients: [{ foodId: 'rice', grams: 100 }, { foodId: 'cheese', grams: 30 }] }, foods);
    expect(veg.diets).toEqual(['omnivore', 'pescatarian', 'vegetarian']);
  });

  it('allergens are the union of ingredient and extra allergens', () => {
    const r = resolveRecipe(
      { ...base, ingredients: [{ foodId: 'cheese', grams: 30 }], extraAllergens: ['gluten'] },
      foods,
    );
    expect(r.allergens).toEqual(['gluten', 'lactose']);
  });

  it('is keto only when all ingredients are keto and carbs stay low', () => {
    expect(resolveRecipe(base, foods).ketoFriendly).toBe(false);
    const keto = resolveRecipe(
      { ...base, ingredients: [{ foodId: 'chicken', grams: 150 }, { foodId: 'cheese', grams: 40 }] },
      foods,
    );
    expect(keto.ketoFriendly).toBe(true);
  });

  it('throws a descriptive error for unknown ingredients', () => {
    expect(() => resolveRecipe({ ...base, ingredients: [{ foodId: 'nope', grams: 1 }] }, foods)).toThrow(
      MissingFoodError,
    );
  });
});
