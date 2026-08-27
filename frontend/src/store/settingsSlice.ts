import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  // Profile
  profile: {
    name: string;
    email: string;
    username: string;
    avatar: string | null;
  };
  // Appearance
  appearance: {
    colorTheme: string;       // theme id
    editorTheme: string;      // 'application' or theme id
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    uiDensity: 'comfortable' | 'compact';
    animations: boolean;
    reducedMotion: boolean;
  };
  // Editor
  editor: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    tabSize: number;
    indentStyle: 'spaces' | 'tabs';
    wordWrap: 'off' | 'on' | 'bounded';
    minimap: boolean;
    lineNumbers: boolean;
    bracketMatching: boolean;
    autoClosingBrackets: boolean;
    syntaxHighlighting: boolean;
    smoothScrolling: boolean;
    cursorStyle: 'line' | 'block' | 'underline';
    cursorBlinking: boolean;
  };
  // Compilation
  compilation: {
    autoCompile: boolean;
    compileMode: 'normal' | 'draft';
    syntaxCheck: 'check' | 'none';
    errorHandling: 'stop' | 'continue';
    compiler: 'pdflatex' | 'xelatex' | 'lualatex';
    mainDocument: string;
    timeout: number;
  };
  // Files
  files: {
    autosave: boolean;
    autosaveDelay: number;
    confirmFileDelete: boolean;
    showHiddenFiles: boolean;
    sidebarWidth: number;
    restoreSidebarWidth: boolean;
    defaultFile: string;
  };
  // PDF & Preview
  pdf: {
    autoRefresh: boolean;
    zoom: 'fit-width' | 'fit-page' | number;
    preserveZoom: boolean;
    preservePage: boolean;
    openPdfAutomatically: boolean;
    quality: 'standard' | 'high';
  };
  // Notifications
  notifications: {
    compilationCompleted: boolean;
    compilationErrors: boolean;
    compilationWarnings: boolean;
    fileSaved: boolean;
    collaborationActivity: boolean;
    comments: boolean;
    desktopNotifications: boolean;
  };
  // Privacy
  privacy: {
    analytics: boolean;
    usageStatistics: boolean;
    crashReports: boolean;
    personalization: boolean;
  };
}

const defaults: SettingsState = {
  profile: { name: '', email: '', username: '', avatar: null },
  appearance: {
    colorTheme: 'texflow-dark',
    editorTheme: 'application',
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    lineHeight: 1.5,
    uiDensity: 'comfortable',
    animations: true,
    reducedMotion: false,
  },
  editor: {
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    lineHeight: 1.5,
    tabSize: 2,
    indentStyle: 'spaces',
    wordWrap: 'off',
    minimap: false,
    lineNumbers: true,
    bracketMatching: true,
    autoClosingBrackets: true,
    syntaxHighlighting: true,
    smoothScrolling: true,
    cursorStyle: 'line',
    cursorBlinking: true,
  },
  compilation: {
    autoCompile: true,
    compileMode: 'normal',
    syntaxCheck: 'check',
    errorHandling: 'continue',
    compiler: 'pdflatex',
    mainDocument: 'main.tex',
    timeout: 60,
  },
  files: {
    autosave: true,
    autosaveDelay: 1,
    confirmFileDelete: true,
    showHiddenFiles: false,
    sidebarWidth: 260,
    restoreSidebarWidth: true,
    defaultFile: 'main.tex',
  },
  pdf: {
    autoRefresh: true,
    zoom: 'fit-width',
    preserveZoom: true,
    preservePage: true,
    openPdfAutomatically: true,
    quality: 'standard',
  },
  notifications: {
    compilationCompleted: true,
    compilationErrors: true,
    compilationWarnings: true,
    fileSaved: false,
    collaborationActivity: true,
    comments: true,
    desktopNotifications: false,
  },
  privacy: {
    analytics: false,
    usageStatistics: false,
    crashReports: true,
    personalization: true,
  },
};

function loadSettings(): SettingsState {
  try {
    const saved = localStorage.getItem('texflow-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        profile: { ...defaults.profile, ...parsed.profile },
        appearance: { ...defaults.appearance, ...parsed.appearance },
        editor: { ...defaults.editor, ...parsed.editor },
        compilation: { ...defaults.compilation, ...parsed.compilation },
        files: { ...defaults.files, ...parsed.files },
        pdf: { ...defaults.pdf, ...parsed.pdf },
        notifications: { ...defaults.notifications, ...parsed.notifications },
        privacy: { ...defaults.privacy, ...parsed.privacy },
      };
    }
  } catch {}
  return defaults;
}

function persist(settings: SettingsState) {
  try {
    localStorage.setItem('texflow-settings', JSON.stringify(settings));
  } catch {}
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadSettings,
  reducers: {
    // Profile
    updateProfile(state, action: PayloadAction<Partial<SettingsState['profile']>>) {
      state.profile = { ...state.profile, ...action.payload };
      persist(state);
    },
    // Appearance
    setColorTheme(state, action: PayloadAction<string>) {
      state.appearance.colorTheme = action.payload;
      persist(state);
    },
    setEditorTheme(state, action: PayloadAction<string>) {
      state.appearance.editorTheme = action.payload;
      persist(state);
    },
    setAppearanceFontFamily(state, action: PayloadAction<string>) {
      state.appearance.fontFamily = action.payload;
      persist(state);
    },
    setAppearanceFontSize(state, action: PayloadAction<number>) {
      state.appearance.fontSize = action.payload;
      persist(state);
    },
    setAppearanceLineHeight(state, action: PayloadAction<number>) {
      state.appearance.lineHeight = action.payload;
      persist(state);
    },
    setUiDensity(state, action: PayloadAction<'comfortable' | 'compact'>) {
      state.appearance.uiDensity = action.payload;
      persist(state);
    },
    setAnimations(state, action: PayloadAction<boolean>) {
      state.appearance.animations = action.payload;
      persist(state);
    },
    setReducedMotion(state, action: PayloadAction<boolean>) {
      state.appearance.reducedMotion = action.payload;
      persist(state);
    },
    // Editor
    setEditorFontFamily(state, action: PayloadAction<string>) {
      state.editor.fontFamily = action.payload;
      persist(state);
    },
    setEditorFontSize(state, action: PayloadAction<number>) {
      state.editor.fontSize = action.payload;
      persist(state);
    },
    setEditorLineHeight(state, action: PayloadAction<number>) {
      state.editor.lineHeight = action.payload;
      persist(state);
    },
    setTabSize(state, action: PayloadAction<number>) {
      state.editor.tabSize = action.payload;
      persist(state);
    },
    setIndentStyle(state, action: PayloadAction<'spaces' | 'tabs'>) {
      state.editor.indentStyle = action.payload;
      persist(state);
    },
    setWordWrap(state, action: PayloadAction<'off' | 'on' | 'bounded'>) {
      state.editor.wordWrap = action.payload;
      persist(state);
    },
    setMinimap(state, action: PayloadAction<boolean>) {
      state.editor.minimap = action.payload;
      persist(state);
    },
    setLineNumbers(state, action: PayloadAction<boolean>) {
      state.editor.lineNumbers = action.payload;
      persist(state);
    },
    setBracketMatching(state, action: PayloadAction<boolean>) {
      state.editor.bracketMatching = action.payload;
      persist(state);
    },
    setAutoClosingBrackets(state, action: PayloadAction<boolean>) {
      state.editor.autoClosingBrackets = action.payload;
      persist(state);
    },
    setSyntaxHighlighting(state, action: PayloadAction<boolean>) {
      state.editor.syntaxHighlighting = action.payload;
      persist(state);
    },
    setSmoothScrolling(state, action: PayloadAction<boolean>) {
      state.editor.smoothScrolling = action.payload;
      persist(state);
    },
    setCursorStyle(state, action: PayloadAction<'line' | 'block' | 'underline'>) {
      state.editor.cursorStyle = action.payload;
      persist(state);
    },
    setCursorBlinking(state, action: PayloadAction<boolean>) {
      state.editor.cursorBlinking = action.payload;
      persist(state);
    },
    // Compilation
    setCompAutoCompile(state, action: PayloadAction<boolean>) {
      state.compilation.autoCompile = action.payload;
      persist(state);
    },
    setCompCompileMode(state, action: PayloadAction<'normal' | 'draft'>) {
      state.compilation.compileMode = action.payload;
      persist(state);
    },
    setCompSyntaxCheck(state, action: PayloadAction<'check' | 'none'>) {
      state.compilation.syntaxCheck = action.payload;
      persist(state);
    },
    setCompErrorHandling(state, action: PayloadAction<'stop' | 'continue'>) {
      state.compilation.errorHandling = action.payload;
      persist(state);
    },
    setCompCompiler(state, action: PayloadAction<'pdflatex' | 'xelatex' | 'lualatex'>) {
      state.compilation.compiler = action.payload;
      persist(state);
    },
    setCompMainDocument(state, action: PayloadAction<string>) {
      state.compilation.mainDocument = action.payload;
      persist(state);
    },
    setCompTimeout(state, action: PayloadAction<number>) {
      state.compilation.timeout = action.payload;
      persist(state);
    },
    // Files
    setAutosave(state, action: PayloadAction<boolean>) {
      state.files.autosave = action.payload;
      persist(state);
    },
    setAutosaveDelay(state, action: PayloadAction<number>) {
      state.files.autosaveDelay = action.payload;
      persist(state);
    },
    setConfirmFileDelete(state, action: PayloadAction<boolean>) {
      state.files.confirmFileDelete = action.payload;
      persist(state);
    },
    setShowHiddenFiles(state, action: PayloadAction<boolean>) {
      state.files.showHiddenFiles = action.payload;
      persist(state);
    },
    setSidebarWidth(state, action: PayloadAction<number>) {
      state.files.sidebarWidth = action.payload;
      persist(state);
    },
    setRestoreSidebarWidth(state, action: PayloadAction<boolean>) {
      state.files.restoreSidebarWidth = action.payload;
      persist(state);
    },
    setDefaultFile(state, action: PayloadAction<string>) {
      state.files.defaultFile = action.payload;
      persist(state);
    },
    // PDF
    setPdfAutoRefresh(state, action: PayloadAction<boolean>) {
      state.pdf.autoRefresh = action.payload;
      persist(state);
    },
    setPdfZoom(state, action: PayloadAction<'fit-width' | 'fit-page' | number>) {
      state.pdf.zoom = action.payload;
      persist(state);
    },
    setPdfPreserveZoom(state, action: PayloadAction<boolean>) {
      state.pdf.preserveZoom = action.payload;
      persist(state);
    },
    setPdfPreservePage(state, action: PayloadAction<boolean>) {
      state.pdf.preservePage = action.payload;
      persist(state);
    },
    setPdfOpenAutomatically(state, action: PayloadAction<boolean>) {
      state.pdf.openPdfAutomatically = action.payload;
      persist(state);
    },
    setPdfQuality(state, action: PayloadAction<'standard' | 'high'>) {
      state.pdf.quality = action.payload;
      persist(state);
    },
    // Notifications
    setNotifCompilationCompleted(state, action: PayloadAction<boolean>) {
      state.notifications.compilationCompleted = action.payload;
      persist(state);
    },
    setNotifCompilationErrors(state, action: PayloadAction<boolean>) {
      state.notifications.compilationErrors = action.payload;
      persist(state);
    },
    setNotifCompilationWarnings(state, action: PayloadAction<boolean>) {
      state.notifications.compilationWarnings = action.payload;
      persist(state);
    },
    setNotifFileSaved(state, action: PayloadAction<boolean>) {
      state.notifications.fileSaved = action.payload;
      persist(state);
    },
    setNotifCollaborationActivity(state, action: PayloadAction<boolean>) {
      state.notifications.collaborationActivity = action.payload;
      persist(state);
    },
    setNotifComments(state, action: PayloadAction<boolean>) {
      state.notifications.comments = action.payload;
      persist(state);
    },
    setNotifDesktopNotifications(state, action: PayloadAction<boolean>) {
      state.notifications.desktopNotifications = action.payload;
      persist(state);
    },
    // Privacy
    setPrivacyAnalytics(state, action: PayloadAction<boolean>) {
      state.privacy.analytics = action.payload;
      persist(state);
    },
    setPrivacyUsageStatistics(state, action: PayloadAction<boolean>) {
      state.privacy.usageStatistics = action.payload;
      persist(state);
    },
    setPrivacyCrashReports(state, action: PayloadAction<boolean>) {
      state.privacy.crashReports = action.payload;
      persist(state);
    },
    setPrivacyPersonalization(state, action: PayloadAction<boolean>) {
      state.privacy.personalization = action.payload;
      persist(state);
    },
    // Reset
    resetSettings() {
      persist(defaults);
      return defaults;
    },
  },
});

export const {
  updateProfile,
  setColorTheme, setEditorTheme, setAppearanceFontFamily, setAppearanceFontSize, setAppearanceLineHeight,
  setUiDensity, setAnimations, setReducedMotion,
  setEditorFontFamily, setEditorFontSize, setEditorLineHeight, setTabSize, setIndentStyle,
  setWordWrap, setMinimap, setLineNumbers, setBracketMatching, setAutoClosingBrackets,
  setSyntaxHighlighting, setSmoothScrolling, setCursorStyle, setCursorBlinking,
  setCompAutoCompile, setCompCompileMode, setCompSyntaxCheck, setCompErrorHandling,
  setCompCompiler, setCompMainDocument, setCompTimeout,
  setAutosave, setAutosaveDelay, setConfirmFileDelete, setShowHiddenFiles,
  setSidebarWidth, setRestoreSidebarWidth, setDefaultFile,
  setPdfAutoRefresh, setPdfZoom, setPdfPreserveZoom, setPdfPreservePage,
  setPdfOpenAutomatically, setPdfQuality,
  setNotifCompilationCompleted, setNotifCompilationErrors, setNotifCompilationWarnings,
  setNotifFileSaved, setNotifCollaborationActivity, setNotifComments, setNotifDesktopNotifications,
  setPrivacyAnalytics, setPrivacyUsageStatistics, setPrivacyCrashReports, setPrivacyPersonalization,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
