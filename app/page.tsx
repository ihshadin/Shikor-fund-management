'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';
import AuthPage from '@/components/AuthPage';
import DashboardShell from '@/components/DashboardShell';
import MemberDashboard from '@/components/MemberDashboard';
import ReviewerDashboard from '@/components/ReviewerDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { MemberInfo, PaymentRecord, UserSession } from '@/types';
import { getCurrentMonthBn } from '@/utils/format';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [reviewers, setReviewers] = useState<UserSession[]>([]);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Theme ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const s = localStorage.getItem('shikor-theme') as 'light' | 'dark' | null;
    if (s) setTheme(s);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('shikor-theme', theme);
  }, [theme]);

  // ── Session restore ────────────────────────────────────────────────────────
  useEffect(() => {
    const s = localStorage.getItem('shikor-user');
    if (s) setCurrentUser(JSON.parse(s));
    setAuthLoading(false);
  }, []);

  // ── Load payments ──────────────────────────────────────────────────────────
  const loadPayments = useCallback(async () => {
    try { setPayments(await api.getPayments()); } catch { /* silent */ }
  }, []);

  const loadAdminData = useCallback(async () => {
    try {
      const [rRes, mRes] = await Promise.all([
        api.getReviewers(),
        api.getMembers(),
      ]);
      setReviewers(rRes);
      setMembers(mRes);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!currentUser) { setPayments([]); return; }
    loadPayments();
    if (currentUser.role === 'admin') loadAdminData();
    if (currentUser.isReviewer) {
      api.getReviewers().then(setReviewers).catch(() => {});
    }
  }, [currentUser, loadPayments, loadAdminData]);

  usePolling(loadPayments, 10_000, !!currentUser);
  usePolling(loadAdminData, 15_000, !!currentUser && currentUser.role === 'admin');

  // ── Auth ───────────────────────────────────────────────────────────────────
  const handleLogin = async (email: string, password: string): Promise<string | null> => {
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem('shikor-token', token);
      localStorage.setItem('shikor-user', JSON.stringify(user));
      setCurrentUser(user);
      return null;
    } catch (err: unknown) { return err instanceof Error ? err.message : 'Login failed. Please try again.'; }
  };

  const handleRegister = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      await api.register(name, email, password);
      return null;
    } catch (err: unknown) { return err instanceof Error ? err.message : 'Registration failed. Please try again.'; }
  };

  const handleLogout = () => {
    setCurrentUser(null); setPayments([]); setReviewers([]); setMembers([]);
    localStorage.removeItem('shikor-token'); localStorage.removeItem('shikor-user');
  };

  // ── Payment actions ────────────────────────────────────────────────────────
  const submitPayment = async (payload: Omit<PaymentRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const p = await api.submitPayment(payload);
    setPayments((prev) => [p, ...prev]);
  };

  const updatePaymentStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    const updated = await api.updatePaymentStatus(id, status);
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // ── Admin actions ──────────────────────────────────────────────────────────
  const handleApproveMember = async (id: string) => {
    try {
      await api.updateMember(id, { status: 'active' });
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, status: 'active' } : m));
    } catch { /* silent */ }
  };

  const handleRejectMember = async (id: string) => {
    try {
      await api.updateMember(id, { status: 'rejected' });
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch { /* silent */ }
  };

  const handleToggleReviewer = async (id: string, isReviewer: boolean) => {
    try {
      await api.updateMember(id, { isReviewer });
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, isReviewer } : m));
      await loadAdminData(); // refresh reviewers list
    } catch { /* silent */ }
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const memberPayments   = useMemo(() => payments.filter((p) => p.userId === currentUser?.id), [payments, currentUser]);
  const pendingRequests  = useMemo(() => payments.filter((p) => p.status === 'Pending'),  [payments]);
  const approvedPayments = useMemo(() => payments.filter((p) => p.status === 'Approved'), [payments]);
  const rejectedPayments = useMemo(() => payments.filter((p) => p.status === 'Rejected'), [payments]);
  const pendingMembers   = useMemo(() => members.filter((m) => m.status === 'pending'),   [members]);

  const currentMonth = getCurrentMonthBn();
  const currentYear  = new Date().getFullYear();
  const currentMonthStatus = memberPayments.find(
    (p) => p.year === currentYear && p.months.includes(currentMonth)
  )?.status;

  // ── Render ─────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b18]">
        <div className="orb-1 absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full blur-[80px]" style={{ background: 'radial-gradient(circle, rgba(15,205,161,0.3) 0%, rgba(32,109,247,0.15) 100%)' }} />
        <div className="orb-2 absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-[80px]" style={{ background: 'radial-gradient(circle, rgba(32,109,247,0.25) 0%, rgba(15,205,161,0.12) 100%)' }} />
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-2xl blur-sm opacity-60 animate-pulse" style={{ background: 'linear-gradient(135deg, #0fcda1, #206df7)' }} />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #0fcda1, #206df7)' }}>
              <span className="text-2xl text-white font-bold">S</span>
            </div>
          </div>
          <div className="h-8 w-8 animate-spin rounded-full border-white/20" style={{ borderWidth: '3px', borderStyle: 'solid', borderTopColor: '#0fcda1' }} />
          <p className="text-white/50 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;

  return (
    <DashboardShell currentUser={currentUser} onLogout={handleLogout} theme={theme} setTheme={setTheme}>
      {currentUser.role === 'member' && !currentUser.isReviewer && (
        <MemberDashboard
          currentUser={currentUser}
          payments={memberPayments}
          currentMonthStatus={currentMonthStatus}
          onSubmit={submitPayment}
        />
      )}
      {currentUser.role === 'member' && currentUser.isReviewer && (
        <ReviewerDashboard
          currentUser={currentUser}
          payments={payments}
          memberPayments={memberPayments}
          pendingRequests={pendingRequests}
          approvedPayments={approvedPayments}
          rejectedPayments={rejectedPayments}
          currentMonthStatus={currentMonthStatus}
          onApprove={(id) => updatePaymentStatus(id, 'Approved')}
          onReject={(id)  => updatePaymentStatus(id, 'Rejected')}
          onSubmit={submitPayment}
        />
      )}
      {currentUser.role === 'admin' && (
        <AdminDashboard
          currentUser={currentUser}
          members={members}
          pendingMembers={pendingMembers}
          reviewers={reviewers}
          onApproveMember={handleApproveMember}
          onRejectMember={handleRejectMember}
          onToggleReviewer={handleToggleReviewer}
          approvedPayments={approvedPayments}
          allPayments={payments}
          onSubmit={submitPayment}
        />
      )}
    </DashboardShell>
  );
}
