import type { BackupFile } from '@/domain/types';
import { db as defaultDb, type AppDB } from './db';
import { nowIso } from '@/lib/ids';

export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_APP = 'calorieTracker';

export async function exportAll(db: AppDB = defaultDb): Promise<BackupFile> {
  return db.transaction('r', db.allTables, async () => ({
    schemaVersion: BACKUP_SCHEMA_VERSION,
    app: BACKUP_APP,
    exportedAt: nowIso(),
    profile: (await db.profile.get('me')) ?? null,
    diary: await db.diary.toArray(),
    weights: await db.weights.toArray(),
    workoutTemplate: (await db.workoutTemplate.toArray())[0] ?? null,
    workoutLogs: await db.workoutLogs.toArray(),
    menus: await db.menus.toArray(),
    customFoods: await db.customFoods.toArray(),
  }));
}

export type ValidationResult = { ok: true; data: BackupFile } | { ok: false; error: string };

const isArray = (v: unknown): v is unknown[] => Array.isArray(v);

/** Structural check before touching the database; never throws. */
export function validateBackup(input: unknown): ValidationResult {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Not a JSON object.' };
  const o = input as Record<string, unknown>;
  if (o.app !== BACKUP_APP) return { ok: false, error: 'This file was not exported by Calorie Tracker.' };
  if (o.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    return { ok: false, error: `Unsupported backup version ${String(o.schemaVersion)} (expected ${BACKUP_SCHEMA_VERSION}).` };
  }
  for (const key of ['diary', 'weights', 'workoutLogs', 'menus', 'customFoods'] as const) {
    if (!isArray(o[key])) return { ok: false, error: `Field "${key}" must be a list.` };
  }
  if (o.profile !== null && (typeof o.profile !== 'object' || (o.profile as { id?: unknown }).id !== 'me')) {
    return { ok: false, error: 'Profile is malformed.' };
  }
  if (o.workoutTemplate !== null && typeof o.workoutTemplate !== 'object') return { ok: false, error: 'Workout plan is malformed.' };
  return { ok: true, data: input as BackupFile };
}

/** Replaces all local data with the backup, atomically. */
export async function importAll(file: BackupFile, db: AppDB = defaultDb): Promise<void> {
  await db.transaction('rw', db.allTables, async () => {
    await Promise.all(db.allTables.map((t) => t.clear()));
    if (file.profile) await db.profile.put(file.profile);
    await db.diary.bulkPut(file.diary);
    await db.weights.bulkPut(file.weights);
    if (file.workoutTemplate) await db.workoutTemplate.put(file.workoutTemplate);
    await db.workoutLogs.bulkPut(file.workoutLogs);
    await db.menus.bulkPut(file.menus);
    await db.customFoods.bulkPut(file.customFoods);
  });
}

export async function resetAll(db: AppDB = defaultDb): Promise<void> {
  await db.transaction('rw', db.allTables, async () => {
    await Promise.all(db.allTables.map((t) => t.clear()));
  });
}

export function backupFileName(now: Date = new Date()): string {
  return `calorie-tracker-backup-${now.toISOString().slice(0, 10)}.json`;
}
