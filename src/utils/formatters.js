import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO, differenceInYears } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date instanceof Date ? date : date.toDate?.() || new Date(date);
  return format(d, 'MMM dd, yyyy');
};

export const formatDateShort = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date instanceof Date ? date : date.toDate?.() || new Date(date);
  return format(d, 'dd/MM/yy');
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

export const formatRelativeDate = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date instanceof Date ? date : date.toDate?.() || new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatCurrency = (amount) => {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  return phone;
};

export const formatDayOfWeek = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date instanceof Date ? date : date.toDate?.() || new Date(date);
  return format(d, 'EEEE, MMMM dd, yyyy');
};

export const calculateAge = (dob) => {
  if (!dob) return null;
  const d = typeof dob === 'string' ? parseISO(dob) : dob instanceof Date ? dob : dob.toDate?.() || new Date(dob);
  return differenceInYears(new Date(), d);
};
