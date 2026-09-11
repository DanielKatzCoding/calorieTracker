import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Profile } from '@/domain/types';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { NumberField } from '@/components/NumberField';
import { ChipSelect, SegmentedControl } from '@/components/SegmentedControl';
import { FOODS } from '@/data/foods';
import { searchFoods } from '@/hooks/useFoods';
import {
  ACTIVITY_OPTIONS, ALLERGEN_OPTIONS, CUISINE_OPTIONS, DIET_OPTIONS, EQUIPMENT_OPTIONS, GOAL_OPTIONS, LEVEL_OPTIONS, PACE_OPTIONS,
} from '@/lib/labels';
import { draftFromProfile, EMPTY_DRAFT, STEPS, stepError, toProfileDraft, type QuizDraft, type StepId } from './draft';
import { ResultsScreen } from './ResultsScreen';

export function QuizWizard({ existing }: { existing?: Profile }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<QuizDraft>(() => (existing ? draftFromProfile(existing) : EMPTY_DRAFT));
  const [index, setIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [touched, setTouched] = useState(false);

  const step = STEPS[index]!;
  const error = stepError(step.id, draft);
  const patch = (changes: Partial<QuizDraft>) => setDraft((d) => ({ ...d, ...changes }));
  const patchTraining = (changes: Partial<QuizDraft['training']>) => setDraft((d) => ({ ...d, training: { ...d.training, ...changes } }));

  const next = () => {
    if (error) {
      setTouched(true);
      return;
    }
    setTouched(false);
    if (index === STEPS.length - 1) setShowResults(true);
    else setIndex(index + 1);
  };
  const back = () => {
    setTouched(false);
    if (index === 0) {
      if (existing) navigate(-1);
      return;
    }
    setIndex(index - 1);
  };

  if (showResults) {
    const profileDraft = toProfileDraft(draft);
    if (profileDraft) return <ResultsScreen draft={profileDraft} existing={existing} onBack={() => setShowResults(false)} />;
    setShowResults(false);
  }

  return (
    <div className="flex h-dvh flex-col bg-bg text-text">
      <header className="px-5 pb-2 pt-[calc(var(--safe-top)+12px)]">
        <div className="mb-3 flex items-center justify-between text-xs text-muted">
          <span>{existing ? 'Edit profile' : 'Set up'}</span>
          <span>
            {index + 1} / {STEPS.length}
          </span>
        </div>
        <ProgressBar value={index + 1} max={STEPS.length} height={4} />
        <h1 className="mt-5 text-2xl font-semibold">{step.title}</h1>
        <p className="mt-1 text-sm text-muted">{step.subtitle}</p>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-4 pt-3">
        <StepBody id={step.id} draft={draft} patch={patch} patchTraining={patchTraining} />
        {touched && error && <p className="mt-4 text-sm text-danger">{error}</p>}
      </main>

      <footer className="flex gap-3 border-t border-border px-5 pb-[calc(var(--safe-bottom)+16px)] pt-3">
        {(index > 0 || existing) && (
          <Button variant="secondary" onClick={back} className="w-28">
            Back
          </Button>
        )}
        <Button onClick={next} block disabled={!!error && touched}>
          {index === STEPS.length - 1 ? 'See my plan' : 'Next'}
        </Button>
      </footer>
    </div>
  );
}

function StepBody({
  id,
  draft: d,
  patch,
  patchTraining,
}: {
  id: StepId;
  draft: QuizDraft;
  patch: (c: Partial<QuizDraft>) => void;
  patchTraining: (c: Partial<QuizDraft['training']>) => void;
}) {
  switch (id) {
    case 'about':
      return (
        <div className="space-y-6">
          <Field label="Sex">
            <SegmentedControl
              options={[{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]}
              value={d.sex ?? null}
              onChange={(sex) => patch({ sex })}
            />
            <p className="mt-2 text-xs text-muted">Used only for the metabolic formula.</p>
          </Field>
          <NumberField label="Age" value={d.age ?? null} onChange={(age) => patch({ age: age ?? undefined })} unit="years" min={13} max={100} />
        </div>
      );
    case 'body':
      return (
        <div className="space-y-6">
          <NumberField label="Height" value={d.heightCm ?? null} onChange={(v) => patch({ heightCm: v ?? undefined })} unit="cm" min={120} max={230} />
          <NumberField label="Current weight" value={d.weightKg ?? null} onChange={(v) => patch({ weightKg: v ?? undefined })} unit="kg" min={30} max={300} step={0.1} />
        </div>
      );
    case 'goal':
      return (
        <div className="space-y-6">
          <SegmentedControl options={GOAL_OPTIONS} value={d.goal ?? null} onChange={(goal) => patch({ goal })} vertical />
          {d.goal && d.goal !== 'maintain' && (
            <>
              <NumberField label="Goal weight" value={d.goalWeightKg ?? null} onChange={(v) => patch({ goalWeightKg: v ?? undefined })} unit="kg" min={30} max={300} step={0.5} />
              <Field label="Pace">
                <SegmentedControl options={PACE_OPTIONS} value={d.pace ?? null} onChange={(pace) => patch({ pace })} columns={2} />
                <p className="mt-2 text-xs text-muted">We never go below 1200 kcal (women) / 1500 kcal (men) or 90% of your resting metabolism.</p>
              </Field>
            </>
          )}
        </div>
      );
    case 'activity':
      return <SegmentedControl options={ACTIVITY_OPTIONS} value={d.activity ?? null} onChange={(activity) => patch({ activity })} vertical />;
    case 'diet':
      return <SegmentedControl options={DIET_OPTIONS} value={d.diet ?? null} onChange={(diet) => patch({ diet })} vertical />;
    case 'allergens':
      return (
        <div>
          <ChipSelect options={ALLERGEN_OPTIONS} value={d.allergens ?? []} onChange={(allergens) => patch({ allergens })} />
          {(d.allergens ?? []).length === 0 && <p className="mt-4 text-sm text-muted">None selected. Tap Next if that is right.</p>}
        </div>
      );
    case 'dislikes':
      return <DislikesPicker value={d.dislikedFoodIds ?? []} onChange={(dislikedFoodIds) => patch({ dislikedFoodIds })} />;
    case 'cuisines':
      return <ChipSelect options={CUISINE_OPTIONS} value={d.cuisines ?? []} onChange={(cuisines) => patch({ cuisines })} />;
    case 'meals':
      return (
        <SegmentedControl
          options={[
            { value: 3, label: '3', description: 'Breakfast, lunch, dinner' },
            { value: 4, label: '4', description: '+ 1 snack' },
            { value: 5, label: '5', description: '+ 2 snacks' },
            { value: 6, label: '6', description: '+ 3 snacks' },
          ]}
          value={d.mealsPerDay ?? null}
          onChange={(mealsPerDay) => patch({ mealsPerDay })}
          columns={2}
        />
      );
    case 'training':
      return (
        <div className="space-y-6">
          <Field label="Training days per week">
            <SegmentedControl
              options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: String(n) }))}
              value={d.training.daysPerWeek ?? null}
              onChange={(daysPerWeek) => patchTraining({ daysPerWeek })}
              columns={3}
            />
          </Field>
          <Field label="Equipment">
            <SegmentedControl options={EQUIPMENT_OPTIONS} value={d.training.equipment ?? null} onChange={(equipment) => patchTraining({ equipment })} vertical />
          </Field>
          <Field label="Experience">
            <SegmentedControl options={LEVEL_OPTIONS} value={d.training.level ?? null} onChange={(level) => patchTraining({ level })} vertical />
          </Field>
        </div>
      );
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm text-muted">{label}</div>
      {children}
    </div>
  );
}

function DislikesPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchFoods(FOODS, query, 12).filter((f) => !value.includes(f.id)), [query, value]);
  const selected = value.map((id) => FOODS.find((f) => f.id === id)).filter((f): f is NonNullable<typeof f> => !!f);
  return (
    <div>
      <input
        type="search"
        placeholder="Search foods, e.g. mushrooms"
        className="h-12 w-full rounded-xl border border-border bg-surface-2 px-4 outline-none focus:border-accent"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-xl border border-border bg-surface">
          {results.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className="flex h-11 w-full items-center justify-between px-4 text-left active:bg-surface-2"
                onClick={() => {
                  onChange([...value, f.id]);
                  setQuery('');
                }}
              >
                <span>{f.name}</span>
                <span className="text-muted">+</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm text-muted">Excluded ({selected.length})</div>
          <div className="flex flex-wrap gap-2">
            {selected.map((f) => (
              <button
                key={f.id}
                type="button"
                className="h-9 rounded-full border border-danger/40 bg-danger/10 px-3 text-sm"
                onClick={() => onChange(value.filter((id) => id !== f.id))}
              >
                {f.name.split(',')[0]} ✕
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
