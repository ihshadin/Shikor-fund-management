'use client';

import { useMemo, useState } from 'react';
import { LayoutDashboard, Clock, CheckCircle, XCircle, CreditCard, PlusCircle, Download } from 'lucide-react';
import { PaymentRecord, UserSession } from '@/types';
import TabNav, { TabDef } from './TabNav';
import PaymentTable from './PaymentTable';
import PaymentForm from './PaymentForm';
import ExportButton from './ExportButton';
import { formatCurrency, getCurrentMonthBn, badgeClass } from '@/utils/format';

interface ReviewerDashboardProps {
  currentUser: UserSession;
  payments: PaymentRecord[];
  memberPayments: PaymentRecord[];
  pendingRequests: PaymentRecord[];
  approvedPayments: PaymentRecord[];
  rejectedPayments: PaymentRecord[];
  currentMonthStatus?: PaymentRecord['status'];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSubmit: (payload: Omit<PaymentRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function ReviewerDashboard({
  currentUser, payments, memberPayments, pendingRequests,
  approvedPayments, rejectedPayments, currentMonthStatus, onApprove, onReject, onSubmit,
}: ReviewerDashboardProps) {
  const [tab, setTab] = useState('dashboard');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterName, setFilterName] = useState('');

  const year = new Date().getFullYear();
  const currentMonth = getCurrentMonthBn();

  const TABS: TabDef[] = [
    { id: 'dashboard', label: 'Dashboard',  shortLabel: 'Home',    icon: LayoutDashboard },
    { id: 'pending',   label: 'Pending',    shortLabel: 'Pending', icon: Clock,         badge: pendingRequests.length },
    { id: 'approved',  label: 'Approved',   shortLabel: 'Done',    icon: CheckCircle },
    { id: 'rejected',  label: 'Rejected',   shortLabel: 'Rejected',icon: XCircle,       badge: rejectedPayments.length },
    { id: 'mine',      label: 'My Payments',shortLabel: 'Mine',    icon: CreditCard },
    { id: 'submit',    label: 'Submit',     shortLabel: 'Submit',  icon: PlusCircle },
    { id: 'export',    label: 'Export',     shortLabel: 'Export',  icon: Download },
  ];

  const filter = (list: PaymentRecord[]) => list.filter((p) => {
    const m = filterMonth ? p.months.some((x) => x.toLowerCase().includes(filterMonth.toLowerCase())) : true;
    const n = filterName  ? p.name.toLowerCase().includes(filterName.toLowerCase()) : true;
    return m && n;
  });

  const thisMonthTotal = useMemo(
    () => approvedPayments.filter((p) => p.year === year && p.months.includes(currentMonth)).reduce((s, p) => s + p.amount, 0),
    [approvedPayments, year, currentMonth]
  );
  const totalFund   = useMemo(() => approvedPayments.reduce((s, p) => s + p.amount, 0), [approvedPayments]);
  const ownApproved = useMemo(() => memberPayments.filter((p) => p.status === 'Approved').reduce((s, p) => s + p.amount, 0), [memberPayments]);

  return (
    <div className="animate-fade-in">
      <TabNav tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Pending"          value={`${pendingRequests.length}`}   sub="Awaiting" />
            <StatCard label="Approved"         value={`${approvedPayments.length}`}  sub="Approved" solid />
            <StatCard label="This Month Fund"  value={formatCurrency(thisMonthTotal)} sub={currentMonth} />
            <StatCard label="Total Fund"       value={formatCurrency(totalFund)}     sub="All time" solid />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-card rounded-2xl p-4 hover-lift">
              <p className="mb-2 text-sm font-bold text-white/60">Your Month Status</p>
              <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${currentMonthStatus ? badgeClass(currentMonthStatus) : ''}`}
                style={!currentMonthStatus ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' } : {}}
              >{currentMonthStatus ?? 'Not Paid'}</span>
              {!currentMonthStatus && (
                <button onClick={() => setTab('submit')}
                  className="ml-3 btn-glow btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                >Submit</button>
              )}
            </div>
            <div className="glass-card rounded-2xl p-4 hover-lift">
              <p className="mb-2 text-sm font-bold text-white/60">Your Total Approved</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(ownApproved)}</p>
            </div>
          </div>

          {pendingRequests.length > 0 && (
            <div className="rounded-2xl border p-4"
              style={{ background: 'rgba(32,109,247,0.08)', borderColor: 'rgba(32,109,247,0.25)' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-white/80">⚠ {pendingRequests.length} payment{pendingRequests.length !== 1 ? 's' : ''} awaiting review</p>
                <button onClick={() => setTab('pending')} className="text-xs font-semibold underline" style={{ color: '#206df7' }}>View All →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'pending' && (
        <div className="space-y-4">
          <SearchFilters filterMonth={filterMonth} filterName={filterName} setFilterMonth={setFilterMonth} setFilterName={setFilterName} />
          <PaymentTable
            title={`Pending Requests (${filter(pendingRequests).length})`}
            payments={filter(pendingRequests)}
            actions={(p) => (
              <div className="flex gap-1.5">
                <button onClick={() => onApprove(p.id)}
                  className="btn-glow btn-primary rounded-lg px-2.5 py-1.5 text-xs font-bold text-white active:scale-95"
                >✓ Approve</button>
                <button onClick={() => onReject(p.id)}
                  className="btn-glow rounded-lg px-2.5 py-1.5 text-xs font-bold active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                >✗ Reject</button>
              </div>
            )}
          />
        </div>
      )}

      {tab === 'approved' && (
        <div className="space-y-4">
          <SearchFilters filterMonth={filterMonth} filterName={filterName} setFilterMonth={setFilterMonth} setFilterName={setFilterName} />
          <div className="rounded-2xl p-3"
            style={{ background: 'rgba(32,109,247,0.1)', border: '1px solid rgba(32,109,247,0.2)' }}
          >
            <span className="text-sm font-bold text-white">
              Total: {formatCurrency(filter(approvedPayments).reduce((s, p) => s + p.amount, 0))}
            </span>
          </div>
          <PaymentTable title={`Approved (${filter(approvedPayments).length})`} payments={filter(approvedPayments)} />
        </div>
      )}

      {tab === 'rejected' && (
        <div className="space-y-4">
          <SearchFilters filterMonth={filterMonth} filterName={filterName} setFilterMonth={setFilterMonth} setFilterName={setFilterName} />
          <PaymentTable title={`Rejected (${filter(rejectedPayments).length})`} payments={filter(rejectedPayments)} />
        </div>
      )}

      {tab === 'mine'   && <PaymentTable title={`My Payment History (${memberPayments.length})`} payments={memberPayments} showCopyTrxId hideMemberCol />}
      {tab === 'submit' && <PaymentForm currentUser={currentUser} onSubmit={onSubmit} />}
      {tab === 'export' && <ExportButton payments={payments} />}
    </div>
  );
}

function StatCard({ label, value, sub, solid }: { label: string; value: string; sub: string; solid?: boolean }) {
  return (
    <div className="hover-lift relative overflow-hidden rounded-2xl p-4 text-white"
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

function SearchFilters({ filterMonth, filterName, setFilterMonth, setFilterName }: {
  filterMonth: string; filterName: string;
  setFilterMonth: (v: string) => void; setFilterName: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <input value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} placeholder="Search by month…"
        className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30"
        style={{ background: 'rgba(32,109,247,0.08)', border: '1px solid rgba(32,109,247,0.18)' }}
      />
      <input value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="Search by name…"
        className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30"
        style={{ background: 'rgba(32,109,247,0.08)', border: '1px solid rgba(32,109,247,0.18)' }}
      />
    </div>
  );
}
