import React, { useState, useEffect } from 'react';
import analyticsService from '../../api-connection/analytics';
import videoService, { VideoData } from '../../api-connection/videos';

interface RetentionDataPoint {
  time: number;
  retention: number;
}

interface VideoRetentionData {
  videoId: string;
  title: string;
  retention: RetentionDataPoint[];
  totalViews: number;
  averageWatchTime: number;
}

interface VideoRetentionChartProps {
  className?: string;
}

// TODO: Backend needs this endpoint: GET /api/analytics/organization/retention
// This would return retention data for ALL videos in the organization at once
// Current approach calls getVideoRetention() for each video individually (inefficient)

const VideoRetentionChart: React.FC<VideoRetentionChartProps> = ({ className = '' }) => {
  const [retentionData, setRetentionData] = useState<VideoRetentionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    loadRetentionData();
  }, []);

  // Generate mock retention data for a video
  const generateMockRetention = (videoDuration: number): RetentionDataPoint[] => {
    const retentionPoints: RetentionDataPoint[] = [];
    const maxRetention = Math.random() * 40 + 60; // 60-100% max retention
    
    for (let second = 0; second <= videoDuration; second++) {
      // Create a realistic retention curve that drops over time
      const progress = second / videoDuration;
      const retention = Math.max(0, maxRetention * Math.exp(-progress * 1.5) + Math.random() * 10);
      
      retentionPoints.push({
        time: second,
        retention: Math.min(100, Math.max(0, retention)),
      });
    }
    
    return retentionPoints;
  };

  const loadRetentionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all videos for the organization
      const videosResponse = await videoService.getAllVideos();
      
      if (!videosResponse.success) {
        throw new Error('Failed to load videos');
      }

      // Generate mock retention data for each video
      const mockRetentionData: VideoRetentionData[] = videosResponse.data.result.map((video: VideoData) => {
        const duration = video.duration || 300; // Default to 5 minutes if no duration
        const mockViews = Math.floor(Math.random() * 1000) + 50; // 50-1050 views
        const mockWatchTime = Math.floor(duration * (Math.random() * 0.6 + 0.2)); // 20-80% of duration
        
        return {
          videoId: video.uid,
          title: video.meta?.name || 'Untitled Video',
          retention: generateMockRetention(duration),
          totalViews: mockViews,
          averageWatchTime: mockWatchTime,
        };
      });
      
      setRetentionData(mockRetentionData);
    } catch (err) {
      console.error('Error loading retention data:', err);
      setError('Failed to load retention data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAverageRetention = (retention: RetentionDataPoint[]): number => {
    if (retention.length === 0) return 0;
    const sum = retention.reduce((acc, point) => acc + point.retention, 0);
    return Math.round(sum / retention.length);
  };

  const getRetentionColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-silver-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-silver-200 rounded mb-4"></div>
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-4 bg-silver-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={loadRetentionData}
            className="mt-4 px-4 py-2 bg-scale-600 text-white rounded-lg hover:bg-scale-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (retentionData.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-silver-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">No retention data available</p>
          <p className="text-sm">Upload videos to see retention analytics</p>
        </div>
      </div>
    );
  }

  const selectedVideoData = selectedVideo 
    ? retentionData.find(video => video.videoId === selectedVideo)
    : retentionData[0];

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-silver-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-scale-900">Retenção de Vídeos</h3>
            <p className="text-sm text-silver-600 mt-1">Análise de retenção de todos os vídeos da organização</p>
            <p className="text-xs text-amber-600 mt-1">⚠️ Dados simulados - aguardando integração com analytics real</p>
          </div>
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-scale-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium text-scale-600">Analytics</span>
          </div>
        </div>
      </div>

      {/* Video Selector */}
      <div className="p-6 border-b border-silver-200">
        <label className="block text-sm font-medium text-scale-700 mb-2">Selecionar Vídeo</label>
        <select
          value={selectedVideo || retentionData[0]?.videoId || ''}
          onChange={(e) => setSelectedVideo(e.target.value)}
          className="w-full px-3 py-2 border border-silver-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-scale-500 focus:border-scale-500"
        >
          {retentionData.map((video) => (
            <option key={video.videoId} value={video.videoId}>
              {video.title} ({video.totalViews} views)
            </option>
          ))}
        </select>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        {selectedVideoData && (
          <div>
            {/* Video Info */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-scale-900 mb-2">{selectedVideoData.title}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-scale-900">{selectedVideoData.totalViews}</p>
                  <p className="text-sm text-silver-600">Total Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-scale-900">{formatTime(selectedVideoData.averageWatchTime)}</p>
                  <p className="text-sm text-silver-600">Avg. Watch Time</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${getRetentionColor(getAverageRetention(selectedVideoData.retention))}`}>
                    {getAverageRetention(selectedVideoData.retention)}%
                  </p>
                  <p className="text-sm text-silver-600">Avg. Retention</p>
                </div>
              </div>
            </div>

            {/* Retention Chart */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-scale-700 mb-3">Retention Curve</h5>
              <div className="h-64 bg-silver-50 rounded-lg p-4 relative">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={100 - y}
                      x2="100"
                      y2={100 - y}
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                    />
                  ))}
                  
                  {/* Retention curve */}
                  {selectedVideoData.retention.length > 0 && (
                    <polyline
                      points={selectedVideoData.retention
                        .map((point, index) => {
                          const x = (index / (selectedVideoData.retention.length - 1)) * 100;
                          const y = 100 - point.retention;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#171717"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  
                  {/* Area under curve */}
                  {selectedVideoData.retention.length > 0 && (
                    <polygon
                      points={`0,100 ${selectedVideoData.retention
                        .map((point, index) => {
                          const x = (index / (selectedVideoData.retention.length - 1)) * 100;
                          const y = 100 - point.retention;
                          return `${x},${y}`;
                        })
                        .join(' ')} 100,100`}
                      fill="url(#retentionGradient)"
                      opacity="0.1"
                    />
                  )}
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="retentionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#171717" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#171717" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Y-axis labels */}
                <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between text-xs text-silver-500">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
              </div>
            </div>

            {/* Retention Stats */}
            <div>
              <h5 className="text-sm font-medium text-scale-700 mb-3">Retention Breakdown</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '0-25%', data: selectedVideoData.retention.filter(p => p.retention <= 25).length },
                  { label: '25-50%', data: selectedVideoData.retention.filter(p => p.retention > 25 && p.retention <= 50).length },
                  { label: '50-75%', data: selectedVideoData.retention.filter(p => p.retention > 50 && p.retention <= 75).length },
                  { label: '75-100%', data: selectedVideoData.retention.filter(p => p.retention > 75).length },
                ].map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-silver-50 rounded-lg">
                    <p className="text-lg font-semibold text-scale-900">{stat.data}</p>
                    <p className="text-xs text-silver-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRetentionChart; 