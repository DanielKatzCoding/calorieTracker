import { useState } from 'react';
import type { DateKey, FoodItem, Macros, MealSlot, ResolvedRecipe } from '@/domain/types';
import { macrosForGrams, roundMacros, scaleMacros } from '@/domain/menu/nutrition';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { logFood, logRecipe } from '@/services/logging';
import { SLOT_LABEL } from '@/domain/menu/slots';
import { fmt } from '@/lib/labels';

export type Addable = { kind: 'food'; food: FoodItem; grams?: number } | { kind: 'recipe'; recipe: ResolvedRecipe; scale: number };

export function PortionEditor({ item, slot, dateKey, onBack, onDone }: { item: Addable; slot: MealSlot; dateKey: DateKey; onBack: () => void; onDone: (name: string) => void }) {
  const [grams, setGrams] = useState<number | null>(item.kind === 'food' ? item.grams ?? item.food.servingG ?? 100 : null);
  const [scale, setScale] = useState(item.kind === 'recipe' ? item.scale : 1);
  const [busy, setBusy] = useState(false);

  const macros: Macros = roundMacros(item.kind === 'food' ? macrosForGrams(item.food, grams ?? 0) : scaleMacros(item.recipe.macros, scale));
  const name = item.kind === 'food' ? item.food.name : item.recipe.name;
  const valid = item.kind === 'food' ? grams !== null && grams > 0 && grams <= 5000 : scale > 0;

  const save = async () => {
    if (!valid) return;
    setBusy(true);
    if (item.kind === 'food') await logFood(dateKey, slot, item.food, grams!);
    else await logRecipe(dateKey, slot, item.recipe, scale);
    onDone(name);
  };

  return (
    <Sheet
      open
      onClose={onBack}
      title={name}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack} className="w-24">
            Back
          </Button>
          <Button block onClick={save} disabled={!valid || busy}>
            Add to {SLOT_LABEL[slot].toLowerCase()} · {fmt.kcal(macros.kcal)}
          </Button>
        </div>
      }
    >
      {item.kind === 'food' ? (
        <>
          <NumberField label="Amount" value={grams} onChange={setGrams} unit="g" min={1} max={5000} step={item.food.servingG && item.food.servingG < 20 ? 1 : 5} stepper />
          <div className="mt-3 flex flex-wrap gap-2">
            {item.food.servingG &&
              [0.5, 1, 2].map((n) => (
                <Preset key={n} label={`${n === 1 ? '' : `${n} × `}${item.food.servingLabel ?? 'serving'}`} onClick={() => setGrams(Math.round(item.food.servingG! * n))} />
              ))}
            {[50, 100, 150, 200].map((g) => (
              <Preset key={g} label={`${g} g`} onClick={() => setGrams(g)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <NumberField label="Portion (servings)" value={scale} onChange={(v) => setScale(v ?? 1)} unit="×" min={0.25} max={4} step={0.25} stepper />
          <p className="mt-2 text-xs text-muted">
            One serving is about {fmt.grams(item.recipe.totalGrams)}. This portion: {fmt.grams(item.recipe.totalGrams * scale)}.
          </p>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-accent">Ingredients</summary>
            <ul className="mt-2 space-y-1 text-muted">
              {item.recipe.ingredients.map((i) => (
                <li key={i.foodId} className="flex justify-between">
                  <span>{i.foodId.replace(/_/g, ' ')}</span>
                  <span>{Math.round(i.grams * scale)} g</span>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}

      <div className="mt-5 grid grid-cols-4 gap-2 text-center">
        <Stat label="kcal" value={macros.kcal} color="text-accent" />
        <Stat label="Protein" value={macros.proteinG} color="text-protein" unit="g" />
        <Stat label="Carbs" value={macros.carbsG} color="text-carbs" unit="g" />
        <Stat label="Fat" value={macros.fatG} color="text-fat" unit="g" />
      </div>
    </Sheet>
  );
}

function Preset({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="h-9 rounded-full border border-border bg-surface-2 px-3 text-sm" onClick={onClick}>
      {label}
    </button>
  );
}

function Stat({ label, value, color, unit = '' }: { label: string; value: number; color: string; unit?: string }) {
  return (
    <div className="rounded-xl bg-surface-2 py-3">
      <div className={`text-lg font-semibold ${color}`}>
        {Math.round(value)}
        <span className="text-xs">{unit}</span>
      </div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
