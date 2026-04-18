'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { PaymentRecord, ExportPeriod } from '@/types';
import { formatCurrency, formatDate, formatMonths } from '@/utils/format';
import PaymentTable from './PaymentTable';

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

function getPdfPeriodLabel(period: ExportPeriod): string {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const thisMonthName = now.toLocaleString('en-US', { month: 'long' });
  const lastMonthDate = new Date(year, month - 1, 1);
  const lastMonthName = lastMonthDate.toLocaleString('en-US', { month: 'long' });
  const lastMonthYear = lastMonthDate.getFullYear();
  const sixAgo        = new Date(year, month - 5, 1);

  switch (period) {
    case 'this-month':    return `${thisMonthName} ${year}`;
    case 'last-month':    return `${lastMonthName} ${lastMonthYear}`;
    case 'last-6-months': return `${sixAgo.toLocaleString('en-US', { month: 'long' })} ${sixAgo.getFullYear()} - ${thisMonthName} ${year}`;
    case 'this-year':     return `${year}`;
    case 'all':           return 'All Payment List';
  }
}

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
    Date: formatDate(p.date),
    Member: p.name,
    Month: formatMonths(p.months, p.year),
    Amount: `TK ${p.amount.toLocaleString('en-US')}`,
    Method: p.method === 'Bkash' ? 'Bkash' : p.method === 'Bank' ? 'Bank' : `To Member (${p.recipientName})`,
    'Trx ID': p.transactionId || '—',
    'Request Time': new Date(p.createdAt).toLocaleString('en-GB'),
    'Approve Time': new Date(p.updatedAt).toLocaleString('en-GB'),
    'Approved By': p.approvedByName || '—',
  }));
}

async function buildPdfBlobUrl(
  rows: ReturnType<typeof getRows>,
  total: number,
  periodLabel: string
): Promise<string> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.width;

  // ── Load logo ────────────────────────────────────────────────────────────
  let logoDataUrl: string | null = null;
  try {
    const res = await fetch('/logo.png');
    if (res.ok) {
      const blob = await res.blob();
      logoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
  } catch { /* logo optional */ }

  // ── Header ───────────────────────────────────────────────────────────────
  const H1 = 38;
  const H2 = 10;
  const M  = 10;

  // White header background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, H1, 'F');

  // Top black border line
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageW, 1.2, 'F');

  // Logo
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', M, 5, 32, 32);
  }

  // Title block
  const titleX = logoDataUrl ? M + 37 : M;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 15, 15);
  doc.text('Shikor Showpno Fund', titleX, 18);

  // Thin black underline
  // doc.setFillColor(15, 15, 15);
  // doc.rect(titleX, 20, 90, 0.5, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text('Community Savings & Fund Management', titleX, 26);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Payment Report  ·  ${periodLabel}  ·  ${new Date().toLocaleDateString('en-GB')}`, titleX, 32);

  // Bottom header border
  // doc.setFillColor(20, 20, 20);
  // doc.rect(0, H1 - 0.5, pageW, 0.5, 'F');

  // Stats strip — dark black band
  doc.setFillColor(242, 242, 242);
  doc.rect(0, H1, pageW, H2, 'F');

  const summaryText = `${periodLabel}  |  ${rows.length} Records  |  TK ${total.toLocaleString('en-US')}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(summaryText, pageW / 2, H1 + H2 / 2 + 1.5, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  // ── Table ────────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: H1 + H2 + 4,
    head: [['SN', 'Date', 'Member', 'Month', 'Amount', 'Method', 'Trx ID', 'Request Time', 'Approve Time', 'Approved By']],
    body: rows.map((r) => Object.values(r)),
    styles: { fontSize: 6.5, cellPadding: 2.2, overflow: 'linebreak', textColor: [20, 20, 20] },
    headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold', fontSize: 6.5 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 16 },
      2: { cellWidth: 26 },
      3: { cellWidth: 22 },
      4: { cellWidth: 16, halign: 'right' },
      5: { cellWidth: 18 },
      6: { cellWidth: 20 },
      7: { cellWidth: 22 },
      8: { cellWidth: 22 },
      9: { cellWidth: 20 },
    },
    margin: { left: 10, right: 10 },
  });

  // ── Footer ───────────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(20, 20, 20);
    doc.rect(0, doc.internal.pageSize.height - 9, pageW, 9, 'F');
    doc.setFontSize(6.5);
    doc.setTextColor(200, 200, 200);
    doc.text('Design & Develop by IH Shadin', 10, doc.internal.pageSize.height - 3.5);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 10, doc.internal.pageSize.height - 3.5, { align: 'right' });
  }

  return URL.createObjectURL(doc.output('blob'));
}

export default function ExportButton({ payments }: ExportButtonProps) {
  const [period, setPeriod] = useState<ExportPeriod>('this-month');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  const filtered       = filterByPeriod(payments, period);
  const approved       = filtered.filter((p) => p.status === 'Approved');
  const rows           = getRows(filtered);
  const total          = approved.reduce((s, p) => s + p.amount, 0);
  const periodLabel    = PERIODS.find((p: { value: ExportPeriod; label: string }) => p.value === period)?.label ?? '';
  const pdfPeriodLabel = getPdfPeriodLabel(period);

  // Auto-generate preview whenever period or data changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url = await buildPdfBlobUrl(rows, total, pdfPeriodLabel);
      if (cancelled) return;
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = url;
      setPdfPreviewUrl(url);
    })();
    return () => { cancelled = true; };
  }, [period, payments]); // eslint-disable-line react-hooks/exhaustive-deps

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [6, 14, 22, 20, 12, 18, 20, 20, 20, 18].map((w) => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `Shikor_Fund_${period}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportPDF = async () => {
    const url = await buildPdfBlobUrl(rows, total, pdfPeriodLabel);
    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shikor_Fund_${period}_${new Date().toISOString().slice(0,10)}.pdf`;
    a.click();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Controls */}
      <div className="glass-card rounded-lg p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white/60">
          <Download size={15} style={{ color: '#206df7' }} /> Export Data
        </h3>

        {/* Period filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
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

        {/* Summary + Export buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-4 rounded-lg px-3 py-2"
            style={{ background: 'rgba(32,109,247,0.08)', border: '1px solid rgba(32,109,247,0.15)' }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>Records</p>
              <p className="font-bold text-white">{filtered.length} <span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.35)' }}>({approved.length} approved)</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>Total Approved</p>
              <p className="font-bold text-white">{formatCurrency(total)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={exportExcel} disabled={rows.length === 0}
              className="btn-glow flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'rgba(32,109,247,0.15)', border: '1px solid rgba(32,109,247,0.3)' }}
            ><FileSpreadsheet size={14} /> Excel</button>
            <button onClick={exportPDF} disabled={rows.length === 0}
              className="btn-glow btn-primary flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
            ><FileText size={14} /> PDF</button>
          </div>
        </div>

        {rows.length === 0 && (
          <p className="mt-2 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No approved records for this period.</p>
        )}
      </div>

      {/* Payments list — approved only */}
      <PaymentTable
        title={`${periodLabel} Payments`}
        payments={approved}
      />

      {/* PDF Preview */}
      {/* {pdfPreviewUrl && (
        <div className="overflow-hidden rounded-lg"
          style={{ border: '1px solid rgba(32,109,247,0.2)' }}
        >
          <div className="flex items-center justify-between px-4 py-2"
            style={{ background: 'rgba(32,109,247,0.08)', borderBottom: '1px solid rgba(32,109,247,0.15)' }}
          >
            <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>PDF Preview</p>
            <button onClick={() => { URL.revokeObjectURL(pdfPreviewUrl); setPdfPreviewUrl(null); }}
              className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}
            >✕ Close</button>
          </div>
          <iframe src={pdfPreviewUrl} className="w-full" style={{ height: '600px', background: '#fff' }} />
        </div>
      )} */}
    </div>
  );
}
