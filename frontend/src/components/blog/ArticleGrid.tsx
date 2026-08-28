import type { BlogArticle } from '../../pages/BlogPage';
import ArticleCard from './ArticleCard';

interface ArticleGridProps {
  articles: BlogArticle[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          No articles found
        </p>
        <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          Try a different search or category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
