import type { PlannedMeal, ResolvedRecipe } from '@/domain/types';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/Button';
import { useFoods } from '@/hooks/useFoods';
import { SLOT_LABEL } from '@/domain/menu/slots';
import { CUISINE_OPTIONS, label } from '@/lib/labels';
import { AllergenLine, IngredientList, StepList } from './RecipeDetails';

export interface RecipeSheetProps {
  meal: PlannedMeal | null;
  recipe: ResolvedRecipe | null;
  logged: boolean;
  busy: boolean;
  onClose: () => void;
  onLog: () => void;
  onSwap: () => void;
}

/** Full recipe for one planned meal: portion-scaled ingredients, steps, macros, actions. */
export function RecipeSheet({ meal, recipe, logged, busy, onClose, onLog, onSwap }: RecipeSheetProps) {
  const { foodsById } = useFoods();
  if (!meal || !recipe) return null;
  const m = meal.macros;
  return (
    <Sheet
      open
      onClose={onClose}
      title={recipe.name}
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onSwap} disabled={busy}>
            ↻ Swap meal
          </Button>
          <Button className="flex-1" onClick={onLog}>
            {logged ? 'Log again' : 'Log this'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
        <span className="uppercase tracking-wide">{SLOT_LABEL[meal.slot]}</span>
        {recipe.cuisine !== 'neutral' && <span>{label(CUISINE_OPTIONS, recipe.cuisine)}</span>}
        <span>⏱ {recipe.prepMinutes} min</span>
        <span>{meal.scale === 1 ? '1 serving' : `${meal.scale}× serving`}</span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <Stat label="kcal" value={m.kcal} color="text-accent" />
        <Stat label="Protein" value={m.proteinG} color="text-protein" unit="g" />
        <Stat label="Carbs" value={m.carbsG} color="text-carbs" unit="g" />
        <Stat label="Fat" value={m.fatG} color="text-fat" unit="g" />
      </div>

      <h3 className="mb-1 mt-5 text-sm font-semibold uppercase tracking-wide text-muted">Ingredients · your portion</h3>
      <IngredientList recipe={recipe} scale={meal.scale} foodsById={foodsById} />

      <h3 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-muted">Preparation</h3>
      <StepList recipe={recipe} />
      {recipe.tip && <p className="mt-3 rounded-lg bg-surface-2 p-2 text-xs text-muted">💡 {recipe.tip}</p>}
      <div className="mt-4">
        <AllergenLine recipe={recipe} />
      </div>
    </Sheet>
  );
}

function Stat({ label: l, value, color, unit = '' }: { label: string; value: number; color: string; unit?: string }) {
  return (
    <div className="rounded-xl bg-surface-2 py-2.5">
      <div className={`text-lg font-semibold ${color}`}>
        {Math.round(value)}
        <span className="text-xs">{unit}</span>
      </div>
      <div className="text-xs text-muted">{l}</div>
    </div>
  );
}
