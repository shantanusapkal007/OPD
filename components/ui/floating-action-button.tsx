"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Pill, Calendar, IndianRupee, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/AuthProvider"
import { canAccessPath } from "@/lib/access"

interface FABAction {
  icon: React.ReactNode
  label: string
  href: string
  color: string
}

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Hide FAB on login and settings pages
  const hideFAB = pathname === "/login" || pathname.includes("/patients/");

  const actions: FABAction[] = [
    {
      icon: <Pill className="w-5 h-5" />,
      label: "New Visit",
      href: "/visits",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "New Appointment",
      href: "/appointments",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      icon: <IndianRupee className="w-5 h-5" />,
      label: "New Payment",
      href: "/payments",
      color: "bg-purple-600 hover:bg-purple-700"
    },
  ].filter((action) => canAccessPath(user?.role, action.href))

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  if (hideFAB) return null

  return (
    <div ref={menuRef} className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-30">
      {/* FAB Menu Items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                router.push(action.href)
                setIsOpen(false)
              }}
              className="flex items-center gap-3 group"
            >
              <span className="text-sm font-medium text-slate-700 bg-white px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {action.label}
              </span>
              <span className={`${action.color} text-white p-3 rounded-full shadow-lg transition-all transform scale-0 group-hover:scale-100`}>
                {action.icon}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl transition-all transform ${
          isOpen ? "scale-110 rotate-45" : "scale-100"
        } flex items-center justify-center`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>

      {/* Quick tip */}
      {!isOpen && (
        <div className="absolute bottom-16 right-16 bg-slate-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Quick actions
        </div>
      )}
    </div>
  )
}
