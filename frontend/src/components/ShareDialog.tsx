import { useState, useEffect } from 'react';
import { X, Share2, Link2, Copy, Check, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ShareDialogProps {
  onClose: () => void;
}

export default function ShareDialog({ onClose }: ShareDialogProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/shares/project/${projectId}/members`, { headers: authHeaders() }).then(r => r.json()).then(data => setMembers(data.members || [])).catch(() => {});
  }, [projectId]);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/shares/project/${projectId}/invite`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ email, role }) });
      toast.success('Invitation sent');
      setEmail('');
      fetch(`/api/shares/project/${projectId}/members`, { headers: authHeaders() }).then(r => r.json()).then(data => setMembers(data.members || []));
    } catch { toast.error('Failed to send invitation'); }
    setLoading(false);
  };

  const handleGenerateLink = async () => {
    try {
      const res = await fetch(`/api/shares/project/${projectId}/link`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ role: 'viewer' }) });
      const data = await res.json();
      setShareLink(`${window.location.origin}/share/${data.link.token}`);
    } catch { toast.error('Failed to generate link'); }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await fetch(`/api/shares/project/${projectId}/members/${userId}`, { method: 'DELETE', headers: authHeaders() });
      setMembers(m => m.filter(member => member.userId !== userId));
      toast.success('Member removed');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative border border-texflow-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4" style={{ background: 'var(--color-background)' }}>
        <div className="flex items-center justify-between p-4 border-b border-texflow-800">
          <div className="flex items-center gap-2"><Share2 size={18} className="text-texflow-400" /><h2 className="text-lg font-semibold text-texflow-900">Share Project</h2></div>
          <button onClick={onClose} className="p-1 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email address" className="input-field flex-1" onKeyDown={e => e.key === 'Enter' && handleInvite()} />
            <select value={role} onChange={e => setRole(e.target.value)} className="input-field"><option value="viewer">Viewer</option><option value="commenter">Commenter</option><option value="editor">Editor</option></select>
            <button onClick={handleInvite} disabled={loading || !email.trim()} className="btn-primary text-sm">{loading ? 'Sending...' : 'Invite'}</button>
          </div>

          <div>
            <button onClick={handleGenerateLink} className="text-sm text-texflow-400 hover:text-texflow-300 flex items-center gap-1"><Link2 size={14} /> Generate share link</button>
            {shareLink && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded-lg border border-texflow-800" style={{ background: 'var(--color-surface)' }}>
                <input value={shareLink} readOnly className="flex-1 bg-transparent text-xs text-texflow-700 outline-none" />
                <button onClick={handleCopyLink} className="p-1 text-texflow-600 hover:text-texflow-900">{copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}</button>
              </div>
            )}
          </div>

          {members.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-texflow-700 mb-2">Members</h3>
              <div className="space-y-2">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border border-texflow-800" style={{ background: 'color-mix(in srgb, var(--color-surface) 65%, transparent)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-texflow-900" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}>{member.user?.name?.[0] || 'U'}</div>
                      <div><p className="text-sm text-texflow-900">{member.user?.name || member.user?.email}</p><p className="text-xs text-texflow-500">{member.role}</p></div>
                    </div>
                    <button onClick={() => handleRemoveMember(member.userId)} className="p-1 text-texflow-600 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
