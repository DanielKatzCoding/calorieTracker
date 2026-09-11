import type { ActivityLevel, Allergen, Cuisine, DietPattern, Equipment, GoalType, Level, MealSlot, Pace } from '@/domain/types';

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Desk job, little exercise' },
  { value: 'light', label: 'Lightly active', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately active', description: 'Exercise 3-5 days/week' },
  { value: 'very', label: 'Very active', description: 'Hard exercise 6-7 days/week' },
  { value: 'extra', label: 'Extra active', description: 'Physical job plus daily training' },
];

export const GOAL_OPTIONS: { value: GoalType; label: string; description: string }[] = [
  { value: 'lose', label: 'Lose fat', description: 'Eat below maintenance' },
  { value: 'maintain', label: 'Maintain', description: 'Stay where you are' },
  { value: 'gain', label: 'Build muscle', description: 'Eat above maintenance' },
];

export const PACE_OPTIONS: { value: Pace; label: string; description: string }[] = [
  { value: 0.25, label: '0.25 kg/wk', description: 'Gentle' },
  { value: 0.5, label: '0.5 kg/wk', description: 'Steady' },
  { value: 0.75, label: '0.75 kg/wk', description: 'Ambitious' },
  { value: 1, label: '1 kg/wk', description: 'Aggressive' },
];

export const DIET_OPTIONS: { value: DietPattern; label: string; description: string }[] = [
  { value: 'omnivore', label: 'Omnivore', description: 'Everything' },
  { value: 'pescatarian', label: 'Pescatarian', description: 'Fish, no meat' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'Dairy and eggs, no meat or fish' },
  { value: 'vegan', label: 'Vegan', description: 'Plants only' },
  { value: 'keto', label: 'Keto', description: 'Very low carb, high fat' },
];

export const ALLERGEN_OPTIONS: { value: Allergen; label: string }[] = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'lactose', label: 'Lactose / dairy' },
  { value: 'nuts', label: 'Tree nuts' },
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'soy', label: 'Soy' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'sesame', label: 'Sesame' },
];

export const CUISINE_OPTIONS: { value: Cuisine; label: string }[] = [
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'middle_eastern', label: 'Middle Eastern' },
  { value: 'italian', label: 'Italian' },
  { value: 'asian', label: 'Asian' },
  { value: 'indian', label: 'Indian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'american', label: 'American' },
  { value: 'nordic', label: 'Nordic' },
];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string; description: string }[] = [
  { value: 'none', label: 'Bodyweight', description: 'No equipment' },
  { value: 'dumbbells', label: 'Dumbbells', description: 'Home setup' },
  { value: 'gym', label: 'Full gym', description: 'Barbells, machines, cables' },
];

export const LEVEL_OPTIONS: { value: Level; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Under a year of training' },
  { value: 'intermediate', label: 'Intermediate', description: '1-3 years' },
  { value: 'advanced', label: 'Advanced', description: '3+ years, consistent' },
];

export const SLOT_ORDER: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const label = <T extends string | number>(options: readonly { value: T; label: string }[], value: T): string =>
  options.find((o) => o.value === value)?.label ?? String(value);

export const fmt = {
  kcal: (n: number) => `${Math.round(n)} kcal`,
  g: (n: number) => `${Math.round(n)} g`,
  kg: (n: number) => `${Math.round(n * 10) / 10} kg`,
  pct: (n: number) => `${Math.round(n * 100)}%`,
  grams: (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10} kg` : `${Math.round(n)} g`),
};
