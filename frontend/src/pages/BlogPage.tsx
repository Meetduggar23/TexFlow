import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Clock, Tag } from 'lucide-react';

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
    coverGradient: 'linear-gradient(135deg, #FF4C29, #FF6345)',
    content: `# Getting Started With TexFlow

TexFlow is a free, collaborative LaTeX editor that runs entirely in your browser. No installation required.

## Creating Your First Project

1. Open TexFlow and navigate to the Dashboard
2. Click "New Project" in the top-right corner
3. Enter a project name (e.g., "My Research Paper")
4. Click "Create Project"

Your new project comes with a pre-configured main.tex file containing a basic LaTeX document structure.

## The Editor Layout

The TexFlow editor is divided into three main panels:

- **File Tree** (left) — Navigate your project files
- **Code Editor** (center) — Write your LaTeX source
- **PDF Preview** (right) — View your compiled document

## Writing LaTeX

Start by editing the main.tex file. Here's a basic document:

\\documentclass{article}
\\usepackage[utf8]{inputenc}

\\title{My First Document}
\\author{Your Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Introduction}
Welcome to TexFlow! Start writing your LaTeX documents here.

\\end{document}

## Compiling

Click the "Recompile" button (or press Ctrl+Enter) to compile your document. The PDF preview will update automatically.

## Tips

- Enable Auto Compile in the compilation settings for real-time preview
- Use Ctrl+S to save your work frequently
- The Command Palette (Ctrl+K) provides quick access to all features`
  },
  {
    id: '2', slug: 'writing-your-first-latex-document',
    title: 'Writing Your First LaTeX Document',
    description: 'A beginner-friendly guide to LaTeX document structure, sections, and formatting.',
    category: 'LaTeX', tags: ['beginner', 'latex'],
    publishedAt: '2026-08-27', readingTime: '8 min read',
    coverGradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    content: `# Writing Your First LaTeX Document

LaTeX is the gold standard for academic and technical document preparation. This guide walks you through creating your first document.

## Document Structure

Every LaTeX document has two parts:

1. **Preamble** — Document settings and packages
2. **Document body** — Your actual content

## Basic Template

\\documentclass[12pt,a4paper]{article}

\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{My Document}
\\author{Author Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Introduction}
Your introduction goes here.

\\section{Methods}
Describe your methods.

\\section{Results}
Present your results.

\\section{Conclusion}
Summarize your findings.

\\end{document}

## Sections

LaTeX provides a hierarchy of sectioning commands:
- \\section{Title} — Main sections
- \\subsection{Title} — Subsections
- \\subsubsection{Title} — Sub-subsections

## Formatting

- **Bold**: \\textbf{text}
- *Italic*: \\textit{text}
- \\texttt{Monospace}: \\texttt{text}

## Lists

Use itemize for bullet lists and enumerate for numbered lists.

## Next Steps

Explore TexFlow's other tutorials for more advanced topics like tables, figures, and bibliography management.`
  },
  {
    id: '3', slug: 'understanding-texflow-editor',
    title: "Understanding TexFlow's Editor",
    description: 'Master the code editor, toolbar, and keyboard shortcuts for efficient LaTeX editing.',
    category: 'Editor', tags: ['editor', 'productivity'],
    publishedAt: '2026-08-26', readingTime: '6 min read',
    coverGradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    content: `# Understanding TexFlow's Editor

The TexFlow editor is designed for efficient LaTeX writing. Here's how to make the most of it.

## Editor Features

- **Syntax Highlighting** — LaTeX commands, math, and comments are color-coded
- **Line Numbers** — Quick navigation to specific lines
- **Active Line Highlighting** — See exactly where your cursor is
- **Bracket Matching** — Matching braces are highlighted
- **Code Folding** — Collapse sections for better overview

## Toolbar Actions

The toolbar provides one-click access to common formatting:

- Undo / Redo
- Bold (Ctrl+B) / Italic (Ctrl+I)
- Insert image, table, link
- Bullet and numbered lists
- Code/Visual mode toggle

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | Ctrl+S |
| Undo | Ctrl+Z |
| Redo | Ctrl+Shift+Z |
| Find | Ctrl+F |
| Compile | Ctrl+Enter |
| Command Palette | Ctrl+K |

## Multiple Tabs

Open multiple files in tabs. Click files in the tree to open them, and use tabs to switch between open files.

## Editing Modes

Switch between Editing, Suggesting, and Read-Only modes using the toolbar dropdown.`
  },
  {
    id: '4', slug: 'how-automatic-compilation-works',
    title: 'How Automatic Compilation Works',
    description: 'Understand TexFlow\'s auto-compile feature and compilation pipeline.',
    category: 'Tutorials', tags: ['compilation', 'auto-compile'],
    publishedAt: '2026-08-25', readingTime: '4 min read',
    coverGradient: 'linear-gradient(135deg, #10B981, #34D399)',
    content: `# How Automatic Compilation Works

TexFlow's auto-compile feature keeps your PDF preview up to date without manual intervention.

## How It Works

1. You edit your LaTeX source code
2. After you stop typing for a short delay, TexFlow triggers a compilation
3. The server compiles your document
4. The PDF preview updates with the new output

## Enabling Auto Compile

Click the arrow next to the Recompile button to open compilation settings. Toggle Auto Compile to "On".

## Compilation Modes

- **Normal** — Full compilation with all packages
- **Fast (Draft)** — Quick compilation for faster preview, may skip some formatting

## When Auto Compile Doesn't Work

- Check for syntax errors in your LaTeX code
- Look at the terminal panel for error messages
- Try a manual recompile with Ctrl+Enter
- Use "Clean Build" from Tools to clear cached files

## Tips

- Auto compile is debounced — it waits until you stop typing
- For large documents, consider using Fast/Draft mode
- You can always disable auto compile and compile manually`
  },
  {
    id: '5', slug: 'managing-files-in-texflow',
    title: 'Managing Files in TexFlow',
    description: 'Learn how to organize your project with files, folders, and uploads.',
    category: 'Tutorials', tags: ['files', 'organization'],
    publishedAt: '2026-08-24', readingTime: '5 min read',
    coverGradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    content: `# Managing Files in TexFlow

A well-organized project structure makes LaTeX writing easier. Here's how to manage files in TexFlow.

## File Tree

The File Tree panel on the left shows your project's file structure.

### Creating Files
- Click the + button in the file tree header
- Select "New File" or "New Folder"
- Enter a name and press Enter

### Uploading Files
- Click the upload button in the file tree header
- Select files from your computer
- Supported formats: .tex, .cls, .sty, .bib, .png, .jpg, .pdf

### Renaming and Deleting
- Right-click any file for the context menu
- Select Rename or Delete

## Project Structure Tips

A typical LaTeX project structure:

my-project/
├── main.tex          (main document)
├── references.bib    (bibliography)
├── sections/
│   ├── introduction.tex
│   ├── methods.tex
│   └── conclusion.tex
├── figures/
│   ├── diagram.png
│   └── chart.pdf
└── styles/
    └── custom.cls

## File Outline

The File Outline at the bottom of the file tree shows sections and subsections of the currently open document for quick navigation.`
  },
  {
    id: '6', slug: 'getting-better-pdf-previews',
    title: 'Getting Better PDF Previews',
    description: 'Tips for zooming, navigating, and customizing your PDF preview panel.',
    category: 'PDF', tags: ['pdf', 'preview'],
    publishedAt: '2026-08-23', readingTime: '4 min read',
    coverGradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
    content: `# Getting Better PDF Previews

The PDF preview panel in TexFlow shows your compiled document in real-time. Here's how to use it effectively.

## Navigating the PDF

- Scroll to move through pages
- Use the zoom controls (+/−) in the PDF toolbar
- Click the percentage to reset to 100%

## Resizing the Panel

Drag the divider between the Code Editor and PDF Preview to adjust the split. Make the PDF wider for better readability, or the code wider for more editing space.

## PDF Appearance Toggle

Toggle between normal and inverted PDF colors:
- **Normal** — White background (standard)
- **Inverted** — Dark background (easier on eyes in dark themes)

The toggle only affects the PDF — your TexFlow theme remains unchanged.

## Downloading

Download your PDF directly from the PDF toolbar, or use the editor toolbar to download both PDF and source files.

## Tips

- Use Ctrl+Enter to quickly recompile and update the preview
- The PDF panel remembers your zoom level
- Resize the panel to fit your workflow`
  },
  {
    id: '7', slug: 'texflow-keyboard-shortcuts',
    title: 'TexFlow Keyboard Shortcuts',
    description: 'Complete reference of all keyboard shortcuts for faster LaTeX editing.',
    category: 'Editor', tags: ['shortcuts', 'productivity'],
    publishedAt: '2026-08-22', readingTime: '3 min read',
    coverGradient: 'linear-gradient(135deg, #6366F1, #818CF8)',
    content: `# TexFlow Keyboard Shortcuts

Master these shortcuts to write LaTeX faster in TexFlow.

## File Operations

| Action | Shortcut |
|--------|----------|
| Save | Ctrl+S |
| New File | Ctrl+N |

## Editing

| Action | Shortcut |
|--------|----------|
| Undo | Ctrl+Z |
| Redo | Ctrl+Shift+Z |
| Find | Ctrl+F |
| Find & Replace | Ctrl+H |
| Select All | Ctrl+A |

## Formatting

| Action | Shortcut |
|--------|----------|
| Bold | Ctrl+B |
| Italic | Ctrl+I |

## View

| Action | Shortcut |
|--------|----------|
| Toggle File Explorer | Ctrl+Shift+B |
| Command Palette | Ctrl+K |
| Toggle Terminal | Ctrl+~ |

## Compilation

| Action | Shortcut |
|--------|----------|
| Recompile | Ctrl+Enter |

## Navigation

| Action | Shortcut |
|--------|----------|
| Indent | Tab |
| Navigate menu | Arrow keys |
| Close menu | Escape |

## Tips

- Use Ctrl+K to open the Command Palette for quick access to any command
- Tab and Shift+Tab for indenting and outdenting
- Escape closes any open menu or dialog`
  },
  {
    id: '8', slug: 'choosing-the-right-texflow-theme',
    title: 'Choosing the Right TexFlow Theme',
    description: 'Explore TexFlow\'s theme options and find the perfect look for your workflow.',
    category: 'Productivity', tags: ['themes', 'customization'],
    publishedAt: '2026-08-21', readingTime: '4 min read',
    coverGradient: 'linear-gradient(135deg, #14B8A6, #2DD4BF)',
    content: `# Choosing the Right TexFlow Theme

TexFlow offers a wide range of themes to match your preferences and working environment.

## Theme Categories

### Dark Themes
Best for low-light environments and reducing eye strain:
- **TexFlow Dark** — The default, with warm orange accents
- **Dark 2026** — Modern dark with blue accents
- **Monokai** — Classic developer theme
- **Abyss** — Deep blue dark theme

### Light Themes
Best for bright environments and printing:
- **Light 2026** — Clean, modern light theme
- **Light+** — VS Code-inspired light
- **Solarized Light** — Carefully calibrated colors

### High Contrast
For accessibility and maximum readability:
- **Dark High Contrast**
- **Light High Contrast**

## Changing Themes

Go to Settings → Appearance → Theme to browse and select a theme.

## Theme Features

- Instant switching — no page refresh needed
- Code editor adapts to the theme
- PDF preview remains independent
- All UI elements update consistently

## Tips

- Try a few themes to find your favorite
- Use high contrast themes for better accessibility
- Dark themes are great for long writing sessions`
  },
];

const categories = ['All', ...new Set(blogArticles.map(a => a.category))];

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

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => navigate('/help')} className="flex items-center gap-2 text-sm mb-4 transition-colors" style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            ><ArrowLeft size={14} /> Help</button>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>TexFlow Blog</h1>
            <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
              Stay updated with TexFlow news, tutorials, LaTeX tips, and product updates.
            </p>
          </div>

          {/* Search + Categories */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border outline-none"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                  style={{
                    background: selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: selectedCategory === cat ? '#fff' : 'var(--color-text-secondary)',
                    border: `1px solid ${selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  }}
                >{cat}</button>
              ))}
            </div>
          </div>

          {/* Articles grid */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No articles found</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Try a different search term or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
                <button key={article.id} onClick={() => navigate(`/blog/${article.slug}`)}
                  className="text-left rounded-2xl border overflow-hidden transition-all group"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Cover */}
                  <div className="h-36 flex items-center justify-center" style={{ background: article.coverGradient }}>
                    <span className="text-white/80 text-4xl font-bold">{article.title.charAt(0)}</span>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{article.category}</span>
                    <h3 className="text-base font-semibold mt-1 mb-2 group-hover:text-[var(--color-accent)] transition-colors" style={{ color: 'var(--color-text-primary)' }}>{article.title}</h3>
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{article.description}</p>
                    <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
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
    </div>
  );
}
