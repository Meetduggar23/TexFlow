import { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, FilePlus, FolderPlus, MoreHorizontal } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentFile, createFile, deleteFile } from '../store/projectSlice';
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

function FileTreeItem({ node, projectId, level = 0 }: FileTreeItemProps) {
  const dispatch = useAppDispatch();
  const { currentFile } = useAppSelector(state => state.project);
  const { fileTreeExpanded } = useAppSelector(state => state.ui);
  const [showMenu, setShowMenu] = useState(false);

  const isExpanded = fileTreeExpanded[node.id] ?? false;
  const isSelected = currentFile?.id === node.id;
  const isFolder = node.type === 'folder';

  const handleClick = useCallback(() => {
    if (isFolder) {
      dispatch(toggleFileNode(node.id));
    } else {
      dispatch(setCurrentFile(node));
    }
  }, [dispatch, node, isFolder]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      await dispatch(deleteFile(node.id)).unwrap();
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }, [dispatch, node.id]);

  const handleCreateFile = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    const name = prompt('Enter file name:');
    if (!name) return;
    try {
      await dispatch(createFile({ projectId, name, parentId: node.id, type: 'file' })).unwrap();
      toast.success('File created');
    } catch {
      toast.error('Failed to create file');
    }
  }, [dispatch, projectId, node.id]);

  const handleCreateFolder = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    const name = prompt('Enter folder name:');
    if (!name) return;
    try {
      await dispatch(createFile({ projectId, name, parentId: node.id, type: 'folder' })).unwrap();
      toast.success('Folder created');
    } catch {
      toast.error('Failed to create folder');
    }
  }, [dispatch, projectId, node.id]);

  const getFileIcon = () => {
    if (isFolder) {
      return isExpanded ? <FolderOpen size={16} className="text-texflow-400" /> : <Folder size={16} className="text-texflow-400" />;
    }
    const ext = node.name.split('.').pop()?.toLowerCase();
    const colors: Record<string, string> = {
      tex: 'text-texflow-300',
      bib: 'text-green-400',
      cls: 'text-purple-400',
      sty: 'text-purple-400',
    };
    return <File size={16} className={colors[ext || ''] || 'text-texflow-600'} />;
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={clsx(
          'flex items-center gap-1.5 px-2 py-1 text-sm cursor-pointer group relative',
          isSelected
            ? 'text-texflow-300'
            : 'text-texflow-700 hover:bg-texflow-200/50'
        )}
        style={{ 
          paddingLeft: `${level * 16 + 8}px`,
          ...(isSelected ? { background: 'rgba(245,175,175,0.15)' } : {})
        }}
      >
        {isFolder && (
          <span className="text-texflow-500">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        {!isFolder && <span className="w-[14px]" />}
        {getFileIcon()}
        <span className="truncate flex-1">{node.name}</span>

        {isFolder && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-texflow-200 rounded transition-all"
            >
              <MoreHorizontal size={14} className="text-texflow-600" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                <div className="absolute right-0 top-full mt-1 z-20 border border-texflow-800 rounded-lg shadow-xl py-1 min-w-[160px]" style={{ background: '#FBEFEF' }}>
                  <button onClick={handleCreateFile} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-texflow-700 hover:bg-texflow-200">
                    <FilePlus size={14} /> New File
                  </button>
                  <button onClick={handleCreateFolder} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-texflow-700 hover:bg-texflow-200">
                    <FolderPlus size={14} /> New Folder
                  </button>
                  <div className="border-t border-texflow-800 my-1" />
                  <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-texflow-200">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

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
    <div className="h-full flex flex-col bg-dark-900">
      <div className="flex items-center justify-between px-3 py-2 border-b border-texflow-800">
        <span className="text-xs font-semibold text-texflow-600 uppercase tracking-wider">Files</span>
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="p-1 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded transition-colors"
          >
            <Plus size={14} />
          </button>
          {showNewMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNewMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 border border-texflow-800 rounded-lg shadow-xl py-1 min-w-[140px]" style={{ background: '#FBEFEF' }}>
                <button onClick={() => handleCreateRootFile('file')} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-texflow-700 hover:bg-texflow-200">
                  <FilePlus size={14} /> New File
                </button>
                <button onClick={() => handleCreateRootFile('folder')} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-texflow-700 hover:bg-texflow-200">
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
