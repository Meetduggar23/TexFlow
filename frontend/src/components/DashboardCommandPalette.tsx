import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FolderOpen, Star, Users, Archive, Trash2, Settings, FileText, Command, ArrowRight } from 'lucide-react';
import { useAppSelector } from '../store/hooks';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  section: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewProject: () => void;
}

export default function CommandPalette({ isOpen, onClose, onNewProject }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { projects } = useAppSelector(state => state.project);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(() => [
    { id: 'new-project', label: 'Create New Project', icon: <Plus size={16} />, shortcut: 'Ctrl+N', action: () => { onNewProject(); onClose(); }, section: 'Actions' },
    { id: 'dashboard', label: 'Go to Dashboard', icon: <FolderOpen size={16} />, action: () => { navigate('/dashboard'); onClose(); }, section: 'Navigation' },
    { id: 'starred', label: 'Show Starred Projects', icon: <Star size={16} />, action: () => { navigate('/dashboard?filter=starred'); onClose(); }, section: 'Navigation' },
    { id: 'shared', label: 'Show Shared Projects', icon: <Users size={16} />, action: () => { navigate('/dashboard/shared'); onClose(); }, section: 'Navigation' },
    { id: 'archived', label: 'Show Archived Projects', icon: <Archive size={16} />, action: () => { navigate('/dashboard/archived'); onClose(); }, section: 'Navigation' },
    { id: 'trash', label: 'Open Trash', icon: <Trash2 size={16} />, action: () => { navigate('/dashboard/trash'); onClose(); }, section: 'Navigation' },
    { id: 'settings', label: 'Open Settings', icon: <Settings size={16} />, action: () => { navigate('/settings'); onClose(); }, section: 'Navigation' },
    { id: 'templates', label: 'Browse Templates', icon: <FileText size={16} />, action: () => { navigate('/templates'); onClose(); }, section: 'Navigation' },
    ...projects.filter(p => !p.deletedAt && !p.isArchived).slice(0, 20).map(p => ({
      id: `project-${p.id}`,
      label: p.name,
      icon: <FolderOpen size={16} />,
      action: () => { navigate(`/project/${p.id}`); onClose(); },
      section: 'Projects',
    })),
  ], [projects, navigate, onNewProject, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[selectedIndex]) { filtered[selectedIndex].action(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  useEffect(() => {
    const selected = listRef.current?.children[selectedIndex] as HTMLElement;
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  const sections = [...new Set(filtered.map(c => c.section))];

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects, commands..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No results found</p>
            </div>
          ) : (
            sections.map(section => {
              const items = filtered.filter(c => c.section === section);
              const sectionStartIndex = filtered.indexOf(items[0]);
              return (
                <div key={section}>
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{section}</div>
                  {items.map((cmd, i) => {
                    const globalIndex = sectionStartIndex + i;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                        style={{
                          background: globalIndex === selectedIndex ? 'var(--color-surface-elevated)' : 'transparent',
                          color: 'var(--color-text-primary)',
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <span style={{ color: 'var(--color-text-muted)' }}>{cmd.icon}</span>
                        <span className="flex-1 text-left">{cmd.label}</span>
                        {cmd.shortcut && (
                          <kbd className="text-[10px] px-1.5 py-0.5 rounded border" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>{cmd.shortcut}</kbd>
                        )}
                        <ArrowRight size={12} style={{ color: 'var(--color-text-muted)' }} />
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
