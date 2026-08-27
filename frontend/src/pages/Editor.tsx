import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchProject, fetchFiles, setCurrentFile, clearCurrentProject,
  updateFileInTree, updateFileContent, createFile,
} from '../store/projectSlice';
import {
  setContent, compileProject, togglePdf, setSplitRatio, openTab,
  setSaving, markTabSaved, setTerminalOpen, setTerminalHeight,
} from '../store/editorSlice';
import { setSidebarOpen } from '../store/uiSlice';
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
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentProject, files, currentFile } = useAppSelector(state => state.project);
  const { content, compiling, pdfVisible, splitRatio, openTabs, activeTabId, saving } = useAppSelector(state => state.editor);
  const { sidebarOpen } = useAppSelector(state => state.ui);

  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showEquation, setShowEquation] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showBib, setShowBib] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const editorPanelRef = useRef<HTMLDivElement>(null);
  const pdfPanelRef = useRef<HTMLDivElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editorWidth, setEditorWidth] = useState<number | null>(null);
  const [pdfWidth, setPdfWidth] = useState<number | null>(null);

  const socket = useSocket(projectId);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
      dispatch(fetchFiles(projectId));
    }
    return () => { dispatch(clearCurrentProject()); };
  }, [projectId, dispatch]);

  useEffect(() => {
    if (currentFile?.content !== undefined) {
      dispatch(setContent(currentFile.content));
      dispatch(openTab({ fileId: currentFile.id, name: currentFile.name, content: currentFile.content }));
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
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') { e.preventDefault(); setShowSearch(p => !p); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleCompile(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); dispatch(togglePdf()); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, content, projectId, compiling, dispatch]);

  const handleCompile = useCallback(async () => {
    if (!projectId || compiling) return;
    try {
      await dispatch(compileProject(projectId)).unwrap();
      toast.success('Compiled successfully');
    } catch { toast.error('Compilation failed'); }
  }, [projectId, compiling, dispatch]);

  const handleContentChange = useCallback((newContent: string) => {
    dispatch(setContent(newContent));
    if (socket && currentFile && projectId) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      socket.emit('file-update', { projectId, fileId: currentFile.id, content: newContent, userId: user.id });
    }
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 2000);
  }, [dispatch, socket, currentFile, projectId]);

  const handleSave = useCallback(async () => {
    if (!currentFile) return;
    dispatch(setSaving(true));
    try {
      await dispatch(updateFileContent({ fileId: currentFile.id, content })).unwrap();
      dispatch(markTabSaved(currentFile.id));
    } catch {
      // silent
    } finally {
      dispatch(setSaving(false));
    }
  }, [currentFile, dispatch, content]);

  const handleDownloadPdf = useCallback(async () => {
    if (!projectId) return;
    try {
      await dispatch(compileProject(projectId)).unwrap();
      const link = document.createElement('a');
      link.href = `/api/compile/${projectId}/pdf`;
      link.download = 'document.pdf';
      link.click();
    } catch { toast.error('Failed'); }
  }, [projectId, dispatch]);

  const handleDownloadProject = useCallback(async () => {
    if (!currentProject || !projectId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/files/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const zip = new JSZip();
      for (const file of (data.files || [])) {
        const path = file.path || file.name;
        zip.file(path, file.content || '');
      }
      for (const folder of (data.folders || [])) {
        const path = folder.path || folder.name;
        zip.folder(path);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${currentProject.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`);
      toast.success('Project downloaded');
    } catch { toast.error('Failed to download'); }
  }, [currentProject, projectId]);

  const handleInsertLatex = useCallback((latex: string) => {
    if (!currentFile) return;
    const newContent = content + '\n' + latex;
    dispatch(setContent(newContent));
    if (currentFile) {
      dispatch(updateFileContent({ fileId: currentFile.id, content: newContent }));
    }
  }, [currentFile, content, dispatch]);

  const handleNewFile = useCallback(async () => {
    const name = prompt('Enter file name:');
    if (!name || !projectId) return;
    try {
      const result = await dispatch(createFile({ projectId, name, parentId: null, type: 'file' })).unwrap();
      toast.success('File created');
      if (result) dispatch(setCurrentFile(result));
    } catch { toast.error('Failed to create file'); }
  }, [dispatch, projectId]);

  const handleNewFolder = useCallback(async () => {
    const name = prompt('Enter folder name:');
    if (!name || !projectId) return;
    try {
      await dispatch(createFile({ projectId, name, parentId: null, type: 'folder' })).unwrap();
      toast.success('Folder created');
    } catch { toast.error('Failed to create folder'); }
  }, [dispatch, projectId]);

  const handleNavigateToLine = useCallback((line: number) => {
    toast.success(`Navigate to line ${line}`);
  }, []);

  const handleSplitPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const bounds = workspace.getBoundingClientRect();

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const offset = moveEvent.clientX - bounds.left;
      const width = bounds.width;
      const ratio = (offset / width) * 100;
      const clamped = Math.min(75, Math.max(25, ratio));
      dispatch(setSplitRatio(clamped));
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  }, [dispatch]);

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

      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <aside className="flex-shrink-0 border-r border-[var(--color-border)] overflow-hidden" style={{ width: 260, background: 'var(--color-background)' }}>
            <FileTree files={files} projectId={projectId!} />
          </aside>
        )}

        <div ref={workspaceRef} className="flex-1 flex overflow-hidden">
          <div ref={editorPanelRef} className="flex flex-col min-w-0 overflow-hidden" style={{ width: pdfVisible ? `${splitRatio}%` : '100%' }}>
            <CodeEditor content={content} onChange={handleContentChange} onSave={handleSave} file={currentFile} allFiles={files} />
          </div>

          {pdfVisible && (
            <div
              className="editor-split-handle"
              role="separator"
              aria-label="Resize editor and PDF panels"
              aria-orientation="vertical"
              onPointerDown={handleSplitPointerDown}
            />
          )}

          {pdfVisible && (
            <div ref={pdfPanelRef} className="flex flex-col min-w-0 overflow-hidden" style={{ width: `calc(${100 - splitRatio}% - 6px)` }}>
              <PDFViewer projectId={projectId!} />
            </div>
          )}
        </div>

        {showComments && (
          <aside className="flex-shrink-0 border-l border-[var(--color-border)]" style={{ width: 320 }}>
            <CommentsPanel projectId={projectId!} onClose={() => setShowComments(false)} />
          </aside>
        )}

        {showHistory && (
          <aside className="flex-shrink-0 border-l border-[var(--color-border)]" style={{ width: 320 }}>
            <HistoryPanel onClose={() => setShowHistory(false)} />
          </aside>
        )}
      </div>

      <TerminalPanel onNavigateToLine={handleNavigateToLine} />

      {showSearch && <SearchPanel onClose={() => setShowSearch(false)} onNavigateToFile={(fileId) => {}} />}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onCompile={handleCompile}
          onSave={handleSave}
          onTogglePdf={() => dispatch(togglePdf())}
          onToggleShare={() => setShowShare(true)}
          onToggleHistory={() => setShowHistory(true)}
          onNewFile={handleNewFile}
          onNewFolder={handleNewFolder}
          onDownloadPdf={handleDownloadPdf}
          onDownloadProject={handleDownloadProject}
        />
      )}
      {showEquation && <EquationEditor onInsert={handleInsertLatex} onClose={() => setShowEquation(false)} />}
      {showTable && <TableBuilder onInsert={handleInsertLatex} onClose={() => setShowTable(false)} />}
      {showBib && <BibliographyManager onInsert={(key) => handleInsertLatex(`\\cite{${key}}`)} onClose={() => setShowBib(false)} />}
      {showImage && <ImageUploader onInsert={handleInsertLatex} onClose={() => setShowImage(false)} />}
      {showShare && <ShareDialog onClose={() => setShowShare(false)} />}
    </div>
  );
}
