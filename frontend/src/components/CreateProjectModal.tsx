import { useState, useRef, useEffect } from 'react';
import { X, FileText, Upload, BookOpen, Mail, GraduationCap, BarChart3, Presentation, FileBarChart, User, BookMarked, FileCode2, FolderOpen } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { createProject } from '../store/projectSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';
import { addTagToProject } from '../utils/tagProjects';

const API = '/api';

/* ──── Project Templates ──── */
const TEMPLATES: Record<string, { name: string; icon: any; desc: string; content: string; files?: { name: string; content: string }[] }> = {
  blank: {
    name: 'Blank Project', icon: FileText, desc: 'Start from an empty document',
    content: `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\title{My Document}\n\\author{Author}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\section{Introduction}\nHello World!\n\\end{document}`,
  },
  journal: {
    name: 'Journal Article', icon: FileText, desc: 'Academic paper with abstract, sections, and references',
    content: `\\documentclass[12pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{natbib}\n\\title{Article Title}\n\\author{Author Name\\\\Department\\\\University}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\begin{abstract}\nThis is the abstract of the paper.\n\\end{abstract}\n\\section{Introduction}\nIntroduction text here.\n\\section{Related Work}\nRelated work discussion.\n\\section{Methodology}\nMethodology description.\n\\section{Results}\nResults presentation.\n\\section{Discussion}\nDiscussion of findings.\n\\section{Conclusion}\nConclusion and future work.\n\\bibliographystyle{plain}\n\\bibliography{references}\n\\end{document}`,
    files: [{ name: 'references.bib', content: `% Add your BibTeX entries here\n@article{example2024,\n  author = {Author Name},\n  title = {Example Paper},\n  journal = {Journal Name},\n  year = {2024},\n  volume = {1},\n  pages = {1-10}\n}` }],
  },
  book: {
    name: 'Book', icon: BookMarked, desc: 'Book with chapters, table of contents, and bibliography',
    content: `\\documentclass[12pt]{book}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\\title{Book Title}\n\\author{Author Name}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\tableofcontents\n\\chapter{Introduction}\nChapter introduction.\n\\chapter{Main Content}\nMain content here.\n\\chapter{Conclusion}\nFinal thoughts.\n\\bibliographystyle{plain}\n\\bibliography{references}\n\\end{document}`,
    files: [{ name: 'references.bib', content: `% Add your BibTeX entries here\n` }],
  },
  letter: {
    name: 'Formal Letter', icon: Mail, desc: 'Professional business letter template',
    content: `\\documentclass[11pt]{letter}\n\\usepackage[utf8]{inputenc}\n\\usepackage[margin=1in]{geometry}\n\\address{Your Name\\\\Your Address\\\\City, State ZIP}\n\\date{\\today}\n\\begin{document}\n\\begin{letter}{Recipient Name\\\\Company Name\\\\Company Address}\n\\opening{Dear Hiring Manager,}\nI am writing to express my interest in the position. I believe my skills and experience make me a strong candidate.\n\nI would welcome the opportunity to discuss my qualifications further.\n\\closing{Sincerely,}\n\\end{letter}\n\\end{document}`,
  },
  assignment: {
    name: 'Assignment', icon: GraduationCap, desc: 'Academic assignment with problems and solutions',
    content: `\\documentclass[12pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{amssymb}\n\\usepackage[margin=1in]{geometry}\n\\title{Assignment \\#1}\n\\author{Your Name\\\\Student ID: 12345}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\section*{Problem 1}\nSolve the following equation: $x^2 + 5x + 6 = 0$\n\n\\textbf{Solution:}\n$(x+2)(x+3) = 0$, so $x = -2$ or $x = -3$.\n\\section*{Problem 2}\nProve that the sum of the first $n$ natural numbers is $\\frac{n(n+1)}{2}$.\n\\section*{Problem 3}\nSolution here.\n\\end{document}`,
  },
  poster: {
    name: 'Poster', icon: BarChart3, desc: 'Academic poster presentation',
    content: `\\documentclass[25pt, a0paper]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\\usepackage[margin=2cm]{geometry}\n\\title{Research Poster Title}\n\\author{Author Name\\\\University Name}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\section{Abstract}\nBrief abstract of the research.\n\\section{Introduction}\nResearch background and motivation.\n\\section{Methodology}\nMethods used in this research.\n\\section{Results}\nKey findings and data.\n\\section{Conclusion}\nSummary and future directions.\n\\section{References}\n\\begin{enumerate}\n\\item Reference 1\n\\item Reference 2\n\\end{enumerate}\n\\end{document}`,
  },
  presentation: {
    name: 'Presentation', icon: Presentation, desc: 'Beamer slide presentation',
    content: `\\documentclass{beamer}\n\\usetheme{Madrid}\n\\usepackage[utf8]{inputenc}\n\\title{Presentation Title}\n\\author{Presenter Name}\n\\date{\\today}\n\\begin{document}\n\\begin{frame}\n\\titlepage\n\\end{frame}\n\\begin{frame}{Outline}\n\\tableofcontents\n\\end{frame}\n\\section{Introduction}\n\\begin{frame}{Introduction}\nWelcome to this presentation.\n\\begin{itemize}\n\\item Point one\n\\item Point two\n\\end{itemize}\n\\end{frame}\n\\section{Methods}\n\\begin{frame}{Methods}\nDescription of methods used.\n\\end{frame}\n\\section{Results}\n\\begin{frame}{Results}\nKey findings here.\n\\end{frame}\n\\begin{frame}{Thank You}\nQuestions?\n\\end{frame}\n\\end{document}`,
  },
  report: {
    name: 'Report', icon: FileBarChart, desc: 'Professional report with chapters and appendix',
    content: `\\documentclass[12pt]{report}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\title{Report Title}\n\\author{Author Name}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\tableofcontents\n\\chapter{Introduction}\nIntroduction to the report.\n\\chapter{Background}\nBackground information.\n\\chapter{Analysis}\nDetailed analysis.\n\\chapter{Conclusion}\nSummary and recommendations.\n\\appendix\n\\chapter{Additional Data}\nSupplementary information.\n\\end{document}`,
  },
  cv: {
    name: 'CV / Résumé', icon: User, desc: 'Professional curriculum vitae',
    content: `\\documentclass[11pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{enumitem}\n\\usepackage{hyperref}\n\\usepackage[margin=0.75in]{geometry}\n\\title{Your Name -- Curriculum Vitae}\n\\author{email@example.com \\\\ (555) 123-4567 \\\\ City, State}\n\\date{}\n\\begin{document}\n\\maketitle\n\\section{Profile}\nExperienced professional with expertise in software development and project management.\n\\section{Education}\n\\textbf{University Name} \\hfill 2020--2024\\\\\nBachelor of Science in Computer Science\n\\section{Experience}\n\\textbf{Company Name} \\hfill 2023--2024\\\\\nSoftware Engineer\n\\begin{itemize}[nosep]\n\\item Developed and maintained web applications\n\\item Improved system performance by 40%\n\\end{itemize}\n\\section{Skills}\nProgramming: Python, Java, C++, JavaScript\\\\\nTools: Git, Docker, LaTeX, VS Code\n\\section{Projects}\n\\textbf{Project Name} -- Description of the project\n\\section{Certifications}\n\\begin{itemize}[nosep]\n\\item AWS Certified Developer\n\\end{itemize}\n\\end{document}`,
  },
  thesis: {
    name: 'Thesis', icon: GraduationCap, desc: 'Complete thesis structure with chapters',
    content: `\\documentclass[12pt,a4paper]{report}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{natbib}\n\\title{Thesis Title}\n\\author{Student Name}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\begin{abstract}\nThis is the thesis abstract summarizing the research.\n\\end{abstract}\n\\tableofcontents\n\\chapter{Introduction}\nIntroduction and research motivation.\n\\chapter{Literature Review}\nReview of existing work.\n\\chapter{Methodology}\nResearch methodology.\n\\chapter{Results}\nResearch findings.\n\\chapter{Discussion}\nDiscussion of results.\n\\chapter{Conclusion}\nConclusions and future work.\n\\bibliographystyle{plain}\n\\bibliography{references}\n\\appendix\n\\chapter{Additional Materials}\nSupplementary data.\n\\end{document}`,
    files: [{ name: 'references.bib', content: `% Add your BibTeX entries here\n` }],
  },
  markdown: {
    name: 'Markdown Document', icon: FileCode2, desc: 'Simple Markdown document',
    // This is intentionally LaTeX, because TexFlow's PDF pipeline is LaTeX-only.
    content: `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{hyperref}\n\\title{My Document}\n\\author{TexFlow}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\section{Introduction}\nThis document uses a simple, Markdown-like structure while compiling through the supported LaTeX pipeline.\n\\section{Getting Started}\n\\begin{itemize}\n\\item Node.js\n\\item npm\n\\end{itemize}\n\\section{Features}\nFeature A -- Done.\\\\\nFeature B -- In Progress.\n\\section{License}\nMIT License\n\\end{document}`,
  },
};

const IMPORT_OPTIONS = [
  { id: 'zip', name: 'Import .zip File', icon: Upload, desc: 'Upload a .zip project archive' },
  { id: 'tex', name: 'Import .tex File', icon: FileText, desc: 'Upload a LaTeX file' },
  { id: 'github', name: 'Import from GitHub', icon: FolderOpen, desc: 'Clone from a GitHub repository' },
];

interface CreateProjectModalProps {
  onClose: () => void;
  tagToAssign?: string;
}

export default function CreateProjectModal({ onClose, tagToAssign }: CreateProjectModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('token');

  useEffect(() => { inputRef.current?.focus(); }, [showNameInput]);

  if (!token) {
    return <AuthModal onClose={onClose} onSuccess={() => setShowAuthModal(false)} />;
  }

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    const tmpl = TEMPLATES[typeId];
    setProjectName(tmpl ? `${tmpl.name} Project` : 'New Project');
    setShowNameInput(true);
  };

  const handleCreate = async () => {
    const name = projectName.trim();
    if (!name) { setError('Project name is required.'); return; }
    if (!selectedType) return;
    setLoading(true);
    try {
      const project = await dispatch(createProject({ name })).unwrap();
      const tmpl = TEMPLATES[selectedType];
      if (tmpl && project.files?.[0]) {
        await fetch(`${API}/files/${project.files[0].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: tmpl.content }),
        });
      }
      if (tmpl?.files && project.id) {
        for (const f of tmpl.files) {
          await fetch(`${API}/files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ projectId: project.id, name: f.name, content: f.content }),
          });
        }
      }
      toast.success('Project created');
      if (tagToAssign && project.id) {
        addTagToProject(project.id, tagToAssign);
      }
      navigate(`/project/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      toast.error('Failed to create project');
    } finally { setLoading(false); }
  };

  const handleImportZip = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name.replace('.zip', ''));
        const res = await fetch(`${API}/projects/import/zip`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
        });
        if (!res.ok) throw new Error('Import failed');
        const data = await res.json();
        if (tagToAssign && data.project?.id) {
          addTagToProject(data.project.id, tagToAssign);
        }
        toast.success('Project imported');
        navigate(`/project/${data.project.id}`);
      } catch { toast.error('Failed to import project'); }
      finally { setLoading(false); onClose(); }
    };
    input.click();
  };

  const handleImportTex = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tex,.latex,.sty,.cls,.bib';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setLoading(true);
      try {
        const content = await file.text();
        const project = await dispatch(createProject({ name: file.name.replace(/\.(tex|latex)$/, '') })).unwrap();
        if (project.files?.[0]) {
          await fetch(`${API}/files/${project.files[0].id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content }),
          });
        }
        if (tagToAssign && project.id) {
          addTagToProject(project.id, tagToAssign);
        }
        toast.success('Project imported');
        navigate(`/project/${project.id}`);
      } catch { toast.error('Failed to import'); }
      finally { setLoading(false); onClose(); }
    };
    input.click();
  };

  if (showNameInput) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', boxShadow: '0 32px 100px rgba(0,0,0,0.4)' }}>
          <div className="h-1" style={{ background: 'var(--color-accent)' }} />
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Name Your Project</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Project name <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <input ref={inputRef} value={projectName} onChange={e => { setProjectName(e.target.value); setError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowNameInput(false); setSelectedType(null); } }}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: 'var(--color-background)', borderColor: error ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} />
              {error && <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setShowNameInput(false); setSelectedType(null); }} className="px-4 py-2 text-sm font-medium rounded-lg" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>Back</button>
              <button onClick={handleCreate} disabled={!projectName.trim() || loading} className="px-5 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50" style={{ background: 'var(--color-accent)' }}>{loading ? 'Creating...' : 'Create Project'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border overflow-hidden max-h-[85vh] flex flex-col" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', boxShadow: '0 32px 100px rgba(0,0,0,0.4)' }}>
        <div className="h-1" style={{ background: 'var(--color-accent)' }} />
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Create New Project</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Choose a template or start from scratch</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* CREATE NEW */}
          <div className="mb-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Create New</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TEMPLATES).map(([id, tmpl]) => {
                const Icon = tmpl.icon;
                return (
                  <button key={id} onClick={() => handleSelectType(id)}
                    className="flex items-center gap-3 p-3 rounded-lg transition-all text-left"
                    style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-background)'; }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent-soft)' }}>
                      <Icon size={16} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{tmpl.name}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>{tmpl.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* IMPORT */}
          <div className="mb-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Import</h3>
            <div className="grid grid-cols-3 gap-2">
              {IMPORT_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.id} onClick={() => {
                    if (opt.id === 'zip') handleImportZip();
                    else if (opt.id === 'tex') handleImportTex();
                    else toast('GitHub import coming soon');
                  }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all text-center"
                    style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-background)'; }}>
                    <Icon size={18} style={{ color: 'var(--color-text-muted)' }} />
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: 'var(--color-text-primary)' }}>{opt.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TEMPLATES LINK */}
          <div>
            <button onClick={() => { onClose(); navigate('/templates'); }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-all"
              style={{ background: 'var(--color-background)', border: '1px dashed var(--color-border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
              <BookOpen size={16} style={{ color: 'var(--color-accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>Browse All Templates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
