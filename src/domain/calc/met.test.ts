import { describe, expect, it } from 'vitest';
import { kcalBurned, RESISTANCE_MET } from './met';

describe('kcalBurned', () => {
  it('uses the standard MET formula', () => {
    expect(kcalBurned(5, 70, 60)).toBeCloseTo(367.5);
  });
  it('returns 0 for zero minutes', () => {
    expect(kcalBurned(RESISTANCE_MET.vigorous, 80, 0)).toBe(0);
  });
  it('rejects negative inputs', () => {
    expect(() => kcalBurned(5, 70, -1)).toThrow(RangeError);
  });
});
