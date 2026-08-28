interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </p>
      {description && (
        <p className="text-[12px] mb-3" style={{ color: 'var(--color-text-muted)' }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="text-[12px] font-medium underline transition-colors"
          style={{ color: 'var(--color-accent)', background: 'none', border: 'none' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
