import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppDB } from './db';
import { profileRepo } from './repos/profileRepo';
import { diaryRepo } from './repos/diaryRepo';
import { weightRepo } from './repos/weightRepo';
import { workoutRepo } from './repos/workoutRepo';
import { menuRepo } from './repos/menuRepo';
import { customFoodRepo } from './repos/customFoodRepo';
import { exportAll, importAll, resetAll, validateBackup } from './backup';
import type { DailyMenu, Profile, WorkoutTemplate } from '@/domain/types';

let db: AppDB;
let n = 0;
beforeEach(() => {
  db = new AppDB(`test-${Date.now()}-${n++}`);
});

const draft: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> = {
  sex: 'male', age: 30, heightCm: 180, weightKg: 80, goalWeightKg: 75, activity: 'moderate', goal: 'lose', pace: 0.5,
  diet: 'omnivore', allergens: [], dislikedFoodIds: [], cuisines: [], mealsPerDay: 3,
  training: { daysPerWeek: 3, equipment: 'dumbbells', level: 'beginner' },
};
const macros = { kcal: 100, proteinG: 10, carbsG: 5, fatG: 3 };

describe('profileRepo', () => {
  it('saves a singleton and keeps createdAt on re-save', async () => {
    const repo = profileRepo(db);
    const a = await repo.save(draft);
    await new Promise((r) => setTimeout(r, 2));
    const b = await repo.save({ ...draft, weightKg: 79 });
    expect(b.id).toBe('me');
    expect(b.createdAt).toBe(a.createdAt);
    expect(b.updatedAt >= a.updatedAt).toBe(true);
    expect((await repo.get())?.weightKg).toBe(79);
    await repo.patch({ weightKg: 78 });
    expect((await repo.get())?.weightKg).toBe(78);
  });
});

describe('diaryRepo', () => {
  it('lists entries by day in creation order and reports recent distinct sources', async () => {
    const repo = diaryRepo(db);
    await repo.add({ dateKey: '2026-09-12', slot: 'breakfast', name: 'Egg', source: { kind: 'food', foodId: 'egg' }, grams: 100, macros });
    await new Promise((r) => setTimeout(r, 2));
    await repo.add({ dateKey: '2026-09-12', slot: 'lunch', name: 'Rice', source: { kind: 'food', foodId: 'rice_white_cooked' }, grams: 150, macros });
    await new Promise((r) => setTimeout(r, 2));
    await repo.add({ dateKey: '2026-09-11', slot: 'dinner', name: 'Egg', source: { kind: 'food', foodId: 'egg' }, grams: 50, macros });

    const day = await repo.forDay('2026-09-12');
    expect(day.map((e) => e.name)).toEqual(['Egg', 'Rice']);
    const recent = await repo.recentSources(5);
    expect(recent.map((r) => r.name)).toEqual(['Egg', 'Rice']);
    expect(recent[0]!.grams).toBe(50);

    await repo.remove(day[0]!.id);
    expect(await repo.forDay('2026-09-12')).toHaveLength(1);
  });
});

describe('weightRepo', () => {
  it('keeps one entry per day and returns the latest by date', async () => {
    const repo = weightRepo(db);
    await repo.upsertForDay('2026-09-10', 80);
    await repo.upsertForDay('2026-09-12', 79);
    await repo.upsertForDay('2026-09-12', 78.5);
    const all = await repo.list();
    expect(all.map((w) => w.kg)).toEqual([80, 78.5]);
    expect((await repo.latest())?.kg).toBe(78.5);
  });
});

describe('menuRepo', () => {
  const menu = (id: string, recipeId: string): DailyMenu => ({
    id, meals: [{ slot: 'lunch', recipeId, scale: 1, macros }], totals: macros, seed: 1, warnings: [], generatedAt: 'x',
  });

  it('returns recipe ids from the previous days and prunes old menus', async () => {
    const repo = menuRepo(db);
    await repo.save(menu('2026-09-10', 'a'));
    await repo.save(menu('2026-09-11', 'b'));
    await repo.save(menu('2026-09-12', 'c'));
    await repo.save(menu('2026-07-01', 'old'));
    expect((await repo.recentRecipeIds('2026-09-12', 2)).sort()).toEqual(['a', 'b']);
    await repo.prune('2026-09-12', 30);
    expect(await repo.get('2026-07-01')).toBeUndefined();
    expect(await repo.get('2026-09-10')).toBeDefined();
  });
});

describe('backup', () => {
  it('round-trips every table through export -> reset -> import', async () => {
    await profileRepo(db).save(draft);
    await diaryRepo(db).add({ dateKey: '2026-09-12', slot: 'snack', name: 'Apple', source: { kind: 'food', foodId: 'apple' }, grams: 180, macros });
    await weightRepo(db).upsertForDay('2026-09-12', 80);
    const template: WorkoutTemplate = { id: 't', name: 'p', daysPerWeek: 1, equipment: 'none', level: 'beginner', days: [], seed: 1, generatedAt: 'x' };
    await workoutRepo(db).saveTemplate(template);
    await workoutRepo(db).addLog({ dateKey: '2026-09-12', title: 'Full Body A', durationMin: 40, intensity: 'moderate', kcalBurned: 250, performed: [] });
    await menuRepo(db).save({ id: '2026-09-12', meals: [], totals: macros, seed: 3, warnings: [], generatedAt: 'x' });
    await customFoodRepo(db).add({ name: 'My bar', category: 'snack', per100g: macros, allergens: [], diets: ['omnivore'] });

    const file = await exportAll(db);
    expect(validateBackup(JSON.parse(JSON.stringify(file))).ok).toBe(true);

    await resetAll(db);
    expect(await profileRepo(db).get()).toBeUndefined();
    expect(await diaryRepo(db).forDay('2026-09-12')).toHaveLength(0);

    await importAll(file, db);
    const again = await exportAll(db);
    const strip = (f: typeof file) => ({ ...f, exportedAt: '' });
    expect(strip(again)).toEqual(strip(file));
    expect(again.customFoods[0]!.isCustom).toBe(true);
  });

  it('rejects foreign or malformed files without touching data', async () => {
    await profileRepo(db).save(draft);
    expect(validateBackup(null).ok).toBe(false);
    expect(validateBackup({ app: 'other', schemaVersion: 1 }).ok).toBe(false);
    expect(validateBackup({ app: 'calorieTracker', schemaVersion: 99 }).ok).toBe(false);
    const missingList = validateBackup({ app: 'calorieTracker', schemaVersion: 1, profile: null, diary: 'nope' });
    expect(missingList.ok).toBe(false);
    if (!missingList.ok) expect(missingList.error).toContain('diary');
    expect(await profileRepo(db).get()).toBeDefined();
  });
});
