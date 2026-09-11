import type { Exercise, Intensity, Prescription, TrainingPrefs, WorkoutDay, WorkoutTemplate } from '../types';
import { mulberry32 } from '../random';
import { kcalBurned, RESISTANCE_MET } from '../calc/met';
import { splitFor } from './splits';
import { selectExercise } from './exerciseSelect';
import { estimateMinutes, prescribe } from './prescription';

export interface WorkoutInput {
  training: TrainingPrefs;
  exercises: readonly Exercise[];
  seed: number;
  now?: string;
}

export function generateWorkoutPlan(input: WorkoutInput): WorkoutTemplate {
  const { equipment, level } = input.training;
  const rng = mulberry32(input.seed);
  const templates = splitFor(input.training.daysPerWeek, level);
  const days: WorkoutDay[] = [];
  let previous = new Set<string>();

  templates.forEach((t, dayIndex) => {
    const usedToday = new Set<string>();
    const exercises: Prescription[] = [];
    t.patterns.forEach((pattern, slotIndex) => {
      const ex = selectExercise(input.exercises, pattern, equipment, level, new Set([...usedToday, ...previous]), rng);
      if (!ex) return;
      usedToday.add(ex.id);
      exercises.push(prescribe(ex, level, slotIndex));
    });
    days.push({ dayIndex, name: t.name, focus: t.focus, exercises, estMinutes: estimateMinutes(exercises) });
    previous = usedToday;
  });

  return {
    id: `plan-${input.seed}`,
    name: `${templates.length}-day ${level} plan`,
    daysPerWeek: templates.length,
    equipment,
    level,
    days,
    seed: input.seed,
    generatedAt: input.now ?? new Date().toISOString(),
  };
}

export interface WorkoutKcalInput {
  durationMin: number;
  intensity: Intensity;
  weightKg: number;
  /** When the whole session is one cardio exercise, its MET is used instead of the resistance table. */
  cardio?: Exercise;
}

export function workoutKcal({ durationMin, intensity, weightKg, cardio }: WorkoutKcalInput): number {
  const met = cardio?.pattern === 'cardio' ? cardio.met : RESISTANCE_MET[intensity];
  return Math.round(kcalBurned(met, weightKg, durationMin));
}
