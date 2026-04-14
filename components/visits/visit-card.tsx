"use client"

import { Edit } from "lucide-react"
import { Visit } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface VisitCardProps {
  visit: Visit
  onEdit?: (visit: Visit) => void
  showClinicalDetails?: boolean
}

export function VisitCard({ visit, onEdit, showClinicalDetails = true }: VisitCardProps) {
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
          {showClinicalDetails && (
            <button
              onClick={() => window.open(`/visits/${visit.id}/print`, '_blank')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors print:hidden"
              title="Print Prescription"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </button>
          )}
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
              {visit.vitals.temperature && <Badge variant="secondary">Temp: {visit.vitals.temperature}°F</Badge>}
              {visit.vitals.pulse && <Badge variant="secondary">Pulse: {visit.vitals.pulse} bpm</Badge>}
              {visit.vitals.weight && <Badge variant="secondary">Weight: {visit.vitals.weight} kg</Badge>}
              {visit.vitals.spo2 && <Badge variant="secondary">SpO2: {visit.vitals.spo2}%</Badge>}
            </div>
          </div>
        )}

        {showClinicalDetails && visit.prescriptions && visit.prescriptions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Medicines</p>
            <div className="space-y-2 mt-2">
              {visit.prescriptions.map((med, idx) => (
                <div key={idx} className="text-sm bg-slate-50 p-2 rounded">
                  <p className="font-medium text-slate-900">{med.name}</p>
                  <p className="text-xs text-slate-600">{med.dosage} - {med.frequency} for {med.days} days</p>
                  {med.notes && <p className="text-xs text-slate-500 italic">{med.notes}</p>}
                </div>
              ))}
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
