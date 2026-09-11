import { describe, expect, it } from 'vitest';
import { EMPTY_DRAFT, stepError, toProfileDraft, type QuizDraft } from './draft';

const complete: QuizDraft = {
  ...EMPTY_DRAFT,
  sex: 'female',
  age: 29,
  heightCm: 168,
  weightKg: 70,
  goal: 'lose',
  goalWeightKg: 63,
  pace: 0.5,
  activity: 'light',
  diet: 'vegetarian',
  mealsPerDay: 4,
  training: { daysPerWeek: 3, equipment: 'dumbbells', level: 'beginner' },
};

describe('stepError', () => {
  it('flags missing and out-of-range answers', () => {
    expect(stepError('about', EMPTY_DRAFT)).toBeTruthy();
    expect(stepError('about', { ...EMPTY_DRAFT, sex: 'male', age: 200 })).toBeTruthy();
    expect(stepError('about', { ...EMPTY_DRAFT, sex: 'male', age: 30 })).toBeNull();
  });
  it('requires a sensible goal weight direction', () => {
    expect(stepError('goal', { ...complete, goalWeightKg: 75 })).toContain('below');
    expect(stepError('goal', { ...complete, goal: 'gain', goalWeightKg: 65 })).toContain('above');
    expect(stepError('goal', { ...complete, goal: 'maintain', goalWeightKg: undefined })).toBeNull();
  });
  it('optional steps never block', () => {
    expect(stepError('allergens', EMPTY_DRAFT)).toBeNull();
    expect(stepError('dislikes', EMPTY_DRAFT)).toBeNull();
    expect(stepError('cuisines', EMPTY_DRAFT)).toBeNull();
  });
});

describe('toProfileDraft', () => {
  it('returns null until every step is valid', () => {
    expect(toProfileDraft(EMPTY_DRAFT)).toBeNull();
  });
  it('builds a full profile draft and pins goal weight when maintaining', () => {
    const p = toProfileDraft(complete);
    expect(p?.goalWeightKg).toBe(63);
    expect(toProfileDraft({ ...complete, goal: 'maintain' })?.goalWeightKg).toBe(70);
  });
});
