import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Calendar, Clock, Activity, FileText, ChevronRight, Check } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { DEMO_PATIENTS, DEMO_APPOINTMENTS, DEMO_VISITS, DEMO_PAYMENTS } from '../utils/demoData';
import { formatPhone, formatDate, formatTime } from '../utils/formatters';
import { classNames } from '../utils/helpers';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visits');

  const patient = DEMO_PATIENTS.find(p => p.id === id) || DEMO_PATIENTS[0];
  const patientVisits = DEMO_VISITS.filter(v => v.patientId === patient.id);
  const patientAppointments = DEMO_APPOINTMENTS.filter(a => a.patientId === patient.id);
  const patientPayments = DEMO_PAYMENTS.filter(p => p.patientId === patient.id);

  const tabs = [
    { id: 'visits',       label: 'Clinical Visits',           count: patientVisits.length },
    { id: 'appointments', label: 'Appointments', count: patientAppointments.length },
    { id: 'payments',     label: 'Payments & Bills',  count: patientPayments.length },
  ];

  return (
    <div className="flex flex-col min-h-0 space-y-6 animate-fadeIn pb-8">
      {/* ── Back button & Header ── */}
      <div className="flex items-center gap-4 shrink-0">
        <button onClick={() => navigate('/patients')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#E5E7EB] shadow-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Patient Profile</h1>
      </div>

      {/* ── Patient Info Card ── */}
      <Card padding="p-5 sm:p-6" className="shrink-0 relative overflow-hidden">
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EFF6FF] to-transparent rounded-full blur-3xl -z-10 opacity-60 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          <Avatar name={`${patient.firstName} ${patient.lastName}`} size="xl" className="shrink-0 w-24 h-24 text-2xl border-4 border-white shadow-sm" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111827] tracking-tight truncate">{patient.firstName} {patient.lastName}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#4B5563]">
                  <span className="flex items-center gap-1.5"><User size={16} className="text-[#9CA3AF]" /> {patient.age} yrs, {patient.gender}</span>
                  <span className="text-[#D1D5DB] hidden sm:block">•</span>
                  <span className="flex items-center gap-1.5"><Phone size={16} className="text-[#9CA3AF]" /> {formatPhone(patient.mobile)}</span>
                  {patient.email && (
                    <>
                      <span className="text-[#D1D5DB] hidden sm:block">•</span>
                      <span className="truncate max-w-[200px]">{patient.email}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="h-10 px-4 bg-white border border-[#E5E7EB] shadow-sm rounded-[10px] text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors whitespace-nowrap">Edit Profile</button>
                <button className="h-10 px-4 bg-[#2563EB] border border-transparent shadow-sm rounded-[10px] text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap">New Visit</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#F3F4F6]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">Blood Group</span>
                <Badge color="primary" className="!text-sm font-bold border border-[#BFDBFE]">{patient.bloodGroup || 'Not Recorded'}</Badge>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">Known Allergies</span>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.length > 0 
                    ? patient.allergies.map((a, i) => <Badge key={i} color="warning" className="border border-[#FDE68A]">{a}</Badge>)
                    : <span className="text-sm font-medium text-[#111827]">None reported</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Tabs ── */}
      <div className="flex space-x-6 border-b border-[#E5E7EB] overflow-x-auto no-scrollbar shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={classNames(
              'pb-3 text-sm font-bold transition-all whitespace-nowrap border-b-2',
              activeTab === tab.id ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#6B7280] hover:text-[#111827] hover:border-[#D1D5DB]'
            )}
          >
            {tab.label} <span className={classNames('ml-1.5 px-2 py-0.5 rounded-full text-xs', activeTab === tab.id ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F3F4F6] text-[#6B7280]')}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 min-h-0 flex flex-col">
        {activeTab === 'visits' && (
          <div className="space-y-4">
            {patientVisits.map((visit, index) => (
              <div key={visit.id} className="relative flex gap-6 group">
                {/* Timeline line */}
                {index !== patientVisits.length - 1 && (
                  <div className="absolute top-10 left-[19px] bottom-[-24px] w-px bg-[#E5E7EB]" />
                )}
                <div className="w-10 h-10 rounded-[10px] bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center shrink-0 z-10 text-[#2563EB] mt-1 group-hover:scale-110 group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                  <Activity size={18} />
                </div>
                <Card padding="p-5" className="flex-1 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3 border-b border-[#F3F4F6] pb-3">
                    <h3 className="text-[13px] font-bold text-[#111827] tracking-wider uppercase">{formatDate(visit.date)}</h3>
                    {visit.followUpDate && (
                      <span className="text-xs font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-1 rounded-[6px]">
                        Follow-up: {formatDate(visit.followUpDate)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">Diagnosis / Notes</p>
                      <p className="text-sm text-[#111827] font-medium leading-relaxed">{visit.diagnosis}</p>
                      {visit.medicines.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Prescription</p>
                          <ul className="space-y-2">
                            {visit.medicines.map((m, i) => (
                              <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm bg-[#F9FAFB] p-2.5 rounded-[8px] border border-[#E5E7EB]">
                                <span className="font-bold text-[#111827] flex-1 truncate">{m.name}</span>
                                <Badge color="gray" className="shrink-0">{m.dosage}</Badge>
                                <span className="text-[#6B7280] text-xs shrink-0 w-20 text-right">{m.duration}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Vitals Recorded</p>
                      <div className="bg-[#F9FAFB] rounded-[10px] p-3 border border-[#E5E7EB] space-y-2">
                        {visit.vitals.bloodPressure && <div className="flex justify-between text-sm"><span className="text-[#6B7280]">BP</span><span className="font-semibold text-[#111827]">{visit.vitals.bloodPressure}</span></div>}
                        {visit.vitals.temperature && <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Temp</span><span className="font-semibold text-[#111827]">{visit.vitals.temperature}°F</span></div>}
                        {visit.vitals.pulse && <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Pulse</span><span className="font-semibold text-[#111827]">{visit.vitals.pulse} bpm</span></div>}
                        {visit.vitals.weight && <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Weight</span><span className="font-semibold text-[#111827]">{visit.vitals.weight} kg</span></div>}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Similar safe layouts for appointments and payments tabs */}
        {activeTab === 'appointments' && (
          <div className="space-y-3">
            {patientAppointments.map((appt) => (
              <Card key={appt.id} padding="p-4" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-[10px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#111827] truncate">{formatDate(appt.date)}</h4>
                    <p className="text-xs font-semibold text-[#6B7280] mt-0.5 truncate flex items-center gap-1.5"><Clock size={12}/> {formatTime(appt.timeSlot)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-64 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E5E7EB]">
                  <Badge color={appt.type === 'follow-up' ? 'purple' : 'teal'} className="shadow-sm">{appt.type === 'follow-up' ? 'Follow-up' : 'New Visit'}</Badge>
                  <Badge color={appt.status === 'completed' ? 'success' : appt.status === 'cancelled' ? 'danger' : 'warning'} className="shadow-sm" dot>{appt.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3">
            {patientPayments.map((payment) => (
              <Card key={payment.id} padding="p-4" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-[10px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#111827] truncate">Receipt #{payment.receiptNo}</h4>
                    <p className="text-xs font-semibold text-[#6B7280] mt-0.5 truncate flex items-center gap-1.5"><Calendar size={12}/> {formatDate(payment.date)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-64 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E5E7EB]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">{payment.method}</span>
                  <span className="text-lg font-bold text-[#111827]">{formatCurrency(payment.amount)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
