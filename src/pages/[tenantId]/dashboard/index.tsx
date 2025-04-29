'use client'

import { useEffect, useState, useRef } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

// Import components for organization dashboard
import OrganizationOverviewCard from '@/components/Organization/OrganizationOverviewCard';
import OrganizationMembersCard from '@/components/Organization/OrganizationMembersCard';
import SubscriptionStatusCard from '@/components/Subscription/SubscriptionStatusCard';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';
import DashboardLayout from '../../../components/Dashboard/DashboardLayout';
import DashboardSidebar from '../../../components/Dashboard/DashboardSidebar';

// Import video service
import videoService from '@/api-connection/videos';

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
    const savedOrgId = localStorage.getItem('dbOrganizationId');
    if (savedOrgId) {
      setDbOrgId(savedOrgId);
    }
  }, []);
    
  // Force Clerk organization context into localStorage
  useEffect(() => {
    if (orgLoaded && organization?.id) {
      localStorage.setItem('currentOrganizationId', organization.id);
      console.log('Set organization ID from Clerk:', organization.id);
    }
  }, [orgLoaded, organization]);
  
  useEffect(() => {
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
    if (typeof window === 'undefined') return;
    
    setApiTestLoading(true);
    setApiTestResult(null);
    
    try {
      const orgId = organization?.id || localStorage.getItem('currentOrganizationId');
      const token = localStorage.getItem('token');
      
      if (!orgId || !token) {
        throw new Error('Missing required organization ID or token');
      }
      
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
    if (typeof window === 'undefined') return;
    
    setApiTestLoading(true);
    setApiTestResult(null);
    
    try {
      const orgId = dbOrgId || localStorage.getItem('dbOrganizationId') || organization?.id || localStorage.getItem('currentOrganizationId');
      const token = localStorage.getItem('token');
      
      if (!orgId || !token) {
        throw new Error('Missing required organization ID or token');
      }
      
      console.log('Making direct API call with organization ID:', orgId);
      
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

  // Try verifying token directly
  const testTokenVerification = async () => {
    if (typeof window === 'undefined') return;
    
    setApiTestLoading(true);
    setApiTestResult(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Missing token');
      }
      
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

  // Add the testCloudflareConnection function
  const testCloudflareConnection = async () => {
    try {
      const response = await videoService.testCloudflareConnection();
      console.log('Cloudflare connection test:', response);
      setApiTestResult({
        success: true,
        message: "Cloudflare connection test successful",
        response
      });
    } catch (err) {
      console.error('Cloudflare connection test failed:', err);
      setApiTestResult({
        success: false,
        message: "Cloudflare connection test failed", 
        error: err instanceof Error ? err.message : String(err)
      });
    }
  };

  return (
    <ClientOnly>
      <Head>
        <title>Dashboard</title>
      </Head>
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-4 md:p-6">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-gray-600 text-sm mt-1">{organization?.name || 'Organization'}</p>
              </div>
              <DashboardMenu />
            </div>
          </header>

          {/* Organization Overview */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4 text-gray-900">Organization Overview</h2>
            <div className="grid grid-cols-1 gap-5">
              <OrganizationOverviewCard />
            </div>
          </div>

          {/* Video Content Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Video Content</h2>
              <Link 
                href="/upload-video" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload Video
              </Link>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between bg-gradient-to-b from-blue-50 to-white">
                    <div>
                      <div className="flex items-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">My Videos</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Access and manage all your uploaded videos</p>
                    </div>
                    <Link 
                      href="/my-videos" 
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                    >
                      View my videos
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between bg-gradient-to-b from-purple-50 to-white">
                    <div>
                      <div className="flex items-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">Upload Video</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Upload new videos to your account</p>
                    </div>
                    <Link 
                      href="/upload-video" 
                      className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center"
                    >
                      Upload now
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between bg-gradient-to-b from-green-50 to-white">
                    <div>
                      <div className="flex items-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                      </div>
                      <p className="text-gray-600 mb-4">View performance metrics for your videos</p>
                    </div>
                    <span className="text-gray-500 inline-flex items-center">
                      Coming soon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Information (optional) */}
          <div className="mt-8">
            <details className="bg-white shadow-sm rounded-lg">
              <summary className="px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer">
                Debug Information
              </summary>
              <div className="p-4 border-t border-gray-200">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
                
                {Object.keys(debugInfo).length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <button
                        onClick={testDirectApiCall}
                        disabled={apiTestLoading}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        {apiTestLoading ? 'Testing...' : 'Test Direct API Call to /auth/me'}
                      </button>
                      
                      {apiTestResult && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">API Response:</p>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(apiTestResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <button
                        onClick={testTokenVerification}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        Verify Token from Session
                      </button>
                      
                      <button
                        onClick={testCloudflareConnection}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 ml-2"
                      >
                        Test Video API
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      </DashboardLayout>
    </ClientOnly>
  );
};

export default DashboardPage;