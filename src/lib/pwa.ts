export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true;
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

const DISMISS_KEY = 'installBannerDismissedAt';

export function installBannerDismissed(): boolean {
  try {
    const at = localStorage.getItem(DISMISS_KEY);
    return !!at && Date.now() - Number(at) < 7 * 24 * 3600 * 1000;
  } catch {
    return false;
  }
}

export function dismissInstallBanner(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* storage blocked: banner just shows again */
  }
}

export async function storageEstimate(): Promise<{ usageMB: number; quotaMB: number } | null> {
  try {
    if (!navigator.storage?.estimate) return null;
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usageMB: usage / 1048576, quotaMB: quota / 1048576 };
  } catch {
    return null;
  }
}

/** Share a JSON file via the native sheet when possible, else trigger a download, else copy. */
export async function deliverJsonFile(name: string, json: string): Promise<'shared' | 'downloaded' | 'copied'> {
  const file = new File([json], name, { type: 'application/json' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: name });
      return 'shared';
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') throw e;
    }
  }
  if (!isStandalone()) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return 'downloaded';
  }
  await navigator.clipboard.writeText(json);
  return 'copied';
}
