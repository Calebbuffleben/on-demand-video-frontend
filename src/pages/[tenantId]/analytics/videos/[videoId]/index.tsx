'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import analyticsService, { TimeRange, ViewerAnalytics } from '@/api-connection/analytics';
import videoService from '@/api-connection/videos';
import ViewerTimelineChart from '@/components/analytics/ViewerTimelineChart';
import ViewerBreakdownCharts from '@/components/analytics/ViewerBreakdownCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatDuration } from '@/lib/utils';
import DashboardLayout from '../../../../../components/Dashboard/DashboardLayout';
import DashboardSidebar from '../../../../../components/Dashboard/DashboardSidebar';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';
import Image from 'next/image';

interface VideoAnalytics {
  totalViews: number;
  averageWatchTime: number;
  engagementRate: number;
  uniqueViewers: number;
  viewsOverTime: {
    timestamp: string;
    views: number;
  }[];
  retentionData: {
    time: number;
    retention: number;
  }[];
  viewerTimeline: {
    timestamp: string;
    activeViewers: number;
  }[];
}

interface VideoData {
  uid: string;
  thumbnail: string;
  meta: {
    name: string;
  };
  duration: number;
}

const VideoAnalyticsPage: React.FC = () => {
  const router = useRouter();
  const { tenantId, videoId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [viewerAnalytics, setViewerAnalytics] = useState<ViewerAnalytics | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId || !videoId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch video data, analytics, and viewer analytics in parallel
        const [videoResponse, analyticsResponse, viewerAnalyticsResponse] = await Promise.all([
          videoService.getVideoByUid(videoId as string),
          analyticsService.getVideoAnalytics(videoId as string, timeRange),
          analyticsService.getViewerAnalytics(videoId as string, timeRange)
        ]);

        if (videoResponse.success && videoResponse.data?.result) {
          const video = Array.isArray(videoResponse.data.result) 
            ? videoResponse.data.result[0] 
            : videoResponse.data.result;
          setVideoData(video);
        }

        if (analyticsResponse.success) {
          setAnalytics(analyticsResponse.data);
        } else {
          setError('Falha ao carregar dados de análise');
        }

        if (viewerAnalyticsResponse.success) {
          setViewerAnalytics(viewerAnalyticsResponse.data);
        }
      } catch (err) {
        setError('Erro ao carregar dados');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId, videoId, timeRange]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const formData = new FormData(e.currentTarget);
    const newTimeRange: TimeRange = {
      timezone: formData.get('timezone') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      granularity: Number(formData.get('granularity'))
    };
    
    // Use a callback to ensure state is updated properly
    setTimeRange((prev) => ({
      ...prev,
      ...newTimeRange
    }));
    
    return false;
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-4 md:p-6 bg-gray-50">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">Análises do Vídeo</h1>
                <p className="text-gray-600 text-sm mt-1">Métricas detalhadas de desempenho do vídeo</p>
              </div>
              <DashboardMenu />
            </div>
          </header>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-4 md:p-6 bg-gray-50">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">Dados do Vídeo</h1>
                <p className="text-gray-600 text-sm mt-1">Métricas detalhadas de desempenho do vídeo</p>
              </div>
              <DashboardMenu />
            </div>
          </header>
          <Card>
            <CardContent className="p-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics || !videoData) {
    return (
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-4 md:p-6 bg-gray-50">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">Dados do Vídeo</h1>
                <p className="text-gray-600 text-sm mt-1">Métricas detalhadas de desempenho do vídeo</p>
              </div>
              <DashboardMenu />
            </div>
          </header>
          <Card>
            <CardContent className="p-6">
              <p>Nenhum dado disponível</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<DashboardSidebar />}>
      <div className="p-4 md:p-6 bg-gray-50">
        <header className="bg-white shadow-sm mb-6 rounded-lg">
          <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">Dados do Vídeo</h1>
              <p className="text-gray-600 text-sm mt-1">Métricas detalhadas de desempenho do vídeo</p>
            </div>
            <DashboardMenu />
          </div>
        </header>

        <div className="grid gap-6">
          {/* Time Range Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Período de Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="flex items-center space-x-4">
                <select
                  name="timezone"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  defaultValue={timeRange.timezone || 'UTC'}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Horário do Leste</option>
                  <option value="America/Chicago">Horário Central</option>
                  <option value="America/Denver">Horário das Montanhas</option>
                  <option value="America/Los_Angeles">Horário do Pacífico</option>
                </select>
                <input
                  type="date"
                  name="startDate"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  defaultValue={timeRange.startDate || ''}
                />
                <input
                  type="date"
                  name="endDate"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  defaultValue={timeRange.endDate || ''}
                />
                <select
                  name="granularity"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  defaultValue={timeRange.granularity || 5}
                >
                  <optgroup label="Segundos">
                    <option value="1">1 segundo</option>
                    <option value="5">5 segundos</option>
                    <option value="10">10 segundos</option>
                    <option value="15">15 segundos</option>
                    <option value="30">30 segundos</option>
                  </optgroup>
                  <optgroup label="Minutos">
                    <option value="60">1 minuto</option>
                    <option value="300">5 minutos</option>
                    <option value="900">15 minutos</option>
                    <option value="1800">30 minutos</option>
                    <option value="3600">1 hora</option>
                  </optgroup>
                </select>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Video Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Vídeo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Image
                  src={videoData.thumbnail}
                  alt={videoData.meta.name}
                  className="w-48 h-27 object-cover rounded"
                  width={192}
                  height={108}
                />
                <div>
                  <h2 className="text-xl font-semibold">{videoData.meta.name}</h2>
                  <p className="text-gray-500">Duração: {formatDuration(videoData.duration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics.totalViews)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio de Visualização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(analytics.averageWatchTime)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(analytics.engagementRate * 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visualizadores Únicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics.uniqueViewers)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Viewer Timeline Chart */}
          {viewerAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Timeline de Visualizadores</CardTitle>
              </CardHeader>
              <CardContent>
                <ViewerTimelineChart 
                  data={analytics.retentionData}
                  videoDuration={videoData.duration}
                  granularity={timeRange.granularity}
                  totalViews={analytics.totalViews}
                />
              </CardContent>
            </Card>
          )}

          {/* Viewer Breakdown Charts */}
          {viewerAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Dados de Visualizadores</CardTitle>
              </CardHeader>
              <CardContent>
                <ViewerBreakdownCharts data={viewerAnalytics} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoAnalyticsPage; 