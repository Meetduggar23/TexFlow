import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CompileResult, CursorPosition } from '../types';

export interface EditorTab {
  fileId: string;
  name: string;
  dirty: boolean;
}

interface EditorState {
  content: string;
  compiling: boolean;
  compileResult: CompileResult | null;
  cursors: CursorPosition[];
  sidebarWidth: number;
  pdfVisible: boolean;
  splitRatio: number;
  terminalHeight: number;
  terminalOpen: boolean;
  openTabs: EditorTab[];
  activeTabId: string | null;
  sourceRevision: number;
  compiledRevision: number;
  lastSavedAt: number | null;
  lastCompiledAt: number | null;
  saving: boolean;
}

const initialState: EditorState = {
  content: '',
  compiling: false,
  compileResult: null,
  cursors: [],
  sidebarWidth: 280,
  pdfVisible: true,
  splitRatio: 50,
  terminalHeight: 192,
  terminalOpen: false,
  openTabs: [],
  activeTabId: null,
  sourceRevision: 0,
  compiledRevision: 0,
  lastSavedAt: null,
  lastCompiledAt: null,
  saving: false,
};

export const compileProject = createAsyncThunk(
  'editor/compileProject',
  async (projectId: string, { getState }) => {
    const token = localStorage.getItem('token');
    const state = getState() as { editor: EditorState };
    const sourceRevision = state.editor.sourceRevision;

    const response = await fetch(`/api/compile/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ compiler: 'pdflatex' }),
    });
    if (!response.ok) throw new Error('Compilation failed');
    const data = await response.json();

    const logs = data.logs || '';
    const errors: CompileResult['errors'] = [];
    const warnings: CompileResult['warnings'] = [];

    const lines = logs.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const errorMatch = line.match(/^!\s+(.+)\.$/);
      if (errorMatch) {
        const err: { line: number; column: number; message: string; file?: string } = { line: 0, column: 0, message: errorMatch[1] };
        const fileMatch = line.match(/^l\.(\d+)/);
        if (fileMatch) err.line = parseInt(fileMatch[1]);
        const nextLine = lines[i + 1];
        if (nextLine) {
          const nextFileMatch = nextLine.match(/^<\*?>\s*(.*)/);
          if (nextFileMatch) err.file = nextFileMatch[1].trim();
        }
        errors.push(err);
      }
      const fileLineMatch = line.match(/^l\.(\d+)\s+(.*)$/);
      if (fileLineMatch && errors.length > 0) {
        const lastErr = errors[errors.length - 1];
        if (lastErr.line === 0) {
          lastErr.line = parseInt(fileLineMatch[1]);
        }
      }
      const warningMatch = line.match(/Warning/i);
      if (warningMatch && !errorMatch) {
        warnings.push({ line: 0, column: 0, message: line.trim() });
      }
    }

    return {
      success: data.status === 'success',
      pdfUrl: data.pdfUrl,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      logs,
      compiledRevision: sourceRevision,
    };
  }
);

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setContent(state, action) {
      state.content = action.payload;
      state.sourceRevision += 1;
      if (state.activeTabId) {
        const tab = state.openTabs.find(t => t.fileId === state.activeTabId);
        if (tab) tab.dirty = true;
      }
    },
    setCursors(state, action) {
      state.cursors = action.payload;
    },
    updateCursor(state, action) {
      const cursor = action.payload;
      const idx = state.cursors.findIndex(c => c.userId === cursor.userId);
      if (idx >= 0) {
        state.cursors[idx] = cursor;
      } else {
        state.cursors.push(cursor);
      }
    },
    removeCursor(state, action) {
      state.cursors = state.cursors.filter(c => c.userId !== action.payload);
    },
    setSidebarWidth(state, action) {
      state.sidebarWidth = action.payload;
    },
    togglePdf(state) {
      state.pdfVisible = !state.pdfVisible;
    },
    setSplitRatio(state, action) {
      state.splitRatio = action.payload;
    },
    setTerminalHeight(state, action) {
      state.terminalHeight = action.payload;
    },
    toggleTerminal(state) {
      state.terminalOpen = !state.terminalOpen;
    },
    setTerminalOpen(state, action) {
      state.terminalOpen = action.payload;
    },
    clearCompileResult(state) {
      state.compileResult = null;
    },
    openTab(state, action: { payload: { fileId: string; name: string; content?: string } }) {
      const { fileId, name } = action.payload;
      if (!state.openTabs.find(t => t.fileId === fileId)) {
        state.openTabs.push({ fileId, name, dirty: false });
      }
      state.activeTabId = fileId;
    },
    closeTab(state, action: { payload: string }) {
      const fileId = action.payload;
      state.openTabs = state.openTabs.filter(t => t.fileId !== fileId);
      if (state.activeTabId === fileId) {
        state.activeTabId = state.openTabs.length > 0 ? state.openTabs[state.openTabs.length - 1].fileId : null;
      }
    },
    setActiveTab(state, action: { payload: string }) {
      state.activeTabId = action.payload;
    },
    closeAllTabs(state) {
      state.openTabs = [];
      state.activeTabId = null;
    },
    closeOtherTabs(state, action: { payload: string }) {
      const keepId = action.payload;
      state.openTabs = state.openTabs.filter(t => t.fileId === keepId);
      state.activeTabId = keepId;
    },
    markTabSaved(state, action: { payload: string }) {
      const tab = state.openTabs.find(t => t.fileId === action.payload);
      if (tab) tab.dirty = false;
      state.lastSavedAt = Date.now();
    },
    setSaving(state, action) {
      state.saving = action.payload;
    },
    setSidebarOpen(state, action) {
      // handled by uiSlice
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(compileProject.pending, (state) => {
        state.compiling = true;
      })
      .addCase(compileProject.fulfilled, (state, action) => {
        state.compiling = false;
        state.compileResult = action.payload;
        state.compiledRevision = action.payload.compiledRevision;
        state.lastCompiledAt = Date.now();
        state.terminalOpen = !action.payload.success;
      })
      .addCase(compileProject.rejected, (state) => {
        state.compiling = false;
        state.compileResult = {
          success: false,
          errors: [{ line: 0, column: 0, message: 'Compilation failed. Please try again.' }],
        };
        state.terminalOpen = true;
      });
  },
});

export const {
  setContent, setCursors, updateCursor, removeCursor,
  setSidebarWidth, togglePdf, setSplitRatio,
  setTerminalHeight, toggleTerminal, setTerminalOpen,
  clearCompileResult, openTab, closeTab, setActiveTab,
  closeAllTabs, closeOtherTabs, markTabSaved, setSaving,
} = editorSlice.actions;
export default editorSlice.reducer;
