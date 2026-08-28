import { Search } from 'lucide-react';

interface BlogHeaderProps {
  onSearchOpen: () => void;
}

export default function BlogHeader({ onSearchOpen }: BlogHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6 mb-10">
      <div>
        <h1
          className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
          style={{ color: 'var(--color-accent)' }}
        >
          <span className="tf-brand" style={{ textTransform: 'none', letterSpacing: '0.02em' }}><span className="tf-brand-tex">Tex</span><span className="tf-brand-flow">Flow</span></span> Blog
        </h1>
        <p
          className="text-[15px] md:text-[17px] leading-relaxed max-w-xl"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Engineering, LaTeX, productivity, and the tools behind better document workflows.
        </p>
      </div>
      <button
        onClick={onSearchOpen}
        className="flex items-center justify-center w-9 h-9 flex-shrink-0 border transition-colors mt-1"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-muted)',
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent)';
          e.currentTarget.style.color = 'var(--color-accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-text-muted)';
        }}
        aria-label="Search articles"
        title="Search articles (Ctrl+K)"
      >
        <Search size={15} />
      </button>
    </div>
  );
}
