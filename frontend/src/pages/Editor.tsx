import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { store } from '../store';
import {
  fetchProject, fetchFiles, setCurrentFile, clearCurrentProject,
  updateFileInTree, createFile,
} from '../store/projectSlice';
import {
  setContent, compileProject, cleanBuild, openTab,
  closeTab,
  setSaving, markTabSaved,
  saveFile, setAutoCompile, initCompileSettings,
  stopCompilation, switchTab,
} from '../store/editorSlice';
import { initLayout, toggleSidebar, togglePdf, toggleTerminal, setFilesWidth, setFilesWidthTransient, setFilesSidebarResizing, setPdfWidth, setPdfWidthTransient, setTerminalHeight } from '../store/uiSlice';
import EditorHeader from '../components/EditorHeader';
import FileTree from '../components/FileTree';
import CodeEditor from '../components/CodeEditor';
import PDFViewer from '../components/PDFViewer';
import TerminalPanel from '../components/TerminalPanel';
import CommentsPanel from '../components/CommentsPanel';
import HistoryPanel from '../components/HistoryPanel';
import ShareDialog from '../components/ShareDialog';
import SearchPanel from '../components/SearchPanel';
import CommandPalette from '../components/CommandPalette';
import EquationEditor from '../components/EquationEditor';
import TableBuilder from '../components/TableBuilder';
import BibliographyManager from '../components/BibliographyManager';
import ImageUploader from '../components/ImageUploader';
import LinkDialog from '../components/LinkDialog';
import ThemeSelector from '../components/ThemeSelector';
import AuthModal from '../components/AuthModal';
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const SAVE_COMPILE_DELAY = 500;

export default function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentProject, files, currentFile } = useAppSelector(state => state.project);
  const {
    content, compiling, openTabs, activeTabId,
    saving, compileStatus, sourceRevision, compiledRevision, compileSettings,
  } = useAppSelector(state => state.editor);
  const { filesOpen, filesWidth, isResizingFilesSidebar, pdfOpen, pdfWidth, terminalOpen, terminalHeight } = useAppSelector(state => state.ui);
  const fileSettings = useAppSelector(state => state.settings.files);

  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showEquation, setShowEquation] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showBib, setShowBib] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const socket = useSocket(projectId);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) setShowAuthModal(true);
  }, [projectId]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savePromiseRef = useRef<Promise<boolean> | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const contentRef = useRef(content);
  const currentFileRef = useRef(currentFile);
  const activeTabIdRef = useRef(activeTabId);
  const openTabsRef = useRef(openTabs);
  const insertSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const autoCompileRef = useRef(compileSettings.autoCompile);
  const projectIdRef = useRef(projectId);
  const isTabSwitchingRef = useRef(false);
  const doSaveRef = useRef<() => void>(() => undefined);
  const handleCompileRef = useRef<() => void>(() => undefined);
  const workspaceRef = useRef<HTMLDivElement>(null);

  contentRef.current = content;
  currentFileRef.current = currentFile;
  activeTabIdRef.current = activeTabId;
  openTabsRef.current = openTabs;
  autoCompileRef.current = compileSettings.autoCompile;
  projectIdRef.current = projectId;

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
      dispatch(fetchFiles(projectId));
      dispatch(initLayout(projectId));
      dispatch(initCompileSettings(projectId));
    }
    return () => { dispatch(clearCurrentProject()); };
  }, [projectId, dispatch]);

  useEffect(() => {
    const handleTabSwitch = (e: Event) => {
      isTabSwitchingRef.current = true;
      const detail = (e as CustomEvent<{ content?: string }>).detail;
      if (detail?.content !== undefined) {
        lastSavedContentRef.current = detail.content;
      }
    };
    window.addEventListener('texflow:tab-switch', handleTabSwitch);
    return () => window.removeEventListener('texflow:tab-switch', handleTabSwitch);
  }, []);

  useEffect(() => {
    if (isTabSwitchingRef.current) {
      isTabSwitchingRef.current = false;
      return;
    }
    if (currentFile?.content !== undefined) {
      dispatch(setContent(currentFile.content));
      dispatch(openTab({ fileId: currentFile.id, name: currentFile.name, content: currentFile.content }));
      lastSavedContentRef.current = currentFile.content;
    }
  }, [currentFile?.id, dispatch]);

  useEffect(() => {
    if (!socket) return;
    socket.on('file-updated', (data: { fileId: string; content: string }) => {
      dispatch(updateFileInTree(data));
    });
    return () => { socket.off('file-updated'); };
  }, [socket, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowCommandPalette(p => !p); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') { e.preventDefault(); setShowCommandPalette(p => !p); }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); setShowSearch(p => !p); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') { e.preventDefault(); setShowSearch(p => !p); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); doSaveRef.current(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleCompileRef.current(); }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); dispatch(toggleTerminal()); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); window.dispatchEvent(new CustomEvent('texflow:start-file-creation', { detail: 'file' })); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') { e.preventDefault(); if (activeTabId) dispatch(closeTab(activeTabId)); }
      if (e.key === 'F11') { e.preventDefault(); if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, dispatch]);

  const doSave = useCallback(async (): Promise<boolean> => {
    if (savePromiseRef.current) return savePromiseRef.current;
    const tabId = activeTabIdRef.current;
    if (!tabId) return true;
    // Read the ABSOLUTE latest content directly from the Redux store
    // instead of from a ref that might be stale during rapid typing.
    const latestContent = store.getState().editor.content;
    if (latestContent === lastSavedContentRef.current) return true;
    const promise = (async () => {
      dispatch(setSaving(true));
      try {
        await dispatch(saveFile({ fileId: tabId, content: latestContent })).unwrap();
        lastSavedContentRef.current = latestContent;
        dispatch(updateFileInTree({ fileId: tabId, content: latestContent }));
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to save changes');
        return false;
      } finally {
        savePromiseRef.current = null;
      }
    })();
    savePromiseRef.current = promise;
    return promise;
  }, [dispatch]);

  const doCompile = useCallback(async () => {
    const pid = projectIdRef.current;
    if (!pid) return;
    try {
      await dispatch(compileProject(pid)).unwrap();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Compilation failed');
    }
  }, [dispatch]);

  const doSaveThenCompile = useCallback(async () => {
    if (await doSave()) await doCompile();
  }, [doSave, doCompile]);

  useEffect(() => {
    if (!currentFile) return;
    if (!fileSettings.autosave) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      doSave().then(saved => {
        if (saved && autoCompileRef.current) {
          compileTimerRef.current = setTimeout(() => { doCompile(); }, SAVE_COMPILE_DELAY);
        }
      });
    }, Math.max(0.25, fileSettings.autosaveDelay) * 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    };
  }, [content, currentFile?.id, doSave, doCompile, fileSettings.autosave, fileSettings.autosaveDelay]);

  const handleContentChange = useCallback((newContent: string) => {
    dispatch(setContent(newContent));
    if (socket && activeTabIdRef.current && projectId) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      socket.emit('file-update', { projectId, fileId: activeTabIdRef.current, content: newContent, userId: user.id });
    }
  }, [dispatch, socket, projectId]);

  const handleCompile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setShowAuthModal(true); return; }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    await doSaveThenCompile();
  }, [doSaveThenCompile]);

  doSaveRef.current = doSave;
  handleCompileRef.current = handleCompile;

  const handleCleanBuild = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    if (!(await doSave())) return;
    const pid = projectIdRef.current;
    if (!pid) return;
    try {
      await dispatch(cleanBuild(pid)).unwrap();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Clean build failed');
    }
  }, [doSave, dispatch]);

  const handleStopCompilation = useCallback(async () => {
    const pid = projectIdRef.current;
    if (!pid) return;
    try { await dispatch(stopCompilation(pid)).unwrap(); } catch { toast.error('Unable to stop compilation'); }
  }, [dispatch]);

  const handleSave = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setShowAuthModal(true); return; }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    await doSave();
    toast.success('Saved');
  }, [doSave]);

  const handleDownloadPdf = useCallback(async () => {
    if (!projectId) return;
    try {
      await doSaveThenCompile();
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/compile/${projectId}/pdf`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) throw new Error('PDF is not available');
      saveAs(await response.blob(), 'document.pdf');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to download PDF'); }
  }, [projectId, doSaveThenCompile]);

  const handleDownloadProject = useCallback(async () => {
    if (!currentProject || !projectId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/files/project/${projectId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      const zip = new JSZip();
      for (const file of (data.files || [])) zip.file(file.path || file.name, file.content || '');
      for (const folder of (data.folders || [])) zip.folder(folder.path || folder.name);
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${currentProject.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`);
      toast.success('Project downloaded');
    } catch { toast.error('Failed to download'); }
  }, [currentProject, projectId]);

  const handleInsertLatex = useCallback((latex: string) => {
    if (!activeTabIdRef.current) return;
    const selection = insertSelectionRef.current;
    const from = selection ? Math.min(selection.from, content.length) : content.length;
    const to = selection ? Math.min(selection.to, content.length) : content.length;
    const prefix = from > 0 && content[from - 1] !== '\n' ? '\n' : '';
    const newContent = `${content.slice(0, from)}${prefix}${latex}${content.slice(to)}`;
    dispatch(setContent(newContent));
    insertSelectionRef.current = null;
  }, [content, dispatch]);

  const handleNewFile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.dispatchEvent(new CustomEvent('texflow:auth-required', { detail: { action: 'new-file' } }));
      return;
    }
    window.dispatchEvent(new CustomEvent('texflow:start-file-creation', { detail: 'file' }));
  }, []);

  const handleNewFolder = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.dispatchEvent(new CustomEvent('texflow:auth-required', { detail: { action: 'new-folder' } }));
      return;
    }
    window.dispatchEvent(new CustomEvent('texflow:start-file-creation', { detail: 'folder' }));
  }, []);

  const handleNavigateToLine = useCallback((_line: number) => {}, []);

  /* ── Files sidebar resize ── */
  const filesWidthRef = useRef(filesWidth);
  filesWidthRef.current = filesWidth;

  const handleFilesResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startWidth = filesWidthRef.current;
    let lastX = startX;
    dispatch(setFilesSidebarResizing(true));
    const onMove = (ev: PointerEvent) => {
      lastX = ev.clientX;
      const delta = ev.clientX - startX;
      dispatch(setFilesWidthTransient(Math.max(180, Math.min(420, startWidth + delta))));
    };
    const finish = (cancelled = false) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKeyDown);
      dispatch(setFilesSidebarResizing(false));
      if (cancelled) dispatch(setFilesWidth(startWidth));
      else dispatch(setFilesWidth(Math.max(180, Math.min(420, startWidth + (lastX - startX)))));
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    const onUp = () => finish();
    const onCancel = () => finish(true);
    const onKeyDown = (ev: KeyboardEvent) => { if (ev.key === 'Escape') { ev.preventDefault(); finish(true); } };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKeyDown);
  }, [dispatch]);

  /* ── Terminal resize ── */
  const handleTerminalResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalHeight;
    const onMove = (ev: PointerEvent) => {
      const delta = startY - ev.clientY;
      dispatch(setTerminalHeight(Math.max(100, Math.min(600, startHeight + delta))));
    };
    const finish = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', onCancel);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    const onCancel = () => finish();
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', onCancel);
  }, [terminalHeight, dispatch]);

  /* ── Code/PDF divider resize ── */
  const handlePdfResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const workspaceBounds = workspace.getBoundingClientRect();
    const startPdfWidth = pdfWidth;
    let currentPdfWidth = startPdfWidth;
    const minPanelPercent = Math.min(35, (300 / workspaceBounds.width) * 100);
    const maxPdfPercent = 100 - minPanelPercent;
    const clampPdfWidth = (value: number) => Math.max(minPanelPercent, Math.min(maxPdfPercent, value));
    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      const deltaPercent = (delta / workspaceBounds.width) * 100;
      currentPdfWidth = clampPdfWidth(startPdfWidth - deltaPercent);
      dispatch(setPdfWidthTransient(currentPdfWidth));
    };
    const finish = (cancelled = false) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKeyDown);
      if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      dispatch(setPdfWidth(cancelled ? startPdfWidth : currentPdfWidth));
    };
    const onUp = () => finish();
    const onCancel = () => finish(true);
    const onKeyDown = (ev: KeyboardEvent) => { if (ev.key === 'Escape') { ev.preventDefault(); onCancel(); } };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKeyDown);
  }, [pdfWidth, dispatch]);

  const isStale = sourceRevision > compiledRevision;

  if (!currentProject) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* ── Top Header (Google Docs-style) ── */}
      <EditorHeader
        project={currentProject}
        onCompile={handleCompile}
        onCleanBuild={handleCleanBuild}
        onStopCompilation={handleStopCompilation}
        onBack={() => navigate('/dashboard')}
        onToggleComments={() => setShowComments(p => !p)}
        onToggleHistory={() => setShowHistory(p => !p)}
        onToggleShare={() => setShowShare(p => !p)}
        onSave={handleSave}
        onNewFile={handleNewFile}
        onNewFolder={handleNewFolder}
        onDownloadPdf={handleDownloadPdf}
        onDownloadSource={handleDownloadProject}
        onOpenSearch={() => setShowSearch(p => !p)}
        onOpenCommandPalette={() => setShowCommandPalette(p => !p)}
      />

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>

        {/* ── Collapsed sidebar expand strip ── */}
        {!filesOpen && (
          <div
            className="flex-shrink-0 flex items-center justify-center border-r cursor-pointer transition-colors"
            style={{
              width: 28,
              background: 'var(--color-background)',
              borderColor: 'var(--color-border)',
            }}
            onClick={() => dispatch(toggleSidebar())}
            role="button"
            tabIndex={0}
            aria-label="Expand sidebar"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dispatch(toggleSidebar()); } }}
          >
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--color-text-muted)' }}
              className="transition-transform hover:scale-110"
            >
              <path d="M4 2L8 6L4 10" />
            </svg>
          </div>
        )}

        {/* ── File Tree Panel ── */}
        <div
          className="flex-shrink-0 overflow-hidden relative"
          style={{
            width: filesOpen ? filesWidth : 0,
            background: 'var(--color-background)',
            borderRight: filesOpen ? '1px solid var(--color-border)' : 'none',
            transition: isResizingFilesSidebar ? 'none' : 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="h-full flex flex-col relative overflow-hidden" style={{ width: filesOpen ? filesWidth : 0 }}>
            <FileTree files={files} projectId={projectId!} onSearch={() => setShowSearch(p => !p)} />
            {filesOpen && (
              <div
                className="absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-10 group"
                role="separator"
                tabIndex={0}
                aria-label="Resize file explorer"
                aria-orientation="vertical"
                onKeyDown={e => {
                  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                  e.preventDefault();
                  const amount = e.shiftKey ? 50 : 10;
                  dispatch(setFilesWidth(filesWidth + (e.key === 'ArrowRight' ? amount : -amount)));
                }}
                onPointerDown={handleFilesResize}
              >
                <div
                  className="w-0.5 h-full mx-auto rounded-full transition-all group-hover:w-1 group-active:w-1"
                  style={{ background: isResizingFilesSidebar ? 'var(--color-accent)' : 'var(--color-border)' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Right workspace: Code + PDF + Terminal ── */}
        <div ref={workspaceRef} className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── Code + PDF row ── */}
          <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
            {/* ── Code Editor ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ minWidth: 0 }}>
              <CodeEditor
                content={content}
                onChange={handleContentChange}
                onSave={handleSave}
                file={currentFile}
                allFiles={files}
                compileStatus={compileStatus}
                saving={saving}
                isStale={isStale}
                onOpenImage={() => setShowImage(true)}
                onOpenTable={() => setShowTable(true)}
                onOpenLink={() => setShowLink(true)}
                onSelectionChange={selection => { insertSelectionRef.current = selection; }}
              />
            </div>

            {/* ── Code/PDF Divider ── */}
            {pdfOpen && (
              <div
                className="flex-shrink-0 cursor-col-resize relative group"
                style={{ width: 5, background: 'var(--color-border)', touchAction: 'none' }}
                role="separator"
                tabIndex={0}
                aria-label="Resize code and PDF panels"
                aria-orientation="vertical"
                aria-valuemin={25}
                aria-valuemax={75}
                aria-valuenow={Math.round(pdfWidth)}
                onPointerDown={handlePdfResize}
                onKeyDown={e => {
                  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                  e.preventDefault();
                  const workspace = workspaceRef.current;
                  const amountPx = e.shiftKey ? 50 : 10;
                  const amount = workspace ? (amountPx / workspace.getBoundingClientRect().width) * 100 : 2;
                  dispatch(setPdfWidth(pdfWidth + (e.key === 'ArrowLeft' ? amount : -amount)));
                }}
              >
                <div
                  className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 rounded-full transition-all group-hover:w-1 group-active:w-1"
                  style={{ background: 'transparent' }}
                />
              </div>
            )}

            {/* ── PDF not open — small expand button ── */}
            {!pdfOpen && (
              <div
                className="flex-shrink-0 flex flex-col items-center justify-center border-l"
                style={{ width: 28, background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={() => dispatch(togglePdf())}
                  className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
                  style={{ color: 'var(--color-accent)' }}
                  title="Show PDF Preview"
                  aria-label="Show PDF preview"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 2L4 6L8 10" />
                  </svg>
                </button>
              </div>
            )}

            {/* ── PDF Preview Panel ── */}
            {pdfOpen && (
              <div
                className="flex flex-col overflow-hidden flex-shrink-0"
                style={{ width: `${pdfWidth}%`, minWidth: 0, background: 'var(--color-surface)' }}
              >
                <PDFViewer projectId={projectId!} onRecompile={handleCompile} />
              </div>
            )}
          </div>

          {/* ── Terminal Divider ── */}
          {terminalOpen && (
            <div
              className="flex-shrink-0 cursor-row-resize relative group"
              style={{ height: 5, background: 'var(--color-border)', touchAction: 'none' }}
              onPointerDown={handleTerminalResize}
              role="separator"
              aria-label="Resize terminal"
              aria-orientation="horizontal"
            >
              <div
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full transition-all group-hover:h-1 group-active:h-1"
                style={{ background: 'transparent' }}
              />
            </div>
          )}

          {/* ── Terminal Panel ── */}
          <div
            style={{
              height: terminalOpen ? terminalHeight : 38,
              flexShrink: 0,
              transition: 'height 220ms cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
            }}
          >
            <TerminalPanel onNavigateToLine={handleNavigateToLine} />
          </div>
        </div>

        {/* ── Comments Sidebar ── */}
        {showComments && (
          <aside className="flex-shrink-0 border-l overflow-hidden" style={{ width: 320, borderColor: 'var(--color-border)' }}>
            <CommentsPanel projectId={projectId!} onClose={() => setShowComments(false)} />
          </aside>
        )}

        {/* ── History Sidebar ── */}
        {showHistory && (
          <aside className="flex-shrink-0 border-l overflow-hidden" style={{ width: 320, borderColor: 'var(--color-border)' }}>
            <HistoryPanel onClose={() => setShowHistory(false)} />
          </aside>
        )}
      </div>

      {/* ── Overlays ── */}
      {showSearch && <SearchPanel onClose={() => setShowSearch(false)} onNavigateToFile={() => {}} />}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onCompile={handleCompile}
          onSave={handleSave}
          onToggleShare={() => setShowShare(true)}
          onToggleHistory={() => setShowHistory(true)}
          onNewFile={handleNewFile}
          onNewFolder={handleNewFolder}
          onDownloadPdf={handleDownloadPdf}
          onDownloadProject={handleDownloadProject}
          onOpenTheme={() => setShowThemeSelector(true)}
        />
      )}
      {showEquation && <EquationEditor onInsert={handleInsertLatex} onClose={() => setShowEquation(false)} />}
      {showTable && <TableBuilder onInsert={handleInsertLatex} onClose={() => setShowTable(false)} />}
      {showBib && <BibliographyManager onInsert={(key) => handleInsertLatex(`\\cite{${key}}`)} onClose={() => setShowBib(false)} />}
      {showImage && <ImageUploader onInsert={handleInsertLatex} onClose={() => setShowImage(false)} />}
      {showLink && <LinkDialog onInsert={handleInsertLatex} onClose={() => setShowLink(false)} />}
      {showShare && <ShareDialog onClose={() => setShowShare(false)} />}
      {showThemeSelector && <ThemeSelector onClose={() => setShowThemeSelector(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => {}} />}
    </div>
  );
}
