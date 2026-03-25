/**
 * Toast/Notification Component
 * Provides feedback for user actions
 */

import React, { useState, useCallback } from "react"
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

// Global toast state (we'll manage this separately)
let toastListeners: ((toast: Toast) => void)[] = []

export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = "info", duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = { id, message, type, duration }

    toastListeners.forEach(listener => listener(toast))

    if (duration > 0) {
      setTimeout(() => {
        toastListeners.forEach(listener => listener({ ...toast, id: "" }))
      }, duration)
    }

    return id
  }, [])

  return { showToast }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  React.useEffect(() => {
    const handleToast = (toast: Toast) => {
      if (toast.id === "") {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      } else {
        setToasts(prev => {
          const exists = prev.find(t => t.id === toast.id)
          if (exists) return prev
          return [...prev, toast]
        })
      }
    }

    toastListeners.push(handleToast)
    return () => {
      toastListeners = toastListeners.filter(l => l !== handleToast)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-900"
      case "error":
        return "bg-red-50 border-red-200 text-red-900"
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-900"
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-top-2 ${getStyles(
            toast.type
          )}`}
        >
          {getIcon(toast.type)}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-auto text-xs opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
