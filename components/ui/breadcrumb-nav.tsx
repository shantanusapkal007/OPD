"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname if items not provided
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items

    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Dashboard", href: "/" }
    ]

    const segments = pathname.split("/").filter(Boolean)

    if (segments.length === 0) return breadcrumbs

    // Map segments to breadcrumb items
    const segmentMap: { [key: string]: string } = {
      patients: "Patients",
      appointments: "Appointments",
      visits: "Visits",
      payments: "Billing",
      settings: "Settings",
      khata: "Khata",
      data: "Import/Export",
    }

    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1

      // Skip numeric IDs for patient details
      if (segment.match(/^[a-f0-9-]+$/i) && segmentMap[segments[index - 1]]) {
        breadcrumbs.push({
          label: "Details",
          href: isLast ? undefined : currentPath,
        })
      } else if (segmentMap[segment]) {
        breadcrumbs.push({
          label: segmentMap[segment],
          href: isLast ? undefined : currentPath,
        })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  if (breadcrumbs.length <= 1) return null

  return (
    <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home className="w-4 h-4" />}
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700 font-medium flex items-center gap-1">
              {index === 0 && <Home className="w-4 h-4" />}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
