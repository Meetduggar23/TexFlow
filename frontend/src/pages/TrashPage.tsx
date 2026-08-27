import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RotateCcw, ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDialog } from '../components/DialogProvider';

export default function TrashPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useDialog();

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/projects?trashed=true', { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setProjects(data.projects || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}/restore`, {
        method: 'POST',
        headers: authHeaders(),
      });
      setProjects(p => p.filter(proj => proj.id !== id));
      toast.success('Project restored');
    } catch { toast.error('Failed to restore'); }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!(await confirm({ title: 'Delete permanently?', message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`, confirmText: 'Delete permanently', danger: true }))) return;
    try {
      await fetch(`/api/projects/${id}?permanent=true`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      setProjects(p => p.filter(proj => proj.id !== id));
      toast.success('Project permanently deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Trash</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Deleted projects can be restored within 30 days</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
              <Trash2 size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Trash is empty</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Deleted projects will appear here</p>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--color-surface)' }}>
                  <th className="text-left px-5 py-3 text-[13px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>Project</th>
                  <th className="text-left px-5 py-3 text-[13px] font-semibold w-40" style={{ color: 'var(--color-text-muted)' }}>Deleted</th>
                  <th className="text-right px-5 py-3 text-[13px] font-semibold w-48" style={{ color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id} style={{ borderTop: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Trash2 size={16} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{project.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(project.deletedAt || project.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(project.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                          style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                        >
                          <RotateCcw size={13} /> Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(project.id, project.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                          style={{ color: 'var(--color-error)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <X size={13} /> Delete permanently
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {projects.length > 0 && (
        <div className="px-6 py-3 text-[13px]" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          {projects.length} deleted project{projects.length !== 1 ? 's' : ''} in trash
        </div>
      )}
    </div>
  );
}
