import { RouterProvider } from 'react-router';
import { router } from './router';
import { ToastProvider } from '@/components/Toast';
import { ServiceWorkerUpdater } from './ServiceWorkerUpdater';

export function App() {
  return (
    <ToastProvider>
      <ServiceWorkerUpdater />
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
