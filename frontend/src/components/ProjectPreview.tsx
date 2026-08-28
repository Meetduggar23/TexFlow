import { useState, useEffect } from 'react';
import { X, FolderOpen, Download, ExternalLink, Users, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Project } from '../types';

interface ProjectPreviewProps {
  project: Project;
  onClose: () => void;
  onOpen: () => void;
}

export default function ProjectPreview({ project, onClose, onOpen }: ProjectPreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleDownload = async () => {
    if (!token) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/download`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${project.name}.zip`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch { toast.error('Failed to download'); }
    finally { setDownloading(false); }
  };

  const formatTime = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', boxShadow: '0 32px 100px rgba(0,0,0,0.4)' }}>
        <div className="h-1" style={{ background: 'var(--color-accent)' }} />
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Project Preview</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><X size={18} /></button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
              <FolderOpen size={22} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{project.name}</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>LaTeX Project</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3" style={{ background: 'var(--color-background)' }}>
              <div className="flex items-center gap-2 text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}><Users size={12} /> Owner</div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{project.owner?.name || 'You'}</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--color-background)' }}>
              <div className="flex items-center gap-2 text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}><Clock size={12} /> Modified</div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatTime(project.updatedAt)}</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--color-background)' }}>
              <div className="flex items-center gap-2 text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}><FileText size={12} /> Files</div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{project._count?.files || 0} files</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--color-background)' }}>
              <div className="flex items-center gap-2 text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}><Clock size={12} /> Created</div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatTime(project.createdAt)}</p>
            </div>
          </div>

          {project.description && (
            <div className="rounded-lg p-3" style={{ background: 'var(--color-background)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Description</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{project.description}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onOpen} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all" style={{ background: 'var(--color-accent)' }}>
              <ExternalLink size={14} /> Open Project
            </button>
            <button onClick={handleDownload} disabled={downloading} className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
              <Download size={14} /> {downloading ? '...' : 'Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
