'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import analyticsService from '@/api-connection/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatDuration } from '@/lib/utils';

export default function AnalyticsPage() {
  const router = useRouter();
  const tenantId = router.query.tenantId as string;
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
          setError(response.message || 'Failed to load analytics data');
        }
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Videos"
          value={formatNumber(data.platformStats.totalVideos)}
        />
        <StatCard
          title="Total Views"
          value={formatNumber(data.platformStats.totalViews)}
        />
        <StatCard
          title="Total Storage"
          value={data.platformStats.totalStorage}
        />
        <StatCard
          title="Total Bandwidth"
          value={data.platformStats.totalBandwidth}
        />
      </div>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recentUploads.map((upload) => (
              <VideoCard
                key={upload.id}
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
          <CardTitle>Popular Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.popularVideos.map((video) => (
              <VideoCard
                key={video.id}
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

function VideoCard({
  title,
  thumbnailUrl,
  views,
  date,
  duration,
  size,
}: {
  title: string;
  thumbnailUrl: string;
  views?: number;
  date?: Date;
  duration?: string;
  size?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={thumbnailUrl}
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{title}</h3>
        <div className="text-sm text-gray-500 mt-2">
          {views !== undefined && <div>{formatNumber(views)} views</div>}
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
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-8 w-48 mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  );
}

function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
} 