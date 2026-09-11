// Bundled exercise library. MET values approximate the Compendium of Physical Activities
// for resistance training at moderate effort (5-6) and common cardio modalities.
import type { Equipment, Exercise, Level, MovementPattern } from '@/domain/types';

function e(
  id: string,
  name: string,
  pattern: MovementPattern,
  equipment: Equipment[],
  minLevel: Level,
  muscles: string[],
  met = 5,
  flags: { unilateral?: boolean; bodyweight?: boolean; timed?: boolean } = {},
): Exercise {
  return { id, name, pattern, equipment, minLevel, muscles, met, ...flags };
}

const ALL: Equipment[] = ['none', 'dumbbells', 'gym'];
const DB: Equipment[] = ['dumbbells', 'gym'];
const GYM: Equipment[] = ['gym'];
const BW = { bodyweight: true };
const UNI = { unilateral: true };
const TIMED = { timed: true };

export const EXERCISES: Exercise[] = [
  // ---------------------------------------------------------------- Squat
  e('bw_squat', 'Bodyweight squat', 'squat', ALL, 'beginner', ['quads', 'glutes'], 5, BW),
  e('wall_sit', 'Wall sit', 'squat', ALL, 'beginner', ['quads'], 4, { ...BW, ...TIMED }),
  e('jump_squat', 'Jump squat', 'squat', ALL, 'intermediate', ['quads', 'glutes', 'calves'], 8, BW),
  e('pistol_squat', 'Pistol squat', 'squat', ALL, 'advanced', ['quads', 'glutes'], 6, { ...BW, ...UNI }),
  e('goblet_squat', 'Goblet squat', 'squat', DB, 'beginner', ['quads', 'glutes', 'core']),
  e('db_front_squat', 'Dumbbell front squat', 'squat', DB, 'intermediate', ['quads', 'glutes']),
  e('leg_press', 'Leg press', 'squat', GYM, 'beginner', ['quads', 'glutes']),
  e('hack_squat', 'Hack squat', 'squat', GYM, 'intermediate', ['quads', 'glutes']),
  e('bb_back_squat', 'Barbell back squat', 'squat', GYM, 'intermediate', ['quads', 'glutes', 'core'], 6),
  e('bb_front_squat', 'Barbell front squat', 'squat', GYM, 'advanced', ['quads', 'core'], 6),
  e('leg_extension', 'Leg extension', 'squat', GYM, 'beginner', ['quads'], 4),

  // ---------------------------------------------------------------- Hinge
  e('glute_bridge', 'Glute bridge', 'hinge', ALL, 'beginner', ['glutes', 'hamstrings'], 4, BW),
  e('single_leg_glute_bridge', 'Single-leg glute bridge', 'hinge', ALL, 'intermediate', ['glutes', 'hamstrings'], 4, { ...BW, ...UNI }),
  e('good_morning_bw', 'Bodyweight good morning', 'hinge', ALL, 'beginner', ['hamstrings', 'lower back'], 4, BW),
  e('nordic_curl', 'Nordic hamstring curl', 'hinge', ALL, 'advanced', ['hamstrings'], 5, BW),
  e('db_rdl', 'Dumbbell Romanian deadlift', 'hinge', DB, 'beginner', ['hamstrings', 'glutes', 'lower back']),
  e('db_single_leg_rdl', 'Single-leg dumbbell RDL', 'hinge', DB, 'intermediate', ['hamstrings', 'glutes'], 5, UNI),
  e('db_hip_thrust', 'Dumbbell hip thrust', 'hinge', DB, 'beginner', ['glutes']),
  e('kb_swing', 'Dumbbell / kettlebell swing', 'hinge', DB, 'intermediate', ['glutes', 'hamstrings', 'back'], 8),
  e('bb_deadlift', 'Barbell deadlift', 'hinge', GYM, 'intermediate', ['hamstrings', 'glutes', 'back'], 6),
  e('bb_rdl', 'Barbell Romanian deadlift', 'hinge', GYM, 'intermediate', ['hamstrings', 'glutes']),
  e('bb_hip_thrust', 'Barbell hip thrust', 'hinge', GYM, 'intermediate', ['glutes']),
  e('leg_curl', 'Leg curl machine', 'hinge', GYM, 'beginner', ['hamstrings'], 4),
  e('back_extension', 'Back extension', 'hinge', GYM, 'beginner', ['lower back', 'glutes'], 4),

  // ---------------------------------------------------------------- Lunge / single-leg
  e('reverse_lunge', 'Reverse lunge', 'lunge', ALL, 'beginner', ['quads', 'glutes'], 5, { ...BW, ...UNI }),
  e('forward_lunge', 'Forward lunge', 'lunge', ALL, 'beginner', ['quads', 'glutes'], 5, { ...BW, ...UNI }),
  e('split_squat', 'Split squat', 'lunge', ALL, 'beginner', ['quads', 'glutes'], 5, { ...BW, ...UNI }),
  e('step_up', 'Step-up', 'lunge', ALL, 'beginner', ['quads', 'glutes'], 5, { ...BW, ...UNI }),
  e('bulgarian_split_squat_bw', 'Bulgarian split squat', 'lunge', ALL, 'intermediate', ['quads', 'glutes'], 5, { ...BW, ...UNI }),
  e('db_walking_lunge', 'Dumbbell walking lunge', 'lunge', DB, 'intermediate', ['quads', 'glutes'], 6, UNI),
  e('db_bulgarian_split_squat', 'Dumbbell Bulgarian split squat', 'lunge', DB, 'intermediate', ['quads', 'glutes'], 5, UNI),
  e('db_step_up', 'Dumbbell step-up', 'lunge', DB, 'beginner', ['quads', 'glutes'], 5, UNI),
  e('bb_lunge', 'Barbell lunge', 'lunge', GYM, 'advanced', ['quads', 'glutes'], 6, UNI),

  // ---------------------------------------------------------------- Horizontal push
  e('knee_pushup', 'Knee push-up', 'h_push', ALL, 'beginner', ['chest', 'triceps', 'shoulders'], 4, BW),
  e('pushup', 'Push-up', 'h_push', ALL, 'beginner', ['chest', 'triceps', 'shoulders'], 5, BW),
  e('incline_pushup', 'Incline push-up', 'h_push', ALL, 'beginner', ['chest', 'triceps'], 4, BW),
  e('decline_pushup', 'Decline push-up', 'h_push', ALL, 'intermediate', ['upper chest', 'shoulders'], 5, BW),
  e('diamond_pushup', 'Diamond push-up', 'h_push', ALL, 'intermediate', ['triceps', 'chest'], 5, BW),
  e('archer_pushup', 'Archer push-up', 'h_push', ALL, 'advanced', ['chest', 'triceps'], 6, { ...BW, ...UNI }),
  e('db_bench_press', 'Dumbbell bench press', 'h_push', DB, 'beginner', ['chest', 'triceps', 'shoulders']),
  e('db_floor_press', 'Dumbbell floor press', 'h_push', DB, 'beginner', ['chest', 'triceps']),
  e('db_incline_press', 'Dumbbell incline press', 'h_push', DB, 'intermediate', ['upper chest', 'shoulders']),
  e('db_chest_fly', 'Dumbbell chest fly', 'h_push', DB, 'intermediate', ['chest'], 4),
  e('bb_bench_press', 'Barbell bench press', 'h_push', GYM, 'intermediate', ['chest', 'triceps', 'shoulders'], 6),
  e('bb_incline_press', 'Barbell incline press', 'h_push', GYM, 'advanced', ['upper chest', 'shoulders'], 6),
  e('chest_press_machine', 'Chest press machine', 'h_push', GYM, 'beginner', ['chest', 'triceps']),
  e('cable_fly', 'Cable fly', 'h_push', GYM, 'intermediate', ['chest'], 4),
  e('dips', 'Dips', 'h_push', GYM, 'advanced', ['chest', 'triceps'], 6, BW),

  // ---------------------------------------------------------------- Vertical push
  e('pike_pushup', 'Pike push-up', 'v_push', ALL, 'beginner', ['shoulders', 'triceps'], 5, BW),
  e('wall_handstand_hold', 'Wall handstand hold', 'v_push', ALL, 'intermediate', ['shoulders', 'core'], 5, { ...BW, ...TIMED }),
  e('handstand_pushup', 'Handstand push-up', 'v_push', ALL, 'advanced', ['shoulders', 'triceps'], 6, BW),
  e('db_shoulder_press', 'Dumbbell shoulder press', 'v_push', DB, 'beginner', ['shoulders', 'triceps']),
  e('db_arnold_press', 'Arnold press', 'v_push', DB, 'intermediate', ['shoulders']),
  e('db_lateral_raise', 'Dumbbell lateral raise', 'v_push', DB, 'beginner', ['shoulders'], 4),
  e('db_push_press', 'Dumbbell push press', 'v_push', DB, 'advanced', ['shoulders', 'legs'], 7),
  e('bb_overhead_press', 'Barbell overhead press', 'v_push', GYM, 'intermediate', ['shoulders', 'triceps'], 6),
  e('shoulder_press_machine', 'Shoulder press machine', 'v_push', GYM, 'beginner', ['shoulders']),
  e('cable_lateral_raise', 'Cable lateral raise', 'v_push', GYM, 'intermediate', ['shoulders'], 4),

  // ---------------------------------------------------------------- Horizontal pull
  e('doorframe_row', 'Doorframe / towel row', 'h_pull', ALL, 'beginner', ['back', 'biceps'], 4, BW),
  e('inverted_row', 'Inverted row (table or bar)', 'h_pull', ALL, 'intermediate', ['back', 'biceps'], 5, BW),
  e('superman_hold', 'Superman hold', 'h_pull', ALL, 'beginner', ['upper back', 'lower back'], 3, { ...BW, ...TIMED }),
  e('prone_ytw', 'Prone Y-T-W raises', 'h_pull', ALL, 'beginner', ['upper back', 'rear delts'], 3, BW),
  e('db_row', 'Dumbbell row', 'h_pull', DB, 'beginner', ['back', 'biceps'], 5, UNI),
  e('db_bent_over_row', 'Dumbbell bent-over row', 'h_pull', DB, 'beginner', ['back', 'biceps']),
  e('db_rear_delt_fly', 'Dumbbell rear delt fly', 'h_pull', DB, 'intermediate', ['rear delts', 'upper back'], 4),
  e('db_renegade_row', 'Renegade row', 'h_pull', DB, 'advanced', ['back', 'core'], 6, UNI),
  e('bb_row', 'Barbell row', 'h_pull', GYM, 'intermediate', ['back', 'biceps'], 6),
  e('seated_cable_row', 'Seated cable row', 'h_pull', GYM, 'beginner', ['back', 'biceps']),
  e('chest_supported_row', 'Chest-supported row', 'h_pull', GYM, 'beginner', ['back']),
  e('face_pull', 'Face pull', 'h_pull', GYM, 'beginner', ['rear delts', 'upper back'], 4),
  e('tbar_row', 'T-bar row', 'h_pull', GYM, 'advanced', ['back'], 6),

  // ---------------------------------------------------------------- Vertical pull
  e('scapular_pullup', 'Scapular pull / hang', 'v_pull', ALL, 'beginner', ['upper back', 'grip'], 3, { ...BW, ...TIMED }),
  e('negative_pullup', 'Negative pull-up', 'v_pull', ALL, 'intermediate', ['back', 'biceps'], 5, BW),
  e('pullup', 'Pull-up', 'v_pull', ALL, 'advanced', ['back', 'biceps'], 6, BW),
  e('chinup', 'Chin-up', 'v_pull', ALL, 'advanced', ['back', 'biceps'], 6, BW),
  e('db_pullover', 'Dumbbell pullover', 'v_pull', DB, 'beginner', ['lats', 'chest'], 4),
  e('db_bicep_curl', 'Dumbbell bicep curl', 'v_pull', DB, 'beginner', ['biceps'], 3),
  e('db_hammer_curl', 'Hammer curl', 'v_pull', DB, 'beginner', ['biceps', 'forearms'], 3),
  e('lat_pulldown', 'Lat pulldown', 'v_pull', GYM, 'beginner', ['lats', 'biceps']),
  e('assisted_pullup', 'Assisted pull-up machine', 'v_pull', GYM, 'beginner', ['back', 'biceps']),
  e('straight_arm_pulldown', 'Straight-arm pulldown', 'v_pull', GYM, 'intermediate', ['lats'], 4),
  e('weighted_pullup', 'Weighted pull-up', 'v_pull', GYM, 'advanced', ['back', 'biceps'], 6),

  // ---------------------------------------------------------------- Core
  e('plank', 'Plank', 'core', ALL, 'beginner', ['core'], 3, { ...BW, ...TIMED }),
  e('side_plank', 'Side plank', 'core', ALL, 'beginner', ['obliques'], 3, { ...BW, ...UNI, ...TIMED }),
  e('dead_bug', 'Dead bug', 'core', ALL, 'beginner', ['core'], 3, { ...BW, ...TIMED }),
  e('bird_dog', 'Bird dog', 'core', ALL, 'beginner', ['core', 'lower back'], 3, { ...BW, ...TIMED }),
  e('mountain_climbers', 'Mountain climbers', 'core', ALL, 'intermediate', ['core', 'shoulders'], 8, BW),
  e('hollow_hold', 'Hollow body hold', 'core', ALL, 'intermediate', ['core'], 3, { ...BW, ...TIMED }),
  e('bicycle_crunch', 'Bicycle crunch', 'core', ALL, 'beginner', ['abs', 'obliques'], 4, BW),
  e('leg_raise', 'Lying leg raise', 'core', ALL, 'intermediate', ['lower abs'], 4, BW),
  e('v_up', 'V-up', 'core', ALL, 'advanced', ['abs'], 5, BW),
  e('db_russian_twist', 'Dumbbell Russian twist', 'core', DB, 'intermediate', ['obliques'], 4),
  e('db_woodchop', 'Dumbbell woodchop', 'core', DB, 'intermediate', ['obliques', 'core'], 4),
  e('hanging_knee_raise', 'Hanging knee raise', 'core', GYM, 'intermediate', ['abs'], 4),
  e('cable_crunch', 'Cable crunch', 'core', GYM, 'beginner', ['abs'], 4),
  e('ab_wheel', 'Ab wheel rollout', 'core', GYM, 'advanced', ['core'], 5),

  // ---------------------------------------------------------------- Carry
  e('bear_crawl', 'Bear crawl', 'carry', ALL, 'beginner', ['core', 'shoulders'], 6, { ...BW, ...TIMED }),
  e('db_farmer_carry', "Farmer's carry", 'carry', DB, 'beginner', ['grip', 'core', 'traps'], 5, TIMED),
  e('db_suitcase_carry', 'Suitcase carry', 'carry', DB, 'intermediate', ['obliques', 'grip'], 5, { ...UNI, ...TIMED }),
  e('db_overhead_carry', 'Overhead carry', 'carry', DB, 'advanced', ['shoulders', 'core'], 5, TIMED),

  // ---------------------------------------------------------------- Cardio / conditioning
  e('brisk_walk', 'Brisk walk', 'cardio', ALL, 'beginner', ['legs', 'heart'], 4.3, BW),
  e('jog', 'Jog', 'cardio', ALL, 'beginner', ['legs', 'heart'], 7, BW),
  e('run', 'Run', 'cardio', ALL, 'intermediate', ['legs', 'heart'], 9.8, BW),
  e('sprint_intervals', 'Sprint intervals', 'cardio', ALL, 'advanced', ['legs', 'heart'], 12, BW),
  e('jumping_jacks', 'Jumping jacks', 'cardio', ALL, 'beginner', ['full body'], 8, BW),
  e('high_knees', 'High knees', 'cardio', ALL, 'intermediate', ['legs', 'core'], 8, BW),
  e('burpees', 'Burpees', 'cardio', ALL, 'advanced', ['full body'], 10, BW),
  e('jump_rope', 'Jump rope', 'cardio', ALL, 'intermediate', ['calves', 'heart'], 11, BW),
  e('cycling', 'Cycling', 'cardio', ALL, 'beginner', ['legs', 'heart'], 7.5),
  e('stationary_bike', 'Stationary bike', 'cardio', GYM, 'beginner', ['legs', 'heart'], 6.8),
  e('rowing_machine', 'Rowing machine', 'cardio', GYM, 'intermediate', ['back', 'legs', 'heart'], 7),
  e('elliptical', 'Elliptical', 'cardio', GYM, 'beginner', ['legs', 'heart'], 5),
  e('stair_climber', 'Stair climber', 'cardio', GYM, 'intermediate', ['legs', 'heart'], 9),
  e('swimming', 'Swimming', 'cardio', ALL, 'intermediate', ['full body'], 6),
];

export const EXERCISES_BY_ID: ReadonlyMap<string, Exercise> = new Map(EXERCISES.map((x) => [x.id, x]));
