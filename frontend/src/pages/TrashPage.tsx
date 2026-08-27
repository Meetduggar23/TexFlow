import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RotateCcw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDialog } from '../components/DialogProvider';

export default function TrashPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useDialog();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/projects?trashed=true', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(r => r.json()).then(data => {
      setProjects(data.projects || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleRestore = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/projects/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(p => p.filter(proj => proj.id !== id));
      toast.success('Project restored');
    } catch { toast.error('Failed to restore'); }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!(await confirm({ title: 'Delete project permanently?', message: 'This action cannot be undone.', confirmText: 'Delete permanently', danger: true }))) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(p => p.filter(proj => proj.id !== id));
      toast.success('Project permanently deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-3xl font-bold text-texflow-900">Trash</h1>
          <p className="text-texflow-600 mt-1">Deleted projects can be restored within 30 days</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-texflow-500 border-t-transparent" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <Trash2 className="mx-auto h-12 w-12 text-texflow-500 mb-4" />
          <h3 className="text-lg font-medium text-texflow-700">Trash is empty</h3>
          <p className="text-texflow-600">Deleted projects will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <div key={project.id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-medium text-texflow-900">{project.name}</h3>
                <p className="text-sm text-texflow-600">Deleted {new Date(project.deletedAt || project.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleRestore(project.id)} className="btn-secondary text-xs flex items-center gap-1"><RotateCcw size={14} /> Restore</button>
                <button onClick={() => handlePermanentDelete(project.id)} className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">Delete permanently</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
