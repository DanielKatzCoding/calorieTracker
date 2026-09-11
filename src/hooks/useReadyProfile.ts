import { createContext, useContext } from 'react';
import type { Profile, Targets } from '@/domain/types';

export interface ReadyProfile {
  profile: Profile;
  targets: Targets;
}

export const ReadyProfileContext = createContext<ReadyProfile | null>(null);

/** Profile and targets, guaranteed present under the RequireProfile route guard. */
export function useReadyProfile(): ReadyProfile {
  const ctx = useContext(ReadyProfileContext);
  if (!ctx) throw new Error('useReadyProfile must be used under RequireProfile');
  return ctx;
}
