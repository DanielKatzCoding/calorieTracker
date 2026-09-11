import { describe, expect, it } from 'vitest';
import { addDays, formatDayLabel, isDateKey, lastNDays, todayKey } from './dates';

describe('dates', () => {
  const now = new Date(2026, 8, 12, 15, 0); // 12 Sep 2026 local

  it('formats today as a local key', () => {
    expect(todayKey(now)).toBe('2026-09-12');
  });

  it('adds days across month boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('validates keys', () => {
    expect(isDateKey('2026-09-12')).toBe(true);
    expect(isDateKey('2026-13-40')).toBe(false);
    expect(isDateKey('12/09/2026')).toBe(false);
    expect(isDateKey(42)).toBe(false);
  });

  it('labels relative days', () => {
    expect(formatDayLabel('2026-09-12', now)).toBe('Today');
    expect(formatDayLabel('2026-09-11', now)).toBe('Yesterday');
    expect(formatDayLabel('2026-09-13', now)).toBe('Tomorrow');
    expect(formatDayLabel('2026-09-07', now)).toBe('Mon, 7 Sep');
    expect(formatDayLabel('2025-09-07', now)).toBe('Sun, 7 Sep 2025');
  });

  it('lists the last n days oldest first', () => {
    expect(lastNDays(3, '2026-09-12')).toEqual(['2026-09-10', '2026-09-11', '2026-09-12']);
  });
});
