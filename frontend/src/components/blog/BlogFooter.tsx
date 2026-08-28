import { useNavigate } from 'react-router-dom';

export default function BlogFooter() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Product',
      links: [
        { label: 'Projects', action: () => navigate('/dashboard') },
        { label: 'Templates', action: () => navigate('/templates') },
        { label: 'Documentation', action: () => navigate('/documentation') },
      ],
    },
    {
      title: 'Blog',
      links: [
        { label: 'All Articles', action: () => navigate('/blog') },
        { label: 'Tutorials', action: () => navigate('/blog') },
        { label: 'LaTeX', action: () => navigate('/blog') },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', action: () => navigate('/help') },
        { label: 'Contact', action: () => navigate('/contact') },
        { label: 'GitHub', action: () => window.open('https://github.com', '_blank') },
      ],
    },
  ];

  return (
    <footer className="border-t pt-8 pb-6" style={{ borderColor: 'var(--color-border)' }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div>
          <p
            className="text-[13px] font-semibold mb-2 tf-brand"
            style={{ color: 'var(--color-text-primary)' }}
          >
            TexFlow
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Free collaborative LaTeX editor.
          </p>
        </div>

        {/* Link sections */}
        {sections.map((section) => (
          <div key={section.title}>
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {section.title}
            </p>
            <ul className="space-y-1.5">
              {section.links.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-[12px] transition-colors"
                    style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: 0 }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = 'var(--color-text-secondary)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'var(--color-text-muted)')
                    }
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div
        className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <span>&copy; {new Date().getFullYear()} TexFlow. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {}}
            className="transition-colors"
            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: 0 }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'var(--color-text-secondary)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'var(--color-text-muted)')
            }
          >
            Privacy
          </button>
          <button
            onClick={() => {}}
            className="transition-colors"
            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: 0 }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'var(--color-text-secondary)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'var(--color-text-muted)')
            }
          >
            Terms
          </button>
        </div>
      </div>
    </footer>
  );
}
