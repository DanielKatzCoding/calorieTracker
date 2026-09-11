import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { WorkoutDay, WorkoutTemplate } from '@/domain/types';
import { useReadyProfile } from '@/hooks/useReadyProfile';
import { useToast } from '@/hooks/useToast';
import { EXERCISES_BY_ID } from '@/data/exercises';
import { Button } from '@/components/Button';
import { Card, SectionTitle } from '@/components/Card';
import { Spinner } from '@/components/Spinner';
import { workoutRepo } from '@/storage/repos/workoutRepo';
import { regenerateWorkoutPlan } from '@/services/planning';
import { formatDayLabel } from '@/lib/dates';
import { label, EQUIPMENT_OPTIONS, LEVEL_OPTIONS } from '@/lib/labels';
import { LogWorkoutSheet, type LogTarget } from './LogWorkoutSheet';

export function TrainScreen() {
  const { profile } = useReadyProfile();
  const template = useLiveQuery(() => workoutRepo().getTemplate(), [], 'loading' as const);
  const logs = useLiveQuery(() => workoutRepo().listLogs(), []);
  const toast = useToast();
  const [openDay, setOpenDay] = useState<number | null>(0);
  const [logging, setLogging] = useState<LogTarget | null>(null);
  const [busy, setBusy] = useState(false);

  if (template === 'loading') return <div className="flex justify-center py-16"><Spinner /></div>;

  const regenerate = async () => {
    setBusy(true);
    await regenerateWorkoutPlan(profile);
    setBusy(false);
    toast.show('New plan generated', { tone: 'success' });
  };

  return (
    <div className="px-4 pb-8 pt-3">
      <header className="mb-3 flex items-center justify-between px-1">
        <h1 className="text-2xl font-semibold">Train</h1>
        <Button variant="ghost" size="sm" onClick={() => setLogging({ kind: 'other' })}>
          + Log activity
        </Button>
      </header>

      {!template ? (
        <Card className="text-center">
          <p className="text-sm text-muted">No plan yet.</p>
          <Button className="mt-3" onClick={regenerate} disabled={busy}>
            Generate my plan
          </Button>
        </Card>
      ) : (
        <>
          <Card className="flex items-center justify-between text-sm">
            <div>
              <div className="font-semibold">{template.name}</div>
              <div className="text-muted">
                {label(EQUIPMENT_OPTIONS, template.equipment)} · {label(LEVEL_OPTIONS, template.level)}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={regenerate} disabled={busy}>
              {busy ? '…' : '↻ New plan'}
            </Button>
          </Card>

          <div className="mt-3 space-y-2">
            {template.days.map((d) => (
              <DayCard key={d.dayIndex} day={d} open={openDay === d.dayIndex} onToggle={() => setOpenDay(openDay === d.dayIndex ? null : d.dayIndex)} onLog={() => setLogging({ kind: 'plan', template, day: d })} />
            ))}
          </div>
        </>
      )}

      <SectionTitle>History</SectionTitle>
      {!logs?.length ? (
        <Card className="text-center text-sm text-muted">Logged workouts show up here with estimated calories.</Card>
      ) : (
        <Card padded={false}>
          {logs.slice(0, 30).map((w) => (
            <div key={w.id} className="flex items-center gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-0">
              <div className="min-w-0 flex-1">
                <div className="truncate">{w.title}</div>
                <div className="text-xs text-muted">
                  {formatDayLabel(w.dateKey)} · {w.durationMin} min · {w.intensity}
                </div>
              </div>
              <div className="font-medium text-accent">{w.kcalBurned} kcal</div>
              <button
                type="button"
                aria-label="Delete workout"
                className="h-8 w-8 rounded-full text-muted active:bg-surface-2"
                onClick={async () => {
                  await workoutRepo().removeLog(w.id);
                  toast.show('Workout removed', { action: { label: 'Undo', onClick: () => void workoutRepo().addLog(w) } });
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </Card>
      )}

      <LogWorkoutSheet target={logging} onClose={() => setLogging(null)} />
    </div>
  );
}

function DayCard({ day, open, onToggle, onLog }: { day: WorkoutDay; open: boolean; onToggle: () => void; onLog: () => void }) {
  return (
    <Card padded={false}>
      <button type="button" className="flex w-full items-center justify-between p-4 text-left" onClick={onToggle}>
        <div>
          <div className="font-semibold">
            Day {day.dayIndex + 1} · {day.name}
          </div>
          <div className="text-xs text-muted">
            {day.focus} · {day.exercises.length} exercises · ~{day.estMinutes} min
          </div>
        </div>
        <span className="text-muted">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="border-t border-border/60">
          <ol className="divide-y divide-border/60">
            {day.exercises.map((p, i) => {
              const ex = EXERCISES_BY_ID.get(p.exerciseId);
              return (
                <li key={`${p.exerciseId}-${i}`} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <div>{ex?.name ?? p.exerciseId}</div>
                    <div className="text-xs text-muted">{ex?.muscles.join(', ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {p.sets} × {p.repMin}–{p.repMax}
                      {p.timed ? ' s' : ''}
                    </div>
                    <div className="text-xs text-muted">rest {p.restSec} s</div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="p-2">
            <Button block size="sm" onClick={onLog}>
              Log this workout
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export type { WorkoutTemplate };
