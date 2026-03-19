import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Check, X, AlertTriangle, User } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import SearchBar from '../components/common/SearchBar';
import { DEMO_APPOINTMENTS, DEMO_PATIENTS } from '../utils/demoData';
import { formatTime, formatDayOfWeek, formatDate } from '../utils/formatters';
import { generateTimeSlots, classNames } from '../utils/helpers';
import { DEFAULT_SETTINGS } from '../utils/constants';

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState(DEMO_APPOINTMENTS);
  const [showBooking, setShowBooking] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [bookingData, setBookingData] = useState({ patientId: '', date: '', timeSlot: '', type: 'new', notes: '', sendWhatsApp: true });
  const [selectedPatient, setSelectedPatient] = useState(null);

  const dateStr = currentDate.toISOString().split('T')[0];
  const dayAppointments = appointments.filter(a => a.date === dateStr);

  const timeSlots = useMemo(() =>
    generateTimeSlots(DEFAULT_SETTINGS.startTime, DEFAULT_SETTINGS.endTime, DEFAULT_SETTINGS.breakStart, DEFAULT_SETTINGS.breakEnd, DEFAULT_SETTINGS.slotDuration),
  []);

  const statusCounts = useMemo(() => ({
    total: dayAppointments.length,
    completed: dayAppointments.filter(a => a.status === 'completed').length,
    scheduled: dayAppointments.filter(a => a.status === 'scheduled').length,
    cancelled: dayAppointments.filter(a => a.status === 'cancelled').length,
  }), [dayAppointments]);

  const changeDate = (days) => { const d = new Date(currentDate); d.setDate(d.getDate() + days); setCurrentDate(d); };
  const updateStatus = (id, status) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));

  const filteredPatients = DEMO_PATIENTS.filter(p =>
    patientSearch && (`${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) || p.mobile.includes(patientSearch))
  );

  const handleBook = () => {
    if (!selectedPatient || !bookingData.timeSlot) return;
    const newAppt = {
      id: 'a' + Date.now(), patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientMobile: selectedPatient.mobile, date: bookingData.date || dateStr,
      timeSlot: bookingData.timeSlot, endTime: '', status: 'scheduled',
      type: bookingData.type, notes: bookingData.notes,
      whatsappSent: bookingData.sendWhatsApp, createdAt: new Date().toISOString(),
    };
    setAppointments(prev => [...prev, newAppt]);
    setShowBooking(false); setSelectedPatient(null); setPatientSearch('');
    setBookingData({ patientId: '', date: '', timeSlot: '', type: 'new', notes: '', sendWhatsApp: true });
  };

  return (
    <div className="flex flex-col min-h-0 space-y-4 sm:space-y-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Appointments</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage scheduling and daily queues</p>
        </div>
        <Button icon={Plus} onClick={() => setShowBooking(true)} className="hidden sm:flex shrink-0">Book Appointment</Button>
      </div>

      {/* ── Utilities Row ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between shrink-0 w-full">
        {/* Date nav */}
        <Card padding="p-2 sm:p-2.5" className="sm:w-80 shadow-sm border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <button onClick={() => changeDate(-1)} className="p-2 rounded-[8px] hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><ChevronLeft size={18} /></button>
            <div className="text-center px-2 min-w-0">
              <p className="text-[13px] font-bold text-[#111827] truncate">{formatDayOfWeek(currentDate)}</p>
              <button onClick={() => setCurrentDate(new Date())} className="text-[11px] font-semibold text-[#2563EB] hover:underline mt-0.5">Go to Today</button>
            </div>
            <button onClick={() => changeDate(1)} className="p-2 rounded-[8px] hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><ChevronRight size={18} /></button>
          </div>
        </Card>

        {/* Status strip */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 items-center no-scrollbar">
          <Badge color="gray" className="px-3 py-1.5 shadow-sm bg-white border border-[#E5E7EB]">Total: {statusCounts.total}</Badge>
          <Badge color="success" dot className="px-3 py-1.5 shadow-sm">Done: {statusCounts.completed}</Badge>
          <Badge color="primary" dot className="px-3 py-1.5 shadow-sm">Pending: {statusCounts.scheduled}</Badge>
          <Badge color="danger" dot className="px-3 py-1.5 shadow-sm shrink-0">Cancelled: {statusCounts.cancelled}</Badge>
        </div>
      </div>

      {/* ── Slot list ── */}
      <Card padding="p-0" className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto divide-y divide-[#F3F4F6]">
          {timeSlots.map((slot) => {
            const appt = dayAppointments.find(a => a.timeSlot === slot.time);

            if (slot.isBreak) {
              return (
                <div key={slot.time} className="flex items-center gap-4 px-4 sm:px-6 py-3 bg-[#F9FAFB] border-y-2 border-dashed border-[#E5E7EB] my-1">
                  <span className="text-[13px] font-bold text-[#9CA3AF] w-14 shrink-0 text-right">{formatTime(slot.time)}</span>
                  <span className="text-xs text-[#9CA3AF] font-bold tracking-widest uppercase flex-1 text-center">— lunch break —</span>
                </div>
              );
            }

            if (!appt) {
              return (
                <div key={slot.time} className="flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-[#F9FAFB] transition-colors group">
                  <span className="text-[13px] font-bold text-[#9CA3AF] w-14 shrink-0 text-right">{formatTime(slot.time)}</span>
                  <div className="flex-1 flex justify-center">
                    <span className="text-[13px] font-medium text-[#D1D5DB] border border-dashed border-[#E5E7EB] rounded-[10px] w-full max-w-sm py-2 text-center group-hover:border-[#93C5FD] group-hover:text-[#60A5FA] bg-white transition-colors">
                      Available Slot
                    </span>
                  </div>
                  <button onClick={() => { setBookingData(prev => ({ ...prev, timeSlot: slot.time, date: dateStr })); setShowBooking(true); }}
                    className="w-9 h-9 shrink-0 rounded-[10px] bg-[#F3F4F6] text-[#6B7280] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-all shadow-sm group-hover:shadow">
                    <Plus size={16} />
                  </button>
                </div>
              );
            }

            return (
              <div key={slot.time} className="flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-[#EFF6FF] transition-colors group">
                <span className="text-[13px] font-bold text-[#2563EB] w-14 shrink-0 text-right">{formatTime(slot.time)}</span>
                <Avatar name={appt.patientName} size="md" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-[#111827] truncate cursor-pointer hover:text-[#2563EB] transition-colors" onClick={() => navigate(`/patients/${appt.patientId}`)}>
                    {appt.patientName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge color={appt.type === 'follow-up' ? 'purple' : 'teal'} className="shadow-sm">
                      {appt.type === 'follow-up' ? 'Follow-up' : 'New Visit'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {appt.status === 'scheduled' ? (
                    <>
                      <button onClick={() => updateStatus(appt.id, 'completed')} title="Complete" className="w-9 h-9 rounded-[10px] bg-white border border-[#E5E7EB] text-[#10B981] hover:bg-[#10B981] hover:text-white hover:border-[#10B981] shadow-sm flex items-center justify-center transition-colors"><Check exact="true" size={16} /></button>
                      <button onClick={() => updateStatus(appt.id, 'cancelled')} title="Cancel" className="w-9 h-9 rounded-[10px] bg-white border border-[#E5E7EB] text-[#EF4444] hover:bg-[#EF4444] hover:text-white hover:border-[#EF4444] shadow-sm flex items-center justify-center transition-colors max-sm:hidden"><X size={16} /></button>
                      <button onClick={() => updateStatus(appt.id, 'no-show')} title="No show" className="w-9 h-9 rounded-[10px] bg-white border border-[#E5E7EB] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white hover:border-[#F59E0B] shadow-sm flex items-center justify-center transition-colors max-sm:hidden"><AlertTriangle size={14} /></button>
                    </>
                  ) : (
                    <Badge color={appt.status === 'completed' ? 'success' : appt.status === 'cancelled' ? 'danger' : 'warning'} dot className="shadow-sm items-center h-8">
                      {appt.status === 'completed' ? 'Completed' : appt.status === 'cancelled' ? 'Cancelled' : 'No Show'}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── FAB ── */}
      <button onClick={() => setShowBooking(true)}
        className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#2563EB] text-white rounded-2xl shadow-lg flex items-center justify-center z-20 active:scale-95">
        <Plus size={24} />
      </button>

      {/* ── Booking modal ── */}
      <Modal isOpen={showBooking} onClose={() => { setShowBooking(false); setSelectedPatient(null); setPatientSearch(''); }} title="Book Appointment" size="md"
        footer={<><Button variant="secondary" onClick={() => setShowBooking(false)}>Cancel</Button><Button onClick={handleBook} disabled={!selectedPatient || !bookingData.timeSlot}>Confirm Booking</Button></>}>
        <div className="space-y-6">
          <div>
            <label className="text-[13px] font-bold text-[#374151] mb-2 block">1. Select Patient <span className="text-[#EF4444]">*</span></label>
            {selectedPatient ? (
              <div className="flex items-center gap-3 p-3 bg-white border-2 border-[#2563EB] rounded-[12px] shadow-sm">
                <Avatar name={`${selectedPatient.firstName} ${selectedPatient.lastName}`} size="md" />
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-[#111827] truncate">{selectedPatient.firstName} {selectedPatient.lastName}</p><p className="text-xs text-[#6B7280]">{selectedPatient.mobile}</p></div>
                <button onClick={() => { setSelectedPatient(null); setPatientSearch(''); }} className="p-2 bg-[#F3F4F6] rounded-[8px] text-[#9CA3AF] hover:text-[#EF4444] transition-colors"><X size={16} /></button>
              </div>
            ) : (
              <div className="relative">
                <SearchBar value={patientSearch} onChange={setPatientSearch} placeholder="Search by name or number…" />
                {filteredPatients.length > 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-[#E5E7EB] shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-[#F3F4F6]">
                    {filteredPatients.map(p => (
                      <button key={p.id} onClick={() => { setSelectedPatient(p); setPatientSearch(''); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] text-left transition-colors">
                        <Avatar name={`${p.firstName} ${p.lastName}`} size="md" />
                        <div className="min-w-0"><p className="text-sm font-bold text-[#111827] truncate">{p.firstName} {p.lastName}</p><p className="text-xs text-[#6B7280]">{p.mobile}</p></div>
                      </button>
                    ))}
                  </div>
                )}
                {patientSearch && filteredPatients.length === 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-[#E5E7EB] shadow-xl z-20 p-4 text-center">
                    <p className="text-sm text-[#6B7280] mb-3">No patients found.</p>
                    <Button size="sm" icon={User} fullWidth>Create New Patient</Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-[#E5E7EB]">
            <label className="text-[13px] font-bold text-[#374151] mb-2 block">2. Select Time & Details <span className="text-[#EF4444]">*</span></label>
            <div className="space-y-4">
              <Input label="Date" type="date" required value={bookingData.date || dateStr} onChange={e => setBookingData({ ...bookingData, date: e.target.value })} />
              
              <div>
                <label className="text-xs font-medium text-[#6B7280] block mb-1">Time Slot</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.filter(s => !s.isBreak).map(slot => {
                    const isBooked = dayAppointments.some(a => a.timeSlot === slot.time);
                    const isSelected = bookingData.timeSlot === slot.time;
                    return (
                      <button key={slot.time} onClick={() => !isBooked && setBookingData({ ...bookingData, timeSlot: slot.time })} disabled={isBooked}
                        className={classNames('py-2 rounded-[10px] text-[13px] font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-1',
                          isSelected ? 'bg-[#2563EB] text-white border-transparent' : '',
                          isBooked ? 'bg-[#F9FAFB] text-[#D1D5DB] border border-[#E5E7EB] cursor-not-allowed line-through' : '',
                          !isSelected && !isBooked ? 'bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#2563EB] hover:text-[#2563EB]' : '',
                        )}>{formatTime(slot.time)}</button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#6B7280] block mb-1">Visit Type</label>
                <div className="flex gap-2">
                  {['new', 'follow-up'].map(t => (
                    <button key={t} onClick={() => setBookingData({ ...bookingData, type: t })}
                      className={classNames('flex-1 py-2.5 rounded-[10px] font-bold text-[13px] transition-all border',
                        bookingData.type === t ? 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB]',
                      )}>{t === 'follow-up' ? 'Follow-up' : 'New Visit'}</button>
                  ))}
                </div>
              </div>

              <Input label="Additional Notes" type="textarea" value={bookingData.notes} onChange={e => setBookingData({ ...bookingData, notes: e.target.value })} placeholder="E.g., fever since 2 days..." />
              
              <label className="flex items-center gap-3 p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] cursor-pointer">
                <input type="checkbox" checked={bookingData.sendWhatsApp} onChange={e => setBookingData({ ...bookingData, sendWhatsApp: e.target.checked })}
                  className="w-5 h-5 rounded-[4px] border-[#D1D5DB] text-[#25D366] focus:ring-[#25D366] transition-colors" />
                <span className="text-sm font-bold text-[#111827]">Send WhatsApp Confirmation</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
