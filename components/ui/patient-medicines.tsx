"use client"

import { Plus, Trash2 } from "lucide-react"
import type { Medicine } from "@/lib/types"

interface PatientMedicinesProps {
  medicines: Medicine[] | undefined
  onMedicinesChange: (medicines: Medicine[]) => void
  readOnly?: boolean
}

function createEmptyMedicine(): Medicine {
  return {
    name: "",
    potency: "",
    dosage: "",
    frequency: "",
    days: 0,
    notes: "",
  }
}

export function PatientMedicines({
  medicines = [],
  onMedicinesChange,
  readOnly = false,
}: PatientMedicinesProps) {
  const meds = medicines || []

  const handleAdd = () => {
    onMedicinesChange([...meds, createEmptyMedicine()])
  }

  const handleUpdate = <K extends keyof Medicine>(
    index: number,
    field: K,
    value: Medicine[K]
  ) => {
    onMedicinesChange(
      meds.map((medicine, medicineIndex) =>
        medicineIndex === index ? { ...medicine, [field]: value } : medicine
      )
    )
  }

  const handleDelete = (index: number) => {
    onMedicinesChange(meds.filter((_, medicineIndex) => medicineIndex !== index))
  }

  if (readOnly) {
    if (meds.length === 0) {
      return <p className="text-sm text-slate-500">No medicines listed</p>
    }

    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="hidden grid-cols-[1.5fr_0.7fr_0.7fr_0.5fr] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-500 sm:grid">
          <span>Medicine</span>
          <span>Dosage</span>
          <span>Frequency</span>
          <span className="text-right">Days</span>
        </div>
        {meds.map((medicine, index) => (
          <div
            key={`${medicine.name}-${index}`}
            className="grid gap-2 border-b border-slate-100 px-3 py-3 text-sm last:border-b-0 sm:grid-cols-[1.5fr_0.7fr_0.7fr_0.5fr] sm:gap-3"
          >
            <div>
              <h4 className="font-semibold text-slate-900">{medicine.name}</h4>
              {medicine.potency ? (
                <p className="mt-0.5 text-xs font-medium text-emerald-700">
                  Potency: {medicine.potency}
                </p>
              ) : null}
              {medicine.notes ? (
                <p className="mt-1 text-xs text-slate-500">{medicine.notes}</p>
              ) : null}
            </div>
            <div className="text-slate-700"><span className="font-medium text-slate-500 sm:hidden">Dosage: </span>{medicine.dosage || "-"}</div>
            <div className="text-slate-700"><span className="font-medium text-slate-500 sm:hidden">Frequency: </span>{medicine.frequency || "-"}</div>
            <div className="text-slate-700 sm:text-right">
              <span className="font-medium text-slate-500 sm:hidden">Duration: </span>
              {medicine.days || "-"}{medicine.days ? " days" : ""}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {meds.length > 0 ? (
        <div className="space-y-4">
          {meds.map((medicine, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Medicine {index + 1}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Fill all rows you need, then save the list once.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                  title="Remove medicine"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Medicine Name *</label>
                  <input
                    type="text"
                    value={medicine.name}
                    onChange={(event) => handleUpdate(index, "name", event.target.value)}
                    placeholder="e.g. Rhus tox"
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Potency</label>
                  <input
                    type="text"
                    value={medicine.potency || ""}
                    onChange={(event) => handleUpdate(index, "potency", event.target.value)}
                    placeholder="e.g. 200, 1M"
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Dosage *</label>
                  <input
                    type="text"
                    value={medicine.dosage}
                    onChange={(event) => handleUpdate(index, "dosage", event.target.value)}
                    placeholder="e.g. 1m"
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Frequency *</label>
                  <input
                    type="text"
                    value={medicine.frequency}
                    onChange={(event) => handleUpdate(index, "frequency", event.target.value)}
                    placeholder="e.g. OD, BD, TDS"
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Duration (days)</label>
                  <input
                    type="number"
                    min="0"
                    value={medicine.days || ""}
                    onChange={(event) =>
                      handleUpdate(index, "days", Number.parseInt(event.target.value, 10) || 0)
                    }
                    placeholder="e.g. 15"
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Notes</label>
                  <input
                    type="text"
                    value={medicine.notes || ""}
                    onChange={(event) => handleUpdate(index, "notes", event.target.value)}
                    placeholder="e.g. Before meals"
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-500">
          No medicines added yet. Start with the button below.
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/60 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
      >
        <span className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Medicine
        </span>
      </button>
    </div>
  )
}
