import { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput, StreamLanguage } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';
import { tags } from '@lezer/highlight';
import { FileText, X, MoreHorizontal, FileCode2, BookOpen, File, FileType } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { closeTab, setActiveTab, openTab, setContent } from '../store/editorSlice';
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

const texflowTheme = EditorView.theme({
  '&': { height: '100%', background: 'var(--color-surface)' },
  '.cm-scroller': { overflow: 'auto', fontFamily: '"JetBrains Mono", monospace', fontSize: '13.5px', lineHeight: '1.6' },
  '.cm-gutters': { background: 'var(--color-background)', borderRight: '1px solid var(--color-border)', color: 'var(--color-text-disabled)' },
  '.cm-activeLineGutter': { background: 'var(--color-accent-soft)' },
  '.cm-activeLine': { background: 'var(--color-surface-secondary)' },
  '.cm-cursor': { borderLeftColor: 'var(--color-accent)' },
  '.cm-selectionBackground': { background: 'rgba(160, 0, 90, 0.12) !important' },
  '&.cm-focused .cm-selectionBackground': { background: 'rgba(160, 0, 90, 0.18) !important' },
  '.cm-matchingBracket': { background: 'rgba(160, 0, 90, 0.15)', outline: '1px solid rgba(160, 0, 90, 0.4)' },
  '.cm-content': { caretColor: 'var(--color-accent)' },
  '.cm-line': { padding: '0 6px' },
  '.ͼ5': { color: '#A0005A' },
  '.ͼ6': { color: '#7C3AED' },
  '.ͼ7': { color: 'var(--color-text-disabled)', fontStyle: 'italic' },
}, { dark: false });

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'bib' || ext === 'bbl') return <BookOpen size={12} className="text-green-600" />;
  if (ext === 'cls' || ext === 'sty') return <FileType size={12} className="text-purple-600" />;
  if (ext === 'tex') return <FileCode2 size={12} className="text-[var(--color-accent)]" />;
  return <File size={12} className="text-[var(--color-text-muted)]" />;
}

interface TabBarProps {
  activeTabId: string | null;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
  tabs: { fileId: string; name: string; dirty: boolean }[];
}

function TabBar({ activeTabId, onTabClick, onTabClose, tabs }: TabBarProps) {
  return (
    <div className="flex items-center overflow-x-auto border-b border-[var(--color-border)]" style={{ background: 'var(--color-background)' }}>
      {tabs.map(tab => (
        <div
          key={tab.fileId}
          onClick={() => onTabClick(tab.fileId)}
          className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-[var(--color-border)] transition-colors min-w-0 max-w-[160px] ${
            activeTabId === tab.fileId
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-b-2 border-b-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-secondary)]'
          }`}
        >
          {getFileIcon(tab.name)}
          <span className="truncate">{tab.name}</span>
          {tab.dirty && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] flex-shrink-0" />}
          <button
            onClick={(e) => { e.stopPropagation(); onTabClose(tab.fileId); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[var(--color-border)] rounded transition-opacity flex-shrink-0"
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}

interface CodeEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  file: FileNode | null;
  allFiles: FileNode[];
}

export default function CodeEditor({ content, onChange, onSave, file, allFiles }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const dispatch = useAppDispatch();
  const { openTabs, activeTabId } = useAppSelector(state => state.editor);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  onChangeRef.current = onChange;
  onSaveRef.current = onSave;

  const handleTabClick = useCallback((fileId: string) => {
    const tab = openTabs.find(t => t.fileId === fileId);
    if (tab) {
      dispatch(setActiveTab(fileId));
      const node = findFileById(allFiles, fileId);
      if (node) {
        dispatch(setContent(node.content || ''));
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
      { key: 'Mod-s', run: () => { onSaveRef.current(); return true; } },
    ];

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        foldGutter(),
        indentOnInput(),
        bracketMatching(),
        highlightSelectionMatches(),
        keymap.of(customKeymap),
        latexLanguage,
        texflowTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
          if (update.selectionSet || update.docChanged) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            setCursorPos({ line: line.number, col: pos - line.from + 1 });
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [file?.id]);

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

  if (!file) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-9 border-b border-[var(--color-border)]" style={{ background: 'var(--color-background)' }} />
        <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
              <FileText size={28} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>No file selected</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Select a file from the explorer to start editing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TabBar activeTabId={activeTabId} tabs={openTabs} onTabClick={handleTabClick} onTabClose={handleTabClose} />
      <div ref={editorRef} className="flex-1 overflow-hidden" />
      <div className="h-6 flex items-center justify-between px-3 border-t border-[var(--color-border)] text-[11px] select-none" style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
        <div className="flex items-center gap-3">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium uppercase">{file.name.split('.').pop()}</span>
          <span>UTF-8</span>
          <span>LaTeX</span>
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
