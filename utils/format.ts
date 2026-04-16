export function formatCurrency(value: number) {
  return `৳${value.toLocaleString('en-US')}`;
}

export function getCurrentMonthBn() {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

export function formatDate(value: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatMonths(months: string[], year?: number): string {
  if (!months || months.length === 0) return '—';
  const suffix = year ? ` ${year}` : '';
  if (months.length === 1) return `${months[0]}${suffix}`;
  if (months.length <= 3) return months.map((m, i) => i === months.length - 1 ? `${m}${suffix}` : m).join(', ');
  return `${months[0]} – ${months[months.length - 1]}${suffix} (${months.length} mo.)`;
}

export function badgeClass(status: 'Pending' | 'Approved' | 'Rejected') {
  switch (status) {
    case 'Approved':
      return 'text-white' + ' badge-approved';
    case 'Rejected':
      return 'text-white' + ' badge-rejected';
    default:
      return 'text-white' + ' badge-pending';
  }
}

export const MONTHS_BN = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export function getYearRange(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - 2 + i);
}
