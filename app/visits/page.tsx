"use client"

import { useState, useEffect, useRef, startTransition } from "react"
import { Pill, Plus, Activity, Thermometer, Heart, Wind, ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { VisitImageGallery } from "@/components/visits/visit-image-gallery"
import { FORM_FIELD_PROPS, FORM_PROPS } from "@/lib/form-defaults"
import { useDebouncedValue } from "@/lib/use-debounced-value"
import Image from "next/image"
import { getVisits, addVisit, updateVisitImages } from "@/services/visit.service"
import { searchPatients } from "@/services/patient.service"
import { uploadFilesToStorage, validateImageFiles } from "@/services/storage.service"
import type { Visit, Patient, Medicine } from "@/lib/types"

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

export default function VisitsPage() {
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [patientSearch, setPatientSearch] = useState("")
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const debouncedPatientSearch = useDebouncedValue(patientSearch, 120)
  const [visitImageFiles, setVisitImageFiles] = useState<File[]>([])
  const [visitImagePreviews, setVisitImagePreviews] = useState<string[]>([])
  const [uploadedVisitImageUrls, setUploadedVisitImageUrls] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [visitImageUploadProgress, setVisitImageUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")

  const imageInputRef = useRef<HTMLInputElement>(null)
  const visitImageUploadPromiseRef = useRef<Promise<string[]> | null>(null)
  const visitImageUploadTokenRef = useRef(0)

  const fetchVisits = async () => {
    setLoading(true)
    try {
      const data = await getVisits()
      setVisits(data)
      setError("")
    } catch (e) {
      setError("Failed to load visits.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVisits() }, [])

  useEffect(() => {
    let active = true

    if (debouncedPatientSearch.length >= 2) {
      searchPatients(debouncedPatientSearch, 8).then((results) => {
        if (active) {
          startTransition(() => {
            setPatientResults(results)
          })
        }
      })
    } else {
      startTransition(() => {
        setPatientResults([])
      })
    }

    return () => {
      active = false
    }
  }, [debouncedPatientSearch])

  useEffect(() => {
    return () => {
      visitImagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [visitImagePreviews])

  const revokeVisitImagePreviews = (previews: string[]) => {
    previews.forEach((preview) => URL.revokeObjectURL(preview))
  }

  const uploadVisitImages = (files: File[]) => {
    if (files.length === 0) {
      visitImageUploadPromiseRef.current = null
      setUploadedVisitImageUrls([])
      setVisitImageUploadProgress(0)
      setIsUploadingImages(false)
      return Promise.resolve<string[]>([])
    }

    const uploadToken = visitImageUploadTokenRef.current + 1
    visitImageUploadTokenRef.current = uploadToken
    setUploadedVisitImageUrls([])
    setVisitImageUploadProgress(0)
    setIsUploadingImages(true)
    setUploadError("")

    let uploadPromise: Promise<string[]>
    uploadPromise = uploadFilesToStorage(files, "visit-images", (progress) => {
      if (visitImageUploadTokenRef.current !== uploadToken) return
      setVisitImageUploadProgress(progress)
    })
      .then((urls) => {
        if (visitImageUploadTokenRef.current === uploadToken) {
          setUploadedVisitImageUrls(urls)
          setVisitImageUploadProgress(100)
        }
        return urls
      })
      .catch(() => {
        if (visitImageUploadTokenRef.current === uploadToken) {
          setUploadedVisitImageUrls([])
          setUploadError("Failed to upload visit images. Please try again.")
        }
        throw new Error("Failed to upload visit images.")
      })
      .finally(() => {
        if (visitImageUploadTokenRef.current === uploadToken) {
          setIsUploadingImages(false)
        }

        if (visitImageUploadPromiseRef.current === uploadPromise) {
          visitImageUploadPromiseRef.current = null
        }
      })

    visitImageUploadPromiseRef.current = uploadPromise
    return uploadPromise
  }

  const resetVisitFormState = () => {
    visitImageUploadTokenRef.current += 1
    visitImageUploadPromiseRef.current = null
    setSelectedPatient(null)
    setPatientSearch("")
    setPatientResults([])
    setVisitImageFiles([])
    setUploadedVisitImageUrls([])
    setVisitImageUploadProgress(0)
    setIsUploadingImages(false)
    revokeVisitImagePreviews(visitImagePreviews)
    setVisitImagePreviews([])
    setUploadError("")
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  const handleVisitImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files ?? [])
      if (files.length === 0) return

      validateImageFiles(files, 10)
      revokeVisitImagePreviews(visitImagePreviews)
      setVisitImageFiles(files)
      setVisitImagePreviews(files.map((file) => URL.createObjectURL(file)))
      setUploadError("")
      uploadVisitImages(files).catch(() => undefined)
    } catch (error: any) {
      visitImageUploadTokenRef.current += 1
      visitImageUploadPromiseRef.current = null
      setVisitImageFiles([])
      setUploadedVisitImageUrls([])
      setVisitImageUploadProgress(0)
      setIsUploadingImages(false)
      revokeVisitImagePreviews(visitImagePreviews)
      setVisitImagePreviews([])
      setUploadError(error.message || "Invalid visit images.")
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPatient) { alert("Please select a patient"); return }

    setIsSaving(true)
    setUploadError("")

    const form = e.currentTarget
    const fd = new FormData(form)
    const rxText = (fd.get("prescription") as string) || ""
    const prescriptions: Medicine[] = rxText
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => ({
        name: line.trim(),
        dosage: "-",
        frequency: "As directed",
        days: 0,
      }))

    try {
      if (!(fd.get("complaints") as string)?.trim()) {
        throw new Error("Chief complaints are required.")
      }

      let visitImages = uploadedVisitImageUrls
      const vitals = {
        bp: (fd.get("bp") as string || "").trim(),
        weight: parseOptionalInteger(fd.get("weight")),
        height: parseOptionalInteger(fd.get("height")),
        temperature: parseOptionalFloat(fd.get("temperature")),
        pulse: parseOptionalInteger(fd.get("pulse")),
        spo2: parseOptionalInteger(fd.get("spo2")),
        respiratoryRate: parseOptionalInteger(fd.get("respiratoryRate")),
      }

      const cleanedVitals = Object.fromEntries(
        Object.entries(vitals).filter(([, value]) => value !== undefined && value !== "")
      )

      if (visitImageFiles.length > 0) {
        try {
          validateImageFiles(visitImageFiles, 10)
          if (visitImages.length !== visitImageFiles.length) {
            const pendingUpload = visitImageUploadPromiseRef.current ?? uploadVisitImages(visitImageFiles)
            visitImages = await pendingUpload
          }
        } catch {
          throw new Error("Failed to upload visit images.")
        }
      }

      const newVisitId = await addVisit({
        patientId: selectedPatient.id!,
        patientName: selectedPatient.fullName,
        visitImages,
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
        vitals: cleanedVitals,
      })



      if (typeof form.reset === "function") {
        form.reset()
      }
      setIsVisitModalOpen(false)
      resetVisitFormState()
      fetchVisits()
    } catch (e: any) {
      alert(e.message || "Failed to record visit.")
    } finally {
      setIsUploadingImages(false)
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

      <Modal
        isOpen={isVisitModalOpen}
        onClose={() => { setIsVisitModalOpen(false); resetVisitFormState() }}
        title="Record New Visit (Case Paper)"
      >
        <form className="space-y-3 max-h-[75vh] overflow-y-auto pr-2" onSubmit={handleSave} {...FORM_PROPS}>

          {/* Patient Selection */}
          <div className="space-y-1.5">
            <label className={lbl}>Patient Name *</label>
            <input
              type="text"
              value={selectedPatient ? selectedPatient.fullName : patientSearch}
              onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null) }}
              className={ic}
              placeholder="Search patient..."
              {...FORM_FIELD_PROPS}
            />
            {patientResults.length > 0 && !selectedPatient && (
              <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto bg-white shadow-lg">
                {patientResults.map((patient) => (
                  <button
                    type="button"
                    key={patient.id}
                    onClick={() => { setSelectedPatient(patient); setPatientSearch(""); setPatientResults([]) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    {patient.fullName} - {patient.mobileNumber}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vitals Section */}
          <h4 className={secHead}>Vitals</h4>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1"><label className={lbl}>BP</label><input name="bp" className={ic} placeholder="120/80" {...FORM_FIELD_PROPS} /></div>
            <div className="space-y-1"><label className={lbl}>Pulse (bpm)</label><input name="pulse" type="number" className={ic} placeholder="72" {...FORM_FIELD_PROPS} /></div>
            <div className="space-y-1"><label className={lbl}>Temp (F)</label><input name="temperature" type="number" step="0.1" className={ic} placeholder="98.6" {...FORM_FIELD_PROPS} /></div>
            <div className="space-y-1"><label className={lbl}>SpO2 (%)</label><input name="spo2" type="number" className={ic} placeholder="98" {...FORM_FIELD_PROPS} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><label className={lbl}>Weight (kg)</label><input name="weight" type="number" className={ic} placeholder="70" {...FORM_FIELD_PROPS} /></div>
            <div className="space-y-1"><label className={lbl}>Height (cm)</label><input name="height" type="number" className={ic} placeholder="170" {...FORM_FIELD_PROPS} /></div>
            <div className="space-y-1"><label className={lbl}>Resp Rate</label><input name="respiratoryRate" type="number" className={ic} placeholder="16" {...FORM_FIELD_PROPS} /></div>
          </div>

          {/* Clinical History */}
          <h4 className={secHead}>History & Complaints</h4>
          <div className="space-y-1"><label className={lbl}>Chief Complaints *</label><textarea required name="complaints" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Fever since 3 days, headache, body ache..." {...FORM_FIELD_PROPS} /></div>
          <div className="space-y-1"><label className={lbl}>History of Present Illness</label><textarea name="hpi" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Detailed history of current illness..." {...FORM_FIELD_PROPS} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className={lbl}>Past History</label><input name="pastHistory" className={ic} placeholder="Previous surgeries, illnesses..." {...FORM_FIELD_PROPS} /></div>
            <div className="space-y-1"><label className={lbl}>Family History</label><input name="familyHistory" className={ic} placeholder="Diabetes in family, etc" {...FORM_FIELD_PROPS} /></div>
          </div>

          {/* Examination & Diagnosis */}
          <h4 className={secHead}>Examination & Diagnosis</h4>
          <div className="space-y-1"><label className={lbl}>Examination Findings</label><textarea name="examination" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="On examination: Throat congested, abdomen soft..." {...FORM_FIELD_PROPS} /></div>
          <div className="space-y-1"><label className={lbl}>Diagnosis *</label><input required name="diagnosis" className={ic} placeholder="Acute Viral Fever" {...FORM_FIELD_PROPS} /></div>

          {/* Prescription */}
          <h4 className={secHead}>Prescription (Rx)</h4>
          <div className="space-y-1"><label className={lbl}>Medicines (one per line)</label><textarea name="prescription" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} placeholder={"Tab Paracetamol 500mg - 1-0-1 x 3 days\nTab Cetirizine 10mg - 0-0-1 x 5 days\nSyp Cough - 5ml TDS x 5 days"} {...FORM_FIELD_PROPS} /></div>

          {/* Investigations */}
          <h4 className={secHead}>Investigations & Lab</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className={lbl}>Lab Tests Done</label><input name="labTests" className={ic} placeholder="CBC, Urine, X-ray..." {...FORM_FIELD_PROPS} /></div>
            <div className="space-y-1"><label className={lbl}>Investigations Advised</label><input name="investigations" className={ic} placeholder="MRI, Blood Sugar..." {...FORM_FIELD_PROPS} /></div>
          </div>

          {/* Visit Images */}
          <h4 className={secHead}>Visit Images</h4>
          <div className="space-y-2">
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleVisitImagesChange} />
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Attach case images</p>
                <p className="text-xs text-slate-500">
                  {visitImageFiles.length === 0
                    ? "Upload multiple images before saving this visit."
                    : isUploadingImages
                      ? `${visitImageFiles.length} image${visitImageFiles.length > 1 ? "s" : ""} uploading in background`
                      : uploadedVisitImageUrls.length === visitImageFiles.length
                        ? `${visitImageFiles.length} image${visitImageFiles.length > 1 ? "s" : ""} ready`
                        : `${visitImageFiles.length} image${visitImageFiles.length > 1 ? "s" : ""} selected`}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
                <ImagePlus className="w-4 h-4 mr-2" /> Choose Images
              </Button>
            </div>
            {visitImagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {visitImagePreviews.map((preview, index) => (
                  <div key={`${preview}-${index}`} className="relative h-24 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <Image src={preview} alt={`Visit preview ${index + 1}`} fill unoptimized sizes="(max-width: 640px) 33vw, 160px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
            {isUploadingImages && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading {visitImageFiles.length} visit image{visitImageFiles.length > 1 ? "s" : ""}... {visitImageUploadProgress}%
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-[width] duration-150"
                    style={{ width: `${visitImageUploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            {uploadError && <p className="text-xs font-medium text-red-600">{uploadError}</p>}
          </div>

          {/* Advice & Follow Up */}
          <h4 className={secHead}>Advice & Follow-up</h4>
          <div className="space-y-1"><label className={lbl}>Advice / Instructions</label><textarea name="advice" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Take rest, drink fluids, avoid oily food..." {...FORM_FIELD_PROPS} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className={lbl}>Follow-up Date</label><input name="followUpDate" type="date" className={ic} {...FORM_FIELD_PROPS} /></div>
            <div className="space-y-1"><label className={lbl}>Referral (if any)</label><input name="referral" className={ic} placeholder="Dr. XYZ, Cardiologist" {...FORM_FIELD_PROPS} /></div>
          </div>

          {/* Billing */}
          <div className="space-y-1.5 p-3 bg-red-50 border border-red-100 rounded-lg mt-2">
            <label className="text-sm font-medium text-red-800">Total Bill / Charge (Rs.) - Updates Khata Book</label>
            <input name="totalBill" type="number" className="w-full h-10 px-3 rounded border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" placeholder="500" {...FORM_FIELD_PROPS} />
          </div>

          <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-white pb-1">
            <Button type="button" variant="outline" onClick={() => { setIsVisitModalOpen(false); resetVisitFormState() }} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isUploadingImages ? `Uploading ${visitImageUploadProgress}%...` : isSaving ? "Saving..." : "Save Visit"}</Button>
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
          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {visits.map((visit) => (
            <div key={visit.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{visit.patientName}</h3>
                  <p className="text-xs text-slate-500">{visit.createdAt?.toDate?.()?.toLocaleDateString()}</p>
                </div>
                {visit.totalBill !== undefined && visit.totalBill > 0 && (
                  <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg">Rs.{visit.totalBill}</span>
                )}
              </div>

              {/* Vitals Row */}
              {visit.vitals && (
                <div className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-lg mb-4 text-sm text-slate-700">
                  {visit.vitals.bp && <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-red-400" />BP: {visit.vitals.bp}</span>}
                  {visit.vitals.pulse && <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-pink-400" />Pulse: {visit.vitals.pulse}</span>}
                  {visit.vitals.temperature && <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-orange-400" />Temp: {visit.vitals.temperature}F</span>}
                  {visit.vitals.spo2 && <span>SpO2: {visit.vitals.spo2}%</span>}
                  {visit.vitals.weight && <span>Wt: {visit.vitals.weight}kg</span>}
                  {visit.vitals.height && <span>Ht: {visit.vitals.height}cm</span>}
                  {visit.vitals.respiratoryRate && <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-blue-400" />RR: {visit.vitals.respiratoryRate}</span>}
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
                    {visit.prescriptions.map((prescription, index) => <li key={index}>{prescription.name}</li>)}
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

              <VisitImageGallery images={visit.visitImages} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
