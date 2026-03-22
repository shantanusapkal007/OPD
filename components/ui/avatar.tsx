import * as React from "react"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" | "xl", fallback: string }>(
  ({ className, size = "md", fallback, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-16 w-16 text-xl",
      xl: "h-20 w-20 text-2xl",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-blue-100 text-blue-600 font-semibold items-center justify-center",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {fallback}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
