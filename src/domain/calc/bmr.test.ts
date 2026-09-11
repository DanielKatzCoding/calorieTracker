import { describe, expect, it } from 'vitest';
import { mifflinStJeor } from './bmr';

describe('mifflinStJeor', () => {
  it('computes male BMR', () => {
    expect(mifflinStJeor({ sex: 'male', weightKg: 80, heightCm: 180, age: 30 })).toBe(1780);
  });

  it('computes female BMR', () => {
    expect(mifflinStJeor({ sex: 'female', weightKg: 60, heightCm: 165, age: 25 })).toBe(1345.25);
  });

  it('rejects non-positive inputs', () => {
    expect(() => mifflinStJeor({ sex: 'male', weightKg: 0, heightCm: 180, age: 30 })).toThrow(RangeError);
    expect(() => mifflinStJeor({ sex: 'male', weightKg: 80, heightCm: -1, age: 30 })).toThrow(RangeError);
    expect(() => mifflinStJeor({ sex: 'male', weightKg: 80, heightCm: 180, age: 0 })).toThrow(RangeError);
  });
});
