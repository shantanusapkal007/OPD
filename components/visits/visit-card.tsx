/**
 * Visit Card Component
 * Displays visit details with edit functionality
 */

import { Edit, CheckCircle2, Clock, Pill } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VisitImageGallery } from "./visit-image-gallery"
import type { Visit } from "@/lib/types"

interface VisitCardProps {
  visit: Visit
  onEdit: (visit: Visit) => void
}

export function VisitCard({ visit, onEdit }: VisitCardProps) {
  const visitDate = visit.createdAt?.toDate?.()
  const editedDate = visit.editedAt?.toDate?.()

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with date and edit button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">
            {visitDate?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) ||
              "Visit"}
          </h3>

          {/* Audit trail - show if edited */}
          {visit.isEdited && editedDate && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Edited {editedDate.toLocaleDateString()}
              </Badge>
              {visit.editedBy && (
                <span className="text-xs text-slate-500">by {visit.editedBy}</span>
              )}
            </div>
          )}
        </div>

        {/* Edit button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(visit)}
          className="flex-shrink-0 ml-4"
        >
          <Edit className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>

      {/* Vitals section */}
      {visit.vitals && (
        <div className="flex flex-wrap gap-3 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700">
          {visit.vitals.bp && <span><Clock className="w-4 h-4 inline text-slate-400 mr-1" /><strong>BP:</strong> {visit.vitals.bp}</span>}
          {visit.vitals.weight && <span><strong>Weight:</strong> {visit.vitals.weight}kg</span>}
          {visit.vitals.pulse && <span><strong>Pulse:</strong> {visit.vitals.pulse} bpm</span>}
          {visit.vitals.temperature && <span><strong>Temp:</strong> {visit.vitals.temperature}°F</span>}
          {visit.vitals.spo2 && <span><strong>SpO2:</strong> {visit.vitals.spo2}%</span>}
        </div>
      )}

      {/* Main clinical information */}
      <div className="space-y-4 mb-4">
        {/* Complaints */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Complaints</h4>
          <p className="text-sm text-slate-900 leading-relaxed">{visit.complaints}</p>
        </div>

        {/* Diagnosis */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Diagnosis</h4>
          <p className="text-sm text-slate-900 font-medium leading-relaxed">{visit.diagnosis}</p>
        </div>

        {/* LMP - Obstetric information */}
        {visit.lmp && (
          <div className="p-3 bg-pink-50 border border-pink-100 rounded-lg">
            <h4 className="text-xs font-semibold text-pink-700 uppercase mb-1">Obstetric Information</h4>
            <div className="space-y-1">
              <p className="text-sm text-pink-900"><strong>LMP:</strong> {visit.lmp}</p>
              {visit.edd && <p className="text-sm text-pink-900"><strong>EDD:</strong> {visit.edd}</p>}
            </div>
          </div>
        )}

        {/* Clinical notes */}
        {visit.notes && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Clinical Notes</h4>
            <p className="text-sm text-slate-900 leading-relaxed">{visit.notes}</p>
          </div>
        )}

        {/* Medicines/Prescriptions */}
        {visit.prescriptions && visit.prescriptions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-4 h-4 text-green-600" />
              <h4 className="text-xs font-semibold text-slate-500 uppercase">Medicines</h4>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Medicine</th>
                    <th className="px-4 py-2 font-semibold">Dosage</th>
                    <th className="px-4 py-2 font-semibold">Frequency</th>
                    <th className="px-4 py-2 font-semibold text-center">Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visit.prescriptions.map((med, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-900">{med.name}</td>
                      <td className="px-4 py-2 text-slate-700">{med.dosage}</td>
                      <td className="px-4 py-2 text-slate-700">{med.frequency}</td>
                      <td className="px-4 py-2 text-center text-slate-700">{med.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gallery */}
        <VisitImageGallery images={visit.visitImages} />

        {/* Advice */}
        {visit.advice && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <h4 className="text-xs font-semibold text-amber-700 uppercase mb-1">Advice</h4>
            <p className="text-sm text-amber-900 leading-relaxed">{visit.advice}</p>
          </div>
        )}

        {/* Follow-up */}
        {visit.followUpDate && (
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Follow-up Date</h4>
            <p className="text-sm text-slate-900 font-medium">{visit.followUpDate}</p>
          </div>
        )}
      </div>
    </div>
  )
}
