import { useState } from 'react';
import { Link } from 'react-router';
import { dismissInstallBanner, installBannerDismissed, isIOS, isStandalone } from '@/lib/pwa';

/** Safari deletes site data after 7 days without a visit unless the app is on the Home Screen. */
export function InstallBanner() {
  const [hidden, setHidden] = useState(() => isStandalone() || installBannerDismissed());
  if (hidden) return null;
  return (
    <div className="mb-3 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm">
      <span className="text-xl" aria-hidden>📲</span>
      <div className="flex-1">
        <div className="font-medium">Install for offline use</div>
        <div className="mt-0.5 text-muted">
          {isIOS() ? 'Tap Share, then "Add to Home Screen".' : 'Add this app to your home screen.'} Installed apps keep your data safe from Safari's 7-day cleanup.{' '}
          <Link to="/more" className="text-accent">
            How
          </Link>
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        className="text-muted"
        onClick={() => {
          dismissInstallBanner();
          setHidden(true);
        }}
      >
        ✕
      </button>
    </div>
  );
}
