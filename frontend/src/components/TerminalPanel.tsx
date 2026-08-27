import { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronUp, ChevronDown, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import clsx from 'clsx';

export default function TerminalPanel() {
  const { compileResult } = useAppSelector(state => state.editor);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'errors' | 'warnings'>('logs');
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (compileResult?.errors && compileResult.errors.length > 0) {
      setIsOpen(true);
      setActiveTab('errors');
    }
  }, [compileResult]);

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [compileResult]);

  const errors = compileResult?.errors || [];
  const warnings = compileResult?.warnings || [];
  const logs = compileResult?.logs || '';

  return (
    <div className={clsx('border-t border-texflow-800 transition-all duration-200', isOpen ? 'h-48' : 'h-8')}>
      <div
        className="flex items-center justify-between px-3 py-1.5 cursor-pointer select-none"
        style={{ background: '#FBEFEF' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-texflow-400" />
          <span className="text-xs font-medium text-texflow-600">Terminal</span>
          {errors.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded" style={{ background: 'rgba(220,38,38,0.2)', color: '#f87171' }}>
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded" style={{ background: 'rgba(234,179,8,0.2)', color: '#facc15' }}>
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div>{isOpen ? <ChevronDown size={14} className="text-texflow-600" /> : <ChevronUp size={14} className="text-texflow-600" />}</div>
      </div>

      {isOpen && (
        <div className="h-[calc(100%-32px)] flex flex-col bg-dark-900">
          <div className="flex items-center gap-1 px-3 py-1 border-b border-texflow-800">
            {(['logs', 'errors', 'warnings'] as const).map(tab => (
              <button
                key={tab}
                onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                className={clsx(
                  'px-2 py-1 text-xs rounded transition-colors capitalize',
                  activeTab === tab ? 'text-white' : 'text-texflow-600 hover:text-texflow-900'
                )}
                style={activeTab === tab ? { background: tab === 'errors' ? 'rgba(220,38,38,0.2)' : tab === 'warnings' ? 'rgba(234,179,8,0.2)' : '#F9DFDF' } : {}}
              >
                {tab}
              </button>
            ))}
          </div>
          <div ref={logsRef} className="flex-1 overflow-auto p-3 font-mono text-xs">
            {activeTab === 'logs' && <pre className="text-texflow-700 whitespace-pre-wrap">{logs || 'No logs available. Compile your project to see output.'}</pre>}
            {activeTab === 'errors' && (
              <div className="space-y-1">
                {errors.length === 0 ? <p className="text-texflow-500">No errors</p> : errors.map((error, i) => (
                  <div key={i} className="flex items-start gap-2 text-red-400">
                    <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{error.file && <span className="text-texflow-600">{error.file}: </span>}Line {error.line}, Col {error.column}: {error.message}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'warnings' && (
              <div className="space-y-1">
                {warnings.length === 0 ? <p className="text-texflow-500">No warnings</p> : warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2 text-yellow-400">
                    <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{warning.file && <span className="text-texflow-600">{warning.file}: </span>}Line {warning.line}, Col {warning.column}: {warning.message}</span>
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
