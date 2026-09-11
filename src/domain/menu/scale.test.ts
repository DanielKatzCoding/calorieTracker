import { describe, expect, it } from 'vitest';
import { bestScale, chooseMeal, mealCost, SCALES } from './scale';
import type { ResolvedRecipe } from '../types';

const mk = (id: string, kcal: number, proteinG: number): ResolvedRecipe => ({
  id,
  name: id,
  slots: ['lunch'],
  cuisine: 'neutral',
  ingredients: [],
  prepMinutes: 1,
  steps: ['Cook.', 'Serve.'],
  macros: { kcal, proteinG, carbsG: 10, fatG: 10 },
  totalGrams: 300,
  allergens: [],
  diets: ['omnivore'],
  ketoFriendly: false,
});

describe('bestScale', () => {
  it('uses quarter steps between 0.5 and 2', () => {
    expect(SCALES).toEqual([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
  });
  it('minimises the kcal error', () => {
    expect(bestScale(500, 500)).toBe(1);
    expect(bestScale(500, 620)).toBe(1.25);
    expect(bestScale(500, 240)).toBe(0.5);
    expect(bestScale(500, 1500)).toBe(2);
  });
});

describe('mealCost', () => {
  it('is zero when kcal and protein are met', () => {
    expect(mealCost({ kcal: 500, proteinG: 40, carbsG: 0, fatG: 0 }, 500, 30)).toBe(0);
  });
  it('penalises protein shortfall on top of kcal error', () => {
    const noShort = mealCost({ kcal: 550, proteinG: 40, carbsG: 0, fatG: 0 }, 500, 30);
    const short = mealCost({ kcal: 550, proteinG: 15, carbsG: 0, fatG: 0 }, 500, 30);
    expect(noShort).toBeCloseTo(0.1);
    expect(short).toBeCloseTo(0.1 + 0.5 * 0.5);
  });
  it('softly penalises large protein overshoot but not moderate surplus', () => {
    const moderate = mealCost({ kcal: 500, proteinG: 44, carbsG: 0, fatG: 0 }, 500, 30); // 1.47x
    const huge = mealCost({ kcal: 500, proteinG: 75, carbsG: 0, fatG: 0 }, 500, 30); // 2.5x
    expect(moderate).toBe(0);
    expect(huge).toBeCloseTo(0.15 * ((75 - 45) / 30));
    expect(huge).toBeLessThan(mealCost({ kcal: 500, proteinG: 15, carbsG: 0, fatG: 0 }, 500, 30));
  });
});

describe('chooseMeal', () => {
  it('prefers the candidate that fits kcal and protein best, not just the first', () => {
    const ranked = [mk('lowprot', 600, 5), mk('good', 580, 40), mk('tiny', 100, 5)];
    const pick = chooseMeal(ranked, 600, 40);
    expect(pick?.recipe.id).toBe('good');
    expect(pick?.scale).toBe(1);
  });
  it('returns null for no candidates', () => {
    expect(chooseMeal([], 500, 30)).toBeNull();
  });
  it('only considers the first N ranked candidates', () => {
    const ranked = [mk('a', 300, 1), mk('perfect', 500, 40)];
    expect(chooseMeal(ranked, 500, 40, 1)?.recipe.id).toBe('a');
  });
});
