"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getOrCreateUser } from '@/services/user.service';
import type { UserRole } from '@/lib/types';

// ==========================================
// 🔒 CHANGE THESE TO YOUR ALLOWED GMAIL IDs
// ==========================================
const DEFAULT_ALLOWED_EMAILS = [
  "shantanusapkal007@gmail.com",
  "tusharsuradkar184@gmail.com",
  "vinaykhairnar9404@gmail.com",
  "adityasutar99999@gmail.com",
  "doctor@example.com",
];

const ALLOWED_EMAILS = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS?.split(",") ?? DEFAULT_ALLOWED_EMAILS)
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

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
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  isReceptionist: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Enforce whitelist check on session restore
        if (!ALLOWED_EMAILS.includes((firebaseUser.email || '').toLowerCase())) {
          await firebaseSignOut(auth);
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const appUser = await getOrCreateUser(
            firebaseUser.uid,
            firebaseUser.displayName || 'Doctor',
            firebaseUser.email || '',
            firebaseUser.photoURL || ''
          );
          setUser({
            id: appUser.userId,
            displayName: (appUser.name || 'Doctor').toLowerCase().startsWith('dr') ? (appUser.name || 'Doctor') : `Dr. ${appUser.name || 'Doctor'}`,
            email: appUser.email,
            role: appUser.role,
            photoURL: appUser.photoURL,
          });
        } catch (error) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User> => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Enforce whitelist check during sign in
      if (!ALLOWED_EMAILS.includes((result.user.email || '').toLowerCase())) {
        await firebaseSignOut(auth);
        const err = new Error('Access Denied: Unwhitelisted Email');
        (err as any).code = 'auth/unauthorized-email';
        throw err;
      }

      const appUser = await getOrCreateUser(
        result.user.uid,
        result.user.displayName || 'Doctor',
        result.user.email || '',
        result.user.photoURL || ''
      );
      const loggedInUser: User = {
        id: appUser.userId,
        displayName: (appUser.name || 'Doctor').toLowerCase().startsWith('dr') ? (appUser.name || 'Doctor') : `Dr. ${appUser.name || 'Doctor'}`,
        email: appUser.email,
        role: appUser.role,
        photoURL: appUser.photoURL,
      };
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
    isAdmin: !!user,
    isDoctor: !!user,
    isReceptionist: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
