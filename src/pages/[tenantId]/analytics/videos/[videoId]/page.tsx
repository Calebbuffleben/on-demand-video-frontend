'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/api-connection/service';
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

export default function VideoAnalyticsPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  const tenantId = params.tenantId as string;
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<{ success: boolean; data: VideoAnalytics }>(`analytics/videos/${videoId}`);
        if (response.data.success) {
          setAnalytics(response.data.data);
        } else {
          setError('Failed to load video analytics');
        }
      } catch (err) {
        setError('Failed to load video analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId, tenantId]);

  if (loading) {
    return <VideoAnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Video Analytics</h1>

      {/* Overview Stats */}
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
          value={`${(analytics.engagementRate * 100).toFixed(1)}%`}
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
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value: string) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value: string) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [formatNumber(value), 'Views']}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Retention Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Audience Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(value: number) => `${value}s`}
                />
                <YAxis
                  tickFormatter={(value: number) => `${value}%`}
                />
                <Tooltip
                  labelFormatter={(value: number) => `${value}s`}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retention']}
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
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
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value: string) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value: string) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [formatNumber(value), 'Active Viewers']}
                />
                <Line
                  type="monotone"
                  dataKey="activeViewers"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
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