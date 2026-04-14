"use client"

import { useEffect, useState } from "react"
import { Building2, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FORM_FIELD_PROPS, FORM_PROPS } from "@/lib/form-defaults"
import { useToast } from "@/components/ui/toast"
import { getClinicSettings, updateClinicSettings } from "@/services/clinic-settings.service"
import type { ClinicSettings } from "@/lib/types"

const inputClass = "w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
const textareaClass = "w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"

const defaultSettings: ClinicSettings = {
  clinic_name: "OPD Clinic",
  doctor_name: "",
  specialization: "",
  registration_number: "",
  phone: "",
  email: "",
  address: "",
  logo_url: "",
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ClinicSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    let active = true

    getClinicSettings()
      .then((data) => {
        if (!active) return
        setSettings({ ...defaultSettings, ...data })
      })
      .catch(() => {
        if (!active) return
        showToast("Failed to load clinic settings.", "error")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [showToast])

  const handleChange = (field: keyof ClinicSettings, value: string) => {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateClinicSettings({
        clinic_name: settings.clinic_name.trim() || "OPD Clinic",
        doctor_name: settings.doctor_name.trim(),
        specialization: settings.specialization.trim(),
        registration_number: settings.registration_number?.trim(),
        phone: settings.phone.trim(),
        email: settings.email.trim(),
        address: settings.address.trim(),
        logo_url: settings.logo_url?.trim(),
      })
      showToast("Clinic settings saved successfully.", "success")
    } catch (error: any) {
      showToast(error.message || "Failed to save clinic settings.", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading clinic settings...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage clinic branding and the printable prescription header.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <CardTitle className="text-lg">Clinic Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSave} {...FORM_PROPS} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Clinic Name</label>
                <input value={settings.clinic_name} onChange={(e) => handleChange("clinic_name", e.target.value)} className={inputClass} {...FORM_FIELD_PROPS} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Doctor Name</label>
                <input value={settings.doctor_name} onChange={(e) => handleChange("doctor_name", e.target.value)} className={inputClass} placeholder="Dr. Consultant" {...FORM_FIELD_PROPS} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Specialization</label>
                <input value={settings.specialization} onChange={(e) => handleChange("specialization", e.target.value)} className={inputClass} placeholder="General Physician" {...FORM_FIELD_PROPS} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Registration Number</label>
                <input value={settings.registration_number || ""} onChange={(e) => handleChange("registration_number", e.target.value)} className={inputClass} placeholder="Optional" {...FORM_FIELD_PROPS} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <input value={settings.phone} onChange={(e) => handleChange("phone", e.target.value)} className={inputClass} placeholder="+91 9876543210" {...FORM_FIELD_PROPS} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input value={settings.email} onChange={(e) => handleChange("email", e.target.value)} className={inputClass} placeholder="care@clinic.com" {...FORM_FIELD_PROPS} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Logo URL</label>
                <input value={settings.logo_url || ""} onChange={(e) => handleChange("logo_url", e.target.value)} className={inputClass} placeholder="Leave blank for now if the logo will be added later" {...FORM_FIELD_PROPS} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <textarea value={settings.address} onChange={(e) => handleChange("address", e.target.value)} rows={3} className={textareaClass} placeholder="Clinic address shown on printed prescriptions" {...FORM_FIELD_PROPS} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                  <FileText className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Print Header Preview</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    The prescription print layout now pulls its header from these clinic profile fields and keeps a reserved logo space even if you have not added the logo yet.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
