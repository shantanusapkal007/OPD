"use client"

import { useState, useEffect } from "react"
import { Pill, Plus, Activity, Thermometer, Heart, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { getVisits, addVisit } from "@/services/visit.service"
import { searchPatients } from "@/services/patient.service"
import type { Visit, Patient, Medicine } from "@/lib/types"

const ic = "w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
const lbl = "text-sm font-medium text-slate-700"
const secHead = "text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2 mb-1 pt-3 border-t border-slate-100"

export default function VisitsPage() {
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  const [patientSearch, setPatientSearch] = useState("")
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const fetchVisits = async () => {
    setLoading(true)
    try {
      const data = await getVisits()
      setVisits(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVisits() }, [])

  useEffect(() => {
    if (patientSearch.length >= 2) {
      searchPatients(patientSearch).then(setPatientResults)
    } else {
      setPatientResults([])
    }
  }, [patientSearch])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPatient) { alert("Please select a patient"); return }
    setIsSaving(true)
    const fd = new FormData(e.currentTarget)
    
    const rxText = (fd.get("prescription") as string) || ""
    const prescriptions: Medicine[] = rxText.split('\n').filter(l => l.trim()).map(line => ({
      name: line.trim(),
      dosage: "-",
      frequency: "As directed",
      days: 0
    }))

    try {
      await addVisit({
        patientId: selectedPatient.id!,
        patientName: selectedPatient.fullName,
        complaints: fd.get("complaints") as string || "",
        historyOfPresentIllness: fd.get("hpi") as string || "",
        pastHistory: fd.get("pastHistory") as string || "",
        familyHistory: fd.get("familyHistory") as string || "",
        examinationFindings: fd.get("examination") as string || "",
        diagnosis: fd.get("diagnosis") as string || "",
        totalBill: parseInt(fd.get("totalBill") as string) || 0,
        labTests: fd.get("labTests") as string || "",
        investigationsAdvised: fd.get("investigations") as string || "",
        advice: fd.get("advice") as string || "",
        referral: fd.get("referral") as string || "",
        followUpDate: fd.get("followUpDate") as string || "",
        prescriptions,
        vitals: {
          bp: fd.get("bp") as string || "",
          weight: parseInt(fd.get("weight") as string) || undefined,
          height: parseInt(fd.get("height") as string) || undefined,
          temperature: parseFloat(fd.get("temperature") as string) || undefined,
          pulse: parseInt(fd.get("pulse") as string) || undefined,
          spo2: parseInt(fd.get("spo2") as string) || undefined,
          respiratoryRate: parseInt(fd.get("respiratoryRate") as string) || undefined,
        },
      })
      setIsVisitModalOpen(false)
      setSelectedPatient(null)
      setPatientSearch("")
      fetchVisits()
    } catch (e: any) {
      alert(e.message || "Failed to record visit.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visits & Case Records</h1>
          <p className="text-sm text-slate-500">Manage patient visit history and prescriptions</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsVisitModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Visit
        </Button>
      </div>

      <Modal isOpen={isVisitModalOpen} onClose={() => setIsVisitModalOpen(false)} title="Record New Visit (Case Paper)">
        <form className="space-y-3 max-h-[75vh] overflow-y-auto pr-2" onSubmit={handleSave}>
          
          {/* Patient Selection */}
          <div className="space-y-1.5">
            <label className={lbl}>Patient Name *</label>
            <input type="text" value={selectedPatient ? selectedPatient.fullName : patientSearch}
              onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null) }}
              className={ic} placeholder="Search patient..." />
            {patientResults.length > 0 && !selectedPatient && (
              <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto bg-white shadow-lg">
                {patientResults.map(p => (
                  <button type="button" key={p.id} onClick={() => { setSelectedPatient(p); setPatientSearch(""); setPatientResults([]) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">{p.fullName} — {p.mobileNumber}</button>
                ))}
              </div>
            )}
          </div>

          {/* Vitals Section */}
          <h4 className={secHead}>Vitals</h4>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1"><label className={lbl}>BP</label><input name="bp" className={ic} placeholder="120/80" /></div>
            <div className="space-y-1"><label className={lbl}>Pulse (bpm)</label><input name="pulse" type="number" className={ic} placeholder="72" /></div>
            <div className="space-y-1"><label className={lbl}>Temp (°F)</label><input name="temperature" type="number" step="0.1" className={ic} placeholder="98.6" /></div>
            <div className="space-y-1"><label className={lbl}>SpO₂ (%)</label><input name="spo2" type="number" className={ic} placeholder="98" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><label className={lbl}>Weight (kg)</label><input name="weight" type="number" className={ic} placeholder="70" /></div>
            <div className="space-y-1"><label className={lbl}>Height (cm)</label><input name="height" type="number" className={ic} placeholder="170" /></div>
            <div className="space-y-1"><label className={lbl}>Resp Rate</label><input name="respiratoryRate" type="number" className={ic} placeholder="16" /></div>
          </div>

          {/* Clinical History */}
          <h4 className={secHead}>History & Complaints</h4>
          <div className="space-y-1"><label className={lbl}>Chief Complaints *</label><textarea name="complaints" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Fever since 3 days, headache, body ache..." /></div>
          <div className="space-y-1"><label className={lbl}>History of Present Illness</label><textarea name="hpi" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Detailed history of current illness..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className={lbl}>Past History</label><input name="pastHistory" className={ic} placeholder="Previous surgeries, illnesses..." /></div>
            <div className="space-y-1"><label className={lbl}>Family History</label><input name="familyHistory" className={ic} placeholder="Diabetes in family, etc" /></div>
          </div>

          {/* Examination & Diagnosis */}
          <h4 className={secHead}>Examination & Diagnosis</h4>
          <div className="space-y-1"><label className={lbl}>Examination Findings</label><textarea name="examination" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="On examination: Throat congested, abdomen soft..." /></div>
          <div className="space-y-1"><label className={lbl}>Diagnosis *</label><input required name="diagnosis" className={ic} placeholder="Acute Viral Fever" /></div>

          {/* Prescription */}
          <h4 className={secHead}>Prescription (Rx)</h4>
          <div className="space-y-1"><label className={lbl}>Medicines (one per line)</label><textarea name="prescription" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} placeholder="Tab Paracetamol 500mg — 1-0-1 x 3 days&#10;Tab Cetirizine 10mg — 0-0-1 x 5 days&#10;Syp Cough — 5ml TDS x 5 days" /></div>

          {/* Investigations */}
          <h4 className={secHead}>Investigations & Lab</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className={lbl}>Lab Tests Done</label><input name="labTests" className={ic} placeholder="CBC, Urine, X-ray..." /></div>
            <div className="space-y-1"><label className={lbl}>Investigations Advised</label><input name="investigations" className={ic} placeholder="MRI, Blood Sugar..." /></div>
          </div>

          {/* Advice & Follow Up */}
          <h4 className={secHead}>Advice & Follow-up</h4>
          <div className="space-y-1"><label className={lbl}>Advice / Instructions</label><textarea name="advice" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Take rest, drink fluids, avoid oily food..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className={lbl}>Follow-up Date</label><input name="followUpDate" type="date" className={ic} /></div>
            <div className="space-y-1"><label className={lbl}>Referral (if any)</label><input name="referral" className={ic} placeholder="Dr. XYZ, Cardiologist" /></div>
          </div>

          {/* Billing */}
          <div className="space-y-1.5 p-3 bg-red-50 border border-red-100 rounded-lg mt-2">
            <label className="text-sm font-medium text-red-800">Total Bill / Charge (₹) — Updates Khata Book</label>
            <input name="totalBill" type="number" className="w-full h-10 px-3 rounded border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" placeholder="500" />
          </div>

          <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-white pb-1">
            <Button type="button" variant="outline" onClick={() => setIsVisitModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Visit"}</Button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="py-20 text-center text-slate-500 flex-1">Loading visits...</div>
      ) : visits.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Pill className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No visits recorded</h3>
          <p className="text-sm text-slate-500 max-w-sm text-center mb-6">
            Start by selecting a patient and recording their visit details, vitals, and medicines.
          </p>
          <Button onClick={() => setIsVisitModalOpen(true)}>Record New Visit</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map(visit => (
            <div key={visit.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{visit.patientName}</h3>
                  <p className="text-xs text-slate-500">{visit.createdAt?.toDate?.()?.toLocaleDateString()}</p>
                </div>
                {visit.totalBill !== undefined && visit.totalBill > 0 && (
                  <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg">₹{visit.totalBill}</span>
                )}
              </div>
              
              {/* Vitals Row */}
              {visit.vitals && (
                <div className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-lg mb-4 text-sm text-slate-700">
                  {visit.vitals.bp && <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-red-400"/>BP: {visit.vitals.bp}</span>}
                  {visit.vitals.pulse && <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-pink-400"/>Pulse: {visit.vitals.pulse}</span>}
                  {visit.vitals.temperature && <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-orange-400"/>Temp: {visit.vitals.temperature}°F</span>}
                  {visit.vitals.spo2 && <span>SpO₂: {visit.vitals.spo2}%</span>}
                  {visit.vitals.weight && <span>Wt: {visit.vitals.weight}kg</span>}
                  {visit.vitals.height && <span>Ht: {visit.vitals.height}cm</span>}
                  {visit.vitals.respiratoryRate && <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-blue-400"/>RR: {visit.vitals.respiratoryRate}</span>}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {visit.complaints && (
                  <div><h4 className="text-xs font-semibold text-slate-400 uppercase">Chief Complaints</h4><p className="text-slate-800 mt-0.5">{visit.complaints}</p></div>
                )}
                {visit.historyOfPresentIllness && (
                  <div><h4 className="text-xs font-semibold text-slate-400 uppercase">HPI</h4><p className="text-slate-800 mt-0.5">{visit.historyOfPresentIllness}</p></div>
                )}
                {visit.examinationFindings && (
                  <div><h4 className="text-xs font-semibold text-slate-400 uppercase">Examination</h4><p className="text-slate-800 mt-0.5">{visit.examinationFindings}</p></div>
                )}
                <div><h4 className="text-xs font-semibold text-slate-400 uppercase">Diagnosis</h4><p className="text-slate-900 font-medium mt-0.5">{visit.diagnosis}</p></div>
              </div>

              {visit.prescriptions?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Rx (Prescription)</h4>
                  <ul className="text-sm text-slate-700 list-disc list-inside space-y-0.5">
                    {visit.prescriptions.map((px, i) => <li key={i}>{px.name}</li>)}
                  </ul>
                </div>
              )}

              {(visit.labTests || visit.investigationsAdvised || visit.advice || visit.referral || visit.followUpDate) && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {visit.labTests && <div><span className="text-xs font-semibold text-slate-400 uppercase block">Lab Tests</span><span className="text-slate-700">{visit.labTests}</span></div>}
                  {visit.investigationsAdvised && <div><span className="text-xs font-semibold text-slate-400 uppercase block">Investigations</span><span className="text-slate-700">{visit.investigationsAdvised}</span></div>}
                  {visit.advice && <div><span className="text-xs font-semibold text-slate-400 uppercase block">Advice</span><span className="text-slate-700">{visit.advice}</span></div>}
                  {visit.referral && <div><span className="text-xs font-semibold text-slate-400 uppercase block">Referral</span><span className="text-slate-700">{visit.referral}</span></div>}
                  {visit.followUpDate && <div><span className="text-xs font-semibold text-slate-400 uppercase block">Follow-up</span><span className="text-blue-600 font-medium">{visit.followUpDate}</span></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
