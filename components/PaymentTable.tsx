'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { PaymentRecord } from '@/types';
import { badgeClass, formatCurrency, formatDate, formatDateTime, formatMonths } from '@/utils/format';

interface PaymentTableProps {
  title?: string;
  payments: PaymentRecord[];
  actions?: (payment: PaymentRecord) => React.ReactNode;
  compact?: boolean;
  showCopyTrxId?: boolean;
  hideMemberCol?: boolean;
}

export default function PaymentTable({ title, payments, actions, compact, showCopyTrxId, hideMemberCol }: PaymentTableProps) {
  return (
    <div className="overflow-hidden rounded-lg"
      style={{ background: 'rgba(32,109,247,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(32,109,247,0.15)' }}
    >
      {title && (
        <div className="border-b px-5 py-3"
          style={{ background: 'rgba(32,109,247,0.08)', borderColor: 'rgba(32,109,247,0.15)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#206df7]">
              {title} (<span className="text-white">{payments.length}</span>)
            </h3>
            {/* <span className="text-white">{payments.length}</span> */}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm" style={{ borderColor: 'rgba(32,109,247,0.08)' }}>
          <thead>
            <tr style={{ background: 'rgba(32,109,247,0.06)' }}>
              <Th>SN</Th>
              <Th>Date</Th>
              {!hideMemberCol && <Th>Member</Th>}
              <Th>Month</Th>
              <Th>Amount</Th>
              <Th>Method</Th>
              {!compact && <Th>Trx ID</Th>}
              <Th>Status</Th>
              {!compact && <Th>Request Time</Th>}
              {!compact && <Th>Update Time</Th>}
              {!compact && <Th>Reviewer</Th>}
              {actions && <Th>Action</Th>}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-5 py-10 text-center"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  No records found
                </td>
              </tr>
            ) : (
              payments.map((p, idx) => (
                <tr key={p.id}
                  className="transition-all"
                  style={{ borderBottom: '1px solid rgba(32,109,247,0.07)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(32,109,247,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{idx + 1}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{formatDate(p.date)}</td>
                  {!hideMemberCol && <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#5a5a72]">{p.name}</td>}
                  <td className="whitespace-nowrap px-3 py-2 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{formatMonths(p.months, p.year)}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-bold text-[#5a5a72]">{formatCurrency(p.amount)}</td>
                  <td className="px-3 py-2"><MethodBadge method={p.method} recipientName={p.recipientName} /></td>
                  {!compact && (
                    <td className="px-3 py-2">
                      <TrxIdCell trxId={p.transactionId} showCopy={showCopyTrxId} />
                    </td>
                  )}
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-[#5a5a72] text-xs font-bold whitespace-nowrap ${badgeClass(p.status)}`}>
                      {p.status === 'Approved' ? '✓ Approved' : p.status === 'Rejected' ? '✗ Rejected' : '⏳ Pending'}
                    </span>
                  </td>
                  {!compact && <td className="whitespace-nowrap px-3 py-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatDateTime(p.createdAt)}</td>}
                  {!compact && (
                    <td className="whitespace-nowrap px-3 py-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {p.status !== 'Pending' ? formatDateTime(p.updatedAt) : '—'}
                    </td>
                  )}
                  {!compact && (
                    <td className="px-3 py-2 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {p.approvedByName || '—'}
                    </td>
                  )}
                  {actions && <td className="px-3 py-2">{actions(p)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrxIdCell({ trxId, showCopy }: { trxId?: string; showCopy?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!trxId) return;
    navigator.clipboard.writeText(trxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {trxId || '—'}
      </span>
      {showCopy && trxId && (
        <button onClick={handleCopy}
          className="flex-shrink-0 rounded p-0.5 transition-all hover:scale-110"
          style={{ color: copied ? '#005bff' : 'rgba(255,255,255,0.25)' }}
          title="Copy Trx ID"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
        </button>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-3 py-2 text-left text-xs text-[#206df7] font-bold uppercase tracking-wider">
      {children}
    </th>
  );
}

function MethodBadge({ method, recipientName }: { method: string; recipientName?: string }) {
  if (method === 'Bkash')
    return <span className="inline-flex rounded-lg px-2.5 py-0.5 text-xs font-bold text-[#d8d8d8]"
      style={{ background: 'rgba(32,109,247,0.3)', border: '1px solid rgba(32,109,247,0.4)' }}>Bkash</span>;
  if (method === 'Bank')
    return <span className="inline-flex rounded-lg px-2.5 py-0.5 text-xs font-bold text-[#d8d8d8]"
      style={{ background: '#206df7', boxShadow: '0 1px 6px rgba(32,109,247,0.4)' }}>Bank</span>;
  return (
    <span className="inline-flex flex-col rounded-lg px-2 py-0.5 text-xs font-bold text-[#d8d8d8]"
      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
    >
      To Member {recipientName && <span className="font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>({recipientName})</span>}
    </span>
  );
}
