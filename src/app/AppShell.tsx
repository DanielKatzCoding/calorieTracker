import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { TabBar } from '@/components/TabBar';
import { useToast } from '@/hooks/useToast';

export function AppShell() {
  const toast = useToast();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (needRefresh) toast.show('Update available', { action: { label: 'Reload', onClick: () => void updateServiceWorker(true) }, durationMs: 0 });
  }, [needRefresh, toast, updateServiceWorker]);

  return (
    <div className="flex h-dvh flex-col bg-bg text-text">
      <main className="flex-1 overflow-y-auto pt-[var(--safe-top)]">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
