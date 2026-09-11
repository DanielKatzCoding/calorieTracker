// Orchestration between the pure generators and storage. UI calls these; domain stays pure.
import type { DailyMenu, DateKey, Profile, Targets, WorkoutTemplate } from '@/domain/types';
import { generateDailyMenu, swapMeal, type MenuInput } from '@/domain/menu/generator';
import { generateWorkoutPlan } from '@/domain/workout/generator';
import { randomSeed } from '@/domain/random';
import { FOODS } from '@/data/foods';
import { EXERCISES } from '@/data/exercises';
import { RESOLVED_RECIPES } from '@/hooks/useFoods';
import { menuRepo } from '@/storage/repos/menuRepo';
import { workoutRepo } from '@/storage/repos/workoutRepo';

async function menuInput(profile: Profile, targets: Targets, dateKey: DateKey, seed: number): Promise<MenuInput> {
  return {
    profile,
    targets: { kcal: targets.kcal, proteinG: targets.proteinG },
    recipes: RESOLVED_RECIPES,
    foods: FOODS,
    recentRecipeIds: await menuRepo().recentRecipeIds(dateKey, 2),
    seed,
    dateKey,
  };
}

/** Returns the stored menu for the day, generating and saving one if missing. */
export async function ensureMenu(profile: Profile, targets: Targets, dateKey: DateKey): Promise<DailyMenu> {
  const existing = await menuRepo().get(dateKey);
  if (existing) return existing;
  return regenerateMenu(profile, targets, dateKey);
}

export async function regenerateMenu(profile: Profile, targets: Targets, dateKey: DateKey): Promise<DailyMenu> {
  const menu = generateDailyMenu(await menuInput(profile, targets, dateKey, randomSeed()));
  await menuRepo().save(menu);
  return menu;
}

export async function swapMenuMeal(
  menu: DailyMenu,
  mealIndex: number,
  profile: Profile,
  targets: Targets,
  rejected: readonly string[],
): Promise<DailyMenu> {
  const next = swapMeal(menu, mealIndex, await menuInput(profile, targets, menu.id, randomSeed()), rejected);
  await menuRepo().save(next);
  return next;
}

export async function regenerateWorkoutPlan(profile: Profile): Promise<WorkoutTemplate> {
  const plan = generateWorkoutPlan({ training: profile.training, exercises: EXERCISES, seed: randomSeed() });
  await workoutRepo().saveTemplate(plan);
  return plan;
}

/** Called after onboarding or a profile edit: refresh today's menu and, if training changed, the plan. */
export async function applyProfileChange(
  profile: Profile,
  targets: Targets,
  todayKey: DateKey,
  previous: Profile | undefined,
): Promise<void> {
  await regenerateMenu(profile, targets, todayKey);
  const trainingChanged =
    !previous ||
    previous.training.daysPerWeek !== profile.training.daysPerWeek ||
    previous.training.equipment !== profile.training.equipment ||
    previous.training.level !== profile.training.level;
  if (trainingChanged || !(await workoutRepo().getTemplate())) await regenerateWorkoutPlan(profile);
}
