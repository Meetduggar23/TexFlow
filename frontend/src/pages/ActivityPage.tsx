import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, FolderOpen, FileText, Pencil, Users, Archive, ArchiveRestore, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAppSelector } from '../store/hooks';

interface ActivityEvent {
  id: string;
  type: string;
  description: string;
  projectName?: string;
  projectId?: string;
  timestamp: string;
}

const typeIcons: Record<string, any> = {
  created: FolderOpen,
  edited: Pencil,
  renamed: Pencil,
  shared: Users,
  archived: Archive,
  restored: ArchiveRestore,
  compiled: CheckCircle,
  'compile-failed': AlertCircle,
};

export default function ActivityPage() {
  const navigate = useNavigate();
  const { projects } = useAppSelector(state => state.project);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const events: ActivityEvent[] = [];
    projects.forEach(p => {
      events.push({
        id: `created-${p.id}`,
        type: 'created',
        description: `Created project "${p.name}"`,
        projectName: p.name,
        projectId: p.id,
        timestamp: p.createdAt,
      });
      if (p.updatedAt !== p.createdAt) {
        events.push({
          id: `updated-${p.id}`,
          type: 'edited',
          description: `Modified project "${p.name}"`,
          projectName: p.name,
          projectId: p.id,
          timestamp: p.updatedAt,
        });
      }
      if (p.isArchived) {
        events.push({
          id: `archived-${p.id}`,
          type: 'archived',
          description: `Archived project "${p.name}"`,
          projectName: p.name,
          projectId: p.id,
          timestamp: p.updatedAt,
        });
      }
    });
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(events.slice(0, 50));
  }, [projects]);

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Activity</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Recent activity across your projects.</p>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-20">
            <Activity size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>No activity yet</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Activity from your projects will appear here.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: 'var(--color-border)' }} />
            <div className="space-y-1">
              {activities.map(event => {
                const Icon = typeIcons[event.type] || Activity;
                return (
                  <button
                    key={event.id}
                    onClick={() => event.projectId && navigate(`/project/${event.projectId}`)}
                    className="relative flex items-start gap-3 pl-10 pr-3 py-3 rounded-lg text-left transition-colors w-full"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="absolute left-2 top-3.5 w-5 h-5 flex items-center justify-center rounded-full z-10"
                      style={{ background: 'var(--color-background)', border: '2px solid var(--color-border)' }}>
                      <Icon size={10} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>{event.description}</p>
                      <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock size={10} /> {formatTime(event.timestamp)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
