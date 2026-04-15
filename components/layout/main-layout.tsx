"use client";

import dynamic from "next/dynamic"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { BottomNav } from "./bottom-nav"
import { ToastContainer } from "@/components/ui/toast"
import { useAuth } from "../providers/AuthProvider"
import { canAccessPath } from "@/lib/access"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

const CommandPalette = dynamic(
  () => import("@/components/ui/command-palette").then((mod) => mod.CommandPalette),
  { ssr: false }
)

const FloatingActionButton = dynamic(
  () => import("@/components/ui/floating-action-button").then((mod) => mod.FloatingActionButton),
  { ssr: false }
)

const InstallPrompt = dynamic(
  () => import("@/components/pwa/install-prompt").then((mod) => mod.InstallPrompt),
  { ssr: false }
)

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

  if (pathname === '/offline') {
    return <>{children}</>;
  }

  if (pathname === '/login' && !user) {
    return <>{children}</>;
  }

  if (!user || !canAccessPath(user.role, pathname)) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Redirecting...</div>;
  }

  if (pathname.endsWith('/print')) {
    return <div className="min-h-screen bg-white text-black p-0">{children}</div>;
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
      <InstallPrompt />
    </div>
  )
}
