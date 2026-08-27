import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2, RotateCcw, ArrowLeft, X, Search, Download, MoreHorizontal,
  ChevronDown, FolderOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDialog } from '../components/DialogProvider';
import { useAppDispatch } from '../store/hooks';
import { fetchProjects, fetchTrashCount } from '../store/projectSlice';

const API = '/api';

type SortKey = 'recent' | 'oldest' | 'name-asc' | 'name-desc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recently deleted' },
  { key: 'oldest', label: 'Oldest deleted' },
  { key: 'name-asc', label: 'Name A–Z' },
  { key: 'name-desc', label: 'Name Z–A' },
];

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ────── Three-dot Action Menu ────── */
function TrashActionMenu({ x, y, project, onClose, onRestore, onDownload, onDelete }: {
  x: number; y: number; project: any; onClose: () => void;
  onRestore: () => void; onDownload: () => void; onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleEscape); };
  }, [onClose]);

  const items = [
    { icon: <RotateCcw size={14} />, label: 'Restore', action: onRestore },
    { icon: <Download size={14} />, label: 'Download Source', action: onDownload },
    { divider: true },
    { icon: <Trash2 size={14} />, label: 'Permanently Delete', action: onDelete, danger: true },
  ];

  return (
    <div ref={ref} role="menu" className="fixed z-[200] min-w-[200px] rounded-xl border py-1 shadow-2xl"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', top: y, left: x }}
    >
      {items.map((item, i) => {
        if ('divider' in item && item.divider) return <div key={i} className="my-1 mx-2" style={{ borderTop: '1px solid var(--color-border)' }} />;
        return (
          <button key={i} role="menuitem" onClick={() => { (item as any).action(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
            style={{ color: (item as any).danger ? 'var(--color-error)' : 'var(--color-text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = (item as any).danger ? 'rgba(239,68,68,0.08)' : 'var(--color-surface-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="w-4 h-4 flex items-center justify-center">{(item as any).icon}</span>
            {(item as any).label}
          </button>
        );
      })}
    </div>
  );
}

/* ────── Sort Dropdown ────── */
function SortDropdown({ value, onChange, onClose }: { value: SortKey; onChange: (v: SortKey) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleEscape); };
  }, [onClose]);

  return (
    <div ref={ref} role="menu" className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border py-1 shadow-xl"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}
    >
      {SORT_OPTIONS.map(opt => (
        <button key={opt.key} role="menuitem" onClick={() => { onChange(opt.key); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
          style={{ color: value === opt.key ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {value === opt.key && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ────── Main Component ────── */
export default function TrashPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { confirm } = useDialog();

  // Action menu state
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const fetchTrash = useCallback(() => {
    setLoading(true);
    fetch('/api/projects?trashed=true', { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error('Failed to load trash'); return r.json(); })
      .then(data => { setProjects(data.projects || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTrash(); }, [fetchTrash]);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`${API}/projects/${id}/restore-from-trash`, {
        method: 'POST', headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restore');
      setProjects(p => p.filter(proj => proj.id !== id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      dispatch(fetchProjects());
      dispatch(fetchTrashCount());
      if (data.renamed) {
        toast.success(`Project restored as "${data.project.name}" (name conflict)`);
      } else {
        toast.success('Project restored');
      }
    } catch { toast.error('Failed to restore project'); }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!(await confirm({ title: 'Permanently Delete Project?', message: `"${name}" will be permanently deleted. This action cannot be undone.`, confirmText: 'Permanently Delete', danger: true }))) return;
    try {
      const res = await fetch(`${API}/projects/${id}?permanent=true`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setProjects(p => p.filter(proj => proj.id !== id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      dispatch(fetchTrashCount());
      toast.success('Project permanently deleted');
    } catch { toast.error('Failed to delete project'); }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await fetch(`${API}/projects/${id}/download`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'project.zip'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch { toast.error('Failed to download project'); }
  };

  const handleEmptyTrash = async () => {
    if (!(await confirm({ title: 'Empty Trash?', message: 'All projects in Trash will be permanently deleted. This action cannot be undone.', confirmText: 'Empty Trash', danger: true }))) return;
    try {
      const res = await fetch(`${API}/projects/trash/empty`, {
        method: 'POST', headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to empty trash');
      setProjects([]);
      setSelectedIds(new Set());
      dispatch(fetchTrashCount());
      toast.success('Trash emptied');
    } catch { toast.error('Failed to empty trash'); }
  };

  const handleBulkRestore = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      const res = await fetch(`${API}/projects/bulk/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restore');
      setProjects(p => p.filter(proj => !selectedIds.has(proj.id)));
      setSelectedIds(new Set());
      dispatch(fetchProjects());
      dispatch(fetchTrashCount());
      const restored = data.restored || [];
      const renamedCount = restored.filter((r: any) => r.renamed).length;
      if (renamedCount > 0) {
        toast.success(`${restored.length} projects restored (${renamedCount} renamed due to conflicts)`);
      } else {
        toast.success(`${restored.length} projects restored`);
      }
    } catch { toast.error('Failed to restore projects'); }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!(await confirm({ title: `Permanently delete ${ids.length} project${ids.length !== 1 ? 's' : ''}?`, message: 'This action cannot be undone.', confirmText: 'Delete Permanently', danger: true }))) return;
    try {
      const res = await fetch(`${API}/projects/bulk/permanent-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setProjects(p => p.filter(proj => !selectedIds.has(proj.id)));
      setSelectedIds(new Set());
      dispatch(fetchTrashCount());
      toast.success(`${ids.length} project${ids.length !== 1 ? 's' : ''} permanently deleted`);
    } catch { toast.error('Failed to delete projects'); }
  };

  const handleMenuClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (menuOpen === projectId) { setMenuOpen(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 200;
    const spaceRight = window.innerWidth - rect.right;
    const x = spaceRight < menuWidth + 16 ? rect.right - menuWidth : rect.left;
    setMenuPos({ x: Math.max(8, x), y: rect.bottom + 4 });
    setMenuOpen(projectId);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleSelectOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  // Filter and sort
  const filteredProjects = projects
    .filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'recent': return new Date(b.deletedAt || b.updatedAt).getTime() - new Date(a.deletedAt || a.updatedAt).getTime();
        case 'oldest': return new Date(a.deletedAt || a.updatedAt).getTime() - new Date(b.deletedAt || b.updatedAt).getTime();
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  const hasSelection = selectedIds.size > 0;

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Trash</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Deleted projects can be restored or permanently deleted.</p>
          </div>
          {projects.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={14} />
              Empty Trash
            </button>
          )}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search deleted projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none focus:ring-2"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(p => !p)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-strong)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              Sort <ChevronDown size={14} />
            </button>
            {showSortMenu && <SortDropdown value={sortKey} onChange={setSortKey} onClose={() => setShowSortMenu(false)} />}
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {hasSelection && (
        <div className="px-6 py-2 flex items-center gap-3" style={{ background: 'var(--color-accent-soft)', borderBottom: '1px solid var(--color-border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>{selectedIds.size} selected</span>
          <div className="flex-1" />
          <button onClick={handleBulkRestore} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <RotateCcw size={13} /> Restore
          </button>
          <button onClick={() => { const ids = Array.from(selectedIds); Promise.all(ids.map(id => handleDownload(id))); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <Download size={13} /> Download
          </button>
          <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ color: 'var(--color-error)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={13} /> Permanently Delete
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : projects.length === 0 ? (
          /* Empty trash state */
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
              <Trash2 size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Trash is empty</h3>
            <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>Deleted projects will appear here</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}
            >
              View Projects
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Search empty state */
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
              <Search size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No deleted projects found</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Try a different search.</p>
          </div>
        ) : (
          /* Table */
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--color-surface)' }}>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredProjects.length && filteredProjects.length > 0}
                      onChange={handleSelectAll}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>Project</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold w-32" style={{ color: 'var(--color-text-muted)' }}>Owner</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold w-44" style={{ color: 'var(--color-text-muted)' }}>Deleted</th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold w-20" style={{ color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(project => (
                  <tr key={project.id}
                    style={{ borderTop: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(project.id)}
                        onClick={e => handleSelectOne(e, project.id)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <FolderOpen size={16} style={{ color: 'var(--color-text-muted)' }} className="flex-shrink-0" />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{project.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {project.owner?.name || 'You'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatTimeAgo(project.deletedAt || project.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={(e) => handleMenuClick(e, project.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{
                            color: menuOpen === project.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            background: menuOpen === project.id ? 'var(--color-accent-soft)' : 'transparent',
                          }}
                          onMouseEnter={e => { if (menuOpen !== project.id) e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
                          onMouseLeave={e => { if (menuOpen !== project.id) e.currentTarget.style.background = 'transparent'; }}
                          aria-label="Project actions"
                          aria-haspopup="menu"
                          aria-expanded={menuOpen === project.id}
                        >
                          <MoreHorizontal size={16} />
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

      {/* Footer */}
      {filteredProjects.length > 0 && (
        <div className="px-6 py-3 text-[13px]" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          {filteredProjects.length} deleted project{filteredProjects.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* Action Menu */}
      {menuOpen && (
        <TrashActionMenu
          x={menuPos.x}
          y={menuPos.y}
          project={projects.find(p => p.id === menuOpen)}
          onClose={() => setMenuOpen(null)}
          onRestore={() => handleRestore(menuOpen)}
          onDownload={() => handleDownload(menuOpen)}
          onDelete={() => { const p = projects.find(pr => pr.id === menuOpen); if (p) handlePermanentDelete(p.id, p.name); }}
        />
      )}
    </div>
  );
}
