import { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BrandLogo from './BrandLogo';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Logged in successfully');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Account created successfully');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)' }}>
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <BrandLogo className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold tf-brand"><span className="tf-brand-tex">Tex</span><span className="tf-brand-flow">Flow</span></span>
          </div>
          <button onClick={onClose} className="p-1 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setTab('login')}
            className="flex-1 py-3 text-sm font-medium transition-colors"
            style={{
              color: tab === 'login' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              borderBottom: tab === 'login' ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            Log in
          </button>
          <button
            onClick={() => setTab('signup')}
            className="flex-1 py-3 text-sm font-medium transition-colors"
            style={{
              color: tab === 'signup' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              borderBottom: tab === 'signup' ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            Sign up
          </button>
        </div>

        <div className="p-6">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }} placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none focus:ring-2"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    autoFocus required />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }} placeholder="Your password"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none focus:ring-2"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    required />
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.password}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50"
                style={{ background: 'var(--color-accent)' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Logging in...</> : 'Log in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }} placeholder="Your name"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none focus:ring-2"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    autoFocus required />
                </div>
                {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }} placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none focus:ring-2"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    required />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }} placeholder="Create a password"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all focus:outline-none focus:ring-2"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    required minLength={6} />
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.password}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50"
                style={{ background: 'var(--color-accent)' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
