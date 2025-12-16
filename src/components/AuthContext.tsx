import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, User } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, inMemoryPersistence, browserLocalPersistence } from 'firebase/auth';

interface AuthContextType {
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  unlockApp: (password: string) => boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get admin password from environment variables
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';
  
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Filter out anonymous users
      if (currentUser && !currentUser.isAnonymous) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const unlockApp = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsLocked(false);
      return true;
    }
    return false;
  };
  
  const login = async (email: string, password: string) => {
    // Set in-memory persistence only for email/password login (expires on refresh)
    await setPersistence(auth, inMemoryPersistence);
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const logout = async () => {
    await signOut(auth);
    // After logout, restore default persistence for anonymous users
    await setPersistence(auth, browserLocalPersistence);
  };
  
  return (
    <AuthContext.Provider value={{ isLocked, setIsLocked, unlockApp, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};