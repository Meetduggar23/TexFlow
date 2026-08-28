import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Mail, Shield, Trash2, Copy, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const API = '/api';

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email: string; avatarUrl?: string };
}

export default function TeamPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchMembers = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/shares/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || data || []);
      }
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !token) return;
    try {
      const res = await fetch(`${API}/shares/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        toast.success('Invitation sent');
        setInviteEmail('');
        setShowInvite(false);
        fetchMembers();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to send invitation');
      }
    } catch { toast.error('Failed to send invitation'); }
  };

  const removeMember = async (userId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/shares/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Member removed');
        fetchMembers();
      }
    } catch { toast.error('Failed to remove member'); }
  };

  const roleColors: Record<string, string> = {
    owner: 'var(--color-accent)',
    admin: 'var(--color-accent)',
    editor: 'var(--color-accent)',
    viewer: 'var(--color-text-muted)',
  };

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Team</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Manage team members and collaboration.</p>
          </div>
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white"
            style={{ background: 'var(--color-accent)' }}>
            <UserPlus size={14} /> Invite member
          </button>
        </div>

        {/* Invite form */}
        {showInvite && (
          <div className="mb-6 p-4 border rounded-lg" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)} style={{ color: 'var(--color-text-muted)' }}><X size={16} /></button>
            </div>
            <div className="flex gap-2 mb-3">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInvite()}
                placeholder="Email address" type="email"
                className="flex-1 border px-3 py-2 text-[13px] outline-none"
                style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                className="border px-2 py-2 text-[12px] outline-none"
                style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowInvite(false)} className="px-3 py-1.5 text-[12px] font-medium"
                style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>Cancel</button>
              <button onClick={handleInvite} disabled={!inviteEmail.trim()} className="px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--color-accent)' }}>Send Invite</button>
            </div>
          </div>
        )}

        {/* Members list */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--color-surface)' }} />)}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <Users size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>No team members yet</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Invite collaborators to work on projects together.</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--color-surface)' }}>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Member</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Role</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                          style={{ background: 'var(--color-accent)' }}>
                          {m.user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>{m.user.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{m.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold uppercase px-2 py-0.5"
                        style={{ color: roleColors[m.role] || 'var(--color-text-muted)', background: 'var(--color-surface-elevated)' }}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {m.userId !== user.id && m.role !== 'owner' && (
                        <button onClick={() => removeMember(m.userId)} className="p-1.5"
                          style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                          title="Remove member"><Trash2 size={13} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
