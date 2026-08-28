import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="border-t pt-10 mb-10" style={{ borderColor: 'var(--color-border)' }}>
      <h2
        className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Stay Updated
      </h2>
      <p
        className="text-[13px] leading-relaxed mb-5 max-w-md"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Get new TexFlow tutorials, LaTeX tips, and product updates.
      </p>

      {submitted ? (
        <p className="text-[13px] font-medium" style={{ color: 'var(--color-accent)' }}>
          Thanks for subscribing.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-0 max-w-md">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-3 py-2.5 text-[13px] border outline-none"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-[12px] font-medium uppercase tracking-wider border border-l-0 transition-colors"
            style={{
              background: 'var(--color-accent)',
              borderColor: 'var(--color-accent)',
              color: '#fff',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
