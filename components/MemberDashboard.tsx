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

  // Rank tracker vars — commented out while rank UI is hidden
  // const monthsElapsed    = new Date().getMonth() + 1;
  // const approvedMonthsThisYear = new Set(approvedThisYear.flatMap((p) => p.months)).size;
  // const missedMonths = Math.max(0, monthsElapsed - approvedMonthsThisYear);

  const currentMonthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="animate-fade-in">
      <TabNav tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'dashboard' && (
        <div className="space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
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
          </div>

          {/* Rank tracker — hidden for now */}
          {/* <RankTracker
            missed={missedMonths}
            year={year}
            monthsElapsed={monthsElapsed}
            approvedThisYear={approvedThisYear}
            userName={currentUser.name}
          /> */}

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

const RANKS = [
  { label: 'Great Member',     short: 'Great',   color: '#22c55e' },
  { label: 'Very Good Member', short: 'V.Good',  color: '#206df7' },
  { label: 'Good Member',      short: 'Good',    color: '#a855f7' },
  { label: 'Average Member',   short: 'Average', color: '#f59e0b' },
  { label: 'Bad Member',       short: 'Bad',     color: '#ef4444' },
];

function getRankIndex(missed: number) {
  if (missed === 0) return 0;
  if (missed <= 2)  return 1;
  if (missed <= 4)  return 2;
  if (missed <= 6)  return 3;
  return 4;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function RankTracker({ missed, year, monthsElapsed, approvedThisYear, userName }: {
  missed: number;
  year: number;
  monthsElapsed: number;
  approvedThisYear: PaymentRecord[];
  userName: string;
}) {
  const idx     = getRankIndex(missed);
  const current = RANKS[idx];

  // Which months (0-indexed) were paid this year
  const paidMonthIdxs = new Set<number>();
  approvedThisYear.forEach((p) =>
    p.months.forEach((m) => {
      const i = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'].indexOf(m);
      if (i >= 0) paidMonthIdxs.add(i);
    })
  );

  const motivational =
    missed === 0 ? `Perfect attendance in ${year} — keep it up!` :
    missed === 1 ? 'Just 1 month missed — almost perfect!' :
    missed <= 3  ? `${missed} months missed — you can still improve!` :
                   `${missed} months missed — aim for Great Member!`;

  return (
    <div className="glow-card hover-lift rounded-lg p-5">

      {/* Avatar */}
      <div className="mb-6 flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg text-2xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#091530,#206df7)', boxShadow: '0 4px 20px rgba(32,109,247,0.45)' }}
        >{userName[0].toUpperCase()}</div>
      </div>

      {/* Rank track */}
      <div className="relative flex items-center justify-between px-2">

        {/* Base line */}
        <div className="absolute inset-x-6 top-[22px] h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

        {/* Progress line */}
        {idx > 0 && (
          <div className="absolute left-6 top-[22px] h-px transition-all"
            style={{
              width: `calc(${(idx / (RANKS.length - 1)) * 100}% - 3rem)`,
              background: `linear-gradient(90deg, ${RANKS[0].color}80, ${current.color})`,
            }}
          />
        )}

        {RANKS.map((r, i) => {
          const isActive = i === idx;
          const isPast   = i < idx;
          return (
            <div key={r.label} className="relative flex flex-col items-center gap-1.5" style={{ zIndex: 1 }}>
              {/* Downward arrow above active node */}
              {isActive && (
                <div className="absolute -top-4 flex justify-center w-full">
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: `7px solid ${r.color}`,
                  }} />
                </div>
              )}

              {/* Hexagon node */}
              <div className="flex items-center justify-center font-bold"
                style={{
                  width: isActive ? 44 : 34,
                  height: isActive ? 44 : 34,
                  clipPath: 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)',
                  background: isActive
                    ? r.color
                    : isPast
                    ? 'rgba(255,255,255,0.22)'
                    : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#fff' : isPast ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)',
                  fontSize: isActive ? 14 : 11,
                  boxShadow: isActive ? `0 0 18px ${r.color}70` : 'none',
                  transition: 'all 0.3s',
                }}
              >
                {i + 1}
              </div>

              {/* Label */}
              <p className="text-center leading-tight"
                style={{
                  fontSize: isActive ? 10 : 8,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? r.color : isPast ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                  maxWidth: 48,
                }}
              >{r.short}</p>

              {isActive && (
                <span className="rounded-lg px-1.5 py-px text-[8px] font-bold text-white"
                  style={{ background: r.color }}>You</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current rank label */}
      <p className="mt-4 text-center text-sm font-bold" style={{ color: current.color }}>
        {current.label}
      </p>

      {/* Divider */}
      <div className="my-4 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

      {/* Progress tracker */}
      <p className="mb-3 text-sm font-bold text-white/60">Progress tracker</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: monthsElapsed }, (_, i) => {
          const paid = paidMonthIdxs.has(i);
          return (
            <div key={i}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all"
              style={paid ? {
                background: '#22c55e',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(34,197,94,0.4)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.2)',
              }}
              title={`${MONTH_NAMES[i]} ${year}`}
            >
              {paid ? '✓' : ''}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{motivational}</p>
    </div>
  );
}
