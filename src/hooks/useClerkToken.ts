'use client';

import { useEffect } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';

/**
 * This hook ensures the Clerk token is stored in localStorage
 * so the API service can use it for authenticated requests
 */
export function useClerkToken() {
  const { session } = useClerk();
  const { user, isLoaded } = useUser();
  
  useEffect(() => {
    // Wait until user data is loaded
    if (!isLoaded) return;
    
    const storeToken = async () => {
      if (!session) {
        console.warn('No active session found');
        localStorage.removeItem('token');
        return;
      }
      
      try {
        console.log('Getting token from Clerk session...');
        
        // Get the default token (no template specified)
        const token = await session.getToken({
            template: 'token_videos_on_demand_2'
          });
        
        if (token) {
          localStorage.setItem('token', token);
          console.log('Token stored successfully');
          
          // Log user membership info for debugging
          if (user) {
            console.log('User organizations:', user.organizationMemberships?.length || 0);
            user.organizationMemberships?.forEach(membership => {
              console.log(`- Org: ${membership.organization.name} (${membership.organization.id}), Role: ${membership.role}`);
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
    
    // Setup polling interval to check for token updates
    const intervalId = setInterval(storeToken, 1000 * 60 * 5); // Check every 5 minutes
    
    return () => {
      clearInterval(intervalId);
    };
  }, [session, user, isLoaded]);
}

export default useClerkToken; 