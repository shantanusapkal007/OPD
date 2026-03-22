"use client"

import { useState } from "react"
import { Building2, Clock, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FORM_FIELD_PROPS, FORM_PROPS } from "@/lib/form-defaults"

export default function SettingsPage() {
  const [savingForm, setSavingForm] = useState<string | null>(null)

  const handleSave = (e: React.FormEvent, formName: string) => {
    e.preventDefault()
    setSavingForm(formName)
    setTimeout(() => {
      setSavingForm(null)
      alert("Settings saved successfully!")
    }, 150)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your clinic preferences and configurations</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Clinic Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={(e) => handleSave(e, 'profile')} {...FORM_PROPS}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Clinic Name</label>
                  <input type="text" defaultValue="City Care Clinic" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...FORM_FIELD_PROPS} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Doctor Name</label>
                  <input type="text" defaultValue="Dr. Smith" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...FORM_FIELD_PROPS} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <input type="text" defaultValue="+91 9876543210" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...FORM_FIELD_PROPS} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input type="email" defaultValue="contact@citycare.com" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...FORM_FIELD_PROPS} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Address</label>
                  <textarea rows={3} defaultValue="123 Health Avenue, Medical District, Mumbai" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" {...FORM_FIELD_PROPS} />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={savingForm === 'profile'}>{savingForm === 'profile' ? "Saving..." : "Save Profile"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <CardTitle className="text-lg">Appointment Slots</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={(e) => handleSave(e, 'slots')} {...FORM_PROPS}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Duration (mins)</label>
                  <select defaultValue="30" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...FORM_FIELD_PROPS}>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                    <option value="60">60</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Start Time</label>
                  <input type="time" defaultValue="09:00" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...FORM_FIELD_PROPS} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">End Time</label>
                  <input type="time" defaultValue="18:00" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...FORM_FIELD_PROPS} />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={savingForm === 'slots'}>{savingForm === 'slots' ? "Saving..." : "Save Slots"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-green-600" />
            </div>
            <CardTitle className="text-lg">WhatsApp Integration</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">Connection Status</h4>
                <p className="text-sm text-slate-500">WhatsApp Business API is not connected</p>
              </div>
              <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-medium">Disconnected</span>
            </div>
            <form onSubmit={(e) => handleSave(e, 'whatsapp')} {...FORM_PROPS}>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Provider</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...FORM_FIELD_PROPS}>
                    <option>Twilio</option>
                    <option>WATI</option>
                    <option>Meta Direct</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">API Key / Access Token</label>
                  <input type="password" placeholder="Enter API Key" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...FORM_FIELD_PROPS} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline">Test Connection</Button>
                <Button type="submit" disabled={savingForm === 'whatsapp'}>{savingForm === 'whatsapp' ? "Saving..." : "Save Config"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <CardTitle className="text-lg">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-medium text-slate-900 mb-1">Import / Export Clinic Data</h4>
              <p className="text-sm text-slate-500 mb-4">Backup your patient records, appointments, and settings, or import them from another system.</p>
              <div className="flex justify-end">
                <Button type="button" onClick={() => window.location.href = '/data'} variant="default">Go to Data Management</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
