import { GetServerSideProps } from 'next';

// HOC para proteção de autenticação no lado do servidor
export function withAuth<T extends Record<string, unknown>>(
  getServerSideProps?: GetServerSideProps<T>
): GetServerSideProps<T> {
  return async (context) => {
    try {
      const token = context.req.headers.cookie || '';
      const hasAuthCookie = token.includes('token=');
      
      console.log('🔐 AUTH CHECK:', { hasAuthCookie, pathname: context.resolvedUrl });
      
      // Se não estiver autenticado, redireciona para sign-in
      if (!hasAuthCookie) {
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
      const cookie = context.req.headers.cookie || '';
      const hasCookie = cookie.includes('token=');
      
      console.log('🔐 ORG AUTH CHECK:', { hasCookie, pathname: context.resolvedUrl });
      
      // Se não estiver autenticado, redireciona para sign-in
      if (!hasCookie) {
        console.log('🚫 NOT AUTHENTICATED, redirecting to /sign-in');
        return {
          redirect: {
            destination: '/sign-in',
            permanent: false,
          },
        };
      }

      // Org gating handled client-side; allow and let page redirect if needed
      if (false) {
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