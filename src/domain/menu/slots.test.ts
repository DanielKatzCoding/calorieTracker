import { describe, expect, it } from 'vitest';
import { slotsFor } from './slots';
import type { MealsPerDay } from '../types';

describe('slotsFor', () => {
  it.each([3, 4, 5, 6] as MealsPerDay[])('%i meals: right count, fractions sum to 1, one of each main', (n) => {
    const slots = slotsFor(n);
    expect(slots).toHaveLength(n);
    expect(slots.reduce((s, x) => s + x.fraction, 0)).toBeCloseTo(1, 6);
    for (const main of ['breakfast', 'lunch', 'dinner']) {
      expect(slots.filter((s) => s.slot === main)).toHaveLength(1);
    }
    expect(slots.filter((s) => s.slot === 'snack')).toHaveLength(n - 3);
  });

  it('follows the day order breakfast -> ... -> dinner', () => {
    const order = slotsFor(5).map((s) => s.slot);
    expect(order[0]).toBe('breakfast');
    expect(order.indexOf('lunch')).toBeGreaterThan(order.indexOf('breakfast'));
    expect(order.indexOf('dinner')).toBeGreaterThan(order.indexOf('lunch'));
  });
});
