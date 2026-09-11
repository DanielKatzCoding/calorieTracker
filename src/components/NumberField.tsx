import { useState } from 'react';

export interface NumberFieldProps {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  autoFocus?: boolean;
  hint?: string;
  /** Show +/- stepper buttons. */
  stepper?: boolean;
}

const format = (v: number | null) => (v === null ? '' : String(Math.round(v * 1000) / 1000));

/**
 * Numeric input that tolerates partial typing ("7." / "") while focused and shows the
 * canonical value otherwise, so external updates (steppers, presets) always display.
 */
export function NumberField({ label, value, onChange, unit, min, max, step = 1, placeholder, autoFocus, hint, stepper }: NumberFieldProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const text = editing ?? format(value);

  const commit = (raw: string) => {
    setEditing(raw);
    const n = parseFloat(raw.replace(',', '.'));
    onChange(Number.isFinite(n) ? n : null);
  };
  const nudge = (dir: 1 | -1) => {
    const base = value ?? min ?? 0;
    let next = Math.round((base + dir * step) * 1000) / 1000;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    setEditing(null);
    onChange(next);
  };
  const decimals = step < 1;

  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm text-muted">{label}</span>}
      <div className="flex items-center gap-2">
        {stepper && (
          <button type="button" onClick={() => nudge(-1)} className="h-12 w-12 shrink-0 rounded-xl bg-surface-2 text-xl" aria-label="Decrease">
            −
          </button>
        )}
        <div className="flex h-12 flex-1 items-center rounded-xl border border-border bg-surface-2 px-3 focus-within:border-accent">
          <input
            type="text"
            inputMode={decimals ? 'decimal' : 'numeric'}
            className="min-w-0 flex-1 bg-transparent text-lg outline-none"
            value={text}
            placeholder={placeholder}
            autoFocus={autoFocus}
            onFocus={() => setEditing(format(value))}
            onChange={(e) => commit(e.target.value)}
            onBlur={() => setEditing(null)}
          />
          {unit && <span className="ml-2 text-muted">{unit}</span>}
        </div>
        {stepper && (
          <button type="button" onClick={() => nudge(1)} className="h-12 w-12 shrink-0 rounded-xl bg-surface-2 text-xl" aria-label="Increase">
            +
          </button>
        )}
      </div>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
