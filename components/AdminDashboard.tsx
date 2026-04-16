'use client';

import { useMemo, useState } from 'react';
import { LayoutDashboard, CreditCard, Users, Download, PlusCircle, CheckCircle, XCircle, Crown } from 'lucide-react';
import { MemberInfo, PaymentRecord, UserSession } from '@/types';
import TabNav, { TabDef } from './TabNav';
import PaymentTable from './PaymentTable';
import PaymentForm from './PaymentForm';
import ExportButton from './ExportButton';
import { formatCurrency, getCurrentMonthBn } from '@/utils/format';

interface AdminDashboardProps {
  currentUser: UserSession;
  members: MemberInfo[];
  pendingMembers: MemberInfo[];
  reviewers: UserSession[];
  onApproveMember: (id: string) => void;
  onRejectMember: (id: string) => void;
  onToggleReviewer: (id: string, isReviewer: boolean) => void;
  approvedPayments: PaymentRecord[];
  allPayments: PaymentRecord[];
  onSubmit: (payload: Omit<PaymentRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function AdminDashboard({
  currentUser, members, pendingMembers, reviewers,
  onApproveMember, onRejectMember, onToggleReviewer,
  approvedPayments, allPayments, onSubmit,
}: AdminDashboardProps) {
  const [tab, setTab] = useState('dashboard');

  const TABS: TabDef[] = [
    { id: 'dashboard', label: 'Dashboard',          shortLabel: 'Home',    icon: LayoutDashboard },
    { id: 'payments',  label: 'All Payments',        shortLabel: 'Payments',icon: CreditCard },
    { id: 'members',   label: 'Member Management',   shortLabel: 'Members', icon: Users, badge: pendingMembers.length },
    { id: 'submit',    label: 'Submit',              shortLabel: 'Submit',  icon: PlusCircle },
    { id: 'export',    label: 'Export',              shortLabel: 'Export',  icon: Download },
  ];

  const year = new Date().getFullYear();
  const currentMonth = getCurrentMonthBn();
  const totalFund     = useMemo(() => approvedPayments.reduce((s, p) => s + p.amount, 0), [approvedPayments]);
  const thisMonthTotal= useMemo(
    () => approvedPayments.filter((p) => p.year === year && p.months.includes(currentMonth)).reduce((s, p) => s + p.amount, 0),
    [approvedPayments, year, currentMonth]
  );
  const pendingCount  = useMemo(() => allPayments.filter((p) => p.status === 'Pending').length, [allPayments]);
  const activeMembers = useMemo(() => members.filter((m) => m.status === 'active').length, [members]);

  return (
    <div className="animate-fade-in">
      <TabNav tabs={TABS} active={tab} onChange={setTab} />

      {/* ── Dashboard ── */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Fund"     value={formatCurrency(totalFund)}      sub="All time"     solid />
            <StatCard label="This Month"     value={formatCurrency(thisMonthTotal)} sub={currentMonth} />
            <StatCard label="Pending"        value={`${pendingCount}`}              sub="Needs review" />
            <StatCard label="Active Members" value={`${activeMembers}`}             sub={`${pendingMembers.length} pending`} solid />
          </div>

          {/* Reviewers */}
          <div className="glass-card rounded-lg p-5 hover-lift">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-white/60">
              <Crown size={15} style={{ color: '#206df7' }} /> Reviewers ({reviewers.length})
            </p>
            {reviewers.length === 0 ? (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No reviewers assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {reviewers.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg p-3"
                    style={{ background: 'rgba(32,109,247,0.08)', border: '1px solid rgba(32,109,247,0.2)' }}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #091530 0%, #206df7 100%)', boxShadow: '0 4px 14px rgba(32,109,247,0.45)' }}
                    >{r.name[0]}</div>
                    <div>
                      <p className="font-bold text-white">{r.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{r.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pendingMembers.length > 0 && (
            <div className="rounded-lg border p-4"
              style={{ background: 'rgba(32,109,247,0.08)', borderColor: 'rgba(32,109,247,0.25)' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-white/80">⚠ {pendingMembers.length} new member{pendingMembers.length !== 1 ? 's' : ''} awaiting approval</p>
                <button onClick={() => setTab('members')} className="text-xs font-semibold underline" style={{ color: '#206df7' }}>View →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <PaymentTable title={`All Payments`} payments={allPayments} />
      )}

      {/* ── Members ── */}
      {tab === 'members' && (
        <div className="space-y-5">
          {pendingMembers.length > 0 && (
            <div className="glass-card rounded-lg p-5">
              <p className="mb-3 text-sm font-bold text-white/80">New Registrations ({pendingMembers.length})</p>
              <div className="space-y-2">
                {pendingMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg px-4 py-3"
                    style={{ background: 'rgba(32,109,247,0.07)', border: '1px solid rgba(32,109,247,0.18)' }}
                  >
                    <div>
                      <p className="font-semibold text-white">{m.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onApproveMember(m.id)}
                        className="btn-glow btn-primary flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                      ><CheckCircle size={12} /> Approve</button>
                      <button onClick={() => onRejectMember(m.id)}
                        className="btn-glow flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                      ><XCircle size={12} /> Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card rounded-lg p-5">
            <p className="mb-4 text-sm font-bold text-white/80">
              All Members ({members.filter(m => m.status === 'active' && m.role !== 'admin').length} active)
            </p>
            <div className="space-y-2">
              {members.filter((m) => m.status === 'active' && m.role !== 'admin').map((m) => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-3 hover-lift"
                  style={{ background: 'rgba(32,109,247,0.06)', border: '1px solid rgba(32,109,247,0.12)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, #091530 0%, #206df7 100%)', boxShadow: '0 2px 10px rgba(32,109,247,0.35)' }}
                    >{m.name[0]}</div>
                    <div>
                      <p className="font-semibold text-white">{m.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold capitalize" style={{ color: m.role === 'admin' ? '#206df7' : 'rgba(255,255,255,0.35)' }}>
                      {m.role}{m.isReviewer ? ' · Reviewer' : ''}
                    </span>
                    {m.id !== currentUser.id && m.role !== 'admin' && (
                      <button onClick={() => onToggleReviewer(m.id, !m.isReviewer)}
                        className="rounded-lg px-2.5 py-1 text-xs font-bold transition-all"
                        style={m.isReviewer
                          ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }
                          : { background: 'rgba(32,109,247,0.15)', border: '1px solid rgba(32,109,247,0.3)', color: 'white' }}
                      >{m.isReviewer ? '− Remove Reviewer' : '+ Set Reviewer'}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'submit' && <PaymentForm currentUser={currentUser} onSubmit={onSubmit} />}
      {tab === 'export' && <ExportButton payments={allPayments} />}
    </div>
  );
}

function StatCard({ label, value, sub, solid }: { label: string; value: string; sub: string; solid?: boolean }) {
  return (
    <div className="hover-lift relative overflow-hidden rounded-lg p-4 text-white"
      style={solid ? {
        background: 'linear-gradient(135deg, #091530 0%, #206df7 100%)',
        boxShadow: '0 6px 28px rgba(32,109,247,0.4)',
      } : {
        background: 'rgba(32,109,247,0.1)',
        border: '1px solid rgba(32,109,247,0.22)',
        boxShadow: '0 4px 20px rgba(32,109,247,0.1)',
      }}
    >
      {solid && <div className="absolute inset-0 shimmer-bg opacity-25" />}
      <p className="relative text-[11px] font-semibold uppercase tracking-wide text-white/65">{label}</p>
      <p className={`relative mt-1.5 font-bold leading-tight ${value.length > 8 ? 'text-lg' : 'text-2xl'}`}>{value}</p>
      <p className="relative mt-1 text-xs text-white/50">{sub}</p>
    </div>
  );
}
