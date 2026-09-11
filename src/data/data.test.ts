import { describe, expect, it } from 'vitest';
import { FOODS, FOODS_BY_ID } from './foods';
import { RECIPES } from './recipes';
import { EXERCISES } from './exercises';
import { resolveRecipe } from '@/domain/menu/nutrition';
import type { Allergen, DietPattern, Equipment, MealSlot, MovementPattern } from '@/domain/types';

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const DIETS: DietPattern[] = ['omnivore', 'pescatarian', 'vegetarian', 'vegan', 'keto'];
const ALLERGENS: Allergen[] = ['gluten', 'lactose', 'nuts', 'peanuts', 'eggs', 'soy', 'shellfish', 'fish', 'sesame'];
const PATTERNS: MovementPattern[] = ['squat', 'hinge', 'lunge', 'h_push', 'v_push', 'h_pull', 'v_pull', 'core', 'carry', 'cardio'];
const EQUIPMENT: Equipment[] = ['none', 'dumbbells', 'gym'];

const resolved = RECIPES.map((r) => resolveRecipe(r, FOODS_BY_ID));

function eligible(slot: MealSlot, diet: DietPattern) {
  return resolved.filter((r) => r.slots.includes(slot) && (diet === 'keto' ? r.ketoFriendly : r.diets.includes(diet)));
}

describe('foods', () => {
  it('has a substantial database', () => {
    expect(FOODS.length).toBeGreaterThanOrEqual(350);
  });

  it('has unique ids and names', () => {
    expect(new Set(FOODS.map((f) => f.id)).size).toBe(FOODS.length);
    expect(new Set(FOODS.map((f) => f.name)).size).toBe(FOODS.length);
  });

  it('energy roughly matches macros (Atwater 4/4/9 within 20% or 25 kcal)', () => {
    // Dried spices/cocoa are mostly fiber (labels report lower kcal); alcohol carries kcal outside macros.
    const exempt = new Set([
      'curry_powder', 'cocoa_powder', 'vanilla_extract', 'cinnamon', 'black_pepper', 'paprika',
      'chili_flakes', 'oregano', 'beer', 'wine_red', 'wine_white',
    ]);
    const bad = FOODS.filter((f) => {
      if (exempt.has(f.id)) return false;
      const { kcal, proteinG, carbsG, fatG } = f.per100g;
      const atwater = proteinG * 4 + carbsG * 4 + fatG * 9;
      return Math.abs(atwater - kcal) > Math.max(25, kcal * 0.2);
    }).map((f) => `${f.id}: ${f.per100g.kcal} vs ${f.per100g.proteinG * 4 + f.per100g.carbsG * 4 + f.per100g.fatG * 9}`);
    expect(bad).toEqual([]);
  });

  it('has non-negative values and a serving label whenever a serving size is set', () => {
    for (const f of FOODS) {
      expect(Object.values(f.per100g).every((v) => v >= 0)).toBe(true);
      if (f.servingG !== undefined) expect(f.servingLabel).toBeTruthy();
    }
  });
});

describe('recipes', () => {
  it('has unique ids and every ingredient exists', () => {
    expect(new Set(RECIPES.map((r) => r.id)).size).toBe(RECIPES.length);
    for (const r of RECIPES) for (const ing of r.ingredients) expect(FOODS_BY_ID.has(ing.foodId), `${r.id} -> ${ing.foodId}`).toBe(true);
  });

  it('every recipe has clear preparation steps', () => {
    for (const r of RECIPES) {
      expect(r.steps.length, `${r.id} steps`).toBeGreaterThanOrEqual(2);
      expect(r.steps.length, `${r.id} steps`).toBeLessThanOrEqual(6);
      for (const s of r.steps) {
        expect(s.length, `${r.id}: "${s}"`).toBeGreaterThanOrEqual(8);
        expect(s.length, `${r.id}: "${s}"`).toBeLessThanOrEqual(200);
        expect(s.trim().endsWith('.'), `${r.id}: "${s}" should end with a period`).toBe(true);
        expect(/\d+\s?g\b/.test(s), `${r.id}: "${s}" must not hard-code grams`).toBe(false);
      }
      expect(r.prepMinutes, r.id).toBeGreaterThan(0);
    }
  });

  it('base servings have sensible energy', () => {
    for (const r of resolved) {
      const isSnackOnly = r.slots.length === 1 && r.slots[0] === 'snack';
      const [min, max] = isSnackOnly ? [80, 450] : [250, 950];
      expect(r.macros.kcal, `${r.id} = ${r.macros.kcal.toFixed(0)} kcal`).toBeGreaterThanOrEqual(min);
      expect(r.macros.kcal, `${r.id} = ${r.macros.kcal.toFixed(0)} kcal`).toBeLessThanOrEqual(max);
    }
  });

  it.each(SLOTS.flatMap((slot) => DIETS.map((diet) => [slot, diet] as const)))(
    'offers at least 6 %s options for a %s diet',
    (slot, diet) => {
      expect(eligible(slot, diet).length).toBeGreaterThanOrEqual(6);
    },
  );

  it.each(SLOTS.flatMap((slot) => ALLERGENS.map((a) => [slot, a] as const)))(
    'offers at least 6 %s options free of %s',
    (slot, allergen) => {
      const n = resolved.filter((r) => r.slots.includes(slot) && !r.allergens.includes(allergen)).length;
      expect(n).toBeGreaterThanOrEqual(6);
    },
  );

  it('keeps options for a vegan who avoids gluten, soy and nuts', () => {
    for (const slot of SLOTS) {
      const n = resolved.filter(
        (r) =>
          r.slots.includes(slot) &&
          r.diets.includes('vegan') &&
          !r.allergens.some((a) => a === 'gluten' || a === 'soy' || a === 'nuts'),
      ).length;
      expect(n, slot).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('exercises', () => {
  it('has unique ids', () => {
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
  });

  it.each(PATTERNS.flatMap((p) => EQUIPMENT.map((eq) => [p, eq] as const)))(
    'has a beginner-accessible %s exercise for %s equipment',
    (pattern, equipment) => {
      const n = EXERCISES.filter((e) => e.pattern === pattern && e.equipment.includes(equipment) && e.minLevel === 'beginner').length;
      expect(n).toBeGreaterThanOrEqual(1);
    },
  );

  it('has positive MET values', () => {
    for (const e of EXERCISES) expect(e.met).toBeGreaterThan(0);
  });
});
