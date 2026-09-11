import { useState } from 'react';
import { Link } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { useReadyProfile } from '@/hooks/useReadyProfile';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useToast } from '@/hooks/useToast';
import { weightRepo } from '@/storage/repos/weightRepo';
import { logWeight } from '@/services/logging';
import { addDays, formatDayLabel, todayKey } from '@/lib/dates';
import { WeightChart } from './WeightChart';

type Range = 30 | 90 | 0;

export function WeightScreen() {
  const { profile } = useReadyProfile();
  const entries = useLiveQuery(() => weightRepo().list(), []);
  const toast = useToast();
  const [range, setRange] = useState<Range>(30);
  const [kg, setKg] = useState<number | null>(profile.weightKg);
  const [dateKey, setDateKey] = useState(todayKey());

  const all = entries ?? [];
  const from = range === 0 ? '' : addDays(todayKey(), -range);
  const shown = all.filter((e) => e.dateKey >= from);
  const first = shown[0];
  const last = shown[shown.length - 1];
  const change = first && last && first !== last ? last.kg - first.kg : null;

  return (
    <div className="px-4 pb-8 pt-3">
      <header className="mb-3 flex items-center gap-3 px-1">
        <Link to="/more" className="text-accent">
          ‹ More
        </Link>
        <h1 className="text-2xl font-semibold">Weight</h1>
      </header>

      <Card>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-muted">Latest</div>
            <div className="text-3xl font-bold">
              {last ? last.kg : profile.weightKg} <span className="text-base font-normal text-muted">kg</span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-muted">Goal {profile.goalWeightKg} kg</div>
            {change !== null && <div className={change <= 0 ? 'text-accent' : 'text-carbs'}>{change > 0 ? '+' : ''}{change.toFixed(1)} kg in range</div>}
          </div>
        </div>
        <div className="mt-4">
          <WeightChart entries={shown} goalKg={profile.goalWeightKg} />
        </div>
        <div className="mt-3">
          <SegmentedControl options={[{ value: 30, label: '30 days' }, { value: 90, label: '90 days' }, { value: 0, label: 'All' }]} value={range} onChange={setRange} />
        </div>
      </Card>

      <Card className="mt-3 space-y-3">
        <NumberField label="Weight" value={kg} onChange={setKg} unit="kg" min={30} max={300} step={0.1} stepper />
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Date</span>
          <input type="date" className="h-12 w-full rounded-xl border border-border bg-surface-2 px-3" value={dateKey} max={todayKey()} onChange={(e) => e.target.value && setDateKey(e.target.value)} />
        </label>
        <Button
          block
          disabled={kg === null || kg < 30 || kg > 300}
          onClick={async () => {
            if (kg === null) return;
            await logWeight(dateKey, kg);
            toast.show('Weight saved', { tone: 'success' });
          }}
        >
          Save
        </Button>
      </Card>

      {all.length > 0 && (
        <Card padded={false} className="mt-3">
          {[...all].reverse().slice(0, 60).map((e) => (
            <div key={e.id} className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 text-sm last:border-0">
              <span className="text-muted">{formatDayLabel(e.dateKey)}</span>
              <span className="font-medium">{e.kg} kg</span>
              <button type="button" aria-label="Delete" className="h-8 w-8 rounded-full text-muted active:bg-surface-2" onClick={() => weightRepo().remove(e.id)}>
                ✕
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
