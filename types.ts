
export type Role = 'ADMIN' | 'EMPLOYEE';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

// Leave balances are now keyed by the leave type ID (string)
export interface LeaveBalance {
  [key: string]: number;
}

export interface LeaveTypeDefinition {
  id: string;
  nameEn: string;
  nameAr: string;
  defaultBalance: number;
  color: string;
  icon: string;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional for backward compatibility, but required for new users
  fullName: string;
  role: Role;
  balance: LeaveBalance;
  approverId?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  typeId: string; // References LeaveTypeDefinition.id
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  approverComment?: string;
  approvedBy?: string;
}

export type Language = 'en' | 'ar';
