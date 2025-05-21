import api from '../api';
import axios from 'axios';

export interface DisplayOptions {
  showProgressBar: boolean;
  showTitle: boolean;
  showPlaybackControls: boolean;
  autoPlay: boolean;
  muted: boolean;
  loop: boolean;
  useOriginalProgressBar: boolean;
  progressBarColor: string;
  progressEasing: number;
  playButtonColor?: string;
  playButtonSize?: number;
  playButtonBgColor?: string;
}

export interface EmbedOptions {
  showVideoTitle: boolean;
  showUploadDate: boolean;
  showMetadata: boolean;
  allowFullscreen: boolean;
  responsive: boolean;
  showBranding: boolean;
  showTechnicalInfo: boolean;
}

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
    displayOptions?: DisplayOptions;
    embedOptions?: EmbedOptions;
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
  status: number;
  message: string;
  readyToStream: boolean;
  video: {
    uid: string;
    readyToStream: boolean;
    thumbnail?: string;
    playback?: {
      hls?: string;
      dash?: string;
    };
    created?: string;
    duration?: number;
    status?: {
      state: string;
      pctComplete?: string;
      errorReasonCode?: string;
      errorReasonText?: string;
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
   * @param organizationId The organization ID for the upload
   */
  getUploadUrl: async (maxDurationSeconds: number = 3600, organizationId: string): Promise<UploadUrlResponse> => {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }
      
      console.log('Requesting upload URL with params:', {
        maxDurationSeconds,
        organizationId
      });
      
      const response = await api.post<{ success: boolean; status: number; message: string; data: UploadUrlResponse }>('videos/get-upload-url', {
        maxDurationSeconds,
        organizationId,
        name: 'Uploaded video',
        description: 'Uploaded through the web interface'
      });
      console.log('Upload URL response:', response.data);
      
      if (!response.data.success) {
        console.error('Failed to get upload URL:', response.data);
        throw new Error(response.data.message || 'Failed to get upload URL');
      }

      if (!response.data.data?.uploadURL || !response.data.data?.uid) {
        console.error('Invalid upload URL response:', response.data);
        throw new Error('Invalid upload URL response from server');
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
      if (!uploadURL) {
        throw new Error('Upload URL is required');
      }

      if (!file) {
        throw new Error('File is required');
      }

      console.log('Starting video upload to Mux:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadURL: uploadURL
      });

      // For Mux, we need to send the file directly without FormData
      await axios.put(uploadURL, file, {
        headers: {
          'Content-Type': file.type,
        },
        // Set a longer timeout for large file uploads (5 minutes)
        timeout: 300000,
        // Increase max content length to handle large files
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(progress);
            console.log(`Upload progress: ${progress}%`);
          }
        },
      });

      console.log('Video upload completed successfully');
    } catch (error) {
      console.error('Error uploading video file:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Upload timed out. Please try again with a smaller file or better internet connection.');
        } else if (error.code === 'ERR_NETWORK') {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else if (error.response) {
          throw new Error(`Upload failed: ${error.response.status} - ${error.response.data?.message || error.message}`);
        }
      }
      
      throw error;
    }
  },

  /**
   * Check the status of an uploaded video
   * @param videoId The video ID/UID
   */
  checkVideoStatus: async (videoId: string): Promise<VideoStatusResponse> => {
    try {
      if (!videoId) {
        throw new Error('Video ID is required');
      }

      console.log('Checking video status for ID:', videoId);
      
      const response = await api.get<VideoStatusResponse>(`videos/${videoId}/status`);
      console.log('Raw status response:', response.data);
      
      // Ensure we have a valid response structure
      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      // If the response doesn't have a video object, create a basic one
      if (!response.data.video) {
        console.warn('No video data in response, creating basic structure');
        response.data.video = {
          uid: videoId,
          readyToStream: false,
          status: {
            state: 'processing'
          }
        };
      }

      // Ensure the video object has the required fields
      if (!response.data.video.uid) {
        response.data.video.uid = videoId;
      }

      if (response.data.video.readyToStream === undefined) {
        response.data.video.readyToStream = false;
      }

      if (!response.data.video.status) {
        response.data.video.status = {
          state: 'processing'
        };
      }

      console.log('Processed status response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error checking status for video ${videoId}:`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid video ID or the video does not exist');
        } else if (error.response?.status === 404) {
          throw new Error('Video not found');
        } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          throw new Error('Network Error: Cannot connect to the video API server. Please ensure the backend server is running.');
        } else if (error.response) {
          throw new Error(`API Error (${error.response.status}): ${error.response.data?.message || error.message}`);
        }
      }
      
      throw error;
    }
  },

  /**
   * Update video display and embed options
   * @param uid The video's unique identifier
   * @param displayOptions The display options for the video player
   * @param embedOptions The embed options for the video
   */
  updateVideoOptions: async (
    uid: string,
    displayOptions: DisplayOptions,
    embedOptions: EmbedOptions
  ): Promise<VideoApiResponse> => {
    try {
      // Make a copy to avoid modifying original objects
      const formattedDisplayOptions = { ...displayOptions };
      const formattedEmbedOptions = { ...embedOptions };
      
      // Ensure color values have # prefix
      if (formattedDisplayOptions.progressBarColor && !formattedDisplayOptions.progressBarColor.startsWith('#')) {
        formattedDisplayOptions.progressBarColor = '#' + formattedDisplayOptions.progressBarColor;
      }
      
      if (formattedDisplayOptions.playButtonColor && !formattedDisplayOptions.playButtonColor.startsWith('#')) {
        formattedDisplayOptions.playButtonColor = '#' + formattedDisplayOptions.playButtonColor;
      }
      
      if (formattedDisplayOptions.playButtonBgColor && !formattedDisplayOptions.playButtonBgColor.startsWith('#')) {
        formattedDisplayOptions.playButtonBgColor = '#' + formattedDisplayOptions.playButtonBgColor;
      }
      
      // Ensure numeric values are actually numbers
      if (typeof formattedDisplayOptions.progressEasing === 'string') {
        formattedDisplayOptions.progressEasing = parseFloat(formattedDisplayOptions.progressEasing);
      }
      
      if (typeof formattedDisplayOptions.playButtonSize === 'string') {
        formattedDisplayOptions.playButtonSize = parseInt(formattedDisplayOptions.playButtonSize, 10);
      }
      
      // Ensure boolean values are actually booleans
      const booleanFields = [
        'showProgressBar', 'showTitle', 'showPlaybackControls', 
        'autoPlay', 'muted', 'loop', 'useOriginalProgressBar'
      ] as const;
      
      booleanFields.forEach(field => {
        if (field in formattedDisplayOptions) {
          formattedDisplayOptions[field] = 
            !!formattedDisplayOptions[field];
        }
      });
      
      const embedBooleanFields = [
        'showVideoTitle', 'showUploadDate', 'showMetadata',
        'allowFullscreen', 'responsive', 'showBranding', 'showTechnicalInfo'
      ] as const;
      
      embedBooleanFields.forEach(field => {
        if (field in formattedEmbedOptions) {
          formattedEmbedOptions[field] = 
            !!formattedEmbedOptions[field];
        }
      });
      
      console.log('Updating video options:', {
        uid,
        displayOptions: formattedDisplayOptions,
        embedOptions: formattedEmbedOptions
      });
      
      const response = await api.put<VideoApiResponse>(`videos/organization/${uid}`, {
        displayOptions: formattedDisplayOptions,
        embedOptions: formattedEmbedOptions
      });
      
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating video options for UID ${uid}:`, error);
      
      if (axios.isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
        
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
   * Get video details for embed page (uses backend's embed endpoint)
   * @param videoId The video's unique identifier
   */
  getVideoForEmbed: async (videoId: string): Promise<any> => {
    try {
      const response = await api.get(`/videos/embed/${videoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching embed video for ID ${videoId}:`, error);
      throw error;
    }
  },
};

export default videoService; 