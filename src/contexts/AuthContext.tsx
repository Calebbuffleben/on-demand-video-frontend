'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useClerk, useUser } from '@clerk/nextjs';

interface AuthContextType {
  isAuthenticated: boolean;
  user: ReturnType<typeof useUser>['user'];
  loading: boolean;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded]);

  // Handle authentication errors
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('AuthContext: Unauthorized event received');
      // Don't immediately sign out, let the token refresh mechanism try first
    };

    const handleAuthError = () => {
      console.log('AuthContext: Auth error event received, signing out...');
      signOut(() => {
        router.push('/sign-in');
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
      window.addEventListener('auth:error', handleAuthError);
      
      return () => {
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
        window.removeEventListener('auth:error', handleAuthError);
      };
    }
  }, [signOut, router]);

  const logout = () => {
    signOut(() => {
      router.push('/sign-in');
    });
  };

  const refreshToken = async () => {
    try {
      // Trigger token refresh by dispatching the unauthorized event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, sign out the user
      logout();
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthService = () => {
  const { session, user } = useClerk();

  const getToken = async (): Promise<string | null> => {
    try {
      if (!session) return null;
      return await session.getToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const isAuthenticated = (): boolean => {
    return !!user;
  };

  const getUserDetails = () => {
    if (!user) return null;
    
    return {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.primaryEmailAddress?.emailAddress,
      imageUrl: user.imageUrl
    };
  };

  return {
    getToken,
    isAuthenticated,
    getUserDetails
  };
};
