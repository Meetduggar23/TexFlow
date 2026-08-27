import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LayoutState {
  filesOpen: boolean;
  filesWidth: number;
  filesPrevWidth: number;
  pdfOpen: boolean;
  pdfWidth: number;
  terminalOpen: boolean;
  terminalHeight: number;
  fileTreeExpanded: Record<string, boolean>;
  isResizingFilesSidebar: boolean;
  selectedFolderId: string | null;
}

const DEFAULT_FILES_WIDTH = 260;
const DEFAULT_PDF_WIDTH = 45;
const DEFAULT_TERMINAL_HEIGHT = 200;
const COLLAPSED_RAIL_WIDTH = 44;

function loadLayout(projectId?: string): Partial<LayoutState> {
  try {
    const key = projectId ? `texflow-layout-${projectId}` : 'texflow-layout';
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function loadDefaultFilesWidth() {
  try {
    const settings = JSON.parse(localStorage.getItem('texflow-settings') || '{}');
    const width = Number(settings.files?.sidebarWidth);
    if (Number.isFinite(width)) return Math.max(180, Math.min(420, width));
  } catch { /* use application default */ }
  return DEFAULT_FILES_WIDTH;
}

function saveLayout(state: LayoutState, projectId?: string) {
  try {
    const key = projectId ? `texflow-layout-${projectId}` : 'texflow-layout';
    localStorage.setItem(key, JSON.stringify({
      filesOpen: state.filesOpen,
      filesWidth: state.filesWidth,
      pdfOpen: state.pdfOpen,
      pdfWidth: state.pdfWidth,
      terminalOpen: state.terminalOpen,
      terminalHeight: state.terminalHeight,
    }));
  } catch {}
}

let currentProjectId: string | undefined;

function getInitialState(projectId?: string): LayoutState {
  currentProjectId = projectId;
  const saved = loadLayout(projectId);
  const defaultWidth = loadDefaultFilesWidth();
  return {
    filesOpen: saved.filesOpen ?? true,
    filesWidth: saved.filesWidth ?? defaultWidth,
    filesPrevWidth: saved.filesWidth ?? defaultWidth,
    pdfOpen: saved.pdfOpen ?? true,
    pdfWidth: saved.pdfWidth ?? DEFAULT_PDF_WIDTH,
    terminalOpen: saved.terminalOpen ?? false,
    terminalHeight: saved.terminalHeight ?? DEFAULT_TERMINAL_HEIGHT,
    fileTreeExpanded: {},
    isResizingFilesSidebar: false,
    selectedFolderId: null,
  };
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: getInitialState(),
  reducers: {
    initLayout(state, action: PayloadAction<string | undefined>) {
      const projectId = action.payload;
      currentProjectId = projectId;
      const saved = loadLayout(projectId);
      if (saved.filesOpen !== undefined) state.filesOpen = saved.filesOpen;
      if (saved.filesWidth !== undefined) state.filesWidth = saved.filesWidth;
      else state.filesWidth = loadDefaultFilesWidth();
      if (saved.pdfOpen !== undefined) state.pdfOpen = saved.pdfOpen;
      if (saved.pdfWidth !== undefined) state.pdfWidth = saved.pdfWidth;
      if (saved.terminalOpen !== undefined) state.terminalOpen = saved.terminalOpen;
      if (saved.terminalHeight !== undefined) state.terminalHeight = saved.terminalHeight;
      state.filesPrevWidth = state.filesWidth > COLLAPSED_RAIL_WIDTH + 20 ? state.filesWidth : DEFAULT_FILES_WIDTH;
    },
    setFilesSidebarResizing(state, action: PayloadAction<boolean>) { state.isResizingFilesSidebar = action.payload; },
    setSelectedFolderId(state, action: PayloadAction<string | null>) { state.selectedFolderId = action.payload; },
    toggleSidebar(state) {
      if (state.filesOpen) {
        state.filesPrevWidth = state.filesWidth;
        state.filesWidth = COLLAPSED_RAIL_WIDTH;
        state.filesOpen = false;
      } else {
        state.filesWidth = state.filesPrevWidth || DEFAULT_FILES_WIDTH;
        state.filesOpen = true;
      }
      saveLayout(state, currentProjectId);
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      if (action.payload) {
        state.filesWidth = state.filesPrevWidth || DEFAULT_FILES_WIDTH;
        state.filesOpen = true;
      } else {
        state.filesPrevWidth = state.filesWidth;
        state.filesWidth = COLLAPSED_RAIL_WIDTH;
        state.filesOpen = false;
      }
      saveLayout(state, currentProjectId);
    },
    setFilesWidth(state, action: PayloadAction<number>) {
      const w = Math.max(180, Math.min(420, action.payload));
      state.filesWidth = w;
      state.filesOpen = true;
      state.filesPrevWidth = w;
      saveLayout(state, currentProjectId);
    },
    setFilesWidthTransient(state, action: PayloadAction<number>) {
      state.filesWidth = Math.max(180, Math.min(420, action.payload));
      state.filesOpen = true;
      state.filesPrevWidth = state.filesWidth;
    },
    togglePdf(state) {
      state.pdfOpen = !state.pdfOpen;
      saveLayout(state, currentProjectId);
    },
    setPdfOpen(state, action: PayloadAction<boolean>) {
      state.pdfOpen = action.payload;
      saveLayout(state, currentProjectId);
    },
    setPdfWidth(state, action: PayloadAction<number>) {
      state.pdfWidth = Math.max(25, Math.min(75, action.payload));
      saveLayout(state, currentProjectId);
    },
    toggleTerminal(state) {
      state.terminalOpen = !state.terminalOpen;
      saveLayout(state, currentProjectId);
    },
    setTerminalOpen(state, action: PayloadAction<boolean>) {
      state.terminalOpen = action.payload;
      saveLayout(state, currentProjectId);
    },
    setTerminalHeight(state, action: PayloadAction<number>) {
      state.terminalHeight = Math.max(100, Math.min(600, action.payload));
      saveLayout(state, currentProjectId);
    },
    resetLayout(state) {
      state.filesOpen = true;
      state.filesWidth = DEFAULT_FILES_WIDTH;
      state.filesPrevWidth = DEFAULT_FILES_WIDTH;
      state.pdfOpen = true;
      state.pdfWidth = DEFAULT_PDF_WIDTH;
      state.terminalOpen = false;
      state.terminalHeight = DEFAULT_TERMINAL_HEIGHT;
      saveLayout(state, currentProjectId);
    },
    toggleFileNode(state, action) {
      const nodeId = action.payload;
      state.fileTreeExpanded[nodeId] = !state.fileTreeExpanded[nodeId];
    },
  },
});

export const {
  initLayout, toggleSidebar, setSidebarOpen, setFilesWidth, setFilesWidthTransient, setFilesSidebarResizing, setSelectedFolderId,
  togglePdf, setPdfOpen, setPdfWidth, toggleTerminal, setTerminalOpen, setTerminalHeight,
  resetLayout, toggleFileNode,
} = uiSlice.actions;
export default uiSlice.reducer;
export { COLLAPSED_RAIL_WIDTH, DEFAULT_FILES_WIDTH, DEFAULT_PDF_WIDTH, DEFAULT_TERMINAL_HEIGHT };
