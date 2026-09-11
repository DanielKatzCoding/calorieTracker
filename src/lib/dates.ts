import { addDays as addDaysFns, format, isValid, parse } from 'date-fns';
import type { DateKey } from '@/domain/types';

const KEY_FORMAT = 'yyyy-MM-dd';

export function toDateKey(date: Date): DateKey {
  return format(date, KEY_FORMAT);
}

export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now);
}

export function parseDateKey(key: DateKey): Date {
  return parse(key, KEY_FORMAT, new Date());
}

export function isDateKey(value: unknown): value is DateKey {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseDateKey(value));
}

export function addDays(key: DateKey, days: number): DateKey {
  return toDateKey(addDaysFns(parseDateKey(key), days));
}

/** "Today", "Yesterday", or e.g. "Mon, 8 Sep". */
export function formatDayLabel(key: DateKey, now: Date = new Date()): string {
  const today = todayKey(now);
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  if (key === addDays(today, 1)) return 'Tomorrow';
  const d = parseDateKey(key);
  return format(d, d.getFullYear() === now.getFullYear() ? 'EEE, d MMM' : 'EEE, d MMM yyyy');
}

export function formatShortDate(key: DateKey): string {
  return format(parseDateKey(key), 'd MMM');
}

/** Keys for the last `n` days ending at `end`, oldest first. */
export function lastNDays(n: number, end: DateKey): DateKey[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
}
