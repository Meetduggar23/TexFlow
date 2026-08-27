import { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput, StreamLanguage } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';
import { tags } from '@lezer/highlight';
import { FileText } from 'lucide-react';
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
  '&': { height: '100%', background: '#FBEFEF' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-gutters': { background: '#FCF8F8', borderRight: '1px solid #F9DFDF', color: '#F5AFAF' },
  '.cm-activeLineGutter': { background: 'rgba(245,175,175,0.15)' },
  '.cm-activeLine': { background: 'rgba(245,175,175,0.08)' },
  '.cm-cursor': { borderLeftColor: '#d47777' },
  '.cm-selectionBackground': { background: 'rgba(249,223,223,0.5) !important' },
  '&.cm-focused .cm-selectionBackground': { background: 'rgba(249,223,223,0.6) !important' },
  '.cm-matchingBracket': { background: 'rgba(245,175,175,0.35)', outline: '1px solid rgba(245,175,175,0.6)' },
  '.cm-content': { caretColor: '#d47777' },
  '.cm-line': { padding: '0 4px' },
  '.ͼ5': { color: '#d47777' },
  '.ͼ6': { color: '#b85c5c' },
  '.ͼ7': { color: '#F5AFAF', fontStyle: 'italic' },
}, { dark: false });

interface CodeEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  file: FileNode | null;
}

export default function CodeEditor({ content, onChange, onSave, file }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);

  onChangeRef.current = onChange;
  onSaveRef.current = onSave;

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
      <div className="h-full flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(245,175,175,0.2), rgba(249,223,223,0.2))' }}>
            <FileText size={30} className="text-texflow-500" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-medium text-texflow-700 mb-2">No file selected</h3>
          <p className="text-sm text-texflow-500">Select a file from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark-900">
      <div className="flex items-center px-3 py-1.5 border-b border-texflow-200" style={{ background: 'rgba(252,248,248,0.8)' }}>
        <span className="text-xs text-texflow-600">{file.name}</span>
        <span className="ml-2 text-xs text-texflow-400">
          {file.name.split('.').pop()?.toUpperCase()}
        </span>
      </div>
      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
