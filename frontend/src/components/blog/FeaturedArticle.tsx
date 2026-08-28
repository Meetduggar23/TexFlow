import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import type { BlogArticle } from '../../pages/BlogPage';

interface FeaturedArticleProps {
  article: BlogArticle;
}

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/blog/${article.slug}`)}
      className="w-full text-left border overflow-hidden mb-8 transition-colors group flex flex-col md:flex-row"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
    >
      {/* Image */}
      <div
        className="w-full md:w-64 h-44 md:h-auto flex-shrink-0 overflow-hidden"
        style={{ background: article.coverGradient }}
      >
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-5xl font-bold">
              {article.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 flex flex-col justify-center flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            Featured
          </span>
          <span
            className="text-[10px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {article.category}
          </span>
        </div>

        <h2
          className="text-[17px] md:text-[19px] font-semibold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {article.title}
        </h2>

        <p
          className="text-[13px] leading-relaxed mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {article.description}
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
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

          <span
            className="text-[11px] font-medium flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--color-accent)' }}
          >
            Read article <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}
