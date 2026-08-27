import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { blogArticles } from './BlogPage';

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = blogArticles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="h-full flex flex-col items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Article Not Found</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>The article you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/help/blog')} className="btn-primary">Back to Blog</button>
      </div>
    );
  }

  const related = blogArticles.filter(a => a.id !== article.id && (a.category === article.category || a.tags.some(t => article.tags.includes(t)))).slice(0, 3);

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let inCode = false;
    let codeLines: string[] = [];
    let inTable = false;
    let tableRows: string[] = [];

    const flushCode = () => {
      if (codeLines.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="my-4 rounded-xl border overflow-x-auto p-4 text-[13px] leading-relaxed" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headers = tableRows[0].split('|').filter(c => c.trim());
        const rows = tableRows.slice(2).map(r => r.split('|').filter(c => c.trim()));
        elements.push(
          <div key={`table-${elements.length}`} className="my-4 rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface)' }}>
                  {headers.map((h, i) => <th key={i} className="px-4 py-2 text-left text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{h.trim()}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} style={{ borderTop: '1px solid var(--color-border)' }}>
                    {row.map((cell, ci) => <td key={ci} className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>{cell.trim()}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
    };

    lines.forEach((line, i) => {
      if (line.trim() === '```') {
        if (inCode) { flushCode(); inCode = false; }
        else { flushTable(); inCode = true; }
        return;
      }
      if (inCode) { codeLines.push(line); return; }
      if (line.startsWith('|')) { inTable = true; tableRows.push(line); return; }
      if (inTable) { flushTable(); inTable = false; }

      if (line.startsWith('# ')) { elements.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-3" style={{ color: 'var(--color-text-primary)' }}>{line.slice(2)}</h1>); return; }
      if (line.startsWith('## ')) { elements.push(<h2 key={i} className="text-xl font-semibold mt-6 mb-2" style={{ color: 'var(--color-text-primary)' }}>{line.slice(3)}</h2>); return; }
      if (line.startsWith('### ')) { elements.push(<h3 key={i} className="text-lg font-medium mt-4 mb-2" style={{ color: 'var(--color-text-primary)' }}>{line.slice(4)}</h3>); return; }
      if (line.match(/^\d+\.\s/)) { elements.push(<li key={i} className="ml-6 list-decimal mb-1" style={{ color: 'var(--color-text-secondary)' }}>{line.replace(/^\d+\.\s/, '')}</li>); return; }
      if (line.startsWith('- ')) { elements.push(<li key={i} className="ml-6 list-disc mb-1" style={{ color: 'var(--color-text-secondary)' }}>{line.slice(2)}</li>); return; }
      if (line.trim() === '') { elements.push(<br key={i} />); return; }
      elements.push(<p key={i} className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>{line}</p>);
    });

    flushCode();
    flushTable();
    return elements;
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="flex-1 overflow-auto">
        {/* Cover */}
        <div className="h-48 flex items-center justify-center" style={{ background: article.coverGradient }}>
          <span className="text-white/80 text-6xl font-bold">{article.title.charAt(0)}</span>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          <button onClick={() => navigate('/help/blog')} className="flex items-center gap-2 text-sm mb-6 transition-colors" style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          ><ArrowLeft size={14} /> Back to Blog</button>

          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{article.category}</span>
          <h1 className="text-3xl font-bold mt-1 mb-4" style={{ color: 'var(--color-text-primary)' }}>{article.title}</h1>

          <div className="flex items-center gap-4 mb-8 pb-6 border-b" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <span className="text-sm">{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1 text-sm"><Clock size={13} /> {article.readingTime}</span>
            <div className="flex gap-1.5">
              {article.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Article content */}
          <div className="prose-custom">
            {renderContent(article.content)}
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>Related Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map(r => (
                  <button key={r.id} onClick={() => navigate(`/blog/${r.slug}`)}
                    className="text-left p-4 rounded-xl border transition-colors"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  >
                    <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-accent)' }}>{r.category}</span>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-text-primary)' }}>{r.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
