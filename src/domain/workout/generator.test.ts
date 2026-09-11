import { describe, expect, it } from 'vitest';
import { EXERCISES, EXERCISES_BY_ID } from '@/data/exercises';
import { generateWorkoutPlan, workoutKcal } from './generator';
import { EXERCISES_PER_DAY, splitFor } from './splits';
import { LEVEL_RANK } from './exerciseSelect';
import type { Equipment, Level } from '../types';

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];
const EQUIPMENT: Equipment[] = ['none', 'dumbbells', 'gym'];

function plan(daysPerWeek: number, equipment: Equipment, level: Level, seed = 1) {
  return generateWorkoutPlan({ training: { daysPerWeek, equipment, level }, exercises: EXERCISES, seed, now: 'x' });
}

describe('splitFor', () => {
  it.each([1, 2, 3, 4, 5, 6])('%i days produce that many sessions', (n) => {
    expect(splitFor(n, 'beginner')).toHaveLength(n);
  });
  it('clamps out-of-range days', () => {
    expect(splitFor(0, 'beginner')).toHaveLength(1);
    expect(splitFor(9, 'beginner')).toHaveLength(6);
  });
  it('trims exercises per session by level', () => {
    for (const level of LEVELS) {
      for (const d of splitFor(3, level)) expect(d.patterns).toHaveLength(EXERCISES_PER_DAY[level]);
    }
  });
  it('names repeated sessions distinctly', () => {
    expect(splitFor(4, 'beginner').map((d) => d.name)).toEqual(['Upper 1', 'Lower 1', 'Upper 2', 'Lower 2']);
  });
});

describe('generateWorkoutPlan', () => {
  it('is deterministic by seed', () => {
    expect(plan(4, 'gym', 'intermediate', 5)).toEqual(plan(4, 'gym', 'intermediate', 5));
    expect(plan(4, 'gym', 'intermediate', 5)).not.toEqual(plan(4, 'gym', 'intermediate', 6));
  });

  it.each([1, 2, 3, 4, 5, 6])('%i days: right day count and every slot filled', (n) => {
    for (const eq of EQUIPMENT) {
      for (const level of LEVELS) {
        const p = plan(n, eq, level);
        expect(p.days).toHaveLength(n);
        for (const d of p.days) {
          expect(d.exercises).toHaveLength(EXERCISES_PER_DAY[level]);
          expect(d.estMinutes).toBeGreaterThan(15);
          expect(d.estMinutes).toBeLessThan(90);
        }
      }
    }
  });

  it('only uses exercises the equipment and level allow', () => {
    for (const eq of EQUIPMENT) {
      for (const level of LEVELS) {
        for (const d of plan(5, eq, level, 3).days) {
          for (const pr of d.exercises) {
            const ex = EXERCISES_BY_ID.get(pr.exerciseId)!;
            expect(ex.equipment, ex.id).toContain(eq);
            expect(LEVEL_RANK[ex.minLevel], ex.id).toBeLessThanOrEqual(LEVEL_RANK[level]);
          }
        }
      }
    }
  });

  it('covers the template patterns in order', () => {
    const p = plan(3, 'dumbbells', 'intermediate');
    const split = splitFor(3, 'intermediate');
    p.days.forEach((d, i) => {
      expect(d.exercises.map((pr) => EXERCISES_BY_ID.get(pr.exerciseId)!.pattern)).toEqual(split[i]!.patterns);
    });
  });

  it('never repeats an exercise within a session', () => {
    for (const eq of EQUIPMENT) {
      for (const d of plan(6, eq, 'advanced', 9).days) {
        expect(new Set(d.exercises.map((e) => e.exerciseId)).size).toBe(d.exercises.length);
      }
    }
  });

  it('avoids repeating an exercise on consecutive gym days', () => {
    const p = plan(6, 'gym', 'intermediate', 2);
    for (let i = 1; i < p.days.length; i++) {
      const prev = new Set(p.days[i - 1]!.exercises.map((e) => e.exerciseId));
      for (const e of p.days[i]!.exercises) expect(prev.has(e.exerciseId), `${e.exerciseId} on day ${i}`).toBe(false);
    }
  });

  it('prescribes by level', () => {
    const beg = plan(1, 'gym', 'beginner').days[0]!.exercises.filter((p) => !p.timed && !EXERCISES_BY_ID.get(p.exerciseId)!.bodyweight);
    expect(beg.length).toBeGreaterThan(0);
    for (const p of beg) expect([p.sets, p.repMin, p.repMax]).toEqual([3, 10, 12]);

    const adv = plan(1, 'gym', 'advanced').days[0]!;
    const first = adv.exercises[0]!;
    expect(first.sets).toBe(4);
    expect(first.repMin).toBe(6);
    expect(first.restSec).toBe(120);
  });

  it('prescribes holds in seconds', () => {
    const p = plan(3, 'none', 'beginner', 4);
    const timed = p.days.flatMap((d) => d.exercises).filter((e) => e.timed);
    expect(timed.length).toBeGreaterThan(0);
    for (const t of timed) expect(EXERCISES_BY_ID.get(t.exerciseId)!.timed).toBe(true);
  });
});

describe('workoutKcal', () => {
  it('uses the resistance MET table', () => {
    expect(workoutKcal({ durationMin: 60, intensity: 'moderate', weightKg: 70 })).toBe(368);
  });
  it('uses a cardio exercise MET when given', () => {
    expect(workoutKcal({ durationMin: 30, intensity: 'light', weightKg: 80, cardio: EXERCISES_BY_ID.get('run') })).toBe(
      Math.round(((9.8 * 3.5 * 80) / 200) * 30),
    );
  });
});
