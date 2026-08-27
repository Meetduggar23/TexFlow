import { useRef, useEffect, useCallback, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react';
import { Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setAutoCompile, setCompileMode, setSyntaxCheck, setErrorHandling,
} from '../store/editorSlice';

interface CompileSettingsDropdownProps {
  onClose: () => void;
  onCleanBuild: () => void;
  onStopCompilation: () => void;
  compiling: boolean;
  containerRef?: RefObject<HTMLDivElement>;
}

function RadioOption({ label, suffix, checked, onChange }: {
  label: string;
  suffix?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-elevated)] rounded"
      style={{ color: checked ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
    >
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        {checked && <Check size={13} style={{ color: 'var(--color-accent)' }} />}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {suffix && (
        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
          {suffix}
        </span>
      )}
    </button>
  );
}

function ActionButton({ label, onClick, danger, disabled = false }: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      role="menuitem"
      disabled={disabled}
      aria-disabled={disabled}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-elevated)] rounded"
      style={{ color: danger ? 'var(--color-error)' : 'var(--color-text-secondary)' }}
    >
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}

export default function CompileSettingsDropdown({ onClose, onCleanBuild, onStopCompilation, compiling, containerRef }: CompileSettingsDropdownProps) {
  const dispatch = useAppDispatch();
  const { compileSettings } = useAppSelector(state => state.editor);
  const menuRef = useRef<HTMLDivElement>(null);
  const ref = containerRef || menuRef;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled)') || []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  const handleCleanBuild = useCallback(() => {
    onCleanBuild();
    onClose();
  }, [onCleanBuild, onClose]);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Compilation options"
      onKeyDown={handleMenuKeyDown}
      className="absolute top-full right-0 mt-1 z-50 border rounded-lg shadow-2xl py-1 min-w-[280px] max-h-[min(80vh,520px)] overflow-y-auto"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border-strong)',
      }}
    >
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
        Auto compile
      </div>
      <RadioOption
        label="On"
        checked={compileSettings.autoCompile}
        onChange={() => dispatch(setAutoCompile(true))}
      />
      <RadioOption
        label="Off"
        checked={!compileSettings.autoCompile}
        onChange={() => dispatch(setAutoCompile(false))}
      />

      <div className="border-t mx-2 my-1" style={{ borderColor: 'var(--color-border)' }} />

      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
        Compile mode
      </div>
      <RadioOption
        label="Normal"
        checked={compileSettings.compileMode === 'normal'}
        onChange={() => dispatch(setCompileMode('normal'))}
      />
      <RadioOption
        label="Fast"
        suffix="draft"
        checked={compileSettings.compileMode === 'draft'}
        onChange={() => dispatch(setCompileMode('draft'))}
      />

      <div className="border-t mx-2 my-1" style={{ borderColor: 'var(--color-border)' }} />

      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
        Syntax checks
      </div>
      <RadioOption
        label="Check syntax before compile"
        checked={compileSettings.syntaxCheck === 'check'}
        onChange={() => dispatch(setSyntaxCheck('check'))}
      />
      <RadioOption
        label="Don't check syntax"
        checked={compileSettings.syntaxCheck === 'none'}
        onChange={() => dispatch(setSyntaxCheck('none'))}
      />

      <div className="border-t mx-2 my-1" style={{ borderColor: 'var(--color-border)' }} />

      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
        Compile error handling
      </div>
      <RadioOption
        label="Stop on first error"
        checked={compileSettings.errorHandling === 'stop'}
        onChange={() => dispatch(setErrorHandling('stop'))}
      />
      <RadioOption
        label="Try to compile despite errors"
        checked={compileSettings.errorHandling === 'continue'}
        onChange={() => dispatch(setErrorHandling('continue'))}
      />

      <div className="border-t mx-2 my-1" style={{ borderColor: 'var(--color-border)' }} />

      <ActionButton label={compiling ? 'Stop compilation' : 'No compilation is currently running'} onClick={onStopCompilation} danger={compiling} disabled={!compiling} />
      <ActionButton label="Recompile from scratch" onClick={handleCleanBuild} />
    </div>
  );
}
