import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import type { Profile, Targets } from '@/domain/types';
import { computeTargets } from '@/domain/calc/targets';
import { profileRepo } from '@/storage/repos/profileRepo';

export type ProfileState = { status: 'loading' } | { status: 'none' } | { status: 'ready'; profile: Profile; targets: Targets };

/** Reactive profile + derived targets. `loading` until IndexedDB answers, `none` before onboarding. */
export function useProfile(): ProfileState {
  const profile = useLiveQuery(() => profileRepo().get(), [], 'loading' as const);
  return useMemo<ProfileState>(() => {
    if (profile === 'loading') return { status: 'loading' };
    if (!profile) return { status: 'none' };
    return { status: 'ready', profile, targets: computeTargets(profile) };
  }, [profile]);
}
