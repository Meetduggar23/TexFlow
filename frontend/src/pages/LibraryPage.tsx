import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, X, BookOpen, FileText, ArrowRight, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDialog } from '../components/DialogProvider';

const LIB_KEY = 'texflow-library';

interface LibEntry {
  id: string;
  key: string;
  type: string;
  title: string;
  author: string;
  year: string;
  journal?: string;
  volume?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  note?: string;
}

function loadLibrary(): LibEntry[] {
  try { return JSON.parse(localStorage.getItem(LIB_KEY) || '[]'); } catch { return []; }
}

function saveLibrary(entries: LibEntry[]) {
  localStorage.setItem(LIB_KEY, JSON.stringify(entries));
}

const ENTRY_TYPES = [
  { value: 'article', label: 'Article' },
  { value: 'book', label: 'Book' },
  { value: 'inproceedings', label: 'Conference' },
  { value: 'incollection', label: 'Collection' },
  { value: 'phdthesis', label: 'PhD Thesis' },
  { value: 'mastersthesis', label: 'Masters Thesis' },
  { value: 'techreport', label: 'Tech Report' },
  { value: 'misc', label: 'Miscellaneous' },
  { value: 'unpublished', label: 'Unpublished' },
  { value: 'inbook', label: 'Book Chapter' },
  { value: 'proceedings', label: 'Proceedings' },
];

function toBibTeX(e: LibEntry): string {
  let fields = '';
  if (e.author) fields += `  author = {${e.author}},\n`;
  if (e.title) fields += `  title = {${e.title}},\n`;
  if (e.year) fields += `  year = {${e.year}},\n`;
  if (e.journal) fields += `  journal = {${e.journal}},\n`;
  if (e.volume) fields += `  volume = {${e.volume}},\n`;
  if (e.pages) fields += `  pages = {${e.pages}},\n`;
  if (e.publisher) fields += `  publisher = {${e.publisher}},\n`;
  if (e.doi) fields += `  doi = {${e.doi}},\n`;
  if (e.url) fields += `  url = {${e.url}},\n`;
  if (e.note) fields += `  note = {${e.note}},\n`;
  return `@${e.type}{${e.key},\n${fields}}`;
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const { confirm } = useDialog();
  const [entries, setEntries] = useState<LibEntry[]>(loadLibrary);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState<LibEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formType, setFormType] = useState('article');
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formJournal, setFormJournal] = useState('');
  const [formVolume, setFormVolume] = useState('');
  const [formPages, setFormPages] = useState('');
  const [formPublisher, setFormPublisher] = useState('');
  const [formDoi, setFormDoi] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formNote, setFormNote] = useState('');

  useEffect(() => { saveLibrary(entries); }, [entries]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(e => e.key.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.author.toLowerCase().includes(q) || (e.journal && e.journal.toLowerCase().includes(q)));
  }, [entries, searchQuery]);

  const resetForm = () => {
    setFormKey(''); setFormType('article'); setFormTitle(''); setFormAuthor('');
    setFormYear(''); setFormJournal(''); setFormVolume(''); setFormPages('');
    setFormPublisher(''); setFormDoi(''); setFormUrl(''); setFormNote('');
  };

  const handleAdd = () => {
    if (!formKey.trim() || !formTitle.trim()) { toast.error('Citation key and title are required'); return; }
    if (entries.some(e => e.key === formKey.trim())) { toast.error('Citation key already exists'); return; }
    const newEntry: LibEntry = {
      id: Date.now().toString(),
      key: formKey.trim(),
      type: formType,
      title: formTitle.trim(),
      author: formAuthor.trim(),
      year: formYear.trim(),
      journal: formJournal.trim() || undefined,
      volume: formVolume.trim() || undefined,
      pages: formPages.trim() || undefined,
      publisher: formPublisher.trim() || undefined,
      doi: formDoi.trim() || undefined,
      url: formUrl.trim() || undefined,
      note: formNote.trim() || undefined,
    };
    if (editEntry) {
      setEntries(prev => prev.map(e => e.id === editEntry.id ? newEntry : e));
      toast.success('Reference updated');
    } else {
      setEntries(prev => [...prev, newEntry]);
      toast.success('Reference added');
    }
    resetForm();
    setShowAdd(false);
    setEditEntry(null);
  };

  const handleEdit = (entry: LibEntry) => {
    setFormKey(entry.key); setFormType(entry.type); setFormTitle(entry.title);
    setFormAuthor(entry.author); setFormYear(entry.year); setFormJournal(entry.journal || '');
    setFormVolume(entry.volume || ''); setFormPages(entry.pages || ''); setFormPublisher(entry.publisher || '');
    setFormDoi(entry.doi || ''); setFormUrl(entry.url || ''); setFormNote(entry.note || '');
    setEditEntry(entry);
    setShowAdd(true);
  };

  const handleDelete = async (id: string, key: string) => {
    if (await confirm({ title: 'Delete Reference?', message: `Remove "${key}" from your library?`, confirmText: 'Delete', danger: true })) {
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Reference deleted');
    }
  };

  const handleCopyBibTeX = (entry: LibEntry) => {
    navigator.clipboard.writeText(toBibTeX(entry));
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAll = () => {
    const bib = filtered.map(toBibTeX).join('\n\n');
    navigator.clipboard.writeText(bib);
    toast.success('All references copied as BibTeX');
  };

  const handleImportBib = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bib';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const regex = /@(\w+)\{([^,]+),\s*([\s\S]*?)\}/g;
        let match: RegExpExecArray | null;
        let count = 0;
        while ((match = regex.exec(content)) !== null) {
          const fields = match[3];
          const title = fields.match(/title\s*=\s*\{([^}]+)\}/)?.[1] || '';
          const author = fields.match(/author\s*=\s*\{([^}]+)\}/)?.[1] || '';
          const year = fields.match(/year\s*=\s*\{?(\d+)\}?/)?.[1] || '';
          const journal = fields.match(/journal\s*=\s*\{([^}]+)\}/)?.[1] || '';
          const key = match![2].trim();
          if (!entries.some(e => e.key === key)) {
            setEntries(prev => [...prev, {
              id: Date.now().toString() + count, key, type: match![1], title, author, year,
              journal: journal || undefined,
            }]);
            count++;
          }
        }
        if (count > 0) toast.success(`Imported ${count} reference(s)`);
        else toast('No new references found');
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Library</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Your references, ready to use anywhere.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleImportBib} className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors" style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
              Import .bib
            </button>
            <button onClick={handleCopyAll} disabled={filtered.length === 0} className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors disabled:opacity-40" style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
              Copy BibTeX
            </button>
            <button onClick={() => { resetForm(); setEditEntry(null); setShowAdd(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all" style={{ background: 'var(--color-accent)' }}>
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input type="text" placeholder="Search in your library..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg outline-none"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pb-4">
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <BookOpen size={40} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Your references, ready to use anywhere.</h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>Add references to Library once and insert them into any project.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { resetForm(); setEditEntry(null); setShowAdd(true); }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all" style={{ background: 'var(--color-accent)' }}>
                <Plus size={16} /> Add references
              </button>
              <button onClick={handleImportBib} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all" style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                Import .bib file
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No references match "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="text-sm mt-2" style={{ color: 'var(--color-accent)' }}>Clear search</button>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--color-surface)' }}>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold w-28" style={{ color: 'var(--color-text-muted)' }}>Cite Key</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>Title</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold w-40" style={{ color: 'var(--color-text-muted)' }}>Author</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold w-16" style={{ color: 'var(--color-text-muted)' }}>Year</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold w-24" style={{ color: 'var(--color-text-muted)' }}>Type</th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold w-24" style={{ color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id} style={{ borderTop: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3"><span className="text-sm font-mono font-medium" style={{ color: 'var(--color-accent)' }}>{entry.key}</span></td>
                    <td className="px-4 py-3"><span className="text-sm truncate block max-w-md" style={{ color: 'var(--color-text-primary)' }}>{entry.title}</span></td>
                    <td className="px-4 py-3"><span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{entry.author}</span></td>
                    <td className="px-4 py-3"><span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{entry.year}</span></td>
                    <td className="px-4 py-3"><span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>{entry.type}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => handleCopyBibTeX(entry)} className="p-1.5 rounded-md transition-colors" style={{ color: copiedId === entry.id ? '#22c55e' : 'var(--color-text-muted)' }}
                          onMouseEnter={e => { if (copiedId !== entry.id) e.currentTarget.style.background = 'var(--color-surface)'; }} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title="Copy BibTeX">
                          {copiedId === entry.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button onClick={() => handleEdit(entry)} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title="Edit">
                          <FileText size={14} />
                        </button>
                        <button onClick={() => handleDelete(entry.id, entry.key)} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-error)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="px-6 py-3 text-[13px]" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          {filtered.length} reference{filtered.length !== 1 ? 's' : ''} {searchQuery && `matching "${searchQuery}"`}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowAdd(false); setEditEntry(null); }} />
          <div className="relative w-full max-w-lg rounded-2xl border overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', boxShadow: '0 32px 100px rgba(0,0,0,0.4)' }}>
            <div className="h-1" style={{ background: 'var(--color-accent)' }} />
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{editEntry ? 'Edit Reference' : 'Add Reference'}</h2>
              <button onClick={() => { setShowAdd(false); setEditEntry(null); }} className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
            </div>
            <div className="px-6 pb-6 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Citation Key *</label>
                  <input value={formKey} onChange={e => setFormKey(e.target.value)} placeholder="e.g. smith2024"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
                </div>
                <div className="w-40">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Type</label>
                  <select value={formType} onChange={e => setFormType(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}>
                    {ENTRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Title *</label>
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Paper or book title"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Author(s)</label>
                  <input value={formAuthor} onChange={e => setFormAuthor(e.target.value)} placeholder="John Smith and Jane Doe"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Year</label>
                  <input value={formYear} onChange={e => setFormYear(e.target.value)} placeholder="2024"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Journal / Publisher</label>
                  <input value={formJournal} onChange={e => setFormJournal(e.target.value)} placeholder="Journal name"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Volume</label>
                  <input value={formVolume} onChange={e => setFormVolume(e.target.value)} placeholder="Vol"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Pages</label>
                  <input value={formPages} onChange={e => setFormPages(e.target.value)} placeholder="1-10"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>DOI</label>
                  <input value={formDoi} onChange={e => setFormDoi(e.target.value)} placeholder="10.xxxx/xxxxx"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>URL</label>
                  <input value={formUrl} onChange={e => setFormUrl(e.target.value)} placeholder="https://..."
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Note</label>
                <textarea value={formNote} onChange={e => setFormNote(e.target.value)} placeholder="Additional notes" rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setShowAdd(false); setEditEntry(null); }} className="px-4 py-2 text-sm font-medium rounded-lg" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>Cancel</button>
                <button onClick={handleAdd} className="px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ background: 'var(--color-accent)' }}>{editEntry ? 'Update' : 'Add Reference'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
