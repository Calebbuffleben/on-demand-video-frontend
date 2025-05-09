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
import analyticsService from '@/api-connection/analytics';
import api from '@/api';

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
  
  // Platform stats
  const [platformStats, setPlatformStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalStorage: '0 GB',
    totalBandwidth: '0 GB'
  });
  
  // Recent uploads
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  
  // Popular videos
  const [popularVideos, setPopularVideos] = useState<any[]>([]);
  
  // Analytics loading state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  
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

  // Test backend status
  const testBackendStatus = async () => {
    setApiTestLoading(true);
    setApiTestResult(null);
    
    try {
      // Make a simple request to the backend root
      const response = await fetch('http://localhost:4000/api');
      
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
        data: responseData,
        apiBaseUrl: api.defaults.baseURL
      });
    } catch (err: any) {
      setApiTestResult({
        error: err.message,
        stack: err.stack,
        apiBaseUrl: api.defaults.baseURL
      });
    } finally {
      setApiTestLoading(false);
    }
  };

  // Load analytics data
  const loadAnalytics = async () => {
    if (typeof window === 'undefined') return;
    
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    
    try {
      // Get all dashboard analytics in one request
      const dashboardData = await analyticsService.getDashboardAnalytics();
      
      if (dashboardData.success) {
        setPlatformStats(dashboardData.data.platformStats);
        setRecentUploads(dashboardData.data.recentUploads);
        setPopularVideos(dashboardData.data.popularVideos);
        console.log('Loaded analytics data from API:', dashboardData);
      } else if (dashboardData.error) {
        // Handle error response from the analytics service
        console.warn('Analytics service returned an error:', dashboardData.error);
        setAnalyticsError(dashboardData.error.message || 'Failed to load analytics data');
        
        // Still use the fallback data that was provided
        setPlatformStats(dashboardData.data.platformStats);
        setRecentUploads(dashboardData.data.recentUploads);
        setPopularVideos(dashboardData.data.popularVideos);
      } else {
        throw new Error('Failed to load analytics data');
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      setAnalyticsError(error?.message || 'Failed to load analytics data');
      
      // Load mock data as fallback
      loadMockData();
    } finally {
      setAnalyticsLoading(false);
    }
  };
  
  // Load mock data as fallback
  const loadMockData = () => {
    setPlatformStats({
      totalVideos: 12,
      totalViews: 1420,
      totalStorage: '2.4 GB',
      totalBandwidth: '5.7 GB'
    });
    
    setRecentUploads([
      {
        id: 'video-1',
        title: 'Introduction to Video Hosting',
        thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&auto=format&fit=crop',
        uploadDate: '2023-10-05',
        size: '245 MB',
        duration: '12:45',
      },
      {
        id: 'video-2',
        title: 'Content Creation Best Practices',
        thumbnailUrl: 'https://images.unsplash.com/photo-1574717024453-354056dafa4e?w=400&auto=format&fit=crop',
        uploadDate: '2023-09-28',
        size: '312 MB',
        duration: '8:12',
      },
      {
        id: 'video-3',
        title: 'Video SEO Optimization',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop',
        uploadDate: '2023-09-15',
        size: '185 MB',
        duration: '15:30',
      }
    ]);
    
    setPopularVideos([
      {
        id: 'pop-1',
        title: 'How to Grow Your Audience',
        thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop',
        views: 856,
        duration: '18:30',
      },
      {
        id: 'pop-2',
        title: 'Streaming Setup Guide',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=400&auto=format&fit=crop',
        views: 721,
        duration: '14:15',
      },
      {
        id: 'pop-3',
        title: 'Video Monetization Strategies',
        thumbnailUrl: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400&auto=format&fit=crop',
        views: 632,
        duration: '22:10',
      }
    ]);
  };

  // Load analytics on mount and when organization context is ready
  useEffect(() => {
    // Only load analytics if we're authenticated and have org context
    if (subscriptionRequested.current && !loading && subscription) {
      loadAnalytics();
    }
  }, [subscriptionRequested.current, loading, subscription]);

  return (
    <ClientOnly>
      <Head>
        <title>Dashboard</title>
      </Head>
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-4 md:p-6 bg-gray-50">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-gray-600 text-sm mt-1">{organization?.name || 'Organization'}</p>
              </div>
              <DashboardMenu />
            </div>
          </header>

          {/* Platform Overview Stats */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Platform Overview</h2>
              {analyticsLoading && (
                <div className="text-sm text-gray-500">Loading data...</div>
              )}
              {analyticsError && (
                <div className="text-sm text-red-500">{analyticsError}</div>
              )}
              {!analyticsLoading && (
                <button 
                  onClick={loadAnalytics} 
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Refresh
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Videos</p>
                    <p className="text-xl font-semibold text-gray-900">{platformStats.totalVideos}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-xl font-semibold text-gray-900">{platformStats.totalViews}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Storage Used</p>
                    <p className="text-xl font-semibold text-gray-900">{platformStats.totalStorage}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bandwidth Used</p>
                    <p className="text-xl font-semibold text-gray-900">{platformStats.totalBandwidth}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg overflow-hidden shadow-md">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-2">Ready to upload new content?</h2>
              <p className="text-blue-100 mb-6">Share your videos with your audience today.</p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={tenantId ? `/${tenantId}/upload-video` : "/upload-video"}
                  className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md bg-white text-blue-600 hover:bg-blue-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Upload Video
                </Link>
                
                <Link
                  href={tenantId ? `/${tenantId}/videos` : "/my-videos"}
                  className="inline-flex items-center px-5 py-2.5 border border-white text-sm font-medium rounded-md text-white hover:bg-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Manage Videos
                </Link>
                
                <Link
                  href={tenantId ? `/${tenantId}/analytics` : "/analytics"}
                  className="inline-flex items-center px-5 py-2.5 border border-white text-sm font-medium rounded-md text-white hover:bg-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Analytics
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Uploads</h2>
              <Link
                href={tenantId ? `/${tenantId}/videos` : "/my-videos"}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
            <div className="overflow-hidden bg-white shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUploads.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-16 relative">
                            {video.thumbnailUrl && (
                              <Image
                                src={video.thumbnailUrl}
                                alt={video.title}
                                fill
                                className="rounded"
                                style={{ objectFit: 'cover' }}
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{video.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{video.uploadDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{video.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{video.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular Videos */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Popular Videos</h2>
              <Link
                href={tenantId ? `/${tenantId}/analytics` : "/analytics"}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View analytics
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularVideos.map(video => (
                <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden group hover:shadow-md transition-shadow duration-200">
                  <div className="relative">
                    {video.thumbnailUrl && (
                      <div className="aspect-video relative">
                        <Image 
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-white rounded-full text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="p-2 bg-white rounded-full text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{video.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-500 text-xs">{video.duration}</p>
                      <div className="flex items-center text-gray-500 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {video.views} views
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Organization Overview */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4 text-gray-900">Organization Overview</h2>
            <div className="grid grid-cols-1 gap-5">
              <OrganizationOverviewCard />
            </div>
          </div>

          {/* Debug Information (kept intact) */}
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
                      
                      <button
                        onClick={testBackendStatus}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 ml-2"
                      >
                        Check Backend Status
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