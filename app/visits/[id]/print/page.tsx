"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Printer } from "lucide-react"
import { getPatient } from "@/services/patient.service"
import { getVisit } from "@/services/visit.service"
import { getClinicSettings } from "@/services/clinic-settings.service"
import type { ClinicSettings, Patient, Visit } from "@/lib/types"

export default function PrintPrescriptionPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const visitId = params?.id as string
  const shouldAutoPrint = searchParams.get("autoprint") === "1"
  const hasTriggeredAutoPrint = useRef(false)

  const [visit, setVisit] = useState<Visit | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [settings, setSettings] = useState<ClinicSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!visitId) return

      try {
        const [visitRecord, clinicSettings] = await Promise.all([
          getVisit(visitId),
          getClinicSettings(),
        ])

        setSettings(clinicSettings)

        if (visitRecord?.patient_id) {
          setVisit(visitRecord)
          const patientRecord = await getPatient(visitRecord.patient_id)
          setPatient(patientRecord)
        }
      } catch (error) {
        console.error("Failed to load prescription print view", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [visitId])

  useEffect(() => {
    if (!shouldAutoPrint || loading || !visit || !patient || hasTriggeredAutoPrint.current) {
      return
    }

    hasTriggeredAutoPrint.current = true
    const timeoutId = window.setTimeout(() => {
      window.print()
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [loading, patient, shouldAutoPrint, visit])

  if (loading) {
    return <div className="min-h-screen bg-white p-8 text-center text-black">Loading prescription...</div>
  }

  if (!visit || !patient) {
    return <div className="min-h-screen bg-white p-8 text-center text-red-500">Record not found</div>
  }

  const patientName = patient.full_name || visit.patient_name || "-"
  const patientAge = patient.age ? `${patient.age} Yrs` : "-"
  const patientGender = patient.gender || "-"
  const visitDate = visit.created_at ? new Date(visit.created_at).toLocaleDateString() : "-"
  const logoUrl = settings?.logo_url?.trim() || ""
  const clinicName = settings?.clinic_name?.trim() || "Clinic header placeholder"
  const headerLine =
    [settings?.doctor_name, settings?.specialization].filter(Boolean).join(" | ") ||
    "Doctor name and specialization placeholder"
  const contactLine =
    [settings?.address, settings?.phone, settings?.email].filter(Boolean).join(" | ") ||
    "Clinic address, phone, and email placeholder"

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between rounded-b-xl border-b bg-slate-100 p-4 print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Printer className="h-4 w-4" />
          <span>Print Prescription</span>
        </button>
      </div>

      <div className="mx-auto max-w-3xl border border-slate-200 p-8 shadow-sm print:border-none print:p-0 print:shadow-none">
        <header className="mb-6 border-b-2 border-slate-800 pb-4">
          <div className="flex items-start gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Clinic logo"
                  fill
                  sizes="80px"
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <div className="px-2 text-center text-[11px] font-medium leading-4 text-slate-400">
                  Clinic logo
                </div>
              )}
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Clinic Header</p>
              <h1 className="mt-2 text-3xl font-bold uppercase tracking-wider text-slate-900">{clinicName}</h1>
              <p className="mt-1 text-sm text-slate-600">{headerLine}</p>
              <p className="text-sm text-slate-600">{contactLine}</p>
            </div>
          </div>
        </header>

        <div className="mb-8 flex items-start justify-between rounded-lg bg-slate-50 p-4 text-sm print:rounded-none print:bg-transparent print:p-0">
          <div>
            <p>
              <span className="text-xs font-semibold uppercase text-slate-600">Patient Name:</span>{" "}
              <span className="text-base font-bold">{patientName}</span>
            </p>
            <p className="mt-1">
              <span className="text-xs font-semibold uppercase text-slate-600">Age / Sex:</span> {patientAge} / {patientGender}
            </p>
            {patient.mobile_number ? (
              <p className="mt-1">
                <span className="text-xs font-semibold uppercase text-slate-600">Mobile:</span> {patient.mobile_number}
              </p>
            ) : null}
          </div>
          <div className="text-right">
            <p>
              <span className="text-xs font-semibold uppercase text-slate-600">Date:</span>{" "}
              <span className="font-mono font-bold">{visitDate}</span>
            </p>
            {patient.case_number && visit.id ? (
              <p className="mt-1">
                <span className="text-xs font-semibold uppercase text-slate-600">Visit ID:</span> {visit.id.slice(0, 8).toUpperCase()}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-6">
          <div className="col-span-1 border-r border-slate-200 pr-6 print:border-slate-800">
            <h2 className="mb-3 border-b pb-1 text-xs font-bold uppercase text-slate-500">Vitals & Assessment</h2>
            {visit.vitals && Object.values(visit.vitals).some((value) => value) ? (
              <ul className="space-y-2 text-sm">
                {visit.vitals.weight ? <li><span className="font-semibold">WT:</span> {visit.vitals.weight} kg</li> : null}
                {visit.vitals.bp ? <li><span className="font-semibold">BP:</span> {visit.vitals.bp}</li> : null}
                {visit.vitals.pulse ? <li><span className="font-semibold">PR:</span> {visit.vitals.pulse} bpm</li> : null}
                {visit.vitals.temperature ? <li><span className="font-semibold">Temp:</span> {visit.vitals.temperature} deg F</li> : null}
                {visit.vitals.spo2 ? <li><span className="font-semibold">SpO2:</span> {visit.vitals.spo2}%</li> : null}
              </ul>
            ) : (
              <p className="text-sm italic text-slate-400">Not recorded</p>
            )}

            {visit.complaints ? (
              <div className="mt-6">
                <h3 className="mb-1 text-xs font-bold uppercase text-slate-500">Chief Complaints</h3>
                <p className="text-sm">{visit.complaints}</p>
              </div>
            ) : null}

            {visit.diagnosis ? (
              <div className="mt-6">
                <h3 className="mb-1 text-xs font-bold uppercase text-slate-500">Diagnosis</h3>
                <p className="text-sm font-semibold">{visit.diagnosis}</p>
              </div>
            ) : null}
          </div>

          <div className="col-span-2">
            <div className="mb-4 flex items-end">
              <span className="mr-2 text-4xl font-serif font-bold leading-none text-slate-800">Rx</span>
            </div>

            {visit.prescriptions && visit.prescriptions.length > 0 ? (
              <ul className="space-y-4 text-sm">
                {visit.prescriptions.map((medicine, index) => (
                  <li key={index} className="border-b border-dashed border-slate-200 pb-2">
                    <div className="text-base font-bold">{index + 1}. {medicine.name}</div>
                    <div className="mt-1 flex items-center justify-between text-slate-700">
                      <span>{medicine.dosage} ~ {medicine.frequency}</span>
                      <span className="whitespace-nowrap rounded bg-slate-100 px-2 py-0.5 font-medium print:border print:border-slate-300 print:bg-transparent">
                        For {medicine.days} Days
                      </span>
                    </div>
                    {medicine.notes ? <p className="mt-1 text-xs italic text-slate-500">{medicine.notes}</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-8 italic text-slate-400">No medications prescribed in this visit.</p>
            )}

            {visit.advice ? (
              <div className="mt-8 border-t border-slate-200 pt-4">
                <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Instructions / Advice</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed">{visit.advice}</p>
              </div>
            ) : null}

            {visit.follow_up_date ? (
              <div className="mt-6 inline-block rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm print:bg-transparent">
                <span className="text-xs font-semibold uppercase text-slate-600">Follow Up:</span>{" "}
                <span className="font-bold">{visit.follow_up_date}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-24 flex items-end justify-between border-t-2 border-slate-800 pt-8 text-sm">
          <div className="text-slate-500">
            <p>Generated by OPD Clinic System</p>
          </div>
          <div className="text-center">
            <div className="mb-2 w-40 border-b border-slate-400" />
            <p className="font-semibold">Doctor Signature</p>
          </div>
        </div>
      </div>
    </div>
  )
}
