import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, CheckCircle, Circle, Clock, FolderOpen } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import type { Comment } from '../types';

const API = '/api';

export default function CommentsPage() {
  const navigate = useNavigate();
  const { projects } = useAppSelector(state => state.project);
  const [comments, setComments] = useState<(Comment & { projectName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const token = localStorage.getItem('token');

  const fetchComments = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const allComments: (Comment & { projectName?: string })[] = [];
      for (const project of projects.slice(0, 20)) {
        try {
          const res = await fetch(`${API}/comments/project/${project.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const projectComments = (data.comments || data || []).map((c: Comment) => ({
              ...c,
              projectName: project.name,
            }));
            allComments.push(...projectComments);
          }
        } catch {}
      }
      allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setComments(allComments);
    } catch {}
    setLoading(false);
  }, [token, projects]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const filtered = comments.filter(c => {
    if (filter === 'unresolved') return !c.resolved;
    if (filter === 'resolved') return c.resolved;
    return true;
  });

  const unresolvedCount = comments.filter(c => !c.resolved).length;

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Comments</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {unresolvedCount > 0 ? `${unresolvedCount} unresolved comment${unresolvedCount !== 1 ? 's' : ''}` : 'All comments resolved'}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-6">
          {(['all', 'unresolved', 'resolved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-[12px] font-medium capitalize transition-colors"
              style={{
                background: filter === f ? 'var(--color-accent)' : 'var(--color-surface)',
                color: filter === f ? '#fff' : 'var(--color-text-secondary)',
                border: `1px solid ${filter === f ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '6px',
              }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg animate-pulse" style={{ background: 'var(--color-surface)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {filter === 'all' ? 'No comments yet' : `No ${filter} comments`}
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Comments on your projects will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(comment => (
              <button key={comment.id}
                onClick={() => comment.projectId && navigate(`/project/${comment.projectId}`)}
                className="w-full text-left p-4 border rounded-lg transition-colors"
                style={{ background: 'var(--color-surface)', borderColor: comment.resolved ? 'var(--color-border)' : 'var(--color-accent)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = comment.resolved ? 'var(--color-border)' : 'var(--color-accent)'}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {comment.resolved
                      ? <CheckCircle size={16} style={{ color: 'var(--color-accent)' }} />
                      : <Circle size={16} style={{ color: 'var(--color-text-muted)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-medium" style={{ color: 'var(--color-text-primary)' }}>{comment.user?.name || 'Unknown'}</span>
                      {comment.projectName && (
                        <span className="text-[11px] px-1.5 py-0.5" style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-elevated)', borderRadius: '3px' }}>
                          {comment.projectName}
                        </span>
                      )}
                      {comment.filePath && (
                        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{comment.filePath}{comment.lineStart ? `:${comment.lineStart}` : ''}</span>
                      )}
                    </div>
                    <p className="text-[13px] line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{comment.content}</p>
                    <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                      <Clock size={10} /> {formatTime(comment.createdAt)}
                      {comment.replies?.length > 0 && <span> · {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}</span>}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
