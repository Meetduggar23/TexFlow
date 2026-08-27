import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CompileResult, CursorPosition } from '../types';

export interface EditorTab {
  fileId: string;
  name: string;
  dirty: boolean;
}

export type CompileStatus = 'idle' | 'saving' | 'saved' | 'compiling' | 'compiled' | 'error';
export type CompileMode = 'normal' | 'draft';
export type SyntaxCheckMode = 'check' | 'none';
export type ErrorHandling = 'stop' | 'continue';

interface CompileSettings {
  autoCompile: boolean;
  compileMode: CompileMode;
  syntaxCheck: SyntaxCheckMode;
  errorHandling: ErrorHandling;
}

interface EditorState {
  content: string;
  compiling: boolean;
  compileResult: CompileResult | null;
  cursors: CursorPosition[];
  openTabs: EditorTab[];
  activeTabId: string | null;
  sourceRevision: number;
  compiledRevision: number;
  lastSavedAt: number | null;
  lastCompiledAt: number | null;
  saving: boolean;
  compileStatus: CompileStatus;
  lastValidPdfUrl: string | null;
  compileSettings: CompileSettings;
}

function loadCompileSettings(projectId?: string): CompileSettings {
  const defaults: CompileSettings = {
    autoCompile: true,
    compileMode: 'normal',
    syntaxCheck: 'check',
    errorHandling: 'continue',
  };
  try {
    const key = projectId ? `texflow-compile-${projectId}` : 'texflow-compile';
    const saved = localStorage.getItem(key);
    if (saved) return { ...defaults, ...JSON.parse(saved) };
  } catch {}
  return defaults;
}

function saveCompileSettings(settings: CompileSettings, projectId?: string) {
  try {
    const key = projectId ? `texflow-compile-${projectId}` : 'texflow-compile';
    localStorage.setItem(key, JSON.stringify(settings));
  } catch {}
}

let currentProjectId: string | undefined;

const initialState: EditorState = {
  content: '',
  compiling: false,
  compileResult: null,
  cursors: [],
  openTabs: [],
  activeTabId: null,
  sourceRevision: 0,
  compiledRevision: 0,
  lastSavedAt: null,
  lastCompiledAt: null,
  saving: false,
  compileStatus: 'idle',
  lastValidPdfUrl: null,
  compileSettings: loadCompileSettings(),
};

let compileRequestId = 0;

export const saveFile = createAsyncThunk(
  'editor/saveFile',
  async ({ fileId, content }: { fileId: string; content: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Save failed');
    return { fileId, savedAt: Date.now() };
  }
);

export const compileProject = createAsyncThunk(
  'editor/compileProject',
  async (projectId: string, { getState }) => {
    const requestId = ++compileRequestId;
    const state = getState() as { editor: EditorState };
    const sourceRevision = state.editor.sourceRevision;
    const settings = state.editor.compileSettings;
    const token = localStorage.getItem('token');

    const response = await fetch(`/api/compile/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        compiler: 'pdflatex',
        draft: settings.compileMode === 'draft',
        syntaxCheck: settings.syntaxCheck === 'check',
        errorHandling: settings.errorHandling,
      }),
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
        const err: { line: number; column: number; message: string; file?: string } = {
          line: 0, column: 0, message: errorMatch[1],
        };
        const nextLine = lines[i + 1];
        if (nextLine) {
          const fileMatch = nextLine.match(/^<\*?>\s*(.*)/);
          if (fileMatch) err.file = fileMatch[1].trim();
        }
        errors.push(err);
      }
      const fileLineMatch = line.match(/^l\.(\d+)/);
      if (fileLineMatch && errors.length > 0) {
        const lastErr = errors[errors.length - 1];
        if (lastErr.line === 0) lastErr.line = parseInt(fileLineMatch[1]);
      }
      const warningMatch = line.match(/Warning/i);
      if (warningMatch && !errorMatch) {
        warnings.push({ line: 0, column: 0, message: line.trim() });
      }
    }

    return {
      success: data.status === 'success',
      pdfUrl: data.pdfUrl as string | undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      logs,
      sourceRevision,
      requestId,
    };
  }
);

export const cleanBuild = createAsyncThunk(
  'editor/cleanBuild',
  async (projectId: string, { getState }) => {
    const requestId = ++compileRequestId;
    const state = getState() as { editor: EditorState };
    const sourceRevision = state.editor.sourceRevision;
    const settings = state.editor.compileSettings;
    const token = localStorage.getItem('token');

    const response = await fetch(`/api/compile/${projectId}/clean`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        compiler: 'pdflatex',
        draft: settings.compileMode === 'draft',
        syntaxCheck: settings.syntaxCheck === 'check',
        errorHandling: settings.errorHandling,
      }),
    });
    if (!response.ok) throw new Error('Clean build failed');
    const data = await response.json();

    const logs = data.logs || '';
    const errors: CompileResult['errors'] = [];
    const warnings: CompileResult['warnings'] = [];

    const lines = logs.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const errorMatch = line.match(/^!\s+(.+)\.$/);
      if (errorMatch) {
        const err: { line: number; column: number; message: string; file?: string } = {
          line: 0, column: 0, message: errorMatch[1],
        };
        const nextLine = lines[i + 1];
        if (nextLine) {
          const fileMatch = nextLine.match(/^<\*?>\s*(.*)/);
          if (fileMatch) err.file = fileMatch[1].trim();
        }
        errors.push(err);
      }
      const fileLineMatch = line.match(/^l\.(\d+)/);
      if (fileLineMatch && errors.length > 0) {
        const lastErr = errors[errors.length - 1];
        if (lastErr.line === 0) lastErr.line = parseInt(fileLineMatch[1]);
      }
      const warningMatch = line.match(/Warning/i);
      if (warningMatch && !errorMatch) {
        warnings.push({ line: 0, column: 0, message: line.trim() });
      }
    }

    return {
      success: data.status === 'success',
      pdfUrl: data.pdfUrl as string | undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      logs,
      sourceRevision,
      requestId,
    };
  }
);

export const stopCompilation = createAsyncThunk(
  'editor/stopCompilation',
  async (projectId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/compile/${projectId}/running`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Unable to stop compilation');
    return response.json() as Promise<{ cancelled: number }>;
  }
);

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setContent(state, action) {
      state.content = action.payload;
      state.sourceRevision += 1;
      state.compileStatus = 'idle';
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
      state.saving = false;
      state.compileStatus = 'saved';
    },
    setSaving(state, action) {
      state.saving = action.payload;
      if (action.payload) state.compileStatus = 'saving';
    },
    setAutoCompile(state, action) {
      state.compileSettings.autoCompile = action.payload;
      saveCompileSettings(state.compileSettings, currentProjectId);
    },
    setCompileMode(state, action) {
      state.compileSettings.compileMode = action.payload;
      saveCompileSettings(state.compileSettings, currentProjectId);
    },
    setSyntaxCheck(state, action) {
      state.compileSettings.syntaxCheck = action.payload;
      saveCompileSettings(state.compileSettings, currentProjectId);
    },
    setErrorHandling(state, action) {
      state.compileSettings.errorHandling = action.payload;
      saveCompileSettings(state.compileSettings, currentProjectId);
    },
    initCompileSettings(state, action) {
      currentProjectId = action.payload;
      state.compileSettings = loadCompileSettings(action.payload);
    },
    setCompileStatus(state, action) {
      state.compileStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveFile.pending, (state) => {
        state.saving = true;
        state.compileStatus = 'saving';
      })
      .addCase(saveFile.fulfilled, (state, action) => {
        state.saving = false;
        state.lastSavedAt = action.payload.savedAt;
        state.compileStatus = 'saved';
        const tab = state.openTabs.find(t => t.fileId === action.payload.fileId);
        if (tab) tab.dirty = false;
      })
      .addCase(saveFile.rejected, (state) => {
        state.saving = false;
        state.compileStatus = 'idle';
      })
      .addCase(compileProject.pending, (state) => {
        state.compiling = true;
        state.compileStatus = 'compiling';
      })
      .addCase(compileProject.fulfilled, (state, action) => {
        state.compiling = false;
        const result = action.payload;

        if (result.requestId < compileRequestId) {
          state.compileStatus = 'idle';
          return;
        }

        state.compileResult = {
          success: result.success,
          pdfUrl: result.pdfUrl,
          errors: result.errors,
          warnings: result.warnings,
          logs: result.logs,
        };
        state.compiledRevision = result.sourceRevision;
        state.lastCompiledAt = Date.now();

        if (result.success && result.pdfUrl) {
          state.lastValidPdfUrl = result.pdfUrl;
          state.compileStatus = 'compiled';
        } else {
          state.compileStatus = 'error';
        }
      })
      .addCase(compileProject.rejected, (state) => {
        state.compiling = false;
        state.compileResult = {
          success: false,
          errors: [{ line: 0, column: 0, message: 'Compilation failed. Please try again.' }],
        };
        state.compileStatus = 'error';
      })
      .addCase(cleanBuild.pending, (state) => {
        state.compiling = true;
        state.compileStatus = 'compiling';
      })
      .addCase(cleanBuild.fulfilled, (state, action) => {
        state.compiling = false;
        const result = action.payload;

        if (result.requestId < compileRequestId) {
          state.compileStatus = 'idle';
          return;
        }

        state.compileResult = {
          success: result.success,
          pdfUrl: result.pdfUrl,
          errors: result.errors,
          warnings: result.warnings,
          logs: result.logs,
        };
        state.compiledRevision = result.sourceRevision;
        state.lastCompiledAt = Date.now();

        if (result.success && result.pdfUrl) {
          state.lastValidPdfUrl = result.pdfUrl;
          state.compileStatus = 'compiled';
        } else {
          state.compileStatus = 'error';
        }
      })
      .addCase(cleanBuild.rejected, (state) => {
        state.compiling = false;
        state.compileResult = {
          success: false,
          errors: [{ line: 0, column: 0, message: 'Clean build failed. Please try again.' }],
        };
        state.compileStatus = 'error';
      })
      .addCase(stopCompilation.fulfilled, (state, action) => {
        if (action.payload.cancelled > 0) {
          state.compiling = false;
          state.compileStatus = 'idle';
        }
      });
  },
});

export const {
  setContent, setCursors, updateCursor, removeCursor,
  clearCompileResult, openTab, closeTab, setActiveTab,
  closeAllTabs, closeOtherTabs, markTabSaved, setSaving,
  setAutoCompile, setCompileMode, setSyntaxCheck, setErrorHandling,
  initCompileSettings, setCompileStatus,
} = editorSlice.actions;
export default editorSlice.reducer;
