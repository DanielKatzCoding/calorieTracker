import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Profile } from '@/domain/types';
import { computeTargets } from '@/domain/calc/targets';
import { bmi, bmiCategory } from '@/domain/calc/bodyMetrics';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { MacroBar } from '@/components/ProgressBar';
import { profileRepo, type ProfileDraft } from '@/storage/repos/profileRepo';
import { weightRepo } from '@/storage/repos/weightRepo';
import { applyProfileChange } from '@/services/planning';
import { todayKey } from '@/lib/dates';
import { fmt } from '@/lib/labels';

export function ResultsScreen({ draft, existing, onBack }: { draft: ProfileDraft; existing?: Profile; onBack: () => void }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = computeTargets(draft);
  const bmiValue = bmi(draft.weightKg, draft.heightCm);
  const weeks = t.projectedWeeksToGoal;

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const profile = await profileRepo().save(draft);
      if (!existing || existing.weightKg !== draft.weightKg) await weightRepo().upsertForDay(todayKey(), draft.weightKg);
      await applyProfileChange(profile, t, todayKey(), existing);
      navigate(existing ? '/more' : '/today', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-bg text-text">
      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-[calc(var(--safe-top)+20px)]">
        <h1 className="text-2xl font-semibold">Your daily targets</h1>
        <p className="mt-1 text-sm text-muted">Based on the Mifflin-St Jeor equation and your goal.</p>

        <Card className="mt-5 text-center">
          <div className="text-sm text-muted">Daily calories</div>
          <div className="mt-1 text-5xl font-bold text-accent">{t.kcal}</div>
          <div className="mt-1 text-sm text-muted">
            {t.deltaKcal === 0 ? 'at maintenance' : `${t.deltaKcal > 0 ? '+' : ''}${t.deltaKcal} kcal vs. maintenance (${t.tdee})`}
          </div>
          {t.floorApplied && (
            <p className="mt-3 rounded-lg bg-carbs/10 p-2 text-xs text-carbs">
              We raised your target to a safe minimum, so progress will be a little slower than the pace you picked.
            </p>
          )}
        </Card>

        <Card className="mt-3 space-y-3">
          <MacroBar label="Protein" value={t.proteinG} target={t.proteinG} color="var(--color-protein)" />
          <MacroBar label="Carbs" value={t.carbsG} target={t.carbsG} color="var(--color-carbs)" />
          <MacroBar label="Fat" value={t.fatG} target={t.fatG} color="var(--color-fat)" />
        </Card>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Stat label="Resting (BMR)" value={fmt.kcal(t.bmr)} />
          <Stat label="Maintenance (TDEE)" value={fmt.kcal(t.tdee)} />
          <Stat label="BMI" value={`${bmiValue.toFixed(1)} · ${bmiCategory(bmiValue)}`} />
          <Stat
            label="Time to goal"
            value={weeks === null ? '—' : weeks < 1 ? 'under a week' : `~${Math.round(weeks)} weeks`}
          />
        </div>

        <p className="mt-5 text-xs text-muted">
          Estimates only. This is not medical advice; consult a professional before large changes, especially if you have a medical condition.
        </p>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </main>
      <footer className="flex gap-3 border-t border-border px-5 pb-[calc(var(--safe-bottom)+16px)] pt-3">
        <Button variant="secondary" onClick={onBack} className="w-28" disabled={busy}>
          Back
        </Button>
        <Button onClick={start} block disabled={busy}>
          {busy ? 'Building your plan…' : existing ? 'Save changes' : 'Start'}
        </Button>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="!p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </Card>
  );
}
