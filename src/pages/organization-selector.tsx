import { useAppAuth } from '@/contexts/AppAuthContext';
import api from '@/api-connection/service';
import { useRouter } from "next/router";
import { useEffect } from "react";
import AuthGuard from '@/components/Auth/AuthGuard';

function OrganizationSelector() {
  const { isAuthenticated, loading, user } = useAppAuth();
  // Legacy variables removed (no Clerk org list)
  const router = useRouter();

  // Debug logging
  console.log('🔍 Organization Selector Debug:', {
    isLoaded: !loading,
    isSignedIn: isAuthenticated,
    currentPath: router.asPath,
    hasUser: !!user,
  });

  // Redirect if not signed in; otherwise load org from backend and redirect
  useEffect(() => {
    const run = async () => {
      if (!loading && !isAuthenticated) {
        router.push('/sign-in');
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const orgId = res.data?.organization?.id;
        if (orgId) {
          router.push(`/${orgId}/dashboard`);
        }
      } catch {}
    };
    run();
  }, [loading, isAuthenticated, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scale-950 via-scale-900 to-scale-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scale-400 mx-auto"></div>
          <p className="mt-4 text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth>
    <div className="min-h-screen bg-gradient-to-br from-scale-950 via-scale-900 to-scale-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-scale-400 to-scale-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Selecione uma Organização</h1>
          <p className="text-silver-300">Escolha uma organização para continuar</p>
        </div>

        {/* Organization List placeholder (orgs serão tratadas via /auth/me) */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6 text-center text-white">
          Selecione uma organização existente ou crie uma nova.
        </div>

        {/* Create Organization Button removed (org criada automaticamente no cadastro) */}
        <div className="w-full py-4 bg-white/10 text-white text-center font-medium rounded-xl border border-white/20">
          A organização é criada automaticamente no cadastro. Em breve adicionaremos gestão de múltiplas organizações.
        </div>
        
        {/* Debug info */}
        <div className="mt-4 p-4 bg-white/5 rounded-lg text-white text-sm">
          <p>Debug Info:</p>
          <p>Is Org List Loaded: Yes</p>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}

export default OrganizationSelector;