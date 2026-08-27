import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Edit3, Eye, Users, MessageSquare, History, BookOpen, 
  Share2, Cloud, Zap, ArrowRight, ChevronRight,
  Menu, X, Github, Twitter, Mail
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const features = [
  { icon: Edit3, title: 'Online LaTeX Editor', desc: 'Professional code editor with syntax highlighting, autocomplete, and LaTeX commands.' },
  { icon: Eye, title: 'Real-Time PDF Preview', desc: 'See your compiled PDF instantly as you write. Forward and inverse search.' },
  { icon: Users, title: 'Real-Time Collaboration', desc: 'Work together with your team. See cursors, edits, and presence in real-time.' },
  { icon: MessageSquare, title: 'Comments & Review', desc: 'Add comments, reply, resolve, and track changes across your documents.' },
  { icon: History, title: 'Version History', desc: 'Track every change. Compare versions. Restore to any point in time.' },
  { icon: BookOpen, title: 'Templates', desc: 'Start from templates for papers, theses, CVs, books, and presentations.' },
  { icon: Share2, title: 'Project Sharing', desc: 'Share projects with viewers, commenters, or editors. Generate share links.' },
  { icon: Cloud, title: 'Cloud Storage', desc: 'Your projects are safely stored in the cloud. Access from anywhere.' },
  { icon: Zap, title: 'Fast Compilation', desc: 'Optimized compilation pipeline. Supports pdfLaTeX, XeLaTeX, and LuaLaTeX.' },
];

const templateCategories = [
  'Academic Papers', 'Research Papers', 'Thesis', 'Dissertation', 
  'CV / Resume', 'Books', 'Reports', 'Presentations',
  'Journal Articles', 'Conference Papers', 'Cover Letters', 'Lab Reports'
];

const steps = [
  { num: '01', title: 'Write', desc: 'Write your LaTeX document in our professional editor with smart suggestions.' },
  { num: '02', title: 'Compile', desc: 'Compile your document with a single click. Choose your preferred engine.' },
  { num: '03', title: 'Collaborate', desc: 'Share with collaborators. Comment, suggest, and track changes together.' },
  { num: '04', title: 'Publish', desc: 'Download your PDF or share directly. Your document is ready for the world.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BrandLogo className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-texflow-900">Tex<span className="gradient-text">Flow</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-texflow-700 hover:text-texflow-900 transition-colors">Features</a>
              <a href="#templates" className="text-sm text-texflow-700 hover:text-texflow-900 transition-colors">Templates</a>
              <a href="#how-it-works" className="text-sm text-texflow-700 hover:text-texflow-900 transition-colors">How It Works</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => navigate('/login')} className="btn-ghost text-sm">Log in</button>
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">Get Started</button>
            </div>

            <button 
              className="md:hidden p-2 text-texflow-700 hover:text-texflow-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-texflow-800 animate-slide-down">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-texflow-700 hover:text-texflow-900 py-2">Features</a>
              <a href="#templates" className="block text-texflow-700 hover:text-texflow-900 py-2">Templates</a>
              <a href="#how-it-works" className="block text-texflow-700 hover:text-texflow-900 py-2">How It Works</a>
              <hr className="border-texflow-800" />
              <button onClick={() => navigate('/login')} className="block w-full text-left text-texflow-700 hover:text-texflow-900 py-2">Log in</button>
              <button onClick={() => navigate('/dashboard')} className="block w-full btn-primary text-center">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-texflow-900/50 to-dark-900" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-texflow-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-texflow-500/10 rounded-full blur-[100px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-texflow-700 bg-texflow-900/50 text-texflow-300 text-sm mb-8 animate-fade-in">
            <Zap size={14} />
            Free LaTeX writing platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-texflow-900 mb-6 leading-tight animate-slide-up">
            Write, Compile &<br />
            <span className="gradient-text">Collaborate</span> with LaTeX
          </h1>
          
          <p className="text-lg md:text-xl text-texflow-600 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            The complete online LaTeX workspace for research papers, theses, reports, 
            CVs, and academic documents. Write professionally, compile instantly. Free to use.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              Start Writing <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary text-lg px-8 py-3 flex items-center gap-2">
              Explore Templates <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-16 mx-auto max-w-5xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="rounded-xl overflow-hidden border border-texflow-800 shadow-2xl shadow-texflow-900/50">
              <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 border-b border-texflow-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-texflow-500 ml-2 font-mono">main.tex — TexFlow Editor</span>
              </div>
              <div className="bg-dark-900 p-6 text-left font-mono text-sm">
                <div className="text-texflow-500">{'\\'}documentclass{'{'}article{'}'}</div>
                <div className="text-texflow-500">{'\\'}usepackage{'{'}amsmath{'}'}</div>
                <div className="text-texflow-500">{'\\'}usepackage{'{'}graphicx{'}'}</div>
                <div className="text-texflow-400">{'\\'}title{'{'}<span className="text-texflow-900">My Research Paper</span>{'}'}</div>
                <div className="text-texflow-400">{'\\'}author{'{'}<span className="text-texflow-900">Author Name</span>{'}'}</div>
                <div className="text-texflow-400 mt-2">{'\\'}begin{'{'}document{'}'}</div>
                <div className="text-texflow-400">{'\\'}maketitle</div>
                <div className="text-texflow-400 mt-2">{'\\'}section{'{'}<span className="text-texflow-900">Introduction</span>{'}'}</div>
                <div className="text-texflow-900 pl-4">Welcome to TexFlow — the modern LaTeX platform.</div>
                <div className="text-texflow-400 mt-2">{'\\'}end{'{'}document{'}'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-texflow-900 mb-4">
              Everything you need for <span className="gradient-text">LaTeX</span>
            </h2>
            <p className="text-texflow-600 max-w-2xl mx-auto">
              A complete platform for writing, compiling, and collaborating on LaTeX documents. Free to use.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="card group hover:translate-y-[-2px]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, rgba(245,175,175,0.2), rgba(232,149,149,0.2))' }}>
                  <feature.icon size={24} className="text-texflow-400" />
                </div>
                <h3 className="text-lg font-semibold text-texflow-900 mb-2">{feature.title}</h3>
                <p className="text-texflow-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-texflow-900 mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-texflow-600">Four steps to your perfect document.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-extrabold gradient-text mb-4 opacity-30">{step.num}</div>
                <h3 className="text-xl font-bold text-texflow-900 mb-2">{step.title}</h3>
                <p className="text-texflow-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-texflow-900 mb-4">
              Start from a <span className="gradient-text">template</span>
            </h2>
            <p className="text-texflow-600">Choose from professionally designed templates.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {templateCategories.map((cat, i) => (
              <span key={i} className="px-4 py-2 rounded-full border border-texflow-700 bg-texflow-900/30 text-texflow-300 text-sm hover:bg-texflow-800/50 hover:border-texflow-600 transition-all cursor-pointer">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-texflow-900 mb-4">
            Start your next document with <span className="gradient-text">TexFlow</span>
          </h2>
          <p className="text-texflow-600 mb-8">
            Join thousands of researchers, students, and writers using TexFlow every day. It's free.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary text-lg px-8 py-3">
            Get Started for Free
          </button>
        </div>
      </section>

      <footer className="border-t border-texflow-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <BrandLogo className="w-6 h-6 object-contain" />
              <span className="font-bold text-texflow-900">Tex<span className="gradient-text">Flow</span></span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-texflow-600">
              <a href="#features" className="hover:text-texflow-900 transition-colors">Features</a>
              <a href="#templates" className="hover:text-texflow-900 transition-colors">Templates</a>
              <a href="#" className="hover:text-texflow-900 transition-colors">Docs</a>
            </div>
            
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 text-texflow-600 hover:text-texflow-900 transition-colors"><Github size={18} /></a>
              <a href="#" className="p-2 text-texflow-600 hover:text-texflow-900 transition-colors"><Twitter size={18} /></a>
              <a href="#" className="p-2 text-texflow-600 hover:text-texflow-900 transition-colors"><Mail size={18} /></a>
            </div>
          </div>
          
          <div className="text-center text-xs text-texflow-500 mt-8">
            TexFlow - Free Collaborative LaTeX Platform
          </div>
        </div>
      </footer>
    </div>
  );
}
