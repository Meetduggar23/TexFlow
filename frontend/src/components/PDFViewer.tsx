import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, ZoomIn, ZoomOut, Loader2, FileText, Contrast, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { compileProject } from '../store/editorSlice';
import toast from 'react-hot-toast';

interface PDFViewerProps {
  projectId: string;
  onRecompile?: () => void;
}

export default function PDFViewer({ projectId, onRecompile }: PDFViewerProps) {
  const dispatch = useAppDispatch();
  const { compiling, compileResult, sourceRevision, compiledRevision, lastValidPdfUrl } = useAppSelector(state => state.editor);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      const separator = compileResult.pdfUrl.includes('?') ? '&' : '?';
      setPreviewUrl(`${compileResult.pdfUrl}${separator}v=${Date.now()}`);
      setCurrentPage(1);
    }
  }, [compileResult]);

  useEffect(() => {
    if (lastValidPdfUrl && !previewUrl) {
      setPreviewUrl(`${lastValidPdfUrl}?v=${Date.now()}`);
    }
  }, [lastValidPdfUrl, previewUrl]);

  const handleRefresh = useCallback(async () => {
    if (onRecompile) {
      onRecompile();
      return;
    }
    try {
      await dispatch(compileProject(projectId)).unwrap();
    } catch {
      toast.error('Compilation failed');
    }
  }, [dispatch, projectId, onRecompile]);

  const handleDownload = useCallback(() => {
    const url = compileResult?.pdfUrl || lastValidPdfUrl;
    if (url) {
      const separator = url.includes('?') ? '&' : '?';
      const link = document.createElement('a');
      link.href = `${url}${separator}_dl=${Date.now()}`;
      link.download = 'document.pdf';
      link.click();
    }
  }, [compileResult, lastValidPdfUrl]);

  const handleTogglePdfAppearance = useCallback(() => {
    setPdfAppearance(current => {
      const next = current === 'normal' ? 'inverted' : 'normal';
      try {
        localStorage.setItem(`texflow-pdf-appearance-${projectId}`, next);
      } catch { /* persistence is optional */ }
      return next;
    });
  }, [projectId]);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-surface)' }}>
      {/* ── PDF Toolbar ── */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-b flex-shrink-0"
        style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
      >
        <span className="text-[11px] font-semibold mr-1" style={{ color: 'var(--color-text-secondary)' }}>
          PDF Preview
        </span>

        {isStale && (
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: 'var(--color-warning)', background: 'rgba(245,158,11,0.1)' }}>
            Out of date
          </span>
        )}

        <div className="flex-1" />

        {/* Zoom controls */}
        <button
          onClick={() => setZoom(p => Math.max(p - 10, 25))}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{ color: 'var(--color-text-muted)' }}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut size={13} />
        </button>
        <span className="text-[10px] min-w-[36px] text-center font-medium tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
          {zoom}%
        </span>
        <button
          onClick={() => setZoom(p => Math.min(p + 10, 400))}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{ color: 'var(--color-text-muted)' }}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn size={13} />
        </button>

        <div className="w-px h-3.5 mx-0.5" style={{ background: 'var(--color-border)' }} />

        {/* Page navigation */}
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)] disabled:opacity-40"
          style={{ color: 'var(--color-text-muted)' }}
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft size={13} />
        </button>
        <span className="text-[10px] min-w-[40px] text-center tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)] disabled:opacity-40"
          style={{ color: 'var(--color-text-muted)' }}
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight size={13} />
        </button>

        <div className="w-px h-3.5 mx-0.5" style={{ background: 'var(--color-border)' }} />

        {/* PDF appearance toggle */}
        <button
          onClick={handleTogglePdfAppearance}
          aria-pressed={pdfAppearance === 'inverted'}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{
            color: pdfAppearance === 'inverted' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            background: pdfAppearance === 'inverted' ? 'var(--color-accent-soft)' : 'transparent',
          }}
          title={pdfAppearance === 'inverted' ? 'Inverted (dark) PDF' : 'Normal PDF'}
          aria-label="Toggle PDF colors"
        >
          <Contrast size={13} />
        </button>

        <div className="w-px h-3.5 mx-0.5" style={{ background: 'var(--color-border)' }} />

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={!previewUrl}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)] disabled:opacity-50"
          style={{ color: 'var(--color-text-muted)' }}
          title="Download PDF"
          aria-label="Download PDF"
        >
          <Download size={13} />
        </button>

        {/* Recompile */}
        <button
          onClick={handleRefresh}
          disabled={compiling}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-elevated)] disabled:opacity-50"
          style={{ color: compiling ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
          title="Recompile"
          aria-label="Recompile PDF"
        >
          {compiling ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
        </button>
      </div>

      {/* ── PDF Document Area ── */}
      <div className="flex-1 overflow-auto flex items-start justify-center" style={{ background: 'var(--color-surface)' }}>
        {previewUrl ? (
          <div
            className="relative flex justify-center"
            style={{
              width: `${zoom}%`,
              maxWidth: '100%',
              minWidth: zoom < 100 ? `${zoom}%` : undefined,
              height: '100%',
              minHeight: 0,
              flexShrink: 0,
            }}
          >
            <iframe
              src={previewUrl}
              className="pdf-frame"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                flexShrink: 0,
                background: pdfAppearance === 'inverted' ? '#000' : '#fff',
                filter: pdfAppearance === 'inverted' ? 'invert(1) hue-rotate(180deg)' : 'none',
              }}
              title="PDF Preview"
            />
            {compiling && (
              <div
                className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium"
                style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <Loader2 size={10} className="animate-spin" />
                Updating...
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
              <FileText size={22} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>No PDF generated</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>Auto-compile on, or press Ctrl+Enter</p>
            <button onClick={handleRefresh} className="btn-primary text-xs px-3 py-1.5">
              Compile Now
            </button>
          </div>
        )}
      </div>

      {/* ── Compilation Errors ── */}
      {compileResult?.errors && compileResult.errors.length > 0 && (
        <div className="border-t px-3 py-2 max-h-28 overflow-auto flex-shrink-0" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--color-border)' }}>
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
