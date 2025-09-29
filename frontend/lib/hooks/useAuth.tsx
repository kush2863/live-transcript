'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import authService, { User, AuthResponse } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<AuthResponse>;
  updatePassword: (newPassword: string, confirmPassword: string) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const result = await authService.getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          authService.clearSession();
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      authService.clearSession();
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      return await authService.signUp(email, password, firstName, lastName);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<AuthResponse> => {
    return await authService.refreshToken();
  };

  const updatePassword = async (newPassword: string, confirmPassword: string): Promise<AuthResponse> => {
    return await authService.updatePassword(newPassword, confirmPassword);
  };

  const forgotPassword = async (email: string): Promise<AuthResponse> => {
    return await authService.forgotPassword(email);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshToken,
    updatePassword,
    forgotPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
