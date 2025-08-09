import { useAppAuth } from '@/contexts/AppAuthContext';
import { useRouter } from "next/router";

export function useOrganization() {
  const { organization, loading } = useAppAuth();
  const router = useRouter();

  const switchOrganization = async (organizationId: string) => {
    await router.push(`/${organizationId}/dashboard`);
  };

  return {
    organization,
    isLoaded: !loading,
    switchOrganization,
    organizationId: organization?.id
  };
} 