import { useState } from 'react';
import type { Intensity, WorkoutDay, WorkoutTemplate } from '@/domain/types';
import { EXERCISES } from '@/data/exercises';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useToast } from '@/hooks/useToast';
import { logWorkout } from '@/services/logging';
import { todayKey } from '@/lib/dates';

export type LogTarget = { kind: 'plan'; template: WorkoutTemplate; day: WorkoutDay } | { kind: 'other' };

const CARDIO = EXERCISES.filter((e) => e.pattern === 'cardio');

export function LogWorkoutSheet({ target, onClose }: { target: LogTarget | null; onClose: () => void }) {
  if (!target) return null;
  return <Inner key={target.kind === 'plan' ? target.day.dayIndex : 'other'} target={target} onClose={onClose} />;
}

function Inner({ target, onClose }: { target: LogTarget; onClose: () => void }) {
  const toast = useToast();
  const [duration, setDuration] = useState<number | null>(target.kind === 'plan' ? target.day.estMinutes : 30);
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  const [cardioId, setCardioId] = useState<string>(CARDIO[0]!.id);
  const [dateKey, setDateKey] = useState(todayKey());
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!duration || duration <= 0) return;
    setBusy(true);
    const log = await logWorkout(
      target.kind === 'plan'
        ? {
            dateKey,
            title: target.day.name,
            durationMin: duration,
            intensity,
            templateId: target.template.id,
            dayIndex: target.day.dayIndex,
            exerciseIds: target.day.exercises.map((e) => e.exerciseId),
          }
        : { dateKey, title: CARDIO.find((c) => c.id === cardioId)?.name ?? 'Activity', durationMin: duration, intensity, cardioExerciseId: cardioId },
    );
    toast.show(`Logged · about ${log.kcalBurned} kcal burned`, { tone: 'success' });
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={target.kind === 'plan' ? `Log ${target.day.name}` : 'Log activity'}
      footer={
        <Button block onClick={save} disabled={busy || !duration}>
          Save workout
        </Button>
      }
    >
      {target.kind === 'other' && (
        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-muted">Activity</span>
          <select className="h-12 w-full rounded-xl border border-border bg-surface-2 px-3" value={cardioId} onChange={(e) => setCardioId(e.target.value)}>
            {CARDIO.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <NumberField label="Duration" value={duration} onChange={setDuration} unit="min" min={5} max={300} step={5} stepper />
      {target.kind === 'plan' && (
        <div className="mt-4">
          <div className="mb-2 text-sm text-muted">How hard was it?</div>
          <SegmentedControl
            options={[
              { value: 'light', label: 'Light' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'vigorous', label: 'Hard' },
            ]}
            value={intensity}
            onChange={setIntensity}
          />
        </div>
      )}
      <label className="mt-4 block">
        <span className="mb-1 block text-sm text-muted">Date</span>
        <input type="date" className="h-12 w-full rounded-xl border border-border bg-surface-2 px-3" value={dateKey} max={todayKey()} onChange={(e) => e.target.value && setDateKey(e.target.value)} />
      </label>
      <p className="mt-4 text-xs text-muted">Calories are estimated from MET values and your latest weight. Treat them as a rough guide.</p>
    </Sheet>
  );
}
