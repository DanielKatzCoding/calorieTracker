import type { ReactNode } from 'react';

export interface Option<T extends string | number> {
  value: T;
  label: ReactNode;
  description?: string;
}

export interface SegmentedControlProps<T extends string | number> {
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Stack as a vertical list (good for options with descriptions). */
  vertical?: boolean;
  columns?: 2 | 3 | 4;
}

export function SegmentedControl<T extends string | number>({ options, value, onChange, vertical, columns }: SegmentedControlProps<T>) {
  const grid = vertical ? 'grid-cols-1' : columns ? `grid-cols-${columns}` : `grid-cols-${Math.min(options.length, 4)}`;
  return (
    <div role="radiogroup" className={`grid gap-2 ${grid}`}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={`min-h-12 rounded-xl border px-3 py-2 text-left transition-colors ${
              selected ? 'border-accent bg-accent/15 text-text' : 'border-border bg-surface-2 text-muted'
            } ${vertical ? '' : 'text-center'}`}
          >
            <div className={`font-medium ${vertical ? '' : 'text-sm'} ${selected ? 'text-text' : ''}`}>{o.label}</div>
            {o.description && <div className="mt-0.5 text-xs text-muted">{o.description}</div>}
          </button>
        );
      })}
    </div>
  );
}

export interface ChipSelectProps<T extends string> {
  options: readonly Option<T>[];
  value: readonly T[];
  onChange: (value: T[]) => void;
}

/** Multi-select as wrapping chips. */
export function ChipSelect<T extends string>({ options, value, onChange }: ChipSelectProps<T>) {
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o.value)}
            className={`h-10 rounded-full border px-4 text-sm transition-colors ${on ? 'border-accent bg-accent/15 text-text' : 'border-border bg-surface-2 text-muted'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
