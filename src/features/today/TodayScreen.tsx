import { useState } from 'react';
import { Link } from 'react-router';
import { useReadyProfile } from '@/hooks/useReadyProfile';
import { useDay } from '@/hooks/useDay';
import { useMenu } from '@/hooks/useMenu';
import { useToast } from '@/hooks/useToast';
import { RESOLVED_RECIPES_BY_ID } from '@/hooks/useFoods';
import { Ring } from '@/components/Ring';
import { Card, SectionTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { todayKey } from '@/lib/dates';
import { SLOT_ORDER, fmt } from '@/lib/labels';
import { SLOT_LABEL } from '@/domain/menu/slots';
import { logPlannedMeal, logWeight } from '@/services/logging';
import { diaryRepo } from '@/storage/repos/diaryRepo';
import { InstallBanner } from './InstallBanner';

export function TodayScreen() {
  const { profile, targets } = useReadyProfile();
  const today = todayKey();
  const day = useDay(today);
  const menu = useMenu(today, profile, targets);
  const toast = useToast();

  const loggedRecipeIds = new Set(day.entries.flatMap((e) => (e.source.kind === 'recipe' ? [e.source.recipeId] : [])));
  const unlogged = (menu?.meals ?? []).filter((m) => !loggedRecipeIds.has(m.recipeId));

  return (
    <div className="px-4 pb-6 pt-3">
      <InstallBanner />
      <header className="mb-4 flex items-baseline justify-between px-1">
        <h1 className="text-2xl font-semibold">Today</h1>
        <span className="text-sm text-muted">{new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
      </header>

      <Card>
        <div className="flex items-start justify-around">
          <Ring value={day.totals.kcal} target={targets.kcal} size={124} stroke={12} color="var(--color-accent)" label="kcal" unit="" showRemaining />
          <div className="flex flex-col gap-3">
            <Ring value={day.totals.proteinG} target={targets.proteinG} size={64} stroke={7} color="var(--color-protein)" label="Protein" unit="g" />
          </div>
          <div className="flex flex-col gap-3">
            <Ring value={day.totals.carbsG} target={targets.carbsG} size={64} stroke={7} color="var(--color-carbs)" label="Carbs" unit="g" />
          </div>
          <div className="flex flex-col gap-3">
            <Ring value={day.totals.fatG} target={targets.fatG} size={64} stroke={7} color="var(--color-fat)" label="Fat" unit="g" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x divide-border text-center text-sm">
          <div>
            <div className="text-muted">Eaten</div>
            <div className="font-semibold">{Math.round(day.totals.kcal)}</div>
          </div>
          <div>
            <div className="text-muted">Target</div>
            <div className="font-semibold">{targets.kcal}</div>
          </div>
          <div>
            <div className="text-muted">Burned</div>
            <div className="font-semibold text-accent">{day.burned > 0 ? `+${day.burned}` : '0'}</div>
          </div>
        </div>
      </Card>

      {unlogged.length > 0 && (
        <>
          <SectionTitle action={<Link to="/menu" className="text-sm text-accent">Full menu</Link>}>From today's menu</SectionTitle>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {unlogged.map((m, i) => {
              const r = m.inlineRecipe ?? RESOLVED_RECIPES_BY_ID.get(m.recipeId);
              if (!r) return null;
              return (
                <button
                  key={`${m.recipeId}-${i}`}
                  type="button"
                  className="min-w-[180px] shrink-0 rounded-xl border border-border bg-surface p-3 text-left active:bg-surface-2"
                  onClick={async () => {
                    await logPlannedMeal(today, m, r);
                    toast.show(`Logged ${r.name}`, { tone: 'success' });
                  }}
                >
                  <div className="text-xs uppercase tracking-wide text-muted">{SLOT_LABEL[m.slot]}</div>
                  <div className="mt-0.5 line-clamp-2 text-sm font-medium">{r.name}</div>
                  <div className="mt-1 text-xs text-muted">{fmt.kcal(m.macros.kcal)} · tap to log</div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <SectionTitle action={<Link to="/diary" className="text-sm text-accent">Open diary</Link>}>Logged today</SectionTitle>
      {day.entries.length === 0 ? (
        <Card className="text-center text-sm text-muted">
          Nothing logged yet.{' '}
          <Link to="/diary" className="text-accent">
            Add your first meal
          </Link>
          .
        </Card>
      ) : (
        <Card padded={false}>
          {SLOT_ORDER.filter((s) => day.bySlot[s].length > 0).map((slot) => (
            <div key={slot} className="border-b border-border/60 last:border-0">
              <div className="flex justify-between px-4 pt-3 text-xs uppercase tracking-wide text-muted">
                <span>{SLOT_LABEL[slot]}</span>
                <span>{Math.round(day.bySlot[slot].reduce((s, e) => s + e.macros.kcal, 0))} kcal</span>
              </div>
              {day.bySlot[slot].map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{e.name}</div>
                    <div className="text-xs text-muted">
                      {fmt.grams(e.grams)} · P {Math.round(e.macros.proteinG)} · C {Math.round(e.macros.carbsG)} · F {Math.round(e.macros.fatG)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">{Math.round(e.macros.kcal)}</div>
                  <button
                    type="button"
                    aria-label={`Delete ${e.name}`}
                    className="h-8 w-8 rounded-full text-muted active:bg-surface-2"
                    onClick={async () => {
                      await diaryRepo().remove(e.id);
                      toast.show('Entry removed', { action: { label: 'Undo', onClick: () => void diaryRepo().add(e) } });
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ))}
        </Card>
      )}

      {day.workouts.length > 0 && (
        <>
          <SectionTitle action={<Link to="/train" className="text-sm text-accent">Train</Link>}>Workouts</SectionTitle>
          <Card padded={false}>
            {day.workouts.map((w) => (
              <div key={w.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{w.title}</span>
                <span className="text-muted">
                  {w.durationMin} min · <span className="text-accent">{w.kcalBurned} kcal</span>
                </span>
              </div>
            ))}
          </Card>
        </>
      )}

      <SectionTitle action={<Link to="/more/weight" className="text-sm text-accent">History</Link>}>Weight</SectionTitle>
      <QuickWeight current={profile.weightKg} />
    </div>
  );
}

function QuickWeight({ current }: { current: number }) {
  const [kg, setKg] = useState<number | null>(current);
  const [saved, setSaved] = useState(false);
  const toast = useToast();
  return (
    <Card className="flex items-end gap-3">
      <div className="flex-1">
        <NumberField label="Today's weight" value={kg} onChange={(v) => { setKg(v); setSaved(false); }} unit="kg" step={0.1} min={30} max={300} stepper />
      </div>
      <Button
        variant={saved ? 'secondary' : 'primary'}
        className="h-12"
        disabled={kg === null || kg < 30 || kg > 300}
        onClick={async () => {
          if (kg === null) return;
          await logWeight(todayKey(), kg);
          setSaved(true);
          toast.show('Weight saved', { tone: 'success' });
        }}
      >
        {saved ? 'Saved' : 'Save'}
      </Button>
    </Card>
  );
}
