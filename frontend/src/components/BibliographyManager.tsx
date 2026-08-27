import { useState, useEffect } from 'react';
import { X, BookOpen, Search, Plus, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface BibliographyManagerProps {
  onInsert: (citeKey: string) => void;
  onClose: () => void;
}

interface BibEntry { key: string; type: string; title: string; author: string; year: string; }

export default function BibliographyManager({ onInsert, onClose }: BibliographyManagerProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [entries, setEntries] = useState<BibEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newType, setNewType] = useState('article');
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newYear, setNewYear] = useState('');

  useEffect(() => {
    if (!projectId) return;
    const token = localStorage.getItem('token');
    fetch(`/api/files/project/${projectId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json()).then(data => {
      const bibFile = (data.files || []).find((f: any) => f.name.endsWith('.bib'));
      if (bibFile?.content) {
        const parsed = parseBibTeX(bibFile.content);
        setEntries(parsed);
      }
    }).catch(() => {});
  }, [projectId]);

  const parseBibTeX = (content: string): BibEntry[] => {
    const entries: BibEntry[] = [];
    const regex = /@(\w+)\{([^,]+),\s*([\s\S]*?)\}/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const fields = match[3];
      const title = fields.match(/title\s*=\s*\{([^}]+)\}/)?.[1] || '';
      const author = fields.match(/author\s*=\s*\{([^}]+)\}/)?.[1] || '';
      const year = fields.match(/year\s*=\s*\{?(\d+)\}?/)?.[1] || '';
      entries.push({ key: match[2].trim(), type: match[1], title, author, year });
    }
    return entries;
  };

  const filtered = entries.filter(e => {
    const q = searchQuery.toLowerCase();
    return e.key.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.author.toLowerCase().includes(q);
  });

  const handleAddEntry = () => {
    if (!newKey.trim() || !newTitle.trim()) return;
    setEntries(prev => [...prev, { key: newKey, type: newType, title: newTitle, author: newAuthor, year: newYear }]);
    setNewKey(''); setNewTitle(''); setNewAuthor(''); setNewYear(''); setShowAdd(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative border border-texflow-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4" style={{ background: 'var(--color-background)' }}>
        <div className="flex items-center justify-between p-4 border-b border-texflow-800">
          <div className="flex items-center gap-2"><BookOpen size={18} className="text-texflow-400" /><h2 className="text-lg font-semibold text-texflow-900">Bibliography</h2></div>
          <button onClick={onClose} className="p-1 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-texflow-500" size={14} /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search references..." className="input-field w-full pl-8 text-sm" /></div>
            <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm flex items-center gap-1"><Plus size={14} /> Add</button>
          </div>

          {showAdd && (
            <div className="p-3 rounded-lg border border-texflow-800 space-y-2" style={{ background: 'color-mix(in srgb, var(--color-surface) 65%, transparent)' }}>
              <div className="flex gap-2"><input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Citation key" className="input-field flex-1 text-sm" /><select value={newType} onChange={e => setNewType(e.target.value)} className="input-field text-sm"><option value="article">Article</option><option value="book">Book</option><option value="inproceedings">Conference</option><option value="misc">Misc</option></select></div>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" className="input-field w-full text-sm" />
              <div className="flex gap-2"><input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Author" className="input-field flex-1 text-sm" /><input value={newYear} onChange={e => setNewYear(e.target.value)} placeholder="Year" className="input-field w-24 text-sm" /></div>
              <button onClick={handleAddEntry} className="btn-primary text-xs w-full">Add Entry</button>
            </div>
          )}

          <div className="max-h-64 overflow-auto space-y-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-texflow-500 text-center py-4">No bibliography entries found</p>
            ) : filtered.map(entry => (
              <div key={entry.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-texflow-200 transition-colors group">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-texflow-900 truncate">{entry.title || entry.key}</p>
                  <p className="text-xs text-texflow-600">{entry.author} {entry.year && `(${entry.year})`} · <span className="text-texflow-400">{entry.key}</span></p>
                </div>
                <button onClick={() => { onInsert(entry.key); onClose(); }} className="opacity-0 group-hover:opacity-100 btn-primary text-xs px-2 py-1">Cite</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
