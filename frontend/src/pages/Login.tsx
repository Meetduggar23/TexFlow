import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLogo from '../components/BrandLogo';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Welcome back!');
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      navigate(returnTo?.startsWith('/') ? returnTo : '/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-background)', color: 'var(--color-text-primary)' }}>
      <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(to bottom, var(--color-accent-soft), transparent)' }} />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: 'var(--color-accent-soft)' }} />
      
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <BrandLogo className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold tf-brand"><span className="tf-brand-tex">Tex</span><span className="tf-brand-flow">Flow</span></span>
          </Link>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Welcome back</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field w-full pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>Log in <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium" style={{ color: 'var(--color-accent)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
