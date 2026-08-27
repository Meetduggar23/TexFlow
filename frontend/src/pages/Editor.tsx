import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProject, fetchFiles, setCurrentFile, clearCurrentProject, updateFileInTree, updateFileContent, createFile } from '../store/projectSlice';
import { setContent, compileProject, togglePdf, setSplitRatio } from '../store/editorSlice';
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
  const { compiling, pdfVisible, splitRatio, content } = useAppSelector(state => state.editor);
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
    }
  }, [currentFile, dispatch]);

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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, content, projectId, compiling]);

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
  }, [dispatch, socket, currentFile, projectId]);

  const handleSave = useCallback(async () => {
    if (!currentFile) return;
    try {
      await dispatch(updateFileContent({ fileId: currentFile.id, content })).unwrap();
      toast.success('Saved');
    } catch { toast.error('Failed to save'); }
  }, [currentFile, dispatch, content]);

  const handleDownloadPdf = useCallback(async () => {
    try {
      await dispatch(compileProject(projectId!)).unwrap();
      const link = document.createElement('a');
      link.href = `/api/compile/${projectId}/pdf`;
      link.download = 'document.pdf';
      link.click();
    } catch { toast.error('Failed'); }
  }, [projectId, dispatch]);

  const handleDownloadProject = useCallback(async () => {
    if (!currentProject) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/files/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const zip = new JSZip();
      for (const file of (data.files || [])) {
        zip.file(file.name, file.content || '');
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
      await dispatch(createFile({ projectId, name, parentId: null, type: 'file' })).unwrap();
      toast.success('File created');
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

  const handleSplitPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const workspace = workspaceRef.current;
      if (!workspace) return;
      const bounds = workspace.getBoundingClientRect();
      const ratio = ((moveEvent.clientX - bounds.left) / bounds.width) * 100;
      dispatch(setSplitRatio(Math.min(75, Math.max(25, ratio))));
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  }, [dispatch]);

  if (!currentProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-texflow-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      <EditorHeader
        project={currentProject}
        onCompile={handleCompile}
        onBack={() => navigate('/dashboard')}
        onToggleComments={() => setShowComments(p => !p)}
        onToggleHistory={() => setShowHistory(p => !p)}
        onToggleShare={() => setShowShare(p => !p)}
      />

      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <aside className="flex-shrink-0 border-r border-texflow-800 overflow-hidden" style={{ width: 280 }}>
            <FileTree files={files} projectId={projectId!} />
          </aside>
        )}

        <div ref={workspaceRef} className="flex-1 flex overflow-hidden editor-workspace">
          <div className="flex flex-col border-r border-texflow-800" style={{ width: pdfVisible ? `${splitRatio}%` : '100%' }}>
            <CodeEditor content={content} onChange={handleContentChange} onSave={handleSave} file={currentFile} />
          </div>
          {pdfVisible && (
            <div className="editor-split-handle" role="separator" aria-label="Resize editor and PDF panels" aria-orientation="vertical" onPointerDown={handleSplitPointerDown} />
          )}
          {pdfVisible && (
            <div className="flex flex-col min-w-0" style={{ width: `calc(${100 - splitRatio}% - 6px)` }}>
              <PDFViewer projectId={projectId!} />
            </div>
          )}
        </div>

        {showComments && (
          <aside className="flex-shrink-0 border-l border-texflow-800" style={{ width: 320 }}>
            <CommentsPanel projectId={projectId!} onClose={() => setShowComments(false)} />
          </aside>
        )}

        {showHistory && (
          <aside className="flex-shrink-0 border-l border-texflow-800" style={{ width: 320 }}>
            <HistoryPanel onClose={() => setShowHistory(false)} />
          </aside>
        )}
      </div>

      <TerminalPanel />

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
