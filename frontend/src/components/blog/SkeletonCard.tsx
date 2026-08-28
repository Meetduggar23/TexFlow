export default function SkeletonCard() {
  return (
    <div
      className="border overflow-hidden animate-pulse"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      <div className="h-40" style={{ background: 'var(--color-surface-elevated)' }} />
      <div className="p-4">
        <div className="h-2.5 w-16 mb-3" style={{ background: 'var(--color-surface-elevated)' }} />
        <div className="h-3.5 w-full mb-1.5" style={{ background: 'var(--color-surface-elevated)' }} />
        <div className="h-3.5 w-3/4 mb-3" style={{ background: 'var(--color-surface-elevated)' }} />
        <div className="h-2.5 w-full mb-1" style={{ background: 'var(--color-surface-elevated)' }} />
        <div className="h-2.5 w-2/3" style={{ background: 'var(--color-surface-elevated)' }} />
      </div>
    </div>
  );
}
