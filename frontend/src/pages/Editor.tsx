import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProject, fetchFiles, setCurrentFile, clearCurrentProject, updateFileInTree } from '../store/projectSlice';
import { setContent, compileProject, togglePdf, setSplitRatio } from '../store/editorSlice';
import { setSidebarOpen } from '../store/uiSlice';
import EditorHeader from '../components/EditorHeader';
import FileTree from '../components/FileTree';
import CodeEditor from '../components/CodeEditor';
import PDFViewer from '../components/PDFViewer';
import TerminalPanel from '../components/TerminalPanel';
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';

export default function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentProject, files, currentFile } = useAppSelector(state => state.project);
  const { compiling, pdfVisible, splitRatio, content } = useAppSelector(state => state.editor);
  const { sidebarOpen } = useAppSelector(state => state.ui);

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
    socket.on('file:updated', (data: { fileId: string; content: string }) => {
      dispatch(updateFileInTree(data));
    });
    socket.on('user:cursor', (_data: any) => {});
    return () => { socket.off('file:updated'); socket.off('user:cursor'); };
  }, [socket, dispatch]);

  const handleCompile = useCallback(async () => {
    if (!projectId || compiling) return;
    try {
      await dispatch(compileProject(projectId)).unwrap();
      toast.success('Compilation successful');
    } catch {
      toast.error('Compilation failed');
    }
  }, [projectId, compiling, dispatch]);

  const handleContentChange = useCallback((newContent: string) => {
    dispatch(setContent(newContent));
    if (socket && currentFile) {
      socket.emit('file:edit', { fileId: currentFile.id, content: newContent });
    }
  }, [dispatch, socket, currentFile]);

  const handleSave = useCallback(async () => {
    if (!currentFile) return;
    try {
      const { updateFileContent } = await import('../store/projectSlice');
      await dispatch(updateFileContent({ fileId: currentFile.id, content })).unwrap();
      toast.success('Saved');
    } catch {
      toast.error('Failed to save');
    }
  }, [currentFile, dispatch, content]);

  if (!currentProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-texflow-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      <EditorHeader project={currentProject} onCompile={handleCompile} onBack={() => navigate('/')} />
      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <aside className="flex-shrink-0 border-r border-texflow-800 overflow-hidden" style={{ width: 280 }}>
            <FileTree files={files} projectId={projectId!} />
          </aside>
        )}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex flex-col border-r border-texflow-800" style={{ width: pdfVisible ? `${splitRatio}%` : '100%' }}>
            <CodeEditor content={content} onChange={handleContentChange} onSave={handleSave} file={currentFile} />
          </div>
          {pdfVisible && (
            <div className="flex flex-col" style={{ width: `${100 - splitRatio}%` }}>
              <PDFViewer projectId={projectId!} />
            </div>
          )}
        </div>
      </div>
      <TerminalPanel />
    </div>
  );
}
