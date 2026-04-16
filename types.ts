export type UserRole = 'member' | 'admin';
export type UserStatus = 'pending' | 'active' | 'rejected';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isReviewer?: boolean;
}

export interface MemberInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isReviewer?: boolean;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  name: string;
  year: number;
  months: string[];           // array of selected months
  amount: number;             // total amount
  method: 'Bkash' | 'Bank' | 'ToMember';
  recipientName?: string;     // for ToMember method
  date: string;               // payment date
  transactionId?: string;     // optional transaction ID
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedByName?: string;    // reviewer name when approved/rejected
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserSession;
}

export type ExportPeriod = 'this-month' | 'last-month' | 'last-6-months' | 'this-year' | 'all';
