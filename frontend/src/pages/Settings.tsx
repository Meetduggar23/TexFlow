import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Palette, Bell, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'notifications'>('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editorTheme, setEditorTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [fontSize, setFontSize] = useState('14');
  const [autosave, setAutosave] = useState(true);
  const [autoCompile, setAutoCompile] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setName(user.name || '');
    setEmail(user.email || '');
  }, []);

  const handleThemeChange = (theme: string) => {
    setEditorTheme(theme);
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.dataset.theme = theme;
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  };

  const handleSaveProfile = async () => {
    try {
      await fetch('/api/auth/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = name;
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Profile updated');
    } catch { toast.error('Failed to update'); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error('Fill in all fields');
    try {
      const res = await fetch('/api/auth/password', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      if (!res.ok) throw new Error();
      setCurrentPassword(''); setNewPassword('');
      toast.success('Password changed');
    } catch { toast.error('Failed to change password'); }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'preferences' as const, label: 'Preferences', icon: Palette },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
        <h1 className="text-3xl font-bold text-texflow-900">Settings</h1>
      </div>

      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${activeTab === tab.id ? 'text-texflow-900' : 'text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200'}`} style={activeTab === tab.id ? { background: 'linear-gradient(135deg, rgba(245,175,175,0.3), rgba(232,149,149,0.2))' } : {}}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 card">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-texflow-900 mb-4">Profile</h2>
              <div><label className="block text-sm text-texflow-700 mb-1">Name</label><input value={name} onChange={e => setName(e.target.value)} className="input-field w-full" /></div>
              <div><label className="block text-sm text-texflow-700 mb-1">Email</label><input value={email} disabled className="input-field w-full opacity-60" /></div>
              <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2"><Save size={16} /> Save Changes</button>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-texflow-900 mb-4">Change Password</h2>
              <div><label className="block text-sm text-texflow-700 mb-1">Current Password</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field w-full" /></div>
              <div><label className="block text-sm text-texflow-700 mb-1">New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field w-full" /></div>
              <button onClick={handleChangePassword} className="btn-primary flex items-center gap-2"><Lock size={16} /> Update Password</button>
            </div>
          )}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-texflow-900 mb-4">Editor Preferences</h2>
              <div><label className="block text-sm text-texflow-700 mb-1">Theme</label><select value={editorTheme} onChange={e => handleThemeChange(e.target.value)} className="input-field w-full"><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></div>
              <div><label className="block text-sm text-texflow-700 mb-1">Font Size</label><select value={fontSize} onChange={e => setFontSize(e.target.value)} className="input-field w-full"><option value="12">12px</option><option value="14">14px</option><option value="16">16px</option><option value="18">18px</option></select></div>
              <div className="flex items-center justify-between"><label className="text-sm text-texflow-700">Autosave</label><button onClick={() => setAutosave(!autosave)} className={`w-11 h-6 rounded-full transition-colors ${autosave ? '' : 'bg-dark-600'}`} style={autosave ? { background: 'linear-gradient(135deg, #F5AFAF, #e89595)' } : {}}><div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${autosave ? 'translate-x-5.5' : 'translate-x-0.5'}`} style={{ marginTop: '2px', marginLeft: autosave ? '22px' : '2px' }} /></button></div>
              <div className="flex items-center justify-between"><label className="text-sm text-texflow-700">Auto-compile on save</label><button onClick={() => setAutoCompile(!autoCompile)} className={`w-11 h-6 rounded-full transition-colors ${autoCompile ? '' : 'bg-dark-600'}`} style={autoCompile ? { background: 'linear-gradient(135deg, #F5AFAF, #e89595)' } : {}}><div className={`w-5 h-5 bg-white rounded-full transform transition-transform`} style={{ marginTop: '2px', marginLeft: autoCompile ? '22px' : '2px' }} /></button></div>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-texflow-900 mb-4">Notification Settings</h2>
              {['Project shared with you', 'New comment on your project', 'Compilation completed', 'Compilation failed', 'Mention in comment'].map(item => (
                <div key={item} className="flex items-center justify-between py-2"><span className="text-sm text-texflow-700">{item}</span><div className="w-11 h-6 rounded-full cursor-pointer" style={{ background: 'linear-gradient(135deg, #F5AFAF, #e89595)' }}><div className="w-5 h-5 bg-white rounded-full transform translate-x-5.5" style={{ marginTop: '2px', marginLeft: '22px' }} /></div></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
