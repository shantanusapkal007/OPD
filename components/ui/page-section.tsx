/**
 * Page Section Component
 * Provides consistent spacing and styling for page sections
 */

import { ReactNode } from "react"

interface PageSectionProps {
  title?: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  fullWidth?: boolean
}

export function PageSection({
  title,
  description,
  children,
  actions,
  fullWidth = false,
}: PageSectionProps) {
  return (
    <div className={fullWidth ? "" : "max-w-7xl mx-auto"}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            {title && <h2 className="text-2xl font-bold text-slate-900">{title}</h2>}
            {description && <p className="text-slate-600 mt-1 text-sm">{description}</p>}
          </div>
          {actions && <div className="flex gap-2 flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
