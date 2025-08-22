'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/api-connection/service';
import { useRouter } from 'next/router';

type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified?: boolean;
};

type AuthOrganization = {
  id: string;
  name: string;
  slug: string | null;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
  organization: AuthOrganization | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  requestEmailVerification: (email: string) => Promise<void>;
};

const AppAuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<AuthOrganization | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      const payload = (res.data && (res.data.data ?? res.data)) || {};
      const { user, organization } = payload || {};
      setUser(user ?? null);
      setOrganization(organization ?? null);
    } catch (err: unknown) {
      // On 401, attempt an explicit refresh and retry once
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        try {
          console.log('🔄 Attempting token refresh...');
          const refreshResponse = await api.post('/auth/refresh');
          const { token: newToken } = refreshResponse.data || {};

          // Save the new token if provided
          if (newToken && typeof window !== 'undefined') {
            localStorage.setItem('token', newToken);
            console.log('🔐 New token saved to localStorage after refresh');
          }

          const retry = await api.get('/auth/me');
          const retryPayload = (retry.data && (retry.data.data ?? retry.data)) || {};
          const { user, organization } = retryPayload || {};
          setUser(user ?? null);
          setOrganization(organization ?? null);
          return;
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
        }
      }
      setUser(null);
      setOrganization(null);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    })();
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.requiresPasswordSetup) {
        // Surface a friendly message for the sign-in page to display
        throw { response: { data: { message: 'Você precisa definir uma senha. Enviamos um link de redefinição para seu e-mail.' } } };
      }

      const { user, organization, token } = res.data || {};
      setUser(user ?? null);
      setOrganization(organization ?? null);

      // Save token to localStorage for API requests
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        console.log('🔐 Token saved to localStorage after login');
      }

      // Redirect directly to the single-tenant dashboard using the org id
      if (organization?.id) {
        await router.push(`/${organization.id}/dashboard`);
      } else {
        await router.push('/');
      }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      const msg = err?.response?.data?.message || '';
      if (msg.toLowerCase().includes('email not verified')) {
        try { await api.post('/auth/email/request-verification', { email }); } catch {}
        // Do not force redirect anymore
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = React.useCallback(async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { user, organization, token } = res.data || {};
      setUser(user ?? null);
      setOrganization(organization ?? null);

      // Save token to localStorage for API requests
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        console.log('🔐 Token saved to localStorage after register');
      }

      // After register, route to tenant dashboard (org is created automatically)
      if (organization?.id) {
        await router.push(`/${organization.id}/dashboard`);
      } else {
        await router.push('/');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = React.useCallback(async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');

      // Clear localStorage token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('dbOrganizationId');
        console.log('🔐 Token removed from localStorage on logout');
      }

      setUser(null);
      setOrganization(null);
      await router.push('/sign-in');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refresh = React.useCallback(async () => {
    await fetchProfile();
  }, []);

  const requestEmailVerification = React.useCallback(async (email: string) => {
    try {
      await api.post('/auth/email/request-verification', { email });
    } catch {}
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: !!user,
    loading,
    user,
    organization,
    login,
    register,
    logout,
    refresh,
    requestEmailVerification,
  }), [loading, user, organization, login, register, logout, refresh, requestEmailVerification]);

  return (
    <AppAuthContext.Provider value={value}>
      {children}
    </AppAuthContext.Provider>
  );
}

export const useAppAuth = () => {
  const ctx = useContext(AppAuthContext);
  if (!ctx) throw new Error('useAppAuth must be used within AppAuthProvider');
  return ctx;
};

