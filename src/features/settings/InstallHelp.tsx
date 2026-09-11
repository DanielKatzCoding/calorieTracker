import { Card } from '@/components/Card';
import { isIOS, isStandalone } from '@/lib/pwa';

export function InstallHelp() {
  if (isStandalone()) {
    return (
      <Card className="text-sm text-muted">
        <span className="text-accent">✓ Installed.</span> The app works offline and your data is kept by iOS as long as the icon stays on your Home Screen.
      </Card>
    );
  }
  return (
    <Card className="text-sm">
      <p className="font-medium">Add to your Home Screen</p>
      {isIOS() ? (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          <li>Open this page in Safari (not inside another app).</li>
          <li>
            Tap the <strong>Share</strong> button (square with an arrow).
          </li>
          <li>
            Scroll and tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.
          </li>
          <li>Open the app from the new icon and set up your profile there. Data in Safari and in the installed app are separate.</li>
        </ol>
      ) : (
        <p className="mt-2 text-muted">Use your browser's menu and choose "Install app" or "Add to Home screen".</p>
      )}
      <p className="mt-3 text-xs text-muted">
        Why: Safari deletes a website's stored data after 7 days without a visit. Installed apps are exempt and open full-screen without browser bars.
      </p>
    </Card>
  );
}
