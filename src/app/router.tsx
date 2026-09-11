import { createHashRouter, Navigate } from 'react-router';
import { AppShell } from './AppShell';
import { Placeholder } from './Placeholder';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: 'today', element: <Placeholder title="Today" /> },
      { path: 'diary', element: <Placeholder title="Diary" /> },
      { path: 'menu', element: <Placeholder title="Menu" /> },
      { path: 'train', element: <Placeholder title="Train" /> },
      { path: 'more', element: <Placeholder title="More" /> },
    ],
  },
  { path: '*', element: <Navigate to="/today" replace /> },
]);
