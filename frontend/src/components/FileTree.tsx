import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2,
  FilePlus, FolderPlus, MoreHorizontal, Pencil, Download, Copy,
  Upload, X, ChevronDown as ChevronDownIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentFile, createFile, deleteFile, updateFileContent, updateFileInTree } from '../store/projectSlice';
import { toggleFileNode, toggleSidebar, setSelectedFolderId } from '../store/uiSlice';
import type { FileNode } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface FileTreeProps {
  files: FileNode[];
  projectId: string;
}

interface FileTreeItemProps {
  node: FileNode;
  projectId: string;
  level?: number;
  startCreation?: (type: 'file' | 'folder') => void;
}

function ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: { label: string; icon: React.ReactNode; action: () => void; danger?: boolean }[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div ref={ref} className="fixed z-50 border border-[var(--color-border)] rounded-lg shadow-xl py-1 min-w-[170px]" style={{ background: 'var(--color-surface)', left: x, top: y }}>
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            className={clsx(
              'w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors',
              item.danger ? 'text-red-500 hover:bg-red-50' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
            )}
          >
            <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

function FileTreeItem({ node, projectId, level = 0, startCreation }: FileTreeItemProps) {
  const dispatch = useAppDispatch();
  const { currentFile } = useAppSelector(state => state.project);
  const { fileTreeExpanded } = useAppSelector(state => state.ui);
  const [showMenu, setShowMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const [createValue, setCreateValue] = useState('');
  const [createError, setCreateError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isExpanded = fileTreeExpanded[node.id] ?? false;
  const isSelected = currentFile?.id === node.id;
  const isFolder = node.type === 'folder';

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const handleClick = useCallback(() => {
    if (isFolder) {
      dispatch(setSelectedFolderId(node.id));
      dispatch(toggleFileNode(node.id));
    } else {
      dispatch(setSelectedFolderId(null));
      dispatch(setCurrentFile(node));
    }
  }, [dispatch, node, isFolder]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      await dispatch(deleteFile(node.id)).unwrap();
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }, [dispatch, node.id]);

  const handleRename = useCallback(async () => {
    if (!renameValue.trim() || renameValue === node.name) {
      setRenaming(false);
      return;
    }
    try {
      await dispatch(updateFileContent({ fileId: node.id, name: renameValue })).unwrap();
      toast.success('Renamed');
    } catch {
      toast.error('Failed to rename');
    }
    setRenaming(false);
  }, [dispatch, node, renameValue]);

  const handleCreateFile = useCallback(async () => {
    setCreating('file'); setCreateValue(''); setCreateError(''); setShowMenu(false);
  }, []);

  const handleCreateFolder = useCallback(async () => {
    setCreating('folder'); setCreateValue(''); setCreateError(''); setShowMenu(false);
  }, []);

  useEffect(() => {
    const onStart = (event: Event) => {
      const detail = (event as CustomEvent<{ type: 'file' | 'folder'; parentId: string }>).detail;
      if (detail.parentId === node.id) detail.type === 'file' ? handleCreateFile() : handleCreateFolder();
    };
    window.addEventListener('texflow:start-nested-creation', onStart);
    return () => window.removeEventListener('texflow:start-nested-creation', onStart);
  }, [handleCreateFile, handleCreateFolder, node.id]);

  const submitCreation = useCallback(async () => {
    const name = createValue.trim();
    if (!name) { setCreateError(`${creating === 'folder' ? 'Folder' : 'File'} name is required`); return; }
    if (!/^[^\\/:*?"<>|]+$/.test(name) || name === '.' || name === '..') { setCreateError('Invalid name'); return; }
    if ((node.children || []).some(child => child.name.toLowerCase() === name.toLowerCase())) { setCreateError(`${name} already exists`); return; }
    try {
      const result = await dispatch(createFile({ projectId, name, parentId: node.id, type: creating! })).unwrap();
      toast.success('File created');
      if (!isExpanded) dispatch(toggleFileNode(node.id));
      if (result && creating === 'file') dispatch(setCurrentFile(result));
      setCreating(null); setCreateValue(''); setCreateError('');
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : `Unable to create ${creating === 'folder' ? 'folder' : 'file'}`);
    }
  }, [createValue, creating, dispatch, isExpanded, node.children, node.id, projectId]);

  const handleDuplicate = useCallback(async () => {
    const extension = node.type === 'file' && node.name.includes('.') ? `.${node.name.split('.').pop()}` : '';
    const stem = extension ? node.name.slice(0, -extension.length) : node.name;
    const siblings = node.parentId ? [] : [];
    const name = `${stem} copy${extension}`;
    try {
      await dispatch(createFile({ projectId, name, parentId: node.parentId, type: node.type })).unwrap();
      toast.success('Duplicated');
    } catch {
      toast.error('Failed to duplicate');
    }
  }, [dispatch, node, projectId]);

  const getFileIcon = () => {
    if (isFolder) {
      return isExpanded ? <FolderOpen size={15} style={{ color: 'var(--color-accent)' }} /> : <Folder size={15} style={{ color: 'var(--color-accent)' }} />;
    }
    const ext = node.name.split('.').pop()?.toLowerCase();
    const colors: Record<string, string> = {
      tex: 'var(--color-accent)', bib: '#16A34A', cls: '#FFFFFF', sty: '#FFFFFF',
    };
    return <File size={15} style={{ color: colors[ext || ''] || 'var(--color-text-muted)' }} />;
  };

  const contextMenuItems = isFolder ? [
    { label: 'New File', icon: <FilePlus size={14} />, action: handleCreateFile },
    { label: 'New Folder', icon: <FolderPlus size={14} />, action: handleCreateFolder },
    { label: 'Rename', icon: <Pencil size={14} />, action: () => setRenaming(true) },
    { label: 'Duplicate', icon: <Copy size={14} />, action: handleDuplicate },
    { label: 'Delete', icon: <Trash2 size={14} />, action: handleDelete, danger: true },
  ] : [
    { label: 'Open', icon: <File size={14} />, action: handleClick },
    { label: 'Rename', icon: <Pencil size={14} />, action: () => setRenaming(true) },
    { label: 'Duplicate', icon: <Copy size={14} />, action: handleDuplicate },
    { label: 'Download', icon: <Download size={14} />, action: () => toast.success('Downloaded') },
    { label: 'Delete', icon: <Trash2 size={14} />, action: handleDelete, danger: true },
  ];

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={clsx(
          'flex items-center gap-1.5 py-1 text-[13px] cursor-pointer group relative',
          isSelected
            ? 'font-medium'
            : 'hover:bg-[var(--color-surface-secondary)]'
        )}
        style={{
          paddingLeft: `${level * 14 + 8}px`,
          paddingRight: '8px',
          ...(isSelected ? { background: 'var(--color-accent-soft)', color: 'var(--color-accent)' } : { color: 'var(--color-text-secondary)' }),
        }}
      >
        {isFolder && (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ color: 'var(--color-text-disabled)' }}>
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        )}
        {!isFolder && <span className="w-4" />}
        <span className="flex-shrink-0">{getFileIcon()}</span>

        {renaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }}
            className="flex-1 min-w-0 px-1 py-0 text-[13px] rounded border outline-none"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)', color: 'var(--color-text-primary)' }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1">{node.name}</span>
        )}

        {isFolder && !renaming && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[var(--color-border)] rounded transition-all flex-shrink-0"
          >
            <MoreHorizontal size={13} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        )}
      </div>

      {creating && (
        <div className="px-2 py-1" style={{ paddingLeft: `${level * 14 + 28}px` }}>
          <input
            autoFocus
            value={createValue}
            onChange={e => { setCreateValue(e.target.value); setCreateError(''); }}
            onBlur={() => { if (!createValue.trim()) setCreating(null); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitCreation(); } if (e.key === 'Escape') setCreating(null); }}
            placeholder={creating === 'folder' ? 'folder name' : 'file name'}
            aria-label={`New ${creating} name`}
            className="w-full rounded border px-2 py-1 text-xs outline-none"
            style={{ background: 'var(--color-surface)', borderColor: createError ? 'var(--color-error)' : 'var(--color-accent)', color: 'var(--color-text-primary)' }}
          />
          {createError && <p className="mt-1 text-[10px]" style={{ color: 'var(--color-error)' }}>{createError}</p>}
        </div>
      )}

      {showMenu && (
        <ContextMenu x={0} y={0} items={contextMenuItems} onClose={() => setShowMenu(false)} />
      )}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenuItems} onClose={() => setContextMenu(null)} />
      )}

      {isFolder && isExpanded && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'folder' ? -1 : 1;
            })
            .map(child => (
              <FileTreeItem key={child.id} node={child} projectId={projectId} level={level + 1} />
            ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ files, projectId }: FileTreeProps) {
  const dispatch = useAppDispatch();
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [creatingRoot, setCreatingRoot] = useState<'file' | 'folder' | null>(null);
  const [rootName, setRootName] = useState('');
  const [rootError, setRootError] = useState('');
  const [outlineOpen, setOutlineOpen] = useState(true);
  const { currentFile } = useAppSelector(state => state.project);
  const { selectedFolderId } = useAppSelector(state => state.ui);

  const startRootCreation = (type: 'file' | 'folder') => {
    setShowNewMenu(false);
    if (selectedFolderId) {
      window.dispatchEvent(new CustomEvent('texflow:start-nested-creation', { detail: { type, parentId: selectedFolderId } }));
      return;
    }
    setCreatingRoot(type); setRootName(''); setRootError('');
  };

  const submitRootCreation = async () => {
    const name = rootName.trim();
    if (!name) { setRootError(`${creatingRoot === 'folder' ? 'Folder' : 'File'} name is required`); return; }
    if (!/^[^\\/:*?"<>|]+$/.test(name) || name === '.' || name === '..') { setRootError('Invalid name'); return; }
    if (files.some(item => item.name.toLowerCase() === name.toLowerCase())) { setRootError(`${name} already exists`); return; }
    try {
      const result = await dispatch(createFile({ projectId, name, parentId: null, type: creatingRoot! })).unwrap();
      toast.success(`${creatingRoot === 'file' ? 'File' : 'Folder'} created`);
      if (result && creatingRoot === 'file') {
        dispatch(setCurrentFile(result));
      }
      setCreatingRoot(null); setRootName(''); setRootError('');
    } catch (error) {
      setRootError(error instanceof Error ? error.message : `Unable to create ${creatingRoot === 'folder' ? 'folder' : 'file'}`);
    }
  };

  useEffect(() => {
    const onStart = (event: Event) => startRootCreation((event as CustomEvent<'file' | 'folder'>).detail);
    window.addEventListener('texflow:start-file-creation', onStart);
    return () => window.removeEventListener('texflow:start-file-creation', onStart);
  }, []);

  const handleUpload = async () => {
    setShowNewMenu(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.tex,.cls,.sty,.bib,.png,.jpg,.jpeg,.gif,.pdf';
    input.onchange = async (e) => {
      const filesList = (e.target as HTMLInputElement).files;
      if (!filesList) return;
      for (const f of Array.from(filesList)) {
        try {
          const result = await dispatch(createFile({ projectId, name: f.name, parentId: null, type: 'file' })).unwrap();
          if (result && f.type !== 'application/octet-stream') {
            const content = await f.text();
            await dispatch(updateFileInTree({ fileId: result.id, content }));
          }
        } catch {}
      }
      toast.success(`${filesList.length} file(s) uploaded`);
    };
    input.click();
  };

  const sections = currentFile?.content
    ? (() => {
        const matches = currentFile.content.match(/\\(section|subsection|subsubsection)\{([^}]+)\}/g);
        if (!matches) return [];
        return matches.map((m) => {
          const levelMatch = m.match(/\\(section|subsection|subsubsection)\{([^}]+)\}/);
          return { level: levelMatch?.[1] || 'section', name: levelMatch?.[2] || '' };
        });
      })()
    : [];

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Header matching Overleaf style */}
      <div className="relative flex items-center gap-1 px-2 py-1.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <ChevronDownIcon size={12} style={{ color: 'var(--color-text-muted)' }} />
        <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>FileFlow</span>
        <div className="flex-1" />
        <button
          onClick={() => setShowNewMenu(p => !p)}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{ color: 'var(--color-text-muted)' }}
          title="New file or folder"
          aria-label="New file or folder"
          aria-expanded={showNewMenu}
          aria-haspopup="menu"
        >
          <Plus size={14} />
        </button>
        {showNewMenu && <div className="absolute right-9 top-8 z-50 min-w-[150px] rounded-md border py-1 shadow-xl" role="menu" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}>
          <button onClick={() => startRootCreation('file')} className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-surface-elevated)]" role="menuitem" style={{ color: 'var(--color-text-primary)' }}><FilePlus size={13} /> New File</button>
          <button onClick={() => startRootCreation('folder')} className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-surface-elevated)]" role="menuitem" style={{ color: 'var(--color-text-primary)' }}><FolderPlus size={13} /> New Folder</button>
        </div>}
        <button
          onClick={handleUpload}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{ color: 'var(--color-text-muted)' }}
          title="Upload files"
          aria-label="Upload files"
        >
          <Upload size={13} />
        </button>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{ color: 'var(--color-text-muted)' }}
          title="Close FileFlow"
          aria-label="Close FileFlow"
        >
          <X size={13} />
        </button>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto py-1">
        {creatingRoot && <div className="px-2 py-1">
          <input autoFocus value={rootName} onChange={e => { setRootName(e.target.value); setRootError(''); }} onBlur={() => { if (!rootName.trim()) setCreatingRoot(null); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitRootCreation(); } if (e.key === 'Escape') setCreatingRoot(null); }} placeholder={creatingRoot === 'folder' ? 'folder name' : 'file name'} aria-label={`New ${creatingRoot} name`} className="w-full rounded border px-2 py-1 text-xs outline-none" style={{ background: 'var(--color-surface)', borderColor: rootError ? 'var(--color-error)' : 'var(--color-accent)', color: 'var(--color-text-primary)' }} />
          {rootError && <p className="px-1 pt-1 text-[10px]" style={{ color: 'var(--color-error)' }}>{rootError}</p>}
        </div>}
        {files
          .sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
          })
          .map(node => (
            <FileTreeItem key={node.id} node={node} projectId={projectId} />
          ))}
      </div>

      {/* File outline section */}
      <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => setOutlineOpen(p => !p)}
          className="w-full flex items-center gap-1.5 px-3 py-2 transition-colors hover:bg-[var(--color-surface-elevated)]"
        >
          {outlineOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>File outline</span>
        </button>
        {outlineOpen && (
          <div className="px-3 pb-3">
            {sections.length === 0 ? (
              <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
                We can't find any sections or subsections in this file.
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {sections.map((s, i) => (
                  <button
                    key={i}
                    className="text-left text-[11px] py-0.5 px-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
                    style={{
                      color: 'var(--color-text-secondary)',
                      paddingLeft: s.level === 'subsection' ? 16 : s.level === 'subsubsection' ? 32 : 4,
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
