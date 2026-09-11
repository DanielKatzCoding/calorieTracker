import Dexie, { type EntityTable } from 'dexie';
import type { DailyMenu, DiaryEntry, FoodItem, Profile, WeightEntry, WorkoutLog, WorkoutTemplate } from '@/domain/types';

export const DB_NAME = 'calorieTracker';

export class AppDB extends Dexie {
  profile!: EntityTable<Profile, 'id'>;
  diary!: EntityTable<DiaryEntry, 'id'>;
  weights!: EntityTable<WeightEntry, 'id'>;
  workoutTemplate!: EntityTable<WorkoutTemplate, 'id'>;
  workoutLogs!: EntityTable<WorkoutLog, 'id'>;
  menus!: EntityTable<DailyMenu, 'id'>;
  customFoods!: EntityTable<FoodItem, 'id'>;

  constructor(name: string = DB_NAME) {
    super(name);
    // Never change an existing version's schema: add version(2).stores(...).upgrade(...) instead.
    this.version(1).stores({
      profile: 'id',
      diary: 'id, dateKey, [dateKey+slot], createdAt',
      weights: 'id, dateKey',
      workoutTemplate: 'id',
      workoutLogs: 'id, dateKey',
      menus: 'id',
      customFoods: 'id, name',
    });
  }

  get allTables() {
    return [this.profile, this.diary, this.weights, this.workoutTemplate, this.workoutLogs, this.menus, this.customFoods];
  }
}

export const db = new AppDB();
