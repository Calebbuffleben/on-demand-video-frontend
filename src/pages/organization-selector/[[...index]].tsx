import { OrganizationList, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function OrganizationSelectorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [hasOrganizations, setHasOrganizations] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      const organizations = user.organizationMemberships || [];
      const hasAnyOrganizations = organizations.length > 0;
      setHasOrganizations(hasAnyOrganizations);
      
      // If user has no organizations, redirect to create organization
      if (!hasAnyOrganizations) {
        router.push('/create-organization');
      }
    }
  }, [isLoaded, user, router]);

  // Show loading while checking user data
  if (!isLoaded || hasOrganizations === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user has no organizations, they should have been redirected to create-organization
  // This is just a fallback
  if (!hasOrganizations) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Organizations Found</h1>
          <p className="mb-4">You don't have any organizations yet.</p>
          <button 
            onClick={() => router.push('/create-organization')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Select an Organization</h1>
        <OrganizationList 
          hidePersonal
          afterSelectOrganizationUrl="/{organizationId}/dashboard"
          afterCreateOrganizationUrl="/{organizationId}/dashboard"
        />
      </div>
    </div>
  );
} 