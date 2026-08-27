import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CompileResult, CursorPosition } from '../types';

interface EditorState {
  content: string;
  compiling: boolean;
  compileResult: CompileResult | null;
  cursors: CursorPosition[];
  sidebarWidth: number;
  pdfVisible: boolean;
  splitRatio: number;
}

const initialState: EditorState = {
  content: '',
  compiling: false,
  compileResult: null,
  cursors: [],
  sidebarWidth: 280,
  pdfVisible: true,
  splitRatio: 50,
};

export const compileProject = createAsyncThunk(
  'editor/compileProject',
  async (projectId: string) => {
    const token = localStorage.getItem('token');
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
    for (const line of lines) {
      const errorMatch = line.match(/^!\s+(.+)\.$/);
      if (errorMatch) {
        errors.push({ line: 0, column: 0, message: errorMatch[1] });
      }
      const fileMatch = line.match(/^l\.(\d+)\s+(.*)$/);
      if (fileMatch && errors.length > 0) {
        errors[errors.length - 1].line = parseInt(fileMatch[1]);
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
    };
  }
);

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setContent(state, action) {
      state.content = action.payload;
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
    clearCompileResult(state) {
      state.compileResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(compileProject.pending, (state) => {
        state.compiling = true;
        state.compileResult = null;
      })
      .addCase(compileProject.fulfilled, (state, action) => {
        state.compiling = false;
        state.compileResult = action.payload;
      })
      .addCase(compileProject.rejected, (state) => {
        state.compiling = false;
        state.compileResult = {
          success: false,
          errors: [{ line: 0, column: 0, message: 'Compilation failed. Please try again.' }],
        };
      });
  },
});

export const { setContent, setCursors, updateCursor, removeCursor, setSidebarWidth, togglePdf, setSplitRatio, clearCompileResult } = editorSlice.actions;
export default editorSlice.reducer;
