import { useState, useEffect, useCallback } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

const SIDEBAR_COLLAPSED_KEY = 'tf-sidebar-collapsed';

type DashboardContextType = {
  searchOpen: boolean;
  setSearchOpen: (open: boolean | ((p: boolean) => boolean)) => void;
};

export function useDashboardContext() {
  return useOutletContext<DashboardContextType>();
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = useCallback(() => setSearchOpen(p => !p), []);

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--color-background)' }}>
      <DashboardSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(p => !p)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onSearch={handleSearch}
      />
      <main className="flex-1 overflow-auto min-w-0" style={{ background: 'var(--color-background)' }}>
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <button onClick={() => setMobileOpen(true)} className="p-1.5" style={{ color: 'var(--color-text-muted)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
          <span className="text-sm font-semibold tf-brand" style={{ color: 'var(--color-text-primary)' }}>TexFlow</span>
        </div>
        <Outlet context={{ searchOpen, setSearchOpen }} />
      </main>
    </div>
  );
}
