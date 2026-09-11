import { createHashRouter, Navigate } from 'react-router';
import { AppShell } from './AppShell';
import { RequireProfile } from './RequireProfile';
import { OnboardingRoute } from '@/features/onboarding/OnboardingRoute';
import { TodayScreen } from '@/features/today/TodayScreen';
import { DiaryScreen } from '@/features/diary/DiaryScreen';
import { MenuScreen } from '@/features/menu/MenuScreen';
import { TrainScreen } from '@/features/workouts/TrainScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { WeightScreen } from '@/features/weight/WeightScreen';

export const router = createHashRouter([
  { path: '/onboarding', element: <OnboardingRoute /> },
  {
    path: '/',
    element: <RequireProfile />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/today" replace /> },
          { path: 'today', element: <TodayScreen /> },
          { path: 'diary', element: <DiaryScreen /> },
          { path: 'menu', element: <MenuScreen /> },
          { path: 'train', element: <TrainScreen /> },
          { path: 'more', element: <SettingsScreen /> },
          { path: 'more/weight', element: <WeightScreen /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/today" replace /> },
]);
