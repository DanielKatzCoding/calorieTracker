import type { DateKey, WeightEntry } from '@/domain/types';
import { db as defaultDb, type AppDB } from '../db';
import { newId, nowIso } from '@/lib/ids';

export function weightRepo(db: AppDB = defaultDb) {
  return {
    list: () => db.weights.orderBy('dateKey').toArray(),

    async latest(): Promise<WeightEntry | undefined> {
      return db.weights.orderBy('dateKey').last();
    },

    /** One entry per day: logging twice on a day replaces the earlier value. */
    async upsertForDay(dateKey: DateKey, kg: number): Promise<WeightEntry> {
      const existing = await db.weights.where('dateKey').equals(dateKey).first();
      if (existing) {
        const updated = { ...existing, kg, createdAt: nowIso() };
        await db.weights.put(updated);
        return updated;
      }
      const entry: WeightEntry = { id: newId(), dateKey, kg, createdAt: nowIso() };
      await db.weights.add(entry);
      return entry;
    },

    remove: (id: string) => db.weights.delete(id),
  };
}
