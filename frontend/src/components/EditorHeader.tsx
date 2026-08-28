import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Users, Share2, History, MessageSquare,
  Search, Command, ChevronDown, FileText, FolderOpen, Upload, Save, Download, Settings,
  Undo, Redo, Scissors, Copy, ClipboardPaste, Replace, Type, Bold, Italic,
  List, ListOrdered, Table2, Link2, Image as ImageIcon, FileCode2,
  Eye, EyeOff, Terminal, LayoutTemplate,
  BookOpen, Bug, Mail, Home,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import BrandLogo from './BrandLogo';
import { toggleSidebar, togglePdf, toggleTerminal, resetLayout } from '../store/uiSlice';
import CompileSettingsDropdown from './CompileSettingsDropdown';
import type { Project } from '../types';

/** Logo that morphs into Home icon on hover */
function LogoHomeButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-center rounded-md transition-colors"
      style={{ width: 32, height: 32 }}
      title=""
      aria-label="Go to Dashboard"
    >
      {/* Logo layer */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-200"
        style={{
          opacity: hovered ? 0 : 1,
          transform: hovered ? 'scale(0.8)' : 'scale(1)',
          filter: hovered ? 'blur(4px)' : 'blur(0)',
          pointerEvents: 'none',
        }}
      >
        <BrandLogo alt="TexFlow" className="w-6 h-6 object-contain" />
      </span>
      {/* Home icon layer */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-200"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scale(1)' : 'scale(0.8)',
          filter: hovered ? 'blur(0)' : 'blur(4px)',
          pointerEvents: hovered ? 'auto' : 'none',
          color: 'var(--color-text-primary)',
        }}
      >
        <Home size={18} />
      </span>
    </button>
  );
}

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
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      className="absolute top-full left-0 mt-0.5 z-50 border rounded-lg shadow-xl py-1 min-w-[220px]"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}
    >
      {items.map((item, i) => {
        if (item.divider) return <div key={i} className="my-1 mx-2" style={{ borderTop: '1px solid var(--color-border)' }} />;
        return (
          <button
            key={i}
            role="menuitem"
            onClick={() => { item.action?.(); onClose(); }}
            disabled={item.disabled}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <span className="text-[11px] font-mono ml-4" style={{ color: 'var(--color-text-disabled)' }}>
                {item.shortcut}
              </span>
            )}
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
  const { filesOpen, pdfOpen, terminalOpen } = useAppSelector(state => state.ui);
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

  const viewMenu: MenuItem[] = [
    { label: filesOpen ? 'Hide File Explorer' : 'Show File Explorer', icon: filesOpen ? <EyeOff size={14} /> : <Eye size={14} />, action: () => dispatch(toggleSidebar()), shortcut: 'Ctrl+Shift+B' },
    { label: pdfOpen ? 'Hide PDF' : 'Show PDF', icon: pdfOpen ? <EyeOff size={14} /> : <Eye size={14} />, action: () => dispatch(togglePdf()), shortcut: 'Ctrl+B' },
    { label: terminalOpen ? 'Hide Terminal' : 'Show Terminal', icon: <Terminal size={14} />, action: () => dispatch(toggleTerminal()), shortcut: 'Ctrl+`' },
    { divider: true },
    { label: 'Search', icon: <Search size={14} />, action: onOpenSearch, shortcut: 'Ctrl+Shift+F' },
    { label: 'Command Palette', icon: <Command size={14} />, action: onOpenCommandPalette, shortcut: 'Ctrl+K' },
    { divider: true },
    { label: 'Reset Layout', icon: <LayoutTemplate size={14} />, action: () => dispatch(resetLayout()) },
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
    <header
      className="flex items-center px-2 gap-0 relative z-50 select-none"
      style={{
        height: 44,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* ── Left: Logo→Home + Menu bar ── */}
      <div className="flex items-center gap-1">
        <LogoHomeButton onClick={onBack} />

        <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />

        {/* Menu bar */}
        <nav className="flex items-center gap-0 relative z-50">
          {Object.keys(menus).map(menuName => (
            <div key={menuName} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === menuName ? null : menuName)}
                onMouseEnter={() => activeMenu && setActiveMenu(menuName)}
                className="px-2.5 py-1 text-[13px] rounded transition-colors"
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
      </div>

      {/* ── Center: Project name ── */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium truncate max-w-[300px]"
          style={{ color: 'var(--color-text-primary)' }}
          title={project.name}
        >
          <span className="truncate">{project.name}</span>
        </div>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleHistory}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          title="History"
          aria-label="History"
        >
          <History size={15} />
        </button>

        <button
          onClick={onToggleComments}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          title="Comments"
          aria-label="Comments"
        >
          <MessageSquare size={15} />
        </button>

        <button
          onClick={onOpenSearch}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          title="Search (Ctrl+F)"
          aria-label="Search"
        >
          <Search size={15} />
        </button>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />

        {/* Share button */}
        <button
          onClick={onToggleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-all"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          title="Share"
          aria-label="Share project"
        >
          <Share2 size={13} />
          Share
        </button>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />

        {/* Recompile button group */}
        <div className="relative z-50" ref={compileDropdownRef}>
          <div className="inline-flex items-stretch overflow-hidden rounded-md" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
            <button
              onClick={onCompile}
              disabled={compiling}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-white transition-colors disabled:opacity-60"
              style={{ background: 'var(--color-accent)' }}
              onMouseEnter={e => { if (!compiling) e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              title="Recompile (Ctrl+Enter)"
              aria-label="Recompile"
            >
              {compiling ? (
                <div className="animate-spin rounded-full h-3 w-3 border-[1.5px] border-white border-t-transparent" />
              ) : (
                <Play size={12} />
              )}
              {compiling ? 'Compiling...' : 'Recompile'}
            </button>
            <button
              onClick={() => setShowCompileDropdown(p => !p)}
              className="flex items-center justify-center px-2 py-1.5 text-white transition-colors border-l"
              style={{
                background: 'var(--color-accent)',
                borderColor: 'rgba(255,255,255,0.2)',
              }}
              onMouseEnter={e => { if (!compiling) e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
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
