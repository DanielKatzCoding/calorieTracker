import type { FoodItem, ResolvedRecipe } from '@/domain/types';
import { ALLERGEN_OPTIONS, label } from '@/lib/labels';
import { servingHint } from '@/lib/servings';

export function IngredientList({ recipe, scale, foodsById }: { recipe: ResolvedRecipe; scale: number; foodsById: ReadonlyMap<string, FoodItem> }) {
  return (
    <ul className="divide-y divide-border/50">
      {recipe.ingredients.map((i) => {
        const food = foodsById.get(i.foodId);
        const grams = Math.round(i.grams * scale);
        const hint = servingHint(food, grams);
        return (
          <li key={i.foodId} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
            <span>{food?.name ?? i.foodId}</span>
            <span className="shrink-0 text-right text-muted">
              {grams} g{hint && <span className="ml-1 text-xs"> · {hint}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function StepList({ recipe }: { recipe: ResolvedRecipe }) {
  return (
    <ol className="space-y-2.5 text-sm">
      {recipe.steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">{i + 1}</span>
          <span className="pt-0.5">{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function AllergenLine({ recipe }: { recipe: ResolvedRecipe }) {
  return (
    <p className="text-xs text-muted">
      Contains: {recipe.allergens.length ? recipe.allergens.map((a) => label(ALLERGEN_OPTIONS, a).toLowerCase()).join(', ') : 'none of the tracked allergens'}
    </p>
  );
}
