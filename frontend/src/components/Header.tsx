import { Link } from 'react-router-dom';
import { Github, Settings, Bell } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Header() {
  return (
    <header className="h-14 border-b border-texflow-800 bg-dark-900/80 backdrop-blur-sm flex items-center px-4">
      <Link to="/" className="flex items-center gap-2">
        <BrandLogo className="w-8 h-8 object-contain" />
        <span className="text-lg font-bold tf-brand"><span className="tf-brand-tex">Tex</span><span className="tf-brand-flow">Flow</span></span>
      </Link>

      <nav className="ml-8 flex items-center gap-1">
        <Link
          to="/"
          className="px-3 py-1.5 text-sm text-texflow-700 hover:text-texflow-900 hover:bg-texflow-200 rounded-lg transition-colors"
        >
          Projects
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button className="p-2 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded-lg transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-texflow-500 rounded-full" />
        </button>
        <a
          href="https://github.com/Meetduggar23/TexFlow"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded-lg transition-colors"
        >
          <Github size={18} />
        </a>
        <button className="p-2 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded-lg transition-colors">
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-texflow-900 text-sm font-medium" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}>
          U
        </div>
      </div>
    </header>
  );
}
