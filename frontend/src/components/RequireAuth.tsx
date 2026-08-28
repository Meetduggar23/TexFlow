import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [checking, setChecking] = useState(!token);
  const [authenticated, setAuthenticated] = useState(Boolean(token));

  useEffect(() => {
    if (token) return;
    let active = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error('Unauthenticated'); return response.json(); })
      .then(data => {
        if (!active) return;
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setAuthenticated(true);
        }
      })
      .catch(() => { if (active) setAuthenticated(false); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [token]);

  if (checking) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>Checking session…</div>;
  if (!authenticated) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}
