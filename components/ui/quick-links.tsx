"use client"

import { useRouter } from "next/navigation"
import { Pill, Calendar, IndianRupee, BookOpen, ArrowRight } from "lucide-react"

interface QuickLinksProps {
  patientId?: string
  compact?: boolean
}

export function QuickLinks({ patientId, compact = false }: QuickLinksProps) {
  const router = useRouter()

  if (!patientId) return null

  const links = [
    {
      icon: Pill,
      label: "Visits",
      onClick: () => router.push(`/patients/${patientId}?tab=visits`),
      color: "text-green-600"
    },
    {
      icon: Calendar,
      label: "Appointments",
      onClick: () => router.push(`/patients/${patientId}?tab=appointments`),
      color: "text-blue-600"
    },
    {
      icon: IndianRupee,
      label: "Payments",
      onClick: () => router.push(`/patients/${patientId}?tab=payments`),
      color: "text-purple-600"
    },
    {
      icon: BookOpen,
      label: "Khata",
      onClick: () => router.push(`/patients/${patientId}?tab=khata`),
      color: "text-orange-600"
    },
  ]

  if (compact) {
    return (
      <div className="flex gap-2">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.label}
              onClick={link.onClick}
              title={link.label}
              className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${link.color}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => {
        const Icon = link.icon
        return (
          <button
            key={link.label}
            onClick={link.onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm font-medium ${link.color}`}
          >
            <Icon className="w-4 h-4" />
            {link.label}
            <ArrowRight className="w-3 h-3 opacity-50" />
          </button>
        )
      })}
    </div>
  )
}
