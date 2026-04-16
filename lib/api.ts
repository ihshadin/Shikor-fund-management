import { AuthResponse, MemberInfo, PaymentRecord, UserSession } from '@/types';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('shikor-token') : null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const login = (email: string, password: string) =>
  request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (name: string, email: string, password: string) =>
  request<{ message: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });

export const getMe = () => request<UserSession>('/auth/me');

export const getPayments = () => request<PaymentRecord[]>('/payments');

export const submitPayment = (payload: Omit<PaymentRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>) =>
  request<PaymentRecord>('/payments', { method: 'POST', body: JSON.stringify(payload) });

export const updatePaymentStatus = (id: string, status: 'Approved' | 'Rejected') =>
  request<PaymentRecord>(`/payments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const getReviewers = () => request<UserSession[]>('/admin/reviewers');

export const getAssignedReviewer = () => request<{ reviewerId: string | null }>('/admin/assigned-reviewer');

export const assignReviewer = (reviewerId: string) =>
  request<{ reviewerId: string }>('/admin/assign-reviewer', { method: 'PATCH', body: JSON.stringify({ reviewerId }) });

export const getMembers = (status = 'all') =>
  request<MemberInfo[]>(`/admin/members?status=${status}`);

export const updateMember = (id: string, updates: { status?: string; role?: string; isReviewer?: boolean }) =>
  request<MemberInfo>(`/admin/members/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
