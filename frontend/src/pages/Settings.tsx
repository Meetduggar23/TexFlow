import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Lock, Palette, Code, Keyboard,
  Terminal, Folder, FileText, Bell, Shield, HardDrive, Info,
  Eye, EyeOff, Trash2, RotateCcw, ChevronDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  updateProfile,
  setColorTheme, setEditorTheme, setAppearanceFontFamily, setAppearanceFontSize,
  setAppearanceLineHeight, setUiDensity, setAnimations, setReducedMotion,
  setEditorFontFamily, setEditorFontSize, setEditorLineHeight, setTabSize,
  setIndentStyle, setWordWrap, setMinimap, setLineNumbers, setBracketMatching,
  setAutoClosingBrackets, setSyntaxHighlighting, setSmoothScrolling, setCursorStyle,
  setCursorBlinking,
  setCompAutoCompile, setCompCompileMode, setCompSyntaxCheck, setCompErrorHandling,
  setCompCompiler, setCompMainDocument, setCompTimeout,
  setAutosave, setAutosaveDelay, setConfirmFileDelete, setShowHiddenFiles,
  setSidebarWidth, setRestoreSidebarWidth, setDefaultFile,
  setPdfAutoRefresh, setPdfZoom, setPdfPreserveZoom, setPdfPreservePage,
  setPdfOpenAutomatically, setPdfQuality,
  setNotifCompilationCompleted, setNotifCompilationErrors, setNotifCompilationWarnings,
  setNotifFileSaved, setNotifCollaborationActivity, setNotifComments,
  setNotifDesktopNotifications,
  setPrivacyAnalytics, setPrivacyUsageStatistics, setPrivacyCrashReports,
  setPrivacyPersonalization,
  resetSettings,
} from '../store/settingsSlice';
import { useTheme } from '../ThemeProvider';
import { themes } from '../theme';
import BrandLogo from '../components/BrandLogo';
import toast from 'react-hot-toast';

type SidebarCategory = { label: string; items: SidebarItem[] };
type SidebarItem = { id: string; label: string; icon: React.ElementType };

const NAV: SidebarCategory[] = [
  { label: 'ACCOUNT', items: [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ]},
  { label: 'EDITOR', items: [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'editor', label: 'Editor', icon: Code },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ]},
  { label: 'PROJECT', items: [
    { id: 'compilation', label: 'Compilation', icon: Terminal },
    { id: 'files', label: 'Files', icon: Folder },
    { id: 'pdf', label: 'PDF & Preview', icon: FileText },
  ]},
  { label: 'APP', items: [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'storage', label: 'Storage', icon: HardDrive },
  ]},
  { label: 'ABOUT', items: [
    { id: 'about', label: 'About TexFlow', icon: Info },
  ]},
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={value}
      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
      style={{ background: value ? 'var(--color-accent)' : 'var(--color-border-strong)' }}
      onClick={() => onChange(!value)}
    >
      <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex-1 mr-4">
        <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function RadioGroup({ options, value, onChange }: { options: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-md overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
      {options.map(o => (
        <button key={o.value} type="button"
          className="px-3 py-1.5 text-xs font-medium border-none cursor-pointer"
          style={{
            background: o.value === value ? 'var(--color-accent)' : 'var(--color-surface)',
            color: o.value === value ? '#fff' : 'var(--color-text-secondary)',
          }}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}

/* ─── Panel Components ─── */

function ProfilePanel() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(st => st.settings.profile);
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const [name, setName] = useState(profile.name || storedUser.name || '');
  const [email] = useState(profile.email || storedUser.email || '');
  const [username, setUsername] = useState(profile.username || storedUser.username || '');

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Profile</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Manage your personal information and public profile.</p>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Name</label>
          <input className="w-full px-3 py-2 rounded-md text-sm border outline-none focus:border-[var(--color-accent)]" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Email</label>
          <input className="w-full px-3 py-2 rounded-md text-sm border outline-none opacity-60" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={email} readOnly />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Username</label>
          <input className="w-full px-3 py-2 rounded-md text-sm border outline-none focus:border-[var(--color-accent)]" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={username} onChange={e => setUsername(e.target.value)} />
        </div>
      </div>
      <button type="button" className="px-5 py-2 rounded-md text-sm font-semibold text-white cursor-pointer border-none" style={{ background: 'var(--color-accent)' }}
        onClick={() => { dispatch(updateProfile({ name, username })); toast.success('Profile updated'); }}>Save Changes</button>
    </div>
  );
}

function SecurityPanel() {
  const dispatch = useAppDispatch();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const inputCls = "flex-1 px-3 py-2 rounded-md text-sm border outline-none focus:border-[var(--color-accent)]";
  const inputStyle = { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Security</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Manage your password and account security settings.</p>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Change Password</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm w-32 flex-shrink-0" style={{ color: 'var(--color-text-primary)' }}>Current Password</label>
            <div className="flex-1 flex items-center gap-1">
              <input type={showCurrent ? 'text' : 'password'} className={inputCls} style={inputStyle} value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
              <button type="button" className="p-1.5 rounded border cursor-pointer" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)' }} onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm w-32 flex-shrink-0" style={{ color: 'var(--color-text-primary)' }}>New Password</label>
            <div className="flex-1 flex items-center gap-1">
              <input type={showNew ? 'text' : 'password'} className={inputCls} style={inputStyle} value={newPw} onChange={e => setNewPw(e.target.value)} />
              <button type="button" className="p-1.5 rounded border cursor-pointer" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)' }} onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>
        <button type="button" disabled={!currentPw || newPw.length < 8} className="mt-3 px-5 py-2 rounded-md text-sm font-semibold text-white cursor-pointer border-none disabled:opacity-50" style={{ background: 'var(--color-accent)' }}
          onClick={async () => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch('/api/auth/password', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }) });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || 'Unable to update password');
              setCurrentPw(''); setNewPw(''); toast.success('Password updated');
            } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update password'); }
          }}>Update Password</button>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Two-Factor Authentication</h3>
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Two-Factor Authentication</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Add an extra layer of security to your account.</div>
          </div>
          <button type="button" className="px-4 py-1.5 rounded-md text-sm border cursor-pointer" style={{ borderColor: 'var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)' }}>Enable</button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Active Sessions</h3>
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Current Session</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>This device &middot; Active now</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-error)' }}>Danger Zone</h3>
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Delete Account</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Permanently delete your account and all associated data.</div>
          </div>
          {!showDeleteConfirm ? (
            <button type="button" className="px-4 py-1.5 rounded-md text-sm font-semibold border cursor-pointer" style={{ borderColor: 'var(--color-error)', background: 'transparent', color: 'var(--color-error)' }} onClick={() => setShowDeleteConfirm(true)}>Delete Account</button>
          ) : (
            <div className="flex gap-2">
              <button type="button" className="px-4 py-1.5 rounded-md text-sm font-semibold border cursor-pointer" style={{ borderColor: 'var(--color-error)', background: 'var(--color-error)', color: '#fff' }} onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const response = await fetch('/api/auth/me', { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
                  if (!response.ok) throw new Error('Unable to delete account');
                  localStorage.removeItem('token'); localStorage.removeItem('user');
                  toast.success('Account deleted');
                  window.location.assign('/dashboard');
                } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to delete account'); }
              }}>Confirm</button>
              <button type="button" className="px-4 py-1.5 rounded-md text-sm border cursor-pointer" style={{ borderColor: 'var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppearancePanel() {
  const dispatch = useAppDispatch();
  const appearance = useAppSelector(st => st.settings.appearance);
  const { setTheme: applyTheme } = useTheme();

  const selectCls = "px-3 py-1.5 rounded-md text-sm border outline-none cursor-pointer";
  const selectStyle = { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Appearance</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Customize the look and feel of TexFlow.</p>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Theme</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Color Theme</span>
            <select className={selectCls} style={selectStyle} value={appearance.colorTheme} onChange={e => { dispatch(setColorTheme(e.target.value)); applyTheme(e.target.value); }}>
              {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Editor Theme</span>
            <select className={selectCls} style={selectStyle} value={appearance.editorTheme} onChange={e => dispatch(setEditorTheme(e.target.value))}>
              <option value="application">Use Application Theme</option>
              {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Typography</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Font Family</span>
            <select className={selectCls} style={selectStyle} value={appearance.fontFamily} onChange={e => dispatch(setAppearanceFontFamily(e.target.value))}>
              {['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Cascadia Code', 'IBM Plex Mono'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Font Size</span>
            <input type="number" min={10} max={32} className="w-20 px-3 py-1.5 rounded-md text-sm border outline-none" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={appearance.fontSize} onChange={e => dispatch(setAppearanceFontSize(Number(e.target.value)))} />
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Line Height</span>
            <input type="number" min={1} max={3} step={0.1} className="w-20 px-3 py-1.5 rounded-md text-sm border outline-none" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={appearance.lineHeight} onChange={e => dispatch(setAppearanceLineHeight(Number(e.target.value)))} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Interface</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>UI Density</span>
            <RadioGroup options={[{ label: 'Comfortable', value: 'comfortable' }, { label: 'Compact', value: 'compact' }]} value={appearance.uiDensity} onChange={v => dispatch(setUiDensity(v as 'comfortable' | 'compact'))} />
          </div>
          <ToggleRow label="Animations" value={appearance.animations} onChange={v => dispatch(setAnimations(v))} />
          <ToggleRow label="Reduced Motion" value={appearance.reducedMotion} onChange={v => dispatch(setReducedMotion(v))} />
        </div>
      </div>
    </div>
  );
}

function EditorPanel() {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(st => st.settings.editor);

  const selectCls = "px-3 py-1.5 rounded-md text-sm border outline-none cursor-pointer";
  const selectStyle = { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Editor</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Configure the code editor behavior and appearance.</p>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Font</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Font Family</span>
            <select className={selectCls} style={selectStyle} value={editor.fontFamily} onChange={e => dispatch(setEditorFontFamily(e.target.value))}>
              {['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Cascadia Code', 'IBM Plex Mono'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Font Size</span>
            <input type="number" min={10} max={32} className="w-20 px-3 py-1.5 rounded-md text-sm border outline-none" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={editor.fontSize} onChange={e => dispatch(setEditorFontSize(Number(e.target.value)))} />
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Line Height</span>
            <input type="number" min={1} max={3} step={0.1} className="w-20 px-3 py-1.5 rounded-md text-sm border outline-none" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={editor.lineHeight} onChange={e => dispatch(setEditorLineHeight(Number(e.target.value)))} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Indentation</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Tab Size</span>
            <select className={selectCls} style={selectStyle} value={editor.tabSize} onChange={e => dispatch(setTabSize(Number(e.target.value)))}>
              {[2, 4, 8].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Indent Style</span>
            <RadioGroup options={[{ label: 'Spaces', value: 'spaces' }, { label: 'Tabs', value: 'tabs' }]} value={editor.indentStyle} onChange={v => dispatch(setIndentStyle(v as 'spaces' | 'tabs'))} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Behavior</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Word Wrap</span>
            <RadioGroup options={[{ label: 'Off', value: 'off' }, { label: 'On', value: 'on' }, { label: 'Bounded', value: 'bounded' }]} value={editor.wordWrap} onChange={v => dispatch(setWordWrap(v as 'off' | 'on' | 'bounded'))} />
          </div>
          <ToggleRow label="Minimap" value={editor.minimap} onChange={v => dispatch(setMinimap(v))} />
          <ToggleRow label="Line Numbers" value={editor.lineNumbers} onChange={v => dispatch(setLineNumbers(v))} />
          <ToggleRow label="Bracket Matching" value={editor.bracketMatching} onChange={v => dispatch(setBracketMatching(v))} />
          <ToggleRow label="Auto Closing Brackets" value={editor.autoClosingBrackets} onChange={v => dispatch(setAutoClosingBrackets(v))} />
          <ToggleRow label="Syntax Highlighting" value={editor.syntaxHighlighting} onChange={v => dispatch(setSyntaxHighlighting(v))} />
          <ToggleRow label="Smooth Scrolling" value={editor.smoothScrolling} onChange={v => dispatch(setSmoothScrolling(v))} />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Cursor</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Cursor Style</span>
            <RadioGroup options={[{ label: 'Line', value: 'line' }, { label: 'Block', value: 'block' }, { label: 'Underline', value: 'underline' }]} value={editor.cursorStyle} onChange={v => dispatch(setCursorStyle(v as 'line' | 'block' | 'underline'))} />
          </div>
          <ToggleRow label="Cursor Blinking" value={editor.cursorBlinking} onChange={v => dispatch(setCursorBlinking(v))} />
        </div>
      </div>
    </div>
  );
}

function ShortcutsPanel() {
  const dispatch = useAppDispatch();
  const shortcuts = [
    { action: 'Compile', key: 'Ctrl+Enter' },
    { action: 'Toggle Files', key: 'Ctrl+Shift+B' },
    { action: 'Save', key: 'Ctrl+S' },
    { action: 'Search', key: 'Ctrl+F' },
    { action: 'Command Palette', key: 'Ctrl+Shift+P' },
    { action: 'Open Terminal', key: 'Ctrl+`' },
    { action: 'New File', key: 'Ctrl+N' },
    { action: 'Close File', key: 'Ctrl+W' },
    { action: 'Fullscreen', key: 'F11' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Shortcuts</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Keyboard shortcuts for common actions.</p>
      <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
        {shortcuts.map((sc, i) => (
          <div key={sc.action} className="flex items-center justify-between px-4 py-2.5" style={{ background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{sc.action}</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono border" style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}>{sc.key}</span>
          </div>
        ))}
      </div>
      <button type="button" className="mt-4 px-4 py-2 rounded-md text-sm border cursor-pointer flex items-center gap-1.5" style={{ borderColor: 'var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)' }}
        onClick={() => { dispatch(resetSettings()); toast.success('Settings reset to defaults'); }}>
        <RotateCcw size={14} /> Reset to Default
      </button>
    </div>
  );
}

function CompilationPanel() {
  const dispatch = useAppDispatch();
  const compilation = useAppSelector(st => st.settings.compilation);

  const selectCls = "px-3 py-1.5 rounded-md text-sm border outline-none cursor-pointer";
  const selectStyle = { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Compilation</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Configure how your LaTeX project is compiled.</p>

      <div className="space-y-1 mb-6">
        <ToggleRow label="Auto Compile" value={compilation.autoCompile} onChange={v => dispatch(setCompAutoCompile(v))} />
        <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Compile Mode</span>
          <RadioGroup options={[{ label: 'Normal', value: 'normal' }, { label: 'Fast draft', value: 'draft' }]} value={compilation.compileMode} onChange={v => dispatch(setCompCompileMode(v as 'normal' | 'draft'))} />
        </div>
        <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Syntax Checks</span>
          <RadioGroup options={[{ label: 'Check', value: 'check' }, { label: 'None', value: 'none' }]} value={compilation.syntaxCheck} onChange={v => dispatch(setCompSyntaxCheck(v as 'check' | 'none'))} />
        </div>
        <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Error Handling</span>
          <RadioGroup options={[{ label: 'Stop', value: 'stop' }, { label: 'Continue', value: 'continue' }]} value={compilation.errorHandling} onChange={v => dispatch(setCompErrorHandling(v as 'stop' | 'continue'))} />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Compiler</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Compiler</span>
            <select className={selectCls} style={selectStyle} value={compilation.compiler} onChange={e => dispatch(setCompCompiler(e.target.value as 'pdflatex' | 'xelatex' | 'lualatex'))}>
              <option value="pdflatex">pdfLaTeX</option>
              <option value="xelatex">XeLaTeX</option>
              <option value="lualatex">LuaLaTeX</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Main Document</span>
            <input className="w-48 px-3 py-1.5 rounded-md text-sm border outline-none" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={compilation.mainDocument} onChange={e => dispatch(setCompMainDocument(e.target.value))} />
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Timeout (seconds)</span>
            <input type="number" min={10} max={300} className="w-20 px-3 py-1.5 rounded-md text-sm border outline-none" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={compilation.timeout} onChange={e => dispatch(setCompTimeout(Number(e.target.value)))} />
          </div>
        </div>
      </div>

      <button type="button" className="px-4 py-2 rounded-md text-sm border cursor-pointer flex items-center gap-1.5" style={{ borderColor: 'var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)' }}
        onClick={() => toast.success('Recompiling from scratch')}>
        <RotateCcw size={14} /> Recompile From Scratch
      </button>
    </div>
  );
}

function FilesPanel() {
  const dispatch = useAppDispatch();
  const files = useAppSelector(st => st.settings.files);

  const selectCls = "px-3 py-1.5 rounded-md text-sm border outline-none cursor-pointer";
  const selectStyle = { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Files</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Configure file handling and the file explorer.</p>

      <div className="space-y-1 mb-6">
        <ToggleRow label="Autosave" value={files.autosave} onChange={v => dispatch(setAutosave(v))} />
        <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Autosave Delay</span>
          <select className={selectCls} style={selectStyle} value={files.autosaveDelay} onChange={e => dispatch(setAutosaveDelay(Number(e.target.value)))}>
            {[1, 2, 5, 10].map(v => <option key={v} value={v}>{v} second{v > 1 ? 's' : ''}</option>)}
          </select>
        </div>
        <ToggleRow label="Confirm File Delete" value={files.confirmFileDelete} onChange={v => dispatch(setConfirmFileDelete(v))} />
        <ToggleRow label="Show Hidden Files" value={files.showHiddenFiles} onChange={v => dispatch(setShowHiddenFiles(v))} />
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Sidebar</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Sidebar Width</span>
            <input type="number" min={160} max={500} className="w-20 px-3 py-1.5 rounded-md text-sm border outline-none" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={files.sidebarWidth} onChange={e => dispatch(setSidebarWidth(Number(e.target.value)))} />
          </div>
          <ToggleRow label="Restore Sidebar Width" value={files.restoreSidebarWidth} onChange={v => dispatch(setRestoreSidebarWidth(v))} />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Defaults</h3>
        <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Default File</span>
          <input className="w-48 px-3 py-1.5 rounded-md text-sm border outline-none" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} value={files.defaultFile} onChange={e => dispatch(setDefaultFile(e.target.value))} />
        </div>
      </div>
    </div>
  );
}

function PdfPanel() {
  const dispatch = useAppDispatch();
  const pdf = useAppSelector(st => st.settings.pdf);

  const selectCls = "px-3 py-1.5 rounded-md text-sm border outline-none cursor-pointer";
  const selectStyle = { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>PDF & Preview</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Configure PDF viewer and preview settings.</p>

      <div className="space-y-1">
        <ToggleRow label="Auto Refresh" value={pdf.autoRefresh} onChange={v => dispatch(setPdfAutoRefresh(v))} />
        <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Zoom</span>
          <select className={selectCls} style={selectStyle} value={typeof pdf.zoom === 'string' ? pdf.zoom : '100'} onChange={e => dispatch(setPdfZoom(e.target.value === '100' ? 100 : e.target.value as 'fit-width' | 'fit-page'))}>
            <option value="fit-width">Fit Width</option>
            <option value="fit-page">Fit Page</option>
            <option value="100">100%</option>
          </select>
        </div>
        <ToggleRow label="Preserve Zoom" value={pdf.preserveZoom} onChange={v => dispatch(setPdfPreserveZoom(v))} />
        <ToggleRow label="Preserve Page" value={pdf.preservePage} onChange={v => dispatch(setPdfPreservePage(v))} />
        <ToggleRow label="Open PDF Automatically" value={pdf.openPdfAutomatically} onChange={v => dispatch(setPdfOpenAutomatically(v))} />
        <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Quality</span>
          <RadioGroup options={[{ label: 'Standard', value: 'standard' }, { label: 'High', value: 'high' }]} value={pdf.quality} onChange={v => dispatch(setPdfQuality(v as 'standard' | 'high'))} />
        </div>
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const dispatch = useAppDispatch();
  const notif = useAppSelector(st => st.settings.notifications);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Notifications</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Choose which notifications you want to receive.</p>
      <div className="space-y-1">
        <ToggleRow label="Compilation Completed" value={notif.compilationCompleted} onChange={v => dispatch(setNotifCompilationCompleted(v))} />
        <ToggleRow label="Compilation Errors" value={notif.compilationErrors} onChange={v => dispatch(setNotifCompilationErrors(v))} />
        <ToggleRow label="Compilation Warnings" value={notif.compilationWarnings} onChange={v => dispatch(setNotifCompilationWarnings(v))} />
        <ToggleRow label="File Saved" value={notif.fileSaved} onChange={v => dispatch(setNotifFileSaved(v))} />
        <ToggleRow label="Collaboration Activity" value={notif.collaborationActivity} onChange={v => dispatch(setNotifCollaborationActivity(v))} />
        <ToggleRow label="Comments" value={notif.comments} onChange={v => dispatch(setNotifComments(v))} />
        <ToggleRow label="Desktop Notifications" value={notif.desktopNotifications} onChange={v => dispatch(setNotifDesktopNotifications(v))} />
      </div>
    </div>
  );
}

function PrivacyPanel() {
  const dispatch = useAppDispatch();
  const privacy = useAppSelector(st => st.settings.privacy);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Privacy</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Control your data sharing and privacy preferences.</p>
      <div className="space-y-1">
        <ToggleRow label="Analytics" desc="Help improve TexFlow by sharing anonymous usage data." value={privacy.analytics} onChange={v => dispatch(setPrivacyAnalytics(v))} />
        <ToggleRow label="Usage Statistics" desc="Share how you use features to help prioritize development." value={privacy.usageStatistics} onChange={v => dispatch(setPrivacyUsageStatistics(v))} />
        <ToggleRow label="Crash Reports" desc="Automatically send crash reports to help fix bugs." value={privacy.crashReports} onChange={v => dispatch(setPrivacyCrashReports(v))} />
        <ToggleRow label="Personalization" desc="Allow personalized recommendations and content." value={privacy.personalization} onChange={v => dispatch(setPrivacyPersonalization(v))} />
      </div>
    </div>
  );
}

function StoragePanel() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const usedMB = 245;
  const totalMB = 1024;
  const pct = Math.round((usedMB / totalMB) * 100);

  const sections = [
    { label: 'Projects', size: '120 MB' },
    { label: 'Files', size: '65 MB' },
    { label: 'Assets', size: '30 MB' },
    { label: 'PDF builds', size: '20 MB' },
    { label: 'Other', size: '10 MB' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Storage</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Manage your storage usage and cached files.</p>

      <div className="mb-6">
        <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>{usedMB} MB / {totalMB / 1024} GB</div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 80 ? 'var(--color-warning)' : 'var(--color-accent)' }} />
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{pct}% used</div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Breakdown</h3>
        {sections.map(sec => (
          <div key={sec.label} className="flex justify-between py-1.5 text-sm border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>{sec.label}</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{sec.size}</span>
          </div>
        ))}
      </div>

      {!showClearConfirm ? (
        <button type="button" className="px-4 py-2 rounded-md text-sm font-semibold border cursor-pointer flex items-center gap-1.5" style={{ borderColor: 'var(--color-error)', background: 'transparent', color: 'var(--color-error)' }} onClick={() => setShowClearConfirm(true)}>
          <Trash2 size={14} /> Clear Build Cache
        </button>
      ) : (
        <div className="flex gap-2">
          <button type="button" className="px-4 py-2 rounded-md text-sm font-semibold border cursor-pointer" style={{ borderColor: 'var(--color-error)', background: 'var(--color-error)', color: '#fff' }} onClick={() => { setShowClearConfirm(false); toast.success('Build cache cleared'); }}>Confirm Clear</button>
          <button type="button" className="px-4 py-2 rounded-md text-sm border cursor-pointer" style={{ borderColor: 'var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)' }} onClick={() => setShowClearConfirm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

function AboutPanel() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>About TexFlow</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Information about TexFlow and its ecosystem.</p>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'var(--color-surface-elevated)' }}>
          <BrandLogo alt="TexFlow logo" className="w-12 h-12 object-contain" />
        </div>
        <div>
          <div className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>TexFlow</div>
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Write. Compile. Create.</div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Documentation', 'Help & Support', 'Report a Bug', 'GitHub'].map(link => (
            <a key={link} href="#" className="rounded-lg border px-4 py-3 text-sm no-underline transition-colors hover:bg-[var(--color-surface-elevated)]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}>{link}</a>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Built by Duggar Pvt Ltd</div>
        <div className="mt-1">&copy; 2026 Duggar Pvt Ltd. All rights reserved.</div>
      </div>
    </div>
  );
}

const PANELS: Record<string, React.ComponentType> = {
  profile: ProfilePanel,
  security: SecurityPanel,
  appearance: AppearancePanel,
  editor: EditorPanel,
  shortcuts: ShortcutsPanel,
  compilation: CompilationPanel,
  files: FilesPanel,
  pdf: PdfPanel,
  notifications: NotificationsPanel,
  privacy: PrivacyPanel,
  storage: StoragePanel,
  about: AboutPanel,
};

export default function Settings() {
  const navigate = useNavigate();
  const [active, setActive] = useState('profile');
  const [query, setQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return NAV;
    const q = query.toLowerCase();
    return NAV.map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.label.toLowerCase().includes(q)),
    })).filter(cat => cat.items.length > 0);
  }, [query]);

  const ActivePanel = PANELS[active] || ProfilePanel;
  const activeItem = NAV.flatMap(c => c.items).find(i => i.id === active);

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--color-background)', color: 'var(--color-text-primary)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <button type="button" className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}
          onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span className="text-lg font-semibold">Settings</span>
        </button>
      </div>

      {/* Mobile nav dropdown — hidden since sidebar is always visible */}
      <div className="md:hidden px-4 pt-3 flex-shrink-0">
        <button type="button"
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm border cursor-pointer"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}>
          <span>{activeItem?.label || 'Settings'}</span>
          <ChevronDown size={16} />
        </button>
        {mobileNavOpen && (
          <div className="mt-1 rounded-md border shadow-lg" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            {NAV.map(cat => (
              <div key={cat.label}>
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{cat.label}</div>
                {cat.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm border-none cursor-pointer text-left"
                      style={{ background: active === item.id ? 'var(--color-surface-elevated)' : 'transparent', color: 'var(--color-text-primary)' }}
                      onClick={() => { setActive(item.id); setMobileNavOpen(false); }}>
                      <Icon size={15} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main layout — TWO-COLUMN: sidebar + content */}
      <div className="flex flex-1 min-h-0">

        {/* Desktop sidebar — ALWAYS VISIBLE */}
        <aside className="hidden md:flex flex-col flex-shrink-0 border-r" style={{ width: 240, background: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
          {/* Search */}
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <input
              className="w-full px-3 py-1.5 rounded-md text-xs border outline-none"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              placeholder="Search settings..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {/* Navigation — SCROLLABLE, ALWAYS ALL ITEMS */}
          <nav className="flex-1 overflow-y-auto px-2 pb-3">
            {filtered.map(cat => (
              <div key={cat.label} className="mb-1">
                <div className="px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{cat.label}</div>
                {cat.items.map(item => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] border-none cursor-pointer text-left transition-colors"
                      style={{
                        background: isActive ? 'var(--color-surface-elevated)' : 'transparent',
                        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                      }}
                      onClick={() => setActive(item.id)}
                    >
                      <Icon size={15} style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)', flexShrink: 0 }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Content panel — SCROLLABLE */}
        <main className="flex-1 overflow-y-auto min-w-0" style={{ padding: '28px 36px', maxWidth: 900 }}>
          <ActivePanel />
        </main>
      </div>
    </div>
  );
}
