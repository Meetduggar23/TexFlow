import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Edit3, Eye, Users, MessageSquare, History, BookOpen, 
  Share2, Cloud, Zap, ArrowRight, ChevronRight,
  Menu, X, Github, Twitter, Mail
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const taglines = [
  'Write. Compile. Create.',
  'Where Code Becomes Documents.',
  'From Code to PDF, Seamlessly.',
];

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
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(var(--color-background-rgb), 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BrandLogo className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold tf-brand"><span className="tf-brand-tex">Tex</span><span className="tf-brand-flow">Flow</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Features</a>
              <a href="#templates" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Templates</a>
              <a href="#how-it-works" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>How It Works</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                Log in
              </button>
              <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all" style={{ background: 'var(--color-accent)' }}>
                Get Started
              </button>
            </div>

            <button 
              className="md:hidden p-2" style={{ color: 'var(--color-text-secondary)' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden animate-slide-down" style={{ background: 'rgba(var(--color-background-rgb), 0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--color-border)' }}>
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2" style={{ color: 'var(--color-text-secondary)' }}>Features</a>
              <a href="#templates" className="block py-2" style={{ color: 'var(--color-text-secondary)' }}>Templates</a>
              <a href="#how-it-works" className="block py-2" style={{ color: 'var(--color-text-secondary)' }}>How It Works</a>
              <hr style={{ borderColor: 'var(--color-border)' }} />
              <button onClick={() => navigate('/login')} className="block w-full text-left py-2" style={{ color: 'var(--color-text-secondary)' }}>Log in</button>
              <button onClick={() => navigate('/dashboard')} className="block w-full text-center px-4 py-2 text-sm font-semibold text-white rounded-lg" style={{ background: 'var(--color-accent)' }}>Get Started</button>
            </div>
          </div>
        )}
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--color-background), var(--color-background))' }} />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: 'rgba(114, 4, 85, 0.1)' }} />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(145, 10, 103, 0.1)' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 animate-fade-in" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>
            <Zap size={14} />
            <span className="transition-opacity duration-500">{taglines[taglineIndex]}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-slide-up" style={{ color: 'var(--color-text-primary)' }}>
            Write, Compile &<br />
            <span className="bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, #720455, #910A67)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Collaborate</span> with LaTeX
          </h1>
          
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ color: 'var(--color-text-secondary)', animationDelay: '0.1s' }}>
            The complete online LaTeX workspace for research papers, theses, reports, 
            CVs, and academic documents. Write professionally, compile instantly. Free to use.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => navigate('/dashboard')} className="px-8 py-3 text-lg font-semibold text-white rounded-lg transition-all flex items-center gap-2" style={{ background: 'var(--color-accent)' }}>
              Start Writing <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/dashboard')} className="px-8 py-3 text-lg font-medium rounded-lg transition-all flex items-center gap-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
              Explore Templates <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-16 mx-auto max-w-5xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="rounded-xl overflow-hidden border shadow-2xl" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F56' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#27C93F' }} />
                </div>
                <span className="text-xs font-mono ml-2" style={{ color: 'var(--color-text-muted)' }}>main.tex — TexFlow Editor</span>
              </div>
              <div className="p-6 text-left font-mono text-sm" style={{ background: 'var(--color-background)' }}>
                <div style={{ color: 'var(--color-text-muted)' }}>{'\\'}documentclass{'{'}article{'}'}</div>
                <div style={{ color: 'var(--color-text-muted)' }}>{'\\'}usepackage{'{'}amsmath{'}'}</div>
                <div style={{ color: 'var(--color-text-muted)' }}>{'\\'}usepackage{'{'}graphicx{'}'}</div>
                <div style={{ color: 'var(--color-accent)' }}>{'\\'}title{'{'}<span style={{ color: 'var(--color-text-primary)' }}>My Research Paper</span>{'}'}</div>
                <div style={{ color: 'var(--color-accent)' }}>{'\\'}author{'{'}<span style={{ color: 'var(--color-text-primary)' }}>Author Name</span>{'}'}</div>
                <div style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>{'\\'}begin{'{'}document{'}'}</div>
                <div style={{ color: 'var(--color-text-secondary)' }}>{'\\'}maketitle</div>
                <div style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>{'\\'}section{'{'}<span style={{ color: 'var(--color-text-primary)' }}>Introduction</span>{'}'}</div>
                <div style={{ color: 'var(--color-text-primary)', paddingLeft: '16px' }}>Welcome to TexFlow — the modern LaTeX platform.</div>
                <div style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>{'\\'}end{'{'}document{'}'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Everything you need for <span className="bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, #720455, #910A67)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>LaTeX</span>
            </h2>
            <p className="text-texflow-600 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              A complete platform for writing, compiling, and collaborating on LaTeX documents. Free to use.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="card group hover:translate-y-[-2px]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110" style={{ background: 'linear-gradient(135deg, rgba(114, 4, 85, 0.15), rgba(145, 10, 103, 0.15))' }}>
                  <feature.icon size={24} style={{ color: 'var(--color-accent)' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              How it <span className="bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, #720455, #910A67)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>works</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Four steps to your perfect document. {taglines[1]}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-extrabold mb-4 opacity-30 bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, #720455, #910A67)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{step.num}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{step.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Start from a <span className="bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, #720455, #910A67)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>template</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Choose from professionally designed templates.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {templateCategories.map((cat, i) => (
              <span key={i} className="px-4 py-2 rounded-full border text-sm cursor-pointer transition-all" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Start your next document with <span className="tf-brand"><span className="tf-brand-tex">Tex</span><span className="tf-brand-flow">Flow</span></span>
          </h2>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            {taglines[2]} Join thousands of researchers, students, and writers using TexFlow every day. It's free.
          </p>
          <button onClick={() => navigate('/dashboard')} className="px-8 py-3 text-lg font-semibold text-white rounded-lg transition-all" style={{ background: 'var(--color-accent)' }}>
            Get Started for Free
          </button>
        </div>
      </section>

      <footer className="py-12" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <BrandLogo className="w-6 h-6 object-contain" />
              <span className="font-bold tf-brand"><span className="tf-brand-tex">Tex</span><span className="tf-brand-flow">Flow</span></span>
            </div>
            
            <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <a href="#features" className="hover:text-texflow-900 transition-colors" style={{ color: 'var(--color-text-muted)' }}>Features</a>
              <a href="#templates" className="hover:text-texflow-900 transition-colors" style={{ color: 'var(--color-text-muted)' }}>Templates</a>
              <a href="#" className="hover:text-texflow-900 transition-colors" style={{ color: 'var(--color-text-muted)' }}>Docs</a>
            </div>
            
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 transition-colors" style={{ color: 'var(--color-text-muted)' }}><Github size={18} /></a>
              <a href="#" className="p-2 transition-colors" style={{ color: 'var(--color-text-muted)' }}><Twitter size={18} /></a>
              <a href="#" className="p-2 transition-colors" style={{ color: 'var(--color-text-muted)' }}><Mail size={18} /></a>
            </div>
          </div>
          
          <div className="text-center text-xs mt-8" style={{ color: 'var(--color-text-muted)' }}>
            TexFlow — {taglines[0]} | Free Collaborative LaTeX Platform
          </div>
        </div>
      </footer>
    </div>
  );
}