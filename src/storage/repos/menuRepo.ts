import type { DailyMenu, DateKey } from '@/domain/types';
import { db as defaultDb, type AppDB } from '../db';
import { lastNDays } from '@/lib/dates';

export function menuRepo(db: AppDB = defaultDb) {
  return {
    get: (dateKey: DateKey) => db.menus.get(dateKey),

    save: (menu: DailyMenu) => db.menus.put(menu),

    remove: (dateKey: DateKey) => db.menus.delete(dateKey),

    /** Recipe ids used on the `days` days before `dateKey` (for variety scoring). */
    async recentRecipeIds(dateKey: DateKey, days = 2): Promise<string[]> {
      const keys = lastNDays(days + 1, dateKey).filter((k) => k !== dateKey);
      const menus = await db.menus.bulkGet(keys);
      return menus.flatMap((m) => m?.meals.map((x) => x.recipeId) ?? []);
    },

    /** Drop menus older than `keepDays` so the table does not grow forever. */
    async prune(today: DateKey, keepDays = 30): Promise<void> {
      const keep = new Set(lastNDays(keepDays, today));
      const all = await db.menus.toCollection().primaryKeys();
      await db.menus.bulkDelete(all.filter((k) => !keep.has(k) && k <= today));
    },
  };
}
