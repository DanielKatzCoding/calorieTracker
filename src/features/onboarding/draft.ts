import type { Profile, TrainingPrefs } from '@/domain/types';
import type { ProfileDraft } from '@/storage/repos/profileRepo';

/** Quiz answers, all optional until validated. */
export type QuizDraft = Partial<Omit<ProfileDraft, 'training'>> & { training: Partial<TrainingPrefs> };

export const EMPTY_DRAFT: QuizDraft = {
  allergens: [],
  dislikedFoodIds: [],
  cuisines: [],
  pace: 0.5,
  mealsPerDay: 3,
  training: { daysPerWeek: 3 },
};

export function draftFromProfile(p: Profile): QuizDraft {
  return {
    sex: p.sex,
    age: p.age,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    goalWeightKg: p.goalWeightKg,
    activity: p.activity,
    goal: p.goal,
    pace: p.pace,
    diet: p.diet,
    allergens: [...p.allergens],
    dislikedFoodIds: [...p.dislikedFoodIds],
    cuisines: [...p.cuisines],
    mealsPerDay: p.mealsPerDay,
    training: { ...p.training },
  };
}

export type StepId = 'about' | 'body' | 'goal' | 'activity' | 'diet' | 'allergens' | 'dislikes' | 'cuisines' | 'meals' | 'training';

export const STEPS: { id: StepId; title: string; subtitle: string }[] = [
  { id: 'about', title: 'About you', subtitle: 'Used for your resting metabolism.' },
  { id: 'body', title: 'Your body', subtitle: 'Metric units.' },
  { id: 'goal', title: 'Your goal', subtitle: 'We set a safe calorie target from this.' },
  { id: 'activity', title: 'Activity level', subtitle: 'How active is a typical week, outside planned workouts?' },
  { id: 'diet', title: 'Eating pattern', subtitle: 'Menus only include foods that fit.' },
  { id: 'allergens', title: 'Allergies & intolerances', subtitle: 'These are never included, no exceptions.' },
  { id: 'dislikes', title: 'Foods you dislike', subtitle: 'Optional. Search and tap to exclude.' },
  { id: 'cuisines', title: 'Favourite cuisines', subtitle: 'Optional. We lean towards these.' },
  { id: 'meals', title: 'Meals per day', subtitle: 'Including snacks.' },
  { id: 'training', title: 'Training', subtitle: 'For your weekly workout plan.' },
];

const num = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

/** Returns null when the step is complete, or a short reason why not. */
export function stepError(step: StepId, d: QuizDraft): string | null {
  switch (step) {
    case 'about':
      if (!d.sex) return 'Pick a sex.';
      if (!num(d.age, 13, 100)) return 'Enter an age between 13 and 100.';
      return null;
    case 'body':
      if (!num(d.heightCm, 120, 230)) return 'Enter a height between 120 and 230 cm.';
      if (!num(d.weightKg, 30, 300)) return 'Enter a weight between 30 and 300 kg.';
      return null;
    case 'goal':
      if (!d.goal) return 'Pick a goal.';
      if (d.goal !== 'maintain') {
        if (!num(d.goalWeightKg, 30, 300)) return 'Enter a goal weight.';
        if (d.goal === 'lose' && d.goalWeightKg! >= d.weightKg!) return 'Goal weight should be below your current weight.';
        if (d.goal === 'gain' && d.goalWeightKg! <= d.weightKg!) return 'Goal weight should be above your current weight.';
        if (!d.pace) return 'Pick a pace.';
      }
      return null;
    case 'activity':
      return d.activity ? null : 'Pick an activity level.';
    case 'diet':
      return d.diet ? null : 'Pick an eating pattern.';
    case 'allergens':
    case 'dislikes':
    case 'cuisines':
      return null;
    case 'meals':
      return d.mealsPerDay ? null : 'Pick how many meals.';
    case 'training': {
      const t = d.training;
      if (!num(t.daysPerWeek, 1, 6)) return 'Pick 1 to 6 days.';
      if (!t.equipment) return 'Pick your equipment.';
      if (!t.level) return 'Pick your level.';
      return null;
    }
  }
}

export function toProfileDraft(d: QuizDraft): ProfileDraft | null {
  for (const s of STEPS) if (stepError(s.id, d)) return null;
  return {
    sex: d.sex!,
    age: d.age!,
    heightCm: d.heightCm!,
    weightKg: d.weightKg!,
    goalWeightKg: d.goal === 'maintain' ? d.weightKg! : d.goalWeightKg!,
    activity: d.activity!,
    goal: d.goal!,
    pace: d.pace ?? 0.5,
    diet: d.diet!,
    allergens: d.allergens ?? [],
    dislikedFoodIds: d.dislikedFoodIds ?? [],
    cuisines: d.cuisines ?? [],
    mealsPerDay: d.mealsPerDay ?? 3,
    training: { daysPerWeek: d.training.daysPerWeek!, equipment: d.training.equipment!, level: d.training.level! },
  };
}
