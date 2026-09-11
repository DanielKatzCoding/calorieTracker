export function ProgressBar({ value, max, color = 'var(--color-accent)', height = 6 }: { value: number; max: number; color?: string; height?: number }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="w-full overflow-hidden rounded-full bg-surface-2" style={{ height }} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function MacroBar({ label, value, target, color, unit = 'g' }: { label: string; value: number; target: number; color: string; unit?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span>
          <span className="font-semibold">{Math.round(value)}</span>
          <span className="text-muted"> / {Math.round(target)}{unit}</span>
        </span>
      </div>
      <ProgressBar value={value} max={target} color={value > target * 1.05 ? 'var(--color-danger)' : color} />
    </div>
  );
}
