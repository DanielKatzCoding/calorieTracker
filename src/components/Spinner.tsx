export function Spinner({ full }: { full?: boolean }) {
  const dot = <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-border border-t-accent" role="status" aria-label="Loading" />;
  if (!full) return dot;
  return <div className="flex h-dvh items-center justify-center bg-bg">{dot}</div>;
}
