import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronRight, Copy, Check } from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  category: string;
  content: string;
  code?: string;
  related?: string[];
}

const docSections: DocSection[] = [
  // Getting Started
  { id: 'introduction', title: 'Introduction', category: 'Getting Started',
    content: 'Welcome to TexFlow — a free, collaborative LaTeX editor that runs entirely in your browser. TexFlow makes it easy to write, compile, and preview LaTeX documents without installing any software.',
    related: ['creating-project', 'dashboard'] },
  { id: 'creating-project', title: 'Creating Your First Project', category: 'Getting Started',
    content: 'Create a new TexFlow project from the Dashboard.\n\n1. Click "New Project" in the top-right corner of the Dashboard.\n2. Enter a project name (e.g., "My Resume").\n3. Optionally add a description.\n4. Click "Create Project".\n\nYour project will be created with a default main.tex file containing a basic LaTeX document structure.',
    code: `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\n\\title{My Document}\n\\author{Author}\n\\date{\\today}\n\n\\begin{document}\n\\maketitle\n\n\\section{Introduction}\nHello, TexFlow!\n\\end{document}`,
    related: ['dashboard', 'file-tree'] },
  { id: 'dashboard', title: 'Dashboard', category: 'Getting Started',
    content: 'The Dashboard is your project management hub. From here you can:\n\n• View all your projects in a searchable table\n• Create new projects\n• Open, rename, duplicate, or delete projects\n• Search through your projects\n• Navigate to Trash, Settings, and Help\n\nThe sidebar provides quick access to your projects, shared projects, archived projects, library templates, and trash.',
    related: ['creating-project', 'project-management'] },
  { id: 'project-management', title: 'Project Management', category: 'Getting Started',
    content: 'TexFlow provides several project management features:\n\n• Rename: Click the three-dot menu on any project and select "Rename"\n• Duplicate: Create an independent copy of a project\n• Download: Export your project as a ZIP file\n• Delete: Move projects to Trash (restorable) or delete permanently\n• Search: Filter projects by name using the search bar',
    related: ['dashboard', 'creating-project'] },

  // Editor
  { id: 'code-editor', title: 'Code Editor', category: 'Editor',
    content: 'The Code Editor is where you write your LaTeX source code. It features:\n\n• Syntax highlighting for LaTeX\n• Line numbers\n• Active line highlighting\n• Bracket matching\n• Code folding\n• Undo/Redo\n• Keyboard shortcuts (Ctrl+S to save, Ctrl+Z to undo)\n\nThe editor supports multiple open tabs, so you can work on several files simultaneously.',
    related: ['toolbar', 'keyboard-shortcuts'] },
  { id: 'visual-editor', title: 'Visual Editor', category: 'Editor',
    content: 'Toggle between "Code" and "Visual" mode in the toolbar. Visual mode provides a more intuitive editing experience for users who prefer a WYSIWYG-like interface.',
    related: ['code-editor', 'toolbar'] },
  { id: 'toolbar', title: 'Toolbar', category: 'Editor',
    content: 'The editor toolbar sits above the code editor and provides quick access to formatting actions:\n\n• Undo / Redo\n• Bold (Ctrl+B)\n• Italic (Ctrl+I)\n• Strikethrough\n• Inline code\n• Insert image, table, link\n• Bullet list, numbered list\n• Superscript, subscript\n• Center alignment\n• Code/Visual toggle\n• Editing mode selector',
    related: ['code-editor', 'keyboard-shortcuts'] },
  { id: 'keyboard-shortcuts', title: 'Keyboard Shortcuts', category: 'Editor',
    content: 'TexFlow supports standard keyboard shortcuts:\n\n• Ctrl+S — Save\n• Ctrl+Z — Undo\n• Ctrl+Shift+Z — Redo\n• Ctrl+B — Bold\n• Ctrl+I — Italic\n• Ctrl+F — Find\n• Ctrl+K — Command Palette\n• Ctrl+Enter — Compile\n• Ctrl+Shift+B — Toggle file explorer\n• Tab — Indent',
    related: ['code-editor', 'toolbar'] },
  { id: 'editing-modes', title: 'Editing Modes', category: 'Editor',
    content: 'TexFlow supports three editing modes:\n\n• Editing — Full editing access\n• Suggesting — Changes appear as suggestions (like Google Docs)\n• Viewing — Read-only mode\n\nSwitch modes using the dropdown in the toolbar.',
    related: ['code-editor'] },
  { id: 'file-tree', title: 'File Tree', category: 'Editor',
    content: 'The File Tree (left sidebar) shows your project\'s file structure:\n\n• Click a file to open it in the editor\n• Click a folder to expand/collapse it\n• Right-click for context menu (rename, delete, duplicate)\n• Use the + button to create new files or folders\n• Upload existing files with the upload button\n\nThe File Outline section at the bottom shows sections and subsections of the current document.',
    related: ['code-editor'] },

  // LaTeX
  { id: 'latex-basics', title: 'LaTeX Basics', category: 'LaTeX',
    content: 'LaTeX is a typesetting system used for creating professional documents. Basic structure:\n\n• \\documentclass — Defines the document type\n• \\usepackage — Loads additional packages\n• \\begin{document} — Start of content\n• \\end{document} — End of content\n• \\section{} — Creates a section heading',
    code: `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\n\\begin{document}\n\\section{Hello}\nThis is my first document.\n\\end{document}`,
    related: ['documents', 'sections'] },
  { id: 'documents', title: 'Documents', category: 'LaTeX',
    content: 'Common LaTeX document classes:\n\n• article — For short documents, no chapters\n• report — For longer documents with chapters\n• book — For full books\n• beamer — For presentations\n• letter — For formal letters',
    related: ['latex-basics', 'sections'] },
  { id: 'sections', title: 'Sections', category: 'LaTeX',
    content: 'LaTeX provides a hierarchy of sectioning commands:\n\n• \\section{Title}\n• \\subsection{Title}\n• \\subsubsection{Title}\n• \\paragraph{Title}\n• \\subparagraph{Title}',
    code: `\\section{Introduction}\nSome text here.\n\n\\subsection{Background}\nMore detailed text.\n\n\\subsubsection{Details}\nEven more detail.`,
    related: ['latex-basics', 'documents'] },
  { id: 'tables', title: 'Tables', category: 'LaTeX',
    content: 'Create tables using the tabular environment:\n\n• Use & to separate columns\n• Use \\\\ to end rows\n• Use \\hline for horizontal lines\n• Column specifiers: l (left), c (center), r (right)',
    code: `\\begin{tabular}{|l|c|r|}\n\\hline\nName & Age & Grade \\\\\n\\hline\nAlice & 20 & A \\\\\nBob & 22 & B \\\\\n\\hline\n\\end{tabular}`,
    related: ['latex-basics'] },
  { id: 'images', title: 'Images', category: 'LaTeX',
    content: 'Insert images using the graphicx package:\n\n1. Add \\usepackage{graphicx} in preamble\n2. Use \\includegraphics{filename} in your document\n3. You can control size with width/height options',
    code: `\\usepackage{graphicx}\n\n\\begin{document}\n\\includegraphics[width=0.5\\textwidth]{image.png}\n\\end{document}`,
    related: ['latex-basics'] },
  { id: 'references', title: 'References', category: 'LaTeX',
    content: 'Cross-reference sections, figures, and tables:\n\n1. Add \\label{name} after the element\n2. Reference with \\ref{name}\n3. Use \\eqref{name} for equations',
    code: `\\section{Introduction}\\label{sec:intro}\nSee Section \\ref{sec:intro} for details.`,
    related: ['bibliography', 'latex-basics'] },
  { id: 'bibliography', title: 'Bibliography', category: 'LaTeX',
    content: 'Manage citations with BibTeX:\n\n1. Create a .bib file with references\n2. Add \\bibliography{filename} at the end\n3. Cite with \\cite{key}',
    code: `\\usepackage{natbib}\n\n\\begin{document}\nAs shown by \\cite{smith2020}...\n\n\\bibliographystyle{plain}\n\\bibliography{references}\n\\end{document}`,
    related: ['references'] },
  { id: 'packages', title: 'Packages', category: 'LaTeX',
    content: 'Commonly used LaTeX packages:\n\n• amsmath — Mathematical formulas\n• graphicx — Include images\n• hyperref — Clickable links\n• geometry — Page margins\n• fancyhdr — Custom headers/footers\n• listings — Code listings\n• tikz — Graphics and diagrams\n• natbib — Bibliography management',
    related: ['latex-basics'] },

  // Compilation
  { id: 'recompile', title: 'Recompile', category: 'Compilation',
    content: 'Click the "Recompile" button in the editor toolbar to compile your LaTeX document. The compiled PDF will appear in the preview panel.\n\nKeyboard shortcut: Ctrl+Enter',
    related: ['auto-compile', 'compile-errors'] },
  { id: 'auto-compile', title: 'Auto Compile', category: 'Compilation',
    content: 'When Auto Compile is enabled, TexFlow automatically recompiles your document shortly after you stop typing. This keeps the PDF preview up to date without manual action.\n\nToggle Auto Compile in the compilation settings dropdown (click the arrow next to Recompile).',
    related: ['recompile', 'compile-modes'] },
  { id: 'compile-modes', title: 'Compile Modes', category: 'Compilation',
    content: 'TexFlow supports two compile modes:\n\n• Normal — Full compilation with all packages\n• Fast (Draft) — Quick compilation for faster preview',
    related: ['recompile', 'auto-compile'] },
  { id: 'compile-errors', title: 'Compilation Errors', category: 'Compilation',
    content: 'When compilation fails, TexFlow shows error messages in the terminal panel at the bottom of the editor.\n\nCommon issues:\n• Missing packages — Add \\usepackage{package}\n• Syntax errors — Check for unclosed braces {}\n• Undefined references — Ensure \\label matches \\ref',
    related: ['recompile', 'logs'] },
  { id: 'logs', title: 'Logs', category: 'Compilation',
    content: 'View compilation logs in the Terminal panel. The logs show:\n• Pages compiled\n• Warnings (undefined references, missing packages)\n• Errors with line numbers',
    related: ['compile-errors'] },

  // PDF
  { id: 'pdf-preview', title: 'PDF Preview', category: 'PDF',
    content: 'The PDF Preview panel shows your compiled document in real-time. It sits to the right of the Code Editor.\n\n• Use the divider to resize the PDF panel\n• Click the collapse arrow to hide/show the PDF\n• The PDF updates after each compilation',
    related: ['pdf-zoom', 'pdf-download'] },
  { id: 'pdf-zoom', title: 'Zoom', category: 'PDF',
    content: 'Control PDF zoom using the toolbar in the PDF panel:\n\n• − / + buttons to zoom in/out\n• Percentage display shows current zoom level\n• Reset to 100% by clicking the percentage',
    related: ['pdf-preview'] },
  { id: 'pdf-download', title: 'Download', category: 'PDF',
    content: 'Download your compiled PDF from the editor toolbar:\n\n• Click the download button to save the PDF\n• You can also download the full source as a ZIP',
    related: ['pdf-preview'] },
  { id: 'pdf-invert', title: 'PDF Appearance', category: 'PDF',
    content: 'Toggle PDF color inversion to switch between:\n\n• Normal — White background PDF\n• Inverted — Dark background PDF\n\nThis is useful when working in dark themes. The inversion only affects the PDF, not the TexFlow interface.',
    related: ['pdf-preview'] },

  // Projects
  { id: 'create-project', title: 'Create Project', category: 'Projects', content: 'See Getting Started → Creating Your First Project.', related: ['creating-project'] },
  { id: 'rename-project', title: 'Rename Project', category: 'Projects',
    content: 'Rename a project from the Dashboard:\n\n1. Click the three-dot menu (⋯) on the project row\n2. Select "Rename"\n3. Enter the new name\n4. Click "Save"\n\nThe project name updates across the Dashboard and Editor.',
    related: ['project-management'] },
  { id: 'duplicate-project', title: 'Duplicate Project', category: 'Projects',
    content: 'Create an independent copy of a project:\n\n1. Click the three-dot menu (⋯) on the project row\n2. Select "Duplicate"\n3. A new project named "[Name] Copy" is created\n\nThe duplicate is fully independent — changes to one do not affect the other.',
    related: ['project-management'] },
  { id: 'download-project', title: 'Download Project', category: 'Projects',
    content: 'Download your project as a ZIP file:\n\n1. Click the three-dot menu (⋯) on the project row\n2. Select "Download"\n\nThe ZIP contains all project files (LaTeX sources, images, etc.).',
    related: ['project-management'] },
  { id: 'delete-project', title: 'Delete Project', category: 'Projects',
    content: 'Delete a project:\n\n1. Click the three-dot menu (⋯) on the project row\n2. Select "Delete"\n3. Confirm the deletion\n\nThe project moves to Trash where it can be restored within 30 days. Use "Delete permanently" in Trash for irreversible deletion.',
    related: ['project-management'] },

  // Customization
  { id: 'themes', title: 'Themes', category: 'Customization',
    content: 'TexFlow supports multiple themes. Change your theme in Settings → Appearance.\n\nAvailable themes include:\n• TexFlow Dark (default)\n• Light 2026, Light Modern, Light+\n• Dark 2026, Abyss, Monokai\n• Solarized Light/Dark\n• High Contrast (Light/Dark)\n\nThe editor, file tree, PDF panel, and all UI elements update instantly when you switch themes.',
    related: ['editor-settings'] },
  { id: 'editor-settings', title: 'Editor Settings', category: 'Customization',
    content: 'Customize the editor in Settings:\n\n• Font size\n• Tab size\n• Word wrap\n• Line numbers\n• Minimap\n• Auto-save interval\n• Compilation settings',
    related: ['themes'] },
  { id: 'layout', title: 'Layout', category: 'Customization',
    content: 'Customize the editor layout:\n\n• Drag the divider between Code Editor and PDF to resize\n• Toggle the File Explorer with Ctrl+Shift+B\n• Toggle the PDF panel from the View menu\n• Toggle the Terminal panel\n• Reset layout from View → Reset Layout',
    related: ['editor-settings'] },

  // Account
  { id: 'profile', title: 'Profile', category: 'Account',
    content: 'Manage your profile in Settings:\n\n• Display name\n• Email address\n• Password\n• Profile picture',
    related: ['security'] },
  { id: 'security', title: 'Security', category: 'Account',
    content: 'TexFlow secures your account with:\n\n• JWT-based authentication\n• Password hashing\n• HTTP-only token storage\n• API authorization on all protected routes',
    related: ['profile'] },

  // Troubleshooting
  { id: 'compilation-problems', title: 'Compilation Problems', category: 'Troubleshooting',
    content: 'If compilation fails:\n\n1. Check the Terminal panel for error messages\n2. Look for missing packages — add \\usepackage{name}\n3. Verify all braces {} are properly closed\n4. Check for undefined commands\n5. Try "Clean Build" from the Tools menu\n6. Ensure your document has \\begin{document} and \\end{document}',
    related: ['compile-errors', 'common-errors'] },
  { id: 'missing-packages', title: 'Missing Packages', category: 'Troubleshooting',
    content: 'If you see "Undefined control sequence" or similar errors, you may be missing a package.\n\nAdd the required package in your preamble:\n\\usepackage{package-name}\n\nCommon packages: amsmath, graphicx, hyperref, geometry, natbib',
    related: ['packages', 'compilation-problems'] },
  { id: 'pdf-not-updating', title: 'PDF Not Updating', category: 'Troubleshooting',
    content: 'If the PDF preview doesn\'t update:\n\n1. Click "Recompile" manually\n2. Check Auto Compile is enabled\n3. Look for compilation errors in the terminal\n4. Try a clean build (Tools → Clean Build)\n5. Refresh the page if issues persist',
    related: ['auto-compile', 'recompile'] },
  { id: 'common-errors', title: 'Common Errors', category: 'Troubleshooting',
    content: '• "Undefined control sequence" — Missing \\usepackage\n• "Missing $ inserted" — Math mode needed for special characters\n• "Extra }" or "Missing }" — Brace mismatch\n• "File not found" — Check file paths and names\n• "Runaway argument" — Unclosed command',
    related: ['compilation-problems', 'missing-packages'] },

  // FAQ
  { id: 'faq', title: 'FAQ', category: 'FAQ',
    content: 'Q: Is TexFlow free?\nA: Yes! TexFlow is completely free to use.\n\nQ: Do I need to install anything?\nA: No. TexFlow runs entirely in your browser.\n\nQ: Can I collaborate with others?\nA: Yes! Use the Share button to invite collaborators.\n\nQ: What LaTeX engine does TexFlow use?\nA: TexFlow supports pdfLaTeX, XeLaTeX, and LuaLaTeX.\n\nQ: Can I import existing LaTeX projects?\nA: Yes! Upload files through the file tree upload button.\n\nQ: Is my data private?\nA: Your projects are stored securely and only accessible to you and your collaborators.',
    related: ['introduction'] },
];

const categories = [...new Set(docSections.map(s => s.category))];

export default function DocumentationPage() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeSection = docSections.find(s => s.id === activeId) || docSections[0];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return docSections.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const currentIndex = docSections.findIndex(s => s.id === activeId);
  const prevSection = currentIndex > 0 ? docSections[currentIndex - 1] : null;
  const nextSection = currentIndex < docSections.length - 1 ? docSections[currentIndex + 1] : null;

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="ml-4" style={{ color: 'var(--color-text-secondary)' }}>{line.replace(/^\d+\.\s/, '')}</li>;
      }
      if (line.startsWith('•')) {
        return <li key={i} className="ml-4 list-disc" style={{ color: 'var(--color-text-secondary)' }}>{line.slice(2)}</li>;
      }
      if (line.startsWith('Q:')) {
        return <p key={i} className="font-medium mt-3" style={{ color: 'var(--color-text-primary)' }}>{line}</p>;
      }
      if (line.startsWith('A:')) {
        return <p key={i} className="ml-4 mb-1" style={{ color: 'var(--color-text-secondary)' }}>{line}</p>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="mb-1" style={{ color: 'var(--color-text-secondary)' }}>{line}</p>;
    });
  };

  return (
    <div className="h-full flex" style={{ background: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r overflow-y-auto" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={() => navigate('/help')} className="flex items-center gap-2 text-sm mb-3 transition-colors" style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <ArrowLeft size={14} /> Help
          </button>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Documentation</h2>
        </div>
        <nav className="flex-1 p-3 space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 px-2" style={{ color: 'var(--color-text-muted)' }}>{cat}</h3>
              <div className="space-y-0.5">
                {docSections.filter(s => s.category === cat).map(s => (
                  <button key={s.id} onClick={() => { setActiveId(s.id); setSearchQuery(''); }}
                    className="w-full text-left px-2 py-1.5 rounded-md text-[13px] transition-colors"
                    style={{
                      color: activeId === s.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      background: activeId === s.id ? 'var(--color-accent-soft)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (activeId !== s.id) e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
                    onMouseLeave={e => { if (activeId !== s.id) e.currentTarget.style.background = 'transparent'; }}
                  >{s.title}</button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Search bar */}
        <div className="px-8 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border outline-none"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {searchQuery ? (
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Search results for "{searchQuery}"
              </h2>
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No results found</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Try searching for "compile", "projects", "PDF", "editor"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map(s => (
                    <button key={s.id} onClick={() => { setActiveId(s.id); setSearchQuery(''); }}
                      className="w-full text-left p-3 rounded-lg border transition-colors"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                    >
                      <span className="text-[11px] font-medium uppercase" style={{ color: 'var(--color-accent)' }}>{s.category}</span>
                      <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text-primary)' }}>{s.title}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{activeSection.category}</span>
              <h1 className="text-2xl font-bold mt-1 mb-4" style={{ color: 'var(--color-text-primary)' }}>{activeSection.title}</h1>

              <div className="space-y-3 text-sm leading-relaxed">
                {formatContent(activeSection.content)}
              </div>

              {activeSection.code && (
                <div className="mt-6 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between px-4 py-2" style={{ background: 'var(--color-surface)' }}>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>LaTeX</span>
                    <CopyButton text={activeSection.code} />
                  </div>
                  <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed" style={{ background: 'var(--color-background)', color: 'var(--color-text-secondary)' }}>
                    <code>{activeSection.code}</code>
                  </pre>
                </div>
              )}

              {activeSection.related && activeSection.related.length > 0 && (
                <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Related</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeSection.related.map(rid => {
                      const r = docSections.find(s => s.id === rid);
                      if (!r) return null;
                      return (
                        <button key={rid} onClick={() => setActiveId(rid)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent-soft)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >→ {r.title}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Prev / Next */}
              <div className="mt-10 pt-6 border-t flex justify-between" style={{ borderColor: 'var(--color-border)' }}>
                {prevSection ? (
                  <button onClick={() => setActiveId(prevSection.id)} className="text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >← {prevSection.title}</button>
                ) : <div />}
                {nextSection ? (
                  <button onClick={() => setActiveId(nextSection.id)} className="text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >{nextSection.title} →</button>
                ) : <div />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors"
      style={{ color: copied ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
      {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
    </button>
  );
}
