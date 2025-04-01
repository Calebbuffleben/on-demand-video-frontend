import { useOrganization as useClerkOrganization } from "@clerk/nextjs";
import { useRouter } from "next/router";

export function useOrganization() {
  const { organization, isLoaded } = useClerkOrganization();
  const router = useRouter();

  const switchOrganization = async (organizationId: string) => {
    await router.push(`/${organizationId}/dashboard`);
  };

  return {
    organization,
    isLoaded,
    switchOrganization,
    organizationId: organization?.id
  };
} 