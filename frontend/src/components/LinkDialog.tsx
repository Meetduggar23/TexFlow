import { useState } from 'react';
import { Link2, X } from 'lucide-react';

interface LinkDialogProps { onInsert: (latex: string) => void; onClose: () => void; }

export default function LinkDialog({ onInsert, onClose }: LinkDialogProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const submit = () => {
    if (!url.trim() || !text.trim()) return;
    const normalized = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    onInsert(`\\href{${normalized}}{${text.trim()}}`);
    onClose();
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60" onClick={onClose} />
    <section role="dialog" aria-modal="true" aria-labelledby="insert-link-title" className="relative w-full max-w-md rounded-xl border p-5 shadow-2xl" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)' }}>
      <div className="flex items-center justify-between"><h2 id="insert-link-title" className="flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}><Link2 size={16} /> Insert Link</h2><button onClick={onClose} aria-label="Close dialog" style={{ color: 'var(--color-text-muted)' }}><X size={17} /></button></div>
      <div className="mt-4 space-y-3"><label className="block text-sm" style={{ color: 'var(--color-text-secondary)' }}>URL<input autoFocus value={url} onChange={e => setUrl(e.target.value)} className="input-field mt-1 w-full" placeholder="https://example.com" onKeyDown={e => e.key === 'Enter' && submit()} /></label><label className="block text-sm" style={{ color: 'var(--color-text-secondary)' }}>Text<input value={text} onChange={e => setText(e.target.value)} className="input-field mt-1 w-full" placeholder="Link text" onKeyDown={e => e.key === 'Enter' && submit()} /></label></div>
      <div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={submit} disabled={!url.trim() || !text.trim()} className="btn-primary disabled:opacity-50">Insert</button></div>
    </section>
  </div>;
}
