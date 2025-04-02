'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useClerk, useUser } from '@clerk/nextjs';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { signOut } = useClerk();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoaded) {
      setLoading(false);
    }
  }, [isUserLoaded]);

  const logout = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
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