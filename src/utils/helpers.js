export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const generateReceiptNumber = (prefix = 'CF', num = 1) => {
  return `${prefix}-${String(num).padStart(4, '0')}`;
};

export const generateTimeSlots = (startTime, endTime, breakStart, breakEnd, duration = 30) => {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const [breakSH, breakSM] = breakStart.split(':').map(Number);
  const [breakEH, breakEM] = breakEnd.split(':').map(Number);

  let currentM = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const breakStartM = breakSH * 60 + breakSM;
  const breakEndM = breakEH * 60 + breakEM;

  while (currentM < endMinutes) {
    const isBreak = currentM >= breakStartM && currentM < breakEndM;
    const h = Math.floor(currentM / 60);
    const m = currentM % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    slots.push({ time: timeStr, isBreak });
    currentM += duration;
  }
  return slots;
};

export const getStatusColor = (status) => {
  const colors = {
    scheduled: { bg: 'bg-primary-50', text: 'text-primary-700', dot: 'bg-primary-500' },
    completed: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    cancelled: { bg: 'bg-danger-50', text: 'text-danger-700', dot: 'bg-danger-500' },
    'no-show': { bg: 'bg-warning-50', text: 'text-warning-700', dot: 'bg-warning-500' },
    'follow-up': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    new: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  };
  return colors[status] || colors.scheduled;
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');
