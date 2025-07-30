'use client';

import { useUser, useOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrg?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireOrg = false, 
  redirectTo = '/sign-in',
  fallback 
}: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    // If authentication is not required, proceed
    if (!requireAuth) {
      setIsChecking(false);
      return;
    }

    // If user is not signed in, redirect to login
    if (!isSignedIn) {
      console.log('🔐 AuthGuard: User not authenticated, redirecting to:', redirectTo);
      router.push(redirectTo);
      return;
    }

    // If organization is required but not loaded yet, wait
    if (requireOrg && !orgLoaded) {
      return;
    }

    // If organization is required but user has no organization, redirect to organization selector
    if (requireOrg && !organization) {
      console.log('🔐 AuthGuard: User has no organization, redirecting to organization selector');
      router.push('/organization-selector');
      return;
    }

    // All checks passed
    setIsChecking(false);
  }, [isLoaded, isSignedIn, orgLoaded, organization, requireAuth, requireOrg, redirectTo, router]);

  // Show loading state while checking authentication
  if (!isLoaded || isChecking) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scale-950 via-scale-900 to-scale-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scale-400 mx-auto"></div>
          <p className="mt-4 text-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not signed in, show nothing (will redirect)
  if (requireAuth && !isSignedIn) {
    return null;
  }

  // If organization is required but user has no organization, show nothing (will redirect)
  if (requireOrg && !organization) {
    return null;
  }

  // All checks passed, render children
  return <>{children}</>;
} 