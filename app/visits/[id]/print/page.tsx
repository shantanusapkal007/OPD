"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getVisit } from "@/services/visit.service"
import { getPatient } from "@/services/patient.service"
import { Visit, Patient } from "@/lib/types"
import { Printer, ArrowLeft } from "lucide-react"

export default function PrintPrescriptionPage() {
  const params = useParams()
  const router = useRouter()
  const visitId = params?.id as string

  const [visit, setVisit] = useState<Visit | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!visitId) return
      try {
        const v = await getVisit(visitId)
        if (v && v.patient_id) {
          setVisit(v)
          const p = await getPatient(v.patient_id)
          setPatient(p)
        }
      } catch (err) {
        console.error("Failed to load for printing", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [visitId])

  if (loading) return <div className="p-8 text-center bg-white text-black min-h-screen">Loading prescription...</div>
  if (!visit || !patient) return <div className="p-8 text-center text-red-500 bg-white text-black min-h-screen">Record not found</div>

  const patientName = patient.full_name || visit.patient_name || "-"
  const patientAge = patient.age ? `${patient.age} Yrs` : "-"
  const patientGender = patient.gender || "-"
  const visitDate = visit.created_at ? new Date(visit.created_at).toLocaleDateString() : "-"

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Non-printable controls */}
      <div className="print:hidden p-4 bg-slate-100 border-b flex justify-between items-center max-w-4xl mx-auto rounded-b-xl mb-8">
        <button onClick={() => router.back()} className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button onClick={() => window.print()} className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700">
          <Printer className="w-4 h-4" />
          <span>Print Prescription</span>
        </button>
      </div>

      {/* Printable Area - styled explicitly for paper */}
      <div className="max-w-3xl mx-auto p-8 border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
        
        {/* Clinic Header */}
        <header className="border-b-2 border-slate-800 pb-4 mb-6 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">OPD Clinic</h1>
          <p className="text-sm text-slate-600 mt-1">123 Health Street, Medical District, City, 40001</p>
          <p className="text-sm text-slate-600">+91 98765 43210 | care@opdclinic.com</p>
        </header>

        {/* Patient Info Block */}
        <div className="flex justify-between items-start mb-8 text-sm p-4 bg-slate-50 rounded-lg print:bg-transparent print:p-0 print:rounded-none">
          <div>
            <p><span className="font-semibold text-slate-600 uppercase text-xs">Patient Name:</span> <span className="font-bold text-base">{patientName}</span></p>
            <p className="mt-1"><span className="font-semibold text-slate-600 uppercase text-xs">Age / Sex:</span> {patientAge} / {patientGender}</p>
            {patient.mobile_number && <p className="mt-1"><span className="font-semibold text-slate-600 uppercase text-xs">Mobile:</span> {patient.mobile_number}</p>}
          </div>
          <div className="text-right">
            <p><span className="font-semibold text-slate-600 uppercase text-xs">Date:</span> <span className="font-bold font-mono">{visitDate}</span></p>
            {patient.case_number && visit.id && <p className="mt-1"><span className="font-semibold text-slate-600 uppercase text-xs">Visit ID:</span> {visit.id.slice(0, 8).toUpperCase()}</p>}
          </div>
        </div>

        {/* Clinical Info & Vitals */}
        <div className="mb-8 grid grid-cols-3 gap-6">
          <div className="col-span-1 border-r border-slate-200 pr-6 print:border-slate-800">
            <h2 className="text-xs font-bold uppercase text-slate-500 mb-3 border-b pb-1">Vitals & Assessment</h2>
            {visit.vitals && Object.values(visit.vitals).some(v => v) ? (
              <ul className="text-sm space-y-2">
                {visit.vitals.weight && <li><span className="font-semibold">WT:</span> {visit.vitals.weight} kg</li>}
                {visit.vitals.bp && <li><span className="font-semibold">BP:</span> {visit.vitals.bp}</li>}
                {visit.vitals.pulse && <li><span className="font-semibold">PR:</span> {visit.vitals.pulse} bpm</li>}
                {visit.vitals.temperature && <li><span className="font-semibold">Temp:</span> {visit.vitals.temperature}°F</li>}
                {visit.vitals.spo2 && <li><span className="font-semibold">SpO2:</span> {visit.vitals.spo2}%</li>}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">Not recorded</p>
            )}

            {visit.complaints && (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Chief Complaints</h3>
                <p className="text-sm">{visit.complaints}</p>
              </div>
            )}
            
            {visit.diagnosis && (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Diagnosis</h3>
                <p className="text-sm font-semibold">{visit.diagnosis}</p>
              </div>
            )}
          </div>

          {/* Rx Section */}
          <div className="col-span-2">
            <div className="flex items-end mb-4">
              <span className="text-4xl font-serif font-bold text-slate-800 leading-none mr-2">Rx</span>
            </div>
            
            {visit.prescriptions && visit.prescriptions.length > 0 ? (
              <ul className="space-y-4 text-sm">
                {visit.prescriptions.map((med, idx) => (
                  <li key={idx} className="border-b border-dashed border-slate-200 pb-2">
                    <div className="font-bold text-base">{idx + 1}. {med.name}</div>
                    <div className="flex justify-between items-center mt-1 text-slate-700">
                      <span>{med.dosage} ~ {med.frequency}</span>
                      <span className="font-medium whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded print:bg-transparent print:border print:border-slate-300">For {med.days} Days</span>
                    </div>
                    {med.notes && <p className="italic text-slate-500 mt-1 mt-1 text-xs">{med.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 italic mt-8">No medications prescribed in this visit.</p>
            )}

            {visit.advice && (
              <div className="mt-8 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Instructions / Advice</h3>
                <p className="text-sm whitespace-pre-line leading-relaxed">{visit.advice}</p>
              </div>
            )}
            
            {visit.follow_up_date && (
              <div className="mt-6 inline-block bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 print:bg-transparent text-sm">
                <span className="font-semibold text-slate-600 uppercase text-xs">Follow Up:</span> <span className="font-bold">{visit.follow_up_date}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t-2 border-slate-800 flex justify-between items-end text-sm">
          <div className="text-slate-500">
            <p>Generated by OPD Clinic System</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b border-slate-400 mb-2"></div>
            <p className="font-semibold">Doctor's Signature</p>
          </div>
        </div>

      </div>
    </div>
  )
}
