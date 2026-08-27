import { useState } from 'react';
import { Search, X, FileText, ArrowRight } from 'lucide-react';
import { useAppSelector } from '../store/hooks';

interface SearchPanelProps {
  onClose: () => void;
  onNavigateToFile: (fileId: string, line?: number) => void;
}

export default function SearchPanel({ onClose, onNavigateToFile }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ file: string; line: number; text: string; fileId: string }[]>([]);
  const { files } = useAppSelector(state => state.project);

  const handleSearch = () => {
    if (!query.trim()) { setResults([]); return; }
    const found: typeof results = [];
    const q = query.toLowerCase();
    for (const file of files) {
      if (file.type === 'file' && file.content) {
        const lines = file.content.split('\n');
        lines.forEach((line, i) => {
          if (line.toLowerCase().includes(q)) {
            found.push({ file: file.name, line: i + 1, text: line.trim(), fileId: file.id });
          }
        });
      }
    }
    setResults(found);
  };

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 border border-texflow-800 rounded-xl shadow-2xl overflow-hidden" style={{ background: 'var(--color-background)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-texflow-800">
        <Search size={16} className="text-texflow-400" />
        <input autoFocus value={query} onChange={e => { setQuery(e.target.value); handleSearch(); }} placeholder="Search in project... (Ctrl+Shift+F)" className="flex-1 bg-transparent text-sm text-texflow-900 outline-none placeholder-texflow-500" />
        <button onClick={onClose} className="p-1 text-texflow-600 hover:text-texflow-900"><X size={16} /></button>
      </div>
      <div className="max-h-80 overflow-auto">
        {results.length === 0 && query && <p className="text-sm text-texflow-500 p-4 text-center">No results found</p>}
        {results.map((r, i) => (
          <button key={i} onClick={() => { onNavigateToFile(r.fileId, r.line); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-texflow-200 transition-colors text-left">
            <FileText size={14} className="text-texflow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-texflow-600">{r.file}:{r.line}</p>
              <p className="text-sm text-texflow-700 truncate">{r.text}</p>
            </div>
            <ArrowRight size={14} className="text-texflow-500 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
