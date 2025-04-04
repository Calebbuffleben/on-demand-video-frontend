'use client';

import { ReactNode } from 'react';
import useClerkToken from '../hooks/useClerkToken';

interface TokenProviderProps {
  children: ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
  // This hook handles storing the Clerk token in localStorage
  useClerkToken();
  
  // Just render children - the hook does the work
  return <>{children}</>;
}

export default TokenProvider; 