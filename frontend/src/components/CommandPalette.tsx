import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Save, Share2, History, FileText, FolderPlus, Download, Palette, Search } from 'lucide-react';

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
  onOpenTheme: () => void;
}

const commands = [
  { id: 'compile', label: 'Compile Document', icon: <Play size={14} />, shortcut: 'Ctrl+Enter' },
  { id: 'save', label: 'Save File', icon: <Save size={14} />, shortcut: 'Ctrl+S' },
  { id: 'share', label: 'Share Project', icon: <Share2 size={14} /> },
  { id: 'history', label: 'Version History', icon: <History size={14} /> },
  { id: 'new-file', label: 'New File', icon: <FileText size={14} />, shortcut: 'Ctrl+N' },
  { id: 'new-folder', label: 'New Folder', icon: <FolderPlus size={14} /> },
  { id: 'download-pdf', label: 'Download PDF', icon: <Download size={14} /> },
  { id: 'download-source', label: 'Download Source', icon: <Download size={14} /> },
  { id: 'theme', label: 'Change Theme', icon: <Palette size={14} /> },
];

export default function CommandPalette({
  onClose, onCompile, onSave, onToggleShare, onToggleHistory,
  onNewFile, onNewFolder, onDownloadPdf, onDownloadProject, onOpenTheme,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const actionMap: Record<string, () => void> = {
    compile: onCompile, save: onSave, share: onToggleShare, history: onToggleHistory,
    'new-file': onNewFile, 'new-folder': onNewFolder, 'download-pdf': onDownloadPdf,
    'download-source': onDownloadProject, theme: onOpenTheme,
  };

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      const cmd = filtered[selectedIndex];
      actionMap[cmd.id]?.();
      onClose();
    }
  }, [filtered, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Type a command..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--color-text-primary)' }} />
          <button onClick={onClose} className="p-1" style={{ color: 'var(--color-text-muted)' }}><X size={14} /></button>
        </div>
        <div className="max-h-[300px] overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <button key={cmd.id} onClick={() => { actionMap[cmd.id]?.(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
              style={{ background: i === selectedIndex ? 'var(--color-surface-elevated)' : 'transparent', color: 'var(--color-text-primary)' }}
              onMouseEnter={() => setSelectedIndex(i)}>
              <span style={{ color: 'var(--color-text-muted)' }}>{cmd.icon}</span>
              <span className="flex-1 text-left">{cmd.label}</span>
              {cmd.shortcut && <kbd className="text-[10px] px-1.5 py-0.5 rounded border" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>{cmd.shortcut}</kbd>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
