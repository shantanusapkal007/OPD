"use client"

import { useState, useRef } from "react"
import { Download, Upload, FileSpreadsheet, Users, Calendar, Pill, IndianRupee, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPatients, addPatient } from "@/services/patient.service"
import { getVisits } from "@/services/visit.service"
import { getPayments } from "@/services/payment.service"
import { getAppointments } from "@/services/appointment.service"

// ─── CSV Helpers ─────────────────────────────────────────

function arrayToCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => `"${(val || "").replace(/"/g, '""')}"`
  const headerLine = headers.map(escape).join(",")
  const dataLines = rows.map(row => row.map(escape).join(","))
  return [headerLine, ...dataLines].join("\n")
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length === 0) return { headers: [], rows: [] }

  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseLine(lines[0])
  const rows = lines.slice(1).map(parseLine)
  return { headers, rows }
}

// ─── Page Component ─────────────────────────────────────

export default function DataPage() {
  const [exporting, setExporting] = useState("")
  const [importStatus, setImportStatus] = useState<{ success: number; failed: number; total: number } | null>(null)
  const [importing, setImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ─── Export Functions ───

  const exportPatients = async () => {
    setExporting("patients")
    try {
      const patients = await getPatients()
      const headers = ["Case Number", "Full Name", "Mobile", "Alternate Mobile", "Gender", "Age", "DOB", "Blood Group", "Email", "Occupation", "Marital Status", "Address", "City", "State", "Pincode", "Allergies", "Chronic Diseases", "Emergency Contact", "LMP", "Cycle Days", "Khata Balance", "Notes"]
      const rows = patients.map(p => [
        p.caseNumber, p.fullName, p.mobileNumber, p.alternateMobile || "", p.gender, String(p.age),
        p.dateOfBirth || "", p.bloodGroup || "", p.email || "", p.occupation || "", p.maritalStatus || "",
        p.address?.line1 || "", p.address?.city || "", p.address?.state || "", p.address?.pincode || "",
        p.allergies || "", p.chronicDiseases || "", p.emergencyContact || "",
        p.lmp || "", String(p.menstrualCycleDays || ""), String(p.khataBalance || 0), p.notes || ""
      ])
      downloadCSV(`patients_${new Date().toISOString().split("T")[0]}.csv`, arrayToCSV(headers, rows))
    } catch (e) { alert("Export failed") }
    finally { setExporting("") }
  }

  const exportVisits = async () => {
    setExporting("visits")
    try {
      const visits = await getVisits()
      const headers = ["Date", "Patient Name", "Complaints", "HPI", "Examination", "Diagnosis", "Prescription", "BP", "Pulse", "Temp", "SpO2", "Weight", "Height", "Resp Rate", "Lab Tests", "Investigations", "Advice", "Referral", "Follow-up", "Bill"]
      const rows = visits.map(v => [
        v.createdAt?.toDate?.()?.toLocaleDateString() || "", v.patientName, v.complaints, v.historyOfPresentIllness || "",
        v.examinationFindings || "", v.diagnosis,
        v.prescriptions?.map(p => p.name).join("; ") || "",
        v.vitals?.bp || "", String(v.vitals?.pulse || ""), String(v.vitals?.temperature || ""),
        String(v.vitals?.spo2 || ""), String(v.vitals?.weight || ""), String(v.vitals?.height || ""),
        String(v.vitals?.respiratoryRate || ""),
        v.labTests || "", v.investigationsAdvised || "", v.advice || "", v.referral || "",
        v.followUpDate || "", String(v.totalBill || 0)
      ])
      downloadCSV(`visits_${new Date().toISOString().split("T")[0]}.csv`, arrayToCSV(headers, rows))
    } catch (e) { alert("Export failed") }
    finally { setExporting("") }
  }

  const exportPayments = async () => {
    setExporting("payments")
    try {
      const payments = await getPayments()
      const headers = ["Date", "Patient Name", "Amount", "Method", "Status", "Description", "Transaction ID"]
      const rows = payments.map(p => [
        p.date, p.patientName, String(p.amount), p.paymentMethod, p.status, p.description || "", p.transactionId || ""
      ])
      downloadCSV(`payments_${new Date().toISOString().split("T")[0]}.csv`, arrayToCSV(headers, rows))
    } catch (e) { alert("Export failed") }
    finally { setExporting("") }
  }

  const exportAppointments = async () => {
    setExporting("appointments")
    try {
      const apts = await getAppointments()
      const headers = ["Date", "Time", "Patient Name", "Type", "Status", "Reason", "Notes"]
      const rows = apts.map(a => [
        a.appointmentDate, a.timeSlot, a.patientName, a.type, a.status, a.reason || "", a.notes || ""
      ])
      downloadCSV(`appointments_${new Date().toISOString().split("T")[0]}.csv`, arrayToCSV(headers, rows))
    } catch (e) { alert("Export failed") }
    finally { setExporting("") }
  }

  // ─── Import Functions ───

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseCSV(text)
      setImportPreview(parsed)
      setImportStatus(null)
    }
    reader.readAsText(file)
  }

  const runImport = async () => {
    if (!importPreview) return
    setImporting(true)
    let success = 0, failed = 0
    const { headers, rows } = importPreview
    const idx = (name: string) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()))

    for (const row of rows) {
      try {
        const get = (name: string) => { const i = idx(name); return i >= 0 ? row[i] || "" : "" }
        const patientData: any = {
          caseNumber: get("case"),
          fullName: get("name") || get("full name"),
          mobileNumber: get("mobile") || get("phone"),
          gender: (get("gender") || "Male") as "Male" | "Female" | "Other",
          age: parseInt(get("age")) || 0,
          bloodGroup: get("blood"),
          email: get("email"),
          occupation: get("occupation"),
          maritalStatus: get("marital"),
          alternateMobile: get("alternate"),
          dateOfBirth: get("dob") || get("birth"),
          allergies: get("allerg"),
          chronicDiseases: get("chronic"),
          emergencyContact: get("emergency"),
          notes: get("notes"),
          address: {
            line1: get("address"),
            city: get("city"),
            state: get("state"),
            pincode: get("pin"),
          },
        }
        if (!patientData.fullName && !patientData.caseNumber) { failed++; continue }
        await addPatient(patientData)
        success++
      } catch {
        failed++
      }
    }
    setImportStatus({ success, failed, total: rows.length })
    setImporting(false)
    setImportPreview(null)
  }

  const exportCards = [
    { label: "Patients", icon: Users, color: "blue", fn: exportPatients, key: "patients" },
    { label: "Visits", icon: Pill, color: "green", fn: exportVisits, key: "visits" },
    { label: "Payments", icon: IndianRupee, color: "purple", fn: exportPayments, key: "payments" },
    { label: "Appointments", icon: Calendar, color: "orange", fn: exportAppointments, key: "appointments" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-blue-600" /> Data Management
        </h1>
        <p className="text-sm text-slate-500">Import and export your clinic data in CSV format</p>
      </div>

      {/* Export Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-slate-500" /> Export Data
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {exportCards.map(card => (
            <Card key={card.key} className="hover:shadow-md transition-shadow cursor-pointer" onClick={card.fn}>
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-${card.color}-50 flex items-center justify-center`}>
                  {exporting === card.key ? (
                    <Loader2 className={`w-6 h-6 text-${card.color}-600 animate-spin`} />
                  ) : (
                    <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{card.label}</h3>
                  <p className="text-xs text-slate-500 mt-1">Download as CSV</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" disabled={!!exporting}>
                  <Download className="w-4 h-4 mr-2" /> {exporting === card.key ? "Exporting..." : "Export"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Import Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-slate-500" /> Import Patients
        </h2>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-3">
                Upload a CSV file to bulk-import patient records. The CSV should have columns like: 
                <span className="font-medium text-slate-800"> Case Number, Full Name, Mobile, Gender, Age, Blood Group, Email, City</span>, etc.
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Column headers are matched flexibly — "name" matches "Full Name", "phone" matches "Mobile Number", etc.
              </p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Select CSV File
              </Button>
            </div>
          </div>

          {/* Import Preview */}
          {importPreview && (
            <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Preview: {importPreview.rows.length} records found</span>
                <Button size="sm" onClick={runImport} disabled={importing}>
                  {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</> : <><Upload className="w-4 h-4 mr-2" /> Import All</>}
                </Button>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase">
                    <tr>
                      {importPreview.headers.map((h, i) => <th key={i} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreview.rows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {row.map((cell, j) => <td key={j} className="px-3 py-2 text-slate-700 whitespace-nowrap max-w-[150px] truncate">{cell}</td>)}
                      </tr>
                    ))}
                    {importPreview.rows.length > 10 && (
                      <tr><td colSpan={importPreview.headers.length} className="px-3 py-2 text-center text-slate-400">...and {importPreview.rows.length - 10} more rows</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Status */}
          {importStatus && (
            <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${importStatus.failed === 0 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
              {importStatus.failed === 0 ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-yellow-600" />}
              <span className="text-sm font-medium">
                Imported {importStatus.success} of {importStatus.total} patients successfully.
                {importStatus.failed > 0 && ` ${importStatus.failed} records failed (missing name or case number).`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
