import { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { createProject } from '../store/projectSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CreateProjectModalProps {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const project = await dispatch(createProject({ name: name.trim(), description: description.trim() || undefined })).unwrap();
      toast.success('Project created');
      navigate(`/project/${project.id}`);
    } catch {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative border border-texflow-800 rounded-2xl shadow-2xl w-full max-w-md mx-4" style={{ background: '#0a0c3d' }}>
        <div className="flex items-center justify-between p-4 border-b border-texflow-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(114,4,85,0.3), rgba(145,10,103,0.3))' }}>
              <FileText className="text-texflow-400" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-white">New Project</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name <span className="text-texflow-400">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My LaTeX Document"
              className="input-field w-full"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your project..."
              className="input-field w-full resize-none h-20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={!name.trim() || loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
