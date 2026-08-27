import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, ZoomIn, ZoomOut, Maximize2, Loader2, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { compileProject } from '../store/editorSlice';
import toast from 'react-hot-toast';

interface PDFViewerProps {
  projectId: string;
}

export default function PDFViewer({ projectId }: PDFViewerProps) {
  const dispatch = useAppDispatch();
  const { compiling, compileResult, sourceRevision, compiledRevision, lastCompiledAt, lastValidPdfUrl } = useAppSelector(state => state.editor);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  const isStale = sourceRevision > compiledRevision && !compiling;

  useEffect(() => {
    if (compileResult?.pdfUrl) {
      setPreviewUrl(`${compileResult.pdfUrl}?v=${Date.now()}`);
    }
  }, [compileResult]);

  useEffect(() => {
    if (lastValidPdfUrl && !previewUrl) {
      setPreviewUrl(`${lastValidPdfUrl}?v=${Date.now()}`);
    }
  }, [lastValidPdfUrl]);

  const handleRefresh = useCallback(async () => {
    try {
      await dispatch(compileProject(projectId)).unwrap();
    } catch {
      toast.error('Compilation failed');
    }
  }, [dispatch, projectId]);

  const handleDownload = useCallback(() => {
    const url = compileResult?.pdfUrl || lastValidPdfUrl;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.pdf';
      link.click();
    }
  }, [compileResult, lastValidPdfUrl]);

  const formatTimeSince = (timestamp: number | null) => {
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'just now';
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
          {compiling && (
            <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--color-accent)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-accent)' }} />
              Compiling...
            </span>
          )}
          {!compiling && isStale && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
              Changes not compiled
            </span>
          )}
          {!compiling && !isStale && compileResult?.success && lastCompiledAt && (
            <span className="text-[10px]" style={{ color: 'var(--color-success)' }}>
              ✓ Compiled {formatTimeSince(lastCompiledAt)}
            </span>
          )}
          {!compiling && compileResult && !compileResult.success && (
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-error)' }}>
              ✕ Compilation failed
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
          <button onClick={handleDownload} disabled={!previewUrl} className="p-1 rounded transition-colors hover:bg-[var(--color-surface-secondary)] disabled:opacity-50" style={{ color: 'var(--color-text-muted)' }} title="Download PDF">
            <Download size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center p-4" style={{ background: 'var(--color-surface)' }}>
        {previewUrl ? (
          <div className="relative w-full h-full flex justify-center">
            <iframe
              src={previewUrl}
              className="pdf-frame"
              style={{ width: `${zoom}%`, maxWidth: '100%', height: '100%', minHeight: '600px', border: 'none' }}
              title="PDF Preview"
            />
            {compiling && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                <Loader2 size={10} className="animate-spin" />
                Updating...
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
              <FileText size={28} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>No PDF generated</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Start typing to auto-compile, or press Ctrl+Enter</p>
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
