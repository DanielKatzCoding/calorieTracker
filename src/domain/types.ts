// Shared domain model. Pure types only: no runtime imports.

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
export type GoalType = 'lose' | 'maintain' | 'gain';
/** Desired weight change in kg per week. */
export type Pace = 0.25 | 0.5 | 0.75 | 1;
export type DietPattern = 'omnivore' | 'pescatarian' | 'vegetarian' | 'vegan' | 'keto';
export type Allergen =
  | 'gluten'
  | 'lactose'
  | 'nuts'
  | 'peanuts'
  | 'eggs'
  | 'soy'
  | 'shellfish'
  | 'fish'
  | 'sesame';
export type Cuisine =
  | 'mediterranean'
  | 'asian'
  | 'mexican'
  | 'american'
  | 'indian'
  | 'middle_eastern'
  | 'italian'
  | 'nordic';
export type Equipment = 'none' | 'dumbbells' | 'gym';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
/** Local calendar day, 'YYYY-MM-DD'. */
export type DateKey = string;
export type MealsPerDay = 3 | 4 | 5 | 6;

export interface TrainingPrefs {
  daysPerWeek: number;
  equipment: Equipment;
  level: Level;
}

export interface Profile {
  /** Singleton row. */
  id: 'me';
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goalWeightKg: number;
  activity: ActivityLevel;
  goal: GoalType;
  pace: Pace;
  diet: DietPattern;
  allergens: Allergen[];
  dislikedFoodIds: string[];
  cuisines: Cuisine[];
  mealsPerDay: MealsPerDay;
  training: TrainingPrefs;
  createdAt: string;
  updatedAt: string;
}

export interface Macros {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Targets extends Macros {
  bmr: number;
  tdee: number;
  /** Signed daily kcal change actually applied (negative for a deficit). */
  deltaKcal: number;
  floorApplied: boolean;
  /** Null when maintaining or when no change is possible. */
  projectedWeeksToGoal: number | null;
}

export type FoodCategory =
  | 'protein'
  | 'grain'
  | 'vegetable'
  | 'fruit'
  | 'dairy'
  | 'fat'
  | 'legume'
  | 'nut_seed'
  | 'beverage'
  | 'condiment'
  | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  per100g: Macros;
  servingG?: number;
  servingLabel?: string;
  allergens: Allergen[];
  /** Diet patterns this food is compatible with (keto handled via ketoFriendly). */
  diets: DietPattern[];
  ketoFriendly?: boolean;
  isCustom?: boolean;
}

export interface RecipeIngredient {
  foodId: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  slots: MealSlot[];
  cuisine: Cuisine | 'neutral';
  ingredients: RecipeIngredient[];
  /** Allergens not derivable from the ingredient list (e.g. cross-contamination). */
  extraAllergens?: Allergen[];
  prepMinutes: number;
  instructions?: string;
}

/** Recipe plus nutrition derived from its ingredients. */
export interface ResolvedRecipe extends Recipe {
  macros: Macros;
  totalGrams: number;
  allergens: Allergen[];
  diets: DietPattern[];
  ketoFriendly: boolean;
}

export interface PlannedMeal {
  slot: MealSlot;
  recipeId: string;
  scale: number;
  macros: Macros;
  /** Present when the meal was synthesized (not from the recipe DB). */
  inlineRecipe?: ResolvedRecipe;
}

export type MenuWarning =
  | { code: 'KCAL_OUT_OF_TOLERANCE'; deltaKcal: number }
  | { code: 'PROTEIN_LOW'; shortfallG: number }
  | { code: 'FEW_OPTIONS'; slot: MealSlot; eligible: number }
  | { code: 'FALLBACK_SIMPLE_PLATE'; slot: MealSlot }
  | { code: 'INSUFFICIENT_OPTIONS'; slot: MealSlot };

export interface DailyMenu {
  /** The date key this menu is for. */
  id: DateKey;
  meals: PlannedMeal[];
  totals: Macros;
  seed: number;
  warnings: MenuWarning[];
  generatedAt: string;
}

export type DiarySource =
  | { kind: 'food'; foodId: string }
  | { kind: 'recipe'; recipeId: string; scale: number }
  | { kind: 'custom'; name: string };

export interface DiaryEntry {
  id: string;
  dateKey: DateKey;
  slot: MealSlot;
  name: string;
  source: DiarySource;
  grams: number;
  /** Snapshot at logging time so later DB edits never rewrite history. */
  macros: Macros;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  dateKey: DateKey;
  kg: number;
  createdAt: string;
}

export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'h_push'
  | 'v_push'
  | 'h_pull'
  | 'v_pull'
  | 'core'
  | 'carry'
  | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  pattern: MovementPattern;
  equipment: Equipment[];
  minLevel: Level;
  muscles: string[];
  met: number;
  unilateral?: boolean;
  bodyweight?: boolean;
  /** Holds and carries are prescribed in seconds rather than reps. */
  timed?: boolean;
}

export interface Prescription {
  exerciseId: string;
  sets: number;
  /** Reps, or seconds when `timed`. */
  repMin: number;
  repMax: number;
  restSec: number;
  timed?: boolean;
}

export interface WorkoutDay {
  dayIndex: number;
  name: string;
  focus: string;
  exercises: Prescription[];
  estMinutes: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  daysPerWeek: number;
  equipment: Equipment;
  level: Level;
  days: WorkoutDay[];
  seed: number;
  generatedAt: string;
}

export type Intensity = 'light' | 'moderate' | 'vigorous';

export interface PerformedSet {
  reps: number;
  weightKg?: number;
}

export interface PerformedExercise {
  exerciseId: string;
  sets: PerformedSet[];
}

export interface WorkoutLog {
  id: string;
  dateKey: DateKey;
  templateId?: string;
  dayIndex?: number;
  title: string;
  durationMin: number;
  intensity: Intensity;
  /** Snapshot: MET x body weight at logging time. */
  kcalBurned: number;
  performed: PerformedExercise[];
  notes?: string;
  createdAt: string;
}

export interface BackupFile {
  schemaVersion: 1;
  app: 'calorieTracker';
  exportedAt: string;
  profile: Profile | null;
  diary: DiaryEntry[];
  weights: WeightEntry[];
  workoutTemplate: WorkoutTemplate | null;
  workoutLogs: WorkoutLog[];
  menus: DailyMenu[];
  customFoods: FoodItem[];
}
