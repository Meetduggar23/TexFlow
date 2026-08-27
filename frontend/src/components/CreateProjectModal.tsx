import { useState, useRef, useEffect } from 'react';
import { X, FileText, FolderOpen } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { createProject } from '../store/projectSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';

interface CreateProjectModalProps {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('token');

  useEffect(() => { inputRef.current?.focus(); }, []);

  if (!token) {
    return <AuthModal onClose={onClose} onSuccess={() => setShowAuthModal(false)} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Project name is required.'); return; }
    setLoading(true);
    try {
      const project = await dispatch(createProject({ name: trimmed, description: description.trim() || undefined })).unwrap();
      toast.success('Project created');
      navigate(`/project/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', boxShadow: '0 32px 100px rgba(0,0,0,0.4)' }}>
        {/* Gradient accent */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--color-accent), #3B82F6, #8B5CF6)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
              <FileText size={20} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Create New Project</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Set up a new LaTeX project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          ><X size={18} /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Project name <span style={{ color: 'var(--color-accent)' }}>*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="My LaTeX Document"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--color-background)',
                borderColor: error ? 'var(--color-error)' : 'var(--color-border-strong)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={e => { if (!error) e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
              onBlur={e => { if (!error) e.currentTarget.style.borderColor = 'var(--color-border-strong)'; }}
            />
            {error && <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A brief description (optional)"
              rows={3}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none resize-none transition-all focus:ring-2"
              style={{
                background: 'var(--color-background)',
                borderColor: 'var(--color-border-strong)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border-strong)'}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl transition-colors"
              style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >Cancel</button>
            <button type="submit" disabled={!name.trim() || loading}
              className="px-5 py-2 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))', boxShadow: '0 4px 14px var(--color-accent-soft)' }}
            >{loading ? 'Creating...' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
