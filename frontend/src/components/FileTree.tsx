import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2,
  FilePlus, FolderPlus, MoreHorizontal, Pencil, Download, Copy,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentFile, createFile, deleteFile, updateFileContent } from '../store/projectSlice';
import { toggleFileNode } from '../store/uiSlice';
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

function FileTreeItem({ node, projectId, level = 0 }: FileTreeItemProps) {
  const dispatch = useAppDispatch();
  const { currentFile } = useAppSelector(state => state.project);
  const { fileTreeExpanded } = useAppSelector(state => state.ui);
  const [showMenu, setShowMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
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
      dispatch(toggleFileNode(node.id));
    } else {
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
      await dispatch(updateFileContent({ fileId: node.id, content: node.content || '' })).unwrap();
      toast.success('Renamed');
    } catch {
      toast.error('Failed to rename');
    }
    setRenaming(false);
  }, [dispatch, node, renameValue]);

  const handleCreateFile = useCallback(async () => {
    const name = prompt('Enter file name:');
    if (!name) return;
    try {
      await dispatch(createFile({ projectId, name, parentId: node.id, type: 'file' })).unwrap();
      toast.success('File created');
    } catch {
      toast.error('Failed to create file');
    }
  }, [dispatch, projectId, node.id]);

  const handleCreateFolder = useCallback(async () => {
    const name = prompt('Enter folder name:');
    if (!name) return;
    try {
      await dispatch(createFile({ projectId, name, parentId: node.id, type: 'folder' })).unwrap();
      toast.success('Folder created');
    } catch {
      toast.error('Failed to create folder');
    }
  }, [dispatch, projectId, node.id]);

  const handleDuplicate = useCallback(async () => {
    const name = prompt('Enter name for duplicate:', `copy_${node.name}`);
    if (!name) return;
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
      tex: 'var(--color-accent)', bib: '#16A34A', cls: '#7C3AED', sty: '#7C3AED',
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

  const handleCreateRootFile = async (type: 'file' | 'folder') => {
    setShowNewMenu(false);
    const name = prompt(`Enter ${type} name:`);
    if (!name) return;
    try {
      await dispatch(createFile({ projectId, name, parentId: null, type })).unwrap();
      toast.success(`${type === 'file' ? 'File' : 'Folder'} created`);
    } catch {
      toast.error(`Failed to create ${type}`);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Files</span>
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="p-1 rounded transition-colors hover:bg-[var(--color-surface-secondary)]"
            style={{ color: 'var(--color-text-muted)' }}
            title="New file or folder"
          >
            <Plus size={14} />
          </button>
          {showNewMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNewMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 border border-[var(--color-border)] rounded-lg shadow-xl py-1 min-w-[150px]" style={{ background: 'var(--color-surface)' }}>
                <button onClick={() => handleCreateRootFile('file')} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]">
                  <FilePlus size={14} /> New File
                </button>
                <button onClick={() => handleCreateRootFile('folder')} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]">
                  <FolderPlus size={14} /> New Folder
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto py-1">
        {files
          .sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
          })
          .map(node => (
            <FileTreeItem key={node.id} node={node} projectId={projectId} />
          ))}
      </div>
    </div>
  );
}
