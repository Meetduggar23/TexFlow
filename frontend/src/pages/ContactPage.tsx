import { useState } from 'react';
import { Mail, Bug, Lightbulb, Users, Send, Check, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const contactMethods = [
  { icon: Mail, title: 'General Support', description: 'Questions about using TexFlow.' },
  { icon: Bug, title: 'Technical Support', description: 'Bugs, compilation issues, or technical problems.' },
  { icon: Lightbulb, title: 'Feedback', description: 'Tell us how we can improve TexFlow.' },
  { icon: Users, title: 'Business / Collaboration', description: 'Partnerships and collaboration opportunities.' },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Support');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Please enter your name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email.';
    if (!message.trim()) errs.message = 'Please enter a message.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, category, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setSending(false);
      setSent(true);
      toast.success('Message sent successfully!');
    } catch (err: any) {
      setSending(false);
      toast.error(err.message || 'Failed to send message');
    }
  };

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Contact Us</h1>
          <p className="text-[14px] md:text-[15px]" style={{ color: 'var(--color-text-muted)' }}>
            Need help with TexFlow? Have feedback or found a problem? Send us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Get in Touch</h2>
            {contactMethods.map(m => (
              <div key={m.title} className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent-soft)' }}>
                  <m.icon size={16} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>{m.title}</p>
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{m.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
                  <Check size={24} style={{ color: 'var(--color-accent)' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Message sent successfully!</h3>
                <p className="text-[13px] mb-6" style={{ color: 'var(--color-text-muted)' }}>Thanks for contacting TexFlow. We'll get back to you soon.</p>
                <button onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                  className="px-4 py-2 text-[13px] font-medium rounded-lg transition-colors"
                  style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                >Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={16} style={{ color: 'var(--color-accent)' }} />
                  <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>Send us a message</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Name</label>
                    <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                      className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ background: 'var(--color-background)', borderColor: errors.name ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    />
                    {errors.name && <p className="text-[11px] mt-1" style={{ color: 'var(--color-error)' }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                      className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ background: 'var(--color-background)', borderColor: errors.email ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    />
                    {errors.email && <p className="text-[11px] mt-1" style={{ color: 'var(--color-error)' }}>{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Subject</label>
                    <input value={subject} onChange={e => setSubject(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none cursor-pointer"
                      style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    >
                      {contactMethods.map(m => <option key={m.title} value={m.title}>{m.title}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Message</label>
                  <textarea rows={5} value={message} onChange={e => { setMessage(e.target.value); setErrors(p => ({ ...p, message: '' })); }}
                    className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none resize-none"
                    style={{ background: 'var(--color-background)', borderColor: errors.message ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                  />
                  {errors.message && <p className="text-[11px] mt-1" style={{ color: 'var(--color-error)' }}>{errors.message}</p>}
                </div>

                <button type="submit" disabled={sending}
                  className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-white rounded-lg transition-all disabled:opacity-50"
                  style={{ background: 'var(--color-accent)' }}
                  onMouseEnter={e => { if (!sending) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
                  onMouseLeave={e => { if (!sending) e.currentTarget.style.background = 'var(--color-accent)'; }}
                >
                  {sending ? 'Sending...' : <><Send size={14} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
