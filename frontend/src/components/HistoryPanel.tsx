import { useState, useEffect } from 'react';
import { History, RotateCcw, Eye, X, GitCompare } from 'lucide-react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDialog } from './DialogProvider';

interface HistoryPanelProps {
  onClose: () => void;
}

interface Version {
  id: string;
  label?: string;
  user: { name: string; email: string };
  createdAt: string;
}

export default function HistoryPanel({ onClose }: HistoryPanelProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useDialog();

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}/history`).then(r => r.json()).then(data => { setVersions(data.versions || []); setLoading(false); }).catch(() => setLoading(false));
  }, [projectId]);

  const handleRestore = async (versionId: string) => {
    if (!(await confirm({ title: 'Restore this version?', message: 'Current changes will be saved as a new version.', confirmText: 'Restore' }))) return;
    try {
      await fetch(`/api/projects/${projectId}/restore/${versionId}`, { method: 'POST' });
      toast.success('Version restored. Reload to see changes.');
    } catch { toast.error('Failed to restore'); }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-surface)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-texflow-800">
        <div className="flex items-center gap-2">
          <History size={16} className="text-texflow-400" />
          <span className="text-sm font-medium text-texflow-900">Version History</span>
        </div>
        <button onClick={onClose} className="p-1 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-2 border-texflow-500 border-t-transparent" /></div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8"><History className="mx-auto h-8 w-8 text-texflow-600 mb-2" /><p className="text-sm text-texflow-500">No version history yet</p></div>
        ) : versions.map(version => (
          <div key={version.id} className="rounded-lg p-3 border border-texflow-800 hover:border-texflow-700 transition-colors" style={{ background: 'rgba(44,57,75,0.65)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-texflow-900 font-medium">{version.label || 'Unnamed version'}</p>
                <p className="text-xs text-texflow-600">{version.user?.name} · {new Date(version.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded transition-colors" title="View"><Eye size={14} /></button>
                <button className="p-1.5 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded transition-colors" title="Compare"><GitCompare size={14} /></button>
                <button onClick={() => handleRestore(version.id)} className="p-1.5 text-texflow-600 hover:text-texflow-400 hover:bg-texflow-200 rounded transition-colors" title="Restore"><RotateCcw size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
