import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USER } from '../utils/demoData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted session
    const saved = localStorage.getItem('clinicflow_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    // In production, use Firebase Auth:
    // import { signInWithPopup } from 'firebase/auth';
    // import { auth, googleProvider } from '../services/firebase';
    // const result = await signInWithPopup(auth, googleProvider);

    // Demo mode: simulate sign in
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const demoUser = { ...DEMO_USER };
    setUser(demoUser);
    localStorage.setItem('clinicflow_user', JSON.stringify(demoUser));
    setLoading(false);
    return demoUser;
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('clinicflow_user');
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDoctor: user?.role === 'doctor' || user?.role === 'admin',
    isReceptionist: user?.role === 'receptionist',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
