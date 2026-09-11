import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '@/hooks/useToast';

/** Registers the service worker on every route (including onboarding) and offers reloads. */
export function ServiceWorkerUpdater() {
  const toast = useToast();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() {
      // Ask the browser to treat our storage as persistent where supported (no-op on Safari).
      navigator.storage?.persist?.().catch(() => undefined);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast.show('Update available', { action: { label: 'Reload', onClick: () => void updateServiceWorker(true) }, durationMs: 0 });
    }
  }, [needRefresh, toast, updateServiceWorker]);

  return null;
}
