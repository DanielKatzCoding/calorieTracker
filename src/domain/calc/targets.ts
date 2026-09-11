import type { Profile, Targets } from '../types';
import { mifflinStJeor } from './bmr';
import { calorieTarget, tdee } from './energy';
import { macroSplit } from './macros';
import { projectedWeeksToGoal } from './bodyMetrics';

export type TargetsInput = Pick<
  Profile,
  'sex' | 'age' | 'heightCm' | 'weightKg' | 'goalWeightKg' | 'activity' | 'goal' | 'pace' | 'diet'
>;

/** Full pipeline: BMR -> TDEE -> goal-adjusted target with floor -> macros -> projection. */
export function computeTargets(p: TargetsInput): Targets {
  const bmr = mifflinStJeor(p);
  const total = tdee(bmr, p.activity);
  const { target, deltaKcal, floorApplied } = calorieTarget({
    bmr,
    tdee: total,
    sex: p.sex,
    goal: p.goal,
    pace: p.pace,
  });
  const macros = macroSplit({
    targetKcal: target,
    weightKg: p.weightKg,
    goalWeightKg: p.goalWeightKg,
    goal: p.goal,
    diet: p.diet,
  });
  return {
    ...macros,
    bmr: Math.round(bmr),
    tdee: Math.round(total),
    deltaKcal: Math.round(deltaKcal),
    floorApplied,
    projectedWeeksToGoal: projectedWeeksToGoal(p.weightKg, p.goalWeightKg, deltaKcal),
  };
}
