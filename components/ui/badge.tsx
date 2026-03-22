import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/80",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        destructive: "bg-red-50 text-red-700 hover:bg-red-50/80",
        outline: "text-slate-950 border border-slate-200",
        scheduled: "bg-blue-50 text-blue-700",
        completed: "bg-green-50 text-green-700",
        cancelled: "bg-red-50 text-red-700",
        pending: "bg-amber-50 text-amber-700",
        followup: "bg-purple-50 text-purple-700",
        new: "bg-teal-50 text-teal-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
