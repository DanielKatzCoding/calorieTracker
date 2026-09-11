import type { WeightEntry } from '@/domain/types';
import { parseDateKey } from '@/lib/dates';

/** Simple responsive SVG line chart; no library. */
export function WeightChart({ entries, goalKg }: { entries: WeightEntry[]; goalKg: number }) {
  const W = 320;
  const H = 140;
  const pad = { l: 34, r: 8, t: 8, b: 20 };
  if (entries.length < 2) {
    return <div className="flex h-[140px] items-center justify-center text-sm text-muted">Log weight on two or more days to see a trend.</div>;
  }
  const xs = entries.map((e) => parseDateKey(e.dateKey).getTime());
  const ys = entries.map((e) => e.kg);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.floor(Math.min(...ys, goalKg) - 1);
  const maxY = Math.ceil(Math.max(...ys, goalKg) + 1);
  const sx = (x: number) => pad.l + ((x - minX) / Math.max(maxX - minX, 1)) * (W - pad.l - pad.r);
  const sy = (y: number) => pad.t + (1 - (y - minY) / Math.max(maxY - minY, 1)) * (H - pad.t - pad.b);
  const points = entries.map((e, i) => `${sx(xs[i]!).toFixed(1)},${sy(e.kg).toFixed(1)}`).join(' ');
  const ticks = [minY, (minY + maxY) / 2, maxY];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[140px] w-full" role="img" aria-label="Weight over time">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} stroke="var(--color-border)" strokeDasharray="2 3" />
          <text x={pad.l - 6} y={sy(t)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="var(--color-muted)">
            {Math.round(t)}
          </text>
        </g>
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={sy(goalKg)} y2={sy(goalKg)} stroke="var(--color-accent)" strokeOpacity="0.6" />
      <text x={W - pad.r} y={sy(goalKg) - 4} textAnchor="end" fontSize="10" fill="var(--color-accent)">
        goal
      </text>
      <polyline points={points} fill="none" stroke="var(--color-protein)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {entries.map((e, i) => (
        <circle key={e.id} cx={sx(xs[i]!)} cy={sy(e.kg)} r="3" fill="var(--color-bg)" stroke="var(--color-protein)" strokeWidth="2" />
      ))}
      <text x={pad.l} y={H - 4} fontSize="10" fill="var(--color-muted)">
        {entries[0]!.dateKey.slice(5)}
      </text>
      <text x={W - pad.r} y={H - 4} textAnchor="end" fontSize="10" fill="var(--color-muted)">
        {entries[entries.length - 1]!.dateKey.slice(5)}
      </text>
    </svg>
  );
}
