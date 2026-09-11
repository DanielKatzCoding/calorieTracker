import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { DailyMenu, DateKey, Profile, Targets } from '@/domain/types';
import { menuRepo } from '@/storage/repos/menuRepo';
import { ensureMenu } from '@/services/planning';

/** Live menu for a day; generates one the first time the day is opened. */
export function useMenu(dateKey: DateKey, profile: Profile, targets: Targets): DailyMenu | undefined {
  const menu = useLiveQuery(() => menuRepo().get(dateKey), [dateKey], 'loading' as const);
  const generating = useRef<string | null>(null);
  useEffect(() => {
    if (menu !== undefined || generating.current === dateKey) return;
    generating.current = dateKey;
    ensureMenu(profile, targets, dateKey).finally(() => {
      if (generating.current === dateKey) generating.current = null;
    });
  }, [menu, dateKey, profile, targets]);
  return menu === 'loading' ? undefined : menu;
}
