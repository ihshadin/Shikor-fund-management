'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { PaymentRecord, ExportPeriod } from '@/types';
import { formatCurrency, formatDate, formatMonths } from '@/utils/format';

interface ExportButtonProps {
  payments: PaymentRecord[];
}

const PERIODS: { value: ExportPeriod; label: string }[] = [
  { value: 'this-month',    label: 'This Month' },
  { value: 'last-month',    label: 'Last Month' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'this-year',     label: 'This Year' },
  { value: 'all',           label: 'All Records' },
];

function filterByPeriod(payments: PaymentRecord[], period: ExportPeriod): PaymentRecord[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === 'all') return payments;
  if (period === 'this-year') return payments.filter((p) => p.year === year);

  if (period === 'this-month') {
    const monthName = now.toLocaleString('en-US', { month: 'long' });
    return payments.filter((p) => p.year === year && p.months.includes(monthName));
  }

  if (period === 'last-month') {
    const d = new Date(year, month - 1, 1);
    const mn = d.toLocaleString('en-US', { month: 'long' });
    return payments.filter((p) => p.year === d.getFullYear() && p.months.includes(mn));
  }

  if (period === 'last-6-months') {
    const cutoff = new Date(year, month - 5, 1);
    return payments.filter((p) => new Date(p.createdAt) >= cutoff);
  }

  return payments;
}

function getRows(payments: PaymentRecord[]) {
  return payments.filter((p) => p.status === 'Approved').map((p, idx) => ({
    SN: idx + 1,
    'Payment Date': formatDate(p.date),
    'Member Name': p.name,
    Month: formatMonths(p.months),
    Year: p.year,
    Amount: p.amount,
    Method: p.method === 'Bkash' ? 'Bkash' : p.method === 'Bank' ? 'Bank' : `To Member (${p.recipientName})`,
    'Transaction ID': p.transactionId || '',
    Status: p.status,
    'Request Time': new Date(p.createdAt).toLocaleString('en-GB'),
    'Approval Time': new Date(p.updatedAt).toLocaleString('en-GB'),
    'Approved By': p.approvedByName || '',
  }));
}

export default function ExportButton({ payments }: ExportButtonProps) {
  const [period, setPeriod] = useState<ExportPeriod>('this-month');

  const filtered = filterByPeriod(payments, period);
  const rows = getRows(filtered);
  const total = filtered.filter((p) => p.status === 'Approved').reduce((s, p) => s + p.amount, 0);
  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? '';

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [6,14,20,22,8,12,18,18,12,20,20,18].map((w) => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `Shikor_Fund_${period}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFillColor(32, 109, 247);
    doc.rect(0, 0, 297, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Shikor Dream Fund', 14, 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Noakhali, Bangladesh', 14, 20);
    doc.text(`Payment Report — ${periodLabel}`, 100, 20);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}  |  Total: ${formatCurrency(total)}  |  Records: ${rows.length}`, 180, 20);
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 32,
      head: [['SN','Date','Member','Month','Year','Amount','Method','Trx ID','Status','Request Time','Approval Time','Approved By']],
      body: rows.map((r) => Object.values(r)),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [32, 109, 247], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [235, 242, 255] },
      columnStyles: { 5: { halign: 'right' } },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} — Shikor Dream Fund, Noakhali, Bangladesh`, 14, doc.internal.pageSize.height - 5);
    }

    doc.save(`Shikor_Fund_${period}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="glass-card rounded-lg p-5 animate-fade-in">
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
        <Download size={18} style={{ color: '#206df7' }} /> Export Data
      </h3>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold text-white/60">Select Period</label>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className="rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
              style={period === p.value ? {
                background: 'linear-gradient(135deg, #091530 0%, #206df7 100%)',
                color: 'white',
                boxShadow: '0 2px 12px rgba(32,109,247,0.45)',
              } : {
                background: 'rgba(32,109,247,0.08)',
                color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(32,109,247,0.15)',
              }}
            >{p.label}</button>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-lg p-3"
        style={{ background: 'rgba(32,109,247,0.08)', border: '1px solid rgba(32,109,247,0.15)' }}
      >
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Approved Records</p>
            <p className="font-bold text-white">{rows.length}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Total Amount</p>
            <p className="font-bold text-white">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={exportExcel} disabled={rows.length === 0}
          className="btn-glow flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'rgba(32,109,247,0.15)', border: '1px solid rgba(32,109,247,0.3)' }}
        ><FileSpreadsheet size={16} /> Excel</button>
        <button onClick={exportPDF} disabled={rows.length === 0}
          className="btn-glow btn-primary flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
        ><FileText size={16} /> PDF</button>
      </div>
      {rows.length === 0 && (
        <p className="mt-2 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No approved records for this period.</p>
      )}
    </div>
  );
}
