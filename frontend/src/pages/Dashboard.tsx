import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Clock, Users, Search, Star, Upload, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProjects, createProject, deleteProject } from '../store/projectSlice';
import Header from '../components/Header';
import CreateProjectModal from '../components/CreateProjectModal';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, loading } = useAppSelector(state => state.project);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'owned' | 'shared' | 'favorites'>('all');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        toast.success('Project deleted');
      } catch {
        toast.error('Failed to delete project');
      }
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'favorites') return matchesSearch && (p as any).isFavorite;
    return matchesSearch;
  });

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-texflow-900">My Projects</h1>
              <p className="text-texflow-600 mt-1">Manage your LaTeX documents</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <Upload size={16} />
                Upload
              </button>
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <BookOpen size={16} />
                Templates
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                New Project
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-texflow-500" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
              {(['all', 'owned', 'shared', 'favorites'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize ${
                    filter === f ? 'text-texflow-900' : 'text-texflow-600 hover:text-texflow-900'
                  }`}
                  style={filter === f ? { background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' } : {}}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-texflow-500 border-t-transparent" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,76,41,0.15), rgba(51,71,86,0.45))' }}>
                <FileText className="text-texflow-400" size={28} />
              </div>
              <h3 className="text-lg font-medium text-texflow-700 mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-texflow-600 mb-6">
                {searchQuery ? 'Try a different search term' : 'Create your first LaTeX project to get started'}
              </p>
              {!searchQuery && (
                <button onClick={() => setShowCreateModal(true)} className="btn-primary">Create Project</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="card hover:translate-y-[-2px] cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,76,41,0.18), rgba(51,71,86,0.50))' }}>
                        <FileText className="text-texflow-400" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-texflow-900 group-hover:text-texflow-300 transition-colors">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-texflow-600 line-clamp-1">{project.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-texflow-200 rounded transition-all"
                    >
                      <Trash2 size={16} className="text-texflow-600 hover:text-red-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-texflow-600">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {project.collaborators?.length || 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
