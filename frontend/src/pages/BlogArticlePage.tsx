import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import { blogArticles } from './BlogPage';

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  const flushCode = () => {
    if (codeLines.length > 0) {
      elements.push(
        <pre key={`code-${elements.length}`} className="my-4 rounded-lg border overflow-x-auto p-4 text-[13px] leading-relaxed" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
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
        <div key={`table-${elements.length}`} className="my-4 rounded-lg border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: 'var(--color-surface)' }}>
                {headers.map((h, i) => <th key={i} className="px-3 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>{h.trim()}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderTop: '1px solid var(--color-border)' }}>
                  {row.map((cell, ci) => <td key={ci} className="px-3 py-2" style={{ color: 'var(--color-text-secondary)' }}>{cell.trim()}</td>)}
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
      if (inCode) { flushCode(); inCode = false; } else { flushTable(); inCode = true; }
      return;
    }
    if (inCode) { codeLines.push(line); return; }
    if (line.startsWith('|')) { inTable = true; tableRows.push(line); return; }
    if (inTable) { flushTable(); inTable = false; }

    if (line.startsWith('# ')) { elements.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-3" style={{ color: 'var(--color-text-primary)' }}>{line.slice(2)}</h1>); return; }
    if (line.startsWith('## ')) { elements.push(<h2 key={i} className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--color-text-primary)' }}>{line.slice(3)}</h2>); return; }
    if (line.startsWith('### ')) { elements.push(<h3 key={i} className="text-[15px] font-medium mt-4 mb-2" style={{ color: 'var(--color-text-primary)' }}>{line.slice(4)}</h3>); return; }
    if (line.match(/^\d+\.\s/)) { elements.push(<li key={i} className="ml-5 list-decimal mb-1" style={{ color: 'var(--color-text-secondary)' }}>{line.replace(/^\d+\.\s/, '')}</li>); return; }
    if (line.startsWith('- ')) { elements.push(<li key={i} className="ml-5 list-disc mb-1" style={{ color: 'var(--color-text-secondary)' }}>{line.slice(2)}</li>); return; }
    if (line.trim() === '') { elements.push(<div key={i} className="h-2" />); return; }
    elements.push(<p key={i} className="mb-2 leading-relaxed text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>{line}</p>);
  });

  flushCode();
  flushTable();
  return elements;
}

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = blogArticles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="h-full flex flex-col items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Article Not Found</h1>
        <p className="text-[13px] mb-4" style={{ color: 'var(--color-text-muted)' }}>The article you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/blog')} className="px-4 py-2 text-[13px] font-medium rounded-lg transition-colors"
          style={{ background: 'var(--color-accent)', color: '#fff' }}>Back to Blog</button>
      </div>
    );
  }

  const related = blogArticles.filter(a => a.id !== article.id && (a.category === article.category || a.tags.some(t => article.tags.includes(t)))).slice(0, 3);

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-background)' }}>
      {/* Cover */}
      <div className="h-32 md:h-40 flex items-center justify-center" style={{ background: article.coverGradient }}>
        <span className="text-white/20 text-6xl font-bold">{article.title.charAt(0)}</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] mb-4" style={{ color: 'var(--color-text-muted)' }}>
          <button onClick={() => navigate('/blog')} className="hover:underline" style={{ color: 'var(--color-accent)' }}>Blog</button>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--color-text-secondary)' }}>{article.category}</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--color-text-primary)' }}>{article.title}</span>
        </div>

        {/* Meta */}
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{article.category}</span>
        <h1 className="text-2xl md:text-3xl font-bold mt-1 mb-3" style={{ color: 'var(--color-text-primary)' }}>{article.title}</h1>
        <p className="text-[14px] mb-4" style={{ color: 'var(--color-text-muted)' }}>{article.description}</p>

        <div className="flex items-center gap-3 text-[12px] pb-6 mb-6 border-b" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {article.readingTime}</span>
        </div>

        {/* Content */}
        <div className="max-w-none">
          {renderContent(article.content)}
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-10 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map(r => (
                <button key={r.id} onClick={() => navigate(`/blog/${r.slug}`)}
                  className="text-left p-3 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-accent)' }}>{r.category}</span>
                  <p className="text-[13px] font-medium mt-1 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>{r.title}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={() => navigate('/blog')} className="flex items-center gap-2 text-[13px] transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          ><ArrowLeft size={14} /> Back to Blog</button>
        </div>
      </div>
    </div>
  );
}
