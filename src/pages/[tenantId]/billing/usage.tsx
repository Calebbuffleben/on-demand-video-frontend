import React, { useEffect, useState } from 'react';
import subscriptionService, { OrgUsageLimitsResponse } from '../../../api-connection/subscriptions';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';

export default function UsagePage() {
  const [usage, setUsage] = useState<OrgUsageLimitsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await subscriptionService.getOrgUsage();
        setUsage(data);
      } catch (e) {
        const errorMessage = e instanceof Error 
          ? e.message 
          : (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Falha ao carregar limites e uso';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getUsagePercentage = (current: number, max: number | null) => {
    if (!max || max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-emerald-500 to-teal-600';
  };

  const Stat = ({ 
    label, 
    value, 
    max, 
    current, 
    icon
  }: { 
    label: string; 
    value: string; 
    max?: string; 
    current?: number;
    icon: React.ReactNode;
  }) => {
    const percentage = current && max ? getUsagePercentage(current, parseFloat(max)) : 0;
    const colorClass = getUsageColor(percentage);
    
    return (
      <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-silver-200">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-silver-50 to-white opacity-50"></div>
        
        {/* Content */}
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-scale-100 to-silver-200 rounded-lg group-hover:scale-110 transition-transform duration-200">
                {icon}
              </div>
              <div>
                <div className="text-sm font-medium text-silver-600 uppercase tracking-wide">{label}</div>
                <div className="text-2xl font-bold text-scale-800 mt-1">
                  {value}
                  {typeof max !== 'undefined' && (
                    <span className="text-lg font-normal text-silver-500 ml-1">/ {max}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          {current && max && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-silver-500">
                <span>Uso atual</span>
                <span className="font-medium">{percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-silver-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout sidebar={<DashboardSidebar />}>
      <div className="p-4 md:p-6 bg-silver-50 min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-scale-800 via-scale-700 to-scale-600 rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative p-8">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-scale-800/30"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Uso da Organização</h1>
                    <p className="text-white/90 text-lg">Acompanhe seus limites e consumo por plano</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Plan Card */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-silver-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-silver-600 uppercase tracking-wide">Plano Atual</div>
                    <div className="text-2xl font-bold text-scale-800 mt-1">
                      {usage?.plan || (loading ? '—' : 'N/A')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-silver-500">Status</div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    Ativo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Stat
            label="Storage"
            value={loading || !usage ? '—' : `${usage.usage.storageGB.toFixed(2)} GB`}
            max={loading || !usage ? undefined : (usage.limits.maxStorageGB ?? '∞').toString() + ' GB'}
            current={usage?.usage.storageGB}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
          />
          <Stat
            label="Minutos Totais"
            value={loading || !usage ? '—' : `${usage.usage.totalMinutes}`}
            max={loading || !usage ? undefined : (usage.limits.maxTotalMinutes ?? '∞').toString()}
            current={usage?.usage.totalMinutes}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <Stat
            label="Visualizações Únicas"
            value={loading || !usage ? '—' : `${usage.usage.uniqueViews}`}
            max={loading || !usage ? undefined : (usage.limits.maxUniqueViews ?? '∞').toString()}
            current={usage?.usage.uniqueViews}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
