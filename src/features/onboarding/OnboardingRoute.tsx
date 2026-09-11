import { Navigate, useSearchParams } from 'react-router';
import { useProfile } from '@/hooks/useProfile';
import { QuizWizard } from './QuizWizard';
import { Spinner } from '@/components/Spinner';

/** `/onboarding` for first run, `/onboarding?edit=1` to change an existing profile. */
export function OnboardingRoute() {
  const state = useProfile();
  const [params] = useSearchParams();
  const editing = params.get('edit') === '1';
  if (state.status === 'loading') return <Spinner full />;
  if (state.status === 'ready' && !editing) return <Navigate to="/today" replace />;
  return <QuizWizard existing={state.status === 'ready' ? state.profile : undefined} />;
}
