'use client'

import { useEffect, useState, useRef, useCallback } from "react";
import { useOrganization } from '@/hooks/useOrganization';
import { useRouter } from "next/router";
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import VideoRetentionChart from '@/components/analytics/VideoRetentionChart';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';
import DashboardLayout from '../../../components/Dashboard/DashboardLayout';
import DashboardSidebar from '../../../components/Dashboard/DashboardSidebar';
import analyticsService from '@/api-connection/analytics';
// import { useClerkToken } from '@/hooks/useClerkToken';
import AuthGuard from '@/components/Auth/AuthGuard';
import subsApi, { OrgUsageLimitsResponse } from '../../../api-connection/subscriptions';

// Type interfaces for analytics data
interface VideoUpload {
  id: string;
  title: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  size: string;
}

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
  const [subscription, setSubscription] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const router = useRouter();
  const { tenantId } = router.query;
  const redirectAttempted = useRef(false);
  const subscriptionRequested = useRef(false);
  
  // Token management no longer required with cookie httpOnly
  
  // Initialize state without localStorage
  const [dbOrgId, setDbOrgId] = useState<string | null>(null);
  const [subSvc, setSubSvc] = useState<{ getCurrentSubscription: () => Promise<unknown> } | null>(null);
  
  // Platform stats
  const [platformStats, setPlatformStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalStorage: '0 GB',
    totalBandwidth: '0 GB'
  });
  
  // Recent uploads
  const [recentUploads, setRecentUploads] = useState<VideoUpload[]>([]);
  
  // Analytics loading state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    // Don't attempt to fetch on server or if service isn't loaded
    if (typeof window === 'undefined' || !subSvc) return;
    
    setLoading(true);
    try {
      // Use the Clerk organization ID directly
      if (organization?.id) {
        console.log('Using organization ID from Clerk for API call:', organization.id);
        localStorage.setItem('currentOrganizationId', organization.id);
      }
      
      // Small delay to ensure localStorage is set
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const subscription = await subSvc.getCurrentSubscription();
      console.log('Subscription loaded:', subscription);
      setSubscription(subscription);
    } catch (err: unknown) {
      console.error("Error fetching subscription:", err);
      const errorMessage = err instanceof Error ? err.message : "Falha ao carregar detalhes da assinatura";
      console.error(errorMessage);
      
      // Check for token issues
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
        console.error('Authentication token is missing. Try signing in again.');
      }
    } finally {
      setLoading(false);
    }
  }, [organization?.id, subSvc]);
  
  // Load the subscription service module safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only load on client side
      import('@/api-connection/subscriptions').then((module) => {
        setSubSvc(module.default);
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
    // Don't proceed until Clerk organization and subscription service are loaded
    if (!orgLoaded || !subSvc) {
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
  }, [orgLoaded, organization, tenantId, router, loading, subscription, dbOrgId, subSvc, fetchSubscription]);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!tenantId) return;
      
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      try {
        const response = await analyticsService.getDashboardAnalytics();
        if (response.success) {
          setPlatformStats(response.data.platformStats);
          setRecentUploads(response.data.recentUploads);
        } else {
          setAnalyticsError(response.message || 'Falha ao carregar dados de análise');
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
        setAnalyticsError('Falha ao carregar dados de análise');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, [tenantId]);

  const [usage, setUsage] = useState<OrgUsageLimitsResponse | null>(null);
  const [loadingUsage, setLoadingUsage] = useState<boolean>(true);
  const [errorUsage, setErrorUsage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await subsApi.getOrgUsage();
        setUsage(data);
      } catch (e) {
        const errorMessage = e instanceof Error 
          ? e.message 
          : (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load usage';
        setErrorUsage(errorMessage);
      } finally {
        setLoadingUsage(false);
      }
    })();
  }, []);

  return (
    <ClientOnly>
      <Head>
        <title>Painel de Controle</title>
      </Head>
      <AuthGuard requireAuth requireOrg>
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-4 md:p-6 bg-silver-50">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">Painel de Controle</h1>
                <p className="text-silver-600 text-sm mt-1">{organization?.name || 'Organização'}</p>
              </div>
              <DashboardMenu />
            </div>
          </header>

          {/* Quick Actions */}
          <div className="mb-8 relative rounded-lg overflow-hidden shadow-2xl">
            {/* Main gradient background */}
            <div className="bg-gradient-to-br from-scale-950 via-scale-900 to-scale-800 relative">
              {/* High contrast overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-scale-700/40"></div>
              
              {/* Radial gradient for depth */}
              <div className="absolute inset-0 bg-radial-gradient from-white/20 via-transparent to-transparent"></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 animate-pulse"></div>
              
              {/* Content */}
              <div className="relative z-10 p-6 md:p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-silver-200 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-scale-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">Pronto para enviar novo conteúdo?</h2>
                    <p className="text-white/90 text-lg drop-shadow">Compartilhe seus vídeos com seu público hoje.</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-6">
                  <Link
                    href={tenantId ? `/${tenantId}/upload-video` : "/upload-video"}
                    className="group inline-flex items-center px-6 py-3 bg-white text-sm font-semibold rounded-lg text-scale-800 hover:bg-silver-50 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl border border-white/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-3 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Enviar Vídeo
                  </Link>
                  
                  <Link
                    href={tenantId ? `/${tenantId}/analytics` : "/analytics"}
                    className="group inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-sm font-semibold rounded-lg text-white hover:bg-white/20 hover:border-white/60 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Ver Analytics
                  </Link>
                  
                  <Link
                    href={tenantId ? `/${tenantId}/videos` : "/my-videos"}
                    className="group inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-sm font-semibold rounded-lg text-white hover:bg-white/20 hover:border-white/60 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Meus Vídeos
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4 text-scale-900">Visão Geral da Plataforma</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                    <div className="h-4 bg-silver-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-silver-200 rounded w-3/4"></div>
                  </div>
                ))
              ) : analyticsError ? (
                <div className="col-span-full text-red-500">
                  {analyticsError}
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-silver-500">Total de Vídeos</h3>
                    <p className="text-2xl font-semibold mt-1">{platformStats.totalVideos}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-silver-500">Total de Visualizações</h3>
                    <p className="text-2xl font-semibold mt-1">{platformStats.totalViews}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-silver-500">Armazenamento Total</h3>
                    <p className="text-2xl font-semibold mt-1">{platformStats.totalStorage}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-silver-500">Largura de Banda Total</h3>
                    <p className="text-2xl font-semibold mt-1">{platformStats.totalBandwidth}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4 text-scale-900">Envios Recentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
                    <div className="aspect-video bg-silver-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-silver-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-silver-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : analyticsError ? (
                <div className="col-span-full text-red-500">
                  {analyticsError}
                </div>
              ) : recentUploads.length > 0 ? (
                recentUploads.map((upload) => (
                  <div key={upload.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="aspect-video relative">
                      <Image
                        src={upload.thumbnailUrl}
                        alt={upload.title}
                        className="object-cover w-full h-full"
                        width={320}
                        height={180}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate">{upload.title}</h3>
                      <div className="text-sm text-silver-500 mt-2">
                        <div>{new Date(upload.uploadDate).toLocaleDateString()}</div>
                        <div>{upload.duration}</div>
                        <div>{upload.size}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-silver-500 py-8">
                  Nenhum envio recente
                </div>
              )}
            </div>
          </div>

          {/* Video Retention Analytics */}
          <div className="mb-8">
            <VideoRetentionChart />
          </div>

          {/* Usage Limits */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4 text-scale-900">Uso da Plataforma</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loadingUsage ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                    <div className="h-4 bg-silver-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-silver-200 rounded w-3/4"></div>
                  </div>
                ))
              ) : errorUsage ? (
                <div className="col-span-full text-red-500">
                  {errorUsage}
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-silver-500">Plano</h3>
                    <p className="text-2xl font-semibold mt-1">{usage?.plan || (loadingUsage ? '—' : 'N/A')}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-silver-500">Storage usado</h3>
                    <p className="text-2xl font-semibold mt-1">
                      {loadingUsage
                        ? '—'
                        : (typeof usage?.usage?.storageGB === 'number'
                            ? `${(usage?.usage?.storageGB as number).toFixed(2)} GB`
                            : '—')}
                      <span className="text-sm text-silver-500"> / {usage?.limits?.maxStorageGB ?? '∞'} GB</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-silver-500">Minutos totais</h3>
                    <p className="text-2xl font-semibold mt-1">
                      {loadingUsage ? '—' : (usage?.usage?.totalMinutes ?? '—')}
                      <span className="text-sm text-silver-500"> / {usage?.limits?.maxTotalMinutes ?? '∞'}</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 md:col-span-3">
                    <h3 className="text-sm font-medium text-silver-500">Visualizações únicas</h3>
                    <p className="text-2xl font-semibold mt-1">
                      {loadingUsage ? '—' : (usage?.usage?.uniqueViews ?? '—')}
                      <span className="text-sm text-silver-500"> / {usage?.limits?.maxUniqueViews ?? '∞'}</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
      </AuthGuard>
    </ClientOnly>
  );
};

export default DashboardPage;