import type { Profile } from '@/domain/types';
import { db as defaultDb, type AppDB } from '../db';
import { nowIso } from '@/lib/ids';

export type ProfileDraft = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;

export function profileRepo(db: AppDB = defaultDb) {
  return {
    get: () => db.profile.get('me'),

    async save(draft: ProfileDraft): Promise<Profile> {
      const existing = await db.profile.get('me');
      const now = nowIso();
      const profile: Profile = { ...draft, id: 'me', createdAt: existing?.createdAt ?? now, updatedAt: now };
      await db.profile.put(profile);
      return profile;
    },

    /** Partial update, e.g. syncing the latest logged weight. */
    async patch(changes: Partial<ProfileDraft>): Promise<void> {
      await db.profile.update('me', { ...changes, updatedAt: nowIso() });
    },

    clear: () => db.profile.delete('me'),
  };
}
