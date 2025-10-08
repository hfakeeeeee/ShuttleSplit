import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  unlockApp: (password: string) => boolean;
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
  
  // Get admin password from environment variables
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';
  
  const unlockApp = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsLocked(false);
      return true;
    }
    return false;
  };
  
  return (
    <AuthContext.Provider value={{ isLocked, setIsLocked, unlockApp }}>
      {children}
    </AuthContext.Provider>
  );
};