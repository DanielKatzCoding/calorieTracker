import { useState } from 'react';
import { useSearchParams } from 'react-router';
import type { DiaryEntry, MealSlot } from '@/domain/types';
import { useReadyProfile } from '@/hooks/useReadyProfile';
import { useDay } from '@/hooks/useDay';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { MacroBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { addDays, formatDayLabel, isDateKey, todayKey } from '@/lib/dates';
import { SLOT_ORDER, fmt } from '@/lib/labels';
import { SLOT_LABEL } from '@/domain/menu/slots';
import { diaryRepo } from '@/storage/repos/diaryRepo';
import { FoodSearchSheet } from './FoodSearchSheet';
import { EditEntrySheet } from './EditEntrySheet';

export function DiaryScreen() {
  const { targets } = useReadyProfile();
  const [params, setParams] = useSearchParams();
  const dateKey = isDateKey(params.get('date')) ? params.get('date')! : todayKey();
  const setDate = (d: string) => setParams(d === todayKey() ? {} : { date: d }, { replace: true });
  const day = useDay(dateKey);
  const toast = useToast();
  const [adding, setAdding] = useState<MealSlot | null>(null);
  const [editing, setEditing] = useState<DiaryEntry | null>(null);

  const remove = async (e: DiaryEntry) => {
    await diaryRepo().remove(e.id);
    toast.show('Entry removed', { action: { label: 'Undo', onClick: () => void diaryRepo().add(e) } });
  };

  return (
    <div className="px-4 pb-28 pt-3">
      <header className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => setDate(addDays(dateKey, -1))} className="h-10 w-10 rounded-full bg-surface text-lg" aria-label="Previous day">
          ‹
        </button>
        <label className="relative text-center">
          <div className="text-lg font-semibold">{formatDayLabel(dateKey)}</div>
          <div className="text-xs text-muted">{dateKey}</div>
          <input
            type="date"
            aria-label="Pick a date"
            className="absolute inset-0 opacity-0"
            value={dateKey}
            max={addDays(todayKey(), 7)}
            onChange={(e) => isDateKey(e.target.value) && setDate(e.target.value)}
          />
        </label>
        <button type="button" onClick={() => setDate(addDays(dateKey, 1))} className="h-10 w-10 rounded-full bg-surface text-lg" aria-label="Next day">
          ›
        </button>
      </header>

      <Card className="space-y-3">
        <MacroBar label="Calories" value={day.totals.kcal} target={targets.kcal} color="var(--color-accent)" unit=" kcal" />
        <div className="grid grid-cols-3 gap-3">
          <MacroBar label="Protein" value={day.totals.proteinG} target={targets.proteinG} color="var(--color-protein)" />
          <MacroBar label="Carbs" value={day.totals.carbsG} target={targets.carbsG} color="var(--color-carbs)" />
          <MacroBar label="Fat" value={day.totals.fatG} target={targets.fatG} color="var(--color-fat)" />
        </div>
      </Card>

      {day.entries.length === 0 && !day.loading && (
        <EmptyState icon="🍽" title="Nothing logged">
          Tap a meal below or the + button to add food.
        </EmptyState>
      )}

      {SLOT_ORDER.map((slot) => (
        <section key={slot} className="mt-4">
          <div className="mb-1 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{SLOT_LABEL[slot]}</h2>
            <span className="text-xs text-muted">{Math.round(day.bySlot[slot].reduce((s, e) => s + e.macros.kcal, 0))} kcal</span>
          </div>
          <Card padded={false}>
            {day.bySlot[slot].map((e) => (
              <div key={e.id} className="flex items-center gap-2 border-b border-border/60 px-4 py-2 last:border-0">
                <button type="button" className="min-w-0 flex-1 py-1 text-left" onClick={() => setEditing(e)}>
                  <div className="truncate text-sm">{e.name}</div>
                  <div className="text-xs text-muted">
                    {fmt.grams(e.grams)} · P {Math.round(e.macros.proteinG)} · C {Math.round(e.macros.carbsG)} · F {Math.round(e.macros.fatG)}
                  </div>
                </button>
                <div className="text-sm font-medium">{Math.round(e.macros.kcal)}</div>
                <button type="button" aria-label={`Delete ${e.name}`} className="h-8 w-8 rounded-full text-muted active:bg-surface-2" onClick={() => remove(e)}>
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="flex h-11 w-full items-center px-4 text-sm text-accent active:bg-surface-2" onClick={() => setAdding(slot)}>
              + Add to {SLOT_LABEL[slot].toLowerCase()}
            </button>
          </Card>
        </section>
      ))}

      <div className="fixed bottom-[calc(var(--safe-bottom)+76px)] right-4 z-30">
        <Button size="lg" className="shadow-xl" onClick={() => setAdding(defaultSlot())}>
          + Add food
        </Button>
      </div>

      <FoodSearchSheet open={adding !== null} slot={adding ?? 'snack'} dateKey={dateKey} onClose={() => setAdding(null)} />
      <EditEntrySheet entry={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function defaultSlot(): MealSlot {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 17) return 'snack';
  return 'dinner';
}
