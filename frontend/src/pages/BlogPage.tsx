import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BlogHeader,
  SearchOverlay,
  CategoryNav,
  FeaturedArticle,
  ArticleGrid,
  PopularArticles,
  NewsletterSection,
  BlogFooter,
  SortControl,
  type SortOption,
} from '../components/blog';

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
  coverImage?: string;
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
    coverImage: 'https://cdn.pixabay.com/photo/2016/11/23/14/45/coding-1853305_1280.jpg',
    content: `# Getting Started With TexFlow\n\nTexFlow is a free, collaborative LaTeX editor that runs entirely in your browser. No installation required.\n\n## Creating Your First Project\n\n1. Open TexFlow and navigate to the Dashboard\n2. Click "New Project" in the top-right corner\n3. Enter a project name (e.g., "My Research Paper")\n4. Click "Create Project"\n\nYour new project comes with a pre-configured main.tex file containing a basic LaTeX document structure.\n\n## The Editor Layout\n\nThe TexFlow editor is divided into three main panels:\n\n- **File Tree** (left) — Navigate your project files\n- **Code Editor** (center) — Write your LaTeX source\n- **PDF Preview** (right) — View your compiled document\n\n## Writing LaTeX\n\nStart by editing the main.tex file. Here's a basic document:\n\n\\\\\\\\documentclass{article}\n\\\\\\\\usepackage[utf8]{inputenc}\n\n\\\\\\\\title{My First Document}\n\\\\\\\\author{Your Name}\n\\\\\\\\date{\\\\\\\\today}\n\n\\\\\\\\begin{document}\n\\\\\\\\maketitle\n\n\\\\\\\\section{Introduction}\nWelcome to TexFlow! Start writing your LaTeX documents here.\n\n\\\\\\\\end{document}\n\n## Compiling\n\nClick the "Recompile" button (or press Ctrl+Enter) to compile your document. The PDF preview will update automatically.\n\n## Tips\n\n- Enable Auto Compile in the compilation settings for real-time preview\n- Use Ctrl+S to save your work frequently\n- The Command Palette (Ctrl+K) provides quick access to all features`
  },
  {
    id: '2', slug: 'writing-your-first-latex-document',
    title: 'Writing Your First LaTeX Document',
    description: 'A beginner-friendly guide to LaTeX document structure, sections, and formatting.',
    category: 'LaTeX', tags: ['beginner', 'latex'],
    publishedAt: '2026-08-27', readingTime: '8 min read',
    coverGradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    coverImage: 'https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849826_1280.jpg',
    content: `# Writing Your First LaTeX Document\n\nLaTeX is the gold standard for academic and technical document preparation.\n\n## Document Structure\n\nEvery LaTeX document has two parts:\n\n1. **Preamble** — Document settings and packages\n2. **Document body** — Your actual content\n\n## Basic Template\n\n\\\\\\\\documentclass[12pt,a4paper]{article}\n\\\\\\\\usepackage[utf8]{inputenc}\n\\\\\\\\usepackage{amsmath}\n\\\\\\\\usepackage{graphicx}\n\\\\\\\\usepackage{hyperref}\n\n\\\\\\\\title{My Document}\n\\\\\\\\author{Author Name}\n\\\\\\\\date{\\\\\\\\today}\n\n\\\\\\\\begin{document}\n\\\\\\\\maketitle\n\\\\\\\\section{Introduction}\nYour introduction goes here.\n\\\\\\\\end{document}\n\n## Sections\n\nLaTeX provides a hierarchy of sectioning commands:\n- \\\\\\\\section{Title} — Main sections\n- \\\\\\\\subsection{Title} — Subsections\n- \\\\\\\\subsubsection{Title} — Sub-subsections\n\n## Formatting\n\n- **Bold**: \\\\\\\\textbf{text}\n- *Italic*: \\\\\\\\textit{text}\n- \\\\\\\\texttt{Monospace}: \\\\\\\\texttt{text}`
  },
  {
    id: '3', slug: 'understanding-texflow-editor',
    title: "Understanding TexFlow's Editor",
    description: 'Master the code editor, toolbar, and keyboard shortcuts for efficient LaTeX editing.',
    category: 'Editor', tags: ['editor', 'productivity'],
    publishedAt: '2026-08-26', readingTime: '6 min read',
    coverGradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    coverImage: 'https://cdn.pixabay.com/photo/2016/11/30/20/58/programming-1873854_960_720.png',
    content: `# Understanding TexFlow's Editor\n\nThe TexFlow editor is designed for efficient LaTeX writing.\n\n## Editor Features\n\n- **Syntax Highlighting** — LaTeX commands, math, and comments are color-coded\n- **Line Numbers** — Quick navigation to specific lines\n- **Bracket Matching** — Matching braces are highlighted\n- **Code Folding** — Collapse sections for better overview\n\n## Keyboard Shortcuts\n\n| Action | Shortcut |\n|--------|----------|\n| Save | Ctrl+S |\n| Undo | Ctrl+Z |\n| Find | Ctrl+F |\n| Compile | Ctrl+Enter |\n| Command Palette | Ctrl+K |`
  },
  {
    id: '4', slug: 'how-automatic-compilation-works',
    title: 'How Automatic Compilation Works',
    description: "Understand TexFlow's auto-compile feature and compilation pipeline.",
    category: 'Tutorials', tags: ['compilation', 'auto-compile'],
    publishedAt: '2026-08-25', readingTime: '4 min read',
    coverGradient: 'linear-gradient(135deg, #10B981, #34D399)',
    coverImage: 'https://cdn.pixabay.com/photo/2016/04/15/18/05/computer-1331579_960_720.png',
    content: `# How Automatic Compilation Works\n\nTexFlow's auto-compile feature keeps your PDF preview up to date without manual intervention.\n\n## How It Works\n\n1. You edit your LaTeX source code\n2. After you stop typing, TexFlow triggers a compilation\n3. The server compiles your document\n4. The PDF preview updates with the new output\n\n## Tips\n\n- Auto compile is debounced — it waits until you stop typing\n- For large documents, consider using Fast/Draft mode`
  },
  {
    id: '5', slug: 'managing-files-in-texflow',
    title: 'Managing Files in TexFlow',
    description: 'Learn how to organize your project with files, folders, and uploads.',
    category: 'Tutorials', tags: ['files', 'organization'],
    publishedAt: '2026-08-24', readingTime: '5 min read',
    coverGradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    coverImage: 'https://cdn.pixabay.com/photo/2013/07/13/10/22/books-155185_1280.png',
    content: `# Managing Files in TexFlow\n\nA well-organized project structure makes LaTeX writing easier.\n\n## File Tree\n\nThe File Tree panel on the left shows your project's file structure.\n\n### Creating Files\n- Click the + button in the file tree header\n- Select "New File" or "New Folder"\n- Enter a name and press Enter\n\n### Project Structure Tips\n\nA typical LaTeX project structure:\n\nmy-project/\n├── main.tex\n├── references.bib\n├── sections/\n│   ├── introduction.tex\n│   └── methods.tex\n├── figures/\n│   └── diagram.png\n└── styles/\n    └── custom.cls`
  },
  {
    id: '6', slug: 'getting-better-pdf-previews',
    title: 'Getting Better PDF Previews',
    description: 'Tips for zooming, navigating, and customizing your PDF preview panel.',
    category: 'PDF', tags: ['pdf', 'preview'],
    publishedAt: '2026-08-23', readingTime: '4 min read',
    coverGradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
    coverImage: 'https://cdn.pixabay.com/photo/2017/01/17/15/26/network-1987214_1280.png',
    content: `# Getting Better PDF Previews\n\nThe PDF preview panel shows your compiled document in real-time.\n\n## Navigating the PDF\n\n- Scroll to move through pages\n- Use the zoom controls (+/−) in the PDF toolbar\n- Click the percentage to reset to 100%\n\n## PDF Appearance Toggle\n\nToggle between normal and inverted PDF colors:\n- **Normal** — White background\n- **Inverted** — Dark background (easier on eyes in dark themes)`
  },
  {
    id: '7', slug: 'texflow-keyboard-shortcuts',
    title: 'TexFlow Keyboard Shortcuts',
    description: 'Complete reference of all keyboard shortcuts for faster LaTeX editing.',
    category: 'Editor', tags: ['shortcuts', 'productivity'],
    publishedAt: '2026-08-22', readingTime: '3 min read',
    coverGradient: 'linear-gradient(135deg, #6366F1, #818CF8)',
    coverImage: 'https://cdn.pixabay.com/photo/2016/09/15/18/28/update-1672346_640.png',
    content: `# TexFlow Keyboard Shortcuts\n\nMaster these shortcuts to write LaTeX faster.\n\n## File Operations\n\n| Action | Shortcut |\n|--------|----------|\n| Save | Ctrl+S |\n| New File | Ctrl+N |\n\n## Editing\n\n| Action | Shortcut |\n|--------|----------|\n| Undo | Ctrl+Z |\n| Redo | Ctrl+Shift+Z |\n| Find | Ctrl+F |\n\n## Compilation\n\n| Action | Shortcut |\n|--------|----------|\n| Recompile | Ctrl+Enter |`
  },
  {
    id: '8', slug: 'choosing-the-right-texflow-theme',
    title: 'Choosing the Right TexFlow Theme',
    description: "Explore TexFlow's theme options and find the perfect look for your workflow.",
    category: 'Productivity', tags: ['themes', 'customization'],
    publishedAt: '2026-08-21', readingTime: '4 min read',
    coverGradient: 'linear-gradient(135deg, #14B8A6, #2DD4BF)',
    coverImage: 'https://cdn.pixabay.com/photo/2022/03/31/00/31/music-7101987_1280.jpg',
    content: `# Choosing the Right TexFlow Theme\n\nTexFlow offers a wide range of themes to match your preferences.\n\n## Theme Categories\n\n### Dark Themes\n- **TexFlow Dark** — The default, with warm orange accents\n- **Dark 2026** — Modern dark with blue accents\n- **Monokai** — Classic developer theme\n\n### Light Themes\n- **Light 2026** — Clean, modern light theme\n- **Light+** — VS Code-inspired light\n- **Solarized Light** — Carefully calibrated colors\n\n## Changing Themes\n\nGo to Settings → Appearance → Theme to browse and select a theme.`
  },
];

const allCategories = ['All', ...new Set(blogArticles.map(a => a.category))];

function sortArticles(articles: BlogArticle[], sort: SortOption): BlogArticle[] {
  const sorted = [...articles];
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    case 'shortest':
      return sorted.sort((a, b) => parseInt(a.readingTime) - parseInt(b.readingTime));
    case 'longest':
      return sorted.sort((a, b) => parseInt(b.readingTime) - parseInt(a.readingTime));
    case 'latest':
    default:
      return sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
}

export default function BlogPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  const handleSearchOpen = useCallback(() => setSearchOpen(true), []);
  const handleSearchClose = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredArticles = useMemo(() => {
    const filtered = blogArticles.filter(a => {
      const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
      return matchesCategory;
    });
    return sortArticles(filtered, sortBy);
  }, [selectedCategory, sortBy]);

  const featured = blogArticles[0];
  const popularArticles = blogArticles.slice(0, 5);

  return (
    <div className="h-full overflow-auto blog-page" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-8 md:py-12">
        <BlogHeader onSearchOpen={handleSearchOpen} />

        <CategoryNav
          categories={allCategories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Featured */}
        {selectedCategory === 'All' && (
          <FeaturedArticle article={featured} />
        )}

        {/* Latest Articles heading + Sort */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Latest Articles
          </h2>
          <SortControl value={sortBy} onChange={setSortBy} />
        </div>

        {/* Articles grid */}
        <ArticleGrid articles={filteredArticles} />

        {/* Popular Articles */}
        {selectedCategory === 'All' && (
          <PopularArticles articles={popularArticles} />
        )}

        {/* Newsletter */}
        <NewsletterSection />

        {/* Footer */}
        <BlogFooter />
      </div>

      {/* Search overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={handleSearchClose}
        articles={blogArticles}
      />
    </div>
  );
}
