import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, HelpCircle, Link2, Loader2, Shield, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppSelector } from '../store/hooks';

interface ShareDialogProps {
  onClose: () => void;
}

type ShareRole = 'viewer' | 'commenter' | 'editor';

interface ProjectMember {
  id: string;
  userId: string;
  role: ShareRole;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
}

const roleConfig: Record<ShareRole, { label: string; color: string; bg: string; border: string; icon: typeof Shield }> = {
  editor: { label: 'Can edit', color: 'var(--color-accent)', bg: 'var(--color-accent-soft)', border: 'var(--color-accent)', icon: Shield },
  commenter: { label: 'Can comment', color: 'var(--color-accent)', bg: 'var(--color-accent-soft)', border: 'var(--color-accent)', icon: Shield },
  viewer: { label: 'Can view', color: 'var(--color-accent)', bg: 'var(--color-accent-soft)', border: 'var(--color-accent)', icon: Shield },
};

export default function ShareDialog({ onClose }: ShareDialogProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const currentProject = useAppSelector(state => state.project.currentProject);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ShareRole>('editor');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null') as { id?: string; name?: string; email?: string } | null;
    } catch {
      return null;
    }
  }, []);

  const ownerEmail = currentProject?.owner?.email || currentUser?.email || 'Project owner';
  const ownerName = currentProject?.owner?.name || currentUser?.name || ownerEmail;

  const getInitials = (name?: string, email?: string) => {
    const source = name || email || 'U';
    const parts = source.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 1).toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ['var(--color-accent)', 'var(--color-accent-hover)', 'var(--color-text-muted)', 'var(--color-text-secondary)', 'var(--color-accent)', 'var(--color-accent-hover)'];
    return colors[index % colors.length];
  };

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadMembers = async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/shares/project/${projectId}/members`, { headers: authHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load members');
      setMembers(data.members || []);
    } catch {
      setMembers([]);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const handleInvite = async () => {
    const emails = email
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    if (!emails.length || !projectId) return;

    setLoading(true);
    try {
      for (const inviteEmail of emails) {
        const response = await fetch(`/api/shares/project/${projectId}/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ email: inviteEmail, role }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `Failed to invite ${inviteEmail}`);
      }

      toast.success(emails.length === 1 ? 'Invitation sent' : 'Invitations sent');
      setEmail('');
      await loadMembers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!projectId) return;
    setLinkLoading(true);
    try {
      const response = await fetch(`/api/shares/project/${projectId}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ role: 'viewer' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate link');
      setShareLink(`${window.location.origin}/share/${data.link.token}`);
      toast.success('Link sharing enabled');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate link');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/shares/project/${projectId}/members/${userId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error('Failed to remove member');
      setMembers(current => current.filter(member => member.userId !== userId));
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Dialog */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-project-title"
        className="relative w-full max-w-[780px] rounded-2xl border overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border-strong)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border)',
        }}
      >
        {/* Gradient accent bar */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--color-accent), #3B82F6, #8B5CF6)' }} />

        {/* Header */}
        <header
          className="px-7 pt-6 pb-5"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: 'var(--color-accent-soft)' }}
              >
                <Users size={22} style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <h2
                  id="share-project-title"
                  className="text-xl font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Share Project
                </h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {currentProject?.name || 'This project'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-surface-elevated)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="px-7 py-6 max-h-[70vh] overflow-y-auto">
          {/* Invite section */}
          <div className="mb-6">
            <label
              htmlFor="share-email"
              className="mb-2.5 flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <UserPlus size={15} style={{ color: 'var(--color-accent)' }} />
              Invite collaborators
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  id="share-email"
                  type="text"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleInvite();
                    }
                  }}
                  className="h-11 w-full rounded-xl border bg-transparent px-4 text-sm outline-none transition-all focus:ring-2"
                  style={{
                    borderColor: 'var(--color-border-strong)',
                    color: 'var(--color-text-primary)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-soft)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                  placeholder="Enter email addresses separated by commas"
                />
              </div>
              <select
                value={role}
                onChange={event => setRole(event.target.value as ShareRole)}
                className="h-11 rounded-xl border bg-transparent px-3 text-sm outline-none cursor-pointer"
                style={{
                  borderColor: 'var(--color-border-strong)',
                  color: 'var(--color-text-primary)',
                  minWidth: '130px',
                }}
              >
                <option value="editor">Editor</option>
                <option value="commenter">Commenter</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                type="button"
                onClick={handleInvite}
                disabled={loading || !email.trim()}
                className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))',
                  boxShadow: '0 4px 14px var(--color-accent-soft)',
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                Invite
              </button>
            </div>
          </div>

          {/* Link sharing */}
          <div
            className="mb-6 rounded-xl p-4"
            style={{
              background: 'var(--color-background)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: shareLink ? 'var(--color-accent-soft)' : 'var(--color-surface-elevated)' }}
                >
                  <Link2
                    size={18}
                    style={{ color: shareLink ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Link sharing
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {shareLink ? 'Anyone with the link can view' : 'Generate a shareable link'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {shareLink && (
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
                  >
                    Active
                  </span>
                )}
                {shareLink ? (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all"
                    style={{
                      background: copied ? 'var(--color-accent-soft)' : 'var(--color-surface-elevated)',
                      color: copied ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={e => {
                      if (!copied) e.currentTarget.style.borderColor = 'var(--color-accent)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateLink}
                    disabled={linkLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all"
                    style={{
                      background: 'var(--color-surface-elevated)',
                      color: 'var(--color-accent)',
                      border: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.background = 'var(--color-accent-soft)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.background = 'var(--color-surface-elevated)';
                    }}
                  >
                    {linkLoading ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                    Generate link
                  </button>
                )}
              </div>
            </div>
            {shareLink && (
              <div
                className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <input
                  value={shareLink}
                  readOnly
                  className="min-w-0 flex-1 bg-transparent text-xs outline-none font-mono"
                  style={{ color: 'var(--color-text-secondary)' }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-md p-1.5 transition-colors"
                  style={{ color: copied ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--color-surface-elevated)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>

          {/* Members list */}
          <div>
            <h3
              className="mb-3 flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Users size={15} style={{ color: 'var(--color-accent)' }} />
              People with access
              {members.length > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}
                >
                  {members.length + 1}
                </span>
              )}
            </h3>

            <div className="space-y-2">
              {/* Owner */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors"
                style={{
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}
                  >
                    {getInitials(ownerName, ownerEmail)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {ownerName}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
                      >
                        You
                      </span>
                    </div>
                    <span className="text-xs truncate block" style={{ color: 'var(--color-text-muted)' }}>
                      {ownerEmail}
                    </span>
                  </div>
                </div>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
                >
                  Owner
                </span>
              </div>

              {/* Members */}
              {members.map((member, index) => {
                const config = roleConfig[member.role] || roleConfig.viewer;
                const RoleIcon = config.icon;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors group"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                      e.currentTarget.style.background = 'var(--color-surface-elevated)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.background = 'var(--color-surface)';
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ background: getAvatarColor(index) }}
                      >
                        {getInitials(member.user?.name, member.user?.email)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium block truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {member.user?.name || 'Collaborator'}
                        </span>
                        <span className="text-xs block truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {member.user?.email || 'No email'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
                      >
                        <RoleIcon size={12} />
                        {config.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.userId)}
                        className="rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                          e.currentTarget.style.color = '#EF4444';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--color-text-muted)';
                        }}
                        aria-label={`Remove ${member.user?.email || 'collaborator'}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="flex items-center justify-between px-7 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Changes save automatically
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all"
            style={{
              background: 'var(--color-surface-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.background = 'var(--color-accent-soft)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'var(--color-surface-elevated)';
            }}
          >
            Done
          </button>
        </footer>
      </section>
    </div>
  );
}
