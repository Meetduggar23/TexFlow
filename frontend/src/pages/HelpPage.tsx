import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, PenLine, ArrowRight } from 'lucide-react';

const cards = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Learn how to use TexFlow — from getting started to advanced LaTeX features.',
    link: '/documentation',
    gradient: 'linear-gradient(135deg, #FF4C29, #FF6345)',
  },
  {
    icon: Mail,
    title: 'Contact Us',
    description: 'Have a question, found a problem, or want to share feedback? We\'re here to help.',
    link: '/contact',
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
  },
  {
    icon: PenLine,
    title: 'Blog',
    description: 'Stay updated with TexFlow news, tutorials, LaTeX tips, and product updates.',
    link: '/blog',
    gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
  },
];

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
              <BookOpen size={32} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Help & Resources</h1>
            <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Everything you need to get the most out of TexFlow.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <button
                key={card.title}
                onClick={() => navigate(card.link)}
                className="text-left rounded-2xl border p-6 transition-all group"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: card.gradient }}>
                  <card.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{card.title}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{card.description}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: 'var(--color-accent)' }}>
                  Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
