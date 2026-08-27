import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal, ChevronUp, ChevronDown, AlertCircle, AlertTriangle, X, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setTerminalOpen } from '../store/uiSlice';
import clsx from 'clsx';

interface TerminalPanelProps {
  onNavigateToLine?: (line: number) => void;
}

export default function TerminalPanel({ onNavigateToLine }: TerminalPanelProps) {
  const dispatch = useAppDispatch();
  const { compileResult } = useAppSelector(state => state.editor);
  const { terminalOpen } = useAppSelector(state => state.ui);
  const [activeTab, setActiveTab] = useState<'logs' | 'errors' | 'warnings'>('logs');
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (compileResult?.errors && compileResult.errors.length > 0) {
      dispatch(setTerminalOpen(true));
      setActiveTab('errors');
    }
  }, [compileResult, dispatch]);

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [compileResult]);

  const errors = compileResult?.errors || [];
  const warnings = compileResult?.warnings || [];
  const logs = compileResult?.logs || '';

  const handleErrorClick = useCallback((line: number) => {
    if (line > 0 && onNavigateToLine) onNavigateToLine(line);
  }, [onNavigateToLine]);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-surface)' }}>
      <div
        className="flex items-center justify-between px-3 py-1.5 cursor-pointer select-none flex-shrink-0 border-t border-[var(--color-border)]"
        style={{ background: 'var(--color-background)', height: 36 }}
        onClick={() => dispatch(setTerminalOpen(!terminalOpen))}
      >
        <div className="flex items-center gap-2">
          <Terminal size={13} style={{ color: 'var(--color-accent)' }} />
          <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Terminal</span>
          {errors.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded" style={{ background: 'rgba(220,38,38,0.1)', color: 'var(--color-error)' }}>
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded" style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--color-warning)' }}>
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {terminalOpen && (
            <button
              onClick={(e) => { e.stopPropagation(); dispatch(setTerminalOpen(false)); }}
              className="p-0.5 rounded hover:bg-[var(--color-surface-secondary)]"
              title="Collapse terminal"
              aria-label="Collapse terminal"
            >
              <ChevronDown size={13} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          )}
          {!terminalOpen && (
            <ChevronUp size={13} style={{ color: 'var(--color-text-muted)' }} />
          )}
        </div>
      </div>

      {terminalOpen && (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex items-center gap-1 px-3 py-1 border-b border-[var(--color-border)] flex-shrink-0" style={{ background: 'var(--color-surface)' }}>
            {(['logs', 'errors', 'warnings'] as const).map(tab => (
              <button
                key={tab}
                onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                className={clsx('px-2.5 py-1 text-[11px] font-medium rounded transition-colors capitalize')}
                style={activeTab === tab
                  ? { background: tab === 'errors' ? 'rgba(220,38,38,0.1)' : tab === 'warnings' ? 'rgba(234,179,8,0.1)' : 'var(--color-surface-secondary)', color: 'var(--color-text-primary)' }
                  : { color: 'var(--color-text-muted)' }
                }
              >
                {tab}
                {tab === 'errors' && errors.length > 0 && ` (${errors.length})`}
                {tab === 'warnings' && warnings.length > 0 && ` (${warnings.length})`}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="p-1 rounded hover:bg-[var(--color-surface-secondary)]"
              title="Clear logs"
              aria-label="Clear logs"
            >
              <Trash2 size={11} style={{ color: 'var(--color-text-disabled)' }} />
            </button>
          </div>
          <div ref={logsRef} className="flex-1 overflow-auto p-3 font-mono text-[12px] leading-relaxed min-h-0">
            {activeTab === 'logs' && (
              <pre style={{ color: 'var(--color-text-secondary)' }}>
                {logs || 'No logs available. Compile your project to see output.'}
              </pre>
            )}
            {activeTab === 'errors' && (
              <div className="space-y-1">
                {errors.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)' }}>No errors</p>
                ) : errors.map((error, i) => (
                  <div
                    key={i}
                    onClick={() => handleErrorClick(error.line)}
                    className={clsx(
                      'flex items-start gap-2 rounded px-2 py-1 transition-colors',
                      error.line > 0 && 'cursor-pointer hover:bg-[var(--color-surface-secondary)]'
                    )}
                    style={{ color: 'var(--color-error)' }}
                  >
                    <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {error.file && <span className="font-medium">{error.file}: </span>}
                      {error.line > 0 && <span>Line {error.line}: </span>}
                      {error.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'warnings' && (
              <div className="space-y-1">
                {warnings.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)' }}>No warnings</p>
                ) : warnings.map((warning, i) => (
                  <div
                    key={i}
                    onClick={() => handleErrorClick(warning.line)}
                    className={clsx(
                      'flex items-start gap-2 rounded px-2 py-1 transition-colors',
                      warning.line > 0 && 'cursor-pointer hover:bg-[var(--color-surface-secondary)]'
                    )}
                    style={{ color: 'var(--color-warning)' }}
                  >
                    <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {warning.file && <span className="font-medium">{warning.file}: </span>}
                      {warning.line > 0 && <span>Line {warning.line}: </span>}
                      {warning.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
