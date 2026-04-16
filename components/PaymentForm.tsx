'use client';

import { useState } from 'react';
import { UserSession, PaymentRecord } from '@/types';
import { MONTHS_BN } from '@/utils/format';

type MonthYear = { month: string; year: number };

interface PaymentFormProps {
  currentUser: UserSession;
  onSubmit: (payload: Omit<PaymentRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const MONTHLY_FEE = 1050;

export default function PaymentForm({ currentUser, onSubmit }: PaymentFormProps) {
  const currentYear = new Date().getFullYear();

  const [selected, setSelected] = useState<MonthYear[]>([
    { month: MONTHS_BN[new Date().getMonth()], year: currentYear },
  ]);
  const [amount, setAmount]           = useState(MONTHLY_FEE);
  const [method, setMethod]           = useState<'Bkash' | 'Bank' | 'ToMember'>('Bkash');
  const [recipientName, setRecipientName] = useState('');
  const [date, setDate]               = useState(new Date().toISOString().slice(0, 10));
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [msg, setMsg]                 = useState<{ text: string; ok: boolean } | null>(null);

  const isSelected = (month: string, year: number) =>
    selected.some((x) => x.month === month && x.year === year);

  const toggleMonthYear = (month: string, year: number) =>
    setSelected((prev) => {
      const next = isSelected(month, year)
        ? prev.filter((x) => !(x.month === month && x.year === year))
        : [...prev, { month, year }];
      setAmount(next.length * MONTHLY_FEE);
      return next;
    });

  // Group selected months by year, sorted
  const groupByYear = (): [number, string[]][] => {
    const map: Record<number, string[]> = {};
    selected.forEach(({ month, year }) => {
      if (!map[year]) map[year] = [];
      map[year].push(month);
    });
    return Object.entries(map)
      .map(([yr, months]) => [
        Number(yr),
        months.sort((a, b) => MONTHS_BN.indexOf(a) - MONTHS_BN.indexOf(b)),
      ] as [number, string[]])
      .sort(([a], [b]) => a - b);
  };

  // Human-readable selection summary
  const selectionSummary = () =>
    groupByYear()
      .map(([yr, months]) => `${months.map((m) => m.slice(0, 3)).join(', ')} ${yr}`)
      .join(' · ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      setMsg({ text: 'Please select at least one month.', ok: false });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      const groups = groupByYear();
      const perMonth = amount / selected.length; // respect manual edits proportionally

      for (const [year, months] of groups) {
        await onSubmit({
          userId: currentUser.id,
          name:   currentUser.name,
          year,
          months,
          amount: Math.round(perMonth * months.length),
          method,
          recipientName: method === 'ToMember' ? recipientName : '',
          date,
          transactionId: transactionId.trim(),
        });
      }

      const total = selected.length;
      setMsg({ text: `${total} month${total > 1 ? 's' : ''} submitted successfully!`, ok: true });
      setSelected([]);
      setAmount(0);
      setTransactionId('');
      setRecipientName('');
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : 'Failed to submit payment.', ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: 'rgba(32,109,247,0.08)',
    border: '1px solid rgba(32,109,247,0.2)',
    color: 'white',
  };

  const ALL_YEARS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  const [openYears, setOpenYears] = useState<number[]>([currentYear]);

  const toggleYear = (yr: number) => {
    setOpenYears((prev) => {
      if (prev.includes(yr)) {
        // closing a year — clear its selected months too
        setSelected((s) => {
          const next = s.filter((x) => x.year !== yr);
          setAmount(next.length * MONTHLY_FEE || 0);
          return next;
        });
        return prev.filter((y) => y !== yr);
      }
      return [...prev, yr];
    });
  };

  const countForYear = (yr: number) => selected.filter((x) => x.year === yr).length;

  return (
    <div className="glass-card animate-fade-in rounded-lg p-5">
      <h3 className="mb-4 text-base font-bold text-white">Submit Payment</h3>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Month selector ── */}
        <div className="space-y-3 rounded-xl p-4"
          style={{ background: 'rgba(32,109,247,0.06)', border: '1px solid rgba(32,109,247,0.15)' }}
        >
          <label className="mb-1 block text-sm font-semibold text-white/60">Select Months</label>

          {/* Year toggle chips */}
          <div className="flex flex-wrap gap-2">
            {ALL_YEARS.map((yr) => {
              const active = openYears.includes(yr);
              const count  = countForYear(yr);
              return (
                <button key={yr} type="button" onClick={() => toggleYear(yr)}
                  className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm leading-none font-bold transition-all"
                  style={active ? {
                    background: 'linear-gradient(135deg, #0a0a0f4d, #0059ff4d 60%, #06060a4d 100%)',
                    border: '1px solid #0059ff66',
                    color: 'white',
                  } : {
                    background: 'transparent',
                    border: '1px solid rgba(0,89,255,0.2)',
                    color: 'rgba(255,255,255,0.35)',
                  }}
                >
                  {yr}
                  {count > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] text-white"
                      style={{ background: '#206df7' }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Month grids for open years */}
          {openYears.sort((a, b) => a - b).map((yr) => (
            <div key={yr}>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: 'rgba(32,109,247,0.7)' }}>{yr}</p>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                {MONTHS_BN.map((m) => (
                  <button key={m} type="button" onClick={() => toggleMonthYear(m, yr)}
                    className="rounded-lg py-1.5 text-xs font-semibold transition-all"
                    style={isSelected(m, yr) ? {
                      background: 'linear-gradient(135deg, #0a0a0f4d, #0059ff4d 60%, #06060a4d 100%)',
                      color: 'white',
                      border: '1px solid #0059ff66',
                    } : {
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.35)',
                      border: '1px solid rgba(0,89,255,0.2)',
                    }}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {selected.length > 0 && (
            <p className="text-xs font-medium" style={{ color: '#206df7' }}>
              ✓ {selectionSummary()} ({selected.length} month{selected.length > 1 ? 's' : ''})
            </p>
          )}
        </div>

        {/* ── Amount ── */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-white/60">
            Total Amount (৳)
            {selected.length > 1 && (
              <span className="ml-2 font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>
                ৳{MONTHLY_FEE.toLocaleString()} × {selected.length} months
              </span>
            )}
          </label>
          <input
            type="number" min={1} value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-xl px-4 py-2.5 text-sm"
            style={inputStyle}
          />
        </div>

        {/* ── Payment Method ── */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-white/60">Payment Method</label>
          <div className="flex gap-2">
            {(['Bkash', 'Bank', 'ToMember'] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMethod(m)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${method === m ? 'btn-method-active' : 'btn-method'}`}
              >
                {m === 'ToMember' ? 'To Member' : m}
              </button>
            ))}
          </div>
          {method === 'ToMember' && (
            <input
              type="text" value={recipientName} required
              placeholder="Recipient name"
              onChange={(e) => setRecipientName(e.target.value)}
              className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm placeholder-white/30"
              style={inputStyle}
            />
          )}
        </div>

        {/* ── Date + Transaction ID ── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-white/60">Payment Date</label>
            <input type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-white/60">
              Transaction ID{' '}
              <span className="font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>(Optional)</span>
            </label>
            <input type="text" value={transactionId}
              placeholder="e.g. 8N7X2QK..."
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm placeholder-white/30"
              style={inputStyle}
            />
          </div>
        </div>

        {msg && (
          <p className="rounded-xl border px-4 py-2.5 text-sm font-medium"
            style={msg.ok ? {
              background: 'rgba(32,109,247,0.12)',
              borderColor: 'rgba(32,109,247,0.35)',
              color: 'rgba(255,255,255,0.9)',
            } : {
              background: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(255,255,255,0.2)',
              color: 'rgba(255,200,200,0.9)',
            }}
          >{msg.text}</p>
        )}

        <button
          type="submit" disabled={submitting || selected.length === 0}
          className="shikor-btn w-full rounded-xl py-3 font-bold text-white transition-all disabled:cursor-not-allowed disabled:text-white/60"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Submitting...
            </span>
          ) : `Submit${selected.length > 1 ? ` (${selected.length} months)` : ''}`}
        </button>

      </form>
    </div>
  );
}
