'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const [lastTokenRefresh, setLastTokenRefresh] = useState<number>(0);
  
  // Function to store token with organization context
  const storeToken = useCallback(async () => {
    if (!session) {
      console.warn('No active session found');
      localStorage.removeItem('token');
      return;
    }
    
    try {
      console.log('Getting fresh token from Clerk session...');
      console.log('Current organization:', organization?.id, organization?.name);
      
      // Get organization-aware token for multi-tenancy
      let token;
      
      if (organization?.id) {
        // For multi-tenancy, we need to get a token with organization context
        try {
          // Try with template first
          token = await session.getToken({
            template: 'token_videos_on_demand_3',
          });
          
          console.log('Token obtained with template for organization:', organization.id);
        } catch (error) {
          console.error('Template token failed, trying without template:', error);
          // Fallback to basic token
          token = await session.getToken();
        }
      } else {
        // No organization context, get basic token
        console.log('No organization context, getting basic token');
        token = await session.getToken();
      }
      
      if (token) {
        // Store token with organization info
        localStorage.setItem('token', token);
        
        // Store current organization ID separately for reference
        if (organization?.id) {
          localStorage.setItem('currentOrganizationId', organization.id);
        } else {
          localStorage.removeItem('currentOrganizationId');
        }
        
        // Update last refresh timestamp
        setLastTokenRefresh(Date.now());
        
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
  }, [session, user, organization]);
  
  // This effect handles token storage when organization changes
  useEffect(() => {
    // Wait until both user and organization data are loaded
    if (!userLoaded || !orgLoaded) return;
    
    // Skip if organization hasn't changed
    if (organization?.id === lastOrgId) return;
    
    // Update last org id
    setLastOrgId(organization?.id || null);
    
    // Store token initially
    storeToken();
  }, [session, user, userLoaded, organization, orgLoaded, lastOrgId, storeToken]);
  
  // This effect sets up proactive token refresh
  useEffect(() => {
    // Setup polling interval to refresh token proactively
    const intervalId = setInterval(() => {
      // Only refresh if we have a session and user is loaded
      if (session && userLoaded) {
        // Refresh token every 4 minutes to ensure it doesn't expire
        // Clerk tokens typically last 5-10 minutes, so we refresh before expiry
        const timeSinceLastRefresh = Date.now() - lastTokenRefresh;
        const fourMinutes = 4 * 60 * 1000;
        
        if (timeSinceLastRefresh >= fourMinutes) {
          console.log('Proactively refreshing token...');
          storeToken();
        }
      }
    }, 1000 * 60 * 2); // Check every 2 minutes
    
    return () => {
      clearInterval(intervalId);
    };
  }, [session, userLoaded, lastTokenRefresh, storeToken]);
  
  // Listen for auth:unauthorized events to trigger token refresh
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('Unauthorized event received, refreshing token...');
      storeToken();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
      
      return () => {
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
      };
    }
  }, [storeToken]);
}

export default useClerkToken; 