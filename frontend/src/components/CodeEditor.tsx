import { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';
import { latex } from '@codemirror/lang-latex';
import type { FileNode } from '../types';

const texflowTheme = EditorView.theme({
  '&': { height: '100%', background: '#0a0c3d' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-gutters': { background: '#030637', borderRight: '1px solid #3C0753', color: '#720455' },
  '.cm-activeLineGutter': { background: 'rgba(114,4,85,0.15)' },
  '.cm-activeLine': { background: 'rgba(114,4,85,0.08)' },
  '.cm-cursor': { borderLeftColor: '#910A67' },
  '.cm-selectionBackground': { background: 'rgba(145,10,103,0.25) !important' },
  '&.cm-focused .cm-selectionBackground': { background: 'rgba(145,10,103,0.35) !important' },
  '.cm-matchingBracket': { background: 'rgba(114,4,85,0.4)', outline: '1px solid rgba(145,10,103,0.6)' },
  '.cm-content': { caretColor: '#910A67' },
}, { dark: true });

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
        latex(),
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(114,4,85,0.2), rgba(145,10,103,0.2))' }}>
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No file selected</h3>
          <p className="text-sm text-slate-500">Select a file from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark-900">
      <div className="flex items-center px-3 py-1.5 border-b border-texflow-800" style={{ background: 'rgba(3,6,55,0.5)' }}>
        <span className="text-xs text-slate-400">{file.name}</span>
        <span className="ml-2 text-xs text-texflow-400">
          {file.name.split('.').pop()?.toUpperCase()}
        </span>
      </div>
      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
