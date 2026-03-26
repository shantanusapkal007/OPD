"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, ChevronDown, LogOut, Search } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/providers/AuthProvider"

export function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))
  }
  
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard"
    if (pathname.startsWith("/patients")) return "Patients"
    if (pathname.startsWith("/appointments")) return "Appointments"
    if (pathname.startsWith("/visits")) return "Visits"
    if (pathname.startsWith("/payments")) return "Payments"
    if (pathname.startsWith("/settings")) return "Settings"
    return "Suradkar Hospital"
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:px-8">
      <div className="min-w-0">
        <div className="lg:hidden">
          <p className="truncate text-base font-semibold text-slate-900">{getPageTitle()}</p>
          <p className="truncate text-xs text-slate-500">Suradkar Hospital</p>
        </div>
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-slate-900">{getPageTitle()}</h1>
          <p className="text-xs text-slate-500">Welcome back, here&apos;s your overview</p>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            Ctrl K
          </kbd>
        </button>
        <button className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-transparent p-1 pr-2 transition-colors hover:border-slate-200 hover:bg-slate-50"
          >
            <Avatar fallback={user?.displayName?.substring(0, 2).toUpperCase() || "DR"} size="sm" />
            <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 sm:block">{user?.displayName || "Loading..."}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-950/10">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.displayName || "Doctor"}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={signOut}
                className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm font-medium text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
