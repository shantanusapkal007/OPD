/**
 * Stat Card Component
 * Displays metrics with consistent styling
 */

import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  tone?: "blue" | "green" | "amber" | "red" | "purple" | "teal"
  trend?: { value: number; isPositive: boolean }
  onClick?: () => void
}

export function StatCard({ label, value, icon: Icon, tone = "blue", trend, onClick }: StatCardProps) {
  const toneClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", text: "text-blue-900" },
    green: { bg: "bg-green-50", icon: "text-green-600", text: "text-green-900" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", text: "text-amber-900" },
    red: { bg: "bg-red-50", icon: "text-red-600", text: "text-red-900" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", text: "text-purple-900" },
    teal: { bg: "bg-teal-50", icon: "text-teal-600", text: "text-teal-900" },
  }

  const tones = toneClasses[tone]

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-slate-200 p-4 sm:p-6 bg-white shadow-sm hover:shadow-md transition-all ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-2">{label}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${tones.text}`}>{value}</p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from yesterday
            </p>
          )}
        </div>
        {Icon && (
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${tones.bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${tones.icon}`} />
          </div>
        )}
      </div>
    </div>
  )
}
