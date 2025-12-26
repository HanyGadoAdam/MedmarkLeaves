
import { User, LeaveRequest, LeaveTypeDefinition } from './types';

const KEYS = {
  USERS: 'smartleave_users',
  REQUESTS: 'smartleave_requests',
  LEAVE_TYPES: 'smartleave_types'
};

const DEFAULT_LEAVE_TYPES: LeaveTypeDefinition[] = [
  { id: 'ANNUAL', nameEn: 'Annual Leave', nameAr: 'إجازة سنوية', defaultBalance: 30, color: '#2563eb', icon: 'BriefcaseIcon' },
  { id: 'SICK', nameEn: 'Sick Leave', nameAr: 'إجازة مرضية', defaultBalance: 15, color: '#ef4444', icon: 'ActivityIcon' },
  { id: 'CASUAL', nameEn: 'Casual Leave', nameAr: 'إجازة طارئة', defaultBalance: 5, color: '#f59e0b', icon: 'TrendingUpIcon' },
  { id: 'MATERNITY', nameEn: 'Maternity Leave', nameAr: 'إجازة أمومة', defaultBalance: 90, color: '#ec4899', icon: 'HeartIcon' },
  { id: 'UNPAID', nameEn: 'Unpaid Leave', nameAr: 'إجازة بدون راتب', defaultBalance: 365, color: '#64748b', icon: 'FileTextIcon' }
];

const INITIAL_USERS: User[] = [
  { 
    id: '1', 
    username: 'admin', 
    password: 'password123',
    fullName: 'System Admin', 
    role: 'ADMIN', 
    balance: { ANNUAL: 30, SICK: 15, CASUAL: 5, MATERNITY: 0, UNPAID: 365 } 
  },
  { 
    id: '2', 
    username: 'ahmed', 
    password: 'password123',
    fullName: 'Ahmed Hassan', 
    role: 'EMPLOYEE', 
    balance: { ANNUAL: 20, SICK: 12, CASUAL: 3, MATERNITY: 0, UNPAID: 365 } 
  }
];

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    if (!data) {
      db.saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  },
  saveUsers: (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),

  getRequests: (): LeaveRequest[] => {
    const data = localStorage.getItem(KEYS.REQUESTS);
    return data ? JSON.parse(data) : [];
  },
  saveRequests: (requests: LeaveRequest[]) => localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests)),

  getLeaveTypes: (): LeaveTypeDefinition[] => {
    const data = localStorage.getItem(KEYS.LEAVE_TYPES);
    if (!data) {
      db.saveLeaveTypes(DEFAULT_LEAVE_TYPES);
      return DEFAULT_LEAVE_TYPES;
    }
    return JSON.parse(data);
  },
  saveLeaveTypes: (types: LeaveTypeDefinition[]) => localStorage.setItem(KEYS.LEAVE_TYPES, JSON.stringify(types))
};
