import { SignIn, useUser, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SignInPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();

  // Redirect to tenant dashboard if user is already logged in and has an organization
  useEffect(() => {
    if (isLoaded && isSignedIn && organization) {
      router.push(`/${organization.id}/dashboard`);
    }
  }, [isLoaded, isSignedIn, organization, router]);

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      <SignIn fallbackRedirectUrl={"/organization-selector"} />
    </div>
  );
} 