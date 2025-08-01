import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import UserProfileCard from '@/components/Profile/UserProfileCard';
import UserSettingsCard from '@/components/Profile/UserSettingsCard';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';
import { withOrgAuth } from '@/lib/withClientAuth';

function TenantProfilePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { tenantId } = router.query;

  // Redirect to sign-in if the user is not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while user data is loading
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Dashboard Menu */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Seu Perfil
            </h1>
            <DashboardMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* User Profile Info */}
          <div className="md:col-span-7">
            <UserProfileCard />
          </div>
          
          {/* User Settings */}
          <div className="md:col-span-5">
            <UserSettingsCard />
          </div>
        </div>

        {/* Recent Activity Section (Optional) */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Sua atividade recente aparecerá aqui.</p>
            {/* Add tenant-specific activity if needed */}
            <p className="text-gray-500 text-sm mt-2">ID da Organização: {tenantId}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withOrgAuth(TenantProfilePage); 