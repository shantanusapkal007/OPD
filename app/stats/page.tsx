"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3, CalendarRange, IndianRupee, Layers3, Loader2, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPatients } from "@/services/patient.service"
import { getVisits } from "@/services/visit.service"
import { getPayments } from "@/services/payment.service"
import { formatCurrency } from "@/lib/utils"
import type { Department, Patient, Payment, Visit, VisitSetting } from "@/lib/types"

type Period = "weekly" | "monthly" | "yearly"

const departments: Department[] = ["Skin", "Pediatrician", "General", "OBGY"]
const settingsList: VisitSetting[] = ["OPD", "Daycare"]

const periodLabels: Record<Period, string> = {
  weekly: "Last 7 days",
  monthly: "Last 30 days",
  yearly: "Last 12 months",
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function getDateValue(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatBucketLabel(date: Date, period: Period) {
  if (period === "yearly") {
    return date.toLocaleDateString(undefined, { month: "short" })
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function getTrendBuckets(period: Period) {
  const today = startOfDay(new Date())

  if (period === "yearly") {
    return Array.from({ length: 12 }, (_, index) => {
      const date = startOfDay(addMonths(today, index - 11))
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: formatBucketLabel(date, period),
        start: startOfDay(new Date(date.getFullYear(), date.getMonth(), 1)),
        end: startOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 1)),
      }
    })
  }

  const days = period === "weekly" ? 7 : 30
  return Array.from({ length: days }, (_, index) => {
    const date = startOfDay(addDays(today, index - (days - 1)))
    return {
      key: date.toISOString().slice(0, 10),
      label: formatBucketLabel(date, period),
      start: date,
      end: startOfDay(addDays(date, 1)),
    }
  })
}

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>("weekly")
  const [patients, setPatients] = useState<Patient[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    Promise.all([getPatients(), getVisits(), getPayments()])
      .then(([patientRows, visitRows, paymentRows]) => {
        if (!active) return
        setPatients(patientRows)
        setVisits(visitRows)
        setPayments(paymentRows)
        setError("")
      })
      .catch(() => {
        if (!active) return
        setError("Failed to load statistics.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const today = startOfDay(new Date())
    const periodStart = period === "weekly" ? addDays(today, -6) : period === "monthly" ? addDays(today, -29) : addMonths(today, -11)
    const patientById = new Map(patients.filter((patient) => patient.id).map((patient) => [patient.id as string, patient]))

    const periodVisits = visits.filter((visit) => {
      const date = getDateValue(visit.created_at)
      return date && date >= periodStart
    })

    const paidPayments = payments.filter((payment) => payment.status === "paid")
    const periodPayments = paidPayments.filter((payment) => {
      const date = getDateValue(payment.date || payment.created_at)
      return date && date >= periodStart
    })

    const newPatients = patients.filter((patient) => {
      const date = getDateValue(patient.created_at)
      return date && date >= periodStart
    })

    const trendBuckets = getTrendBuckets(period).map((bucket) => {
      const visitCount = periodVisits.filter((visit) => {
        const date = getDateValue(visit.created_at)
        return date && date >= bucket.start && date < bucket.end
      }).length

      const revenue = periodPayments.reduce((sum, payment) => {
        const date = getDateValue(payment.date || payment.created_at)
        if (date && date >= bucket.start && date < bucket.end) {
          return sum + payment.amount
        }
        return sum
      }, 0)

      return {
        ...bucket,
        visitCount,
        revenue,
      }
    })

    const departmentMetrics = departments.map((department) => {
      const patientCount = patients.filter((patient) => patient.department === department).length
      const visitCount = periodVisits.filter((visit) => patientById.get(visit.patient_id)?.department === department).length
      const revenue = periodPayments.reduce((sum, payment) => {
        return patientById.get(payment.patient_id)?.department === department ? sum + payment.amount : sum
      }, 0)

      return { label: department, patientCount, visitCount, revenue }
    })

    const settingMetrics = settingsList.map((setting) => {
      const patientCount = patients.filter((patient) => patient.setting === setting).length
      const visitCount = periodVisits.filter((visit) => patientById.get(visit.patient_id)?.setting === setting).length
      const revenue = periodPayments.reduce((sum, payment) => {
        return patientById.get(payment.patient_id)?.setting === setting ? sum + payment.amount : sum
      }, 0)

      return { label: setting, patientCount, visitCount, revenue }
    })

    return {
      totalVisits: periodVisits.length,
      totalRevenue: periodPayments.reduce((sum, payment) => sum + payment.amount, 0),
      newPatients: newPatients.length,
      totalPatients: patients.length,
      trendBuckets,
      departmentMetrics,
      settingMetrics,
    }
  }, [patients, payments, period, visits])

  const maxVisits = Math.max(...stats.trendBuckets.map((bucket) => bucket.visitCount), 1)
  const maxRevenue = Math.max(...stats.trendBuckets.map((bucket) => bucket.revenue), 1)
  const maxDepartmentPatients = Math.max(...stats.departmentMetrics.map((entry) => entry.patientCount), 1)
  const maxSettingVisits = Math.max(...stats.settingMetrics.map((entry) => entry.visitCount), 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading statistics...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Statistics</h1>
          <p className="text-sm text-slate-500">Visits, revenue, and patient mix grouped by department and setting.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["weekly", "monthly", "yearly"] as Period[]).map((value) => (
            <Button
              key={value}
              type="button"
              variant={period === value ? "default" : "outline"}
              className="capitalize"
              onClick={() => setPeriod(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      {error ? <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={CalendarRange} label="Visits" value={String(stats.totalVisits)} tone="sky" meta={periodLabels[period]} />
        <SummaryCard icon={IndianRupee} label="Revenue" value={formatCurrency(stats.totalRevenue)} tone="emerald" meta="Paid collections" />
        <SummaryCard icon={Users} label="New Patients" value={String(stats.newPatients)} tone="amber" meta={periodLabels[period]} />
        <SummaryCard icon={Layers3} label="Total Patients" value={String(stats.totalPatients)} tone="rose" meta="Current profile base" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr,1fr]">
        <Card className="overflow-hidden border-sky-100 shadow-[0_20px_60px_-36px_rgba(14,165,233,0.45)]">
          <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-sky-600" /> Trend Overview
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">CSS-only bars for {periodLabels[period].toLowerCase()}.</p>
              </div>
              <Badge variant="secondary" className="bg-white text-slate-700">{periodLabels[period]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Visits</span>
              <span className="text-right">Revenue</span>
            </div>
            <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${stats.trendBuckets.length}, minmax(0, 1fr))` }}>
              {stats.trendBuckets.map((bucket) => (
                <div key={bucket.key} className="flex min-w-0 flex-col items-center gap-3">
                  <div className="flex h-52 items-end gap-2">
                    <div className="flex h-full items-end">
                      <div
                        className="w-3 rounded-full bg-gradient-to-t from-sky-500 to-cyan-300"
                        style={{ height: `${Math.max((bucket.visitCount / maxVisits) * 100, bucket.visitCount > 0 ? 10 : 0)}%` }}
                        title={`${bucket.label}: ${bucket.visitCount} visits`}
                      />
                    </div>
                    <div className="flex h-full items-end">
                      <div
                        className="w-3 rounded-full bg-gradient-to-t from-emerald-500 to-lime-300"
                        style={{ height: `${Math.max((bucket.revenue / maxRevenue) * 100, bucket.revenue > 0 ? 10 : 0)}%` }}
                        title={`${bucket.label}: ${formatCurrency(bucket.revenue)}`}
                      />
                    </div>
                  </div>
                  <div className="w-full text-center">
                    <p className="truncate text-[11px] font-medium text-slate-700">{bucket.label}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{bucket.visitCount} / {formatCurrency(bucket.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-amber-100 shadow-[0_20px_60px_-36px_rgba(245,158,11,0.35)]">
          <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600" /> Department Snapshot
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">Patient base, visit load, and collections by department.</p>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            {stats.departmentMetrics.map((entry) => (
              <div key={entry.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                  <p className="text-xs text-slate-500">{entry.patientCount} patients</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                    style={{ width: `${(entry.patientCount / maxDepartmentPatients) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{entry.visitCount} visits</span>
                  <span>{formatCurrency(entry.revenue)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden border-violet-100 shadow-[0_20px_60px_-36px_rgba(139,92,246,0.28)]">
          <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-600" /> Patient Distribution
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">Current profile mix by department.</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.departmentMetrics.map((entry) => (
                <div key={entry.label} className="grid grid-cols-[120px,1fr,64px] items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">{entry.label}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                      style={{ width: `${(entry.patientCount / maxDepartmentPatients) * 100}%` }}
                    />
                  </div>
                  <span className="text-right text-sm font-medium text-slate-900">{entry.patientCount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-emerald-100 shadow-[0_20px_60px_-36px_rgba(16,185,129,0.3)]">
          <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50">
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-emerald-600" /> Setting Distribution
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">OPD and daycare mix across visits and billing.</p>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            {stats.settingMetrics.map((entry) => (
              <div key={entry.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                  <p className="text-xs text-slate-500">{entry.patientCount} patients</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-500"
                    style={{ width: `${(entry.visitCount / maxSettingVisits) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{entry.visitCount} visits</span>
                  <span>{formatCurrency(entry.revenue)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  meta,
  tone,
}: {
  icon: typeof CalendarRange
  label: string
  value: string
  meta: string
  tone: "sky" | "emerald" | "amber" | "rose"
}) {
  const tones = {
    sky: "from-sky-500/15 via-cyan-400/10 to-white text-sky-700 border-sky-100",
    emerald: "from-emerald-500/15 via-lime-400/10 to-white text-emerald-700 border-emerald-100",
    amber: "from-amber-500/15 via-orange-400/10 to-white text-amber-700 border-amber-100",
    rose: "from-rose-500/15 via-pink-400/10 to-white text-rose-700 border-rose-100",
  }

  return (
    <Card className={`overflow-hidden border bg-gradient-to-br ${tones[tone]}`}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-sm text-slate-600">{label}</p>
            <p className="mt-1 text-xs text-slate-500">{meta}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
