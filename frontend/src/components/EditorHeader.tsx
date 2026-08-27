import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Play, PanelLeftClose, PanelLeftOpen, Users, Share2, History, MessageSquare,
  Search, Command, ChevronDown, FileText, FolderOpen, Upload, Save, Download, Settings,
  Undo, Redo, Scissors, Copy, ClipboardPaste, Replace, Type, Bold, Italic,
  List, ListOrdered, Table2, Link2, Image as ImageIcon, FileCode2,
  Eye, EyeOff, Maximize2, Minimize2, Terminal, LayoutTemplate,
  Puzzle, HelpCircle, BookOpen, Bug,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import BrandLogo from './BrandLogo';
import { toggleSidebar } from '../store/uiSlice';
import { togglePdf, toggleTerminal } from '../store/editorSlice';
import type { Project } from '../types';

interface EditorHeaderProps {
  project: Project;
  onCompile: () => void;
  onBack: () => void;
  onToggleComments: () => void;
  onToggleHistory: () => void;
  onToggleShare: () => void;
  onSave: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onDownloadPdf: () => void;
  onDownloadSource: () => void;
  onOpenSearch: () => void;
  onOpenCommandPalette: () => void;
  onInsertSection?: () => void;
  onInsertFigure?: () => void;
  onInsertTable?: () => void;
  onInsertEquation?: () => void;
  onInsertCitation?: () => void;
}

interface MenuItem {
  label?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

function MenuDropdown({ items, onClose }: { items: MenuItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-full left-0 mt-1 z-50 border border-[var(--color-border)] rounded-lg shadow-xl py-1 min-w-[220px]" style={{ background: 'var(--color-surface)' }}>
      {items.map((item, i) => {
        if (item.divider) return <div key={i} className="border-t border-[var(--color-border)] my-1" />;
        return (
          <button
            key={i}
            onClick={() => { item.action?.(); onClose(); }}
            disabled={item.disabled}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && <span className="text-xs text-[var(--color-text-disabled)] font-mono">{item.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function EditorHeader({
  project, onCompile, onBack, onToggleComments, onToggleHistory, onToggleShare,
  onSave, onNewFile, onNewFolder, onDownloadPdf, onDownloadSource,
  onOpenSearch, onOpenCommandPalette,
}: EditorHeaderProps) {
  const dispatch = useAppDispatch();
  const { compiling, pdfVisible } = useAppSelector(state => state.editor);
  const { sidebarOpen } = useAppSelector(state => state.ui);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const closeMenu = useCallback(() => setActiveMenu(null), []);

  const fileMenu: MenuItem[] = [
    { label: 'New File', icon: <FileText size={14} />, action: onNewFile, shortcut: 'Ctrl+N' },
    { label: 'New Folder', icon: <FolderOpen size={14} />, action: onNewFolder },
    { divider: true },
    { label: 'Save', icon: <Save size={14} />, action: onSave, shortcut: 'Ctrl+S' },
    { label: 'Upload', icon: <Upload size={14} /> },
    { divider: true },
    { label: 'Download PDF', icon: <Download size={14} />, action: onDownloadPdf },
    { label: 'Download Source', icon: <Download size={14} />, action: onDownloadSource },
    { divider: true },
    { label: 'Project Settings', icon: <Settings size={14} /> },
  ];

  const editMenu: MenuItem[] = [
    { label: 'Undo', icon: <Undo size={14} />, shortcut: 'Ctrl+Z' },
    { label: 'Redo', icon: <Redo size={14} />, shortcut: 'Ctrl+Shift+Z' },
    { divider: true },
    { label: 'Cut', icon: <Scissors size={14} />, shortcut: 'Ctrl+X' },
    { label: 'Copy', icon: <Copy size={14} />, shortcut: 'Ctrl+C' },
    { label: 'Paste', icon: <ClipboardPaste size={14} />, shortcut: 'Ctrl+V' },
    { divider: true },
    { label: 'Find', icon: <Search size={14} />, action: onOpenSearch, shortcut: 'Ctrl+F' },
    { label: 'Replace', icon: <Replace size={14} />, shortcut: 'Ctrl+H' },
    { label: 'Select All', shortcut: 'Ctrl+A' },
  ];

  const insertMenu: MenuItem[] = [
    { label: 'Section', icon: <Type size={14} /> },
    { label: 'Subsection', icon: <Type size={14} /> },
    { divider: true },
    { label: 'Figure', icon: <ImageIcon size={14} /> },
    { label: 'Table', icon: <Table2 size={14} /> },
    { label: 'Equation', icon: <FileCode2 size={14} /> },
    { divider: true },
    { label: 'Citation', icon: <BookOpen size={14} /> },
    { label: 'Reference', icon: <Link2 size={14} /> },
  ];

  const viewMenu: MenuItem[] = [
    { label: sidebarOpen ? 'Hide File Explorer' : 'Show File Explorer', icon: sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />, action: () => dispatch(toggleSidebar()) },
    { label: pdfVisible ? 'Hide PDF' : 'Show PDF', icon: pdfVisible ? <EyeOff size={14} /> : <Eye size={14} />, action: () => dispatch(togglePdf()) },
    { label: 'Toggle Terminal', icon: <Terminal size={14} />, action: () => dispatch(toggleTerminal()) },
    { divider: true },
    { label: 'Search', icon: <Search size={14} />, action: onOpenSearch, shortcut: 'Ctrl+Shift+F' },
    { label: 'Command Palette', icon: <Command size={14} />, action: onOpenCommandPalette, shortcut: 'Ctrl+K' },
  ];

  const toolsMenu: MenuItem[] = [
    { label: compiling ? 'Compiling...' : 'Compile', icon: <Play size={14} />, action: onCompile, shortcut: 'Ctrl+Enter', disabled: compiling },
    { label: 'Clean Build', icon: <Bug size={14} /> },
    { divider: true },
    { label: 'Command Palette', icon: <Command size={14} />, action: onOpenCommandPalette, shortcut: 'Ctrl+K' },
  ];

  const helpMenu: MenuItem[] = [
    { label: 'Documentation', icon: <BookOpen size={14} /> },
    { label: 'LaTeX Help', icon: <HelpCircle size={14} /> },
    { divider: true },
    { label: 'Keyboard Shortcuts', icon: <Puzzle size={14} /> },
    { label: 'Report Issue', icon: <Bug size={14} /> },
  ];

  const menus: Record<string, MenuItem[]> = {
    File: fileMenu, Edit: editMenu, Insert: insertMenu, View: viewMenu, Tools: toolsMenu, Help: helpMenu,
  };

  return (
    <header className="h-11 border-b border-[var(--color-border)] flex items-center px-3 gap-1" style={{ background: 'var(--color-surface)' }}>
      <button onClick={onBack} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] rounded transition-colors" title="Back to Dashboard">
        <ArrowLeft size={15} />
      </button>
      <button onClick={() => dispatch(toggleSidebar())} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] rounded transition-colors" title="Toggle file explorer">
        {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
      </button>

      <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

      <div className="flex items-center gap-1.5 mr-2">
        <BrandLogo alt="TexFlow" className="w-5 h-5 object-contain" />
        <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>TexFlow</span>
      </div>

      <nav className="flex items-center gap-0">
        {Object.keys(menus).map(menuName => (
          <div key={menuName} className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === menuName ? null : menuName)}
              onMouseEnter={() => activeMenu && setActiveMenu(menuName)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeMenu === menuName
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
              }`}
            >
              {menuName}
            </button>
            {activeMenu === menuName && <MenuDropdown items={menus[menuName]} onClose={closeMenu} />}
          </div>
        ))}
      </nav>

      <div className="ml-2 text-xs text-[var(--color-text-muted)] font-medium truncate max-w-[180px]">
        {project.name}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button onClick={onOpenSearch} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] rounded transition-colors" title="Search (Ctrl+Shift+F)">
          <Search size={14} />
        </button>
        <button onClick={onOpenCommandPalette} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] rounded transition-colors" title="Command Palette (Ctrl+K)">
          <Command size={14} />
        </button>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <button onClick={onToggleComments} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] rounded transition-colors" title="Comments">
          <MessageSquare size={14} />
        </button>
        <button onClick={onToggleHistory} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] rounded transition-colors" title="History">
          <History size={14} />
        </button>

        <div className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--color-text-muted)]" title="Collaborators">
          <Users size={13} />
          <span>{project.collaborators?.length || 1}</span>
        </div>

        <button onClick={onToggleShare} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded transition-all" style={{ background: 'var(--color-accent)' }} title="Share">
          <Share2 size={12} />
          Share
        </button>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <button onClick={() => dispatch(togglePdf())} className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${pdfVisible ? 'text-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-secondary)]'}`}>
          PDF
        </button>
        <button onClick={onCompile} disabled={compiling} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded transition-all disabled:opacity-50" style={{ background: compiling ? 'var(--color-border)' : 'var(--color-accent)' }}>
          {compiling ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> : <Play size={11} />}
          {compiling ? 'Compiling...' : 'Recompile'}
        </button>
      </div>
    </header>
  );
}
