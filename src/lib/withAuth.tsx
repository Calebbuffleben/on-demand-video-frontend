import { GetServerSideProps } from 'next';
import { auth } from '@clerk/nextjs/server';

// HOC para proteção de autenticação no lado do servidor
export function withAuth<T extends Record<string, unknown>>(
  getServerSideProps?: GetServerSideProps<T>
): GetServerSideProps<T> {
  return async (context) => {
    try {
      const { userId } = await auth();
      
      console.log('🔐 AUTH CHECK:', { userId, pathname: context.resolvedUrl });
      
      // Se não estiver autenticado, redireciona para sign-in
      if (!userId) {
        console.log('🚫 NOT AUTHENTICATED, redirecting to /sign-in');
        return {
          redirect: {
            destination: '/sign-in',
            permanent: false,
          },
        };
      }

      console.log('✅ AUTHENTICATED, proceeding');

      // Se há um getServerSideProps original, executa ele
      if (getServerSideProps) {
        return getServerSideProps(context);
      }

      // Retorna props vazias se não há getServerSideProps original
      return {
        props: {} as T,
      };
    } catch (error) {
      console.error('❌ AUTH ERROR:', error);
      return {
        redirect: {
          destination: '/sign-in',
          permanent: false,
        },
      };
    }
  };
}

// HOC para proteção de autenticação com organização
export function withOrgAuth<T extends Record<string, unknown>>(
  getServerSideProps?: GetServerSideProps<T>
): GetServerSideProps<T> {
  return async (context) => {
    try {
      const { userId, orgId } = await auth();
      
      console.log('🔐 ORG AUTH CHECK:', { userId, orgId, pathname: context.resolvedUrl });
      
      // Se não estiver autenticado, redireciona para sign-in
      if (!userId) {
        console.log('🚫 NOT AUTHENTICATED, redirecting to /sign-in');
        return {
          redirect: {
            destination: '/sign-in',
            permanent: false,
          },
        };
      }

      // Se não tem organização, redireciona para organization-selector
      if (!orgId) {
        console.log('🚫 NO ORGANIZATION, redirecting to /organization-selector');
        return {
          redirect: {
            destination: '/organization-selector',
            permanent: false,
          },
        };
      }

      console.log('✅ AUTHENTICATED WITH ORG, proceeding');

      // Se há um getServerSideProps original, executa ele
      if (getServerSideProps) {
        return getServerSideProps(context);
      }

      // Retorna props vazias se não há getServerSideProps original
      return {
        props: {} as T,
      };
    } catch (error) {
      console.error('❌ ORG AUTH ERROR:', error);
      return {
        redirect: {
          destination: '/sign-in',
          permanent: false,
        },
      };
    }
  };
} 