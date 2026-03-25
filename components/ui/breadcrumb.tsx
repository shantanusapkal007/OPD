/**
 * Breadcrumb Navigation Component
 * Helps users understand their location in the app
 */

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { usePathname } from "next/navigation"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
}

export function Breadcrumb({ items = [] }: BreadcrumbProps) {
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbs = items.length > 0 ? items : generateBreadcrumbs(pathname)

  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap- 2">
          <ChevronRight className="w-4 h-4 text-slate-300" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-slate-600 hover:text-slate-900 transition-colors hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
    "/patients": [{ label: "Patients" }],
    "/appointments": [{ label: "Appointments" }],
    "/visits": [{ label: "Visits" }],
    "/payments": [{ label: "Billing" }],
    "/khata": [{ label: "Khata Ledger" }],
    "/settings": [{ label: "Settings" }],
    "/data": [{ label: "Import/Export" }],
  }

  // For dynamic routes like /patients/[id]
  if (pathname.startsWith("/patients/") && pathname !== "/patients") {
    return [
      { label: "Patients", href: "/patients" },
      { label: "Patient Details" },
    ]
  }

  return breadcrumbMap[pathname] || []
}
