"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase, checkSupabaseHealth } from "@/lib/supabase";
import { getOrCreateUser } from "@/services/user.service";
import type { UserRole } from "@/lib/types";

// Only ping DB once per browser session
let _healthCheckDone = false;
function warmUpOnce() {
  if (_healthCheckDone) return;
  _healthCheckDone = true;
  checkSupabaseHealth().catch(() => { /* silent */ });
}

type User = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  photoURL?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  isReceptionist: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

/** Build a user object instantly from JWT — no DB call needed */
function userFromSession(authUser: {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; avatar_url?: string; name?: string };
}): User {
  return {
    id: authUser.id,
    displayName:
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      "Doctor",
    email: authUser.email || "",
    role: "admin", // sensible default — overridden by DB hydration below
    photoURL: authUser.user_metadata?.avatar_url || "",
  };
}

/** Fetch real role from DB silently after app is already shown */
async function hydrateRoleInBackground(
  authUser: {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string; name?: string };
  },
  setUser: React.Dispatch<React.SetStateAction<User>>
) {
  try {
    const appUser = await getOrCreateUser(
      authUser.id,
      authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        "Doctor",
      authUser.email || "",
      authUser.user_metadata?.avatar_url || ""
    );
    setUser({
      id: appUser.id,
      displayName: appUser.name || "Doctor",
      email: appUser.email,
      role: appUser.role,
      photoURL: appUser.photo_url,
    });
  } catch {
    // DB hydration failed silently — app still works with default admin role
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire DB wake-up ping silently in background (don't block anything)
    warmUpOnce();

    // getSession reads from localStorage — always instant, no network call
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Show app immediately from cached JWT data
        setUser(userFromSession(session.user));
        // Fetch real role from DB in background (doesn't block UI)
        hydrateRoleInBackground(session.user, setUser);
      }
      setLoading(false);
    });

    // 3s safety timeout — getSession is always fast from localStorage
    const safetyTimer = setTimeout(() => setLoading(false), 3000);

    // Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(userFromSession(session.user));
        hydrateRoleInBackground(session.user, setUser);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isDoctor: user?.role === "doctor",
    isReceptionist: user?.role === "receptionist",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
