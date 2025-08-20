import api from './service';
import axios from 'axios';

export interface TimeRange {
  startDate?: string;
  endDate?: string;
  startTimeOfDay?: string;
  endTimeOfDay?: string;
  timezone?: string;
  granularity?: number;
}

export interface PlatformStats {
  totalVideos: number;
  totalViews: number;
  totalStorage: string;
  totalBandwidth: string;
}

export interface RecentUpload {
  id: string;
  title: string;
  thumbnailUrl: string;
  uploadDate: string;
  size: string;
  duration: string;
}

export interface PopularVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  views: number;
  duration: string;
}

export interface VideoAnalytics {
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

export interface VideoRetentionData {
  videoId: string;
  title: string;
  retention: RetentionDataPoint[];
  totalViews: number;
  averageWatchTime: number;
}

export interface RetentionDataPoint {
  time: number;
  retention: number;
}

export interface ViewerTimeline {
  timestamp: string;
  activeViewers: number;
}

export interface DeviceBreakdown {
  device: string;
  category: string;
  manufacturer: string;
  views: number;
  percentage: number;
}

export interface BrowserBreakdown {
  browser: string;
  version: string;
  views: number;
  percentage: number;
}

export interface LocationBreakdown {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  views: number;
  percentage: number;
}

export interface OSBreakdown {
  os: string;
  version: string;
  views: number;
  percentage: number;
}

export interface ConnectionBreakdown {
  connectionType: string;
  views: number;
  percentage: number;
}

export interface ViewerAnalytics {
  devices: DeviceBreakdown[];
  browsers: BrowserBreakdown[];
  locations: LocationBreakdown[];
  operatingSystems: OSBreakdown[];
  connections: ConnectionBreakdown[];
  totalViews: number;
}

export interface AnalyticsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    platformStats: PlatformStats;
    recentUploads: RecentUpload[];
    popularVideos: PopularVideo[];
  };
  error?: {
    message: string;
    statusCode: number;
  };
}

// Default mock data as fallback
const defaultMockData = {
  platformStats: {
    totalVideos: 0,
    totalViews: 0,
    totalStorage: '0 GB',
    totalBandwidth: '0 GB'
  },
  recentUploads: [] as RecentUpload[],
  popularVideos: [] as PopularVideo[]
};

const analyticsService = {
  /**
   * Send player event to backend
   */
  sendEvent: async (payload: {
    videoId: string;
    eventType: 'play' | 'pause' | 'ended' | 'timeupdate';
    currentTime?: number;
    duration?: number;
    userId?: string;
    sessionId?: string;
    clientId?: string;
    organizationId?: string;
  }) => {
    try {
      await api.post('analytics/events', payload);
    } catch (e) {
      // Best-effort; do not throw
      console.warn('analytics sendEvent failed', e);
    }
  },
  /**
   * Get all dashboard analytics in a single request
   */
  getDashboardAnalytics: async (timeRange?: TimeRange): Promise<AnalyticsResponse> => {
    try {
      // Log the API request for debugging
      console.log('Fetching dashboard analytics from:', api.defaults.baseURL + '/analytics/dashboard');
      
      const response = await api.get<AnalyticsResponse>('analytics/dashboard', {
        params: timeRange
      });
      console.log('Successfully received dashboard analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      
      // Detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          baseURL: api.defaults.baseURL
        });
      }

      // Return a structured error response instead of throwing
      return {
        success: false,
        status: axios.isAxiosError(error) ? error.response?.status || 500 : 500,
        message: axios.isAxiosError(error) ? 
          `API Error: ${error.response?.data?.message || error.message}` : 
          'Erro desconhecido ao buscar análises',
        data: defaultMockData,
        error: {
          message: axios.isAxiosError(error) ? 
            error.response?.data?.message || error.message : 
            'Erro desconhecido',
          statusCode: axios.isAxiosError(error) ? error.response?.status || 500 : 500
        }
      };
    }
  },

  /**
   * Get platform overview statistics
   */
  getPlatformStats: async (timeRange?: TimeRange): Promise<PlatformStats> => {
    try {
      const response = await api.get<{ success: boolean; data: PlatformStats }>('analytics/platform-stats', {
        params: timeRange
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Return default values instead of throwing
      return defaultMockData.platformStats;
    }
  },

  /**
   * Get recent uploads
   */
  getRecentUploads: async (limit: number = 5, timeRange?: TimeRange): Promise<RecentUpload[]> => {
    try {
      const response = await api.get<{ success: boolean; data: RecentUpload[] }>(`analytics/recent-uploads`, {
        params: { limit, ...timeRange }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent uploads:', error);
      // Return empty array instead of throwing
      return [];
    }
  },

  /**
   * Get popular videos
   */
  getPopularVideos: async (limit: number = 3, timeRange?: TimeRange): Promise<PopularVideo[]> => {
    try {
      const response = await api.get<{ success: boolean; data: PopularVideo[] }>(`analytics/popular-videos`, {
        params: { limit, ...timeRange }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching popular videos:', error);
      // Return empty array instead of throwing
      return [];
    }
  },

  /**
   * Get detailed analytics for a specific video
   */
  getVideoAnalytics: async (videoId: string, timeRange?: TimeRange): Promise<{ success: boolean; data: VideoAnalytics }> => {
    try {
      const response = await api.get<{ success: boolean; data: VideoAnalytics }>(`analytics/videos/${videoId}`, {
        params: timeRange
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for video ${videoId}:`, error);
      throw error;
    }
  },

  /**
   * Get retention data for a specific video
   */
  getVideoRetention: async (videoId: string, timeRange?: TimeRange): Promise<{ success: boolean; data: RetentionDataPoint[] }> => {
    try {
      const response = await api.get<{ success: boolean; data: RetentionDataPoint[] }>(`analytics/retention/${videoId}`, {
        params: timeRange
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching retention data for video ${videoId}:`, error);
      throw error;
    }
  },

  /**
   * Get viewer timeline data for a specific video
   */
  getVideoViews: async (videoId: string, timeRange?: TimeRange): Promise<{ success: boolean; data: ViewerTimeline[] }> => {
    try {
      const response = await api.get<{ success: boolean; data: ViewerTimeline[] }>(`analytics/views/${videoId}`, {
        params: timeRange
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching viewer timeline for video ${videoId}:`, error);
      throw error;
    }
  },

  /**
   * Get viewer analytics breakdown (devices, browsers, locations)
   */
  getViewerAnalytics: async (videoId: string, timeRange?: TimeRange): Promise<{ success: boolean; data: ViewerAnalytics }> => {
    try {
      const response = await api.get<{ success: boolean; data: ViewerAnalytics }>(`analytics/videos/${videoId}/viewer-analytics`, {
        params: timeRange
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching viewer analytics for video ${videoId}:`, error);
      // Return default empty data instead of throwing
      return {
        success: false,
        data: {
          devices: [],
          browsers: [],
          locations: [],
          operatingSystems: [],
          connections: [],
          totalViews: 0
        }
      };
    }
  },

  /**
   * Get retention data for all videos in the organization
   */
  getOrganizationRetention: async (timeRange?: TimeRange): Promise<{ success: boolean; data: VideoRetentionData[] }> => {
    try {
      const response = await api.get<{ success: boolean; data: VideoRetentionData[] }>('analytics/organization/retention', {
        params: timeRange
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching organization retention data:', error);
      throw error;
    }
  }
};

export default analyticsService; 