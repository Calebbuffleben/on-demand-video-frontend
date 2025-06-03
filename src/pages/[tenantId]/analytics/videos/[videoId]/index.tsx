'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatDuration } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface VideoAnalytics {
  totalViews: number;
  averageWatchTime: number;
  engagementRate: number;
  uniqueViewers: number;
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;
  retentionData: Array<{
    timestamp: number;
    viewers: number;
    percentage: number;
  }>;
  viewerTimeline: Array<{
    timestamp: string;
    duration: number;
    percentage: number;
  }>;
}

export default function VideoAnalyticsPage() {
  const router = useRouter();
  const { get, loading: apiLoading, error: apiError } = useApi();
  const videoId = router.query.videoId as string;
  const tenantId = router.query.tenantId as string;
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!videoId || !tenantId) return; // Don't fetch if parameters are not available yet
      
      try {
        console.log('Fetching analytics for video:', videoId);
        const response = await get<{ success: boolean; data: VideoAnalytics }>(`analytics/videos/${videoId}`);
        
        if (response?.success) {
          setAnalytics(response.data);
        } else {
          setError('Failed to load video analytics');
        }
      } catch (err: any) {
        console.error('Analytics fetch error:', err);
        setError(err.message || 'Failed to load video analytics');
      }
    };

    fetchAnalytics();
  }, [videoId, tenantId, get]);

  if (apiLoading) {
    return <VideoAnalyticsSkeleton />;
  }

  if (apiError || error) {
    return (
      <div className="p-4 text-red-500">
        {apiError?.message || error}
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Video Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Views"
          value={formatNumber(analytics.totalViews)}
        />
        <StatCard
          title="Average Watch Time"
          value={formatDuration(analytics.averageWatchTime)}
        />
        <StatCard
          title="Engagement Rate"
          value={`${analytics.engagementRate.toFixed(1)}%`}
        />
        <StatCard
          title="Unique Viewers"
          value={formatNumber(analytics.uniqueViewers)}
        />
      </div>

      {/* Views Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Audience Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Audience Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Viewer Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Viewer Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.viewerTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function VideoAnalyticsSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-8 w-48 mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-[300px]" />
      ))}
    </div>
  );
} 