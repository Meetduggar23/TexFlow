import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Clock, Users, BookOpen, Trash2, Settings, HelpCircle, LogOut } from 'lucide-react';
import clsx from 'clsx';

const topItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: FolderOpen, label: 'All Projects', path: '/dashboard/projects' },
  { icon: Clock, label: 'Recent', path: '/dashboard/recent' },
  { icon: Users, label: 'Shared With Me', path: '/dashboard/shared' },
  { icon: BookOpen, label: 'Templates', path: '/templates' },
  { icon: Trash2, label: 'Trash', path: '/dashboard/trash' },
];

const bottomItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help', path: '/help' },
];

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-64 h-full flex flex-col border-r border-texflow-800" style={{ background: '#030637' }}>
      <div className="p-4 border-b border-texflow-800">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="TexFlow" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold text-white">Tex<span className="gradient-text">Flow</span></span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {topItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              )}
              style={isActive ? { background: 'linear-gradient(135deg, rgba(114,4,85,0.3), rgba(145,10,103,0.2))' } : {}}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-texflow-800 space-y-1">
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
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              )}
              style={isActive ? { background: 'linear-gradient(135deg, rgba(114,4,85,0.3), rgba(145,10,103,0.2))' } : {}}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
        
        <div className="flex items-center gap-3 px-3 py-2 mt-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ background: 'linear-gradient(135deg, #720455, #910A67)' }}>
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">User</p>
            <p className="text-xs text-slate-500 truncate">user@texflow.com</p>
          </div>
          <button onClick={handleLogout} className="p-1 text-slate-400 hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
