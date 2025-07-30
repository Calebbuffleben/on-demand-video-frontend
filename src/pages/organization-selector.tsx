import { useUser, useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { withAuth } from "@/lib/withClientAuth";

function OrganizationSelector() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { userMemberships, isLoaded: isOrgListLoaded } = useOrganizationList();
  const router = useRouter();

  // Debug logging
  console.log('🔍 Organization Selector Debug:', {
    isLoaded,
    isSignedIn,
    currentPath: router.asPath,
    hasUser: !!user,
    userOrganizations: user?.organizationMemberships?.length || 0,
    userMemberships: userMemberships?.data?.length || 0
  });

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state
  if (!isLoaded) {
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

        {/* Organization List */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
          {user?.organizationMemberships && user.organizationMemberships.length > 0 ? (
            <div className="space-y-3">
              {user.organizationMemberships.map((membership: { organization: { id: string; name: string }; role: string }) => (
                <button
                  key={membership.organization.id}
                  onClick={() => {
                    console.log('🎯 Organization selected:', membership.organization);
                    console.log('🎯 Redirecting to:', `/${membership.organization.id}/dashboard`);
                    router.push(`/${membership.organization.id}/dashboard`);
                  }}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {membership.organization.name}
                      </h3>
                      <p className="text-silver-300 text-sm capitalize">
                        {membership.role}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-scale-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-silver-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-silver-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Nenhuma organização encontrada</h3>
              <p className="text-silver-300 text-sm">
                Você ainda não pertence a nenhuma organização.
              </p>
            </div>
          )}
        </div>

        {/* Create Organization Button */}
        <button
          onClick={() => router.push('/create-organization')}
          className="w-full py-4 bg-gradient-to-r from-scale-600 to-scale-700 hover:from-scale-700 hover:to-scale-800 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Criar Nova Organização</span>
        </button>
        
        {/* Debug info */}
        <div className="mt-4 p-4 bg-white/5 rounded-lg text-white text-sm">
          <p>Debug Info:</p>
          <p>User Organizations: {user?.organizationMemberships?.length || 0}</p>
          <p>User Memberships: {userMemberships?.data?.length || 0}</p>
          <p>Is Org List Loaded: {isOrgListLoaded ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(OrganizationSelector); 