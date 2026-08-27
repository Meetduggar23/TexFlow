import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Play, PanelLeftClose, PanelLeftOpen, Users, Share2, History, MessageSquare,
  Search, Command, ChevronDown, FileText, FolderOpen, Upload, Save, Download, Settings,
  Undo, Redo, Scissors, Copy, ClipboardPaste, Replace, Type, Bold, Italic,
  List, ListOrdered, Table2, Link2, Image as ImageIcon, FileCode2,
  Eye, EyeOff, Terminal, LayoutTemplate,
  Puzzle, HelpCircle, BookOpen, Bug,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import BrandLogo from './BrandLogo';
import { toggleSidebar, togglePdf, toggleTerminal, resetLayout } from '../store/uiSlice';
import CompileSettingsDropdown from './CompileSettingsDropdown';
import type { Project } from '../types';

interface EditorHeaderProps {
  project: Project;
  onCompile: () => void;
  onCleanBuild: () => void;
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
    <div ref={ref} className="absolute top-full left-0 mt-1 z-50 border rounded-lg shadow-xl py-1 min-w-[220px]" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}>
      {items.map((item, i) => {
        if (item.divider) return <div key={i} className="my-1" style={{ borderTop: '1px solid var(--color-border)' }} />;
        return (
          <button
            key={i}
            onClick={() => { item.action?.(); onClose(); }}
            disabled={item.disabled}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && <span className="text-xs font-mono" style={{ color: 'var(--color-text-disabled)' }}>{item.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function EditorHeader({
  project, onCompile, onCleanBuild, onBack, onToggleComments, onToggleHistory, onToggleShare,
  onSave, onNewFile, onNewFolder, onDownloadPdf, onDownloadSource,
  onOpenSearch, onOpenCommandPalette,
}: EditorHeaderProps) {
  const dispatch = useAppDispatch();
  const { compiling, compileStatus } = useAppSelector(state => state.editor);
  const { filesOpen: sidebarOpen, pdfOpen: pdfVisible } = useAppSelector(state => state.ui);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showCompileDropdown, setShowCompileDropdown] = useState(false);
  const compileDropdownRef = useRef<HTMLDivElement>(null);

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
    { label: sidebarOpen ? 'Hide File Explorer' : 'Show File Explorer', icon: sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />, action: () => dispatch(toggleSidebar()), shortcut: 'Ctrl+Shift+B' },
    { label: pdfVisible ? 'Hide PDF' : 'Show PDF', icon: pdfVisible ? <EyeOff size={14} /> : <Eye size={14} />, action: () => dispatch(togglePdf()), shortcut: 'Ctrl+B' },
    { label: 'Toggle Terminal', icon: <Terminal size={14} />, action: () => dispatch(toggleTerminal()), shortcut: 'Ctrl+`' },
    { divider: true },
    { label: 'Search', icon: <Search size={14} />, action: onOpenSearch, shortcut: 'Ctrl+Shift+F' },
    { label: 'Command Palette', icon: <Command size={14} />, action: onOpenCommandPalette, shortcut: 'Ctrl+K' },
    { divider: true },
    { label: 'Reset Layout', icon: <LayoutTemplate size={14} />, action: () => dispatch(resetLayout()) },
  ];

  const formatMenu: MenuItem[] = [
    { label: 'Bold', icon: <Bold size={14} />, shortcut: 'Ctrl+B' },
    { label: 'Italic', icon: <Italic size={14} />, shortcut: 'Ctrl+I' },
    { divider: true },
    { label: 'Bullet List', icon: <List size={14} /> },
    { label: 'Numbered List', icon: <ListOrdered size={14} /> },
    { divider: true },
    { label: 'Table', icon: <Table2 size={14} /> },
    { label: 'Link', icon: <Link2 size={14} /> },
  ];

  const toolsMenu: MenuItem[] = [
    { label: compiling ? 'Compiling...' : 'Compile', icon: <Play size={14} />, action: onCompile, shortcut: 'Ctrl+Enter', disabled: compiling },
    { label: 'Clean Build', icon: <Bug size={14} />, action: onCleanBuild },
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
    File: fileMenu, Edit: editMenu, Insert: insertMenu, Format: formatMenu, View: viewMenu, Tools: toolsMenu, Help: helpMenu,
  };

  return (
    <header className="h-11 flex items-center px-3 gap-1" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-1.5 mr-3">
        <BrandLogo alt="TexFlow" className="w-5 h-5 object-contain" />
        <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>TexFlow</span>
      </div>

      <nav className="flex items-center gap-0">
        {Object.keys(menus).map(menuName => (
          <div key={menuName} className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === menuName ? null : menuName)}
              onMouseEnter={() => activeMenu && setActiveMenu(menuName)}
              className="px-2.5 py-1 text-xs font-medium rounded transition-colors"
              style={{
                background: activeMenu === menuName ? 'var(--color-accent-soft)' : 'transparent',
                color: activeMenu === menuName ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
              onMouseOver={e => { if (activeMenu !== menuName) e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
              onMouseOut={e => { if (activeMenu !== menuName) e.currentTarget.style.background = 'transparent'; }}
            >
              {menuName}
            </button>
            {activeMenu === menuName && <MenuDropdown items={menus[menuName]} onClose={closeMenu} />}
          </div>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        {/* Project name */}
        <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded cursor-pointer transition-colors hover:bg-[var(--color-surface-elevated)]" style={{ color: 'var(--color-text-primary)' }}>
          {project.name}
          <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
        </div>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />

        <button onClick={onOpenSearch} className="p-1.5 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }} title="Search (Ctrl+Shift+F)"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <Search size={14} />
        </button>
        <button onClick={onOpenCommandPalette} className="p-1.5 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }} title="Command Palette (Ctrl+K)"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <Command size={14} />
        </button>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />

        <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />

        <button onClick={onToggleShare} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded transition-all" style={{ background: 'var(--color-accent)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)'; }}
          title="Share"
        >
          <Share2 size={12} />
          Share
        </button>

        <div className="relative" ref={compileDropdownRef}>
          <div className="flex items-center">
            <button
              onClick={onCompile}
              disabled={compiling}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-l transition-all disabled:opacity-50"
              style={{ background: compiling ? 'var(--color-border)' : 'var(--color-accent)' }}
              onMouseEnter={e => { if (!compiling) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
              onMouseLeave={e => { if (!compiling) e.currentTarget.style.background = 'var(--color-accent)'; }}
              title="Recompile (Ctrl+Enter)"
            >
              {compiling ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> : <Play size={11} />}
              {compiling ? 'Compiling...' : 'Recompile'}
            </button>
            <button
              onClick={() => setShowCompileDropdown(p => !p)}
              className="flex items-center justify-center px-1.5 py-1.5 text-white rounded-r transition-all border-l"
              style={{
                background: compiling ? 'var(--color-border)' : 'var(--color-accent)',
                borderColor: 'rgba(255,255,255,0.2)',
              }}
              onMouseEnter={e => { if (!compiling) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
              onMouseLeave={e => { if (!compiling) e.currentTarget.style.background = 'var(--color-accent)'; }}
              title="Compilation settings"
            >
              <ChevronDown size={12} />
            </button>
          </div>
          {showCompileDropdown && (
            <CompileSettingsDropdown
              onClose={() => setShowCompileDropdown(false)}
              onCleanBuild={onCleanBuild}
            />
          )}
        </div>
      </div>
    </header>
  );
}
