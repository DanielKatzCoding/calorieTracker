import { describe, expect, it } from 'vitest';
import { bmi, bmiCategory, projectedWeeksToGoal } from './bodyMetrics';

describe('bmi', () => {
  it('computes kg/m^2', () => {
    expect(bmi(80, 180)).toBeCloseTo(24.69, 2);
  });
  it('categorises', () => {
    expect(bmiCategory(17)).toBe('underweight');
    expect(bmiCategory(22)).toBe('normal');
    expect(bmiCategory(27)).toBe('overweight');
    expect(bmiCategory(31)).toBe('obese');
  });
});

describe('projectedWeeksToGoal', () => {
  it('uses the applied deficit: 10 kg at 550 kcal/day is 20 weeks', () => {
    expect(projectedWeeksToGoal(80, 70, -550)).toBeCloseTo(20);
  });
  it('works for gaining', () => {
    expect(projectedWeeksToGoal(60, 65, 275)).toBeCloseTo(20);
  });
  it('is null when maintaining or already at goal', () => {
    expect(projectedWeeksToGoal(80, 80, -550)).toBeNull();
    expect(projectedWeeksToGoal(80, 70, 0)).toBeNull();
  });
  it('is null when the delta points away from the goal', () => {
    expect(projectedWeeksToGoal(80, 70, 300)).toBeNull();
  });
});
