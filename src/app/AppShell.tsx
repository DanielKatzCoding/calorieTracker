import { Outlet } from 'react-router';
import { TabBar } from '@/components/TabBar';

export function AppShell() {
  return (
    <div className="flex h-dvh flex-col bg-bg text-text">
      <main className="flex-1 overflow-y-auto pt-[var(--safe-top)]">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
