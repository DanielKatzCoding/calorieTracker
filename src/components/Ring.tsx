export interface RingProps {
  value: number;
  target: number;
  size?: number;
  stroke?: number;
  /** CSS color for the progress arc. */
  color: string;
  label: string;
  unit?: string;
  /** Show remaining instead of consumed in the centre. */
  showRemaining?: boolean;
}

export function Ring({ value, target, size = 88, stroke = 9, color, label, unit = '', showRemaining }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const over = target > 0 && value > target;
  const centre = showRemaining ? Math.round(target - value) : Math.round(value);
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} ${Math.round(value)} of ${Math.round(target)} ${unit}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={over ? 'var(--color-danger)' : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 400ms ease' }}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="currentColor" fontSize={size * 0.22} fontWeight={600}>
          {centre}
        </text>
      </svg>
      <div className="mt-1 text-center text-xs text-muted">
        {label}
        {unit && <span className="ml-1">{showRemaining ? `${unit} left` : `/ ${Math.round(target)}${unit}`}</span>}
      </div>
    </div>
  );
}
