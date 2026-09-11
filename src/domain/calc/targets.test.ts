import { describe, expect, it } from 'vitest';
import { computeTargets } from './targets';
import { macroKcal } from './macros';

describe('computeTargets', () => {
  it('runs the whole pipeline for a typical fat-loss profile', () => {
    const t = computeTargets({
      sex: 'male',
      age: 30,
      heightCm: 180,
      weightKg: 80,
      goalWeightKg: 75,
      activity: 'moderate',
      goal: 'lose',
      pace: 0.5,
      diet: 'omnivore',
    });
    expect(t.bmr).toBe(1780);
    expect(t.tdee).toBe(2759);
    expect(t.kcal).toBe(2209);
    expect(t.deltaKcal).toBe(-550);
    expect(t.floorApplied).toBe(false);
    expect(t.proteinG).toBe(160);
    expect(Math.abs(macroKcal(t) - t.kcal)).toBeLessThanOrEqual(t.kcal * 0.01);
    expect(t.projectedWeeksToGoal).toBeCloseTo(10);
  });

  it('reports the floor and projects with the effective deficit', () => {
    const t = computeTargets({
      sex: 'female',
      age: 40,
      heightCm: 160,
      weightKg: 50,
      goalWeightKg: 47,
      activity: 'sedentary',
      goal: 'lose',
      pace: 1,
      diet: 'omnivore',
    });
    expect(t.floorApplied).toBe(true);
    expect(t.kcal).toBe(1200);
    // effective delta ~ -167 kcal/day -> ~0.15 kg/week -> ~20 weeks for 3 kg
    expect(t.projectedWeeksToGoal).toBeGreaterThan(15);
    expect(t.projectedWeeksToGoal).toBeLessThan(25);
  });

  it('has no projection when maintaining', () => {
    const t = computeTargets({
      sex: 'male',
      age: 30,
      heightCm: 180,
      weightKg: 80,
      goalWeightKg: 80,
      activity: 'light',
      goal: 'maintain',
      pace: 0.5,
      diet: 'vegan',
    });
    expect(t.projectedWeeksToGoal).toBeNull();
    expect(t.kcal).toBe(t.tdee);
  });
});
