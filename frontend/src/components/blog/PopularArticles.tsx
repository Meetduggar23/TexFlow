import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { BlogArticle } from '../../pages/BlogPage';

interface PopularArticlesProps {
  articles: BlogArticle[];
}

export default function PopularArticles({ articles }: PopularArticlesProps) {
  const navigate = useNavigate();

  if (articles.length === 0) return null;

  return (
    <div className="mb-10">
      <h2
        className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Popular Articles
      </h2>
      <div className="border" style={{ borderColor: 'var(--color-border)' }}>
        {articles.map((article, i) => (
          <button
            key={article.id}
            onClick={() => navigate(`/blog/${article.slug}`)}
            className="w-full text-left px-4 py-3 flex items-center gap-4 transition-colors group"
            style={{
              borderBottom: i < articles.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'var(--color-surface)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span
              className="text-[12px] font-mono w-6 flex-shrink-0"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
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
      </div>
    </div>
  );
}
