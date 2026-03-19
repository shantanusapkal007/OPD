import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, IndianRupee, ArrowRight, Smartphone, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import { DEMO_APPOINTMENTS, DEMO_PATIENTS, DEMO_PAYMENTS, DEMO_VISITS } from '../utils/demoData';
import { formatTime, formatCurrency, formatRelativeDate } from '../utils/formatters';
import { getGreeting } from '../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const todayAppointments = DEMO_APPOINTMENTS.filter(a => a.date === today);
  const pendingAppointments = todayAppointments.filter(a => a.status === 'scheduled');
  const todayRevenue = DEMO_PAYMENTS.filter(p => p.date === today).reduce((sum, p) => sum + p.amount, 0);

  const upcomingFollowups = DEMO_VISITS
    .filter(v => v.followUpDate && new Date(v.followUpDate) >= new Date())
    .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
    .slice(0, 5);

  const stats = [
    { label: "Today's Appointments", value: todayAppointments.length, icon: Calendar, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#2563EB]', trend: '+3' },
    { label: 'Pending',             value: pendingAppointments.length, icon: Clock,    iconBg: 'bg-[#FFFBEB]', iconColor: 'text-[#D97706]', trend: null },
    { label: 'New Patients',        value: 3,                          icon: Users,    iconBg: 'bg-[#F0FDFA]', iconColor: 'text-[#0F766E]', trend: '+2' },
    { label: "Today's Revenue",     value: formatCurrency(todayRevenue || 8500), icon: IndianRupee, iconBg: 'bg-[#ECFDF5]', iconColor: 'text-[#059669]', trend: '+12%' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* ── Greeting ── */}
      <div>
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
          {getGreeting()}, {user?.displayName?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-[#6B7280] mt-1.5">Here's what's happening at your clinic today</p>
      </div>

      {/* ── Stat Cards — uniform grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} padding="p-5" hover className="flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-[10px] ${stat.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={stat.iconColor} />
                </div>
                {stat.trend && (
                  <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-1 rounded-md shrink-0">
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="mt-auto">
                <p className="text-3xl font-bold text-[#111827] tracking-tight leading-none mb-1.5">{stat.value}</p>
                <p className="text-sm font-medium text-[#6B7280] truncate">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Two‑column section ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Today's Appointments */}
        <Card className="lg:col-span-3 flex flex-col min-h-0" padding="p-0">
          <div className="p-5 border-b border-[#E5E7EB] shrink-0">
            <CardHeader
              className="mb-0"
              title="Today's Appointments"
              icon={Calendar}
              action={
                <button onClick={() => navigate('/appointments')} className="text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors">
                  View All <ArrowRight size={14} />
                </button>
              }
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#F3F4F6] min-h-0">
            {todayAppointments.slice(0, 6).map((appt) => (
              <div
                key={appt.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
                onClick={() => navigate(`/patients/${appt.patientId}`)}
              >
                <div className="text-center w-14 shrink-0">
                  <p className="text-[13px] font-bold text-[#2563EB]">{formatTime(appt.timeSlot)}</p>
                </div>
                <Avatar name={appt.patientName} size="sm" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate group-hover:text-[#2563EB] transition-colors">{appt.patientName}</p>
                  <p className="text-xs text-[#6B7280] truncate mt-0.5 capitalize">{appt.type.replace('-', ' ')} Visit</p>
                </div>
                <Badge
                  color={appt.status === 'completed' ? 'success' : appt.status === 'cancelled' ? 'danger' : appt.status === 'no-show' ? 'warning' : 'primary'}
                  dot className="shrink-0"
                >
                  {appt.status === 'completed' ? 'Done' : appt.status === 'cancelled' ? 'Cancelled' : appt.status === 'no-show' ? 'No Show' : 'Pending'}
                </Badge>
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-[#6B7280]">No appointments for today</div>
            )}
          </div>
        </Card>

        {/* Recent Patients */}
        <Card className="lg:col-span-2 flex flex-col min-h-0" padding="p-0">
          <div className="p-5 border-b border-[#E5E7EB] shrink-0">
            <CardHeader
              className="mb-0"
              title="Recent Patients"
              icon={Users}
              action={
                <button onClick={() => navigate('/patients')} className="text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors">
                  View All <ArrowRight size={14} />
                </button>
              }
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#F3F4F6] min-h-0">
            {DEMO_PATIENTS.slice(0, 5).map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <Avatar name={`${patient.firstName} ${patient.lastName}`} size="md" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate group-hover:text-[#2563EB] transition-colors">{patient.firstName} {patient.lastName}</p>
                  <p className="text-xs text-[#6B7280] truncate mt-0.5">{patient.age}yrs · {patient.gender === 'male' ? 'M' : 'F'}</p>
                </div>
                <ChevronRight size={16} className="text-[#D1D5DB] shrink-0 group-hover:text-[#9CA3AF] transition-colors" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Upcoming Follow‑ups ── */}
      <Card padding="p-0" className="flex flex-col min-h-0">
        <div className="p-5 border-b border-[#E5E7EB] shrink-0">
          <CardHeader className="mb-0" title="Upcoming Follow-ups" subtitle="Patients expecting a visit in the next 7 days" icon={Clock} />
        </div>
        <div className="overflow-x-auto min-h-0">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Patient</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Diagnosis</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">Reminder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {upcomingFollowups.map((visit) => {
                const patient = DEMO_PATIENTS.find(p => p.id === visit.patientId);
                return (
                  <tr key={visit.id} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="px-5 py-4 text-sm font-medium text-[#111827]">{formatRelativeDate(visit.followUpDate)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'} size="sm" className="shrink-0" />
                        <span className="text-sm font-medium text-[#111827] truncate max-w-[150px]">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#4B5563] truncate max-w-[200px]" title={visit.diagnosis}>{visit.diagnosis}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Smartphone size={14} className="text-[#25D366] shrink-0" />
                        <Badge color={visit.followUpReminderSent ? 'success' : 'warning'}>
                          {visit.followUpReminderSent ? 'Sent' : 'Pending'}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {upcomingFollowups.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-[#6B7280]">No upcoming follow-ups</div>
          )}
        </div>
      </Card>
    </div>
  );
}
