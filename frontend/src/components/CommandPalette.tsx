import { useState, useEffect } from 'react';
import { Search, FilePlus, FolderPlus, Play, Save, Download, Eye, Share2, History, Settings, X, Command, Zap, ZapOff, PanelLeftOpen, Terminal, LayoutTemplate } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAutoCompile } from '../store/editorSlice';
import { toggleSidebar, togglePdf, toggleTerminal, resetLayout } from '../store/uiSlice';

interface CommandPaletteProps {
  onClose: () => void;
  onCompile: () => void;
  onSave: () => void;
  onToggleShare: () => void;
  onToggleHistory: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onDownloadPdf: () => void;
  onDownloadProject: () => void;
}

export default function CommandPalette({ onClose, onCompile, onSave, onToggleShare, onToggleHistory, onNewFile, onNewFolder, onDownloadPdf, onDownloadProject }: CommandPaletteProps) {
  const dispatch = useAppDispatch();
  const { autoCompile } = useAppSelector(state => state.editor);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { icon: Play, label: 'Compile', action: onCompile, shortcut: 'Ctrl+Enter' },
    { icon: Save, label: 'Save', action: onSave, shortcut: 'Ctrl+S' },
    { icon: autoCompile ? Zap : ZapOff, label: `Auto Compile: ${autoCompile ? 'ON' : 'OFF'}`, action: () => dispatch(setAutoCompile(!autoCompile)) },
    { icon: FilePlus, label: 'New File', action: onNewFile },
    { icon: FolderPlus, label: 'New Folder', action: onNewFolder },
    { icon: Eye, label: 'Toggle PDF Preview', action: () => dispatch(togglePdf()), shortcut: 'Ctrl+B' },
    { icon: PanelLeftOpen, label: 'Toggle Files Sidebar', action: () => dispatch(toggleSidebar()), shortcut: 'Ctrl+Shift+B' },
    { icon: Terminal, label: 'Toggle Terminal', action: () => dispatch(toggleTerminal()), shortcut: 'Ctrl+`' },
    { icon: Download, label: 'Download PDF', action: onDownloadPdf },
    { icon: Download, label: 'Download Source', action: onDownloadProject },
    { icon: Share2, label: 'Share Project', action: onToggleShare },
    { icon: History, label: 'Version History', action: onToggleHistory },
    { icon: LayoutTemplate, label: 'Reset Layout', action: () => dispatch(resetLayout()) },
    { icon: Settings, label: 'Settings', action: () => window.location.href = '/settings' },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && filtered[selectedIndex]) { filtered[selectedIndex].action(); onClose(); }
    else if (e.key === 'Escape') { onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Command size={16} style={{ color: 'var(--color-accent)' }} />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a command..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--color-text-primary)' }} />
          <button onClick={onClose} className="p-1 rounded transition-colors hover:bg-[var(--color-surface-secondary)]" style={{ color: 'var(--color-text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        <div className="max-h-72 overflow-auto py-1">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.label}
              onClick={() => { cmd.action(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
              style={{
                background: i === selectedIndex ? 'var(--color-accent-soft)' : 'transparent',
                color: 'var(--color-text-primary)',
              }}
              onMouseEnter={(e) => { if (i !== selectedIndex) e.currentTarget.style.background = 'var(--color-surface-secondary)'; }}
              onMouseLeave={(e) => { if (i !== selectedIndex) e.currentTarget.style.background = 'transparent'; }}
            >
              <cmd.icon size={16} style={{ color: 'var(--color-accent)' }} className="flex-shrink-0" />
              <span className="text-sm flex-1">{cmd.label}</span>
              {cmd.shortcut && <span className="text-xs font-mono" style={{ color: 'var(--color-text-disabled)' }}>{cmd.shortcut}</span>}
            </button>
          ))}
          {filtered.length === 0 && <p className="text-sm p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>No commands found</p>}
        </div>
      </div>
    </div>
  );
}
