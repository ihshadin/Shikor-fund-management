'use client';

import { ReactNode } from 'react';
import { LogOut, Moon, Sun, Wallet } from 'lucide-react';
import { UserSession } from '@/types';

function getDashboardLabel(user: UserSession) {
  if (user.role === 'admin') return 'Admin Panel';
  if (user.isReviewer) return 'Reviewer Dashboard';
  return 'Member Dashboard';
}

interface DashboardShellProps {
  currentUser: UserSession;
  onLogout: () => void;
  theme: 'light' | 'dark';
  setTheme: (m: 'light' | 'dark') => void;
  children: ReactNode;
}

export default function DashboardShell({ currentUser, onLogout, theme, setTheme, children }: DashboardShellProps) {
  const isDark = theme === 'dark';

  return (
    <div className="relative min-h-screen overflow-x-hidden"
      style={{ background: isDark
        ? 'linear-gradient(160deg, #030508 0%, #060c1a 45%, #04080f 100%)'
        : 'linear-gradient(160deg, #eef2ff 0%, #f0f4ff 50%, #e8efff 100%)'
      }}
    >
      {/* ── Fixed animated background orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="orb-1 absolute -top-48 -left-48 h-[700px] w-[700px] rounded-full blur-[120px]"
          style={{ background: `radial-gradient(circle at 40% 40%, rgba(32,109,247,${isDark ? '0.3' : '0.2'}) 0%, transparent 70%)` }} />
        <div className="orb-2 absolute top-1/3 -right-60 h-[600px] w-[600px] rounded-full blur-[110px]"
          style={{ background: `radial-gradient(circle at 60% 50%, rgba(32,109,247,${isDark ? '0.22' : '0.15'}) 0%, transparent 70%)` }} />
        <div className="orb-3 absolute -bottom-24 left-1/4 h-[500px] w-[500px] rounded-full blur-[100px]"
          style={{ background: `radial-gradient(circle at 50% 60%, rgba(32,109,247,${isDark ? '0.18' : '0.12'}) 0%, transparent 70%)` }} />
        {/* Subtle grid texture in dark */}
        {isDark && (
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(rgba(32,109,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(32,109,247,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        )}
      </div>

      {/* ── Header ── */}
      <header className="relative z-10"
        style={{
          // background: isDark ? 'rgba(4,8,20,0.55)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #091530 0%, #206df7 100%)', boxShadow: '0 4px 16px rgba(32,109,247,0.5)' }}
            >
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b' }}>
                Shikor Showpno Fund
              </p>
              <p className="text-sm font-bold leading-tight" style={{ color: isDark ? 'white' : '#0f172a' }}>{getDashboardLabel(currentUser)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center rounded-full px-3 py-1 text-xs font-bold sm:flex"
              style={{ background: 'linear-gradient(135deg, #091530 0%, #206df7 100%)', color: 'white', boxShadow: '0 2px 10px rgba(32,109,247,0.4)' }}
            >{currentUser.name}</span>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:scale-105"
              style={{ background: 'rgba(32,109,247,0.15)', border: '1px solid rgba(32,109,247,0.25)', color: isDark ? 'white' : '#0f172a' }}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={onLogout}
              className="btn-glow btn-primary flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-white"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Welcome strip ── */}
      <div className="relative z-10 px-4 py-2 sm:px-6"
        style={{
          background: isDark ? 'rgba(32,109,247,0.02)' : 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-5">
          <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#475569' }}>
            Welcome,{' '}
            <span className="font-bold text-[#206df7]">{currentUser.name}</span>
          </p>
          <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }}>
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="relative z-10 mx-auto max-w-7xl px-3 py-4 pb-24 sm:px-5 sm:py-5 sm:pb-5">
        {children}
      </main>
    </div>
  );
}
