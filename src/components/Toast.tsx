import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastAction, type ToastApi, type ToastTone } from '@/hooks/useToast';

interface ToastItem {
  id: number;
  text: string;
  tone: ToastTone;
  action?: ToastAction;
}

const TONE: Record<ToastTone, string> = {
  info: 'bg-surface-2 text-text border-border',
  success: 'bg-accent/15 text-text border-accent/50',
  error: 'bg-danger/15 text-text border-danger/50',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const show = useCallback<ToastApi['show']>((text, opts) => {
    const id = ++counter.current;
    setItems((xs) => [...xs, { id, text, tone: opts?.tone ?? 'info', action: opts?.action }]);
    const ttl = opts?.durationMs ?? (opts?.action ? 8000 : 2500);
    if (ttl > 0) setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), ttl);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--safe-bottom)+80px)] z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div key={t.id} role="status" className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${TONE[t.tone]}`}>
            <span className="flex-1">{t.text}</span>
            {t.action && (
              <button
                type="button"
                className="font-semibold text-accent"
                onClick={() => {
                  t.action!.onClick();
                  setItems((xs) => xs.filter((x) => x.id !== t.id));
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
