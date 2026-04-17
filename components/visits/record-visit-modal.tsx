"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, XCircle, ImagePlus, Loader2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { FORM_FIELD_PROPS, FORM_PROPS } from "@/lib/form-defaults"
import { addVisit } from "@/services/visit.service"
import { uploadFilesToStorage, validateImageFiles } from "@/services/storage.service"
import { useToast } from "@/components/ui/toast"
import Image from "next/image"
import type { Patient, Visit, Medicine } from "@/lib/types"

const ic = "w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
const lbl = "text-sm font-medium text-slate-700"
const secHead = "text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2 mb-1 pt-3 border-t border-slate-100"

function parseOptionalInteger(value: FormDataEntryValue | null) {
  const input = String(value ?? "").trim()
  if (!input) return undefined
  const parsed = Number.parseInt(input, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}
function parseOptionalFloat(value: FormDataEntryValue | null) {
  const input = String(value ?? "").trim()
  if (!input) return undefined
  const parsed = Number.parseFloat(input)
  return Number.isFinite(parsed) ? parsed : undefined
}

const RX_TEMPLATES: Record<string, Medicine[]> = {
  Fever: [
    { name: "Tab Paracetamol 500mg", dosage: "1-0-1", frequency: "BD", days: 3 },
    { name: "Tab Pantoprazole 40mg", dosage: "1-0-0", frequency: "OD AC", days: 3 },
  ],
  Cold: [
    { name: "Tab Cetirizine 10mg", dosage: "0-0-1", frequency: "HS", days: 5 },
    { name: "Syp Cough Expectorant", dosage: "5ml", frequency: "TDS", days: 5 },
  ],
  Diabetes: [{ name: "Tab Metformin 500mg", dosage: "1-0-1", frequency: "BD", days: 30 }],
  BP: [{ name: "Tab Amlodipine 5mg", dosage: "1-0-0", frequency: "OD", days: 30 }],
}

interface Props {
  isOpen: boolean
  patient: Patient
  onClose: () => void
  onVisitSaved: (visit: Visit) => void
}

export function RecordVisitModal({ isOpen, patient, onClose, onVisitSaved }: Props) {
  const { showToast } = useToast()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [visitImageFiles, setVisitImageFiles] = useState<File[]>([])
  const [visitImagePreviews, setVisitImagePreviews] = useState<string[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")
  const imageInputRef = useRef<HTMLInputElement>(null)
  const uploadPromiseRef = useRef<Promise<string[]> | null>(null)
  const uploadTokenRef = useRef(0)

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setMedicines([])
      setVisitImageFiles([])
      visitImagePreviews.forEach(url => URL.revokeObjectURL(url))
      setVisitImagePreviews([])
      setUploadedImageUrls([])
      setIsUploadingImages(false)
      setUploadProgress(0)
      setUploadError("")
      uploadTokenRef.current += 1
      uploadPromiseRef.current = null
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const addMedicine = () => setMedicines(prev => [...prev, { name: "", dosage: "", frequency: "", days: 3 }])
  const updateMedicine = (idx: number, field: keyof Medicine, val: string | number) => {
    setMedicines(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m))
  }
  const removeMedicine = (idx: number) => setMedicines(prev => prev.filter((_, i) => i !== idx))
  const applyTemplate = (meds: Medicine[]) => setMedicines(meds.map(m => ({ ...m })))

  const setQuickFollowUp = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    const el = document.getElementsByName("rv_follow_up_date")[0] as HTMLInputElement
    if (el) el.value = d.toISOString().split("T")[0]
  }

  const uploadImages = (files: File[]) => {
    if (files.length === 0) {
      uploadPromiseRef.current = null
      setUploadedImageUrls([])
      return Promise.resolve<string[]>([])
    }
    const token = ++uploadTokenRef.current
    setUploadedImageUrls([])
    setUploadProgress(0)
    setIsUploadingImages(true)
    setUploadError("")
    const p = uploadFilesToStorage(files, "visit-images", (pct) => {
      if (uploadTokenRef.current === token) setUploadProgress(pct)
    })
      .then(urls => {
        if (uploadTokenRef.current === token) { setUploadedImageUrls(urls); setUploadProgress(100) }
        return urls
      })
      .catch(() => {
        if (uploadTokenRef.current === token) setUploadError("Failed to upload images.")
        throw new Error("Failed to upload images.")
      })
      .finally(() => {
        if (uploadTokenRef.current === token) setIsUploadingImages(false)
        if (uploadPromiseRef.current === p) uploadPromiseRef.current = null
      })
    uploadPromiseRef.current = p
    return p
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files ?? [])
      if (!files.length) return
      validateImageFiles(files, 10)
      visitImagePreviews.forEach(u => URL.revokeObjectURL(u))
      setVisitImageFiles(files)
      setVisitImagePreviews(files.map(f => URL.createObjectURL(f)))
      setUploadError("")
      uploadImages(files).catch(() => undefined)
    } catch (err: any) {
      uploadTokenRef.current++
      uploadPromiseRef.current = null
      setVisitImageFiles([])
      setUploadedImageUrls([])
      visitImagePreviews.forEach(u => URL.revokeObjectURL(u))
      setVisitImagePreviews([])
      setUploadError(err.message || "Invalid images.")
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setUploadError("")
    const form = e.currentTarget
    const fd = new FormData(form)
    const prescriptions = medicines.filter(m => m.name.trim() !== "")

    try {
      if (!(fd.get("rv_complaints") as string)?.trim()) throw new Error("Chief complaints are required.")

      let visit_images = uploadedImageUrls
      const vitals = {
        bp: (fd.get("rv_bp") as string || "").trim() || undefined,
        weight: parseOptionalInteger(fd.get("rv_weight")),
        height: parseOptionalInteger(fd.get("rv_height")),
        temperature: parseOptionalFloat(fd.get("rv_temperature")),
        pulse: parseOptionalInteger(fd.get("rv_pulse")),
        spo2: parseOptionalInteger(fd.get("rv_spo2")),
        respiratoryRate: parseOptionalInteger(fd.get("rv_resp")),
      }
      const cleanedVitals = Object.fromEntries(
        Object.entries(vitals).filter(([, v]) => v !== undefined && v !== "")
      )

      if (visitImageFiles.length > 0 && visit_images.length !== visitImageFiles.length) {
        const pending = uploadPromiseRef.current ?? uploadImages(visitImageFiles)
        visit_images = await pending
      }

      const createdVisit = await addVisit({
        patient_id: patient.id!,
        patient_name: patient.full_name,
        visit_images,
        complaints: fd.get("rv_complaints") as string || "",
        history_of_present_illness: fd.get("rv_hpi") as string || "",
        past_history: fd.get("rv_past_history") as string || "",
        family_history: fd.get("rv_family_history") as string || "",
        examination_findings: fd.get("rv_examination") as string || "",
        diagnosis: fd.get("rv_diagnosis") as string || "",
        total_bill: parseInt(fd.get("rv_total_bill") as string) || 0,
        lab_tests: fd.get("rv_lab_tests") as string || "",
        investigations_advised: fd.get("rv_investigations") as string || "",
        advice: fd.get("rv_advice") as string || "",
        referral: fd.get("rv_referral") as string || "",
        follow_up_date: fd.get("rv_follow_up_date") as string || "",
        payment_status: (fd.get("rv_payment_status") as "paid" | "unpaid") || "unpaid",
        prescriptions,
        vitals: cleanedVitals,
      })

      onVisitSaved(createdVisit)
      onClose()

      if (prescriptions.length > 0 && createdVisit.id) {
        showToast("Visit saved! Opening prescription...", "success")
        setTimeout(() => {
          window.open(`/visits/${createdVisit.id}/print?autoprint=1`, "_blank", "noopener,noreferrer")
        }, 400)
      } else {
        showToast("Visit recorded successfully!", "success")
      }

      if (typeof form.reset === "function") form.reset()
    } catch (err: any) {
      showToast(err.message || "Failed to record visit.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Visit — ${patient.full_name}`}
    >
      <form className="space-y-3 max-h-[75vh] overflow-y-auto pr-2" onSubmit={handleSave} {...FORM_PROPS}>

        {/* Patient Info Banner */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            {patient.full_name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">{patient.full_name}</p>
            <p className="text-xs text-blue-600">{patient.case_number} · {patient.age} yrs · {patient.gender}</p>
          </div>
        </div>

        {/* Vitals */}
        <h4 className={secHead}>Vitals</h4>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1"><label className={lbl}>BP</label><input name="rv_bp" className={ic} placeholder="120/80" {...FORM_FIELD_PROPS} /></div>
          <div className="space-y-1"><label className={lbl}>Pulse</label><input name="rv_pulse" type="number" className={ic} placeholder="72" {...FORM_FIELD_PROPS} /></div>
          <div className="space-y-1"><label className={lbl}>Temp (F)</label><input name="rv_temperature" type="number" step="0.1" className={ic} placeholder="98.6" {...FORM_FIELD_PROPS} /></div>
          <div className="space-y-1"><label className={lbl}>SpO2 (%)</label><input name="rv_spo2" type="number" className={ic} placeholder="98" {...FORM_FIELD_PROPS} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1"><label className={lbl}>Weight (kg)</label><input name="rv_weight" type="number" className={ic} placeholder="70" {...FORM_FIELD_PROPS} /></div>
          <div className="space-y-1"><label className={lbl}>Height (cm)</label><input name="rv_height" type="number" className={ic} placeholder="170" {...FORM_FIELD_PROPS} /></div>
          <div className="space-y-1"><label className={lbl}>Resp Rate</label><input name="rv_resp" type="number" className={ic} placeholder="16" {...FORM_FIELD_PROPS} /></div>
        </div>

        {/* Complaints & History */}
        <h4 className={secHead}>History & Complaints</h4>
        <div className="space-y-1"><label className={lbl}>Chief Complaints *</label><textarea required name="rv_complaints" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Fever since 3 days, headache..." {...FORM_FIELD_PROPS} /></div>
        <div className="space-y-1"><label className={lbl}>History of Present Illness</label><textarea name="rv_hpi" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Detailed history..." {...FORM_FIELD_PROPS} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><label className={lbl}>Past History</label><input name="rv_past_history" className={ic} placeholder="Previous illnesses..." {...FORM_FIELD_PROPS} /></div>
          <div className="space-y-1"><label className={lbl}>Family History</label><input name="rv_family_history" className={ic} placeholder="Diabetes in family..." {...FORM_FIELD_PROPS} /></div>
        </div>

        {/* Examination & Diagnosis */}
        <h4 className={secHead}>Examination & Diagnosis</h4>
        <div className="space-y-1"><label className={lbl}>Examination Findings</label><textarea name="rv_examination" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="On examination..." {...FORM_FIELD_PROPS} /></div>
        <div className="space-y-1"><label className={lbl}>Diagnosis *</label><input required name="rv_diagnosis" className={ic} placeholder="Acute Viral Fever" {...FORM_FIELD_PROPS} /></div>

        {/* Prescription */}
        <div className="flex items-center justify-between border-t border-slate-100 mt-2 mb-1 pt-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prescription (Rx)</h4>
          <div className="flex gap-1 flex-wrap">
            {Object.keys(RX_TEMPLATES).map(k => (
              <button type="button" key={k} onClick={() => applyTemplate(RX_TEMPLATES[k])}
                className="text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">
                {k}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-2">
          {medicines.length === 0 && <p className="text-xs text-center text-slate-400 py-2">No medicines added. Use a template or add manually.</p>}
          {medicines.map((med, idx) => (
            <div key={idx} className="flex gap-2 items-start bg-white p-2 rounded shadow-sm border border-slate-100">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-12 gap-2">
                  <input className="col-span-12 sm:col-span-5 h-8 px-2 border border-slate-200 rounded text-sm" placeholder="Medicine Name" value={med.name} onChange={e => updateMedicine(idx, "name", e.target.value)} />
                  <input className="col-span-4 sm:col-span-2 h-8 px-2 border border-slate-200 rounded text-sm" placeholder="Dose" value={med.dosage} onChange={e => updateMedicine(idx, "dosage", e.target.value)} />
                  <input className="col-span-4 sm:col-span-2 h-8 px-2 border border-slate-200 rounded text-sm" placeholder="Freq" value={med.frequency} onChange={e => updateMedicine(idx, "frequency", e.target.value)} />
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-1">
                    <input type="number" className="w-full h-8 px-2 border border-slate-200 rounded text-sm" placeholder="Days" value={med.days || ""} onChange={e => updateMedicine(idx, "days", parseInt(e.target.value) || 0)} />
                    <span className="text-xs text-slate-500">d</span>
                  </div>
                </div>
                <input className="w-full h-8 px-2 border border-slate-200 rounded text-xs" placeholder="Notes (e.g., After food)" value={med.notes || ""} onChange={e => updateMedicine(idx, "notes", e.target.value)} />
              </div>
              <button type="button" onClick={() => removeMedicine(idx)} className="text-slate-300 hover:text-red-500 p-1"><XCircle className="w-5 h-5" /></button>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={addMedicine} className="w-full text-blue-600 text-xs mt-1 border border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50">
            <Plus className="w-3 h-3 mr-1" /> Add Medicine
          </Button>
        </div>

        {/* Investigations */}
        <h4 className={secHead}>Investigations & Lab</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><label className={lbl}>Lab Tests Done</label><input name="rv_lab_tests" className={ic} placeholder="CBC, Urine..." {...FORM_FIELD_PROPS} /></div>
          <div className="space-y-1"><label className={lbl}>Investigations Advised</label><input name="rv_investigations" className={ic} placeholder="MRI, Blood Sugar..." {...FORM_FIELD_PROPS} /></div>
        </div>

        {/* Visit Images */}
        <h4 className={secHead}>Visit Images</h4>
        <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm text-slate-600">
            {visitImageFiles.length === 0 ? "Attach case images (optional)" :
              isUploadingImages ? `Uploading ${visitImageFiles.length} image(s)... ${uploadProgress}%` :
              `${visitImageFiles.length} image(s) ready`}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
            <ImagePlus className="w-4 h-4 mr-2" /> Choose
          </Button>
        </div>
        {visitImagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {visitImagePreviews.map((src, i) => (
              <div key={i} className="relative h-20 rounded-lg overflow-hidden border border-slate-200">
                <Image src={src} alt="" fill unoptimized sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
        {isUploadingImages && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading images...
          </div>
        )}
        {uploadError && <p className="text-xs text-red-600 font-medium">{uploadError}</p>}

        {/* Advice & Follow-up */}
        <h4 className={secHead}>Advice & Follow-up</h4>
        <div className="space-y-1"><label className={lbl}>Advice / Instructions</label><textarea name="rv_advice" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Take rest, drink fluids..." {...FORM_FIELD_PROPS} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={lbl}>Follow-up Date</label>
              <div className="flex gap-1">
                {[3, 5, 7].map(d => (
                  <button type="button" key={d} onClick={() => setQuickFollowUp(d)} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">+{d}d</button>
                ))}
              </div>
            </div>
            <input name="rv_follow_up_date" type="date" className={ic} {...FORM_FIELD_PROPS} />
          </div>
          <div className="space-y-1"><label className={lbl}>Referral (if any)</label><input name="rv_referral" className={ic} placeholder="Dr. XYZ, Cardiologist" {...FORM_FIELD_PROPS} /></div>
        </div>

        {/* Billing */}
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg mt-2 space-y-3">
          <label className="text-sm font-semibold text-red-800 block">Billing</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-red-800">Total Bill (Rs.)</label>
              <input name="rv_total_bill" type="number" className="w-full h-10 px-3 rounded border border-red-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="500" {...FORM_FIELD_PROPS} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-red-800">Payment Status</label>
              <select name="rv_payment_status" defaultValue="unpaid" className="w-full h-10 px-3 rounded border border-red-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500" {...FORM_FIELD_PROPS}>
                <option value="unpaid">Unpaid (Add to Khata)</option>
                <option value="paid">Paid (Instantly)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-white pb-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" disabled={isSaving || isUploadingImages}>
            <Printer className="w-4 h-4 mr-2" />
            {isUploadingImages ? `Uploading ${uploadProgress}%...` : isSaving ? "Saving..." : "Save Visit"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
