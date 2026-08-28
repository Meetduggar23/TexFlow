import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import type { BlogArticle } from '../../pages/BlogPage';

interface ArticleCardProps {
  article: BlogArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/blog/${article.slug}`)}
      className="text-left border overflow-hidden transition-colors group flex flex-col h-full"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
    >
      {/* Image area */}
      <div
        className="h-40 overflow-hidden"
        style={{ background: article.coverGradient }}
      >
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/15 text-4xl font-bold">
              {article.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span
          className="text-[10px] font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--color-accent)' }}
        >
          {article.category}
        </span>

        <h3
          className="text-[14px] font-semibold mb-1.5 line-clamp-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {article.title}
        </h3>

        <p
          className="text-[12px] leading-relaxed mb-3 line-clamp-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {article.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            <span>
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> {article.readingTime}
            </span>
          </div>

          <ArrowRight
            size={13}
            className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      </div>
    </button>
  );
}
