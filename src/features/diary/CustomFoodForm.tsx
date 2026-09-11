import { useState } from 'react';
import type { FoodItem } from '@/domain/types';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { SegmentedControl } from '@/components/SegmentedControl';
import { customFoodRepo } from '@/storage/repos/customFoodRepo';

/** Create a food from a label. Values are entered per 100 g or per serving and normalised. */
export function CustomFoodForm({ onBack, onCreated }: { onBack: () => void; onCreated: (food: FoodItem) => void }) {
  const [name, setName] = useState('');
  const [basis, setBasis] = useState<'per100' | 'serving'>('per100');
  const [servingG, setServingG] = useState<number | null>(null);
  const [kcal, setKcal] = useState<number | null>(null);
  const [p, setP] = useState<number | null>(null);
  const [c, setC] = useState<number | null>(null);
  const [f, setF] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const factor = basis === 'per100' ? 1 : servingG && servingG > 0 ? 100 / servingG : null;
  const valid = name.trim().length > 0 && kcal !== null && kcal >= 0 && factor !== null && (p ?? 0) >= 0 && (c ?? 0) >= 0 && (f ?? 0) >= 0;

  const save = async () => {
    if (!valid || factor === null) return;
    setBusy(true);
    const food = await customFoodRepo().add({
      name: name.trim(),
      category: 'snack',
      per100g: { kcal: (kcal ?? 0) * factor, proteinG: (p ?? 0) * factor, carbsG: (c ?? 0) * factor, fatG: (f ?? 0) * factor },
      servingG: servingG ?? undefined,
      servingLabel: servingG ? '1 serving' : undefined,
      allergens: [],
      diets: ['omnivore', 'pescatarian', 'vegetarian', 'vegan'],
      ketoFriendly: (c ?? 0) * factor <= 5,
    });
    onCreated(food);
  };

  return (
    <Sheet
      open
      onClose={onBack}
      title="New custom food"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack} className="w-24">
            Back
          </Button>
          <Button block onClick={save} disabled={!valid || busy}>
            Save and add
          </Button>
        </div>
      }
    >
      <label className="block">
        <span className="mb-1 block text-sm text-muted">Name</span>
        <input
          type="text"
          autoFocus
          className="h-12 w-full rounded-xl border border-border bg-surface-2 px-4 outline-none focus:border-accent"
          placeholder="e.g. Mom's lasagna"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <div className="mt-4">
        <div className="mb-2 text-sm text-muted">Nutrition label is per</div>
        <SegmentedControl options={[{ value: 'per100', label: '100 g' }, { value: 'serving', label: 'One serving' }]} value={basis} onChange={setBasis} />
      </div>
      {basis === 'serving' && <div className="mt-3"><NumberField label="Serving size" value={servingG} onChange={setServingG} unit="g" min={1} /></div>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <NumberField label="Calories" value={kcal} onChange={setKcal} unit="kcal" min={0} />
        <NumberField label="Protein" value={p} onChange={setP} unit="g" min={0} step={0.1} />
        <NumberField label="Carbs" value={c} onChange={setC} unit="g" min={0} step={0.1} />
        <NumberField label="Fat" value={f} onChange={setF} unit="g" min={0} step={0.1} />
      </div>
      <p className="mt-3 text-xs text-muted">Custom foods are treated as suitable for any diet and allergen-free; they appear in search, not in generated menus.</p>
    </Sheet>
  );
}
