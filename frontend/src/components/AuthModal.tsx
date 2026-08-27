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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
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
    if (!email || !password || !name) return;
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
      <div className="relative border border-texflow-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ background: '#FBEFEF' }}>
        <div className="flex items-center justify-between p-4 border-b border-texflow-800">
          <div className="flex items-center gap-2">
            <BrandLogo className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold text-texflow-900">Tex<span style={{ background: 'linear-gradient(135deg, #e89595, #d47777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Flow</span></span>
          </div>
          <button onClick={onClose} className="p-1 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex border-b border-texflow-800">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'login' ? 'text-texflow-900 border-b-2' : 'text-texflow-600 hover:text-texflow-900'}`}
            style={tab === 'login' ? { borderColor: '#F5AFAF' } : {}}
          >
            Log in
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'signup' ? 'text-texflow-900 border-b-2' : 'text-texflow-600 hover:text-texflow-900'}`}
            style={tab === 'signup' ? { borderColor: '#F5AFAF' } : {}}
          >
            Sign up
          </button>
        </div>

        <div className="p-6">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-texflow-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-texflow-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field w-full pl-10" autoFocus required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-texflow-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-texflow-500" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="input-field w-full pl-10" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Logging in...</> : 'Log in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-texflow-700 mb-1.5">Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-texflow-500" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-field w-full pl-10" autoFocus required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-texflow-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-texflow-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field w-full pl-10" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-texflow-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-texflow-500" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="input-field w-full pl-10" required minLength={6} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
