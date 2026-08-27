import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Clock, Users, Search, Upload, BookOpen, Star, MoreVertical, Download } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProjects, deleteProject } from '../store/projectSlice';
import CreateProjectModal from '../components/CreateProjectModal';
import toast from 'react-hot-toast';

export default function AllProjects() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, loading } = useAppSelector(state => state.project);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name' | 'createdAt'>('updatedAt');
  const [filter, setFilter] = useState<'all' | 'owned' | 'shared' | 'favorites'>('all');

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Move this project to trash?')) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        toast.success('Moved to trash');
      } catch { toast.error('Failed to delete'); }
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: true }),
      });
      dispatch(fetchProjects());
    } catch { toast.error('Failed'); }
  };

  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Projects</h1>
          <p className="text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Upload size={16} /> Upload
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm" onClick={() => navigate('/templates')}>
            <BookOpen size={16} /> Templates
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field w-full pl-10" />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="input-field text-sm">
          <option value="updatedAt">Recently Modified</option>
          <option value="name">Name</option>
          <option value="createdAt">Created Date</option>
        </select>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#0a0c3d', border: '1px solid #3C0753' }}>
          {(['all', 'owned', 'shared', 'favorites'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize ${filter === f ? 'text-white' : 'text-slate-400 hover:text-white'}`} style={filter === f ? { background: 'linear-gradient(135deg, #720455, #910A67)' } : {}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-texflow-500 border-t-transparent" /></div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(114,4,85,0.2), rgba(145,10,103,0.2))' }}><FileText className="text-texflow-400" size={28} /></div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">{searchQuery ? 'No projects found' : 'No projects yet'}</h3>
          <p className="text-slate-400 mb-6">{searchQuery ? 'Try a different search term' : 'Create your first LaTeX project to get started'}</p>
          {!searchQuery && <button onClick={() => setShowCreateModal(true)} className="btn-primary">Create Project</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} onClick={() => navigate(`/project/${project.id}`)} className="card hover:translate-y-[-2px] cursor-pointer group relative">
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); }} className="p-1 hover:bg-dark-700 rounded transition-colors"><Download size={14} className="text-slate-400" /></button>
                <button onClick={(e) => handleDelete(e, project.id)} className="p-1 hover:bg-dark-700 rounded transition-colors"><Trash2 size={14} className="text-slate-400 hover:text-red-400" /></button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(114,4,85,0.3), rgba(145,10,103,0.3))' }}>
                  <FileText className="text-texflow-400" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white group-hover:text-texflow-300 transition-colors truncate">{project.name}</h3>
                  {project.description && <p className="text-sm text-slate-400 line-clamp-1">{project.description}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock size={12} />{new Date(project.updatedAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Users size={12} />{project.collaborators?.length || 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
