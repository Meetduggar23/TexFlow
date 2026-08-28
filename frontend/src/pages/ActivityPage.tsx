import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Archive, ChevronDown, Clock3, FolderOpen, ListFilter, Pencil,
  Search, Sparkles, X,
} from 'lucide-react';
import { useAppSelector } from '../store/hooks';

type ActivityType = 'created' | 'edited' | 'archived';
interface ActivityEvent {
  id: string; type: ActivityType; description: string; projectName: string;
  projectId: string; timestamp: string;
}

const eventMeta: Record<ActivityType, { label: string; icon: typeof Activity; color: string; tint: string }> = {
  created: { label: 'Created', icon: FolderOpen, color: 'var(--color-accent)', tint: 'var(--color-accent-soft)' },
  edited: { label: 'Updated', icon: Pencil, color: '#38BDF8', tint: 'rgba(56,189,248,.12)' },
  archived: { label: 'Archived', icon: Archive, color: '#A78BFA', tint: 'rgba(167,139,250,.14)' },
};

function relativeTime(value: string) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function dayLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function ActivityPage() {
  const navigate = useNavigate();
  const { projects, loading } = useAppSelector(state => state.project);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | ActivityType>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const activities = useMemo(() => {
    const events: ActivityEvent[] = [];
    projects.filter(project => !project.deletedAt).forEach(project => {
      events.push({ id: `created-${project.id}`, type: 'created', description: 'Created a new project', projectName: project.name, projectId: project.id, timestamp: project.createdAt });
      if (project.updatedAt && project.updatedAt !== project.createdAt && !project.isArchived) {
        events.push({ id: `edited-${project.id}`, type: 'edited', description: 'Made changes to', projectName: project.name, projectId: project.id, timestamp: project.updatedAt });
      }
      if (project.isArchived) events.push({ id: `archived-${project.id}`, type: 'archived', description: 'Archived', projectName: project.name, projectId: project.id, timestamp: project.updatedAt });
    });
    return events
      .filter(event => filter === 'all' || event.type === filter)
      .filter(event => !query || `${event.projectName} ${event.description}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
  }, [projects, filter, query]);

  const grouped = useMemo(() => activities.reduce<Record<string, ActivityEvent[]>>((result, event) => {
    const key = dayLabel(event.timestamp); (result[key] ||= []).push(event); return result;
  }, {}), [activities]);

  const stats = useMemo(() => ({
    total: activities.length,
    projects: new Set(activities.map(item => item.projectId)).size,
    latest: activities[0] ? relativeTime(activities[0].timestamp) : '—',
  }), [activities]);

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        <div className="relative overflow-hidden rounded-2xl border p-5 sm:p-7 mb-6 animate-fade-in" style={{ background: 'linear-gradient(135deg, var(--color-surface), color-mix(in srgb, var(--color-accent) 13%, var(--color-surface)))', borderColor: 'var(--color-border)' }}>
          <div className="absolute -right-12 -top-20 w-52 h-52 rounded-full blur-3xl opacity-30" style={{ background: 'var(--color-accent)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3" style={{ color: 'var(--color-accent)', background: 'var(--color-accent-soft)' }}><Sparkles size={12} /> Workspace pulse</div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Activity</h1>
              <p className="text-sm mt-1.5 max-w-md" style={{ color: 'var(--color-text-muted)' }}>A quiet overview of everything happening across your TexFlow workspace.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[['Events', stats.total], ['Projects', stats.projects], ['Latest', stats.latest]].map(([label, value]) => <div key={label} className="min-w-[74px] rounded-xl border px-3 py-2.5" style={{ background: 'color-mix(in srgb, var(--color-surface) 70%, transparent)', borderColor: 'var(--color-border)' }}><p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</p><p className="text-sm font-semibold mt-1 truncate" style={{ color: 'var(--color-text-primary)' }}>{value}</p></div>)}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
          <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search activity or projects..." className="w-full rounded-xl border py-2.5 pl-9 pr-9 text-sm outline-none focus:ring-2" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />{query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}><X size={14} /></button>}</div>
          <div className="relative"><button onClick={() => setFilterOpen(value => !value)} className="h-full w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}><ListFilter size={14} /> {filter === 'all' ? 'All activity' : eventMeta[filter].label}<ChevronDown size={14} /></button>{filterOpen && <div className="absolute right-0 z-20 mt-2 min-w-[160px] rounded-xl border p-1 shadow-xl" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}>{(['all', 'created', 'edited', 'archived'] as const).map(value => <button key={value} onClick={() => { setFilter(value); setFilterOpen(false); }} className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-surface-elevated)]" style={{ color: filter === value ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>{value === 'all' ? 'All activity' : eventMeta[value].label}</button>)}</div>}</div>
        </div>

        {loading ? <div className="space-y-3">{[1, 2, 3].map(item => <div key={item} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--color-surface)' }} />)}</div> : activities.length === 0 ? <div className="rounded-2xl border py-20 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}><div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}><Activity size={25} style={{ color: 'var(--color-accent)' }} /></div><h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>{query || filter !== 'all' ? 'No matching activity' : 'Your workspace is quiet'}</h2><p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{query || filter !== 'all' ? 'Try another search or filter.' : 'Create or update a project and its story will appear here.'}</p>{(query || filter !== 'all') && <button onClick={() => { setQuery(''); setFilter('all'); }} className="mt-4 text-sm font-medium" style={{ color: 'var(--color-accent)' }}>Clear filters</button>}</div> : <div className="space-y-7">{Object.entries(grouped).map(([day, events]) => <section key={day} className="animate-fade-in"><div className="flex items-center gap-3 mb-3"><span className="text-[11px] font-bold uppercase tracking-[.16em]" style={{ color: 'var(--color-text-muted)' }}>{day}</span><div className="h-px flex-1" style={{ background: 'var(--color-border)' }} /></div><div className="relative ml-2 sm:ml-3 space-y-2"><div className="absolute left-[17px] top-0 bottom-0 w-px" style={{ background: 'var(--color-border)' }} />{events.map((event, index) => { const meta = eventMeta[event.type]; const Icon = meta.icon; return <button key={event.id} onClick={() => navigate(`/project/${event.projectId}`)} className="relative w-full flex items-center gap-3 sm:gap-4 rounded-xl border px-3 sm:px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg animate-fade-in" style={{ animationDelay: `${index * 55}ms`, background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}><span className="relative z-10 w-9 h-9 shrink-0 rounded-xl flex items-center justify-center" style={{ background: meta.tint, color: meta.color }}><Icon size={16} /></span><span className="min-w-0 flex-1"><span className="block text-sm" style={{ color: 'var(--color-text-secondary)' }}>{event.description} <strong style={{ color: 'var(--color-text-primary)' }}>{event.projectName}</strong></span><span className="flex items-center gap-1.5 mt-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}><Clock3 size={11} /> {relativeTime(event.timestamp)} <span>·</span> {meta.label}</span></span><span className="hidden sm:flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Open <ChevronDown size={13} className="-rotate-90" /></span></button>; })}</div></section>)}</div>}
      </div>
    </div>
  );
}
