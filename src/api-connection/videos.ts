import api from '../api';
import axios from 'axios';

export interface VideoData {
  uid: string;
  thumbnail: string;
  preview: string;
  readyToStream: boolean;
  readyToStreamAt: string;
  status: {
    state: string;
    pctComplete: string;
    errorReasonCode: string;
    errorReasonText: string;
  };
  meta: {
    filename: string;
    filetype: string;
    name: string;
    relativePath: string;
    type: string;
  };
  duration: number;
  created: string;
  modified: string;
  size: number;
  input: {
    width: number;
    height: number;
  };
  playback: {
    hls: string;
    dash: string;
  };
}

export interface VideoApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    result: VideoData[];
  };
}

export interface UploadUrlResponse {
  uploadURL: string;
  uid: string;
}

export interface VideoStatusResponse {
  success: boolean;
  readyToStream: boolean;
  status: string;
  video: {
    uid: string;
    readyToStream: boolean;
    thumbnail: string;
    playback: {
      hls: string;
      dash: string;
    };
    created: string;
    duration: number;
    status: {
      state: string;
    };
  };
}

const videoService = {
  /**
   * Test Cloudflare connection and get a sample video
   */
  testCloudflareConnection: async (): Promise<VideoApiResponse> => {
    try {
      const response = await api.get<VideoApiResponse>('videos/test-cloudflare-connection');
      return response.data;
    } catch (error) {
      console.error('Error testing Cloudflare connection:', error);
      // Handle common errors with better messages
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          throw new Error('Network Error: Cannot connect to the video API server. Please ensure the backend server is running.');
        } else if (error.response) {
          throw new Error(`API Error (${error.response.status}): ${error.response.data?.message || error.message}`);
        }
      }
      throw error;
    }
  },

  /**
   * Get a list of all videos
   */
  getAllVideos: async (): Promise<VideoApiResponse> => {
    try {
      const response = await api.get<VideoApiResponse>('videos');
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  /**
   * Get a single video by its UID
   * @param uid The video's unique identifier
   */
  getVideoByUid: async (uid: string): Promise<VideoApiResponse> => {
    try {
      const response = await api.get<VideoApiResponse>(`videos/${uid}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching video with UID ${uid}:`, error);
      throw error;
    }
  },

  /**
   * Get a one-time upload URL for direct creator uploads
   * @param maxDurationSeconds The maximum duration for the video in seconds
   */
  getUploadUrl: async (maxDurationSeconds: number = 3600): Promise<UploadUrlResponse> => {
    try {
      console.log('Requesting upload URL with maxDurationSeconds:', maxDurationSeconds);
      const response = await api.post<{ success: boolean; status: number; message: string; data: UploadUrlResponse }>('videos/get-upload-url', {
        maxDurationSeconds,
      });
      console.log('Upload URL response:', response.data);
      
      if (!response.data.success || !response.data.data.uploadURL) {
        throw new Error(response.data.message || 'Failed to get upload URL');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error getting upload URL:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          console.error('Network error details:', {
            url: error.config?.url,
            baseURL: api.defaults.baseURL,
            message: error.message
          });
          throw new Error('Network Error: Cannot connect to the video API server. Please ensure the backend server is running.');
        } else if (error.response) {
          console.error('API error details:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          });
          throw new Error(`API Error (${error.response.status}): ${error.response.data?.message || error.message}`);
        }
      }
      throw error;
    }
  },

  /**
   * Upload a video file to Cloudflare Stream using a one-time upload URL
   * @param uploadURL The one-time upload URL from getUploadUrl
   * @param file The video file to upload
   * @param onUploadProgress Optional callback for upload progress
   */
  uploadVideoFile: async (
    uploadURL: string, 
    file: File, 
    onUploadProgress?: (progress: number) => void
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(uploadURL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(progress);
          }
        },
      });
    } catch (error) {
      console.error('Error uploading video file:', error);
      throw error;
    }
  },

  /**
   * Check the status of an uploaded video
   * @param videoId The video ID/UID
   */
  checkVideoStatus: async (videoId: string): Promise<VideoStatusResponse> => {
    try {
      const response = await api.get<VideoStatusResponse>(`videos/status/${videoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error checking status for video ${videoId}:`, error);
      throw error;
    }
  }
};

export default videoService; 