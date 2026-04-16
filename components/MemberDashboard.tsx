'use client';

import { useMemo, useState } from 'react';
import { LayoutDashboard, CreditCard, PlusCircle } from 'lucide-react';
import { PaymentRecord, UserSession } from '@/types';
import PaymentForm from './PaymentForm';
import PaymentTable from './PaymentTable';
import TabNav, { TabDef } from './TabNav';
import { badgeClass, formatCurrency } from '@/utils/format';

interface MemberDashboardProps {
  currentUser: UserSession;
  payments: PaymentRecord[];
  currentMonthStatus?: PaymentRecord['status'];
  onSubmit: (payload: Omit<PaymentRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const TABS: TabDef[] = [
  { id: 'dashboard', label: 'Dashboard',   shortLabel: 'Home',    icon: LayoutDashboard },
  { id: 'history',   label: 'My Payments', shortLabel: 'History', icon: CreditCard },
  { id: 'submit',    label: 'Submit',      shortLabel: 'Submit',  icon: PlusCircle },
];

export default function MemberDashboard({ currentUser, payments, currentMonthStatus, onSubmit }: MemberDashboardProps) {
  const [tab, setTab] = useState('dashboard');
  const year = new Date().getFullYear();

  const approved         = useMemo(() => payments.filter((p) => p.status === 'Approved'), [payments]);

  const approvedThisYear = useMemo(() => approved.filter((p) => p.year === year), [approved, year]);
  const thisYearAmount   = useMemo(() => approvedThisYear.reduce((s, p) => s + p.amount, 0), [approvedThisYear]);
  const thisYearCount    = useMemo(() => approvedThisYear.length, [approvedThisYear]);

  const totalPaidCount   = useMemo(() => approved.length, [approved]);
  const totalPaidAmount  = useMemo(() => approved.reduce((s, p) => s + p.amount, 0), [approved]);

  // Rank: count unique approved months this year vs months elapsed
  const monthsElapsed    = new Date().getMonth() + 1;
  const approvedMonthsThisYear = useMemo(() => {
    const s = new Set<string>();
    approvedThisYear.forEach((p) => p.months.forEach((m) => s.add(m)));
    return s.size;
  }, [approvedThisYear]);
  const missedMonths = Math.max(0, monthsElapsed - approvedMonthsThisYear);
  const rank = missedMonths === 0
    ? { label: 'Champion', sub: 'Perfect attendance' }
    : missedMonths === 1
    ? { label: 'Gold',     sub: '1 month missed' }
    : missedMonths <= 3
    ? { label: 'Silver',   sub: `${missedMonths} months missed` }
    : missedMonths <= 5
    ? { label: 'Bronze',   sub: `${missedMonths} months missed` }
    : { label: 'Rookie',   sub: `${missedMonths} months missed` };

  const currentMonthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="animate-fade-in">
      <TabNav tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'dashboard' && (
        <div className="space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="This Month"
              value={currentMonthStatus === 'Approved' ? 'Paid' : currentMonthStatus === 'Pending' ? 'Pending' : currentMonthStatus === 'Rejected' ? 'Rejected' : 'Unpaid'}
              sub={currentMonthLabel}
            />
            <StatCard
              label="This Year"
              value={formatCurrency(thisYearAmount)}
              sub={`${thisYearCount} Record${thisYearCount !== 1 ? 's' : ''}`}
            />
            <StatCard
              label="Total Paid"
              value={formatCurrency(totalPaidAmount)}
              sub={`${totalPaidCount} Record${totalPaidCount !== 1 ? 's' : ''}`}
            />
            <RankCard label="Member Rank" rank={rank.label} sub={rank.sub} missed={missedMonths} />
          </div>

          {/* Month status */}
          <div className="glow-card hover-lift rounded-lg p-5">
            <p className="mb-3 text-sm font-bold text-white/60">This Month Payment Status</p>
            <div className="flex items-center gap-3">
              <span className={`rounded-lg px-4 py-2 text-sm font-bold ${currentMonthStatus ? badgeClass(currentMonthStatus) : ''}`}
                style={!currentMonthStatus ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' } : {}}
              >
                {currentMonthStatus
                  ? currentMonthStatus === 'Approved' ? '✓ Approved'
                  : currentMonthStatus === 'Rejected' ? '✗ Rejected'
                  : '⏳ Pending'
                  : 'Not submitted yet'}
              </span>
              {!currentMonthStatus && (
                <button onClick={() => setTab('submit')}
                  className="btn-glow btn-primary rounded-lg px-4 py-2 text-sm font-semibold text-white"
                >Submit Now →</button>
              )}
            </div>
          </div>

          {/* Year grid */}
          <div className="glow-card hover-lift rounded-lg p-5">
            <p className="mb-3 text-sm font-bold text-white/60">{year} Year Summary</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {Array.from({ length: 12 }, (_, i) => {
                const monthName = new Date(year, i, 1).toLocaleString('en-US', { month: 'long' });
                const paid = approved.find((x) => x.year === year && x.months.includes(monthName));
                return (
                  <div key={i}
                    className="rounded-lg p-2 text-center text-xs transition-all"
                    style={paid ? {
                      background: 'var(--bg-card)',
                      color: 'white',
                      border: '1px solid rgba(32,109,247,0.12)',
                    } : {
                      background: 'rgba(32,109,247,0.07)',
                      color: 'rgba(255,255,255,0.3)',
                      border: '1px solid rgba(32,109,247,0.12)',
                    }}
                  >
                    <p className="font-semibold">{monthName.slice(0, 3)}</p>
                    <p className="mt-0.5">{paid ? '✓' : '—'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <PaymentTable
          title={`My Payment History`}
          payments={payments}
          showCopyTrxId
          hideMemberCol
        />
      )}
      {tab === 'submit' && <PaymentForm currentUser={currentUser} onSubmit={onSubmit} />}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="glow-card hover-lift rounded-lg p-4 text-white">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/55">{label}</p>
      <p className={`mt-1.5 font-bold leading-tight text-white ${value.length > 8 ? 'text-lg' : 'text-2xl'}`}>{value}</p>
      <p className="mt-1 text-xs text-white/40">{sub}</p>
    </div>
  );
}

const RANK_COLORS: Record<string, { accent: string; bg: string }> = {
  Champion: { accent: '#206df7', bg: 'rgba(32,109,247,0.18)' },
  Gold:     { accent: '#f5c518', bg: 'rgba(245,197,24,0.12)'  },
  Silver:   { accent: '#a0aec0', bg: 'rgba(160,174,192,0.12)' },
  Bronze:   { accent: '#cd7f32', bg: 'rgba(205,127,50,0.12)'  },
  Rookie:   { accent: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)' },
};

function RankCard({ label, rank, sub, missed }: { label: string; rank: string; sub: string; missed: number }) {
  const { accent } = RANK_COLORS[rank] ?? RANK_COLORS.Rookie;
  return (
    <div className="glow-card hover-lift rounded-lg p-4 text-white">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/55">{label}</p>
      <p className="mt-1.5 text-2xl font-bold leading-tight" style={{ color: accent }}>{rank}</p>
      <div className="mt-1.5 h-1 w-full rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full rounded-lg transition-all" style={{ width: `${Math.max(5, 100 - missed * 16)}%`, background: accent, boxShadow: `0 0 6px ${accent}` }} />
      </div>
      <p className="mt-1 text-xs text-white/40">{sub}</p>
    </div>
  );
}
