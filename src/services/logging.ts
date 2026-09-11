// Diary, weight and workout logging: snapshots macros so later data edits never rewrite history.
import type { DateKey, DiaryEntry, FoodItem, Intensity, MealSlot, PlannedMeal, ResolvedRecipe, WorkoutLog } from '@/domain/types';
import { macrosForGrams, roundMacros, scaleMacros } from '@/domain/menu/nutrition';
import { workoutKcal } from '@/domain/workout/generator';
import { EXERCISES_BY_ID } from '@/data/exercises';
import { diaryRepo } from '@/storage/repos/diaryRepo';
import { weightRepo } from '@/storage/repos/weightRepo';
import { profileRepo } from '@/storage/repos/profileRepo';
import { workoutRepo } from '@/storage/repos/workoutRepo';

export function logFood(dateKey: DateKey, slot: MealSlot, food: FoodItem, grams: number): Promise<DiaryEntry> {
  return diaryRepo().add({
    dateKey,
    slot,
    name: food.name,
    source: { kind: 'food', foodId: food.id },
    grams,
    macros: roundMacros(macrosForGrams(food, grams)),
  });
}

export function logRecipe(dateKey: DateKey, slot: MealSlot, recipe: ResolvedRecipe, scale: number): Promise<DiaryEntry> {
  return diaryRepo().add({
    dateKey,
    slot,
    name: recipe.name,
    source: { kind: 'recipe', recipeId: recipe.id, scale },
    grams: Math.round(recipe.totalGrams * scale),
    macros: roundMacros(scaleMacros(recipe.macros, scale)),
  });
}

/** Logs a planned meal exactly as the menu shows it (macros already scaled). */
export function logPlannedMeal(dateKey: DateKey, meal: PlannedMeal, recipe: ResolvedRecipe): Promise<DiaryEntry> {
  return diaryRepo().add({
    dateKey,
    slot: meal.slot,
    name: recipe.name,
    source: { kind: 'recipe', recipeId: meal.recipeId, scale: meal.scale },
    grams: Math.round(recipe.totalGrams * meal.scale),
    macros: meal.macros,
  });
}

export function logCustom(dateKey: DateKey, slot: MealSlot, name: string, grams: number, macros: DiaryEntry['macros']): Promise<DiaryEntry> {
  return diaryRepo().add({ dateKey, slot, name, source: { kind: 'custom', name }, grams, macros: roundMacros(macros) });
}

/** Updates a food entry's portion, re-deriving macros from the snapshot ratio. */
export async function updateEntryGrams(entry: DiaryEntry, grams: number): Promise<void> {
  if (entry.grams <= 0) return;
  const factor = grams / entry.grams;
  await diaryRepo().update(entry.id, { grams, macros: roundMacros(scaleMacros(entry.macros, factor)) });
}

/** Records weight and, when it is the newest entry, keeps the profile in sync so targets follow. */
export async function logWeight(dateKey: DateKey, kg: number): Promise<void> {
  await weightRepo().upsertForDay(dateKey, kg);
  const latest = await weightRepo().latest();
  if (latest && latest.dateKey === dateKey) await profileRepo().patch({ weightKg: kg });
}

export interface WorkoutLogInput {
  dateKey: DateKey;
  title: string;
  durationMin: number;
  intensity: Intensity;
  templateId?: string;
  dayIndex?: number;
  exerciseIds?: string[];
  cardioExerciseId?: string;
  notes?: string;
}

export async function logWorkout(input: WorkoutLogInput): Promise<WorkoutLog> {
  const profile = await profileRepo().get();
  const latest = await weightRepo().latest();
  const weightKg = latest?.kg ?? profile?.weightKg ?? 70;
  const cardio = input.cardioExerciseId ? EXERCISES_BY_ID.get(input.cardioExerciseId) : undefined;
  const kcalBurned = workoutKcal({ durationMin: input.durationMin, intensity: input.intensity, weightKg, cardio });
  return workoutRepo().addLog({
    dateKey: input.dateKey,
    title: input.title,
    durationMin: input.durationMin,
    intensity: input.intensity,
    templateId: input.templateId,
    dayIndex: input.dayIndex,
    kcalBurned,
    performed: (input.exerciseIds ?? (cardio ? [cardio.id] : [])).map((exerciseId) => ({ exerciseId, sets: [] })),
    notes: input.notes,
  });
}
