'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';

type Tab = 'login' | 'register';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<string | null>;
  onRegister: (name: string, email: string, password: string) => Promise<string | null>;
}

export default function AuthPage({ onLogin, onRegister }: AuthPageProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rName, setRName] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPassword, setRPassword] = useState('');
  const [rConfirm, setRConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const err = await onLogin(email.trim(), password.trim());
    setError(err);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rPassword !== rConfirm) { setError('Passwords do not match.'); return; }
    setLoading(true); setError(null); setSuccess(null);
    const err = await onRegister(rName.trim(), rEmail.trim(), rPassword);
    if (err) { setError(err); } else {
      setSuccess('Registration successful! You can login after admin approval.');
      setRName(''); setREmail(''); setRPassword(''); setRConfirm('');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden" style={{ background: '#06060a' }}>

      {/* ── Animated background orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large primary orb — top left */}
        <div className="orb-1 absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle at 40% 40%, rgba(32,109,247,0.45) 0%, rgba(32,109,247,0.1) 60%, transparent 100%)' }} />
        {/* Medium orb — right center */}
        <div className="orb-2 absolute top-1/2 -right-48 h-[500px] w-[500px] rounded-full blur-[90px]"
          style={{ background: 'radial-gradient(circle at 60% 50%, rgba(32,109,247,0.35) 0%, rgba(32,109,247,0.08) 60%, transparent 100%)' }} />
        {/* Small orb — bottom center */}
        <div className="orb-3 absolute -bottom-20 left-1/3 h-[400px] w-[400px] rounded-full blur-[80px]"
          style={{ background: 'radial-gradient(circle at 50% 60%, rgba(32,109,247,0.28) 0%, transparent 70%)' }} />
        {/* Tiny sparkle dots */}
        <div className="absolute top-24 left-24 h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse" />
        <div className="absolute top-48 right-36 h-1 w-1 rounded-full animate-pulse" style={{ background: '#206df7', opacity: 0.7, animationDelay: '1s' }} />
        <div className="absolute bottom-44 left-16 h-1 w-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-24 right-24 h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#206df7', opacity: 0.5, animationDelay: '0.7s' }} />
        <div className="absolute top-1/3 left-1/4 h-1 w-1 rounded-full bg-white/15 animate-pulse" style={{ animationDelay: '1.8s' }} />
        <div className="absolute top-2/3 right-1/4 h-1 w-1 rounded-full animate-pulse" style={{ background: '#206df7', opacity: 0.4, animationDelay: '0.4s' }} />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 h-20 w-20">
            <div className="absolute inset-0 rounded-2xl blur-md animate-pulse"
              style={{ background: '#206df7', opacity: 0.5, animationDuration: '3s' }} />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #091530 0%, #206df7 100%)', boxShadow: '0 8px 44px rgba(32,109,247,0.55)' }}>
              <Wallet size={36} className="text-white drop-shadow-lg" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Shikor{' '}
            <span style={{ background: 'linear-gradient(90deg, #206df7, rgba(255,255,255,0.95))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Showpno
            </span>{' '}
            Fund
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Manage your fund dashboard by role
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl"
          style={{ background: 'rgba(32,109,247,0.07)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(32,109,247,0.2)', boxShadow: '0 24px 80px rgba(32,109,247,0.2), 0 8px 32px rgba(0,0,0,0.6)' }}
        >
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'rgba(32,109,247,0.15)' }}>
            {(['login', 'register'] as Tab[]).map((t) => (
              <button key={t}
                onClick={() => { setTab(t); setError(null); setSuccess(null); }}
                className="relative flex-1 py-4 text-sm font-semibold transition-all"
                style={{ color: tab === t ? 'white' : 'rgba(255,255,255,0.35)' }}
              >
                {tab === t && (
                  <span className="absolute inset-0" style={{ background: 'rgba(32,109,247,0.15)' }} />
                )}
                <span className="relative">{t === 'login' ? 'Login' : 'Register'}</span>
                {tab === t && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-14 rounded-full"
                    style={{ background: '#206df7', boxShadow: '0 0 8px #206df7' }} />
                )}
              </button>
            ))}
          </div>

          <div className="p-7">
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
                <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                {error && <Alert text={error} type="error" />}
                <Btn loading={loading} label="Login" />
                <div className="mt-4 rounded-2xl p-4 text-xs"
                  style={{ background: 'rgba(32,109,247,0.06)', border: '1px solid rgba(32,109,247,0.12)', color: 'rgba(255,255,255,0.4)' }}
                >
                  <p className="mb-1.5 font-semibold text-white/60">Demo Accounts</p>
                  <div className="space-y-1">
                    <p>Member: member@shikor.com / member123</p>
                    <p>Reviewer: reviewer@shikor.com / reviewer123</p>
                    <p>Admin:&nbsp; admin@shikor.com / admin123</p>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <Field label="Full Name" type="text" value={rName} onChange={setRName} placeholder="Your full name" />
                <Field label="Email" type="email" value={rEmail} onChange={setREmail} placeholder="your@email.com" />
                <Field label="Password" type="password" value={rPassword} onChange={setRPassword} placeholder="At least 6 characters" />
                <Field label="Confirm Password" type="password" value={rConfirm} onChange={setRConfirm} placeholder="Re-enter password" />
                {error && <Alert text={error} type="error" />}
                {success && <Alert text={success} type="success" />}
                <Btn loading={loading} label="Create Account" />
                <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Admin approval required after registration.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder} required
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm text-white transition-all"
        style={{ background: 'rgba(32,109,247,0.08)', border: '1px solid rgba(32,109,247,0.18)', color: 'white' }}
      />
    </div>
  );
}

function Alert({ text, type }: { text: string; type: 'error' | 'success' }) {
  const isOk = type === 'success';
  return (
    <p className="rounded-xl px-4 py-2.5 text-sm font-medium"
      style={isOk
        ? { background: 'rgba(32,109,247,0.12)', border: '1px solid rgba(32,109,247,0.3)', color: 'rgba(255,255,255,0.9)' }
        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,200,200,0.9)' }
      }
    >{text}</p>
  );
}

function Btn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading}
      className="btn-glow btn-primary w-full rounded-xl py-3 font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Please wait...
        </span>
      ) : label}
    </button>
  );
}
