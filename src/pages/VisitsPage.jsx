import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Activity, CalendarClock, Pill } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import { DEMO_VISITS, DEMO_PATIENTS } from '../utils/demoData';
import { formatDate } from '../utils/formatters';

export default function VisitsPage() {
  const navigate = useNavigate();
  const [showAddVisit, setShowAddVisit] = useState(false);

  // Use a demo patient for the "Add Visit" flow
  const currentPatient = DEMO_PATIENTS[0];

  return (
    <div className="flex flex-col min-h-0 space-y-4 sm:space-y-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Active Visits</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage ongoing and recent patient consultations</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddVisit(!showAddVisit)} className="hidden sm:flex shrink-0">
          {showAddVisit ? 'Cancel Visit' : 'Start New Visit'}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-0 flex-1 overflow-hidden">
        {/* ── Recent Visits List (Left sidebar on desktop) ── */}
        <Card padding="p-0" className="w-full lg:w-96 shrink-0 flex flex-col min-h-0">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <h3 className="text-sm font-bold text-[#111827]">Recent Consultations</h3>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-[#F3F4F6]">
            {DEMO_VISITS.map((visit) => {
              const patient = DEMO_PATIENTS.find(p => p.id === visit.patientId) || DEMO_PATIENTS[0];
              return (
                <div key={visit.id} onClick={() => navigate(`/patients/${patient.id}`)}
                  className="flex items-start gap-3 p-4 hover:bg-[#EFF6FF] transition-colors cursor-pointer group">
                  <Avatar name={`${patient.firstName} ${patient.lastName}`} size="md" className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 gap-2">
                      <p className="text-sm font-bold text-[#111827] truncate group-hover:text-[#2563EB]">{patient.firstName} {patient.lastName}</p>
                      <span className="text-[11px] font-medium text-[#6B7280] shrink-0">{formatDate(visit.date)}</span>
                    </div>
                    <p className="text-xs text-[#4B5563] truncate leading-relaxed">{visit.diagnosis}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge color="blue" className="!text-[10px] !py-0.5">{visit.medicines.length} Medicines</Badge>
                      {visit.vitals.bloodPressure && <span className="text-[10px] text-[#6B7280]">BP: {visit.vitals.bloodPressure}</span>}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#D1D5DB] mt-1 shrink-0 group-hover:text-[#9CA3AF]" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Visit Form Area ── */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-y-auto">
          {showAddVisit ? (
            <div className="space-y-6 max-w-4xl mx-auto w-full pb-8">
              {/* Patient Info Card */}
              <Card padding="p-5" className="border-t-4 border-t-[#2563EB]">
                <div className="flex items-center gap-4">
                  <Avatar name={`${currentPatient.firstName} ${currentPatient.lastName}`} size="lg" className="shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-[#111827] truncate">{currentPatient.firstName} {currentPatient.lastName}</h2>
                    <p className="text-sm text-[#6B7280]">{currentPatient.age} yrs • {currentPatient.gender} • {currentPatient.bloodGroup}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Badge color="warning" dot>Allergies: {currentPatient.allergies.join(', ') || 'None'}</Badge>
                  </div>
                </div>
              </Card>

              {/* Vitals & Chief Complaints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader title="Vitals" icon={Activity} className="mb-4" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <Input label="Blood Pressure" placeholder="120/80" />
                    <Input label="Temperature" placeholder="98.6 °F" />
                    <Input label="Pulse Rate" placeholder="72 bpm" />
                    <Input label="Weight" placeholder="70 kg" />
                    <div className="col-span-2">
                      <Input label="SpO2 / Sugar" placeholder="Optional vitals" />
                    </div>
                  </div>
                </Card>
                <Card className="flex flex-col">
                  <CardHeader title="Clinical Notes" icon={Pill} className="mb-4" />
                  <div className="flex-1 flex flex-col gap-4">
                    <Input label="Chief Complaints" type="textarea" placeholder="Patient describes..." className="flex-1" />
                    <Input label="Diagnosis" type="textarea" placeholder="Clinical diagnosis..." className="flex-1" />
                  </div>
                </Card>
              </div>

              {/* Prescription / Medicines */}
              <Card>
                <CardHeader title="Prescription" icon={Pill} action={<Button size="sm" variant="secondary" icon={Plus}>Add Medicine</Button>} />
                <div className="overflow-x-auto min-h-0">
                  <table className="w-full text-left whitespace-nowrap mb-4">
                    <thead className="bg-[#F9FAFB] border-y border-[#E5E7EB]">
                      <tr>
                        <th className="px-4 py-2 text-xs font-bold text-[#6B7280] uppercase">Medicine Name</th>
                        <th className="px-4 py-2 text-xs font-bold text-[#6B7280] uppercase w-48">Dosage</th>
                        <th className="px-4 py-2 text-xs font-bold text-[#6B7280] uppercase w-40">Duration</th>
                        <th className="px-4 py-2 text-xs font-bold text-[#6B7280] uppercase w-56">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      <tr>
                        <td className="p-2"><Input placeholder="e.g. Paracetamol 500mg" /></td>
                        <td className="p-2">
                          <Input type="select">
                            <option>1-0-1 (Morning/Night)</option>
                            <option>1-1-1 (Mon/Aft/Night)</option>
                            <option>1-0-0 (Morning)</option>
                            <option>0-0-1 (Night)</option>
                            <option>SOS (As needed)</option>
                          </Input>
                        </td>
                        <td className="p-2"><Input placeholder="5 Days" /></td>
                        <td className="p-2"><Input placeholder="After meals" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Follow-up & Actions */}
              <Card>
                <CardHeader title="Follow-up & Instructions" icon={CalendarClock} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Follow-up Date" type="date" />
                  <Input label="Special Instructions (Diet, Rest, etc.)" type="textarea" />
                </div>
                <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-[#E5E7EB]">
                  <Button variant="ghost" onClick={() => setShowAddVisit(false)}>Cancel</Button>
                  <Button variant="secondary">Save as Draft</Button>
                  <Button>Complete Visit</Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 bg-white rounded-2xl border border-[#E5E7EB] border-dashed">
              <div className="text-center max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4">
                  <Activity size={32} className="text-[#2563EB]" />
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2">No Active Visit Selected</h3>
                <p className="text-sm text-[#6B7280] mb-6">Select a patient from the appointments list or the recent consultations to start or edit a visit.</p>
                <Button icon={Plus} onClick={() => setShowAddVisit(true)}>Start New Visit</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* ── Mobile FAB ── */}
      <button onClick={() => setShowAddVisit(true)}
        className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#2563EB] text-white rounded-2xl shadow-lg flex items-center justify-center z-20 active:scale-95">
        <Plus size={24} />
      </button>
    </div>
  );
}
