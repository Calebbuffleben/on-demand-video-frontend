'use client'

import { useEffect, useState, useRef } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';

// Import SignOutComponent with no SSR
const SignOutComponent = dynamic(
  () => import('@/components/ui/SignOutComponent/SignOutComponent'),
  { ssr: false }
);

// ClientOnly wrapper component
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
};

// Dashboard component with no SSR
const DashboardPage = () => {
  const [subscription, setSubscription] = useState<null | any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const [apiTestLoading, setApiTestLoading] = useState(false);
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const router = useRouter();
  const { tenantId } = router.query;
  const redirectAttempted = useRef(false);
  const subscriptionRequested = useRef(false);
  // Initialize state without localStorage
  const [dbOrgId, setDbOrgId] = useState<string | null>(null);
  const [subscriptionService, setSubscriptionService] = useState<any>(null);
  
  // Load the subscription service module safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only load on client side
      import('@/api-connection/subscriptions').then((module) => {
        setSubscriptionService(module.default);
      });
    }
  }, []);
  
  // Load localStorage values only on client
  useEffect(() => {
    // This code only runs on the client
    const savedOrgId = localStorage.getItem('dbOrganizationId');
    if (savedOrgId) {
      setDbOrgId(savedOrgId);
    }
  }, []);
    
  // Force Clerk organization context into localStorage
  useEffect(() => {
    if (orgLoaded && organization?.id) {
      // Always ensure the organization ID from Clerk is in localStorage
      localStorage.setItem('currentOrganizationId', organization.id);
      console.log('Set organization ID from Clerk:', organization.id);
    }
  }, [orgLoaded, organization]);
  
  useEffect(() => {
    // Safe way to access localStorage in Next.js
    const getLocalStorageData = () => {
      if (typeof window === 'undefined') return null;
      
      return {
        token: localStorage.getItem('token') ? 'Present' : 'Missing',
        clerkOrgId: localStorage.getItem('currentOrganizationId') || 'None',
        dbOrgId: localStorage.getItem('dbOrganizationId') || 'None'
      };
    };
    
    const getPathData = () => {
      return typeof window !== 'undefined' ? window.location.pathname : 'No window';
    };
    
    // Update debug info
    setDebugInfo({
      organizationLoaded: orgLoaded, 
      organizationId: organization?.id || 'None',
      databaseOrgId: dbOrgId || (typeof window !== 'undefined' ? localStorage.getItem('dbOrganizationId') : null) || 'None',
      tenantId: tenantId || 'None',
      redirectAttempted: redirectAttempted.current,
      subscriptionRequested: subscriptionRequested.current,
      serviceLoaded: !!subscriptionService,
      localStorage: getLocalStorageData() || 'No window',
      path: getPathData()
    });
    
    // Don't proceed until Clerk organization and subscription service are loaded
    if (!orgLoaded || !subscriptionService) {
      return;
    }
    
    // Handle URL with template placeholder
    if (tenantId === '{organizationId}' && organization?.id && !redirectAttempted.current) {
      redirectAttempted.current = true;
      
      // Try to redirect to correct URL
      try {
        const correctPath = window.location.pathname.replace('{organizationId}', organization.id);
        console.log('Redirecting to correct path with organization ID:', correctPath);
        router.push(correctPath);
        return;
      } catch (err) {
        console.error('Failed to redirect:', err);
        // Continue with template URL but use Clerk organization
      }
    }
    
    // If we have organization context, fetch subscription (but only once)
    if (organization?.id && !subscriptionRequested.current) {
      console.log('Fetching subscription using organization from Clerk:', organization.id);
      subscriptionRequested.current = true;
      fetchSubscription();
    }
    // If we have a valid organization ID in the URL, use that (but only once)
    else if (tenantId && typeof tenantId === 'string' && 
            tenantId.startsWith('org_') && 
            !subscriptionRequested.current) {
      console.log('Fetching subscription using organization from URL:', tenantId);
      localStorage.setItem('currentOrganizationId', tenantId);
      subscriptionRequested.current = true;
      fetchSubscription();
    }
    // If we have an organization ID in localStorage but not from other sources, use that (but only once)
    else if (typeof window !== 'undefined' && 
            localStorage.getItem('currentOrganizationId') && 
            !subscriptionRequested.current) {
      console.log('Fetching subscription using organization from localStorage');
      subscriptionRequested.current = true;
      fetchSubscription();
    }
    // If we've already tried to fetch but got an error, show the error
    else if (subscriptionRequested.current && !loading && !subscription) {
      setError("No organization context available or subscription could not be loaded");
    }
  }, [orgLoaded, organization, tenantId, router, loading, subscription, dbOrgId, subscriptionService]);
  

  const fetchSubscription = async () => {
    // Don't attempt to fetch on server or if service isn't loaded
    if (typeof window === 'undefined' || !subscriptionService) return;
    
    setLoading(true);
    setError(null);
    try {
      // Use the Clerk organization ID directly
      if (organization?.id) {
        console.log('Using organization ID from Clerk for API call:', organization.id);
        localStorage.setItem('currentOrganizationId', organization.id);
      }
      
      // Get or sync database organization ID if needed
      const currentDbOrgId = dbOrgId || localStorage.getItem('dbOrganizationId');
      if (!currentDbOrgId && organization?.id) {
        console.log('No database organization ID available - trying to sync user profile first');
        try {
          await testCreateOrganization();
          // Small delay to ensure new ID is saved
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      }
      
      // Small delay to ensure localStorage is set
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const subscription = await subscriptionService.getCurrentSubscription();
      console.log('Subscription loaded:', subscription);
      setSubscription(subscription);
    } catch (err: any) {
      console.error("Error fetching subscription:", err);
      const errorMessage = err?.response?.data?.message || err.message || "Failed to load subscription details";
      setError(errorMessage);
      
      // Check for token issues
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
        setError('Authentication token is missing. Try signing in again.');
      }
    } finally {
      setLoading(false);
    }
  } 
  
  const handleRetry = () => {
    // Don't proceed if we're on the server or service isn't loaded
    if (typeof window === 'undefined' || !subscriptionService) return;
    
    // Reset subscription request flag
    subscriptionRequested.current = false;
    
    // Refresh the token first
    if (window.dispatchEvent) {
      window.dispatchEvent(new Event('refresh-token'));
    }
    
    // Then retry the subscription fetch after a short delay
    setTimeout(() => {
      fetchSubscription();
    }, 500);
  };

  // Test creating organization in the database
  const testCreateOrganization = async () => {
    // Don't attempt to call on server
    if (typeof window === 'undefined') return;
    
    setApiTestLoading(true);
    setApiTestResult(null);
    
    try {
      const orgId = organization?.id || localStorage.getItem('currentOrganizationId');
      const token = localStorage.getItem('token');
      
      if (!orgId || !token) {
        throw new Error('Missing required organization ID or token');
      }
      
      // Try to sync the user info first - this should create the organization as a side effect
      const response = await fetch('http://localhost:4000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Organization-Id': orgId
        }
      });
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { text: responseText };
      }
      
      // Save the database organization ID
      if (responseData?.organization?.id) {
        localStorage.setItem('dbOrganizationId', responseData.organization.id);
        setDbOrgId(responseData.organization.id);
        console.log('Saved database organization ID:', responseData.organization.id);
      }
      
      setApiTestResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        data: responseData
      });
      
      // After syncing, try to get subscription again
      if (response.ok) {
        setTimeout(() => {
          subscriptionRequested.current = false;
          fetchSubscription();
        }, 1000);
      }
    } catch (err: any) {
      setApiTestResult({
        error: err.message,
        stack: err.stack
      });
    } finally {
      setApiTestLoading(false);
    }
  };

  // Direct API testing function
  const testDirectApiCall = async () => {
    // Don't attempt to call on server
    if (typeof window === 'undefined') return;
    
    setApiTestLoading(true);
    setApiTestResult(null);
    
    try {
      // Use database organization ID if available (important!)
      const orgId = dbOrgId || localStorage.getItem('dbOrganizationId') || organization?.id || localStorage.getItem('currentOrganizationId');
      const token = localStorage.getItem('token');
      
      if (!orgId || !token) {
        throw new Error('Missing required organization ID or token');
      }
      
      console.log('Making direct API call with organization ID:', orgId);
      
      // Make a direct fetch request
      const response = await fetch(`http://localhost:4000/api/subscriptions/${orgId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Organization-Id': organization?.id || localStorage.getItem('currentOrganizationId') || ''
        }
      });
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { text: responseText };
      }
      
      setApiTestResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        data: responseData
      });
      
      // If successful, update subscription state
      if (response.ok && responseData?.subscription) {
        setSubscription(responseData.subscription);
      }
    } catch (err: any) {
      setApiTestResult({
        error: err.message,
        stack: err.stack
      });
    } finally {
      setApiTestLoading(false);
    }
  };

  // Try verifying token directly first
  const testTokenVerification = async () => {
    // Don't attempt to call on server
    if (typeof window === 'undefined') return;
    
    setApiTestLoading(true);
    setApiTestResult(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Missing token');
      }
      
      // Try verifying the token directly
      const response = await fetch('http://localhost:4000/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { text: responseText };
      }
      
      setApiTestResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        data: responseData
      });
      
      // If token verification succeeded, refresh debug info
      if (response.ok && responseData?.success) {
        setTimeout(() => {
          // Force the organization info to localStorage
          if (responseData?.organization?.id) {
            localStorage.setItem('currentOrganizationId', responseData.organization.id);
          }
          
          // Retry subscription fetch
          subscriptionRequested.current = false;
          fetchSubscription();
        }, 1000);
      }
    } catch (err: any) {
      setApiTestResult({
        error: err.message,
        stack: err.stack
      });
    } finally {
      setApiTestLoading(false);
    }
  };

  return (
    <ClientOnly>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <SignOutComponent />

        <div className="mt-6 p-4 border rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-2">Subscription</h2>
          
          {!orgLoaded && <p>Loading organization data...</p>}
          
          {loading && orgLoaded && <p>Loading subscription information...</p>}
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
              <p>{error}</p>
              <button 
                onClick={handleRetry}
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
              >
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && subscription && (
            <div>
              <p className="mb-2">Status: <span className="font-medium">{subscription?.status}</span></p>
              <pre className="bg-gray-50 p-2 rounded text-xs mt-4 overflow-auto max-h-40">
                {JSON.stringify(subscription, null, 2)}
              </pre>
            </div>
          )}
          
          {!loading && !error && !subscription && orgLoaded && (
            <p>No subscription found for this organization.</p>
          )}
        </div>
        
        {/* Direct API Testing */}
        <div className="mt-6 p-4 border rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-2">API Diagnostics</h2>
          <div className="flex gap-2 mb-3 flex-wrap">
            <button 
              onClick={testDirectApiCall}
              disabled={apiTestLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            >
              {apiTestLoading ? 'Testing...' : 'Test Direct API Call'}
            </button>
            
            <button 
              onClick={testCreateOrganization}
              disabled={apiTestLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
            >
              {apiTestLoading ? 'Processing...' : 'Sync User Profile'}
            </button>
            
            <button 
              onClick={testTokenVerification}
              disabled={apiTestLoading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm"
            >
              {apiTestLoading ? 'Processing...' : 'Verify Token'}
            </button>
          </div>
          
          {apiTestResult && (
            <div className="mt-3">
              <h3 className="text-md font-medium">API Response:</h3>
              <pre className="bg-gray-50 p-2 rounded text-xs mt-2 overflow-auto max-h-80">
                {JSON.stringify(apiTestResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        {/* Debug information */}
        <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-sm font-bold mb-2 text-gray-700">Debug Info</h3>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </ClientOnly>
  )
}

export default DashboardPage;