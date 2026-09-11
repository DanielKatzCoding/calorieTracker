import { RouterProvider } from 'react-router';
import { router } from './router';
import { ToastProvider } from '@/components/Toast';

export function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
