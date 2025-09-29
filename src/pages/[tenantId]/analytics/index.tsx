'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import analyticsService from '@/api-connection/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import DashboardLayout from '../../../components/Dashboard/DashboardLayout';
import DashboardSidebar from '../../../components/Dashboard/DashboardSidebar';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';
import Image from 'next/image';
import AuthGuard from '@/components/Auth/AuthGuard';

function AnalyticsPage() {
  const router = useRouter();
  const tenantId = router.query.tenantId as string;
  
  // No Clerk token management needed with cookie auth
  
  const [data, setData] = useState<{
    platformStats: {
      totalVideos: number;
      totalViews: number;
      totalStorage: string;
      totalBandwidth: string;
    };
    recentUploads: Array<{
      id: string;
      title: string;
      thumbnailUrl: string;
      uploadDate: string;
      size: string;
      duration: string;
    }>;
    popularVideos: Array<{
      id: string;
      title: string;
      thumbnailUrl: string;
      views: number;
      duration: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId) return; // Don't fetch if tenantId is not available yet
      
      try {
        const response = await analyticsService.getDashboardAnalytics();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Falha ao carregar dados de análise');
        }
      } catch (err) {
        setError('Falha ao carregar dados de análise');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  if (loading) {
    return (
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-3 sm:p-4 md:p-6 bg-gray-50">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold">Analytics</h1>
                <p className="text-gray-600 text-sm mt-1">Visualize o desempenho do seu conteúdo</p>
              </div>
              <DashboardMenu />
            </div>
          </header>
          <AnalyticsSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-3 sm:p-4 md:p-6 bg-gray-50">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold">Analytics</h1>
                <p className="text-gray-600 text-sm mt-1">Visualize o desempenho do seu conteúdo</p>
              </div>
              <DashboardMenu />
            </div>
          </header>
          <div className="p-4 text-red-500">
            {error}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-3 sm:p-4 md:p-6 bg-gray-50">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold">Painel de Análises</h1>
                <p className="text-gray-600 text-sm mt-1">Visualize o desempenho do seu conteúdo</p>
              </div>
              <DashboardMenu />
            </div>
          </header>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <AuthGuard requireAuth requireOrg>
    <DashboardLayout sidebar={<DashboardSidebar />}>
      <div className="p-3 sm:p-4 md:p-6 bg-gray-50">
        <header className="bg-white shadow-sm mb-6 rounded-lg">
          <div className="px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">Painel de Análises</h1>
              <p className="text-gray-600 text-sm mt-1">Visualize o desempenho do seu conteúdo</p>
            </div>
            <DashboardMenu />
          </div>
        </header>

        <div className="space-y-6">
          {/* Platform Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total de Vídeos"
              value={formatNumber(data.platformStats.totalVideos)}
            />
            <StatCard
              title="Total de Visualizações"
              value={formatNumber(data.platformStats.totalViews)}
            />
            <StatCard
              title="Armazenamento Total"
              value={data.platformStats.totalStorage}
            />
            <StatCard
              title="Largura de Banda Total"
              value={data.platformStats.totalBandwidth}
            />
          </div>

          {/* Recent Uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Envios Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.recentUploads.map((upload) => (
                  <VideoCard
                    key={upload.id}
                    id={upload.id}
                    title={upload.title}
                    thumbnailUrl={upload.thumbnailUrl}
                    date={new Date(upload.uploadDate)}
                    duration={upload.duration}
                    size={upload.size}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Vídeos Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.popularVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    thumbnailUrl={video.thumbnailUrl}
                    views={video.views}
                    duration={video.duration}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
    </AuthGuard>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg sm:text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function VideoCard({
  title,
  thumbnailUrl,
  views,
  date,
  duration,
  size,
  id,
}: {
  title: string;
  thumbnailUrl: string;
  views?: number;
  date?: Date;
  duration?: string;
  size?: string;
  id: string;
}) {
  const router = useRouter();
  const tenantId = router.query.tenantId as string;

  return (
    <Card className="overflow-hidden group">
      <div className="aspect-video relative">
        <Image
          src={thumbnailUrl}
          alt={title}
          className="object-cover w-full h-full"
          width={320}
          height={180}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <Link
            href={`/${tenantId}/analytics/videos/${id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-scale-600 px-3 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-silver-50"
          >
            Ver Analytics
          </Link>
        </div>
      </div>
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base truncate">{title}</h3>
        <div className="text-xs sm:text-sm text-silver-500 mt-2 space-y-1">
          {views !== undefined && <div>{formatNumber(views)} visualizações</div>}
          {date && <div>{formatDate(new Date(date))}</div>}
          {duration && <div>{duration}</div>}
          {size && <div>{size}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 sm:h-24" />
        ))}
      </div>

      <Skeleton className="h-48 sm:h-64" />
      <Skeleton className="h-48 sm:h-64" />
    </div>
  );
}

function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Data inválida';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default AnalyticsPage;