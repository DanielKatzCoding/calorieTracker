import { createContext, useContext } from 'react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}
export type ToastTone = 'info' | 'success' | 'error';

export interface ToastApi {
  show: (text: string, opts?: { tone?: ToastTone; action?: ToastAction; durationMs?: number }) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
