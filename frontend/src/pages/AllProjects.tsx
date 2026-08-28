import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, Trash2, Download, Search, Pencil, FolderOpen, X, Archive, ArchiveRestore, Link2, Check,
  Star, LayoutGrid, List, ChevronDown, ArrowUpDown, Users, FileText, Eye, Copy,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchProjects, deleteProject, archiveProject, fetchTrashCount, toggleFavorite,
} from '../store/projectSlice';
import CreateProjectModal from '../components/CreateProjectModal';
import AuthModal from '../components/AuthModal';
import CommandPalette from '../components/DashboardCommandPalette';
import ProjectPreview from '../components/ProjectPreview';
import { TableSkeleton, GridSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';
import { useDialog } from '../components/DialogProvider';
import { useDashboardContext } from './DashboardLayout';
import type { Project } from '../types';
import { getProjectIdsByTag, isUncategorized, addTagToProject } from '../utils/tagProjects';

const API = '/api';

type FilterType = 'all' | 'recent' | 'starred' | 'shared' | 'archived' | 'my';
type SortType = 'updated' | 'created' | 'name-asc' | 'name-desc';
type ViewType = 'list' | 'grid';

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
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to rename'); }
      toast.success('Project renamed');
      onRenamed(trimmed);
      onClose();
    } catch (err: any) { setError(err.message || 'Failed to rename project'); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', boxShadow: '0 32px 100px rgba(0,0,0,0.4)' }}>
        <div className="h-1" style={{ background: 'var(--color-accent)' }} />
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Rename Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
        </div>
        <div className="px-6 pb-6">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Project name</label>
          <input ref={inputRef} value={name} onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
            style={{ background: 'var(--color-background)', borderColor: error ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
          {error && <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-xl" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || !name.trim()} className="px-4 py-2 text-sm font-medium text-white rounded-xl disabled:opacity-50" style={{ background: 'var(--color-accent)' }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────── Sort Dropdown ────── */
function SortDropdown({ value, onChange, onClose }: { value: SortType; onChange: (v: SortType) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  const opts: { key: SortType; label: string }[] = [
    { key: 'updated', label: 'Last Modified' },
    { key: 'created', label: 'Recently Created' },
    { key: 'name-asc', label: 'Name A–Z' },
    { key: 'name-desc', label: 'Name Z–A' },
  ];
  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 z-50 min-w-[180px] border py-1 shadow-xl" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', borderRadius: '8px' }}>
      {opts.map(o => (
        <button key={o.key} onClick={() => { onChange(o.key); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
          style={{ color: value === o.key ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {value === o.key && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ────── Grid Card ────── */
function ProjectCard({ project, nameOverrides, onOpen, onStar, onPreview, onMenu, copiedId }: {
  project: Project; nameOverrides: Record<string, string>; onOpen: () => void; onStar: (e: React.MouseEvent) => void;
  onPreview: (e: React.MouseEvent) => void; onMenu: (e: React.MouseEvent) => void; copiedId: string | null;
}) {
  return (
    <div className="group rounded-xl overflow-hidden transition-all cursor-pointer" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      onClick={onOpen}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div className="h-28 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, var(--color-surface-elevated), var(--color-surface))' }}>
        <FolderOpen size={32} style={{ color: 'var(--color-accent)', opacity: 0.4 }} />
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); onStar(e); }} className="p-1.5 rounded-lg transition-colors" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <Star size={14} fill={project.isFavorite ? '#fbbf24' : 'none'} style={{ color: project.isFavorite ? '#fbbf24' : '#fff' }} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-[14px] font-semibold mb-1 truncate" style={{ color: 'var(--color-text-primary)' }}>{nameOverrides[project.id] || project.name}</h3>
        <p className="text-[12px] mb-2 truncate" style={{ color: 'var(--color-text-muted)' }}>{project.description || 'LaTeX Project'}</p>
        <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          <span>{project.owner?.name || 'You'}</span>
          <span>{formatTimeAgo(project.updatedAt)}</span>
        </div>
        <div className="flex items-center justify-end gap-1 mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={e => { e.stopPropagation(); onPreview(e); }} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title="Preview"><Eye size={13} /></button>
          <button onClick={e => { e.stopPropagation(); onMenu(e); }} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title="Actions"><span className="text-xs">⋯</span></button>
        </div>
      </div>
    </div>
  );
}

/* ────── Helpers ────── */
function formatTimeAgo(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/* ────── Main Component ────── */
export default function AllProjects() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, loading } = useAppSelector(state => state.project);
  const { confirm } = useDialog();
  const { searchOpen, setSearchOpen } = useDashboardContext();

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('updated');
  const [view, setView] = useState<ViewType>(() => (localStorage.getItem('tf-view') as ViewType) || 'list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [nameOverrides, setNameOverrides] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const menuBtnRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('token');
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } }, []);

  // Route-based filter
  const currentView = location.pathname.includes('/archived') ? 'archived'
    : location.pathname.includes('/shared') ? 'shared'
    : location.pathname.includes('/starred') ? 'starred'
    : location.pathname.includes('/my') ? 'my'
    : location.pathname.includes('/recent') ? 'recent'
    : location.pathname.includes('/trash') ? 'trash' : 'all';
  useEffect(() => {
    if (currentView === 'archived') setFilter('archived');
    else if (currentView === 'shared') setFilter('shared');
    else if (currentView === 'starred') setFilter('starred');
    else if (currentView === 'my') setFilter('my');
    else if (currentView === 'recent') setFilter('recent');
  }, [currentView]);

  // Tag filter from URL
  const activeTag = useMemo(() => {
    const match = location.pathname.match(/^\/dashboard\/tag\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  }, [location.pathname]);
  const isTagView = activeTag !== null;
  const isUncategorizedView = activeTag === 'uncategorized';

  useEffect(() => { dispatch(fetchProjects(filter === 'archived' ? { archived: true } : undefined)); }, [dispatch, filter]);
  useEffect(() => { localStorage.setItem('tf-view', view); }, [view]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(p => !p); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); handleNewProject(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => { if (menuBtnRef.current && !menuBtnRef.current.contains(e.target as Node)) setMenuOpen(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);



  // Filter + sort
  const filteredProjects = useMemo(() => {
    let result = projects.filter(p => {
      if (p.deletedAt) return false;
      if (filter === 'archived') return p.isArchived;
      if (p.isArchived) return false;
      if (filter === 'starred') return p.isFavorite;
      if (filter === 'shared') return p.ownerId !== user.id;
      if (filter === 'my') return p.ownerId === user.id;
      return true;
    });

    // Tag filtering
    if (isTagView) {
      if (isUncategorizedView) {
        result = result.filter(p => isUncategorized(p.id));
      } else {
        const tagProjectIds = getProjectIdsByTag(activeTag!);
        const tagIdSet = new Set(tagProjectIds);
        result = result.filter(p => tagIdSet.has(p.id));
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)) || (p.owner?.name && p.owner.name.toLowerCase().includes(q)));
    }
    result.sort((a, b) => {
      switch (sort) {
        case 'updated': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });
    return result;
  }, [projects, filter, searchQuery, sort, user.id, isTagView, isUncategorizedView, activeTag]);

  // Handlers
  const handleNewProject = () => { if (!token) { setShowAuthModal(true); return; } setShowCreateModal(true); };
  const handleOpenProject = (id: string) => { if (!token) { setShowAuthModal(true); return; } navigate(`/project/${id}`); };

  const handleStar = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!token) { setShowAuthModal(true); return; }
    try { await dispatch(toggleFavorite(projectId)).unwrap(); } catch { toast.error('Failed to update'); }
  };

  const toggleStar = async (projectId: string) => {
    if (!token) { setShowAuthModal(true); return; }
    try { await dispatch(toggleFavorite(projectId)).unwrap(); } catch { toast.error('Failed to update'); }
  };

  const deleteProjectById = async (projectId: string) => {
    if (!token) { setShowAuthModal(true); return; }
    const p = projects.find(pr => pr.id === projectId);
    if (await confirm({ title: 'Move to Trash?', message: `Delete "${p?.name || 'this project'}"? It can be restored from Trash.`, confirmText: 'Delete', danger: true })) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        dispatch(fetchTrashCount());
        toast((t) => (
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--color-text-primary)' }}>Moved to Trash.</span>
            <button onClick={async () => {
              try { const tk = localStorage.getItem('token'); await fetch(`/api/projects/${projectId}/restore`, { method: 'POST', headers: tk ? { Authorization: `Bearer ${tk}` } : {} }); dispatch(fetchProjects()); dispatch(fetchTrashCount()); toast.dismiss(t.id); toast.success('Restored'); } catch { toast.error('Failed'); }
            }} className="text-xs font-semibold px-2 py-1 rounded" style={{ color: 'var(--color-accent)' }}>Undo</button>
          </div>
        ), { duration: 8000 });
      } catch { toast.error('Failed to delete'); }
    }
  };

  const handleArchive = async (projectId: string) => {
    if (!token) { setShowAuthModal(true); return; }
    try {
      await dispatch(archiveProject(projectId)).unwrap();
      const p = projects.find(pr => pr.id === projectId);
      toast.success(p?.isArchived ? 'Project unarchived' : 'Project archived');
      dispatch(fetchProjects(filter === 'archived' ? { archived: true } : undefined));
    } catch { toast.error('Failed to archive'); }
    setMenuOpen(null);
  };

  const handleDuplicate = async (project: Project) => {
    if (!token) { setShowAuthModal(true); return; }
    try {
      const res = await fetch(`${API}/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: `${project.name} Copy` }) });
      if (!res.ok) throw new Error('Failed');
      dispatch(fetchProjects()); toast.success('Duplicated');
    } catch { toast.error('Failed to duplicate'); }
    setMenuOpen(null);
  };

  const handleDownload = async (projectId: string) => {
    if (!token) { setShowAuthModal(true); return; }
    try {
      const res = await fetch(`${API}/projects/${projectId}/download`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'project.zip'; a.click(); URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch { toast.error('Failed to download'); }
    setMenuOpen(null);
  };

  const handleShare = async (projectId: string) => {
    if (!token) { setShowAuthModal(true); return; }
    try { await navigator.clipboard.writeText(`${window.location.origin}/project/${projectId}`); setCopiedId(projectId); setTimeout(() => setCopiedId(null), 1500); } catch { toast.error('Failed to copy'); }
  };

  const handleSelectAll = () => { setSelectedIds(prev => prev.size === filteredProjects.length ? new Set() : new Set(filteredProjects.map(p => p.id))); };
  const handleSelectOne = (e: React.MouseEvent, id: string) => { e.stopPropagation(); setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };

  const handleBulkArchive = async () => {
    for (const id of selectedIds) { try { await dispatch(archiveProject(id)).unwrap(); } catch {} }
    toast.success(`${selectedIds.size} project(s) archived`);
    setSelectedIds(new Set()); dispatch(fetchProjects());
  };

  const handleBulkDelete = async () => {
    if (await confirm({ title: `Delete ${selectedIds.size} project(s)?`, message: 'They will be moved to Trash.', confirmText: 'Delete', danger: true })) {
      for (const id of selectedIds) { try { await dispatch(deleteProject(id)).unwrap(); } catch {} }
      toast.success(`${selectedIds.size} project(s) moved to Trash`);
      setSelectedIds(new Set()); dispatch(fetchTrashCount());
    }
  };

  const handleMenuClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (menuOpen === projectId) { setMenuOpen(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.min(rect.left, window.innerWidth - 200);
    setMenuPos({ x, y: rect.bottom + 4 });
    setMenuOpen(projectId);
  };

  const getViewTitle = () => {
    if (isTagView) {
      return isUncategorizedView ? 'Uncategorized' : activeTag!;
    }
    switch (currentView) {
      case 'archived': return 'Archived projects';
      case 'shared': return 'Shared with you';
      case 'starred': return 'Starred projects';
      case 'my': return 'My projects';
      case 'recent': return 'Recent projects';
      default: return 'All projects';
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{getViewTitle()}</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Manage, organize, and access all your TexFlow projects.</p>
          </div>
          {!currentView.includes('archived') && (
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/templates')}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-colors"
                style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: '6px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}>
                Templates
              </button>
              <button onClick={handleNewProject}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white transition-all"
                style={{ background: 'var(--color-accent)', borderRadius: '6px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-accent)'}>
                <Plus size={15} strokeWidth={2.5} /> New project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search + Controls */}
      <div className="px-6 py-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input type="text" placeholder={isTagView ? `Search ${isUncategorizedView ? 'uncategorized' : activeTag}...` : 'Search in all projects...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-[13px] outline-none"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '6px' }} />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto">
          {(['all', 'recent', 'starred', 'shared', 'archived'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors capitalize"
              style={{
                borderRadius: '6px',
                background: filter === f ? 'var(--color-accent)' : 'var(--color-surface)',
                color: filter === f ? '#fff' : 'var(--color-text-secondary)',
                border: `1px solid ${filter === f ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}>{f}</button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative">
          <button onClick={() => setShowSortMenu(p => !p)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-colors" style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: '6px' }}>
            <ArrowUpDown size={13} /> Sort <ChevronDown size={12} />
          </button>
          {showSortMenu && <SortDropdown value={sort} onChange={setSort} onClose={() => setShowSortMenu(false)} />}
        </div>

        {/* View toggle */}
        <div className="flex overflow-hidden" style={{ border: '1px solid var(--color-border)', borderRadius: '6px' }}>
          <button onClick={() => setView('list')} className="p-1.5 transition-colors" style={{ background: view === 'list' ? 'var(--color-accent)' : 'var(--color-surface)', color: view === 'list' ? '#fff' : 'var(--color-text-muted)' }}><List size={15} /></button>
          <button onClick={() => setView('grid')} className="p-1.5 transition-colors" style={{ background: view === 'grid' ? 'var(--color-accent)' : 'var(--color-surface)', color: view === 'grid' ? '#fff' : 'var(--color-text-muted)' }}><LayoutGrid size={15} /></button>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="px-6 py-2 flex items-center gap-3" style={{ background: 'var(--color-accent-soft)', borderBottom: '1px solid var(--color-border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>{selectedIds.size} selected</span>
          <div className="flex-1" />
          <button onClick={handleBulkArchive} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg" style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}><Archive size={13} /> Archive</button>
          <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg" style={{ color: 'var(--color-error)' }}><Trash2 size={13} /> Delete</button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Clear</button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pb-4">
        {loading ? (
          view === 'grid' ? <GridSkeleton /> : <TableSkeleton />
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
              {filter === 'starred' ? <Star size={28} style={{ color: 'var(--color-text-muted)' }} /> :
               filter === 'shared' ? <Users size={28} style={{ color: 'var(--color-text-muted)' }} /> :
               filter === 'archived' ? <Archive size={28} style={{ color: 'var(--color-text-muted)' }} /> :
               <FileText size={28} style={{ color: 'var(--color-text-muted)' }} />}
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {searchQuery ? 'No projects found' :
               filter === 'starred' ? 'No starred projects' :
               filter === 'shared' ? 'No shared projects' :
               filter === 'archived' ? 'No archived projects' :
               'No projects yet'}
            </h3>
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {searchQuery ? 'Try a different search term' :
               filter === 'starred' ? 'Star projects to find them quickly.' :
               filter === 'shared' ? 'Projects shared with you will appear here.' :
               filter === 'archived' ? 'Archived projects will appear here.' :
               'Create your first LaTeX project to get started.'}
            </p>
            {!searchQuery && filter === 'all' && (
              <button onClick={handleNewProject} className="px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ background: 'var(--color-accent)' }}>
                <Plus size={16} className="inline mr-1" /> Create Project
              </button>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} nameOverrides={nameOverrides} copiedId={copiedId}
                onOpen={() => handleOpenProject(project.id)}
                onStar={(e) => handleStar(e, project.id)}
                onPreview={(e) => { e.stopPropagation(); setPreviewProject(project); }}
                onMenu={(e) => handleMenuClick(e, project.id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--color-surface)' }}>
                  <th className="w-10 px-4 py-3"><input type="checkbox" checked={selectedIds.size === filteredProjects.length && filteredProjects.length > 0} onChange={handleSelectAll} onClick={e => e.stopPropagation()} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: 'var(--color-accent)' }} /></th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>Title</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold w-28" style={{ color: 'var(--color-text-muted)' }}>Owner</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold w-40" style={{ color: 'var(--color-text-muted)' }}>Last modified</th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold w-36" style={{ color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(project => (
                  <tr key={project.id} onClick={() => handleOpenProject(project.id)} className="cursor-pointer transition-colors" style={{ borderTop: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(project.id)} onClick={e => handleSelectOne(e, project.id)} onChange={() => {}} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: 'var(--color-accent)' }} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <button onClick={(e: React.MouseEvent) => handleStar(e, project.id)} className="flex-shrink-0 p-0.5">
                          <Star size={14} fill={project.isFavorite ? '#fbbf24' : 'none'} style={{ color: project.isFavorite ? '#fbbf24' : 'var(--color-text-muted)' }} />
                        </button>
                        <FolderOpen size={16} style={{ color: 'var(--color-text-muted)' }} className="flex-shrink-0" />
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{nameOverrides[project.id] || project.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{project.owner?.name || 'You'}</span></td>
                    <td className="px-4 py-3"><span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{formatTimeAgo(project.updatedAt)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={e => { e.stopPropagation(); setPreviewProject(project); }} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title="Preview"><Eye size={14} /></button>
                        <button onClick={e => { e.stopPropagation(); handleDownload(project.id); }} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title="Download"><Download size={14} /></button>
                        <button onClick={e => { e.stopPropagation(); handleShare(project.id); }} className="p-1.5 rounded-md transition-colors" style={{ color: copiedId === project.id ? '#22c55e' : 'var(--color-text-muted)' }}
                          onMouseEnter={e => { if (copiedId !== project.id) e.currentTarget.style.background = 'var(--color-surface-elevated)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }} title="Copy link">
                          {copiedId === project.id ? <Check size={14} /> : <Link2 size={14} />}
                        </button>
                        <div ref={menuOpen === project.id ? menuBtnRef : undefined}>
                          <button onClick={e => handleMenuClick(e, project.id)} className="p-1.5 rounded-md transition-colors" style={{ color: menuOpen === project.id ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                            onMouseEnter={e => { if (menuOpen !== project.id) e.currentTarget.style.background = 'var(--color-surface-elevated)'; }} onMouseLeave={e => { if (menuOpen !== project.id) e.currentTarget.style.background = 'transparent'; }} title="More actions">
                            <span className="text-sm">⋯</span>
                          </button>
                        </div>
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
          Showing {filteredProjects.length} out of {projects.length} projects.
        </div>
      )}

      {/* Context Menu */}
      {menuOpen && (() => {
        const p = projects.find(pr => pr.id === menuOpen);
        if (!p) return null;
        return (
          <div ref={menuBtnRef} role="menu" className="fixed z-[200] min-w-[180px] rounded-xl border py-1 shadow-2xl"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', top: menuPos.y, left: menuPos.x }}>
            {[
              { icon: <FolderOpen size={14} />, label: 'Open', action: () => handleOpenProject(p.id) },
              { icon: <Eye size={14} />, label: 'Preview', action: () => { setPreviewProject(p); setMenuOpen(null); } },
              { icon: <Pencil size={14} />, label: 'Rename', action: () => { setRenameTarget({ id: p.id, name: nameOverrides[p.id] || p.name }); setMenuOpen(null); } },
              { icon: <Copy size={14} />, label: 'Duplicate', action: () => handleDuplicate(p) },
              { icon: <Download size={14} />, label: 'Download', action: () => handleDownload(p.id) },
              { icon: <Link2 size={14} />, label: 'Share', action: () => { handleShare(p.id); setMenuOpen(null); } },
              { icon: <Star size={14} />, label: p.isFavorite ? 'Unstar' : 'Star', action: () => { toggleStar(p.id); setMenuOpen(null); } },
              { divider: true },
              { icon: p.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />, label: p.isArchived ? 'Unarchive' : 'Archive', action: () => handleArchive(p.id) },
              { icon: <Trash2 size={14} />, label: 'Move to Trash', action: () => { setMenuOpen(null); deleteProjectById(p.id); }, danger: true },
            ].map((item, i) => {
              if ('divider' in item && item.divider) return <div key={i} className="my-1 mx-2" style={{ borderTop: '1px solid var(--color-border)' }} />;
              return (
                <button key={i} role="menuitem" onClick={() => { (item as any).action(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                  style={{ color: (item as any).danger ? 'var(--color-error)' : 'var(--color-text-secondary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="w-4 h-4 flex items-center justify-center">{(item as any).icon}</span>{(item as any).label}
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Modals */}
      {renameTarget && <RenameModal projectId={renameTarget.id} currentName={renameTarget.name} onClose={() => setRenameTarget(null)} onRenamed={(n) => { setNameOverrides(prev => ({ ...prev, [renameTarget.id]: n })); setRenameTarget(null); dispatch(fetchProjects()); }} />}
      {previewProject && <ProjectPreview project={previewProject} onClose={() => setPreviewProject(null)} onOpen={() => { handleOpenProject(previewProject.id); setPreviewProject(null); }} />}
      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} tagToAssign={isTagView && !isUncategorizedView ? activeTag! : undefined} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} onNewProject={handleNewProject} />
    </div>
  );
}
