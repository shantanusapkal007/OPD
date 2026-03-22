"use client"

import { useState, useEffect } from "react"
import { BookOpen, IndianRupee, MessageSquare, ChevronRight, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { getKhataPatients } from "@/services/patient.service"
import type { Patient } from "@/lib/types"

export default function KhataBookPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchKhata() {
      try {
        const data = await getKhataPatients()
        setPatients(data)
        setError("")
      } catch (e) {
        setError("Failed to load khata book.")
      } finally {
        setLoading(false)
      }
    }
    fetchKhata()
  }, [])

  const totalOwed = patients.reduce((sum, p) => (p.khataBalance ?? 0) < 0 ? sum + Math.abs(p.khataBalance ?? 0) : sum, 0)
  const totalAdvance = patients.reduce((sum, p) => (p.khataBalance ?? 0) > 0 ? sum + (p.khataBalance ?? 0) : sum, 0)

  const dues = patients.filter(p => (p.khataBalance ?? 0) < 0)
  const advances = patients.filter(p => (p.khataBalance ?? 0) > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Khata Book (Ledger)
          </h1>
          <p className="text-sm text-slate-500">Track pending dues and advance payments across all patients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-red-100 bg-red-50/30">
          <CardContent className="p-6 flex flex-col gap-2">
             <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-800">Total Pending Dues (to be collected)</span>
            </div>
            <h3 className="text-3xl font-bold text-red-600 mt-2">₹{totalOwed.toLocaleString()}</h3>
          </CardContent>
        </Card>
        
        <Card className="border-green-100 bg-green-50/30">
          <CardContent className="p-6 flex flex-col gap-2">
             <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-800">Total Advances (pre-paid)</span>
            </div>
            <h3 className="text-3xl font-bold text-green-600 mt-2">₹{totalAdvance.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Patients Pending Dues</h3>
          <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-1 rounded-full">{dues.length} Records</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading Khata records...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dues.map((p) => (
              <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar fallback={p.fullName.substring(0, 2).toUpperCase()} size="md" />
                  <div>
                    <h4 className="font-medium text-slate-900">{p.fullName}</h4>
                    <p className="text-xs text-slate-500">{p.mobileNumber} • Case: {p.caseNumber}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 uppercase block mb-0.5">Owes</span>
                    <span className="text-lg font-bold text-red-600">₹{Math.abs(p.khataBalance || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100" onClick={() => {
                        window.open(`https://wa.me/91${p.mobileNumber}?text=Hello ${p.fullName.split(' ')[0]}, this is a gentle reminder from our clinic regarding a pending balance of Rs. ${Math.abs(p.khataBalance || 0)} on your Khata account.`, '_blank')
                    }}>
                      <MessageSquare className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </Button>
                    <Link href={`/patients/${p.id}`}>
                      <Button variant="outline" size="sm">
                        Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {!loading && dues.length === 0 && (
              <div className="p-12 text-center text-slate-500">All balances are clear! No patients owe money.</div>
            )}
          </div>
        )}
      </div>

      {advances.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mt-8">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Advance Accounts</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {advances.map((p) => (
              <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar fallback={p.fullName.substring(0, 2).toUpperCase()} size="md" />
                  <div>
                    <h4 className="font-medium text-slate-900">{p.fullName}</h4>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 uppercase block mb-0.5">Advance</span>
                    <span className="text-lg font-bold text-green-600">₹{p.khataBalance}</span>
                  </div>
                  <Link href={`/patients/${p.id}`}>
                    <Button variant="outline" size="sm">
                      Details <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
