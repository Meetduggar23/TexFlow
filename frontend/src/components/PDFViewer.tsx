import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, ZoomIn, ZoomOut, Loader2, FileText, Contrast } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { compileProject } from '../store/editorSlice';
import toast from 'react-hot-toast';

interface PDFViewerProps {
  projectId: string;
}

export default function PDFViewer({ projectId }: PDFViewerProps) {
  const dispatch = useAppDispatch();
  const { compiling, compileResult, sourceRevision, compiledRevision, lastValidPdfUrl } = useAppSelector(state => state.editor);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [pdfAppearance, setPdfAppearance] = useState<'normal' | 'inverted'>('normal');

  const isStale = sourceRevision > compiledRevision && !compiling;

  useEffect(() => {
    try {
      setPdfAppearance(localStorage.getItem(`texflow-pdf-appearance-${projectId}`) === 'inverted' ? 'inverted' : 'normal');
    } catch {
      setPdfAppearance('normal');
    }
  }, [projectId]);

  useEffect(() => {
    if (compileResult?.pdfUrl) {
      setPreviewUrl(`${compileResult.pdfUrl}?v=${Date.now()}`);
    }
  }, [compileResult]);

  useEffect(() => {
    if (lastValidPdfUrl && !previewUrl) {
      setPreviewUrl(`${lastValidPdfUrl}?v=${Date.now()}`);
    }
  }, [lastValidPdfUrl, previewUrl]);

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

  const handleTogglePdfAppearance = useCallback(() => {
    setPdfAppearance(current => {
      const next = current === 'normal' ? 'inverted' : 'normal';
      try {
        localStorage.setItem(`texflow-pdf-appearance-${projectId}`, next);
      } catch {
        // Persistence is a convenience; the viewer still works without storage.
      }
      return next;
    });
  }, [projectId]);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleRefresh}
            disabled={compiling}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded transition-all disabled:opacity-50"
            style={{ background: compiling ? 'var(--color-border)' : 'var(--color-accent)' }}
            onMouseEnter={e => { if (!compiling) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
            onMouseLeave={e => { if (!compiling) e.currentTarget.style.background = 'var(--color-accent)'; }}
            title="Recompile"
            aria-label="Recompile PDF"
          >
            {compiling ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            Recompile
          </button>
        </div>

        {isStale && (
          <span className="text-[11px]" style={{ color: 'var(--color-warning)' }}>
            Out of date
          </span>
        )}

        <div className="flex-1" />

        <button
          onClick={handleDownload}
          disabled={!previewUrl}
          className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-elevated)] disabled:opacity-50"
          style={{ color: 'var(--color-text-muted)' }}
          title="Download PDF"
          aria-label="Download PDF"
        >
          <Download size={14} />
        </button>

        <div className="w-px h-4" style={{ background: 'var(--color-border)' }} />

        <button
          onClick={() => setZoom(p => Math.max(p - 10, 50))}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{ color: 'var(--color-text-muted)' }}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut size={13} />
        </button>
        <span className="text-[11px] min-w-[36px] text-center font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {zoom}%
        </span>
        <button
          onClick={() => setZoom(p => Math.min(p + 10, 200))}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{ color: 'var(--color-text-muted)' }}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn size={13} />
        </button>

        <div className="w-px h-4" style={{ background: 'var(--color-border)' }} />

        <button
          onClick={handleTogglePdfAppearance}
          aria-pressed={pdfAppearance === 'inverted'}
          className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{
            color: pdfAppearance === 'inverted' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            background: pdfAppearance === 'inverted' ? 'var(--color-accent-soft)' : 'transparent',
          }}
          title="Toggle PDF colors"
          aria-label="Toggle PDF colors"
        >
          <Contrast size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center p-4" style={{ background: 'var(--color-surface)' }}>
        {previewUrl ? (
          <div className="relative w-full h-full flex justify-center">
            <iframe
              src={previewUrl}
              className="pdf-frame"
              style={{
                width: `${zoom}%`,
                maxWidth: '100%',
                height: '100%',
                minHeight: '600px',
                border: 'none',
                background: pdfAppearance === 'inverted' ? '#000' : '#fff',
                filter: pdfAppearance === 'inverted' ? 'invert(1) hue-rotate(180deg)' : 'none',
              }}
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
        <div className="border-t px-3 py-2 max-h-28 overflow-auto" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--color-border)' }}>
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
