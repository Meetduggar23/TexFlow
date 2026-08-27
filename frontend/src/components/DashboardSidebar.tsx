import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen, Users, Archive, Plus, BookOpen, Trash2, HelpCircle, User, LogOut, Settings, Mail, FileText, Tag, X } from 'lucide-react';
import clsx from 'clsx';
import AuthModal from './AuthModal';
import BrandLogo from './BrandLogo';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTrashCount } from '../store/projectSlice';

const TAGS_KEY = 'texflow-tags';

function loadTags(): string[] {
  try {
    const raw = localStorage.getItem(TAGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTags(tags: string[]) {
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

/* ────── New Tag Modal ────── */
function NewTagModal({ onClose, onCreated }: { onClose: () => void; onCreated: (name: string) => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Tag name is required.'); return; }
    const existing = loadTags();
    if (existing.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setError('Tag already exists.');
      return;
    }
    onCreated(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>New Tag</h2>
          <button onClick={onClose} className="p-1 rounded-md" style={{ color: 'var(--color-text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        <div className="px-5 pb-5">
          <input
            ref={inputRef}
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') onClose(); }}
            placeholder="Tag name"
            className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none"
            style={{ background: 'var(--color-background)', borderColor: error ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
          />
          {error && <p className="text-[11px] mt-1" style={{ color: 'var(--color-error)' }}>{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors"
              style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>Cancel</button>
            <button onClick={handleSubmit} disabled={!name.trim()}
              className="px-3 py-1.5 text-[12px] font-medium text-white rounded-lg transition-all disabled:opacity-50"
              style={{ background: 'var(--color-accent)' }}>Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { trashCount } = useAppSelector(state => state.project);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [tags, setTags] = useState<string[]>(loadTags);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (token) dispatch(fetchTrashCount());
  }, [dispatch, token]);

  const projectItems = [
    { icon: FolderOpen, label: 'Your projects', path: '/dashboard' },
    { icon: Users, label: 'Shared with you', path: '/dashboard/shared' },
    { icon: Archive, label: 'Archived projects', path: '/dashboard/archived' },
  ];

  const bottomItems = [
    { icon: BookOpen, label: 'Library', path: '/templates', badge: 'New' },
    { icon: Trash2, label: 'Trash', path: '/dashboard/trash', count: trashCount },
    { icon: Settings, label: 'Settings', path: '/settings' },
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
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target as Node)) {
        setShowHelpMenu(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowHelpMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showHelpMenu]);

  const handleCreateTag = useCallback((name: string) => {
    const updated = [...tags, name];
    setTags(updated);
    saveTags(updated);
  }, [tags]);

  const handleDeleteTag = useCallback((name: string) => {
    const updated = tags.filter(t => t !== name);
    setTags(updated);
    saveTags(updated);
  }, [tags]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/dashboard');
  };

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <>
      <aside className="w-60 h-full flex flex-col" style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
        <div className="p-4 pb-3">
          <button className="flex items-center gap-2 cursor-pointer rounded px-1 py-0.5 hover:bg-[var(--color-surface-elevated)]" onClick={() => navigate('/dashboard')} aria-label="Go to dashboard">
            <BrandLogo className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Tex<span className="gradient-text">Flow</span></span>
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          <div className="mb-3">
            <button
              onClick={() => navigate('/dashboard')}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                location.pathname === '/dashboard' || location.pathname === '/dashboard/projects'
                  ? 'text-texflow-900 font-semibold'
                  : 'hover:bg-texflow-200/50'
              )}
              style={location.pathname === '/dashboard' || location.pathname === '/dashboard/projects'
                ? { background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))', color: '#fff' }
                : { color: 'var(--color-text-secondary)' }}
            >
              <FolderOpen size={18} />
              Projects
            </button>

            <div className="ml-4 mt-1 space-y-0.5">
              {projectItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-all',
                      isActive ? 'font-medium' : 'hover:bg-texflow-200/30'
                    )}
                    style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags section */}
          <div className="pt-3 pb-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Organize Tags</span>
            </div>
            <div className="space-y-0.5">
              {tags.map(tag => (
                <div key={tag} className="group flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  <Tag size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <span className="flex-1 truncate">{tag}</span>
                  <button onClick={() => handleDeleteTag(tag)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                    title="Delete tag"
                  ><Trash2 size={11} /></button>
                </div>
              ))}
              <button
                onClick={() => setShowNewTagModal(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] hover:bg-texflow-200/30 transition-all"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <Plus size={14} />
                New tag
              </button>
            </div>
          </div>
        </nav>

        <div className="px-2 pb-2 space-y-0.5 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                  isActive ? 'font-medium' : 'hover:bg-texflow-200/30'
                )}
                style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                <item.icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {'count' in item && (item as any).count > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full min-w-[18px] text-center text-white" style={{ background: 'var(--color-text-muted)' }}>
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded text-white" style={{ background: 'var(--color-accent)' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Help dropdown */}
          <div className="relative" ref={helpMenuRef}>
            <button
              onClick={() => setShowHelpMenu(p => !p)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                showHelpMenu ? 'font-medium' : 'hover:bg-texflow-200/30'
              )}
              style={{ color: showHelpMenu ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              aria-haspopup="menu"
              aria-expanded={showHelpMenu}
            >
              <HelpCircle size={18} />
              <span className="flex-1 text-left">Help</span>
            </button>

            {showHelpMenu && (
              <div
                role="menu"
                className="absolute bottom-full left-0 mb-1 w-52 rounded-lg border py-1 shadow-xl z-50"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}
              >
                {helpItems.map((item) => (
                  <button
                    key={item.path}
                    role="menuitem"
                    onClick={() => {
                      setShowHelpMenu(false);
                      navigate(item.path);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 mt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
            {token ? (
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}>
                  {getUserInitial()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{user?.name || 'User'}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email || ''}</p>
                </div>
                <button onClick={handleLogout} className="p-1 hover:text-red-400 transition-colors" style={{ color: 'var(--color-text-secondary)' }} title="Log out">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-texflow-200/30 transition-all"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <User size={18} />
                Log in / Sign up
              </button>
            )}
          </div>
        </div>
      </aside>

      {showNewTagModal && <NewTagModal onClose={() => setShowNewTagModal(false)} onCreated={handleCreateTag} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
