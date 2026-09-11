import type { DateKey, WorkoutLog, WorkoutTemplate } from '@/domain/types';
import { db as defaultDb, type AppDB } from '../db';
import { newId, nowIso } from '@/lib/ids';

export type WorkoutLogDraft = Omit<WorkoutLog, 'id' | 'createdAt'>;

export function workoutRepo(db: AppDB = defaultDb) {
  return {
    /** The single active plan. */
    getTemplate: async () => (await db.workoutTemplate.toArray())[0],

    async saveTemplate(t: WorkoutTemplate): Promise<void> {
      await db.transaction('rw', db.workoutTemplate, async () => {
        await db.workoutTemplate.clear();
        await db.workoutTemplate.put(t);
      });
    },

    logsForDay: (dateKey: DateKey) => db.workoutLogs.where('dateKey').equals(dateKey).toArray(),

    listLogs: () => db.workoutLogs.orderBy('dateKey').reverse().toArray(),

    async addLog(draft: WorkoutLogDraft): Promise<WorkoutLog> {
      const log: WorkoutLog = { ...draft, id: newId(), createdAt: nowIso() };
      await db.workoutLogs.add(log);
      return log;
    },

    removeLog: (id: string) => db.workoutLogs.delete(id),
  };
}
