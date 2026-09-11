import { describe, expect, it } from 'vitest';
import { macroKcal, macroSplit, proteinBasisKg } from './macros';
import type { GoalType } from '../types';

describe('proteinBasisKg', () => {
  it('uses current weight normally', () => {
    expect(proteinBasisKg(80, 75)).toBe(80);
  });
  it('switches to goal weight when more than 15 kg above it', () => {
    expect(proteinBasisKg(120, 90)).toBe(90);
    expect(proteinBasisKg(105, 90)).toBe(105);
  });
});

describe('macroSplit', () => {
  const base = { targetKcal: 2200, weightKg: 80, goalWeightKg: 75, diet: 'omnivore' as const };

  it('sets protein by goal (g/kg)', () => {
    expect(macroSplit({ ...base, goal: 'lose' }).proteinG).toBe(160);
    expect(macroSplit({ ...base, goal: 'maintain' }).proteinG).toBe(128);
    expect(macroSplit({ ...base, goal: 'gain' }).proteinG).toBe(144);
  });

  it('uses 30% fat when losing/maintaining and 25% when gaining', () => {
    expect(macroSplit({ ...base, goal: 'lose' }).fatG).toBe(Math.round((2200 * 0.3) / 9));
    expect(macroSplit({ ...base, goal: 'gain' }).fatG).toBe(Math.round((2200 * 0.25) / 9));
  });

  it('macro energy matches the kcal target within 1%', () => {
    const goals: GoalType[] = ['lose', 'maintain', 'gain'];
    for (const goal of goals) {
      for (const targetKcal of [1200, 1500, 1800, 2200, 2800, 3500]) {
        for (const weightKg of [50, 70, 90, 120]) {
          const m = macroSplit({ targetKcal, weightKg, goalWeightKg: weightKg - 5, goal, diet: 'omnivore' });
          expect(Math.abs(macroKcal(m) - targetKcal)).toBeLessThanOrEqual(targetKcal * 0.01);
          expect(m.carbsG).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('lowers fat to 20% first to keep at least 50 g carbs on low targets', () => {
    // 1200 kcal, 90 kg losing: 180 g protein = 720, 30% fat = 360 -> carbs 30 g (too low);
    // at 20% fat (240 kcal) carbs become 60 g, so protein stays at 2 g/kg.
    const m = macroSplit({ targetKcal: 1200, weightKg: 90, goalWeightKg: 85, goal: 'lose', diet: 'omnivore' });
    expect(m.fatG).toBe(Math.round((1200 * 0.2) / 9));
    expect(m.proteinG).toBe(180);
    expect(m.carbsG).toBeGreaterThanOrEqual(50);
  });

  it('then lowers protein to 1.6 g/kg when 20% fat is still not enough', () => {
    // 1200 kcal, 100 kg: 200 g protein = 800, 20% fat = 240 -> carbs 40 g; protein drops to 160 -> carbs 80 g
    const m = macroSplit({ targetKcal: 1200, weightKg: 100, goalWeightKg: 95, goal: 'lose', diet: 'omnivore' });
    expect(m.fatG).toBe(Math.round((1200 * 0.2) / 9));
    expect(m.proteinG).toBe(160);
    expect(m.carbsG).toBeGreaterThanOrEqual(50);
  });

  it('keto fixes carbs at 30 g with 1.6 g/kg protein and fat as the remainder', () => {
    const m = macroSplit({ ...base, goal: 'lose', diet: 'keto' });
    expect(m.carbsG).toBe(30);
    expect(m.proteinG).toBe(128);
    expect(m.fatG).toBe(Math.round((2200 - 120 - 512) / 9));
    expect(Math.abs(macroKcal(m) - 2200)).toBeLessThanOrEqual(22);
  });

  it('rejects a non-positive target', () => {
    expect(() => macroSplit({ ...base, goal: 'lose', targetKcal: 0 })).toThrow(RangeError);
  });
});
