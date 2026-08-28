import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, PanelLeftClose, PanelLeftOpen, Users, Share2, History, MessageSquare,
  Search, Command, ChevronDown, FileText, FolderOpen, Upload, Save, Download, Settings,
  Undo, Redo, Scissors, Copy, ClipboardPaste, Replace, Type, Bold, Italic,
  List, ListOrdered, Table2, Link2, Image as ImageIcon, FileCode2,
  Eye, EyeOff, Terminal, LayoutTemplate,
  BookOpen, Bug, Mail, Home,
} from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import BrandLogo from './BrandLogo';
import { toggleSidebar, togglePdf, toggleTerminal, resetLayout } from '../store/uiSlice';
import CompileSettingsDropdown from './CompileSettingsDropdown';
import type { Project } from '../types';

interface EditorHeaderProps {
  project: Project;
  onCompile: () => void;
  onCleanBuild: () => void;
  onStopCompilation: () => void;
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
  project, onCompile, onCleanBuild, onStopCompilation, onBack, onToggleComments, onToggleHistory, onToggleShare,
  onSave, onNewFile, onNewFolder, onDownloadPdf, onDownloadSource,
  onOpenSearch, onOpenCommandPalette,
}: EditorHeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { compiling, compileStatus } = useAppSelector(state => state.editor);
  const { filesOpen: sidebarOpen, pdfOpen: pdfVisible } = useAppSelector(state => state.ui);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showCompileDropdown, setShowCompileDropdown] = useState(false);
  const compileDropdownRef = useRef<HTMLDivElement>(null);
  const [logoHovered, setLogoHovered] = useState(false);

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
    { label: 'Documentation', icon: <BookOpen size={14} />, action: () => navigate('/documentation') },
    { label: 'Contact Us', icon: <Mail size={14} />, action: () => navigate('/contact') },
    { label: 'Blog', icon: <FileText size={14} />, action: () => navigate('/blog') },
  ];

  const menus: Record<string, MenuItem[]> = {
    File: fileMenu, Edit: editMenu, Insert: insertMenu, Format: formatMenu, View: viewMenu, Tools: toolsMenu, Help: helpMenu,
  };

  return (
    <header className="h-11 flex items-center px-3 gap-1 relative z-50" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-1 mr-2">
        {/* Logo + brand name — never changes */}
        <button onClick={onBack} className="flex items-center gap-1.5 rounded px-1.5 py-1 transition-colors hover:bg-[var(--color-surface-elevated)]" aria-label="Go to dashboard">
          <BrandLogo alt="TexFlow" className="w-5 h-5 object-contain" />
          <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>TexFlow</span>
        </button>

        {/* Separate Home icon — appears on hover */}
        <div
          className="relative"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          <button
            onClick={onBack}
            className={clsx('rounded p-1.5 transition-all duration-200', logoHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-1 pointer-events-none')}
            style={{ color: 'var(--color-text-muted)', background: 'transparent', border: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            aria-label="Back to dashboard"
          >
            <Home size={15} />
          </button>
        </div>
      </div>

      <nav className="flex items-center gap-0 relative z-50">
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

        <button onClick={onToggleShare} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded transition-all" style={{ background: 'var(--color-accent)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)'; }}
          title="Share"
        >
          <Share2 size={12} />
          Share
        </button>

        <div className="relative z-50" ref={compileDropdownRef}>
          <div className="inline-flex items-stretch overflow-hidden rounded-md border shadow-sm" style={{ borderColor: 'rgba(255,255,255,0.22)', background: 'var(--color-accent)' }}>
            <button
              onClick={onCompile}
              disabled={compiling}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-60"
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
              className="flex items-center justify-center px-2 py-1.5 text-white transition-colors border-l border-white/25 hover:bg-white/10 focus-visible:bg-white/15"
              style={{
                background: compiling ? 'var(--color-border)' : 'var(--color-accent)',
                borderColor: 'rgba(255,255,255,0.2)',
              }}
              onMouseEnter={e => { if (!compiling) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
              onMouseLeave={e => { if (!compiling) e.currentTarget.style.background = 'var(--color-accent)'; }}
              title="Compilation settings"
              aria-label="Compilation options"
              aria-haspopup="menu"
              aria-expanded={showCompileDropdown}
            >
              <ChevronDown size={12} />
            </button>
          </div>
          {showCompileDropdown && (
            <CompileSettingsDropdown
              onClose={() => setShowCompileDropdown(false)}
              onCleanBuild={onCleanBuild}
              onStopCompilation={onStopCompilation}
              compiling={compiling}
              containerRef={compileDropdownRef}
            />
          )}
        </div>
      </div>
    </header>
  );
}
