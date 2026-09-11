import type { DateKey, DiaryEntry, DiarySource } from '@/domain/types';
import { db as defaultDb, type AppDB } from '../db';
import { newId, nowIso } from '@/lib/ids';

export type DiaryEntryDraft = Omit<DiaryEntry, 'id' | 'createdAt'>;

export function diaryRepo(db: AppDB = defaultDb) {
  return {
    forDay: (dateKey: DateKey) => db.diary.where('dateKey').equals(dateKey).sortBy('createdAt'),

    between: (from: DateKey, to: DateKey) => db.diary.where('dateKey').between(from, to, true, true).toArray(),

    async add(draft: DiaryEntryDraft): Promise<DiaryEntry> {
      const entry: DiaryEntry = { ...draft, id: newId(), createdAt: nowIso() };
      await db.diary.add(entry);
      return entry;
    },

    update: (id: string, changes: Partial<DiaryEntryDraft>) => db.diary.update(id, changes),

    remove: (id: string) => db.diary.delete(id),

    /** Most recently logged distinct food/recipe sources, newest first. */
    async recentSources(limit = 12): Promise<{ source: DiarySource; name: string; grams: number }[]> {
      const seen = new Set<string>();
      const out: { source: DiarySource; name: string; grams: number }[] = [];
      await db.diary
        .orderBy('createdAt')
        .reverse()
        .until(() => out.length >= limit)
        .each((e) => {
          const key = e.source.kind === 'food' ? `food:${e.source.foodId}` : e.source.kind === 'recipe' ? `recipe:${e.source.recipeId}` : `custom:${e.name}`;
          if (seen.has(key)) return;
          seen.add(key);
          out.push({ source: e.source, name: e.name, grams: e.grams });
        });
      return out;
    },
  };
}
