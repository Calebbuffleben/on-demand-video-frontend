import api from '../api';
import axios from 'axios';

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
   * Get all dashboard analytics in a single request
   */
  getDashboardAnalytics: async (): Promise<AnalyticsResponse> => {
    try {
      // Log the API request for debugging
      console.log('Fetching dashboard analytics from:', api.defaults.baseURL + '/analytics/dashboard');
      
      const response = await api.get<AnalyticsResponse>('analytics/dashboard');
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
          'Unknown error fetching analytics',
        data: defaultMockData,
        error: {
          message: axios.isAxiosError(error) ? 
            error.response?.data?.message || error.message : 
            'Unknown error',
          statusCode: axios.isAxiosError(error) ? error.response?.status || 500 : 500
        }
      };
    }
  },

  /**
   * Get platform overview statistics
   */
  getPlatformStats: async (): Promise<PlatformStats> => {
    try {
      const response = await api.get<{ success: boolean; data: PlatformStats }>('analytics/platform-stats');
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
  getRecentUploads: async (limit: number = 5): Promise<RecentUpload[]> => {
    try {
      const response = await api.get<{ success: boolean; data: RecentUpload[] }>(`analytics/recent-uploads?limit=${limit}`);
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
  getPopularVideos: async (limit: number = 3): Promise<PopularVideo[]> => {
    try {
      const response = await api.get<{ success: boolean; data: PopularVideo[] }>(`analytics/popular-videos?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching popular videos:', error);
      // Return empty array instead of throwing
      return [];
    }
  }
};

export default analyticsService; 