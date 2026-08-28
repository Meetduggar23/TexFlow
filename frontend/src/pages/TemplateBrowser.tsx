import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ArrowLeft, X, Plus, Tag, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Template } from '../types';

const categories = [
  'All', 'Academic Papers', 'Research Papers', 'Thesis', 'Dissertation',
  'CV / Resume', 'Books', 'Reports', 'Presentations', 'Conference Papers',
  'Cover Letters', 'Lab Reports',
];

const RECENT_KEY = 'texflow-recent-templates';

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

function saveRecent(id: string) {
  const recent = loadRecent().filter(r => r !== id);
  recent.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 5)));
}

/* ────── Template Preview Modal ────── */
function TemplatePreviewModal({ template, onClose, onUse }: {
  template: Template; onClose: () => void; onUse: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState(template.name);
  const [showNameInput, setShowNameInput] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleUse = async () => {
    if (!token) { toast.error('Please log in first'); return; }
    const name = projectName.trim();
    if (!name) { toast.error('Project name is required'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const project = data.project;
      if (project?.files?.[0]) {
        await fetch(`/api/files/${project.files[0].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: template.content }),
        });
      }
      saveRecent(template.id);
      toast.success('Project created from template');
      onClose();
      navigate(`/project/${project.id}`);
    } catch {
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border overflow-hidden max-h-[85vh] flex flex-col" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', boxShadow: '0 32px 100px rgba(0,0,0,0.4)' }}>
        <div className="h-1" style={{ background: 'var(--color-accent)' }} />
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
              <FileText size={20} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{template.name}</h2>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{template.category}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{template.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-xl" style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Category</p>
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{template.category}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Author</p>
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{template.author}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Files Included</p>
            <div className="p-3 rounded-xl" style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <FileText size={14} style={{ color: 'var(--color-accent)' }} />
                <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>main.tex</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          {showNameInput ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Project name</label>
                <input
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleUse(); if (e.key === 'Escape') setShowNameInput(false); }}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowNameInput(false)} className="px-4 py-2 text-sm font-medium rounded-xl" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>Cancel</button>
                <button onClick={handleUse} disabled={!projectName.trim() || creating} className="px-5 py-2 text-sm font-medium text-white rounded-xl disabled:opacity-50" style={{ background: 'var(--color-accent)' }}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-xl" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>Close</button>
              <button onClick={() => setShowNameInput(true)} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl" style={{ background: 'var(--color-accent)' }}>
                <Plus size={16} /> Use Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────── Main Component ────── */
export default function TemplateBrowser() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [recentIds] = useState(loadRecent);

  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(data => {
      setTemplates(data.templates || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return templates.filter(t => {
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      const matchesSearch = !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  const recentTemplates = useMemo(() => {
    return recentIds.map(id => templates.find(t => t.id === id)).filter(Boolean).slice(0, 3) as Template[];
  }, [recentIds, templates]);

  const handleUseTemplate = async (template: Template) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Please log in first'); return; }
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: template.name }),
      });
      const data = await res.json();
      const project = data.project;
      if (project?.files?.[0]) {
        await fetch(`/api/files/${project.files[0].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: template.content }),
        });
      }
      saveRecent(template.id);
      toast.success('Project created from template');
      navigate(`/project/${project.id}`);
    } catch {
      toast.error('Failed to create project');
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Templates</h1>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Start your next document with a professionally structured template.</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all" style={{ background: 'var(--color-accent)' }}>
            <Plus size={16} /> New project
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg outline-none"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 pb-3 flex gap-1.5 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="px-3 py-1.5 text-[12px] font-medium rounded-lg whitespace-nowrap transition-colors"
            style={{
              background: selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-surface)',
              color: selectedCategory === cat ? '#fff' : 'var(--color-text-secondary)',
              border: `1px solid ${selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pb-4">
        {/* Recently Used */}
        {recentTemplates.length > 0 && !searchQuery && selectedCategory === 'All' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>Recently Used</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentTemplates.map(t => (
                <button key={t.id} onClick={() => handleUseTemplate(t)}
                  className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent-soft)' }}>
                    <FileText size={16} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{t.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{t.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured */}
        {!searchQuery && selectedCategory === 'All' && templates.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>Featured Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.slice(0, 3).map(t => (
                <button key={t.id} onClick={() => setPreviewTemplate(t)}
                  className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-elevated))', border: '1px solid var(--color-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent-soft)' }}>
                    <FileText size={24} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{t.name}</h4>
                    <p className="text-[12px] line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>
                    <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>{t.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div>
          <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {selectedCategory === 'All' ? 'All Templates' : selectedCategory}
            <span className="ml-2 font-normal" style={{ color: 'var(--color-text-muted)' }}>({filtered.length})</span>
          </h3>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="h-32" style={{ background: 'var(--color-surface-elevated)' }} />
                  <div className="p-4 space-y-2">
                    <div className="h-4 rounded w-3/4" style={{ background: 'var(--color-surface-elevated)' }} />
                    <div className="h-3 rounded w-1/2" style={{ background: 'var(--color-surface-elevated)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
                <BookOpen size={28} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No templates found</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                {searchQuery ? `No templates match "${searchQuery}"` : 'No templates in this category yet.'}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-sm" style={{ color: 'var(--color-accent)' }}>Clear search</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(template => (
                <div key={template.id} className="group rounded-xl overflow-hidden transition-all cursor-pointer"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  onClick={() => setPreviewTemplate(template)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  {/* Template preview area */}
                  <div className="h-32 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, var(--color-surface-elevated), var(--color-surface))' }}>
                    <FileText size={36} style={{ color: 'var(--color-accent)', opacity: 0.3 }} />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                      {template.category}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-[14px] font-semibold mb-1 truncate" style={{ color: 'var(--color-text-primary)' }}>{template.name}</h3>
                    <p className="text-[12px] mb-3 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{template.description}</p>

                    <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>by {template.author}</span>
                      <button onClick={e => { e.stopPropagation(); handleUseTemplate(template); }}
                        className="px-3 py-1 text-[12px] font-medium text-white rounded-lg transition-all"
                        style={{ background: 'var(--color-accent)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--color-accent)'}>
                        Use
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="px-6 py-3 text-[13px]" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          {filtered.length} template{filtered.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => { handleUseTemplate(previewTemplate); setPreviewTemplate(null); }}
        />
      )}
    </div>
  );
}
