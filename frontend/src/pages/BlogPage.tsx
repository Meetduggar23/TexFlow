import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight } from 'lucide-react';

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: string;
  coverGradient: string;
  content: string;
}

export const blogArticles: BlogArticle[] = [
  {
    id: '1', slug: 'getting-started-with-texflow',
    title: 'Getting Started With TexFlow',
    description: 'Learn how to set up your first project and start writing LaTeX documents in minutes.',
    category: 'Tutorials', tags: ['beginner', 'setup'],
    publishedAt: '2026-08-28', readingTime: '5 min read',
    coverGradient: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))',
    content: `# Getting Started With TexFlow\n\nTexFlow is a free, collaborative LaTeX editor that runs entirely in your browser. No installation required.\n\n## Creating Your First Project\n\n1. Open TexFlow and navigate to the Dashboard\n2. Click "New Project" in the top-right corner\n3. Enter a project name (e.g., "My Research Paper")\n4. Click "Create Project"\n\nYour new project comes with a pre-configured main.tex file containing a basic LaTeX document structure.\n\n## The Editor Layout\n\nThe TexFlow editor is divided into three main panels:\n\n- **File Tree** (left) — Navigate your project files\n- **Code Editor** (center) — Write your LaTeX source\n- **PDF Preview** (right) — View your compiled document\n\n## Writing LaTeX\n\nStart by editing the main.tex file. Here's a basic document:\n\n\\\\documentclass{article}\n\\\\usepackage[utf8]{inputenc}\n\n\\\\title{My First Document}\n\\\\author{Your Name}\n\\\\date{\\\\today}\n\n\\\\begin{document}\n\\\\maketitle\n\n\\\\section{Introduction}\nWelcome to TexFlow! Start writing your LaTeX documents here.\n\n\\\\end{document}\n\n## Compiling\n\nClick the "Recompile" button (or press Ctrl+Enter) to compile your document. The PDF preview will update automatically.\n\n## Tips\n\n- Enable Auto Compile in the compilation settings for real-time preview\n- Use Ctrl+S to save your work frequently\n- The Command Palette (Ctrl+K) provides quick access to all features`
  },
  {
    id: '2', slug: 'writing-your-first-latex-document',
    title: 'Writing Your First LaTeX Document',
    description: 'A beginner-friendly guide to LaTeX document structure, sections, and formatting.',
    category: 'LaTeX', tags: ['beginner', 'latex'],
    publishedAt: '2026-08-27', readingTime: '8 min read',
    coverGradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    content: `# Writing Your First LaTeX Document\n\nLaTeX is the gold standard for academic and technical document preparation.\n\n## Document Structure\n\nEvery LaTeX document has two parts:\n\n1. **Preamble** — Document settings and packages\n2. **Document body** — Your actual content\n\n## Basic Template\n\n\\\\documentclass[12pt,a4paper]{article}\n\\\\usepackage[utf8]{inputenc}\n\\\\usepackage{amsmath}\n\\\\usepackage{graphicx}\n\\\\usepackage{hyperref}\n\n\\\\title{My Document}\n\\\\author{Author Name}\n\\\\date{\\\\today}\n\n\\\\begin{document}\n\\\\maketitle\n\\\\section{Introduction}\nYour introduction goes here.\n\\\\end{document}\n\n## Sections\n\nLaTeX provides a hierarchy of sectioning commands:\n- \\\\section{Title} — Main sections\n- \\\\subsection{Title} — Subsections\n- \\\\subsubsection{Title} — Sub-subsections\n\n## Formatting\n\n- **Bold**: \\\\textbf{text}\n- *Italic*: \\\\textit{text}\n- \\\\texttt{Monospace}: \\\\texttt{text}`
  },
  {
    id: '3', slug: 'understanding-texflow-editor',
    title: "Understanding TexFlow's Editor",
    description: 'Master the code editor, toolbar, and keyboard shortcuts for efficient LaTeX editing.',
    category: 'Editor', tags: ['editor', 'productivity'],
    publishedAt: '2026-08-26', readingTime: '6 min read',
    coverGradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    content: `# Understanding TexFlow's Editor\n\nThe TexFlow editor is designed for efficient LaTeX writing.\n\n## Editor Features\n\n- **Syntax Highlighting** — LaTeX commands, math, and comments are color-coded\n- **Line Numbers** — Quick navigation to specific lines\n- **Bracket Matching** — Matching braces are highlighted\n- **Code Folding** — Collapse sections for better overview\n\n## Keyboard Shortcuts\n\n| Action | Shortcut |\n|--------|----------|\n| Save | Ctrl+S |\n| Undo | Ctrl+Z |\n| Find | Ctrl+F |\n| Compile | Ctrl+Enter |\n| Command Palette | Ctrl+K |`
  },
  {
    id: '4', slug: 'how-automatic-compilation-works',
    title: 'How Automatic Compilation Works',
    description: "Understand TexFlow's auto-compile feature and compilation pipeline.",
    category: 'Tutorials', tags: ['compilation', 'auto-compile'],
    publishedAt: '2026-08-25', readingTime: '4 min read',
    coverGradient: 'linear-gradient(135deg, #10B981, #34D399)',
    content: `# How Automatic Compilation Works\n\nTexFlow's auto-compile feature keeps your PDF preview up to date without manual intervention.\n\n## How It Works\n\n1. You edit your LaTeX source code\n2. After you stop typing, TexFlow triggers a compilation\n3. The server compiles your document\n4. The PDF preview updates with the new output\n\n## Tips\n\n- Auto compile is debounced — it waits until you stop typing\n- For large documents, consider using Fast/Draft mode`
  },
  {
    id: '5', slug: 'managing-files-in-texflow',
    title: 'Managing Files in TexFlow',
    description: 'Learn how to organize your project with files, folders, and uploads.',
    category: 'Tutorials', tags: ['files', 'organization'],
    publishedAt: '2026-08-24', readingTime: '5 min read',
    coverGradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    content: `# Managing Files in TexFlow\n\nA well-organized project structure makes LaTeX writing easier.\n\n## File Tree\n\nThe File Tree panel on the left shows your project's file structure.\n\n### Creating Files\n- Click the + button in the file tree header\n- Select "New File" or "New Folder"\n- Enter a name and press Enter\n\n### Project Structure Tips\n\nA typical LaTeX project structure:\n\nmy-project/\n├── main.tex\n├── references.bib\n├── sections/\n│   ├── introduction.tex\n│   └── methods.tex\n├── figures/\n│   └── diagram.png\n└── styles/\n    └── custom.cls`
  },
  {
    id: '6', slug: 'getting-better-pdf-previews',
    title: 'Getting Better PDF Previews',
    description: 'Tips for zooming, navigating, and customizing your PDF preview panel.',
    category: 'PDF', tags: ['pdf', 'preview'],
    publishedAt: '2026-08-23', readingTime: '4 min read',
    coverGradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
    content: `# Getting Better PDF Previews\n\nThe PDF preview panel shows your compiled document in real-time.\n\n## Navigating the PDF\n\n- Scroll to move through pages\n- Use the zoom controls (+/−) in the PDF toolbar\n- Click the percentage to reset to 100%\n\n## PDF Appearance Toggle\n\nToggle between normal and inverted PDF colors:\n- **Normal** — White background\n- **Inverted** — Dark background (easier on eyes in dark themes)`
  },
  {
    id: '7', slug: 'texflow-keyboard-shortcuts',
    title: 'TexFlow Keyboard Shortcuts',
    description: 'Complete reference of all keyboard shortcuts for faster LaTeX editing.',
    category: 'Editor', tags: ['shortcuts', 'productivity'],
    publishedAt: '2026-08-22', readingTime: '3 min read',
    coverGradient: 'linear-gradient(135deg, #6366F1, #818CF8)',
    content: `# TexFlow Keyboard Shortcuts\n\nMaster these shortcuts to write LaTeX faster.\n\n## File Operations\n\n| Action | Shortcut |\n|--------|----------|\n| Save | Ctrl+S |\n| New File | Ctrl+N |\n\n## Editing\n\n| Action | Shortcut |\n|--------|----------|\n| Undo | Ctrl+Z |\n| Redo | Ctrl+Shift+Z |\n| Find | Ctrl+F |\n\n## Compilation\n\n| Action | Shortcut |\n|--------|----------|\n| Recompile | Ctrl+Enter |`
  },
  {
    id: '8', slug: 'choosing-the-right-texflow-theme',
    title: 'Choosing the Right TexFlow Theme',
    description: "Explore TexFlow's theme options and find the perfect look for your workflow.",
    category: 'Productivity', tags: ['themes', 'customization'],
    publishedAt: '2026-08-21', readingTime: '4 min read',
    coverGradient: 'linear-gradient(135deg, #14B8A6, #2DD4BF)',
    content: `# Choosing the Right TexFlow Theme\n\nTexFlow offers a wide range of themes to match your preferences.\n\n## Theme Categories\n\n### Dark Themes\n- **TexFlow Dark** — The default, with warm orange accents\n- **Dark 2026** — Modern dark with blue accents\n- **Monokai** — Classic developer theme\n\n### Light Themes\n- **Light 2026** — Clean, modern light theme\n- **Light+** — VS Code-inspired light\n- **Solarized Light** — Carefully calibrated colors\n\n## Changing Themes\n\nGo to Settings → Appearance → Theme to browse and select a theme.`
  },
];

const allCategories = ['All', ...new Set(blogArticles.map(a => a.category))];

export default function BlogPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles = useMemo(() => {
    return blogArticles.filter(a => {
      const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.tags.some(t => t.includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const featured = blogArticles[0];

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>TexFlow Blog</h1>
          <p className="text-[14px] md:text-[15px]" style={{ color: 'var(--color-text-muted)' }}>
            Tutorials, product updates, LaTeX tips, and ways to get more from TexFlow.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text" placeholder="Search articles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] rounded-lg border outline-none"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Featured article */}
        {featured && selectedCategory === 'All' && !searchQuery && (
          <button onClick={() => navigate(`/blog/${featured.slug}`)}
            className="w-full text-left rounded-xl border overflow-hidden mb-8 transition-colors"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-72 h-40 md:h-auto flex items-center justify-center flex-shrink-0" style={{ background: featured.coverGradient }}>
                <span className="text-white/30 text-5xl font-bold">{featured.title.charAt(0)}</span>
              </div>
              <div className="p-5 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>Featured</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{featured.category}</span>
                </div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{featured.title}</h2>
                <p className="text-[13px] mb-3" style={{ color: 'var(--color-text-muted)' }}>{featured.description}</p>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  <span>{new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {featured.readingTime}</span>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Categories */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className="px-3 py-1.5 text-[12px] font-medium rounded-lg whitespace-nowrap transition-colors"
              style={{
                background: selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-surface)',
                color: selectedCategory === cat ? '#fff' : 'var(--color-text-secondary)',
                border: `1px solid ${selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Articles grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[15px] font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>No articles found</p>
            <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map(article => (
              <button key={article.id} onClick={() => navigate(`/blog/${article.slug}`)}
                className="text-left rounded-xl border overflow-hidden transition-colors group"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                <div className="h-28 flex items-center justify-center" style={{ background: article.coverGradient }}>
                  <span className="text-white/30 text-3xl font-bold">{article.title.charAt(0)}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{article.category}</span>
                    <ArrowRight size={12} style={{ color: 'var(--color-text-muted)' }} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h3 className="text-[14px] font-semibold mb-1 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>{article.title}</h3>
                  <p className="text-[12px] mb-2 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{article.description}</p>
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {article.readingTime}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
