import { useState } from 'react';
import { Save, Upload, Wifi, WifiOff, Plus, Edit3 } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import { DEFAULT_SETTINGS, WORKING_DAYS } from '../utils/constants';
import { classNames } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [clinic, setClinic] = useState(DEFAULT_SETTINGS);
  const [whatsapp, setWhatsapp] = useState({ provider: 'twilio', apiKey: '', phoneNumberId: '', isActive: false });
  const [users] = useState([
    { id: 'u1', email: 'doctor@clinicflow.com', name: 'Dr. Rajesh Sharma', role: 'admin', isActive: true },
    { id: 'u2', email: 'receptionist@clinicflow.com', name: 'Priya Desai', role: 'receptionist', isActive: true },
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Clinic Settings</h1>
          <p className="text-sm text-[#6B7280] mt-1">Configure your clinic profile and system preferences</p>
        </div>
      </div>

      {/* ── Clinic Profile ── */}
      <Card>
        <CardHeader title="Clinic Profile" subtitle="Basic information about your clinic" />
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Input label="Clinic Name" value={clinic.clinicName} onChange={e => setClinic({ ...clinic, clinicName: e.target.value })} />
            <Input label="Doctor Name" value={clinic.doctorName} onChange={e => setClinic({ ...clinic, doctorName: e.target.value })} />
            <Input label="Phone" value={clinic.phone} onChange={e => setClinic({ ...clinic, phone: e.target.value })} />
            <Input label="Email" value={clinic.email} onChange={e => setClinic({ ...clinic, email: e.target.value })} />
          </div>
          <Input label="Address" type="textarea" value={clinic.address} onChange={e => setClinic({ ...clinic, address: e.target.value })} />
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2 border-y border-[#E5E7EB]">
            <div className="w-16 h-16 rounded-xl bg-[#F9FAFB] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center text-[#9CA3AF] shrink-0">
              <Upload size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#111827]">Clinic Logo</p>
              <p className="text-xs text-[#6B7280] mt-0.5">PNG or SVG, max 2MB. Recommended 200x200px.</p>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button icon={Save} onClick={() => toast.success('Clinic profile saved!')}>Save Profile</Button>
          </div>
        </div>
      </Card>

      {/* ── Appointment Slots ── */}
      <Card>
        <CardHeader title="Appointment Schedule" subtitle="Configure your strict timing and slots" />
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
            <Input label="Slot Duration" type="select" value={clinic.slotDuration} onChange={e => setClinic({ ...clinic, slotDuration: Number(e.target.value) })}>
              <option value={15}>15 minutes</option><option value={20}>20 minutes</option><option value={30}>30 minutes</option>
            </Input>
            <Input label="Start Time" type="time" value={clinic.startTime} onChange={e => setClinic({ ...clinic, startTime: e.target.value })} />
            <Input label="End Time" type="time" value={clinic.endTime} onChange={e => setClinic({ ...clinic, endTime: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 pt-5 border-t border-[#E5E7EB]">
            <Input label="Lunch Break Start" type="time" value={clinic.breakStart} onChange={e => setClinic({ ...clinic, breakStart: e.target.value })} />
            <Input label="Lunch Break End" type="time" value={clinic.breakEnd} onChange={e => setClinic({ ...clinic, breakEnd: e.target.value })} />
          </div>
          <div className="pt-5 border-t border-[#E5E7EB]">
            <label className="text-[13px] font-bold text-[#374151] block mb-3">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {WORKING_DAYS.map(day => {
                const active = clinic.workingDays.includes(day);
                return (
                  <button key={day} onClick={() => setClinic({ ...clinic, workingDays: active ? clinic.workingDays.filter(d => d !== day) : [...clinic.workingDays, day] })}
                    className={classNames('w-12 h-10 rounded-[10px] text-[13px] font-bold transition-all shadow-sm',
                      active ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]')}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button icon={Save} onClick={() => toast.success('Slot settings saved!')}>Save Schedule</Button>
          </div>
        </div>
      </Card>

      {/* ── WhatsApp ── */}
      <Card>
        <CardHeader title="WhatsApp Integration" subtitle="Automated patient messaging and alerts" />
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Input label="Service Provider" type="select" value={whatsapp.provider} onChange={e => setWhatsapp({ ...whatsapp, provider: e.target.value })}>
              <option value="twilio">Twilio Cloud API</option><option value="wati">WATI Setup</option><option value="meta">Meta Graph API</option>
            </Input>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#374151]">Connection Status</label>
              <div className="h-10 flex items-center">
                {whatsapp.isActive
                  ? <Badge color="success" dot className="shadow-sm"><Wifi size={12} className="mr-1.5" /> Connected</Badge>
                  : <Badge color="danger" dot className="shadow-sm"><WifiOff size={12} className="mr-1.5" /> Not Connected</Badge>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Input label="Authentication Token" type="password" value={whatsapp.apiKey} onChange={e => setWhatsapp({ ...whatsapp, apiKey: e.target.value })} placeholder="Enter secure token" />
            <Input label="Phone Number ID" value={whatsapp.phoneNumberId} onChange={e => setWhatsapp({ ...whatsapp, phoneNumberId: e.target.value })} placeholder="Enter phone ID" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => toast.success('Connection active.')}>Test Connection</Button>
            <Button icon={Save} onClick={() => toast.success('WhatsApp connected!')}>Save Config</Button>
          </div>
        </div>
      </Card>

      {/* ── Users ── */}
      <Card>
        <CardHeader title="User Management" subtitle="Manage staff access and roles" action={<Button size="sm" icon={Plus} variant="secondary">Invite Staff</Button>} />
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all">
              <Avatar name={u.name} size="md" className="shrink-0 hidden sm:flex" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111827] truncate">{u.name}</p>
                <p className="text-xs text-[#6B7280] truncate mt-0.5">{u.email}</p>
              </div>
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                <Badge color={u.role === 'admin' ? 'primary' : 'gray'} className="uppercase !text-[10px] shadow-sm">{u.role}</Badge>
                <Badge color={u.isActive ? 'success' : 'danger'} dot className="shadow-sm">{u.isActive ? 'Active' : 'Inactive'}</Badge>
                <button className="w-8 h-8 rounded-[8px] bg-white border border-[#E5E7EB] text-[#6B7280] shadow-sm flex items-center justify-center hover:text-[#2563EB] hover:border-[#2563EB] transition-colors shrink-0"><Edit3 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
