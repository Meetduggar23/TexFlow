import { useState, useEffect } from 'react';
import { Search, FilePlus, FolderPlus, Play, Save, Download, Eye, Share2, History, Settings, X, Command } from 'lucide-react';

interface CommandPaletteProps {
  onClose: () => void;
  onCompile: () => void;
  onSave: () => void;
  onTogglePdf: () => void;
  onToggleShare: () => void;
  onToggleHistory: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onDownloadPdf: () => void;
  onDownloadProject: () => void;
}

export default function CommandPalette({ onClose, onCompile, onSave, onTogglePdf, onToggleShare, onToggleHistory, onNewFile, onNewFolder, onDownloadPdf, onDownloadProject }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { icon: FilePlus, label: 'New File', action: onNewFile },
    { icon: FolderPlus, label: 'New Folder', action: onNewFolder },
    { icon: Play, label: 'Compile', action: onCompile, shortcut: 'Ctrl+Enter' },
    { icon: Save, label: 'Save', action: onSave, shortcut: 'Ctrl+S' },
    { icon: Eye, label: 'Toggle PDF', action: onTogglePdf },
    { icon: Download, label: 'Download PDF', action: onDownloadPdf },
    { icon: Download, label: 'Download Project', action: onDownloadProject },
    { icon: Share2, label: 'Share Project', action: onToggleShare },
    { icon: History, label: 'Version History', action: onToggleHistory },
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
      <div className="relative w-full max-w-lg border border-texflow-800 rounded-xl shadow-2xl overflow-hidden" style={{ background: '#FBEFEF' }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-texflow-800">
          <Command size={16} className="text-texflow-400" />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a command..." className="flex-1 bg-transparent text-sm text-texflow-900 outline-none placeholder-texflow-500" />
          <button onClick={onClose} className="p-1 text-texflow-600 hover:text-texflow-900"><X size={16} /></button>
        </div>
        <div className="max-h-72 overflow-auto py-1">
          {filtered.map((cmd, i) => (
            <button key={cmd.label} onClick={() => { cmd.action(); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${i === selectedIndex ? 'bg-dark-700' : 'hover:bg-texflow-200/50'}`}>
              <cmd.icon size={16} className="text-texflow-400 flex-shrink-0" />
              <span className="text-sm text-texflow-900 flex-1">{cmd.label}</span>
              {cmd.shortcut && <span className="text-xs text-texflow-500 font-mono">{cmd.shortcut}</span>}
            </button>
          ))}
          {filtered.length === 0 && <p className="text-sm text-texflow-500 p-4 text-center">No commands found</p>}
        </div>
      </div>
    </div>
  );
}
