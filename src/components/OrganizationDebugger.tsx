'use client';

import { useState, useEffect } from 'react';
import { useUser, useOrganization, useSession } from '@clerk/nextjs';

export default function OrganizationDebugger() {
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { session } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Decode JWT Token
  const decodeJwt = (token: string) => {
    try {
      // Get payload part (second part of JWT)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  };
  
  const fetchToken = async () => {
    setLoading(true);
    try {
      if (session) {
        const fetchedToken = await session.getToken();
        if (fetchedToken) {
          setToken(fetchedToken);
          
          // Store token in localStorage for API calls
          localStorage.setItem('token', fetchedToken);
          
          // Store current organization ID in localStorage
          if (organization?.id) {
            localStorage.setItem('currentOrganizationId', organization.id);
          }
          
          // Decode token to show its contents
          setTokenInfo(decodeJwt(fetchedToken));
          
          // Log success for debugging
          console.log('Token refreshed and stored in localStorage');
          console.log('Organization ID stored:', organization?.id || 'None');
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to fetch token:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-refresh token periodically
  useEffect(() => {
    if (autoRefresh) {
      const refreshInterval = setInterval(() => {
        if (userLoaded && orgLoaded && session) {
          fetchToken();
        }
      }, 10 * 60 * 1000); // Refresh every 10 minutes
      
      return () => clearInterval(refreshInterval);
    }
  }, [autoRefresh, userLoaded, orgLoaded, organization?.id, session]);
  
  // Listen for refresh-token events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleRefreshToken = () => {
        console.log('Token refresh requested via event');
        if (session) {
          fetchToken();
        }
      };
      
      window.addEventListener('refresh-token', handleRefreshToken);
      
      return () => {
        window.removeEventListener('refresh-token', handleRefreshToken);
      };
    }
  }, [session]);
  
  // Get token info when organization changes
  useEffect(() => {
    if (userLoaded && orgLoaded && session) {
      fetchToken();
    }
  }, [userLoaded, orgLoaded, organization?.id, session]);
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Organization Debug Panel</h2>
      
      {/* User information */}
      <div className="mb-4">
        <h3 className="font-medium">User Info:</h3>
        {userLoaded ? (
          <div className="text-sm">
            <p>ID: {user?.id}</p>
            <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading user...</p>
        )}
      </div>
      
      {/* Organization information */}
      <div className="mb-4">
        <h3 className="font-medium">Current Organization:</h3>
        {orgLoaded ? (
          organization ? (
            <div className="text-sm">
              <p>ID: {organization.id}</p>
              <p>Name: {organization.name}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No organization selected</p>
          )
        ) : (
          <p className="text-sm text-gray-500">Loading organization...</p>
        )}
      </div>
      
      {/* Organization memberships */}
      {userLoaded && user?.organizationMemberships && (
        <div className="mb-4">
          <h3 className="font-medium">Organization Memberships:</h3>
          <ul className="text-sm">
            {user.organizationMemberships.map(membership => (
              <li key={membership.organization.id} className={`mb-1 ${
                membership.organization.id === organization?.id ? 'font-bold' : ''
              }`}>
                {membership.organization.name} ({membership.role})
                {membership.organization.id === organization?.id && 
                  <span className="ml-2 text-green-600">[ACTIVE]</span>
                }
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Token information */}
      <div className="mb-4">
        <h3 className="font-medium">Token Information:</h3>
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={fetchToken} 
            className="text-xs bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Token'}
          </button>
          
          <label className="text-xs flex items-center">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={e => setAutoRefresh(e.target.checked)} 
              className="mr-1"
            />
            Auto-refresh
          </label>
        </div>
        
        {token && (
          <div className="text-xs">
            <div className="mb-2 break-all bg-gray-50 p-2 rounded">
              <p className="font-mono">{token}</p>
            </div>
            <div className="overflow-auto max-h-40 bg-gray-100 p-2 rounded">
              <pre>{JSON.stringify(tokenInfo, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Local storage info */}
      <div>
        <h3 className="font-medium">Local Storage:</h3>
        <div className="text-xs mt-1">
          <p>token: {typeof window !== 'undefined' && localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</p>
          <p>currentOrganizationId: {typeof window !== 'undefined' && localStorage.getItem('currentOrganizationId')}</p>
        </div>
      </div>
    </div>
  );
} 