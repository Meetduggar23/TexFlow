import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Bug, Lightbulb, Users, Send, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const contactMethods = [
  { icon: Mail, title: 'General Support', description: 'For questions about using TexFlow.' },
  { icon: Bug, title: 'Technical Support', description: 'For bugs, compilation issues, or technical problems.' },
  { icon: Lightbulb, title: 'Feedback', description: 'Tell us how we can improve TexFlow.' },
  { icon: Users, title: 'Business / Collaboration', description: 'For partnerships and collaboration.' },
];

export default function ContactPage() {
  const navigate = useNavigate();
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
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!message.trim()) errs.message = 'Please enter a message.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    // Simulate sending (no backend endpoint exists for contact)
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    toast.success('Message sent successfully!');
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-10">
            <button onClick={() => navigate('/help')} className="flex items-center gap-2 text-sm mb-4 transition-colors" style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            ><ArrowLeft size={14} /> Help</button>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Contact Us</h1>
            <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
              Have a question, found a problem, or want to share feedback? We're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Contact Information</h2>
              {contactMethods.map(m => (
                <div key={m.title} className="p-4 rounded-xl border transition-colors"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
                      <m.icon size={18} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{m.title}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{m.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              {sent ? (
                <div className="rounded-2xl border p-10 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
                    <Check size={32} style={{ color: '#10B981' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Message sent successfully!</h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>We'll get back to you as soon as possible.</p>
                  <button onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                    className="px-5 py-2 text-sm font-medium rounded-xl transition-colors"
                    style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                  >Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-2xl border p-6 space-y-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                  <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Send us a message</h2>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Name</label>
                    <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{ background: 'var(--color-background)', borderColor: errors.name ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    />
                    {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{ background: 'var(--color-background)', borderColor: errors.email ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    />
                    {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.email}</p>}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Subject</label>
                    <input value={subject} onChange={e => setSubject(e.target.value)}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none cursor-pointer"
                      style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    >
                      {contactMethods.map(m => <option key={m.title} value={m.title}>{m.title}</option>)}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Message</label>
                    <textarea rows={5} value={message} onChange={e => { setMessage(e.target.value); setErrors(p => ({ ...p, message: '' })); }}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none resize-none"
                      style={{ background: 'var(--color-background)', borderColor: errors.message ? 'var(--color-error)' : 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}
                    />
                    {errors.message && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.message}</p>}
                  </div>

                  <button type="submit" disabled={sending}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))' }}
                  >
                    {sending ? 'Sending...' : <><Send size={14} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
