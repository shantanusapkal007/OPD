"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getOrCreateUser } from "@/services/user.service";
import type { UserRole } from "@/lib/types";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await hydrateUser(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await hydrateUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function hydrateUser(authUser: {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string; name?: string };
  }) {
    try {
      const displayName =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        "Doctor";
      const photoURL = authUser.user_metadata?.avatar_url || "";

      const appUser = await getOrCreateUser(
        authUser.id,
        displayName,
        authUser.email || "",
        photoURL
      );

      setUser({
        id: appUser.id,
        displayName: appUser.name || "Doctor",
        email: appUser.email,
        role: appUser.role,
        photoURL: appUser.photo_url,
      });
    } catch (error) {
      console.error("Failed to hydrate user:", error);
      setUser(null);
    }
  }

  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
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
