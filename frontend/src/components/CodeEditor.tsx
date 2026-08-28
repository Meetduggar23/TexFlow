import { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab, undo, redo, undoDepth, redoDepth, selectAll } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput, StreamLanguage } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';
import { FileText, X, FileCode2, BookOpen, File, FileType, Undo2, Redo2, Bold, Italic, Strikethrough, Code, List, ListOrdered, Link2, Image as ImageIcon, Table2, Superscript, Subscript, AlignLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { closeTab, setActiveTab, openTab, setContent, switchTab, CompileStatus } from '../store/editorSlice';
import { setCurrentFile } from '../store/projectSlice';
import { useTheme } from '../ThemeProvider';
import type { FileNode } from '../types';

const latexStreamParser = {
  startState: () => ({ inCommand: false, inMath: false }),
  token: (stream: any, state: any) => {
    if (stream.match('\\begin{') || stream.match('\\end{')) return 'keyword';
    if (stream.match(/^\\[a-zA-Z]+/)) return 'keyword';
    if (stream.match('$') || stream.match('\\(') || stream.match('\\)') || stream.match('\\[') || stream.match('\\]')) return 'special';
    if (stream.match('{') || stream.match('}')) return 'bracket';
    if (stream.match('%')) { stream.skipToEnd(); return 'comment'; }
    if (stream.match('#') || stream.match('&') || stream.match('_') || stream.match('^')) return 'operator';
    stream.next();
    return null;
  },
};

const latexLanguage = StreamLanguage.define(latexStreamParser);

function applySelectionFormatting(view: EditorView, before: string, after: string) {
  const selection = view.state.selection.main;
  const selected = view.state.sliceDoc(selection.from, selection.to);
  const insert = `${before}${selected}${after}`;
  view.dispatch({ changes: { from: selection.from, to: selection.to, insert }, selection: { anchor: selection.from + insert.length } });
  view.focus();
}

function makeTexflowTheme(isDark: boolean, settings?: { fontFamily: string; fontSize: number; lineHeight: number }) {
  const fg = 'var(--tf-editor-foreground)';
  const gutterFg = 'var(--tf-editor-line-number)';
  return EditorView.theme({
    '&': { height: '100%', background: 'var(--color-surface)' },
    '.cm-scroller': { overflow: 'auto', fontFamily: settings?.fontFamily || '"JetBrains Mono", monospace', fontSize: `${settings?.fontSize || 13.5}px`, lineHeight: `${settings?.lineHeight || 1.6}` },
    '.cm-gutters': {
      background: 'var(--color-background)',
      borderRight: '1px solid var(--color-border)',
      color: gutterFg,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
    },
    '.cm-lineNumbers': {
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      color: gutterFg,
      minWidth: '3em',
      paddingRight: '8px',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
    },
    '.cm-activeLineGutter': { background: 'color-mix(in srgb, var(--tf-editor-selection) 55%, transparent)' },
    '.cm-activeLine': { background: 'color-mix(in srgb, var(--tf-editor-selection) 22%, transparent)' },
    '.cm-cursor': { borderLeftColor: 'var(--tf-editor-cursor)' },
    '.cm-selectionBackground': { background: 'var(--tf-editor-selection) !important' },
    '&.cm-focused .cm-selectionBackground': { background: 'var(--tf-editor-selection) !important' },
    '.cm-matchingBracket': { background: 'var(--tf-editor-selection)', outline: '1px solid var(--color-accent)' },
    '.cm-content': { caretColor: 'var(--color-accent)', color: fg },
    '.cm-line': { padding: '0 6px', color: fg, userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' },
    '.cm-foldGutter': {
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
    },
    '.cm-foldPlaceholder': {
      background: 'var(--color-accent-soft)',
      border: 'none',
      color: 'var(--color-accent)',
    },
  }, { dark: isDark });
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'bib' || ext === 'bbl') return <BookOpen size={12} className="text-green-600" />;
  if (ext === 'cls' || ext === 'sty') return <FileType size={12} className="text-purple-600" />;
  if (ext === 'tex') return <FileCode2 size={12} style={{ color: 'var(--color-accent)' }} />;
  return <File size={12} style={{ color: 'var(--color-text-muted)' }} />;
}

/* ── Tab Bar ── */
interface TabBarProps {
  activeTabId: string | null;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
  tabs: { fileId: string; name: string; dirty: boolean }[];
}

function TabBar({ activeTabId, onTabClick, onTabClose, tabs }: TabBarProps) {
  return (
    <div
      className="flex items-center overflow-x-auto border-b"
      style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
    >
      {tabs.map(tab => (
        <div
          key={tab.fileId}
          onClick={() => onTabClick(tab.fileId)}
          className={`group flex items-center gap-1.5 px-3 py-1.5 text-[12px] cursor-pointer border-r transition-colors min-w-0 max-w-[160px] ${
            activeTabId === tab.fileId
              ? ''
              : ''
          }`}
          style={{
            background: activeTabId === tab.fileId ? 'var(--color-surface)' : 'transparent',
            color: activeTabId === tab.fileId ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            borderColor: 'var(--color-border)',
            borderBottom: activeTabId === tab.fileId ? '2px solid var(--color-accent)' : '2px solid transparent',
          }}
        >
          {getFileIcon(tab.name)}
          <span className="truncate">{tab.name}</span>
          {tab.dirty && (
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--color-accent)' }} />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onTabClose(tab.fileId); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity flex-shrink-0"
            style={{ color: 'var(--color-text-disabled)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Editor Toolbar ── */
interface EditorToolbarProps {
  view: EditorView | null;
  readOnly: boolean;
  onOpenImage: () => void;
  onOpenTable: () => void;
  onOpenLink: () => void;
  editingAs: 'editing' | 'suggesting' | 'viewing';
  onEditingAsChange: (mode: 'editing' | 'suggesting' | 'viewing') => void;
}

function ToolbarButton({ onClick, disabled, title, ariaLabel, children }: {
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-elevated)] disabled:opacity-40"
      style={{ color: 'var(--color-text-muted)' }}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-4 mx-1" style={{ background: 'var(--color-border)' }} />;
}

function EditorToolbar({ view, readOnly, onOpenImage, onOpenTable, onOpenLink, editingAs, onEditingAsChange }: EditorToolbarProps) {
  const [editMode, setEditMode] = useState<'code' | 'visual'>('code');
  const [editingMenuOpen, setEditingMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const editingBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setEditingMenuOpen(false); };
    const handleOutside = (event: MouseEvent) => { if (!(event.target as HTMLElement).closest('[data-editing-menu]')) setEditingMenuOpen(false); };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleOutside);
    return () => { document.removeEventListener('keydown', handleKeyDown); document.removeEventListener('mousedown', handleOutside); };
  }, []);

  const formatLines = (environment: 'itemize' | 'enumerate') => {
    if (!view || readOnly) return;
    const selection = view.state.selection.main;
    const selected = view.state.sliceDoc(selection.from, selection.to);
    const lines = (selected || '').split(/\r?\n/).map(line => line.trim() ? `\\item ${line}` : line).join('\n');
    const insert = `\\begin{${environment}}\n${lines || '\\item '}\n\\end{${environment}}`;
    view.dispatch({ changes: { from: selection.from, to: selection.to, insert }, selection: { anchor: selection.from + insert.length } });
    view.focus();
  };

  return (
    <div
      className="flex items-center gap-0.5 px-2 py-1 border-b overflow-x-auto"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <ToolbarButton
        onClick={() => { if (view) undo(view); }}
        disabled={!view || readOnly || !view || !undoDepth(view.state)}
        title="Undo (Ctrl+Z)"
        ariaLabel="Undo"
      >
        <Undo2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => { if (view) redo(view); }}
        disabled={!view || readOnly || !view || !redoDepth(view.state)}
        title="Redo (Ctrl+Shift+Z)"
        ariaLabel="Redo"
      >
        <Redo2 size={14} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => { if (view) applySelectionFormatting(view, '\\textbf{', '}'); }} disabled={readOnly} title="Bold" ariaLabel="Bold">
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => { if (view) applySelectionFormatting(view, '\\textit{', '}'); }} disabled={readOnly} title="Italic" ariaLabel="Italic">
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => { if (view) applySelectionFormatting(view, '\\sout{', '}'); }} disabled={readOnly} title="Strikethrough" ariaLabel="Strikethrough">
        <Strikethrough size={14} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => { if (view) applySelectionFormatting(view, '\\texttt{', '}'); }} disabled={readOnly} title="Inline code" ariaLabel="Inline code">
        <Code size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={onOpenImage} disabled={readOnly} title="Insert image" ariaLabel="Insert image">
        <ImageIcon size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={onOpenTable} disabled={readOnly} title="Insert table" ariaLabel="Insert table">
        <Table2 size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={onOpenLink} disabled={readOnly} title="Insert link" ariaLabel="Insert link">
        <Link2 size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatLines('itemize')} disabled={readOnly} title="Bulleted list" ariaLabel="Bulleted list">
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatLines('enumerate')} disabled={readOnly} title="Numbered list" ariaLabel="Numbered list">
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => { if (view) applySelectionFormatting(view, '^{', '}'); }} disabled={readOnly} title="Superscript" ariaLabel="Superscript">
        <Superscript size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => { if (view) applySelectionFormatting(view, '_{', '}'); }} disabled={readOnly} title="Subscript" ariaLabel="Subscript">
        <Subscript size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => { if (view) applySelectionFormatting(view, '\\begin{center}\n', '\n\\end{center}'); }} disabled={readOnly} title="Center" ariaLabel="Center alignment">
        <AlignLeft size={14} />
      </ToolbarButton>

      <div className="flex-1" />

      {/* Code / Visual toggle */}
      <div className="flex items-center rounded overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setEditMode('code')}
          className="px-2.5 py-1 text-[11px] font-medium transition-colors"
          style={{
            background: editMode === 'code' ? 'var(--color-accent)' : 'transparent',
            color: editMode === 'code' ? '#fff' : 'var(--color-text-muted)',
          }}
        >
          Code
        </button>
        <button
          onClick={() => setEditMode('visual')}
          className="px-2.5 py-1 text-[11px] font-medium transition-colors"
          style={{
            background: editMode === 'visual' ? 'var(--color-accent)' : 'transparent',
            color: editMode === 'visual' ? '#fff' : 'var(--color-text-muted)',
          }}
        >
          Visual
        </button>
      </div>

      <ToolbarDivider />

      {/* Editing mode dropdown */}
      <div className="relative" data-editing-menu>
        {editingMenuOpen && (
          <div
            role="menu"
            className="fixed z-[100] min-w-[150px] rounded-lg border py-1 shadow-xl"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', top: menuPos.top, left: menuPos.left }}
          >
            {(['editing', 'suggesting', 'viewing'] as const).map(mode => (
              <button
                key={mode}
                role="menuitem"
                onClick={() => { onEditingAsChange(mode); setEditingMenuOpen(false); }}
                className="flex w-full items-center justify-between px-3 py-2 text-[12px] text-left hover:bg-[var(--color-surface-elevated)]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>{mode === 'viewing' ? 'Read Only' : mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                {editingAs === mode && <span style={{ color: 'var(--color-accent)' }}>✓</span>}
              </button>
            ))}
          </div>
        )}
        <button
          ref={editingBtnRef}
          onClick={() => {
            if (!editingMenuOpen && editingBtnRef.current) {
              const r = editingBtnRef.current.getBoundingClientRect();
              setMenuPos({ top: r.bottom + 4, left: r.left });
            }
            setEditingMenuOpen(open => !open);
          }}
          aria-haspopup="menu"
          aria-expanded={editingMenuOpen}
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {editingAs.charAt(0).toUpperCase() + editingAs.slice(1)}
          <span className="text-[9px]">▼</span>
        </button>
      </div>
    </div>
  );
}

/* ── CodeEditor ── */
interface CodeEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  file: FileNode | null;
  allFiles: FileNode[];
  compileStatus?: CompileStatus;
  saving?: boolean;
  isStale?: boolean;
  onOpenImage?: () => void;
  onOpenTable?: () => void;
  onOpenLink?: () => void;
  onSelectionChange?: (selection: { from: number; to: number }) => void;
}

export default function CodeEditor({ content, onChange, onSave, file, allFiles, compileStatus = 'idle', saving = false, isStale = false, onOpenImage = () => undefined, onOpenTable = () => undefined, onOpenLink = () => undefined, onSelectionChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const editableCompartment = useRef(new Compartment());
  const darkModeCompartment = useRef(new Compartment());
  const gutterCompartment = useRef(new Compartment());
  const bracketCompartment = useRef(new Compartment());
  const wrappingCompartment = useRef(new Compartment());
  const tabSizeCompartment = useRef(new Compartment());
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const dispatch = useAppDispatch();
  const { openTabs, activeTabId } = useAppSelector(state => state.editor);
  const editorSettings = useAppSelector(state => state.settings.editor);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [editingAs, setEditingAs] = useState<'editing' | 'suggesting' | 'viewing'>('editing');
  const { theme } = useTheme();
  const isDark = theme.type !== 'light';

  onChangeRef.current = onChange;
  onSaveRef.current = onSave;

  const handleTabClick = useCallback((fileId: string) => {
    const tab = openTabs.find(t => t.fileId === fileId);
    if (tab) {
      const node = findFileById(allFiles, fileId);
      window.dispatchEvent(new CustomEvent('texflow:tab-switch', { detail: { content: node?.content || '' } }));
      dispatch(switchTab({ fileId, content: node?.content || '' }));
      if (node) {
        dispatch(setCurrentFile(node));
      }
    }
  }, [openTabs, dispatch, allFiles]);

  const handleTabClose = useCallback((fileId: string) => {
    dispatch(closeTab(fileId));
  }, [dispatch]);

  useEffect(() => {
    if (!editorRef.current) return;

    const customKeymap = [
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      ...lintKeymap,
      indentWithTab,
      // Keep select-all inside CodeMirror's document. The gutter is a separate
      // UI layer and must never become part of the editable selection.
      { key: 'Mod-a', run: (view: EditorView) => { selectAll(view); return true; } },
      { key: 'Mod-s', run: () => { onSaveRef.current(); return true; } },
      { key: 'Mod-b', run: (view: EditorView) => { applySelectionFormatting(view, '\\textbf{', '}'); return true; } },
      { key: 'Mod-i', run: (view: EditorView) => { applySelectionFormatting(view, '\\textit{', '}'); return true; } },
    ];

    const state = EditorState.create({
      doc: content,
      extensions: [
        // Line numbers are an editor invariant: they are UI-only and must
        // always be present while editing source.
        gutterCompartment.current.of(lineNumbers()),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        foldGutter(),
        indentOnInput(),
        bracketCompartment.current.of(editorSettings.bracketMatching ? bracketMatching() : []),
        wrappingCompartment.current.of(editorSettings.wordWrap === 'off' ? [] : EditorView.lineWrapping),
        tabSizeCompartment.current.of(EditorState.tabSize.of(editorSettings.tabSize)),
        highlightSelectionMatches(),
        keymap.of(customKeymap),
        editableCompartment.current.of(EditorView.editable.of(true)),
        latexLanguage,
        darkModeCompartment.current.of(makeTexflowTheme(isDark, editorSettings)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
          if (update.selectionSet || update.docChanged) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            setCursorPos({ line: line.number, col: pos - line.from + 1 });
            const selection = update.state.selection.main;
            onSelectionChange?.({ from: selection.from, to: selection.to });
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    setEditorView(view);

    return () => {
      view.destroy();
      viewRef.current = null;
      setEditorView(null);
    };
  }, [file?.id]);

  useEffect(() => {
    if (editorView) {
      editorView.dispatch({ effects: editableCompartment.current.reconfigure(EditorView.editable.of(editingAs !== 'viewing')) });
      editorView.dom.contentEditable = editingAs === 'viewing' ? 'false' : 'true';
    }
  }, [editorView, editingAs]);

  useEffect(() => {
    if (editorView) {
      editorView.dispatch({ effects: [
        darkModeCompartment.current.reconfigure(makeTexflowTheme(isDark, editorSettings)),
        gutterCompartment.current.reconfigure(lineNumbers()),
        bracketCompartment.current.reconfigure(editorSettings.bracketMatching ? bracketMatching() : []),
        wrappingCompartment.current.reconfigure(editorSettings.wordWrap === 'off' ? [] : EditorView.lineWrapping),
        tabSizeCompartment.current.reconfigure(EditorState.tabSize.of(editorSettings.tabSize)),
      ] });
    }
  }, [editorView, isDark, editorSettings]);

  useEffect(() => {
    if (viewRef.current && file) {
      const currentContent = viewRef.current.state.doc.toString();
      if (currentContent !== content) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentContent.length, insert: content },
        });
      }
    }
  }, [content, file]);

  /* ── Empty state ── */
  if (!file) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-9 border-b" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }} />
        <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
              <FileText size={24} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3 className="text-[15px] font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>No file selected</h3>
            <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>Select a file from the explorer to start editing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TabBar activeTabId={activeTabId} tabs={openTabs} onTabClick={handleTabClick} onTabClose={handleTabClose} />
      <EditorToolbar view={editorView} readOnly={editingAs === 'viewing'} onOpenImage={onOpenImage} onOpenTable={onOpenTable} onOpenLink={onOpenLink} editingAs={editingAs} onEditingAsChange={setEditingAs} />
      <div ref={editorRef} className="flex-1 overflow-hidden" />
      {/* ── Status Bar ── */}
      <div
        className="h-6 flex items-center justify-between px-3 border-t text-[11px] select-none"
        style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <div className="flex items-center gap-3">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium uppercase">{file.name.split('.').pop()}</span>
          <span>UTF-8</span>
          <span>LaTeX</span>
          <span className="w-px h-3" style={{ background: 'var(--color-border)' }} />
          <span className="flex items-center gap-1">
            {saving && <span style={{ color: 'var(--color-text-muted)' }}>Saving...</span>}
            {!saving && compileStatus === 'saved' && <span style={{ color: 'var(--color-success)' }}>✓ Saved</span>}
            {!saving && compileStatus === 'compiling' && (
              <span className="flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-accent)' }} />
                Compiling...
              </span>
            )}
            {!saving && compileStatus === 'compiled' && <span style={{ color: 'var(--color-success)' }}>✓ Compiled</span>}
            {!saving && compileStatus === 'error' && <span style={{ color: 'var(--color-error)' }}>✕ Errors</span>}
            {!saving && compileStatus === 'idle' && isStale && <span style={{ color: 'var(--color-warning)' }}>● Unsaved changes</span>}
            {!saving && compileStatus === 'idle' && !isStale && <span>Ready</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

function findFileById(files: FileNode[], id: string): FileNode | null {
  for (const f of files) {
    if (f.id === id) return f;
    if (f.children) {
      const found = findFileById(f.children, id);
      if (found) return found;
    }
  }
  return null;
}
