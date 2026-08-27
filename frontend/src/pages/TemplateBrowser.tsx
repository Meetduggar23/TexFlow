import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Template } from '../types';

const categories = ['All', 'Academic Papers', 'Research Papers', 'Thesis', 'Dissertation', 'CV / Resume', 'Books', 'Reports', 'Presentations', 'Conference Papers', 'Cover Letters', 'Lab Reports'];

export default function TemplateBrowser() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(data => {
      setTemplates(data.templates || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = templates.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (template: Template) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: template.name }),
      });
      const data = await res.json();
      const project = data.project;
      if (project?.files?.[0]) {
        await fetch(`/api/files/${project.files[0].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: template.content }),
        });
      }
      toast.success('Project created from template');
      navigate(`/project/${project.id}`);
    } catch { toast.error('Failed to create project'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-3xl font-bold text-texflow-900">Templates</h1>
          <p className="text-texflow-600 mt-1">Start from a professionally designed template</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-texflow-500" size={18} />
          <input type="text" placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field w-full pl-10" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedCategory === cat ? 'text-texflow-900' : 'text-texflow-600 border border-texflow-700 hover:border-texflow-500'}`} style={selectedCategory === cat ? { background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' } : {}}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-texflow-500 border-t-transparent" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(template => (
            <div key={template.id} className="card group">
              <div className="w-full h-32 rounded-lg mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(245,175,175,0.15), rgba(232,149,149,0.1))' }}>
                <FileText size={40} className="text-texflow-400 opacity-50" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-texflow-900 group-hover:text-texflow-300 transition-colors">{template.name}</h3>
                  <span className="text-xs text-texflow-400">{template.category}</span>
                </div>
              </div>
              <p className="text-sm text-texflow-600 mb-4 line-clamp-2">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-texflow-500">by {template.author}</span>
                <button onClick={() => handleUseTemplate(template)} className="btn-primary text-xs px-3 py-1.5">Use Template</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
