"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit, Calendar, Pill, MessageSquare, Phone, Mail, Activity, UserX, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { formatCurrency, getTreatmentType } from "@/lib/utils"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getPatient, updatePatient, deletePatient } from "@/services/patient.service"
import { getVisitsByPatient } from "@/services/visit.service"
import { getPaymentsByPatient } from "@/services/payment.service"
import { getAppointmentsByPatient } from "@/services/appointment.service"
import type { Patient, Visit, Payment, Appointment } from "@/lib/types"

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("visits")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editGender, setEditGender] = useState("Male")
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [selectedWhatsAppNumber, setSelectedWhatsAppNumber] = useState("9420893995")

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [p, v, pay, apt] = await Promise.all([
          getPatient(patientId),
          getVisitsByPatient(patientId),
          getPaymentsByPatient(patientId),
          getAppointmentsByPatient(patientId),
        ])
        setPatient(p)
        setVisits(v)
        setPayments(pay)
        setAppointments(apt)
        if (p) setEditGender(p.gender)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [patientId])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!patient?.id) return
    setIsSaving(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      const updateData: any = {
        caseNumber: fd.get("caseNumber") as string,
        fullName: `${fd.get("firstName")} ${fd.get("lastName")}`,
        mobileNumber: fd.get("mobile") as string,
        alternateMobile: fd.get("alternateMobile") as string || "",
        age: parseInt(fd.get("age") as string) || 0,
        gender: editGender as "Male" | "Female" | "Other",
        dateOfBirth: fd.get("dob") as string || "",
        bloodGroup: fd.get("bloodGroup") as string || "",
        email: fd.get("email") as string || "",
        occupation: fd.get("occupation") as string || "",
        maritalStatus: fd.get("maritalStatus") as string || "",
        address: {
          line1: fd.get("addressLine1") as string || "",
          city: fd.get("city") as string || "",
          state: fd.get("state") as string || "",
          pincode: fd.get("pincode") as string || "",
        },
        allergies: fd.get("allergies") as string || "",
        chronicDiseases: fd.get("chronicDiseases") as string || "",
        emergencyContact: fd.get("emergencyContact") as string || "",
        notes: fd.get("notes") as string || "",
      };

      if (editGender === "Female") {
        updateData.lmp = fd.get("lmp") as string || "";
        updateData.menstrualCycleDays = parseInt(fd.get("menstrualCycleDays") as string) || null;
      } else {
        updateData.lmp = null;
      }

      await updatePatient(patient.id, updateData)
      const updated = await getPatient(patient.id)
      setPatient(updated)
      setIsEditModalOpen(false)
    } catch (e: any) {
      alert(e.message || "Failed to update patient.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading patient...</div>
  if (!patient) return <div className="flex items-center justify-center py-20 text-slate-500">Patient not found.</div>

  const nameParts = patient.fullName?.split(" ") || [""]
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""
  const ic = "w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link href="/patients" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Patients
      </Link>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Patient">
        <form className="space-y-3 max-h-[70vh] overflow-y-auto pr-2" onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Case Number</label><input required name="caseNumber" defaultValue={patient.caseNumber} className={ic} /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Mobile</label><input required name="mobile" type="tel" defaultValue={patient.mobileNumber} className={ic} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">First Name</label><input required name="firstName" defaultValue={firstName} className={ic} /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Last Name</label><input required name="lastName" defaultValue={lastName} className={ic} /></div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Age</label><input required name="age" type="number" defaultValue={patient.age} className={ic} /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Gender</label>
              <select value={editGender} onChange={(e) => setEditGender(e.target.value)} className={ic}>
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Blood</label><input name="bloodGroup" defaultValue={patient.bloodGroup} className={ic} /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">DOB</label><input name="dob" type="date" defaultValue={patient.dateOfBirth} className={ic} /></div>
          </div>
          {editGender === "Female" && (
            <div className="p-3 bg-pink-50 border border-pink-100 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-pink-800">LMP</label>
                  <input name="lmp" type="date" defaultValue={patient.lmp} className={ic} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-pink-800">Cycle (days)</label>
                  <input name="menstrualCycleDays" type="number" defaultValue={patient.menstrualCycleDays} className={ic} placeholder="28" />
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Alt. Mobile</label><input name="alternateMobile" defaultValue={patient.alternateMobile} className={ic} /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Email</label><input name="email" type="email" defaultValue={patient.email} className={ic} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Emergency</label><input name="emergencyContact" defaultValue={patient.emergencyContact} className={ic} /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Occupation</label><input name="occupation" defaultValue={patient.occupation} className={ic} /></div>
          </div>
          <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Address</label><input name="addressLine1" defaultValue={patient.address?.line1} className={ic} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">City</label><input name="city" defaultValue={patient.address?.city} className={ic} /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">State</label><input name="state" defaultValue={patient.address?.state} className={ic} /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Pincode</label><input name="pincode" defaultValue={patient.address?.pincode} className={ic} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Marital Status</label>
              <select name="maritalStatus" defaultValue={patient.maritalStatus} className={ic}>
                <option value="">Select</option><option value="Single">Single</option><option value="Married">Married</option><option value="Divorced">Divorced</option><option value="Widowed">Widowed</option>
              </select>
            </div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Allergies</label><input name="allergies" defaultValue={patient.allergies} className={ic} /></div>
          </div>
          <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Chronic Diseases</label><input name="chronicDiseases" defaultValue={patient.chronicDiseases} className={ic} /></div>
          <div className="space-y-1"><label className="text-sm font-medium text-slate-700">Notes</label><textarea name="notes" defaultValue={patient.notes} className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} /></div>
          <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-white pb-1">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} title="Send WhatsApp Message">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Select the number to send WhatsApp details from:</p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" value="9420893995" checked={selectedWhatsAppNumber === "9420893995"} onChange={(e) => setSelectedWhatsAppNumber(e.target.value)} className="text-green-600 w-4 h-4" />
              <span className="text-sm font-medium text-slate-900">Primary (+91 9420893995)</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" value="Secondary" checked={selectedWhatsAppNumber === "Secondary"} onChange={(e) => setSelectedWhatsAppNumber(e.target.value)} className="text-green-600 w-4 h-4" />
              <span className="text-sm font-medium text-slate-900">Secondary Number</span>
            </label>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsWhatsAppModalOpen(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => {
              window.open(`https://wa.me/91${patient.mobileNumber}?text=Hello ${firstName}, this message is sent from our clinic via +91 ${selectedWhatsAppNumber}.`, '_blank')
              setIsWhatsAppModalOpen(false)
            }}>
              <MessageSquare className="w-4 h-4 mr-2" /> Send Message
            </Button>
          </div>
        </div>
      </Modal>

      {/* Patient Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
            {patient.photo ? (
              <img src={patient.photo} alt={patient.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" />
            ) : (
              <Avatar fallback={patient.fullName?.substring(0, 2).toUpperCase()} size="xl" />
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{patient.fullName}</h1>
                <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">Case: {patient.caseNumber}</Badge>
                <Badge variant="outline" className={`font-bold ${getTreatmentType(patient.caseNumber) === 'Homeopathic' ? 'border-green-200 text-green-700 bg-green-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                  {getTreatmentType(patient.caseNumber)}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {patient.mobileNumber}</span>
                {patient.alternateMobile && <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-slate-400" /> {patient.alternateMobile}</span>}
                {patient.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {patient.email}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="secondary">{patient.gender}</Badge>
                <Badge variant="secondary">{patient.age} yrs</Badge>
                {patient.bloodGroup && <Badge variant="secondary">{patient.bloodGroup}</Badge>}
                {patient.maritalStatus && <Badge variant="secondary">{patient.maritalStatus}</Badge>}
                {patient.occupation && <Badge variant="secondary">{patient.occupation}</Badge>}
                {patient.lmp && <Badge variant="secondary">LMP: {patient.lmp}</Badge>}
                {patient.menstrualCycleDays && <Badge variant="secondary">Cycle: {patient.menstrualCycleDays}d</Badge>}
              </div>
              {/* Khata Balance Indicator */}
              {(patient.khataBalance ?? 0) !== 0 && (
                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${(patient.khataBalance || 0) < 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  <BookOpen className="w-4 h-4" />
                  Khata: {(patient.khataBalance || 0) < 0 ? `Due ${formatCurrency(Math.abs(patient.khataBalance || 0))}` : `Advance ${formatCurrency(patient.khataBalance || 0)}`}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={async () => {
              if (window.confirm("Are you sure you want to delete this patient?")) {
                await deletePatient(patient.id!)
                router.push("/patients")
              }
            }}>
              <UserX className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        {/* Extended Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-sm">
          {patient.address?.line1 && (
            <div><span className="text-xs font-semibold text-slate-400 uppercase">Address</span><p className="text-slate-700 mt-0.5">{patient.address.line1}{patient.address.city ? `, ${patient.address.city}` : ""}{patient.address.state ? `, ${patient.address.state}` : ""}{patient.address.pincode ? ` - ${patient.address.pincode}` : ""}</p></div>
          )}
          {patient.emergencyContact && (
            <div><span className="text-xs font-semibold text-slate-400 uppercase">Emergency Contact</span><p className="text-slate-700 mt-0.5">{patient.emergencyContact}</p></div>
          )}
          {patient.allergies && (
            <div><span className="text-xs font-semibold text-red-400 uppercase">Allergies</span><p className="text-red-600 font-medium mt-0.5">{patient.allergies}</p></div>
          )}
          {patient.chronicDiseases && (
            <div><span className="text-xs font-semibold text-orange-400 uppercase">Chronic Diseases</span><p className="text-orange-700 font-medium mt-0.5">{patient.chronicDiseases}</p></div>
          )}
          {patient.dateOfBirth && (
            <div><span className="text-xs font-semibold text-slate-400 uppercase">Date of Birth</span><p className="text-slate-700 mt-0.5">{patient.dateOfBirth}</p></div>
          )}
          {patient.notes && (
            <div className="col-span-2"><span className="text-xs font-semibold text-slate-400 uppercase">Notes</span><p className="text-slate-700 mt-0.5">{patient.notes}</p></div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <Button variant="outline" className="w-full justify-start text-slate-700" onClick={() => router.push('/appointments')}>
            <Calendar className="w-4 h-4 mr-2 text-blue-600" /> Book Appt
          </Button>
          <Button variant="outline" className="w-full justify-start text-slate-700" onClick={() => router.push('/visits')}>
            <Pill className="w-4 h-4 mr-2 text-green-600" /> New Visit
          </Button>
          <Button variant="outline" className="w-full justify-start text-slate-700" onClick={() => setIsWhatsAppModalOpen(true)}>
            <MessageSquare className="w-4 h-4 mr-2 text-green-500" /> WhatsApp
          </Button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto">
        {["visits", "appointments", "payments", "khata"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {tab === "khata" ? "Khata Ledger" : tab} ({tab === "visits" ? visits.length : tab === "appointments" ? appointments.length : tab === "payments" ? payments.length : (visits.length + payments.length)})
          </button>
        ))}
      </div>

      {activeTab === "visits" && (
        <div className="space-y-4">
          {visits.length === 0 && <div className="py-12 text-center text-sm text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">No visit records</div>}
          {visits.map(visit => (
            <div key={visit.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{visit.createdAt?.toDate?.()?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) || "Visit"}</h3>
              </div>
              {visit.vitals && (
                <div className="flex flex-wrap gap-4 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700">
                  {visit.vitals.bp && <span><Activity className="w-4 h-4 inline text-slate-400 mr-1" /><strong>BP:</strong> {visit.vitals.bp}</span>}
                  {visit.vitals.weight && <span><strong>Weight:</strong> {visit.vitals.weight}kg</span>}
                  {visit.vitals.temperature && <span><strong>Temp:</strong> {visit.vitals.temperature} F</span>}
                </div>
              )}
              <div className="space-y-3">
                <div><h4 className="text-xs font-semibold text-slate-500 uppercase">Complaints</h4><p className="text-sm text-slate-900">{visit.complaints}</p></div>
                <div><h4 className="text-xs font-semibold text-slate-500 uppercase">Diagnosis</h4><p className="text-sm text-slate-900 font-medium">{visit.diagnosis}</p></div>
                {visit.prescriptions?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Medicines</h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                          <tr><th className="px-4 py-2">Medicine</th><th className="px-4 py-2">Dosage</th><th className="px-4 py-2">Freq</th><th className="px-4 py-2">Days</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {visit.prescriptions.map((med, i) => (
                            <tr key={i}><td className="px-4 py-2 font-medium">{med.name}</td><td className="px-4 py-2">{med.dosage}</td><td className="px-4 py-2">{med.frequency}</td><td className="px-4 py-2">{med.days}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {visit.followUpDate && (
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">Follow-up</h4>
                    <p className="text-sm text-slate-900">{visit.followUpDate}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="space-y-3">
          {appointments.length === 0 && <div className="py-12 text-center text-sm text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">No appointments</div>}
          {appointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{apt.appointmentDate} at {apt.timeSlot}</p>
                <p className="text-xs text-slate-500 mt-1">{apt.type}</p>
              </div>
              <Badge variant={apt.status === "completed" ? "completed" : apt.status === "cancelled" ? "destructive" : "pending"}>{apt.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-3">
          {payments.length === 0 && <div className="py-12 text-center text-sm text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">No payment records</div>}
          {payments.map(pay => (
            <div key={pay.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{formatCurrency(pay.amount)}</p>
                <p className="text-xs text-slate-500 mt-1">{pay.date} • {pay.paymentMethod?.toUpperCase()}{pay.description ? ` - ${pay.description}` : ""}</p>
              </div>
              <Badge variant={pay.status === "paid" ? "completed" : "pending"}>{pay.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {activeTab === "khata" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Khata Ledger (Passbook)
              </h3>
              <div className={`px-3 py-1 rounded-lg text-sm font-bold ${(patient.khataBalance || 0) < 0 ? 'bg-red-50 text-red-700' : (patient.khataBalance || 0) > 0 ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-700'}`}>
                Balance: {(patient.khataBalance || 0) < 0 ? `Due ${formatCurrency(Math.abs(patient.khataBalance || 0))}` : formatCurrency(patient.khataBalance || 0)}
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2 text-right text-red-600">Debit (Rs.)</th>
                    <th className="px-4 py-2 text-right text-green-600">Credit (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    // Combine visits (debits) and payments (credits) into one timeline
                    const entries: { date: string; desc: string; debit: number; credit: number }[] = []
                    visits.forEach(v => {
                      if (v.totalBill && v.totalBill > 0) {
                        entries.push({
                          date: v.createdAt?.toDate?.()?.toLocaleDateString() || "-",
                          desc: `Visit: ${v.diagnosis || "Consultation"}`,
                          debit: v.totalBill,
                          credit: 0,
                        })
                      }
                    })
                    payments.forEach(p => {
                      entries.push({
                        date: p.date || p.createdAt?.toDate?.()?.toLocaleDateString() || "-",
                        desc: `Payment: ${p.paymentMethod?.toUpperCase() || ""}${p.description ? ` - ${p.description}` : ""}`,
                        debit: 0,
                        credit: p.amount,
                      })
                    })
                    // Sort by date (newest first)
                    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                    if (entries.length === 0) {
                      return <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No transactions recorded</td></tr>
                    }

                    return entries.map((entry, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-600">{entry.date}</td>
                        <td className="px-4 py-2 text-slate-900 font-medium">{entry.desc}</td>
                        <td className="px-4 py-2 text-right font-medium text-red-600">{entry.debit > 0 ? formatCurrency(entry.debit) : "-"}</td>
                        <td className="px-4 py-2 text-right font-medium text-green-600">{entry.credit > 0 ? formatCurrency(entry.credit) : "-"}</td>
                      </tr>
                    ))
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
