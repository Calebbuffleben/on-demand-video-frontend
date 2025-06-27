'use client';

import { useEffect, useState } from 'react';
import { useClerk, useUser, useOrganization } from '@clerk/nextjs';

/**
 * This hook ensures the Clerk token is stored in localStorage
 * so the API service can use it for authenticated requests
 */
export function useClerkToken() {
  const { session } = useClerk();
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [lastOrgId, setLastOrgId] = useState<string | null>(null);
  
  // This effect handles token storage when organization changes
  useEffect(() => {
    // Wait until both user and organization data are loaded
    if (!userLoaded || !orgLoaded) return;
    
    // Skip if organization hasn't changed
    if (organization?.id === lastOrgId) return;
    
    // Update last org id
    setLastOrgId(organization?.id || null);
    
    const storeToken = async () => {
      if (!session) {
        console.warn('No active session found');
        localStorage.removeItem('token');
        return;
      }
      
      try {
        console.log('Getting token from Clerk session...');
        console.log('Current organization:', organization?.id, organization?.name);
        
        // Get organization-aware token - ensure our JWT template includes org claims
        const tokenOptions = organization?.id 
          ? { 
            /*  template: 'token_videos_on_demand_2',  // Use a template with organization claims
              // You can also provide session data if needed
              session: {
                resources: ["organization"],
                organizationId: organization.id,
              }*/
            } 
          : {};
        
        const token = await session.getToken(tokenOptions);
        
        if (token) {
          // Store token with organization info
          localStorage.setItem('token', token);
          
          // Store current organization ID separately for reference
          if (organization?.id) {
            localStorage.setItem('currentOrganizationId', organization.id);
          } else {
            localStorage.removeItem('currentOrganizationId');
          }
          
          console.log('Token stored successfully with organization context');
          
          // Log user membership info for debugging
          if (user) {
            console.log('User organizations:', user.organizationMemberships?.length || 0);
            user.organizationMemberships?.forEach(membership => {
              const isActive = membership.organization.id === organization?.id;
              console.log(`- Org: ${membership.organization.name} (${membership.organization.id}), Role: ${membership.role}${isActive ? ' [ACTIVE]' : ''}`);
            });
          }
        } else {
          console.warn('Empty token received from Clerk');
        }
      } catch (error) {
        console.error('Failed to get or store Clerk token:', error);
      }
    };
    
    // Store token initially
    storeToken();
  }, [session, user, userLoaded, organization, orgLoaded, lastOrgId]);
  
  // This effect sets up token refresh on an interval
  useEffect(() => {
    // Setup polling interval to refresh token
    const intervalId = setInterval(() => {
      // Only refresh if we have a session and user is loaded
      if (session && userLoaded) {
        // This will trigger the above effect if organization has changed
        setLastOrgId(organization?.id || null);
      }
    }, 1000 * 60 * 5); // Check every 5 minutes
    
    return () => {
      clearInterval(intervalId);
    };
  }, [session, userLoaded, organization]);
}

export default useClerkToken; 