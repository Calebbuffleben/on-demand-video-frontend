import { GetServerSideProps } from 'next';
import { auth } from '@clerk/nextjs/server';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// HOC para proteção de autenticação no lado do servidor
export function withAuth<T extends Record<string, unknown>>(
  getServerSideProps?: GetServerSideProps<T>
): GetServerSideProps<T> {
  return async (context) => {
    const { userId } = await auth();
    
    // Se não estiver autenticado, redireciona para sign-in
    if (!userId) {
      return {
        redirect: {
          destination: '/sign-in',
          permanent: false,
        },
      };
    }

    // Se há um getServerSideProps original, executa ele
    if (getServerSideProps) {
      return getServerSideProps(context);
    }

    // Retorna props vazias se não há getServerSideProps original
    return {
      props: {} as T,
    };
  };
}

// HOC para proteção de autenticação com organização
export function withOrgAuth<T extends Record<string, unknown>>(
  getServerSideProps?: GetServerSideProps<T>
): GetServerSideProps<T> {
  return async (context) => {
    const { userId, orgId } = await auth();
    
    // Se não estiver autenticado, redireciona para sign-in
    if (!userId) {
      return {
        redirect: {
          destination: '/sign-in',
          permanent: false,
        },
      };
    }

    // Se não tem organização, redireciona para organization-selector
    if (!orgId) {
      return {
        redirect: {
          destination: '/organization-selector',
          permanent: false,
        },
      };
    }

    // Se há um getServerSideProps original, executa ele
    if (getServerSideProps) {
      return getServerSideProps(context);
    }

    // Retorna props vazias se não há getServerSideProps original
    return {
      props: {} as T,
    };
  };
}

// Hook para proteção no lado do cliente
export function useRequireAuth() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, isLoaded, router]);

  return { isSignedIn, isLoaded };
}

// Hook para proteção com organização no lado do cliente
export function useRequireOrgAuth() {
  const { isSignedIn, isLoaded } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    } else if (isLoaded && orgLoaded && !organization) {
      router.push('/organization-selector');
    }
  }, [isSignedIn, isLoaded, organization, orgLoaded, router]);

  return { isSignedIn, isLoaded, organization, orgLoaded };
} 