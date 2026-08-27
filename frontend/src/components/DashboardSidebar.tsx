import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen, Users, Archive, Tag, Plus, BookOpen, Trash2, HelpCircle, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import AuthModal from './AuthModal';

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const projectItems = [
    { icon: FolderOpen, label: 'Your projects', path: '/dashboard' },
    { icon: Users, label: 'Shared with you', path: '/dashboard/shared' },
    { icon: Archive, label: 'Archived projects', path: '/dashboard/recent' },
  ];

  const bottomItems = [
    { icon: BookOpen, label: 'Library', path: '/templates', badge: 'New' },
    { icon: Trash2, label: 'Trash', path: '/dashboard/trash' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/dashboard');
  };

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <>
      <aside className="w-60 h-full flex flex-col" style={{ background: '#030637', borderRight: '1px solid #3C0753' }}>
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src="/logo.png" alt="TexFlow" className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold text-white">Tex<span className="gradient-text">Flow</span></span>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          <div className="mb-3">
            <button
              onClick={() => navigate('/dashboard')}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                location.pathname === '/dashboard' || location.pathname === '/dashboard/projects'
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white hover:bg-dark-700/50'
              )}
              style={location.pathname === '/dashboard' || location.pathname === '/dashboard/projects'
                ? { background: 'linear-gradient(135deg, rgba(114,4,85,0.3), rgba(145,10,103,0.2))' } : {}}
            >
              <FolderOpen size={18} />
              Projects
            </button>

            <div className="ml-4 mt-1 space-y-0.5">
              {projectItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-all',
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-dark-700/30'
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 pb-3 border-t border-texflow-800/50">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Organize Tags</span>
            </div>
            <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] text-slate-400 hover:text-white hover:bg-dark-700/30 transition-all">
              <Plus size={14} />
              New tag
            </button>
          </div>
        </nav>

        <div className="px-2 pb-2 space-y-0.5 border-t border-texflow-800/50 pt-2">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-dark-700/30'
                )}
              >
                <item.icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded" style={{ background: '#720455', color: '#f1f5f9' }}>
                    {item.badge}
                  </span>
                )}
                {item.label === 'Help' && (
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                  </svg>
                )}
              </button>
            );
          })}

          <div className="pt-2 mt-1 border-t border-texflow-800/50">
            {token ? (
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ background: 'linear-gradient(135deg, #720455, #910A67)' }}>
                  {getUserInitial()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || ''}</p>
                </div>
                <button onClick={handleLogout} className="p-1 text-slate-400 hover:text-red-400 transition-colors" title="Log out">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-dark-700/30 transition-all"
              >
                <User size={18} />
                Log in / Sign up
              </button>
            )}
          </div>
        </div>
      </aside>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
