"use client"

import { Plus, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Medicine } from "@/lib/types"

interface PatientMedicinesProps {
  medicines: Medicine[] | undefined
  onMedicinesChange?: (medicines: Medicine[]) => void
  readOnly?: boolean
}

export function PatientMedicines({ medicines = [], onMedicinesChange, readOnly = false }: PatientMedicinesProps) {
  const meds = medicines || []

  const handleAdd = () => {
    if (!onMedicinesChange) return
    onMedicinesChange([...meds, { name: "", dosage: "", frequency: "", days: 3, potency: "" }])
  }

  const updateMedicine = (idx: number, field: keyof Medicine, val: string | number) => { 
    if (!onMedicinesChange) return
    const newMeds = [...meds]; 
    newMeds[idx] = { ...newMeds[idx], [field]: val as never }; 
    onMedicinesChange(newMeds); 
  }

  const handleDelete = (idx: number) => {
    if (!onMedicinesChange) return
    onMedicinesChange(meds.filter((_, i) => i !== idx))
  }

  if (readOnly) {
    if (meds.length === 0) {
      return <p className="text-sm text-slate-500">No medicines listed</p>
    }

    return (
      <div className="space-y-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 font-semibold">Medicine</th>
                <th className="px-3 py-2 font-semibold">Potency</th>
                <th className="px-3 py-2 font-semibold text-center">Dose</th>
                <th className="px-3 py-2 font-semibold text-center">Freq</th>
                <th className="px-3 py-2 font-semibold text-center">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meds.map((px, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {px.name}
                    {px.notes && <span className="block text-[10px] font-normal text-slate-500 mt-0.5">{px.notes}</span>}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{px.potency || "-"}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{px.dosage}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{px.frequency}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{px.days} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-2">
      {meds.length === 0 && <p className="text-xs text-center text-slate-400 py-2">No medicines currently added.</p>}
      {meds.map((med, idx) => (
        <div key={idx} className="bg-white p-3 rounded shadow-sm border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <input className="w-full h-9 px-3 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500" placeholder="Medicine Name" value={med.name} onChange={e => updateMedicine(idx, 'name', e.target.value)} />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <input className="h-9 px-3 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500" placeholder="Potency (30C)" value={med.potency || ""} onChange={e => updateMedicine(idx, 'potency', e.target.value)} />
                <input className="h-9 px-3 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500" placeholder="Dose (1-0-1)" value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} />
                <input className="h-9 px-3 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500" placeholder="Freq (BD)" value={med.frequency} onChange={e => updateMedicine(idx, 'frequency', e.target.value)} />
                <div className="flex items-center gap-2">
                  <input type="number" className="w-full h-9 px-3 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500" placeholder="Days" value={med.days || ""} onChange={e => updateMedicine(idx, 'days', parseInt(e.target.value) || 0)} />
                  <span className="text-xs text-slate-500 shrink-0">days</span>
                </div>
              </div>
              <input className="w-full h-9 px-3 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500" placeholder="Notes (e.g., After food)" value={med.notes || ""} onChange={e => updateMedicine(idx, 'notes', e.target.value)} />
            </div>
            <button type="button" onClick={() => handleDelete(idx)} className="text-slate-300 hover:text-red-500 p-1 shrink-0"><XCircle className="w-5 h-5" /></button>
          </div>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={handleAdd} className="w-full text-blue-600 text-xs mt-1 border border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 focus:ring-0">
        <Plus className="w-3 h-3 mr-1"/> Add Multiple Medicine Option
      </Button>
    </div>
  )
}
