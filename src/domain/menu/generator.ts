import type {
  Allergen,
  Cuisine,
  DailyMenu,
  DateKey,
  DietPattern,
  FoodItem,
  Macros,
  MealSlot,
  MealsPerDay,
  MenuWarning,
  PlannedMeal,
  ResolvedRecipe,
} from '../types';
import { hashString, mulberry32, type Rng } from '../random';
import { eligibleRecipes, foodAllowed, rankRecipes, type Constraints } from './filter';
import { indexById, resolveRecipe, roundMacros, sumMacros } from './nutrition';
import { ADJACENT_SLOTS, slotsFor, type SlotSpec } from './slots';
import { chooseMeal, MAX_SCALE, MIN_SCALE, SCALE_STEP, scaleRecipe } from './scale';

export interface MenuProfile {
  diet: DietPattern;
  allergens: Allergen[];
  dislikedFoodIds: string[];
  cuisines: Cuisine[];
  mealsPerDay: MealsPerDay;
}

export interface MenuInput {
  profile: MenuProfile;
  /** Daily targets. */
  targets: Pick<Macros, 'kcal' | 'proteinG'>;
  recipes: readonly ResolvedRecipe[];
  /** Single foods, used to synthesise a "simple plate" when no recipe fits. */
  foods: readonly FoodItem[];
  recentRecipeIds?: readonly string[];
  seed: number;
  dateKey: DateKey;
  now?: string;
}

export const KCAL_TOLERANCE = 0.05;
export const PROTEIN_FLOOR = 0.9;
export const FEW_OPTIONS_THRESHOLD = 3;
const MAX_KCAL_FIXUP_ITERATIONS = 8;
const MAX_PROTEIN_REPLACEMENTS = 3;
const MAX_KCAL_REPLACEMENTS = 2;

interface SlotTarget extends SlotSpec {
  kcal: number;
  proteinG: number;
}

function slotTargets(input: MenuInput): SlotTarget[] {
  return slotsFor(input.profile.mealsPerDay).map((s) => ({
    ...s,
    kcal: input.targets.kcal * s.fraction,
    proteinG: input.targets.proteinG * s.fraction,
  }));
}

function constraintsOf(p: MenuProfile): Constraints {
  return { diet: p.diet, allergens: p.allergens, dislikedFoodIds: p.dislikedFoodIds };
}

interface SlotPick {
  meal: PlannedMeal | null;
  warnings: MenuWarning[];
}

/** Recipes usable for a slot after exclusions, widening to adjacent slots when the slot is empty. */
function candidatesFor(
  slot: MealSlot,
  input: MenuInput,
  exclude: ReadonlySet<string>,
  warnings: MenuWarning[],
): ResolvedRecipe[] {
  const c = constraintsOf(input.profile);
  const notExcluded = (r: ResolvedRecipe) => !exclude.has(r.id);
  let pool = eligibleRecipes(input.recipes, slot, c);
  let eligible = pool.filter(notExcluded);
  // Allow same-day repeats before giving up on the slot entirely.
  if (eligible.length === 0 && pool.length > 0) eligible = pool;
  if (eligible.length === 0) {
    for (const adj of ADJACENT_SLOTS[slot]) {
      pool = eligibleRecipes(input.recipes, adj, c);
      eligible = pool.filter(notExcluded);
      if (eligible.length === 0 && pool.length > 0) eligible = pool;
      if (eligible.length > 0) break;
    }
  }
  if (eligible.length > 0 && eligible.length < FEW_OPTIONS_THRESHOLD) {
    warnings.push({ code: 'FEW_OPTIONS', slot, eligible: eligible.length });
  }
  return eligible;
}

function pickForSlot(
  target: SlotTarget,
  input: MenuInput,
  exclude: ReadonlySet<string>,
  rng: Rng,
  recentRecipeIds: readonly string[],
): SlotPick {
  const warnings: MenuWarning[] = [];
  const candidates = candidatesFor(target.slot, input, exclude, warnings);
  if (candidates.length > 0) {
    const ranked = rankRecipes(candidates, { cuisines: input.profile.cuisines, recentRecipeIds, rng });
    const choice = chooseMeal(ranked, target.kcal, target.proteinG);
    if (choice) {
      return {
        meal: { slot: target.slot, recipeId: choice.recipe.id, scale: choice.scale, macros: choice.macros },
        warnings,
      };
    }
  }
  const plate = simplePlate(target, input, rng);
  if (plate) {
    warnings.push({ code: 'FALLBACK_SIMPLE_PLATE', slot: target.slot });
    return {
      meal: { slot: target.slot, recipeId: plate.id, scale: 1, macros: plate.macros, inlineRecipe: plate },
      warnings,
    };
  }
  warnings.push({ code: 'INSUFFICIENT_OPTIONS', slot: target.slot });
  return { meal: null, warnings };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Builds a plain protein + carb + vegetable + fat plate from single foods the person can eat,
 * sized so protein meets the slot target and energy is close to the slot target.
 */
export function simplePlate(target: SlotTarget, input: MenuInput, rng: Rng): ResolvedRecipe | null {
  const c = constraintsOf(input.profile);
  const allowed = input.foods.filter((f) => foodAllowed(f, c));
  const proteins = allowed
    .filter((f) => ['protein', 'legume', 'dairy'].includes(f.category) && f.per100g.proteinG >= 10 && f.per100g.kcal <= 350)
    .sort((a, b) => b.per100g.proteinG / b.per100g.kcal - a.per100g.proteinG / a.per100g.kcal);
  if (proteins.length === 0) return null;
  const vegs = allowed.filter((f) => f.category === 'vegetable' && f.per100g.kcal <= 60 && (f.servingG ?? 0) >= 50);
  const carbs = c.diet === 'keto' ? [] : allowed.filter((f) => f.category === 'grain' && f.per100g.kcal <= 200 && (f.servingG ?? 0) >= 100);
  const fats = allowed.filter((f) => f.category === 'fat' && f.per100g.fatG >= 50);

  const pickFrom = <T>(list: T[], n: number): T | undefined =>
    list.length ? list[Math.floor(rng() * Math.min(n, list.length))] : undefined;
  const protein = pickFrom(proteins, 6)!;
  const veg = pickFrom(vegs, vegs.length);
  const carb = pickFrom(carbs, carbs.length);
  const fat = pickFrom(fats, fats.length);

  const ingredients: { foodId: string; grams: number }[] = [];
  let kcal = 0;
  let proteinG = 0;
  if (veg) {
    ingredients.push({ foodId: veg.id, grams: 150 });
    kcal += veg.per100g.kcal * 1.5;
    proteinG += veg.per100g.proteinG * 1.5;
  }
  const proteinGrams = clamp(((target.proteinG - proteinG) / protein.per100g.proteinG) * 100, 60, 300);
  ingredients.push({ foodId: protein.id, grams: Math.round(proteinGrams) });
  kcal += (protein.per100g.kcal * proteinGrams) / 100;

  let remaining = target.kcal - kcal;
  if (carb && remaining > 0) {
    const carbGrams = clamp((remaining * 0.75 * 100) / carb.per100g.kcal, 0, 300);
    if (carbGrams >= 30) {
      ingredients.push({ foodId: carb.id, grams: Math.round(carbGrams) });
      remaining -= (carb.per100g.kcal * carbGrams) / 100;
    }
  }
  if (fat && remaining > 0) {
    const fatGrams = clamp((remaining * 100) / fat.per100g.kcal, 5, 60);
    ingredients.push({ foodId: fat.id, grams: Math.round(fatGrams) });
  }

  const foodsById = indexById(input.foods);
  const short = (f: FoodItem) => f.name.split(',')[0]!.toLowerCase();
  const names = ingredients.map((i) => foodsById.get(i.foodId)!.name.split(',')[0]);
  const id = `simple:${target.slot}:${hashString(ingredients.map((i) => `${i.foodId}${i.grams}`).join('|'))}`;
  const usedCarb = carb && ingredients.some((i) => i.foodId === carb.id);
  const usedFat = fat && ingredients.some((i) => i.foodId === fat.id);
  const steps: string[] = [];
  if (usedCarb) steps.push(`Cook the ${short(carb)} according to the package and keep warm.`);
  steps.push(
    protein.category === 'dairy'
      ? `Serve the ${short(protein)} as it is, seasoned with pepper or herbs.`
      : `Season the ${short(protein)} with salt, pepper and your favourite spices; grill, pan-fry or bake until cooked through.`,
  );
  if (veg) steps.push(`Steam, roast or pan-fry the ${short(veg)} until just tender.`);
  steps.push(usedFat ? `Plate everything and finish with the ${short(fat)}.` : 'Plate everything and season to taste.');
  return resolveRecipe(
    {
      id,
      name: `Simple plate: ${names.join(', ')}`,
      slots: [target.slot],
      cuisine: 'neutral',
      ingredients,
      prepMinutes: 20,
      steps,
      tip: 'Built from single foods because no saved recipe fits your preferences for this meal.',
    },
    foodsById,
  );
}

function totalsOf(meals: PlannedMeal[]): Macros {
  return sumMacros(meals.map((m) => m.macros));
}

function recipeOf(meal: PlannedMeal, byId: ReadonlyMap<string, ResolvedRecipe>): ResolvedRecipe | undefined {
  return meal.inlineRecipe ?? byId.get(meal.recipeId);
}

/** Nudges portion sizes by quarter steps until the day's kcal is within tolerance. */
function fixKcal(meals: PlannedMeal[], targetKcal: number, byId: ReadonlyMap<string, ResolvedRecipe>): void {
  for (let i = 0; i < MAX_KCAL_FIXUP_ITERATIONS; i++) {
    const delta = totalsOf(meals).kcal - targetKcal;
    if (Math.abs(delta) <= targetKcal * KCAL_TOLERANCE) return;
    const dir = delta > 0 ? -SCALE_STEP : SCALE_STEP;
    let best: { idx: number; newErr: number } | null = null;
    meals.forEach((m, idx) => {
      const r = recipeOf(m, byId);
      if (!r) return;
      const newScale = m.scale + dir;
      if (newScale < MIN_SCALE - 1e-9 || newScale > MAX_SCALE + 1e-9) return;
      const newErr = Math.abs(delta + r.macros.kcal * dir);
      if (!best || newErr < best.newErr) best = { idx, newErr };
    });
    if (!best) return;
    const b: { idx: number; newErr: number } = best;
    if (b.newErr >= Math.abs(delta)) return;
    const m = meals[b.idx]!;
    const r = recipeOf(m, byId)!;
    m.scale = Math.round((m.scale + dir) * 100) / 100;
    m.macros = scaleRecipe(r, m.scale);
  }
}

/** Replaces the least protein-dense meal with a higher-protein eligible alternative. */
function fixProtein(
  meals: PlannedMeal[],
  targets: SlotTarget[],
  input: MenuInput,
  rng: Rng,
): void {
  const goal = input.targets.proteinG * PROTEIN_FLOOR;
  for (let n = 0; n < MAX_PROTEIN_REPLACEMENTS; n++) {
    if (totalsOf(meals).proteinG >= goal) return;
    const order = meals
      .map((m, idx) => ({ idx, density: m.macros.proteinG / Math.max(m.macros.kcal, 1) }))
      .sort((a, b) => a.density - b.density);
    let replaced = false;
    for (const { idx } of order) {
      const meal = meals[idx]!;
      if (meal.inlineRecipe) continue;
      const target = targets[idx]!;
      const used = new Set(meals.map((m) => m.recipeId));
      const candidates = candidatesFor(target.slot, input, used, []);
      let best: { recipe: ResolvedRecipe; scale: number; macros: Macros } | null = null;
      for (const r of rankRecipes(candidates, { cuisines: input.profile.cuisines, recentRecipeIds: [], rng })) {
        const scale = Math.round((target.kcal / r.macros.kcal) * 4) / 4;
        const s = clamp(scale, MIN_SCALE, MAX_SCALE);
        const macros = scaleRecipe(r, s);
        if (Math.abs(macros.kcal - target.kcal) > target.kcal * 0.25) continue;
        if (!best || macros.proteinG > best.macros.proteinG) best = { recipe: r, scale: s, macros };
      }
      if (best && best.macros.proteinG > meal.macros.proteinG + 3) {
        meals[idx] = { slot: meal.slot, recipeId: best.recipe.id, scale: best.scale, macros: best.macros };
        replaced = true;
        break;
      }
    }
    if (!replaced) return;
  }
}

/**
 * When portion nudging cannot close the gap (meals pinned at 0.5x or 2x), swap the meal that
 * misses its own slot target by the most for a candidate whose best portion fixes the day.
 */
function replaceForKcal(
  meals: PlannedMeal[],
  targets: SlotTarget[],
  input: MenuInput,
  byId: ReadonlyMap<string, ResolvedRecipe>,
  rng: Rng,
): void {
  for (let n = 0; n < MAX_KCAL_REPLACEMENTS; n++) {
    const delta = totalsOf(meals).kcal - input.targets.kcal;
    if (Math.abs(delta) <= input.targets.kcal * KCAL_TOLERANCE) return;
    const order = meals
      .map((m, idx) => ({ idx, miss: Math.abs(m.macros.kcal - targets[idx]!.kcal) }))
      .sort((a, b) => b.miss - a.miss);
    let replaced = false;
    for (const { idx } of order) {
      const meal = meals[idx]!;
      if (meal.inlineRecipe) continue;
      const target = targets[idx]!;
      const wanted = target.kcal - delta; // kcal this slot needs so the day lands on target
      const used = new Set(meals.map((m) => m.recipeId));
      const candidates = candidatesFor(target.slot, input, used, []);
      let best: { recipe: ResolvedRecipe; scale: number; macros: Macros; err: number } | null = null;
      for (const r of rankRecipes(candidates, { cuisines: input.profile.cuisines, recentRecipeIds: [], rng })) {
        const s = clamp(Math.round((wanted / r.macros.kcal) * 4) / 4, MIN_SCALE, MAX_SCALE);
        const macros = scaleRecipe(r, s);
        const err = Math.abs(macros.kcal - wanted);
        if (macros.proteinG < meal.macros.proteinG * 0.7) continue;
        if (!best || err < best.err) best = { recipe: r, scale: s, macros, err };
      }
      if (best && best.err < Math.abs(delta)) {
        meals[idx] = { slot: meal.slot, recipeId: best.recipe.id, scale: best.scale, macros: best.macros };
        replaced = true;
        break;
      }
    }
    if (!replaced) return;
    fixKcal(meals, input.targets.kcal, byId);
  }
}

function finalize(
  meals: PlannedMeal[],
  warnings: MenuWarning[],
  input: MenuInput,
  byId: ReadonlyMap<string, ResolvedRecipe>,
  rng: Rng,
): DailyMenu {
  const targets = slotTargets(input);
  fixProtein(meals, targets, input, rng);
  fixKcal(meals, input.targets.kcal, byId);
  replaceForKcal(meals, targets, input, byId, rng);

  const totals = totalsOf(meals);
  const out: MenuWarning[] = warnings.filter((w) => w.code !== 'KCAL_OUT_OF_TOLERANCE' && w.code !== 'PROTEIN_LOW');
  const deltaKcal = totals.kcal - input.targets.kcal;
  if (meals.length > 0 && Math.abs(deltaKcal) > input.targets.kcal * KCAL_TOLERANCE) {
    out.push({ code: 'KCAL_OUT_OF_TOLERANCE', deltaKcal: Math.round(deltaKcal) });
  }
  const shortfall = input.targets.proteinG * PROTEIN_FLOOR - totals.proteinG;
  if (meals.length > 0 && shortfall > 0) out.push({ code: 'PROTEIN_LOW', shortfallG: Math.round(shortfall) });

  return {
    id: input.dateKey,
    meals: meals.map((m) => ({ ...m, macros: roundMacros(m.macros) })),
    totals: roundMacros(totals),
    seed: input.seed,
    warnings: out,
    generatedAt: input.now ?? new Date().toISOString(),
  };
}

export function generateDailyMenu(input: MenuInput): DailyMenu {
  const rng = mulberry32(input.seed);
  const byId = indexById(input.recipes);
  const recent = input.recentRecipeIds ?? [];
  const targets = slotTargets(input);
  const meals: PlannedMeal[] = [];
  const warnings: MenuWarning[] = [];
  const used = new Set<string>();

  for (const target of targets) {
    const pick = pickForSlot(target, input, used, rng, recent);
    warnings.push(...pick.warnings);
    if (pick.meal) {
      meals.push(pick.meal);
      used.add(pick.meal.recipeId);
    }
  }
  return finalize(meals, warnings, input, byId, rng);
}

/**
 * Re-picks a single meal, excluding the current recipe and any the user already rejected,
 * then re-runs the fix-up pass. Other meals keep their recipes (portions may be nudged).
 */
export function swapMeal(menu: DailyMenu, mealIndex: number, input: MenuInput, rejectedRecipeIds: readonly string[] = []): DailyMenu {
  const current = menu.meals[mealIndex];
  if (!current) return menu;
  const rng = mulberry32(input.seed);
  const byId = indexById(input.recipes);
  const targets = slotTargets(input);
  const target = targets[mealIndex];
  if (!target) return menu;

  const exclude = new Set<string>([...rejectedRecipeIds, current.recipeId, ...menu.meals.map((m) => m.recipeId)]);
  const pick = pickForSlot(target, input, exclude, rng, input.recentRecipeIds ?? []);
  const meals = menu.meals.map((m) => ({ ...m }));
  const warnings = menu.warnings.filter((w) => !('slot' in w) || w.slot !== target.slot);
  warnings.push(...pick.warnings);
  if (pick.meal) meals[mealIndex] = pick.meal;
  return finalize(meals, warnings, input, byId, rng);
}
