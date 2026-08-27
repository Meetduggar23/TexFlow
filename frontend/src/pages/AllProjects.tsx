import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Download, Search, File, Image, MoreHorizontal, Pencil, Copy, FolderOpen, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProjects, deleteProject } from '../store/projectSlice';
import CreateProjectModal from '../components/CreateProjectModal';
import AuthModal from '../components/AuthModal';
import toast from 'react-hot-toast';
import { useDialog } from '../components/DialogProvider';

const API = '/api';

/* ────── Rename Modal ────── */
function RenameModal({ projectId, currentName, onClose, onRenamed }: { projectId: string; currentName: string; onClose: () => void; onRenamed: (newName: string) => void }) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Project name cannot be empty.'); return; }
    if (trimmed === currentName) { onClose(); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to rename');
      }
      toast.success('Project renamed');
      onRenamed(trimmed);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to rename project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', boxShadow: '0 32px 100px rgba(0,0,0,0.4)' }}>
        <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--color-accent), #3B82F6)' }} />
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Rename Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          ><X size={18} /></button>
        </div>
        <div className="px-6 pb-6">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Project name</label>
          <input
            ref={inputRef}
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
            style={{ background: 'var(--color-background)', borderColor: error ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
            onFocus={e => { if (!error) e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onBlur={e => { if (!error) e.currentTarget.style.borderColor = 'var(--color-border-strong)'; }}
          />
          {error && <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-xl transition-colors"
              style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >Cancel</button>
            <button onClick={handleSave} disabled={saving || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}
            >{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────── Three-dot Action Menu ────── */
function ActionMenu({ x, y, project, onClose, onOpen, onRename, onDuplicate, onDownload, onDelete }: {
  x: number; y: number; project: any; onClose: () => void;
  onOpen: () => void; onRename: () => void; onDuplicate: () => void; onDownload: () => void; onDelete: () => void;
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
    { icon: <FolderOpen size={14} />, label: 'Open', action: onOpen },
    { icon: <Pencil size={14} />, label: 'Rename', action: onRename },
    { icon: <Copy size={14} />, label: 'Duplicate', action: onDuplicate },
    { icon: <Download size={14} />, label: 'Download', action: onDownload },
    { divider: true },
    { icon: <Trash2 size={14} />, label: 'Delete', action: onDelete, danger: true },
  ];

  return (
    <div ref={ref} role="menu" className="fixed z-[200] min-w-[180px] rounded-xl border py-1 shadow-2xl"
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

/* ────── Main Component ────── */
export default function AllProjects() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, loading } = useAppSelector(state => state.project);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { confirm } = useDialog();

  // Action menu state
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);

  // Local project name overrides (for optimistic UI after rename)
  const [nameOverrides, setNameOverrides] = useState<Record<string, string>>({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!token) { setShowAuthModal(true); return; }
    const project = projects.find(p => p.id === projectId);
    if (await confirm({ title: 'Delete Project?', message: `Are you sure you want to delete "${project?.name || 'this project'}"? This action cannot be undone.`, confirmText: 'Delete', danger: true })) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        toast.success('Project deleted');
      } catch { toast.error('Failed to delete project'); }
    }
  };

  const handleNewProject = () => {
    if (!token) { setShowAuthModal(true); return; }
    setShowCreateModal(true);
  };

  const handleOpenProject = (projectId: string) => {
    if (!token) { setShowAuthModal(true); return; }
    navigate(`/project/${projectId}`);
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

  const handleDuplicate = async (project: any) => {
    if (!token) { setShowAuthModal(true); return; }
    try {
      const res = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: `${project.name} Copy` }),
      });
      if (!res.ok) throw new Error('Failed to duplicate');
      const data = await res.json();
      dispatch(fetchProjects());
      toast.success('Project duplicated');
    } catch { toast.error('Failed to duplicate project'); }
  };

  const handleDownload = async (projectId: string) => {
    if (!token) { setShowAuthModal(true); return; }
    try {
      const res = await fetch(`${API}/projects/${projectId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.zip';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch { toast.error('Failed to download project'); }
  };

  const handleMenuClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (menuOpen === projectId) { setMenuOpen(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 180;
    const spaceRight = window.innerWidth - rect.right;
    const x = spaceRight < menuWidth + 16 ? rect.right - menuWidth : rect.left;
    setMenuPos({ x: Math.max(8, x), y: rect.bottom + 4 });
    setMenuOpen(projectId);
  };

  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

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

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>All projects</h1>
          <button onClick={handleNewProject} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}
          >
            <Plus size={16} />
            New project
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search in all projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none focus:ring-2"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
              <FileText size={28} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
              {searchQuery ? 'Try a different search term' : 'Create your first LaTeX project to get started'}
            </p>
            {!searchQuery && <button onClick={handleNewProject} className="btn-primary">Create Project</button>}
          </div>
        ) : (
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
                  <th className="text-left px-4 py-3 text-[13px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>Title</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold w-32" style={{ color: 'var(--color-text-muted)' }}>Owner</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold w-48" style={{ color: 'var(--color-text-muted)' }}>Last modified</th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold w-20" style={{ color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="cursor-pointer transition-colors"
                    style={{ borderTop: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(project.id)}
                        onClick={(e) => handleSelectOne(e, project.id)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} style={{ color: 'var(--color-accent)' }} className="flex-shrink-0" />
                        <span className="text-sm font-medium transition-colors truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {nameOverrides[project.id] || project.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {project.owner?.name || 'You'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatTimeAgo(project.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          ref={menuOpen === project.id ? menuBtnRef : undefined}
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

      {filteredProjects.length > 0 && (
        <div className="px-6 py-3 text-[13px]" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          Showing {filteredProjects.length} out of {projects.length} projects.
        </div>
      )}

      {/* Action Menu */}
      {menuOpen && (
        <ActionMenu
          x={menuPos.x}
          y={menuPos.y}
          project={projects.find(p => p.id === menuOpen)}
          onClose={() => setMenuOpen(null)}
          onOpen={() => handleOpenProject(menuOpen)}
          onRename={() => { const p = projects.find(pr => pr.id === menuOpen); if (p) setRenameTarget({ id: p.id, name: nameOverrides[p.id] || p.name }); }}
          onDuplicate={() => { const p = projects.find(pr => pr.id === menuOpen); if (p) handleDuplicate(p); }}
          onDownload={() => handleDownload(menuOpen)}
          onDelete={() => { const p = projects.find(pr => pr.id === menuOpen); if (p) { confirm({ title: 'Delete Project?', message: `Are you sure you want to delete "${p.name}"? This action cannot be undone.`, confirmText: 'Delete', danger: true }).then(ok => { if (ok) { dispatch(deleteProject(p.id)).unwrap().then(() => toast.success('Project deleted')).catch(() => toast.error('Failed to delete')); } }); } setMenuOpen(null); }}
        />
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <RenameModal
          projectId={renameTarget.id}
          currentName={renameTarget.name}
          onClose={() => setRenameTarget(null)}
          onRenamed={(newName) => {
            setNameOverrides(prev => ({ ...prev, [renameTarget.id]: newName }));
            setRenameTarget(null);
            dispatch(fetchProjects());
          }}
        />
      )}

      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => {}} />}
    </div>
  );
}
