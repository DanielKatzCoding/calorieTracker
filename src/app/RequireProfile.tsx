import { Navigate, Outlet } from 'react-router';
import { useProfile } from '@/hooks/useProfile';
import { ReadyProfileContext } from '@/hooks/useReadyProfile';
import { Spinner } from '@/components/Spinner';

/** Gate for the main app: waits for IndexedDB, sends new users to the quiz. */
export function RequireProfile() {
  const state = useProfile();
  if (state.status === 'loading') return <Spinner full />;
  if (state.status === 'none') return <Navigate to="/onboarding" replace />;
  return (
    <ReadyProfileContext.Provider value={{ profile: state.profile, targets: state.targets }}>
      <Outlet />
    </ReadyProfileContext.Provider>
  );
}
