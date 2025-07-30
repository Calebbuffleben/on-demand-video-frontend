import { ComponentType } from 'react';
import AuthGuard from '@/components/Auth/AuthGuard';

interface WithClientAuthOptions {
  requireAuth?: boolean;
  requireOrg?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function withClientAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithClientAuthOptions = {}
) {
  const {
    requireAuth = true,
    requireOrg = false,
    redirectTo = '/sign-in',
    fallback
  } = options;

  const AuthenticatedComponent = (props: P) => {
    return (
      <AuthGuard
        requireAuth={requireAuth}
        requireOrg={requireOrg}
        redirectTo={redirectTo}
        fallback={fallback}
      >
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };

  // Copy display name for debugging
  AuthenticatedComponent.displayName = `withClientAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}

// Convenience functions for common use cases
export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return withClientAuth(WrappedComponent, { requireAuth: true, requireOrg: false });
}

export function withOrgAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return withClientAuth(WrappedComponent, { requireAuth: true, requireOrg: true });
}

export function withOptionalAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return withClientAuth(WrappedComponent, { requireAuth: false, requireOrg: false });
} 