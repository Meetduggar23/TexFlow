import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Download, Search, File, Image, MoreHorizontal } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProjects, deleteProject } from '../store/projectSlice';
import CreateProjectModal from '../components/CreateProjectModal';
import AuthModal from '../components/AuthModal';
import toast from 'react-hot-toast';
import { useDialog } from '../components/DialogProvider';

export default function AllProjects() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, loading } = useAppSelector(state => state.project);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { confirm } = useDialog();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const controller = new AbortController();
    dispatch(fetchProjects());
    return () => controller.abort();
  }, [dispatch]);

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!token) { setShowAuthModal(true); return; }
    if (await confirm({ title: 'Move project to trash?', message: 'You can restore it later from Trash.', confirmText: 'Move to trash', danger: true })) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        toast.success('Moved to trash');
      } catch { toast.error('Failed to delete'); }
    }
  };

  const handleNewProject = () => {
    if (!token) { setShowAuthModal(true); return; }
    setShowCreateModal(true);
  };

  const handleOpenProject = (projectId: string) => {
    if (!token) { setShowAuthModal(true); return; }
    navigate(`/project/${projectId}`);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleSelectOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'tex') return <FileText size={14} className="text-texflow-400" />;
    if (ext === 'bib') return <File size={14} className="text-green-400" />;
    if (['png', 'jpg', 'jpeg', 'svg'].includes(ext || '')) return <Image size={14} className="text-blue-400" />;
    return <FileText size={14} className="text-texflow-600" />;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-texflow-900">All projects</h1>
          <button onClick={handleNewProject} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}>
            <Plus size={16} />
            New project
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-texflow-500" size={16} />
          <input
            type="text"
            placeholder="Search in all projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none focus:ring-2"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#FFFFFF' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-4">
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
            {!searchQuery && <button onClick={handleNewProject} className="btn-primary">Create Project</button>}
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--color-surface)' }}>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredProjects.length && filteredProjects.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded accent-texflow-500 cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-texflow-600">Title</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-texflow-600 w-32">Owner</th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-texflow-600 w-48">Last modified</th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold text-texflow-600 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="cursor-pointer transition-colors hover:bg-texflow-200/30"
                    style={{ borderTop: '1px solid var(--color-border)' }}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(project.id)}
                        onClick={(e) => handleSelectOne(e, project.id)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded accent-texflow-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-texflow-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-texflow-900 hover:text-texflow-600 transition-colors truncate">
                          {project.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-texflow-600">
                        {project.owner?.name || 'You'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-texflow-600">
                        {formatTimeAgo(project.updatedAt)} by {project.owner?.name || 'You'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenProject(project.id); }}
                          className="p-1.5 rounded hover:bg-texflow-200 transition-colors"
                          title="Open"
                        >
                          <FileText size={14} className="text-texflow-600" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenProject(project.id); }}
                          className="p-1.5 rounded hover:bg-texflow-200 transition-colors"
                          title="Download"
                        >
                          <Download size={14} className="text-texflow-600" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="p-1.5 rounded hover:bg-texflow-200 transition-colors"
                          title="PDF"
                        >
                          <FileText size={14} className="text-texflow-600" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenProject(project.id); }}
                          className="p-1.5 rounded hover:bg-texflow-200 transition-colors"
                          title="Open in editor"
                        >
                          <MoreHorizontal size={14} className="text-texflow-600" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, project.id)}
                          className="p-1.5 rounded hover:bg-texflow-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-texflow-600 hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredProjects.length > 0 && (
        <div className="px-6 py-3 text-[13px] text-texflow-600" style={{ borderTop: '1px solid var(--color-border)' }}>
          Showing {filteredProjects.length} out of {projects.length} projects.
        </div>
      )}

      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => {}} />}
    </div>
  );
}
