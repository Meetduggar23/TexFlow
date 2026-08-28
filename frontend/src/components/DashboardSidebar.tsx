import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen, Users, Archive, Plus, BookOpen, Trash2, HelpCircle, User, LogOut, Settings, Mail, FileText, Tag, X, ChevronDown, Check, Bell, MessageSquare, Activity, Bookmark, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import clsx from 'clsx';
import AuthModal from './AuthModal';
import BrandLogo from './BrandLogo';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTrashCount, fetchProjects } from '../store/projectSlice';
import { getTagProjectCount, getUncategorizedCount } from '../utils/tagProjects';

/* ────── Tag Types & Storage ────── */
export interface TagData {
  name: string;
  color: string;
}

const TAGS_KEY = 'texflow-tags';

const TAG_COLORS = [
  { name: 'gray', value: '#64748b' },
  { name: 'red', value: '#ef4444' },
  { name: 'orange', value: '#f97316' },
  { name: 'yellow', value: '#eab308' },
  { name: 'green', value: '#22c55e' },
  { name: 'light-blue', value: '#06b6d4' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'purple', value: '#a855f7' },
  { name: 'pink', value: '#ec4899' },
];

function loadTags(): TagData[] {
  try {
    const raw = localStorage.getItem(TAGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      const migrated: TagData[] = parsed.map((name: string) => ({ name, color: TAG_COLORS[0].value }));
      saveTags(migrated);
      return migrated;
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveTags(tags: TagData[]) {
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

/* ────── Create New Tag Modal ────── */
function NewTagModal({ onClose, onCreated }: { onClose: () => void; onCreated: (tag: TagData) => void }) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const t = setTimeout(() => inputRef.current?.focus(), 60); return () => clearTimeout(t); }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Please enter a tag name.'); return; }
    const existing = loadTags();
    if (existing.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) { setError('A tag with this name already exists.'); return; }
    onCreated({ name: trimmed, color: selectedColor });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[420px] rounded-xl border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>Create new tag</h2>
          <button onClick={onClose} className="p-1 rounded-md" style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}><X size={18} /></button>
        </div>
        <div className="h-px" style={{ background: 'var(--color-border)' }} />
        <div className="px-6 py-5">
          <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>New tag name</label>
          <input ref={inputRef} value={name} onChange={e => { setName(e.target.value); if (error) setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleSubmit(); if (e.key === 'Escape') onClose(); }}
            className="w-full rounded-lg border px-3 py-2.5 text-[13px] outline-none transition-colors"
            style={{ background: 'var(--color-background)', borderColor: error ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
          {error && <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-error)' }}>{error}</p>}
          <div className="mt-5">
            <label className="block text-[13px] font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>Tag color:</label>
            <div className="flex items-center gap-2 flex-wrap">
              {TAG_COLORS.map((color) => (
                <button key={color.name} onClick={() => setSelectedColor(color.value)}
                  className="relative w-8 h-8 flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: color.value, border: selectedColor === color.value ? '2px solid var(--color-text-primary)' : '2px solid transparent', borderRadius: '4px' }}>
                  {selectedColor === color.value && <Check size={16} className="text-white" strokeWidth={3} />}
                </button>
              ))}
              <label className="w-8 h-8 flex items-center justify-center border cursor-pointer"
                style={{ borderColor: 'var(--color-border-strong)', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                <Plus size={14} /><input type="color" value={selectedColor} onChange={e => setSelectedColor(e.target.value)} className="sr-only" />
              </label>
            </div>
          </div>
        </div>
        <div className="h-px" style={{ background: 'var(--color-border)' }} />
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium rounded-lg"
            style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-strong)' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!name.trim()}
            className="px-4 py-2 text-[13px] font-medium text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: name.trim() ? 'var(--color-accent)' : 'var(--color-text-muted)', border: 'none' }}>Create</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════ */
/* ────── Main Sidebar Component ────── */
/* ════════════════════════════════════════════ */

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function DashboardSidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { trashCount, projects } = useAppSelector(state => state.project);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [tags, setTags] = useState<TagData[]>(loadTags);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [logoHovered, setLogoHovered] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Active tag from URL
  const activeTag = useMemo(() => {
    const match = location.pathname.match(/^\/dashboard\/tag\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  }, [location.pathname]);

  const isUncategorizedActive = location.pathname === '/dashboard/tag/uncategorized';

  useEffect(() => {
    if (token) {
      dispatch(fetchTrashCount());
      dispatch(fetchProjects());
    }
  }, [dispatch, token]);

  const projectItems = [
    { icon: FolderOpen, label: 'Your projects', path: '/dashboard' },
    { icon: Users, label: 'Shared with you', path: '/dashboard/shared' },
    { icon: Archive, label: 'Archived projects', path: '/dashboard/archived' },
  ];

  const bottomItems = [
    { icon: BookOpen, label: 'Library', path: '/library', badge: 'New' as const },
    { icon: Trash2, label: 'Trash', path: '/dashboard/trash', count: trashCount },
  ];

  const helpItems = [
    { icon: <BookOpen size={16} />, label: 'Documentation', path: '/documentation' },
    { icon: <Mail size={16} />, label: 'Contact Us', path: '/contact' },
    { icon: <FileText size={16} />, label: 'Blog', path: '/blog' },
  ];

  // Close help menu on outside click
  useEffect(() => {
    if (!showHelpMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target as Node)) setShowHelpMenu(false);
    };
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowHelpMenu(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleEscape); };
  }, [showHelpMenu]);

  // Logo hover: icon morph
  const handleLogoEnter = () => {
    setLogoHovered(true);
  };

  const handleLogoLeave = () => {
    setLogoHovered(false);
  };

  // Logo click: toggle sidebar collapse
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleCollapse();
  };

  const handleCreateTag = useCallback((tag: TagData) => {
    const updated = [...tags, tag];
    setTags(updated);
    saveTags(updated);
  }, [tags]);

  const handleDeleteTag = useCallback((name: string) => {
    const updated = tags.filter(t => t.name !== name);
    setTags(updated);
    saveTags(updated);
  }, [tags]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/dashboard');
  };

  const isProjectsActive = location.pathname === '/dashboard' || location.pathname === '/dashboard/projects' || location.pathname === '/dashboard/shared' || location.pathname === '/dashboard/archived';

  const nav = (path: string) => { navigate(path); onMobileClose(); };

  const sidebarContent = (
    <aside className={clsx('h-full flex flex-col transition-all duration-200', collapsed ? 'w-[56px]' : 'w-[220px]')} style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
      {/* Logo — ChatGPT-style morph on hover */}
      <div ref={logoRef} className={clsx('relative flex-shrink-0', collapsed ? 'px-2 pt-3 pb-2' : 'p-4 pb-2')} onMouseEnter={handleLogoEnter} onMouseLeave={handleLogoLeave}>
        <button
          onClick={handleLogoClick}
          className={clsx('group relative w-full flex items-center rounded-lg transition-all duration-200', collapsed ? 'justify-center px-0 py-1.5' : 'gap-2 px-2 py-1.5')}
          style={{ background: 'transparent', border: 'none' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

          {/* ── Expanded state: Logo + text, morph to icon on hover ── */}
          {!collapsed && (
            <div className="relative flex items-center flex-1 min-w-0">
              {/* Default: logo + text */}
              <div className={clsx('flex items-center gap-2 transition-all duration-300', logoHovered ? 'opacity-0 blur-[4px] scale-90' : 'opacity-100 blur-0 scale-100')} style={{ pointerEvents: logoHovered ? 'none' : 'auto' }}>
                <BrandLogo className="w-6 h-6 object-contain flex-shrink-0" />
                <span className="text-base font-bold whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>Tex<span style={{ color: 'var(--color-accent)' }}>Flow</span></span>
              </div>
              {/* Hovered: icon only */}
              <div className={clsx('absolute inset-0 flex items-center justify-center transition-all duration-300', logoHovered ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-[4px] scale-90')} style={{ pointerEvents: logoHovered ? 'auto' : 'none' }}>
                <PanelLeftClose size={18} style={{ color: 'var(--color-text-primary)' }} />
              </div>
            </div>
          )}

          {/* ── Collapsed state: Logo icon, morph to expand icon on hover ── */}
          {collapsed && (
            <div className="relative w-6 h-6 flex items-center justify-center">
              {/* Default: brand logo */}
              <div className={clsx('absolute inset-0 flex items-center justify-center transition-all duration-300', logoHovered ? 'opacity-0 blur-[4px] scale-75' : 'opacity-100 blur-0 scale-100')} style={{ pointerEvents: logoHovered ? 'none' : 'auto' }}>
                <BrandLogo className="w-6 h-6 object-contain" />
              </div>
              {/* Hovered: expand icon */}
              <div className={clsx('absolute inset-0 flex items-center justify-center transition-all duration-300', logoHovered ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-[4px] scale-75')} style={{ pointerEvents: logoHovered ? 'auto' : 'none' }}>
                <PanelLeftOpen size={18} style={{ color: 'var(--color-text-primary)' }} />
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {/* Projects Section */}
        <div>
          <button onClick={() => nav('/dashboard')}
            className={clsx('w-full flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all', collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2')}
            style={isProjectsActive ? { background: 'var(--color-accent)', color: '#fff' } : { color: 'var(--color-text-secondary)' }}>
            <FolderOpen size={16} className="flex-shrink-0" />
            {!collapsed && 'Projects'}
          </button>
          {!collapsed && (
            <div className="ml-4 mt-1 space-y-0.5">
              {projectItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button key={item.path} onClick={() => nav(item.path)}
                    className={clsx('w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all', isActive ? 'font-medium' : 'hover:bg-[var(--color-surface-elevated)]')}
                    style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags section */}
        {!collapsed ? (
          <div className="pt-3 pb-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Organize Tags</span>
            </div>
            <div className="space-y-0.5">
              {tags.map(tag => {
                const count = getTagProjectCount(tag.name);
                const isActiveTag = activeTag === tag.name;
                return (
                  <button key={tag.name} onClick={() => nav(`/dashboard/tag/${encodeURIComponent(tag.name)}`)}
                    className={clsx('w-full group flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all text-left', isActiveTag ? 'font-medium' : 'hover:bg-[var(--color-surface-elevated)]')}
                    style={{ color: isActiveTag ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', background: isActiveTag ? 'var(--color-accent)' : 'transparent' }}>
                    <span className="w-2.5 h-2.5 flex-shrink-0" style={{ background: tag.color, borderRadius: '2px' }} />
                    <span className="flex-1 truncate">{tag.name}</span>
                    <span className={clsx('text-[11px] tabular-nums', isActiveTag ? 'opacity-70' : 'opacity-0 group-hover:opacity-100')} style={{ color: isActiveTag ? '#fff' : 'var(--color-text-muted)' }}>{count}</span>
                    {!isActiveTag && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag.name); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 transition-all"
                        style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}><Trash2 size={11} /></button>
                    )}
                  </button>
                );
              })}
              <button onClick={() => nav('/dashboard/tag/uncategorized')}
                className={clsx('w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all text-left', isUncategorizedActive ? 'font-medium' : 'hover:bg-[var(--color-surface-elevated)]')}
                style={{ color: isUncategorizedActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)', background: isUncategorizedActive ? 'var(--color-accent)' : 'transparent' }}>
                <span className="flex-1 truncate italic">Uncategorized</span>
                <span className={clsx('text-[11px] tabular-nums', isUncategorizedActive ? 'opacity-70' : 'opacity-0 group-hover:opacity-100')} style={{ color: isUncategorizedActive ? '#fff' : 'var(--color-text-muted)' }}>{getUncategorizedCount(projects.map(p => p.id))}</span>
              </button>
              <button onClick={() => setShowNewTagModal(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] hover:bg-[var(--color-surface-elevated)] transition-all"
                style={{ color: 'var(--color-text-muted)' }}>
                <Plus size={14} /> New tag
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-3 pb-3 flex flex-col items-center gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            <Tag size={16} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        )}

        {/* Workspace Section */}
        {!collapsed ? (
          <div className="pt-3 pb-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Workspace</span>
            </div>
            <div className="space-y-0.5">
              <button onClick={() => nav('/saved-views')}
                className={clsx('w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all', location.pathname === '/saved-views' ? 'font-medium' : 'hover:bg-[var(--color-surface-elevated)]')}
                style={{ color: location.pathname === '/saved-views' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                <Bookmark size={14} /> Saved Views
              </button>
              <button onClick={() => nav('/team')}
                className={clsx('w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all', location.pathname === '/team' ? 'font-medium' : 'hover:bg-[var(--color-surface-elevated)]')}
                style={{ color: location.pathname === '/team' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                <Users size={14} /> Team
              </button>
              <button onClick={() => nav('/comments')}
                className={clsx('w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all', location.pathname === '/comments' ? 'font-medium' : 'hover:bg-[var(--color-surface-elevated)]')}
                style={{ color: location.pathname === '/comments' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                <MessageSquare size={14} /> Comments
              </button>
              <button onClick={() => nav('/notifications')}
                className={clsx('w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all', location.pathname === '/notifications' ? 'font-medium' : 'hover:bg-[var(--color-surface-elevated)]')}
                style={{ color: location.pathname === '/notifications' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                <Bell size={14} /> Notifications
              </button>
              <button onClick={() => nav('/activity')}
                className={clsx('w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all', location.pathname === '/activity' ? 'font-medium' : 'hover:bg-[var(--color-surface-elevated)]')}
                style={{ color: location.pathname === '/activity' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                <Activity size={14} /> Activity
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-3 pb-3 flex flex-col items-center gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            <Bookmark size={16} style={{ color: 'var(--color-text-muted)' }} />
            <Users size={16} style={{ color: 'var(--color-text-muted)' }} />
            <MessageSquare size={16} style={{ color: 'var(--color-text-muted)' }} />
            <Bell size={16} style={{ color: 'var(--color-text-muted)' }} />
            <Activity size={16} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className={clsx('pb-2 space-y-0.5 pt-2', collapsed ? 'px-1' : 'px-2')} style={{ borderTop: '1px solid var(--color-border)' }}>
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => nav(item.path)}
              className={clsx('w-full flex items-center gap-2.5 rounded-lg text-sm transition-all', collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2', isActive ? 'font-medium' : 'hover:bg-[var(--color-surface-elevated)]')}
              style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
              <item.icon size={16} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {'count' in item && (item as any).count > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full min-w-[18px] text-center text-white" style={{ background: 'var(--color-text-muted)' }}>
                      {(item as any).count}
                    </span>
                  )}
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded text-white" style={{ background: 'var(--color-accent)' }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}

        {/* Help */}
        {!collapsed ? (
          <div className="relative" ref={helpMenuRef}>
            <button onClick={() => setShowHelpMenu(p => !p)}
              className={clsx('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all', showHelpMenu ? 'font-medium' : 'hover:bg-[var(--color-surface-elevated)]')}
              style={{ color: showHelpMenu ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
              <HelpCircle size={16} />
              <span className="flex-1 text-left">Help</span>
              <ChevronDown size={14} className={clsx('transition-transform', showHelpMenu && 'rotate-180')} />
            </button>
            {showHelpMenu && (
              <div role="menu" className="absolute bottom-full left-0 mb-1 w-48 rounded-lg border py-1 shadow-xl z-50"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}>
                {helpItems.map((item) => (
                  <button key={item.path} role="menuitem" onClick={() => { setShowHelpMenu(false); nav(item.path); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setShowHelpMenu(p => !p)}
            className="w-full flex items-center justify-center px-2 py-2 rounded-lg transition-all hover:bg-[var(--color-surface-elevated)]"
            style={{ color: 'var(--color-text-muted)' }}>
            <HelpCircle size={16} />
          </button>
        )}

        {/* Account */}
        <div className={clsx('mt-1', !collapsed && 'pt-2')} style={{ borderTop: '1px solid var(--color-border)' }}>
          {token ? (
            <button onClick={() => navigate('/settings')}
              className={clsx('w-full flex items-center gap-2.5 rounded-lg text-sm transition-all hover:bg-[var(--color-surface-elevated)]', collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2')}
              style={{ color: 'var(--color-text-secondary)' }}>
              <User size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left text-[13px]">Account</span>
                  <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="p-1 rounded transition-colors hover:text-red-400" style={{ color: 'var(--color-text-muted)' }} title="Log out">
                    <LogOut size={14} />
                  </button>
                </>
              )}
            </button>
          ) : (
            <button onClick={() => setShowAuthModal(true)}
              className={clsx('w-full flex items-center gap-2.5 rounded-lg text-sm hover:bg-[var(--color-surface-elevated)] transition-all', collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2')}
              style={{ color: 'var(--color-text-muted)' }}>
              <User size={16} />
              {!collapsed && 'Log in / Sign up'}
            </button>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block h-full flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {showNewTagModal && <NewTagModal onClose={() => setShowNewTagModal(false)} onCreated={handleCreateTag} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
