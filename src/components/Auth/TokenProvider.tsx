'use client';

import { useClerkToken } from '@/hooks/useClerkToken';

export function TokenProvider() {
  useClerkToken();
  return null; // Este componente não renderiza nada, apenas gerencia o token
}