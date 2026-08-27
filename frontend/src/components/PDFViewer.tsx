import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { compileProject } from '../store/editorSlice';
import toast from 'react-hot-toast';

interface PDFViewerProps {
  projectId: string;
}

export default function PDFViewer({ projectId }: PDFViewerProps) {
  const dispatch = useAppDispatch();
  const { compiling, compileResult } = useAppSelector(state => state.editor);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (compileResult?.pdfUrl) {
      setPdfUrl(compileResult.pdfUrl);
    }
  }, [compileResult]);

  const handleRefresh = useCallback(async () => {
    try {
      await dispatch(compileProject(projectId)).unwrap();
      toast.success('PDF updated');
    } catch {
      toast.error('Compilation failed');
    }
  }, [dispatch, projectId]);

  const handleDownload = useCallback(() => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'document.pdf';
      link.click();
    }
  }, [pdfUrl]);

  return (
    <div className="h-full flex flex-col bg-dark-900">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-texflow-800" style={{ background: 'rgba(3,6,55,0.5)' }}>
        <span className="text-xs font-medium text-slate-400">PDF Preview</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(p => Math.max(p - 10, 50))} className="p-1 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors" title="Zoom out">
            <ZoomOut size={14} />
          </button>
          <span className="text-xs text-slate-400 min-w-[40px] text-center">{zoom}%</span>
          <button onClick={() => setZoom(p => Math.min(p + 10, 200))} className="p-1 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors" title="Zoom in">
            <ZoomIn size={14} />
          </button>
          <button onClick={() => setZoom(100)} className="p-1 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors" title="Fit width">
            <Maximize2 size={14} />
          </button>
          <div className="w-px h-4 bg-texflow-800 mx-1" />
          <button onClick={handleRefresh} disabled={compiling} className="p-1 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors disabled:opacity-50" title="Recompile">
            {compiling ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
          <button onClick={handleDownload} disabled={!pdfUrl} className="p-1 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors disabled:opacity-50" title="Download PDF">
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center p-4" style={{ background: '#0a0c3d' }}>
        {compiling ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin text-texflow-400 mb-3" />
            <p className="text-sm text-slate-400">Compiling LaTeX...</p>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="pdf-frame"
            style={{ width: `${zoom}%`, height: '100%', minHeight: '600px', border: 'none' }}
            title="PDF Preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(114,4,85,0.2), rgba(145,10,103,0.2))' }}>
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No PDF generated</h3>
            <p className="text-sm text-slate-500 mb-4">Click "Compile" to generate a PDF preview</p>
            <button onClick={handleRefresh} className="btn-primary text-sm">Compile Now</button>
          </div>
        )}
      </div>

      {compileResult?.errors && compileResult.errors.length > 0 && (
        <div className="border-t border-texflow-800 px-3 py-2 max-h-32 overflow-auto" style={{ background: 'rgba(220,38,38,0.1)' }}>
          <p className="text-xs font-medium text-red-400 mb-1">Compilation Errors:</p>
          {compileResult.errors.map((error, i) => (
            <p key={i} className="text-xs text-red-300">
              {error.file && `${error.file}:`} Line {error.line}: {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
