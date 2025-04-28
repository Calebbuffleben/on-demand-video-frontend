'use client'

import { useEffect, useState, useRef } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Import components for organization dashboard
import OrganizationOverviewCard from '@/components/Organization/OrganizationOverviewCard';
import OrganizationMembersCard from '@/components/Organization/OrganizationMembersCard';
import SubscriptionStatusCard from '@/components/Subscription/SubscriptionStatusCard';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {organization?.name || 'Organization'} Dashboard
              </h1>
              <p className="text-blue-100 text-sm mt-1">Manage your organization and content</p>
            </div>
            <DashboardMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Organization Dashboard</h1>
          
          <div className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Organization Overview</h2>
                  </div>
                  <div className="p-6">
                    <OrganizationOverviewCard />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Subscription Status</h2>
                  </div>
                  <div className="p-6">
                    <SubscriptionStatusCard />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-10">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Team & Resources</h2>
              <div className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                1 Active Member
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Team Members</h3>
                    <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      Invite
                    </button>
                  </div>
                  <div className="p-6">
                    <OrganizationMembersCard maxDisplayed={5} />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Quick Stats</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-gray-500">Total Products</p>
                        <div className="flex items-end mt-2">
                          <p className="text-2xl font-bold text-gray-800">0</p>
                          <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            New
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Storage Used</p>
                        <div className="flex items-center mt-2">
                          <p className="text-2xl font-bold text-gray-800">0 MB</p>
                          <span className="text-xs text-gray-500 ml-2">of 1GB</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                          <div className="w-0 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Active Users</p>
                        <div className="flex items-center mt-2">
                          <p className="text-2xl font-bold text-gray-800">1</p>
                          <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                            Online
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Video Content</h2>
              <Link href="/upload-video" className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Video
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/upload-video" className="block group">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full border border-gray-100 group-hover:border-blue-300">
                  <div className="p-6 flex flex-col h-full">
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 w-14 h-14 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">Upload Video</h3>
                    <p className="text-gray-600 text-sm flex-grow">
                      Upload and share videos with your team and customers using Cloudflare Stream.
                    </p>
                    <div className="mt-4 text-blue-600 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
                      Get started
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/my-videos" className="block group">
                <div className="bg-white rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 overflow-hidden h-full border border-gray-100 group-hover:border-purple-300">
                  <div className="p-6 flex flex-col h-full">
                    <div className="bg-purple-50 p-4 rounded-lg mb-4 w-14 h-14 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">My Videos</h3>
                    <p className="text-gray-600 text-sm flex-grow">
                      View and manage your uploaded videos.
                    </p>
                    <div className="mt-4 text-purple-600 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
                      View library
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
              
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full border border-gray-100">
                <div className="p-6 flex flex-col h-full">
                  <div className="bg-green-50 p-4 rounded-lg mb-4 w-14 h-14 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Analytics</h3>
                  <p className="text-gray-600 text-sm flex-grow">
                    Track video performance and audience engagement.
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {(error || (typeof window !== 'undefined' && window.location.search.includes('debug=true'))) && (
            <div className="mt-10 border-t pt-6">
              <div className="flex items-center mb-4 justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Debug Information</h2>
                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                  Development Mode
                </div>
              </div>
              
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-800 p-4 rounded-lg overflow-auto text-xs mb-4">
                <pre className="text-gray-300">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
              
              {apiTestResult && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-gray-700">API Test Result</h3>
                  <div className="bg-gray-800 p-4 rounded-lg overflow-auto text-xs">
                    <pre className="text-gray-300">
                      {JSON.stringify(apiTestResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex flex-wrap gap-2">
                <button 
                  onClick={handleRetry} 
                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>Retry Subscription Load</span>
                </button>
                
                <button 
                  onClick={testCreateOrganization} 
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors flex items-center"
                  disabled={apiTestLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Test Create Organization
                </button>
                
                <button 
                  onClick={testDirectApiCall} 
                  className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center"
                  disabled={apiTestLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Test Direct API Call
                </button>
                
                <button 
                  onClick={testTokenVerification} 
                  className="px-3 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 transition-colors flex items-center"
                  disabled={apiTestLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Test Token Verification
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;