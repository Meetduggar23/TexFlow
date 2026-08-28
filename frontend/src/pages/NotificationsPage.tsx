import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, FolderOpen, MessageSquare, UserPlus, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import type { Notification } from '../types';

const API = '/api';

const iconMap: Record<string, any> = {
  'project.shared': UserPlus,
  'collaboration.invite': UserPlus,
  'comment.mention': MessageSquare,
  'comment.reply': MessageSquare,
  'project.updated': FileText,
  'project.archived': AlertCircle,
  'project.restored': CheckCircle,
  'compilation.completed': CheckCircle,
  'compilation.failed': AlertCircle,
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchNotifications = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/users/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || data || []);
      }
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`${API}/users/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API}/users/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Notifications</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={{ color: 'var(--color-accent)', background: 'none', border: '1px solid var(--color-border)' }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'var(--color-surface)' }} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>No notifications yet</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-text-muted)' }}>You'll see notifications for shares, comments, and activity here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map(n => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                    if (n.projectId) navigate(`/project/${n.projectId}`);
                  }}
                  className="w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors"
                  style={{
                    background: n.read ? 'transparent' : 'var(--color-accent-soft)',
                    border: '1px solid',
                    borderColor: n.read ? 'transparent' : 'var(--color-border)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'var(--color-accent-soft)'}
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--color-surface-elevated)', borderRadius: '6px' }}>
                    <Icon size={14} style={{ color: n.read ? 'var(--color-text-muted)' : 'var(--color-accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{n.title}</p>
                    <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{n.message}</p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{formatTime(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: 'var(--color-accent)' }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
