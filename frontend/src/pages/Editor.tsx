import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchProject, fetchFiles, setCurrentFile, clearCurrentProject,
  updateFileInTree, updateFileContent, createFile,
} from '../store/projectSlice';
import {
  setContent, compileProject, cleanBuild, openTab,
  closeTab,
  setSaving, markTabSaved,
  saveFile, setAutoCompile, initCompileSettings,
  stopCompilation,
} from '../store/editorSlice';
import { initLayout, toggleSidebar, togglePdf, toggleTerminal, setFilesWidth, setFilesWidthTransient, setFilesSidebarResizing, setPdfWidth, setPdfWidthTransient, setTerminalHeight } from '../store/uiSlice';
import { COLLAPSED_RAIL_WIDTH } from '../store/uiSlice';
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
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  ChevronRight, ChevronLeft, FileText, FolderPlus, Search,
  FolderTree, MessageSquare, History, Settings, HelpCircle,
} from 'lucide-react';

const AUTO_COMPILE_DELAY = 1000;
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
  const [isPdfResizing, setIsPdfResizing] = useState(false);

  const socket = useSocket(projectId);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const contentRef = useRef(content);
  const currentFileRef = useRef(currentFile);
  const insertSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const autoCompileRef = useRef(compileSettings.autoCompile);
  const projectIdRef = useRef(projectId);
  const filesResizeRef = useRef<HTMLDivElement>(null);
  const filesWidthRef = useRef(filesWidth);
  const terminalResizeRef = useRef<HTMLDivElement>(null);
  const pdfResizeRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const doSaveRef = useRef<() => void>(() => undefined);
  const handleCompileRef = useRef<() => void>(() => undefined);

  contentRef.current = content;
  currentFileRef.current = currentFile;
  autoCompileRef.current = compileSettings.autoCompile;
  projectIdRef.current = projectId;
  filesWidthRef.current = filesWidth;

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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !(e.target as HTMLElement).closest('.cm-editor')) { e.preventDefault(); dispatch(togglePdf()); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') { e.preventDefault(); dispatch(toggleSidebar()); }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); dispatch(toggleTerminal()); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); window.dispatchEvent(new CustomEvent('texflow:start-file-creation', { detail: 'file' })); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') { e.preventDefault(); if (activeTabId) dispatch(closeTab(activeTabId)); }
      if (e.key === 'F11') { e.preventDefault(); if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, dispatch]);

  const doSave = useCallback(async (): Promise<boolean> => {
    const file = currentFileRef.current;
    const currentContent = contentRef.current;
    if (!file || isSavingRef.current) return false;
    if (currentContent === lastSavedContentRef.current) return true;
    isSavingRef.current = true;
    dispatch(setSaving(true));
    try {
      await dispatch(saveFile({ fileId: file.id, content: currentContent })).unwrap();
      lastSavedContentRef.current = currentContent;
      dispatch(markTabSaved(file.id));
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save changes');
      return false;
    } finally {
      isSavingRef.current = false;
    }
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
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      doSave().then(saved => {
        if (saved && autoCompileRef.current) {
          compileTimerRef.current = setTimeout(() => { doCompile(); }, SAVE_COMPILE_DELAY);
        }
      });
    }, AUTO_COMPILE_DELAY);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    };
  }, [content, currentFile?.id, doSave, doCompile]);

  const handleContentChange = useCallback((newContent: string) => {
    dispatch(setContent(newContent));
    if (socket && currentFile && projectId) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      socket.emit('file-update', { projectId, fileId: currentFile.id, content: newContent, userId: user.id });
    }
  }, [dispatch, socket, currentFile, projectId]);

  const handleCompile = useCallback(async () => {
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
      const res = await fetch(`/api/files/project/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
    if (!currentFile) return;
    const selection = insertSelectionRef.current;
    const from = selection ? Math.min(selection.from, content.length) : content.length;
    const to = selection ? Math.min(selection.to, content.length) : content.length;
    const prefix = from > 0 && content[from - 1] !== '\n' ? '\n' : '';
    const newContent = `${content.slice(0, from)}${prefix}${latex}${content.slice(to)}`;
    dispatch(setContent(newContent));
    if (currentFile) dispatch(updateFileContent({ fileId: currentFile.id, content: newContent }));
    insertSelectionRef.current = null;
  }, [currentFile, content, dispatch]);

  const handleNewFile = useCallback(async () => {
    window.dispatchEvent(new CustomEvent('texflow:start-file-creation', { detail: 'file' }));
  }, []);

  const handleNewFolder = useCallback(async () => {
    window.dispatchEvent(new CustomEvent('texflow:start-file-creation', { detail: 'folder' }));
  }, []);

  const handleNavigateToLine = useCallback((_line: number) => {}, []);

  const handleFilesResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startWidth = filesWidth;
    dispatch(setFilesSidebarResizing(true));
    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      const nextWidth = Math.max(180, Math.min(420, startWidth + delta));
      filesWidthRef.current = nextWidth;
      dispatch(setFilesWidthTransient(nextWidth));
    };
    const finish = (cancelled = false) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKeyDown);
      dispatch(setFilesSidebarResizing(false));
      if (cancelled) dispatch(setFilesWidth(startWidth));
      else dispatch(setFilesWidth(filesWidthRef.current));
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    const onUp = () => finish();
    const onCancel = () => finish(true);
    const onKeyDown = (ev: KeyboardEvent) => { if (ev.key === 'Escape') { ev.preventDefault(); finish(true); } };
    filesWidthRef.current = startWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKeyDown);
  }, [filesWidth, dispatch]);

  const handleTerminalResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalHeight;
    const onMove = (ev: PointerEvent) => {
      const delta = startY - ev.clientY;
      dispatch(setTerminalHeight(startHeight + delta));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  }, [terminalHeight, dispatch]);

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
    const minPanelPercent = Math.min(50, (300 / workspaceBounds.width) * 100);
    const maxPdfPercent = Math.max(minPanelPercent, 100 - minPanelPercent);
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
      setIsPdfResizing(false);
      dispatch(setPdfWidth(cancelled ? startPdfWidth : currentPdfWidth));
    };
    const onUp = () => finish();
    const onCancel = () => finish(true);
    const onKeyDown = (ev: KeyboardEvent) => { if (ev.key === 'Escape') { ev.preventDefault(); onCancel(); } };
    setIsPdfResizing(true);
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

      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {/* Icon Rail - always visible */}
        <div className="flex-shrink-0 flex flex-col items-center py-2 gap-1 border-r" style={{ width: 40, background: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded transition-colors"
            style={{
              background: filesOpen ? 'var(--color-accent)' : 'transparent',
              color: filesOpen ? '#fff' : 'var(--color-text-muted)',
            }}
            title="TexFlow files"
            aria-label="Toggle TexFlow files"
          >
            <FolderTree size={16} />
          </button>
          <button
            onClick={() => setShowSearch(p => !p)}
            className="p-2 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
            style={{ color: 'var(--color-text-muted)' }}
            title="Search (Ctrl+Shift+F)"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => setShowComments(p => !p)}
            className="p-2 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
            style={{ color: showComments ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            title="Comments"
            aria-label="Comments"
          >
            <MessageSquare size={16} />
          </button>
          <button
            onClick={() => setShowHistory(p => !p)}
            className="p-2 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
            style={{ color: showHistory ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            title="History"
            aria-label="History"
          >
            <History size={16} />
          </button>
          <div className="flex-1" />
          <button
            className="p-2 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
            style={{ color: 'var(--color-text-muted)' }}
            title="Help"
            aria-label="Help"
          >
            <HelpCircle size={16} />
          </button>
          <button
            className="p-2 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
            style={{ color: 'var(--color-text-muted)' }}
            title="Settings"
            aria-label="Settings"
            onClick={() => navigate('/settings')}
          >
            <Settings size={16} />
          </button>
        </div>

        {/* File Tree Panel */}
        <div
          className="flex-shrink-0 border-r overflow-visible relative"
          style={{
            width: filesOpen ? filesWidth : 0,
            background: 'var(--color-background)',
            borderRight: '1px solid rgba(0,0,0,0.3)',
            transition: isResizingFilesSidebar ? 'none' : 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="h-full flex flex-col relative overflow-hidden" style={{ width: filesOpen ? filesWidth : 0 }}>
            <FileTree files={files} projectId={projectId!} />
            {filesOpen && <div
              ref={filesResizeRef}
              className="absolute top-0 -right-1 w-2 h-full cursor-col-resize z-10"
              role="separator"
              tabIndex={0}
              aria-label="Resize Files sidebar"
              aria-orientation="vertical"
              onKeyDown={e => {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                e.preventDefault();
                const amount = e.shiftKey ? 50 : 10;
                dispatch(setFilesWidth(filesWidth + (e.key === 'ArrowRight' ? amount : -amount)));
              }}
              style={{ background: isResizingFilesSidebar ? 'var(--color-accent)' : 'transparent' }}
              onPointerDown={handleFilesResize}
              onMouseEnter={e => { if (!isResizingFilesSidebar) e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
              onMouseLeave={e => { if (!isResizingFilesSidebar) e.currentTarget.style.background = 'transparent'; }}
            />}
          </div>
        </div>

        <div ref={workspaceRef} className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

            {/* PDF Divider with arrows */}
            {pdfOpen && (
              <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1" style={{ width: 12, background: 'var(--color-background)', borderLeft: '1px solid rgba(0,0,0,0.3)', borderRight: '1px solid rgba(0,0,0,0.3)' }}>
                <button
                  onClick={() => dispatch(togglePdf())}
                  className="p-0.5 rounded transition-colors hover:bg-[var(--color-accent-soft)]"
                  style={{ color: 'var(--color-text-muted)' }}
                  title="Collapse PDF"
                  aria-label="Collapse PDF"
                >
                  <ChevronRight size={12} />
                </button>
                <div
                  ref={pdfResizeRef}
                  className="flex-1 w-full cursor-col-resize"
                  role="separator"
                  tabIndex={0}
                  aria-label="Resize code and PDF panels"
                  aria-orientation="vertical"
                  aria-valuemin={25}
                  aria-valuemax={75}
                  aria-valuenow={Math.round(100 - pdfWidth)}
                  style={{ background: isPdfResizing ? 'var(--color-accent)' : 'transparent' }}
                  onPointerDown={handlePdfResize}
                  onKeyDown={e => {
                    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                    e.preventDefault();
                    const workspace = workspaceRef.current;
                    const amountPx = e.shiftKey ? 50 : 10;
                    const amount = workspace ? (amountPx / workspace.getBoundingClientRect().width) * 100 : 2;
                    dispatch(setPdfWidth(pdfWidth + (e.key === 'ArrowLeft' ? amount : -amount)));
                  }}
                  onMouseEnter={e => { if (!isPdfResizing) e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
                  onMouseLeave={e => { if (!isPdfResizing) e.currentTarget.style.background = 'transparent'; }}
                />
                <button
                  onClick={() => dispatch(togglePdf())}
                  className="p-0.5 rounded transition-colors hover:bg-[var(--color-accent-soft)]"
                  style={{ color: 'var(--color-text-muted)' }}
                  title="Expand PDF"
                  aria-label="Expand PDF"
                >
                  <ChevronLeft size={12} />
                </button>
              </div>
            )}

            {/* PDF not open - show expand button */}
            {!pdfOpen && (
              <div className="flex-shrink-0 flex flex-col items-center justify-center" style={{ width: 24, background: 'var(--color-background)', borderLeft: '1px solid rgba(0,0,0,0.3)' }}>
                <button
                  onClick={() => dispatch(togglePdf())}
                  className="p-1 rounded transition-colors hover:bg-[var(--color-accent-soft)]"
                  style={{ color: 'var(--color-accent)' }}
                  title="Show PDF"
                  aria-label="Show PDF"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
            )}

            {pdfOpen && (
              <div className="flex flex-col min-w-0 overflow-hidden" style={{ width: `${pdfWidth}%`, minWidth: '300px' }}>
                <PDFViewer projectId={projectId!} />
              </div>
            )}
          </div>

          {terminalOpen && (
            <div
              ref={terminalResizeRef}
              className="terminal-resize-handle flex-shrink-0"
              onPointerDown={handleTerminalResize}
            />
          )}

          <div
            style={{
              height: terminalOpen ? terminalHeight : 36,
              flexShrink: 0,
              transition: 'height 220ms cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
            }}
          >
            <TerminalPanel onNavigateToLine={handleNavigateToLine} />
          </div>
        </div>

        {showComments && (
          <aside className="flex-shrink-0 border-l" style={{ width: 320, borderColor: 'rgba(0,0,0,0.3)' }}>
            <CommentsPanel projectId={projectId!} onClose={() => setShowComments(false)} />
          </aside>
        )}

        {showHistory && (
          <aside className="flex-shrink-0 border-l" style={{ width: 320, borderColor: 'rgba(0,0,0,0.3)' }}>
            <HistoryPanel onClose={() => setShowHistory(false)} />
          </aside>
        )}
      </div>

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
    </div>
  );
}
