import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, Pencil, Trash2, X, ChevronRight, Folder } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchProjects } from '../store/projectSlice';
import toast from 'react-hot-toast';
import { useDialog } from '../components/DialogProvider';

const FOLDERS_KEY = 'texflow-folders';

interface FolderItem {
  id: string;
  name: string;
  projectIds: string[];
  createdAt: string;
}

function loadFolders(): FolderItem[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFolders(folders: FolderItem[]) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export default function FoldersPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector(state => state.project);
  const [folders, setFolders] = useState<FolderItem[]>(loadFolders);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { confirm } = useDialog();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);
  useEffect(() => { if (showCreate || editingId) inputRef.current?.focus(); }, [showCreate, editingId]);

  const handleSave = () => {
    const trimmed = folderName.trim();
    if (!trimmed) return;
    if (editingId) {
      setFolders(prev => {
        const updated = prev.map(f => f.id === editingId ? { ...f, name: trimmed } : f);
        saveFolders(updated);
        return updated;
      });
    } else {
      const newFolder: FolderItem = { id: Date.now().toString(), name: trimmed, projectIds: [], createdAt: new Date().toISOString() };
      setFolders(prev => { const updated = [...prev, newFolder]; saveFolders(updated); return updated; });
    }
    setFolderName('');
    setShowCreate(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const folder = folders.find(f => f.id === id);
    if (folder && folder.projectIds.length > 0) {
      if (!(await confirm({ title: 'Delete folder?', message: `Delete "${folder.name}"? ${folder.projectIds.length} project(s) will be ungrouped but not deleted.`, confirmText: 'Delete', danger: true }))) return;
    }
    setFolders(prev => { const updated = prev.filter(f => f.id !== id); saveFolders(updated); return updated; });
    if (expandedId === id) setExpandedId(null);
  };

  const moveToFolder = (projectId: string, folderId: string) => {
    setFolders(prev => {
      const updated = prev.map(f => ({
        ...f,
        projectIds: f.id === folderId
          ? [...new Set([...f.projectIds, projectId])]
          : f.projectIds.filter(pid => pid !== projectId),
      }));
      saveFolders(updated);
      return updated;
    });
  };

  const removeFromFolder = (projectId: string, folderId: string) => {
    setFolders(prev => {
      const updated = prev.map(f => f.id === folderId ? { ...f, projectIds: f.projectIds.filter(pid => pid !== projectId) } : f);
      saveFolders(updated);
      return updated;
    });
  };

  const ungroupedProjects = projects.filter(p => !p.deletedAt && !p.isArchived && !folders.some(f => f.projectIds.includes(p.id)));

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Folders</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Organize projects into folders.</p>
          </div>
          <button onClick={() => { setShowCreate(true); setEditingId(null); setFolderName(''); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white"
            style={{ background: 'var(--color-accent)' }}>
            <Plus size={14} /> New folder
          </button>
        </div>

        {/* Create / Edit form */}
        {showCreate && (
          <div className="mb-6 p-4 border rounded-lg" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>{editingId ? 'Rename Folder' : 'Create Folder'}</h3>
              <button onClick={() => { setShowCreate(false); setEditingId(null); }} style={{ color: 'var(--color-text-muted)' }}><X size={16} /></button>
            </div>
            <input ref={inputRef} value={folderName} onChange={e => setFolderName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Folder name"
              className="w-full border px-3 py-2 text-[13px] outline-none mb-3"
              style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="px-3 py-1.5 text-[12px] font-medium"
                style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>Cancel</button>
              <button onClick={handleSave} disabled={!folderName.trim()} className="px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--color-accent)' }}>{editingId ? 'Rename' : 'Create'}</button>
            </div>
          </div>
        )}

        {/* Folders */}
        {folders.length === 0 && ungroupedProjects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>No folders yet</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Create folders to organize your projects.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {folders.map(folder => {
              const isExpanded = expandedId === folder.id;
              const folderProjects = projects.filter(p => folder.projectIds.includes(p.id) && !p.deletedAt);
              return (
                <div key={folder.id}>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg group transition-colors"
                    style={{ background: isExpanded ? 'var(--color-surface)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                    onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}>
                    <button onClick={() => setExpandedId(isExpanded ? null : folder.id)} className="p-0.5">
                      <ChevronRight size={14} style={{ color: 'var(--color-text-muted)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }} />
                    </button>
                    <Folder size={16} style={{ color: 'var(--color-accent)' }} />
                    <span className="flex-1 text-[13px] font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{folder.name}</span>
                    <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{folderProjects.length}</span>
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(folder.id); setFolderName(folder.name); setShowCreate(true); }}
                      className="p-1 opacity-0 group-hover:opacity-100" style={{ color: 'var(--color-text-muted)' }}><Pencil size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(folder.id); }}
                      className="p-1 opacity-0 group-hover:opacity-100" style={{ color: 'var(--color-text-muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}><Trash2 size={12} /></button>
                  </div>
                  {isExpanded && (
                    <div className="ml-8 space-y-0.5 mb-2">
                      {folderProjects.length === 0 ? (
                        <p className="text-[12px] py-2 italic" style={{ color: 'var(--color-text-muted)' }}>No projects in this folder</p>
                      ) : folderProjects.map(p => (
                        <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded text-[12px] group"
                          style={{ color: 'var(--color-text-secondary)' }}>
                          <FolderOpen size={12} style={{ color: 'var(--color-text-muted)' }} />
                          <span className="flex-1 truncate cursor-pointer" onClick={() => navigate(`/project/${p.id}`)} style={{ color: 'var(--color-text-primary)' }}>{p.name}</span>
                          <button onClick={() => removeFromFolder(p.id, folder.id)} className="opacity-0 group-hover:opacity-100 text-[11px]"
                            style={{ color: 'var(--color-text-muted)' }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Ungrouped projects */}
            {ungroupedProjects.length > 0 && (
              <div className="pt-3 mt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider px-2 mb-2" style={{ color: 'var(--color-text-muted)' }}>Ungrouped</p>
                {ungroupedProjects.map(p => (
                  <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded text-[12px] group"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    <FolderOpen size={12} style={{ color: 'var(--color-text-muted)' }} />
                    <span className="flex-1 truncate cursor-pointer" onClick={() => navigate(`/project/${p.id}`)} style={{ color: 'var(--color-text-primary)' }}>{p.name}</span>
                    {folders.length > 0 && (
                      <select onChange={e => { if (e.target.value) moveToFolder(p.id, e.target.value); e.target.value = ''; }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] border px-1 py-0.5 outline-none"
                        style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                        <option value="">Move to...</option>
                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
