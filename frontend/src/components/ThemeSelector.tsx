import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Check, Palette, Search, X } from 'lucide-react';
import { themeGroups, themes } from '../theme';
import { useTheme } from '../ThemeProvider';

export default function ThemeSelector({ onClose }:{onClose:()=>void}) {
  const { theme, setTheme } = useTheme();
  const [query,setQuery] = useState('');
  const [highlight,setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => themes.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.id.includes(query.toLowerCase())), [query]);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setHighlight(0); }, [query]);
  const apply = (id:string) => { setTheme(id); onClose(); };
  const keyDown = (e:KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Home') { e.preventDefault(); setHighlight(0); }
    else if (e.key === 'End') { e.preventDefault(); setHighlight(Math.max(filtered.length - 1, 0)); }
    else if (e.key === 'Enter' && filtered[highlight]) apply(filtered[highlight].id);
  };
  return <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 pt-[10vh]" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label="Select Color Theme" className="w-full max-w-xl max-h-[80vh] overflow-hidden rounded-xl shadow-2xl" style={{background:'var(--color-surface)',border:'1px solid var(--color-border-strong)'}}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{borderColor:'var(--color-border)'}}><Palette size={17} style={{color:'var(--color-accent)'}}/><input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={keyDown} placeholder="Select Color Theme" aria-label="Search themes" className="min-w-0 flex-1 bg-transparent text-sm outline-none" style={{color:'var(--color-text-primary)'}}/><button onClick={onClose} aria-label="Close theme selector" className="p-1" style={{color:'var(--color-text-muted)'}}><X size={16}/></button></div>
      <div className="overflow-y-auto p-2">
        {themeGroups.map(group => { const groupThemes = filtered.filter(t=>t.type===group.type); if (!groupThemes.length) return null; return <div key={group.type} className="mb-3"><h3 className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{color:'var(--color-text-muted)'}}>{group.label}</h3>{groupThemes.map(item => { const index=filtered.indexOf(item); return <button key={item.id} role="option" aria-selected={theme.id===item.id} onMouseEnter={()=>setHighlight(index)} onClick={()=>apply(item.id)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left" style={{background:highlight===index?'var(--color-surface-elevated)':'transparent',color:'var(--color-text-primary)'}}><span className="flex gap-1">{item.preview.map((color,i)=><i key={i} className="h-3 w-3 rounded-full" style={{background:color,border:'1px solid var(--color-border)'}}/>)}</span><span className="flex-1 text-sm">{item.name}</span>{theme.id===item.id&&<Check size={15} style={{color:'var(--color-accent)'}}/>}</button>; })}</div>; })}
        {!filtered.length&&<p className="p-8 text-center text-sm" style={{color:'var(--color-text-muted)'}}>No themes found</p>}
      </div>
      <div className="border-t px-4 py-2 text-[11px]" style={{borderColor:'var(--color-border)',color:'var(--color-text-muted)'}}>↑ ↓ navigate · Enter apply · Esc close</div>
    </section>
  </div>;
}
