"use client"

import { Edit, Printer } from "lucide-react"
import { Visit } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface VisitCardProps {
  visit: Visit
  onEdit?: (visit: Visit) => void
  showClinicalDetails?: boolean
}

export function VisitCard({ visit, onEdit, showClinicalDetails = true }: VisitCardProps) {
  const hasMedicines = showClinicalDetails && visit.prescriptions && visit.prescriptions.length > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {showClinicalDetails ? (visit.diagnosis || "Consultation") : "Visit Record"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {visit.created_at ? new Date(visit.created_at).toLocaleDateString() : "-"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {showClinicalDetails && onEdit && (
            <button
              onClick={() => onEdit(visit)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors print:hidden"
              title="Edit visit"
            >
              <Edit className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {showClinicalDetails && visit.complaints && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Complaints</p>
            <p className="text-sm text-slate-700 mt-1">{visit.complaints}</p>
          </div>
        )}

        {showClinicalDetails && visit.examination_findings && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Examination</p>
            <p className="text-sm text-slate-700 mt-1">{visit.examination_findings}</p>
          </div>
        )}

        {showClinicalDetails && visit.vitals && Object.values(visit.vitals).some(v => v) && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Vitals</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {visit.vitals.bp && <Badge variant="secondary">BP: {visit.vitals.bp}</Badge>}
              {visit.vitals.temperature && <Badge variant="secondary">Temp: {visit.vitals.temperature} deg F</Badge>}
              {visit.vitals.pulse && <Badge variant="secondary">Pulse: {visit.vitals.pulse} bpm</Badge>}
              {visit.vitals.weight && <Badge variant="secondary">Weight: {visit.vitals.weight} kg</Badge>}
              {visit.vitals.spo2 && <Badge variant="secondary">SpO2: {visit.vitals.spo2}%</Badge>}
            </div>
          </div>
        )}

        {hasMedicines && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Medicines ({visit.prescriptions!.length})
              </p>
            </div>
            <div className="space-y-2">
              {visit.prescriptions!.map((med, idx) => (
                <div key={idx} className="text-sm bg-slate-50 p-2 rounded">
                  <p className="font-medium text-slate-900">{med.name}</p>
                  <p className="text-xs text-slate-600">{med.dosage} - {med.frequency} for {med.days} days</p>
                  {med.notes && <p className="text-xs text-slate-500 italic">{med.notes}</p>}
                </div>
              ))}
            </div>

            {/* Print Prescription buttons — right below medicines */}
            <div className="mt-3 flex gap-2 print:hidden">
              <Button
                type="button"
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800"
                onClick={() => window.open(`/visits/${visit.id}/print`, '_blank')}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print Prescription
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => window.open(`/visits/${visit.id}/print?autoprint=1`, '_blank')}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Quick Print
              </Button>
            </div>
          </div>
        )}

        {showClinicalDetails && visit.lab_tests && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Lab Tests</p>
            <p className="text-sm text-slate-700 mt-1">{visit.lab_tests}</p>
          </div>
        )}

        {showClinicalDetails && visit.advice && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Advice</p>
            <p className="text-sm text-slate-700 mt-1">{visit.advice}</p>
          </div>
        )}

        {visit.total_bill && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-900">
              Total Bill: {formatCurrency(visit.total_bill)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
