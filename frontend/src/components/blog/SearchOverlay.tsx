import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import type { BlogArticle } from '../../pages/BlogPage';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  articles: BlogArticle[];
}

export default function SearchOverlay({ isOpen, onClose, articles }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q))
    );
  }, [query, articles]);

  const handleSelect = useCallback(
    (slug: string) => {
      onClose();
      setQuery('');
      navigate(`/blog/${slug}`);
    },
    [onClose, navigate]
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Parent handles opening
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl border overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border-strong)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Search size={15} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 py-3.5 text-[14px] bg-transparent border-none outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 border text-[10px] font-medium flex-shrink-0"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
              background: 'transparent',
            }}
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-auto">
          {query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] mb-1" style={{ color: 'var(--color-text-primary)' }}>
                No articles found
              </p>
              <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                Try a different search term or{' '}
                <button
                  onClick={() => setQuery('')}
                  className="underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  clear search
                </button>
              </p>
            </div>
          )}

          {results.map((article) => (
            <button
              key={article.id}
              onClick={() => handleSelect(article.slug)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors group"
              style={{ borderBottom: '1px solid var(--color-border)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--color-surface-elevated)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium truncate"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {article.title}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {article.category} · {article.readingTime}
                </p>
              </div>
              <ArrowRight
                size={13}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--color-accent)' }}
              />
            </button>
          ))}

          {!query.trim() && (
            <div className="px-4 py-6 text-center">
              <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                Type to search across all articles
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2.5 flex items-center gap-4 border-t text-[11px]"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <span>
            <kbd
              className="px-1.5 py-0.5 border text-[10px] font-mono"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
            >
              Enter
            </kbd>{' '}
            to select
          </span>
          <span>
            <kbd
              className="px-1.5 py-0.5 border text-[10px] font-mono"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
            >
              Esc
            </kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
