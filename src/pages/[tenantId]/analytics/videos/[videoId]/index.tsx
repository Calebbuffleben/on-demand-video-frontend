'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import analyticsService from '@/api-connection/analytics';
import videoService from '@/api-connection/videos';
import ViewerTimelineChart from '@/components/analytics/ViewerTimelineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatDuration } from '@/lib/utils';

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
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId || !videoId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch video data and analytics in parallel
        const [videoResponse, analyticsResponse] = await Promise.all([
          videoService.getVideoByUid(videoId as string),
          analyticsService.getVideoAnalytics(videoId as string)
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
          setError('Failed to fetch analytics data');
        }
      } catch (err) {
        setError('Error loading data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId, videoId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics || !videoData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        {/* Video Info */}
        <Card>
          <CardHeader>
            <CardTitle>Video Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <img
                src={videoData.thumbnail}
                alt={videoData.meta.name}
                className="w-48 h-27 object-cover rounded"
              />
              <div>
                <h2 className="text-xl font-semibold">{videoData.meta.name}</h2>
                <p className="text-gray-500">Duration: {formatDuration(videoData.duration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(analytics.totalViews)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Average Watch Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatDuration(analytics.averageWatchTime)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analytics.engagementRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Unique Viewers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(analytics.uniqueViewers)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Viewer Timeline Chart */}
        <ViewerTimelineChart
          data={analytics.retentionData}
          videoDuration={videoData.duration}
        />
      </div>
    </div>
  );
};

export default VideoAnalyticsPage; 