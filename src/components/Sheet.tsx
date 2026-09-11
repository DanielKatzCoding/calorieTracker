import { useEffect, type ReactNode } from 'react';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Sticky footer, e.g. a confirm button. */
  footer?: ReactNode;
}

/** Bottom sheet. Scrolls internally so the iOS keyboard never hides the content. */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] flex-col rounded-t-3xl bg-surface shadow-2xl">
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border" />
        {title && (
          <div className="flex items-center justify-between px-5 pb-2 pt-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="h-9 w-9 rounded-full bg-surface-2 text-muted" aria-label="Close">
              ✕
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-border px-5 pb-[calc(var(--safe-bottom)+16px)] pt-3">{footer}</div>}
        {!footer && <div className="pb-[var(--safe-bottom)]" />}
      </div>
    </div>
  );
}
