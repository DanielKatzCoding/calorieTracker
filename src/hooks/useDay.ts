import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import type { DateKey, DiaryEntry, Macros, MealSlot, WorkoutLog } from '@/domain/types';
import { sumMacros, ZERO_MACROS } from '@/domain/menu/nutrition';
import { diaryRepo } from '@/storage/repos/diaryRepo';
import { workoutRepo } from '@/storage/repos/workoutRepo';

export interface DayData {
  loading: boolean;
  entries: DiaryEntry[];
  bySlot: Record<MealSlot, DiaryEntry[]>;
  totals: Macros;
  workouts: WorkoutLog[];
  burned: number;
}

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/** Everything logged on a calendar day, live. */
export function useDay(dateKey: DateKey): DayData {
  const entries = useLiveQuery(() => diaryRepo().forDay(dateKey), [dateKey]);
  const workouts = useLiveQuery(() => workoutRepo().logsForDay(dateKey), [dateKey]);
  return useMemo(() => {
    const list = entries ?? [];
    const bySlot = Object.fromEntries(SLOTS.map((s) => [s, list.filter((e) => e.slot === s)])) as Record<MealSlot, DiaryEntry[]>;
    return {
      loading: entries === undefined || workouts === undefined,
      entries: list,
      bySlot,
      totals: list.length ? sumMacros(list.map((e) => e.macros)) : ZERO_MACROS,
      workouts: workouts ?? [],
      burned: (workouts ?? []).reduce((s, w) => s + w.kcalBurned, 0),
    };
  }, [entries, workouts]);
}
