import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Plus, Pencil, Trash2, X, FolderOpen, Search } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import type { Project } from '../types';

interface SavedView {
  id: string;
  name: string;
  filters: {
    owner?: 'me' | 'any';
    tag?: string;
    status?: 'active' | 'archived' | 'starred';
    shared?: boolean;
  };
}

const VIEWS_KEY = 'texflow-saved-views';

function loadViews(): SavedView[] {
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveViews(views: SavedView[]) {
  localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
}

export default function SavedViewsPage() {
  const navigate = useNavigate();
  const { projects } = useAppSelector(state => state.project);
  const [views, setViews] = useState<SavedView[]>(loadViews);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [filterOwner, setFilterOwner] = useState<'me' | 'any'>('me');
  const [filterStatus, setFilterStatus] = useState<'active' | 'archived' | 'starred'>('active');
  const inputRef = useRef<HTMLInputElement>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { if (showCreate || editingId) inputRef.current?.focus(); }, [showCreate, editingId]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editingId) {
      setViews(prev => {
        const updated = prev.map(v => v.id === editingId ? { ...v, name: trimmed, filters: { owner: filterOwner, status: filterStatus } } : v);
        saveViews(updated);
        return updated;
      });
    } else {
      const newView: SavedView = {
        id: Date.now().toString(),
        name: trimmed,
        filters: { owner: filterOwner, status: filterStatus },
      };
      setViews(prev => { const updated = [...prev, newView]; saveViews(updated); return updated; });
    }
    setName('');
    setShowCreate(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setViews(prev => { const updated = prev.filter(v => v.id !== id); saveViews(updated); return updated; });
  };

  const handleEdit = (view: SavedView) => {
    setEditingId(view.id);
    setName(view.name);
    setFilterOwner(view.filters.owner || 'me');
    setFilterStatus(view.filters.status || 'active');
    setShowCreate(true);
  };

  const getMatchingProjects = (view: SavedView): Project[] => {
    return projects.filter(p => {
      if (p.deletedAt) return false;
      if (view.filters.owner === 'me' && p.ownerId !== user.id) return false;
      if (view.filters.status === 'archived' && !p.isArchived) return false;
      if (view.filters.status === 'active' && p.isArchived) return false;
      if (view.filters.status === 'starred' && !p.isFavorite) return false;
      return true;
    });
  };

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Saved Views</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Create custom filtered views of your projects.</p>
          </div>
          <button onClick={() => { setShowCreate(true); setEditingId(null); setName(''); setFilterOwner('me'); setFilterStatus('active'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white"
            style={{ background: 'var(--color-accent)' }}>
            <Plus size={14} /> New view
          </button>
        </div>

        {/* Create / Edit form */}
        {showCreate && (
          <div className="mb-6 p-4 border rounded-lg" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>{editingId ? 'Edit View' : 'Create Saved View'}</h3>
              <button onClick={() => { setShowCreate(false); setEditingId(null); }} style={{ color: 'var(--color-text-muted)' }}><X size={16} /></button>
            </div>
            <input ref={inputRef} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="View name (e.g. My Research)"
              className="w-full border px-3 py-2 text-[13px] outline-none mb-3"
              style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
            <div className="flex gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Owner</label>
                <select value={filterOwner} onChange={e => setFilterOwner(e.target.value as any)}
                  className="border px-2 py-1.5 text-[12px] outline-none"
                  style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <option value="me">My projects</option>
                  <option value="any">All projects</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                  className="border px-2 py-1.5 text-[12px] outline-none"
                  style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="starred">Starred</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="px-3 py-1.5 text-[12px] font-medium"
                style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>Cancel</button>
              <button onClick={handleSave} disabled={!name.trim()} className="px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--color-accent)' }}>{editingId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        )}

        {/* Views list */}
        {views.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>No saved views</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Create custom views to quickly access filtered project lists.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {views.map(view => {
              const count = getMatchingProjects(view).length;
              return (
                <div key={view.id} className="flex items-center gap-3 p-3 border rounded-lg transition-colors"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                  <Bookmark size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{view.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      Owner: {view.filters.owner === 'me' ? 'Me' : 'Any'} · Status: {view.filters.status} · {count} project{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button onClick={() => handleEdit(view)} className="p-1.5" style={{ color: 'var(--color-text-muted)' }}><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(view.id)} className="p-1.5" style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}><Trash2 size={13} /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
