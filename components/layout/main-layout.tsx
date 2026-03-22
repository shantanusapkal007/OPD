"use client";

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { BottomNav } from "./bottom-nav"
import { useAuth } from "../providers/AuthProvider"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!user) return null;

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
    </div>
  )
}
