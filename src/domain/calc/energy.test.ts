import { describe, expect, it } from 'vitest';
import { calorieTarget, dailyDelta, tdee } from './energy';

describe('tdee', () => {
  it('applies activity multipliers', () => {
    expect(tdee(1780, 'sedentary')).toBeCloseTo(2136);
    expect(tdee(1780, 'light')).toBeCloseTo(2447.5);
    expect(tdee(1780, 'moderate')).toBeCloseTo(2759);
    expect(tdee(1780, 'very')).toBeCloseTo(3070.5);
    expect(tdee(1780, 'extra')).toBeCloseTo(3382);
  });
});

describe('dailyDelta', () => {
  it('converts weekly kg pace to daily kcal', () => {
    expect(dailyDelta(0.25)).toBeCloseTo(275);
    expect(dailyDelta(0.5)).toBeCloseTo(550);
    expect(dailyDelta(0.75)).toBeCloseTo(825);
    expect(dailyDelta(1)).toBeCloseTo(1100);
  });
});

describe('calorieTarget', () => {
  const base = { bmr: 1780, tdee: 2759, sex: 'male' as const };

  it('maintain equals TDEE with zero delta', () => {
    expect(calorieTarget({ ...base, goal: 'maintain', pace: 0.5 })).toEqual({
      target: 2759,
      deltaKcal: 0,
      floorApplied: false,
    });
  });

  it('lose subtracts the daily delta', () => {
    const r = calorieTarget({ ...base, goal: 'lose', pace: 0.5 });
    expect(r.target).toBeCloseTo(2209);
    expect(r.deltaKcal).toBeCloseTo(-550);
    expect(r.floorApplied).toBe(false);
  });

  it('gain adds the daily delta', () => {
    const r = calorieTarget({ ...base, goal: 'gain', pace: 0.5 });
    expect(r.target).toBeCloseTo(3309);
    expect(r.deltaKcal).toBeCloseTo(550);
  });

  it('applies the sex floor for an aggressive deficit', () => {
    // female 50 kg / 160 cm / 40 y sedentary: BMR 1139, TDEE 1366.8
    const r = calorieTarget({ bmr: 1139, tdee: 1366.8, sex: 'female', goal: 'lose', pace: 1 });
    expect(r.target).toBe(1200);
    expect(r.floorApplied).toBe(true);
    expect(r.deltaKcal).toBeCloseTo(1200 - 1366.8);
  });

  it('uses 90% of BMR as the floor when that is higher than the sex floor', () => {
    // BMR 2000 -> floor 1800 > 1500
    const r = calorieTarget({ bmr: 2000, tdee: 2400, sex: 'male', goal: 'lose', pace: 1 });
    expect(r.target).toBe(1800);
    expect(r.floorApplied).toBe(true);
  });

  it('never prescribes a surplus when the goal is to lose', () => {
    const r = calorieTarget({ bmr: 1000, tdee: 1150, sex: 'female', goal: 'lose', pace: 0.25 });
    expect(r.target).toBeLessThanOrEqual(1150);
  });
});
