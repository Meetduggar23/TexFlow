export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="h-3 w-16 rounded mb-2" style={{ background: 'var(--color-surface-elevated)' }} />
          <div className="h-6 w-10 rounded mb-1" style={{ background: 'var(--color-surface-elevated)' }} />
          <div className="h-2 w-20 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <div className="px-4 py-3" style={{ background: 'var(--color-surface)' }}>
        <div className="flex gap-4">
          <div className="h-3 w-4 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
          <div className="h-3 w-24 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
          <div className="h-3 w-16 rounded ml-auto" style={{ background: 'var(--color-surface-elevated)' }} />
          <div className="h-3 w-24 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
          <div className="h-3 w-20 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 animate-pulse" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-4">
            <div className="h-4 w-4 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
            <div className="h-4 w-32 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
            <div className="h-4 w-16 rounded ml-auto" style={{ background: 'var(--color-surface-elevated)' }} />
            <div className="h-4 w-24 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
            <div className="h-4 w-20 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="h-28" style={{ background: 'var(--color-surface-elevated)' }} />
          <div className="p-4 space-y-2">
            <div className="h-3 w-16 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
            <div className="h-4 w-32 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
            <div className="h-3 w-48 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
            <div className="flex gap-2 mt-2">
              <div className="h-3 w-20 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
              <div className="h-3 w-16 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
