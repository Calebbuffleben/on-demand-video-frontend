import { SignUp, useUser, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();

  // Redirect to appropriate page based on user state
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      if (organization) {
        // User is signed in and has an organization - redirect to dashboard
        router.push(`/${organization.id}/dashboard`);
      } else {
        // User is signed in but has no organization - redirect to organization selector
        router.push('/organization-selector');
      }
    }
  }, [isLoaded, isSignedIn, organization, router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <SignUp />
    </div>
  );
} 