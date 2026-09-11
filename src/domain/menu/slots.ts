import type { MealSlot, MealsPerDay } from '../types';

export interface SlotSpec {
  slot: MealSlot;
  /** Share of the daily kcal target. Fractions per day sum to 1. */
  fraction: number;
}

const TABLE: Record<MealsPerDay, SlotSpec[]> = {
  3: [
    { slot: 'breakfast', fraction: 0.3 },
    { slot: 'lunch', fraction: 0.35 },
    { slot: 'dinner', fraction: 0.35 },
  ],
  4: [
    { slot: 'breakfast', fraction: 0.25 },
    { slot: 'lunch', fraction: 0.3 },
    { slot: 'snack', fraction: 0.15 },
    { slot: 'dinner', fraction: 0.3 },
  ],
  5: [
    { slot: 'breakfast', fraction: 0.25 },
    { slot: 'snack', fraction: 0.1 },
    { slot: 'lunch', fraction: 0.3 },
    { slot: 'snack', fraction: 0.1 },
    { slot: 'dinner', fraction: 0.25 },
  ],
  6: [
    { slot: 'breakfast', fraction: 0.2 },
    { slot: 'snack', fraction: 0.1 },
    { slot: 'lunch', fraction: 0.25 },
    { slot: 'snack', fraction: 0.1 },
    { slot: 'dinner', fraction: 0.25 },
    { slot: 'snack', fraction: 0.1 },
  ],
};

export function slotsFor(mealsPerDay: MealsPerDay): SlotSpec[] {
  return TABLE[mealsPerDay].map((s) => ({ ...s }));
}

/** Slots whose recipes are acceptable substitutes when a slot has no eligible options. */
export const ADJACENT_SLOTS: Record<MealSlot, MealSlot[]> = {
  breakfast: ['snack'],
  snack: ['breakfast'],
  lunch: ['dinner'],
  dinner: ['lunch'],
};

export const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};
