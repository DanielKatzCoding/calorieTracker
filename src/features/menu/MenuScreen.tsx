import { useState } from 'react';
import type { DailyMenu, MenuWarning, PlannedMeal } from '@/domain/types';
import { useReadyProfile } from '@/hooks/useReadyProfile';
import { useMenu } from '@/hooks/useMenu';
import { useDay } from '@/hooks/useDay';
import { useToast } from '@/hooks/useToast';
import { RESOLVED_RECIPES_BY_ID, useFoods } from '@/hooks/useFoods';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Spinner } from '@/components/Spinner';
import { addDays, todayKey } from '@/lib/dates';
import { fmt } from '@/lib/labels';
import { SLOT_LABEL } from '@/domain/menu/slots';
import { regenerateMenu, swapMenuMeal } from '@/services/planning';
import { logPlannedMeal } from '@/services/logging';
import { Link } from 'react-router';

export function MenuScreen() {
  const { profile, targets } = useReadyProfile();
  const [which, setWhich] = useState<'today' | 'tomorrow'>('today');
  const dateKey = which === 'today' ? todayKey() : addDays(todayKey(), 1);
  const menu = useMenu(dateKey, profile, targets);
  const day = useDay(dateKey);
  const toast = useToast();
  const [busy, setBusy] = useState<number | 'all' | null>(null);
  const [rejected, setRejected] = useState<Record<number, string[]>>({});

  const logged = new Set(day.entries.flatMap((e) => (e.source.kind === 'recipe' ? [e.source.recipeId] : [])));

  const regenerate = async () => {
    setBusy('all');
    await regenerateMenu(profile, targets, dateKey);
    setRejected({});
    setBusy(null);
  };
  const swap = async (m: DailyMenu, idx: number) => {
    setBusy(idx);
    const prev = m.meals[idx]!.recipeId;
    const rej = [...(rejected[idx] ?? []), prev];
    await swapMenuMeal(m, idx, profile, targets, rej);
    setRejected((r) => ({ ...r, [idx]: rej }));
    setBusy(null);
  };

  return (
    <div className="px-4 pb-8 pt-3">
      <header className="mb-3 flex items-center justify-between px-1">
        <h1 className="text-2xl font-semibold">Menu</h1>
        <div className="w-48">
          <SegmentedControl options={[{ value: 'today', label: 'Today' }, { value: 'tomorrow', label: 'Tomorrow' }]} value={which} onChange={setWhich} />
        </div>
      </header>

      {!menu ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <Card className="flex items-center justify-between text-sm">
            <div>
              <div className="text-muted">Planned</div>
              <div className="text-lg font-semibold">
                {Math.round(menu.totals.kcal)} <span className="text-sm font-normal text-muted">/ {targets.kcal} kcal</span>
              </div>
            </div>
            <div className="text-right text-xs text-muted">
              <div>
                <span className="text-protein">P {Math.round(menu.totals.proteinG)}</span> · <span className="text-carbs">C {Math.round(menu.totals.carbsG)}</span> ·{' '}
                <span className="text-fat">F {Math.round(menu.totals.fatG)}</span>
              </div>
              <div className="mt-0.5">
                target P {targets.proteinG} · C {targets.carbsG} · F {targets.fatG}
              </div>
            </div>
          </Card>

          <Warnings warnings={menu.warnings} />

          <div className="mt-3 space-y-3">
            {menu.meals.map((m, idx) => (
              <MealCard
                key={`${m.recipeId}-${idx}`}
                meal={m}
                logged={logged.has(m.recipeId)}
                busy={busy === idx || busy === 'all'}
                onSwap={() => swap(menu, idx)}
                onLog={async () => {
                  const r = m.inlineRecipe ?? RESOLVED_RECIPES_BY_ID.get(m.recipeId);
                  if (!r) return;
                  await logPlannedMeal(dateKey, m, r);
                  toast.show(`Logged ${r.name}`, { tone: 'success' });
                }}
              />
            ))}
          </div>

          <Button variant="secondary" block className="mt-5" onClick={regenerate} disabled={busy !== null}>
            {busy === 'all' ? 'Generating…' : 'Regenerate whole day'}
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            Menus respect your diet, allergies and dislikes.{' '}
            <Link to="/onboarding?edit=1" className="text-accent">
              Change preferences
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

function MealCard({ meal, logged, busy, onSwap, onLog }: { meal: PlannedMeal; logged: boolean; busy: boolean; onSwap: () => void; onLog: () => void }) {
  const { foodsById } = useFoods();
  const [open, setOpen] = useState(false);
  const r = meal.inlineRecipe ?? RESOLVED_RECIPES_BY_ID.get(meal.recipeId);
  if (!r) return null;
  return (
    <Card padded={false}>
      <button type="button" className="w-full p-4 text-left" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-wide text-muted">{SLOT_LABEL[meal.slot]}</span>
          <span className="text-xs text-muted">
            {meal.scale !== 1 && `${meal.scale}× portion · `}
            {r.prepMinutes} min
          </span>
        </div>
        <div className="mt-1 text-base font-semibold">{r.name}</div>
        <div className="mt-1 text-sm text-muted">
          <span className="font-medium text-text">{fmt.kcal(meal.macros.kcal)}</span> · <span className="text-protein">P {Math.round(meal.macros.proteinG)}</span> ·{' '}
          <span className="text-carbs">C {Math.round(meal.macros.carbsG)}</span> · <span className="text-fat">F {Math.round(meal.macros.fatG)}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-border/60 px-4 pb-3 pt-2 text-sm">
          <ul className="space-y-1">
            {r.ingredients.map((i) => (
              <li key={i.foodId} className="flex justify-between text-muted">
                <span>{foodsById.get(i.foodId)?.name ?? i.foodId}</span>
                <span>{Math.round(i.grams * meal.scale)} g</span>
              </li>
            ))}
          </ul>
          {r.instructions && <p className="mt-3 text-muted">{r.instructions}</p>}
        </div>
      )}
      <div className="flex gap-2 border-t border-border/60 p-2">
        <Button variant="ghost" size="sm" className="flex-1" onClick={onSwap} disabled={busy}>
          {busy ? '…' : '↻ Swap'}
        </Button>
        <Button variant={logged ? 'secondary' : 'primary'} size="sm" className="flex-1" onClick={onLog}>
          {logged ? 'Logged ✓ (log again)' : 'Log this'}
        </Button>
      </div>
    </Card>
  );
}

function Warnings({ warnings }: { warnings: MenuWarning[] }) {
  if (warnings.length === 0) return null;
  const text = (w: MenuWarning): string => {
    switch (w.code) {
      case 'KCAL_OUT_OF_TOLERANCE':
        return `Day is ${w.deltaKcal > 0 ? 'over' : 'under'} target by ${Math.abs(w.deltaKcal)} kcal.`;
      case 'PROTEIN_LOW':
        return `Protein is ${w.shortfallG} g short; add a protein-rich snack.`;
      case 'FEW_OPTIONS':
        return `Only ${w.eligible} ${SLOT_LABEL[w.slot].toLowerCase()} recipe${w.eligible === 1 ? '' : 's'} fit your preferences, so it may repeat.`;
      case 'FALLBACK_SIMPLE_PLATE':
        return `No ${SLOT_LABEL[w.slot].toLowerCase()} recipe fits, so we built a simple plate from single foods.`;
      case 'INSUFFICIENT_OPTIONS':
        return `Nothing edible found for ${SLOT_LABEL[w.slot].toLowerCase()}. Loosen your dislikes or diet.`;
    }
  };
  return (
    <ul className="mt-3 space-y-1 rounded-xl border border-carbs/40 bg-carbs/10 p-3 text-xs text-carbs">
      {warnings.map((w, i) => (
        <li key={i}>{text(w)}</li>
      ))}
    </ul>
  );
}
