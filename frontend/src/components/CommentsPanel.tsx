import { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, Plus, X } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import toast from 'react-hot-toast';
import type { Comment } from '../types';

interface CommentsPanelProps {
  projectId: string;
  onClose: () => void;
}

export default function CommentsPanel({ projectId, onClose }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { content } = useAppSelector(state => state.editor);

  useEffect(() => {
    fetch(`/api/comments/project/${projectId}`).then(r => r.json()).then(data => setComments(data.comments || [])).catch(() => {});
  }, [projectId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, content: newComment }) });
      const data = await res.json();
      setComments(prev => [data.comment, ...prev]);
      setNewComment('');
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: replyContent }) });
      const data = await res.json();
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: [...c.replies, data.reply] } : c));
      setReplyContent(''); setReplyTo(null);
      toast.success('Reply added');
    } catch { toast.error('Failed to reply'); }
  };

  const handleResolve = async (commentId: string) => {
    try {
      await fetch(`/api/comments/${commentId}/resolve`, { method: 'PATCH' });
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
      toast.success('Comment resolved');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-surface)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-texflow-800">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-texflow-400" />
          <span className="text-sm font-medium text-texflow-900">Comments</span>
          <span className="text-xs text-texflow-500">({comments.length})</span>
        </div>
        <button onClick={onClose} className="p-1 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded"><X size={16} /></button>
      </div>

      <div className="p-3 border-b border-texflow-800">
        <div className="flex gap-2">
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="input-field flex-1 resize-none text-sm" rows={2} />
          <button onClick={handleAddComment} disabled={!newComment.trim()} className="self-end p-2 rounded-lg transition-colors disabled:opacity-30" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}>
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8"><MessageSquare className="mx-auto h-8 w-8 text-texflow-600 mb-2" /><p className="text-sm text-texflow-500">No comments yet</p></div>
        ) : comments.map(comment => (
          <div key={comment.id} className={`rounded-lg p-3 border ${comment.resolved ? 'border-green-800/30 bg-green-900/10' : 'border-texflow-800'}`} style={{ background: comment.resolved ? undefined : 'rgba(44,57,75,0.65)' }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}>{comment.user?.name?.[0] || 'U'}</div>
              <span className="text-xs font-medium text-texflow-900">{comment.user?.name || 'User'}</span>
              <span className="text-xs text-texflow-500">{new Date(comment.createdAt).toLocaleString()}</span>
              {comment.resolved && <CheckCircle size={12} className="text-green-400 ml-auto" />}
            </div>
            <p className="text-sm text-texflow-700 mt-1">{comment.content}</p>
            {comment.replies?.map(reply => (
              <div key={reply.id} className="ml-6 mt-2 pl-3 border-l border-texflow-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}>{reply.user?.name?.[0] || 'U'}</div>
                  <span className="text-xs font-medium text-texflow-900">{reply.user?.name || 'User'}</span>
                </div>
                <p className="text-xs text-texflow-600">{reply.content}</p>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              {!comment.resolved && <button onClick={() => handleResolve(comment.id)} className="text-xs text-green-400 hover:text-green-300">Resolve</button>}
              <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="text-xs text-texflow-400 hover:text-texflow-300">Reply</button>
            </div>
            {replyTo === comment.id && (
              <div className="flex gap-2 mt-2">
                <input value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Write a reply..." className="input-field flex-1 text-xs" onKeyDown={e => e.key === 'Enter' && handleReply(comment.id)} />
                <button onClick={() => handleReply(comment.id)} className="p-1.5 rounded" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}><Send size={12} className="text-white" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
