import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Phone } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import SearchBar from '../components/common/SearchBar';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { DEMO_PATIENTS } from '../utils/demoData';
import { formatDate, formatPhone } from '../utils/formatters';
import { GENDERS, BLOOD_GROUPS } from '../utils/constants';

export default function PatientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState(DEMO_PATIENTS);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', mobile: '', email: '', gender: 'male',
    dateOfBirth: '', bloodGroup: '', allergies: '', address: '', emergencyContact: '', notes: '',
  });

  const filtered = useMemo(() => {
    if (!search) return patients;
    const q = search.toLowerCase();
    return patients.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.mobile.includes(q)
    );
  }, [search, patients]);

  const handleSave = () => {
    const newPatient = {
      ...formData,
      id: 'p' + (patients.length + 1),
      age: formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : 0,
      allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
      totalVisits: 0, lastVisitDate: null,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPatients([newPatient, ...patients]);
    setShowForm(false);
    setFormData({ firstName: '', lastName: '', mobile: '', email: '', gender: 'male', dateOfBirth: '', bloodGroup: '', allergies: '', address: '', emergencyContact: '', notes: '' });
  };

  return (
    <div className="flex flex-col min-h-0 space-y-4 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Patients</h1>
          <p className="text-sm text-[#6B7280] mt-1">{filtered.length} total patient records</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search patients..." className="w-full sm:w-64" />
          <Button icon={Plus} onClick={() => setShowForm(true)} className="hidden sm:flex shrink-0">Add Patient</Button>
        </div>
      </div>

      {/* ── Desktop table ── */}
      <Card padding="p-0" className="hidden sm:flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto min-h-0 flex-1">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Patient Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Mobile Info</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Demographics</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Last Visit</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total Visits</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((patient) => (
                <tr key={patient.id} className="hover:bg-[#F9FAFB] cursor-pointer transition-colors group" onClick={() => navigate(`/patients/${patient.id}`)}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${patient.firstName} ${patient.lastName}`} size="sm" className="shrink-0" />
                      <div className="min-w-0 max-w-[180px]">
                        <p className="text-sm font-semibold text-[#111827] truncate group-hover:text-[#2563EB] transition-colors">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-[#6B7280] truncate">{patient.bloodGroup || 'No BG'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[#4B5563]">{formatPhone(patient.mobile)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#111827]">{patient.age}y</span>
                      <Badge color={patient.gender === 'male' ? 'primary' : patient.gender === 'female' ? 'purple' : 'gray'}>
                        {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'O'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#4B5563]">{patient.lastVisitDate ? formatDate(patient.lastVisitDate) : '—'}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[#111827]">{patient.totalVisits}</td>
                  <td className="px-5 py-3.5 text-right"><ChevronRight size={16} className="text-[#D1D5DB] inline-block group-hover:text-[#9CA3AF] transition-colors" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20">
              <EmptyState title="No patients found" description="Try adjusting your search or add a new patient." action={() => setShowForm(true)} actionLabel="Add Patient" />
            </div>
          )}
        </div>
      </Card>

      {/* ── Mobile cards ── */}
      <div className="sm:hidden space-y-3 pb-4 flex-1 overflow-y-auto">
        {filtered.map((patient) => (
          <Card key={patient.id} hover onClick={() => navigate(`/patients/${patient.id}`)} padding="p-4" className="shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={`${patient.firstName} ${patient.lastName}`} size="md" className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111827] truncate">{patient.firstName} {patient.lastName}</p>
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-1 truncate">
                  <Phone size={12} className="shrink-0" /> {formatPhone(patient.mobile)}
                </div>
                <p className="text-xs font-medium text-[#6B7280] mt-1 truncate">
                  {patient?.age || 'N/A'} yrs · {patient?.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Unknown'}
                </p>
              </div>
              <ChevronRight size={18} className="text-[#D1D5DB] shrink-0" />
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <EmptyState title="No patients found" description="Try a different search." />}
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setShowForm(true)}
        className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#2563EB] text-white rounded-2xl shadow-lg hover:bg-[#1D4ED8] flex items-center justify-center transition-all z-20 active:scale-95"
      >
        <Plus size={24} />
      </button>

      {/* ── Add Patient Modal ── */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Patient"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.firstName || !formData.lastName || !formData.mobile}>Save Patient</Button>
          </>
        }
      >
        <div className="space-y-8">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-[#111827] mb-4 pb-2 border-b border-[#E5E7EB]">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <Input label="First Name" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Enter first name" />
              <Input label="Last Name" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Enter last name" />
              <Input label="Mobile Number" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="+91 XXXXX XXXXX" />
              <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
              <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-medium text-[#374151]">Gender <span className="text-[#EF4444]">*</span></label>
                <div className="flex gap-1.5 bg-[#F3F4F6] p-1.5 rounded-[12px]">
                  {GENDERS.map(g => (
                    <button key={g.value} type="button" onClick={() => setFormData({...formData, gender: g.value})}
                      className={classNames('flex-1 py-1.5 text-sm font-medium rounded-[8px] transition-all',
                        formData.gender === g.value ? 'bg-white text-[#111827] shadow-sm ring-1 ring-[#E5E7EB]' : 'text-[#6B7280] hover:text-[#374151]')}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-[#111827] mb-4 pb-2 border-b border-[#E5E7EB]">
              Medical Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <Input label="Blood Group" type="select" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </Input>
              <Input label="Known Allergies" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} placeholder="Comma separated list" />
            </div>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-[#111827] mb-4 pb-2 border-b border-[#E5E7EB]">
              Contact Details
            </h4>
            <div className="grid grid-cols-1 gap-y-5">
              <Input label="Full Address" type="textarea" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Enter complete residential address" />
              <Input label="Emergency Contact" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} placeholder="Name & Phone Number" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
