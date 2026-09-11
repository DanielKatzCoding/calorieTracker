import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useToast } from '@/hooks/useToast';
import { backupFileName, exportAll, importAll, resetAll, validateBackup } from '@/storage/backup';
import { deliverJsonFile, storageEstimate } from '@/lib/pwa';

export function BackupPanel() {
  const toast = useToast();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [usage, setUsage] = useState<string | null>(null);

  useEffect(() => {
    storageEstimate().then((e) => e && setUsage(`${e.usageMB < 0.1 ? '<0.1' : e.usageMB.toFixed(1)} MB used`));
  }, []);

  const doExport = async () => {
    setBusy(true);
    try {
      const data = await exportAll();
      const how = await deliverJsonFile(backupFileName(), JSON.stringify(data, null, 2));
      toast.show(how === 'shared' ? 'Backup shared' : how === 'downloaded' ? 'Backup downloaded' : 'Backup copied to clipboard as text', { tone: 'success' });
    } catch (e) {
      if (!(e instanceof Error && e.name === 'AbortError')) toast.show('Export failed', { tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const doImport = async (file: File) => {
    setBusy(true);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const v = validateBackup(parsed);
      if (!v.ok) {
        toast.show(v.error, { tone: 'error', durationMs: 5000 });
        return;
      }
      const counts = `${v.data.diary.length} diary entries, ${v.data.weights.length} weigh-ins, ${v.data.workoutLogs.length} workouts`;
      if (!window.confirm(`Replace everything on this device with the backup from ${v.data.exportedAt.slice(0, 10)}?\n\n${counts}`)) return;
      await importAll(v.data);
      toast.show('Backup restored', { tone: 'success' });
      navigate('/today');
    } catch {
      toast.show('That file is not valid JSON', { tone: 'error' });
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const doReset = async () => {
    setBusy(true);
    await resetAll();
    setBusy(false);
    navigate('/onboarding', { replace: true });
  };

  return (
    <Card className="space-y-3">
      <p className="text-sm text-muted">
        Your data lives only on this phone. Export a backup now and then; deleting the app or clearing Safari data erases everything.
        {usage && <span className="block text-xs">{usage}</span>}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={doExport} disabled={busy}>
          Export JSON
        </Button>
        <Button variant="secondary" onClick={() => fileInput.current?.click()} disabled={busy}>
          Import JSON
        </Button>
      </div>
      <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
      {!confirmReset ? (
        <Button variant="ghost" size="sm" block className="!text-danger" onClick={() => setConfirmReset(true)}>
          Reset all data
        </Button>
      ) : (
        <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm">
          <p>This deletes your profile, diary, weights and workouts from this device. Export first if unsure.</p>
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => setConfirmReset(false)}>
              Keep my data
            </Button>
            <Button variant="danger" size="sm" className="flex-1" onClick={doReset} disabled={busy}>
              Delete everything
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
