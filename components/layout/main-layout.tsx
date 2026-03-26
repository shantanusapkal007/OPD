"use client";

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { BottomNav } from "./bottom-nav"
import { ToastContainer } from "@/components/ui/toast"
import { CommandPalette } from "@/components/ui/command-palette"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { useAuth } from "../providers/AuthProvider"
import { canAccessPath } from "@/lib/access"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user && pathname !== '/login') {
      router.replace('/login');
      return;
    }

    if (user && pathname === '/login') {
      router.replace('/');
      return;
    }

    if (user && !canAccessPath(user.role, pathname)) {
      router.replace('/');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;
  }

  if (pathname === '/login' && !user) {
    return <>{children}</>;
  }

  if (!user || !canAccessPath(user.role, pathname)) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 px-4 py-4 pb-24 lg:px-8 lg:py-8 lg:pb-8">
          <div className="app-page">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
      <ToastContainer />
      <CommandPalette />
      <FloatingActionButton />
    </div>
  )
}
