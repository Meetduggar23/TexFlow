import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Download, ZoomIn, ZoomOut, Maximize2, Minimize2, Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { compileProject } from '../store/editorSlice';
import toast from 'react-hot-toast';

interface PDFViewerProps {
  projectId: string;
}

export default function PDFViewer({ projectId }: PDFViewerProps) {
  const dispatch = useAppDispatch();
  const { compiling, compileResult, sourceRevision, compiledRevision, lastCompiledAt } = useAppSelector(state => state.editor);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isStale = sourceRevision > compiledRevision && !compiling;

  useEffect(() => {
    if (compileResult?.pdfUrl) {
      const nextPdfUrl = compileResult.pdfUrl;
      const separator = nextPdfUrl.includes('?') ? '&' : '?';
      setPdfUrl(nextPdfUrl);
      setPreviewUrl(`${nextPdfUrl}${separator}v=${Date.now()}`);
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

  const handleCompileAndDownload = useCallback(async () => {
    try {
      await dispatch(compileProject(projectId)).unwrap();
      setTimeout(() => {
        if (pdfUrl) {
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = 'document.pdf';
          link.click();
        }
      }, 500);
      toast.success('Compiled and downloading');
    } catch {
      toast.error('Compilation failed');
    }
  }, [dispatch, projectId, pdfUrl]);

  const formatTimeSince = (timestamp: number | null) => {
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--color-border)]" style={{ background: 'var(--color-surface)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>PDF Preview</span>
          {isStale && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
              Changes not compiled
            </span>
          )}
          {lastCompiledAt && !isStale && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-disabled)' }}>
              Compiled {formatTimeSince(lastCompiledAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setZoom(p => Math.max(p - 10, 50))} className="p-1 rounded transition-colors hover:bg-[var(--color-surface-secondary)]" style={{ color: 'var(--color-text-muted)' }} title="Zoom out">
            <ZoomOut size={13} />
          </button>
          <span className="text-[11px] min-w-[36px] text-center font-medium" style={{ color: 'var(--color-text-secondary)' }}>{zoom}%</span>
          <button onClick={() => setZoom(p => Math.min(p + 10, 200))} className="p-1 rounded transition-colors hover:bg-[var(--color-surface-secondary)]" style={{ color: 'var(--color-text-muted)' }} title="Zoom in">
            <ZoomIn size={13} />
          </button>
          <button onClick={() => setZoom(100)} className="p-1 rounded transition-colors hover:bg-[var(--color-surface-secondary)]" style={{ color: 'var(--color-text-muted)' }} title="Fit to 100%">
            <Maximize2 size={13} />
          </button>
          <div className="w-px h-4 mx-1" style={{ background: 'var(--color-border)' }} />
          <button onClick={handleRefresh} disabled={compiling} className="p-1 rounded transition-colors hover:bg-[var(--color-surface-secondary)] disabled:opacity-50" style={{ color: 'var(--color-text-muted)' }} title="Recompile">
            {compiling ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          </button>
          <button onClick={handleDownload} disabled={!pdfUrl} className="p-1 rounded transition-colors hover:bg-[var(--color-surface-secondary)] disabled:opacity-50" style={{ color: 'var(--color-text-muted)' }} title="Download PDF">
            <Download size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center p-4" style={{ background: 'var(--color-background)' }}>
        {compiling ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin mb-3" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Compiling LaTeX...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative w-full h-full flex justify-center">
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="pdf-frame"
              style={{ width: `${zoom}%`, maxWidth: '100%', height: '100%', minHeight: '600px', border: 'none' }}
              title="PDF Preview"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
              <FileText size={28} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>No PDF generated</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Compile your project to generate a PDF preview</p>
            <button onClick={handleRefresh} className="btn-primary text-sm">
              Compile Now
            </button>
          </div>
        )}
      </div>

      {compileResult?.errors && compileResult.errors.length > 0 && (
        <div className="border-t border-[var(--color-border)] px-3 py-2 max-h-28 overflow-auto" style={{ background: 'rgba(220,38,38,0.06)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-error)' }}>Compilation Errors:</p>
          {compileResult.errors.map((error, i) => (
            <p key={i} className="text-xs" style={{ color: 'var(--color-error)' }}>
              {error.file && <span className="font-medium">{error.file}: </span>}
              {error.line > 0 && <span>Line {error.line}: </span>}
              {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
