import { Link } from 'react-router-dom';
import { Github, Settings, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-14 border-b border-texflow-800 bg-dark-900/80 backdrop-blur-sm flex items-center px-4">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="TexFlow" className="w-8 h-8 object-contain" />
        <span className="text-lg font-bold text-white">Tex<span className="gradient-text">Flow</span></span>
      </Link>

      <nav className="ml-8 flex items-center gap-1">
        <Link
          to="/"
          className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          Projects
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-texflow-500 rounded-full" />
        </button>
        <a
          href="https://github.com/Meetduggar23/TexFlow"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <Github size={18} />
        </a>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #720455, #910A67)' }}>
          U
        </div>
      </div>
    </header>
  );
}
