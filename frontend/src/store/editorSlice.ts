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
  /** Per-file content cache — always holds the latest content for each open file */
  contentCache: Record<string, string>;
  sourceRevision: number;
  compiledRevision: number;
  lastSavedAt: number | null;
  lastCompiledAt: number | null;
  saving: boolean;
  compileStatus: CompileStatus;
  lastValidPdfUrl: string | null;
  compileSettings: CompileSettings;
  compileRequestId: number;
  currentProjectId: string | null;
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
    const globalSettings = JSON.parse(localStorage.getItem('texflow-settings') || '{}');
    if (globalSettings.compilation) return { ...defaults, ...globalSettings.compilation };
  } catch {}
  return defaults;
}

function saveCompileSettings(settings: CompileSettings, projectId?: string) {
  try {
    const key = projectId ? `texflow-compile-${projectId}` : 'texflow-compile';
    localStorage.setItem(key, JSON.stringify(settings));
  } catch {}
}

/**
 * Validates that content is pure LaTeX source without line-number contamination.
 * CodeMirror 6 renders line numbers in a separate .cm-gutters div, so
 * doc.toString() never includes them. This is a safety-net assertion.
 *
 * Returns the content unchanged (it should already be clean).
 */
function validateEditorContent(content: string, fileId?: string): string {
  const lines = content.split('\n');
  const lineNumberPattern = /^\d+[\t ]/;
  let contaminatedLines = 0;
  const sampleSize = Math.min(lines.length, 20);
  let nonEmptyCount = 0;
  for (let i = 0; i < sampleSize; i++) {
    if (lines[i].length === 0) continue;
    nonEmptyCount++;
    if (lineNumberPattern.test(lines[i])) contaminatedLines++;
  }
  if (nonEmptyCount > 0 && contaminatedLines / nonEmptyCount > 0.8) {
    console.error(
      `[TexFlow] CONTENT VALIDATION FAILED: Line-number contamination detected in file ${fileId || 'unknown'}. ` +
      `${contaminatedLines}/${nonEmptyCount} sample lines start with "digits+whitespace". ` +
      `Content must be pure LaTeX. First line: "${lines[0].slice(0, 80)}"`
    );
  }
  return content;
}

const initialState: EditorState = {
  content: '',
  compiling: false,
  compileResult: null,
  cursors: [],
  openTabs: [],
  activeTabId: null,
  contentCache: {},
  sourceRevision: 0,
  compiledRevision: 0,
  lastSavedAt: null,
  lastCompiledAt: null,
  saving: false,
  compileStatus: 'idle',
  lastValidPdfUrl: null,
  compileSettings: loadCompileSettings(),
  compileRequestId: 0,
  currentProjectId: null,
};

export const saveFile = createAsyncThunk(
  'editor/saveFile',
  async ({ fileId, content }: { fileId: string; content: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Save failed');
    return { fileId, savedAt: Date.now() };
  }
);

/**
 * Save all dirty files AND the active tab before compiling.
 * Uses getState() to always get the absolute latest content.
 * The state parameter is just for initial dirty-tab detection;
 * actual content is always re-read from the live store.
 */
async function saveAllDirtyFiles(
  editorState: EditorState,
  getState: () => any
): Promise<boolean> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Collect the files that need saving (using initial state for dirty detection)
  const tabsToSave: { fileId: string; isActiveTab: boolean }[] = [];
  for (const tab of editorState.openTabs) {
    const isActiveTab = tab.fileId === editorState.activeTabId;
    if (!tab.dirty && !isActiveTab) continue;
    tabsToSave.push({ fileId: tab.fileId, isActiveTab });
  }

  if (tabsToSave.length === 0) return true;

  // Now re-read the ABSOLUTE LATEST state and save each file
  // Sequential saves prevent race conditions between parallel fetches
  for (const { fileId, isActiveTab } of tabsToSave) {
    const latestEditor = (getState() as any).editor as EditorState;
    const rawContent = isActiveTab
      ? latestEditor.content
      : (latestEditor.contentCache[fileId] ?? '');
    if (!rawContent && rawContent !== '') continue;
    // Validate content is pure LaTeX before saving to server
    const fileContent = validateEditorContent(rawContent, fileId);
    try {
      await fetch(`/api/files/${fileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: fileContent }),
      });
    } catch {
      console.warn(`[TexFlow] Failed to save file ${fileId} before compile`);
    }
  }
  return true;
}

export const compileProject = createAsyncThunk(
  'editor/compileProject',
  async (projectId: string, { getState, dispatch }) => {
    // ── Step 1: Save ALL dirty files + active tab with the absolute latest content ──
    await saveAllDirtyFiles((getState() as any).editor, getState);

    // ── Step 1b: Final defensive save — re-read state and save active tab one more time.
    //     This ensures absolutely nothing is lost even if getState() changed between steps. ──
    const token = localStorage.getItem('token');
    const tokenHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) tokenHeaders.Authorization = `Bearer ${token}`;
    // Re-read state RIGHT NOW for the absolute latest content
    const latestState = getState() as { editor: EditorState; project?: { currentProject?: { compiler?: string } }; settings?: { compilation?: { compiler?: string; mainDocument?: string; timeout?: number } } };
    if (latestState.editor.activeTabId) {
      // Validate content is pure LaTeX before saving to server
      const validatedContent = validateEditorContent(latestState.editor.content, latestState.editor.activeTabId);
      await fetch(`/api/files/${latestState.editor.activeTabId}`, {
        method: 'PATCH',
        headers: tokenHeaders,
        body: JSON.stringify({ content: validatedContent }),
      });
    }

    // Mark saved tabs as clean
    for (const tab of latestState.editor.openTabs) {
      if (tab.dirty) dispatch(markTabSaved(tab.fileId));
    }

    // ── Step 2: Compile ──
    const requestId = latestState.editor.compileRequestId + 1;
    const sourceRevision = latestState.editor.sourceRevision;
    const settings = latestState.editor.compileSettings;

    const response = await fetch(`/api/compile/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        compiler: latestState.project?.currentProject?.compiler || latestState.settings?.compilation?.compiler || 'pdflatex',
        mainDocument: latestState.settings?.compilation?.mainDocument || 'main.tex',
        timeout: latestState.settings?.compilation?.timeout,
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
  async (projectId: string, { getState, dispatch }) => {
    // ── Step 1: Save ALL dirty files + active tab with the absolute latest content ──
    await saveAllDirtyFiles((getState() as any).editor, getState);

    // ── Step 1b: Final defensive save — re-read state and save active tab one more time ──
    const token = localStorage.getItem('token');
    const tokenHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) tokenHeaders.Authorization = `Bearer ${token}`;
    // Re-read state RIGHT NOW for the absolute latest content
    const latestState = getState() as { editor: EditorState; project?: { currentProject?: { compiler?: string } }; settings?: { compilation?: { compiler?: string; mainDocument?: string; timeout?: number } } };
    if (latestState.editor.activeTabId) {
      // Validate content is pure LaTeX before saving to server
      const validatedContent = validateEditorContent(latestState.editor.content, latestState.editor.activeTabId);
      await fetch(`/api/files/${latestState.editor.activeTabId}`, {
        method: 'PATCH',
        headers: tokenHeaders,
        body: JSON.stringify({ content: validatedContent }),
      });
    }

    for (const tab of latestState.editor.openTabs) {
      if (tab.dirty) dispatch(markTabSaved(tab.fileId));
    }

    const requestId = latestState.editor.compileRequestId + 1;
    const sourceRevision = latestState.editor.sourceRevision;
    const settings = latestState.editor.compileSettings;

    const response = await fetch(`/api/compile/${projectId}/clean`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        compiler: latestState.project?.currentProject?.compiler || latestState.settings?.compilation?.compiler || 'pdflatex',
        mainDocument: latestState.settings?.compilation?.mainDocument || 'main.tex',
        timeout: latestState.settings?.compilation?.timeout,
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
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
      // Keep the per-file content cache in sync
      if (state.activeTabId) {
        state.contentCache[state.activeTabId] = action.payload;
        const tab = state.openTabs.find(t => t.fileId === state.activeTabId);
        if (tab) tab.dirty = true;
      }
    },
    /**
     * Switch to a different tab. Saves current content to cache,
     * loads the target file's content from cache (or fallback).
     * Always initializes cache entry so saveAllDirtyFiles never sees empty content.
     */
    switchTab(state, action: { payload: { fileId: string; content: string } }) {
      const { fileId, content } = action.payload;
      // Persist current tab's content to cache before switching
      if (state.activeTabId) {
        state.contentCache[state.activeTabId] = state.content;
      }
      state.activeTabId = fileId;
      // Initialize cache for new file if not present (prevents empty-string fallback)
      if (!(fileId in state.contentCache)) {
        state.contentCache[fileId] = content;
      }
      state.content = state.contentCache[fileId];
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
      const { fileId, name, content } = action.payload;
      if (!state.openTabs.find(t => t.fileId === fileId)) {
        state.openTabs.push({ fileId, name, dirty: false });
      }
      // Initialize content cache for this file (only if no cached version exists)
      if (content !== undefined && !(fileId in state.contentCache)) {
        state.contentCache[fileId] = content;
      }
      state.activeTabId = fileId;
    },
    closeTab(state, action: { payload: string }) {
      const fileId = action.payload;
      state.openTabs = state.openTabs.filter(t => t.fileId !== fileId);
      // Clean up content cache for closed tab
      delete state.contentCache[fileId];
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
      const keepSet = new Set([keepId]);
      state.openTabs = state.openTabs.filter(t => t.fileId === keepId);
      state.activeTabId = keepId;
      // Clean up cache for closed tabs
      for (const key of Object.keys(state.contentCache)) {
        if (!keepSet.has(key)) delete state.contentCache[key];
      }
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
      saveCompileSettings(state.compileSettings, state.currentProjectId || undefined);
    },
    setCompileMode(state, action) {
      state.compileSettings.compileMode = action.payload;
      saveCompileSettings(state.compileSettings, state.currentProjectId || undefined);
    },
    setSyntaxCheck(state, action) {
      state.compileSettings.syntaxCheck = action.payload;
      saveCompileSettings(state.compileSettings, state.currentProjectId || undefined);
    },
    setErrorHandling(state, action) {
      state.compileSettings.errorHandling = action.payload;
      saveCompileSettings(state.compileSettings, state.currentProjectId || undefined);
    },
    initCompileSettings(state, action) {
      state.currentProjectId = action.payload;
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
        state.compileRequestId += 1;
      })
      .addCase(compileProject.fulfilled, (state, action) => {
        state.compiling = false;
        const result = action.payload;

        if (result.requestId < state.compileRequestId) {
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
        state.compileRequestId += 1;
      })
      .addCase(cleanBuild.fulfilled, (state, action) => {
        state.compiling = false;
        const result = action.payload;

        if (result.requestId < state.compileRequestId) {
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
  initCompileSettings, setCompileStatus, switchTab,
} = editorSlice.actions;
export default editorSlice.reducer;
