import { LayoutDashboard, Users, Calendar, Stethoscope, CreditCard, Settings, BarChart3 } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['admin', 'doctor', 'receptionist'] },
  { id: 'patients', label: 'Patients', icon: Users, path: '/patients', roles: ['admin', 'doctor', 'receptionist'] },
  { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments', roles: ['admin', 'doctor', 'receptionist'] },
  { id: 'visits', label: 'Visits', icon: Stethoscope, path: '/visits', roles: ['admin', 'doctor', 'receptionist'] },
  { id: 'payments', label: 'Payments', icon: CreditCard, path: '/payments', roles: ['admin', 'doctor', 'receptionist'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports', roles: ['admin', 'doctor'], disabled: true },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', roles: ['admin'] },
];

export const APPOINTMENT_STATUS = {
  scheduled: { label: 'Scheduled', color: 'primary' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'danger' },
  'no-show': { label: 'No Show', color: 'warning' },
};

export const APPOINTMENT_TYPES = ['new', 'follow-up'];

export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
];

export const MEDICINE_FREQUENCIES = [
  { value: 'OD', label: 'OD (Once daily)' },
  { value: 'BD', label: 'BD (Twice daily)' },
  { value: 'TDS', label: 'TDS (Thrice daily)' },
  { value: 'QID', label: 'QID (Four times)' },
  { value: 'SOS', label: 'SOS (As needed)' },
  { value: 'HS', label: 'HS (At bedtime)' },
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DEFAULT_SETTINGS = {
  clinicName: 'ClinicFlow Medical Center',
  doctorName: 'Dr. Smith',
  phone: '+91 98765 43210',
  email: 'clinic@clinicflow.com',
  address: '123 Health Street, Medical District',
  slotDuration: 30,
  startTime: '09:00',
  endTime: '18:00',
  breakStart: '13:00',
  breakEnd: '14:00',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  receiptPrefix: 'CF',
  nextReceiptNo: 1,
};
