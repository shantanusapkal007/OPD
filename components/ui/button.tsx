import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-white transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/10 disabled:pointer-events-none disabled:bg-slate-200 disabled:text-slate-400 active:translate-y-px",
  {
    variants: {
      variant: {
        default: "border border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-950/10 hover:bg-blue-700 hover:border-blue-700",
        destructive: "border border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600",
        outline: "border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-950/[0.03] hover:bg-slate-50 hover:border-slate-300",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10",
        fab: "h-14 w-14 rounded-2xl shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
