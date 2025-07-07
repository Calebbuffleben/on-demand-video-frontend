import api from './service';
import axios from 'axios';

export interface DisplayOptions {
  showProgressBar?: boolean;
  showTitle?: boolean;
  showPlaybackControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  useOriginalProgressBar?: boolean;
  progressBarColor?: string;
  progressEasing?: number;
  playButtonColor?: string;
  playButtonSize?: number;
  playButtonBgColor?: string;
  soundControlText?: string;
  soundControlColor?: string;
  soundControlOpacity?: number;
  soundControlSize?: number;
  showSoundControl?: boolean;
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
  readyToStreamAt?: string;
  status: {
    state: string;
    pctComplete?: string;
    errorReasonCode?: string;
    errorReasonText?: string;
  };
  meta: {
    filename?: string;
    filetype?: string;
    name: string;
    relativePath?: string;
    type?: string;
    displayOptions?: DisplayOptions;
    embedOptions?: EmbedOptions;
  };
  duration: number;
  created: string;
  modified: string;
  size: number;
  input?: {
    width: number;
    height: number;
  };
  playback: {
    hls: string;
    dash: string;
  };
  ctaText?: string;
  ctaButtonText?: string;
  ctaLink?: string;
  ctaStartTime?: number;
  ctaEndTime?: number;
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

export interface StreamTextUpdate {
  uid: string;
  text: string;
}

export interface SoundControlUpdate {
  id: string;
  text: string;
  size?: number;
  color?: string;
  opacity?: number;
}

export interface EmbedVideoResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    video: VideoData;
    embedCode: string;
  };
}

const videoService = {
  /**
   * Get a list of all videos for the current organization
   */
  getAllVideos: async (): Promise<VideoApiResponse> => {
    try {
      const response = await api.get<VideoApiResponse>('videos/organization');
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
        throw new Error('Id da organização é obrigatório');
      }
      
      console.log('Requisição de URL de Upload com parâmetros:', {
        maxDurationSeconds,
        organizationId
      });
      
      const response = await api.post<{ success: boolean; status: number; message: string; data: UploadUrlResponse }>('videos/get-upload-url', {
        maxDurationSeconds,
        organizationId,
        name: 'Vídeo Enviado',
        description: 'Enviado através da interface web'
      });
      console.log('URL de Upload:', response.data);
      
      if (!response.data.success) {
        console.error('Falha ao obter URL de Upload:', response.data);
        throw new Error(response.data.message || 'Falha ao obter URL de Upload');
      }

      if (!response.data.data?.uploadURL || !response.data.data?.uid) {
        console.error('URL de Upload inválida:', response.data);
        throw new Error('URL de Upload inválida');
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
   * 
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
        throw new Error('URL de Upload é obrigatória');
      }

      if (!file) {
        throw new Error('Arquivo é obrigatório');
      }

      console.log('Iniciando upload de vídeo para Mux:', {
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
        throw new Error('Id do vídeo é obrigatório');
      }
      
      const response = await api.get<VideoStatusResponse>(`videos/${videoId}/status`);
      
      // Ensure we have a valid response structure
      if (!response.data) {
        console.warn('[VideoService] No data in response');
        throw new Error('Invalid response from server');
      }

      // If the response doesn't have a video object, create a basic one
      if (!response.data.video) {
        console.warn('[VideoService] No video data in response, creating basic structure');
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
      return response.data;
    } catch (error) {
      console.error(`[VideoService] Error checking status for video ${videoId}:`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('ID do vídeo inválido');
        } else if (error.response?.status === 404) {
          throw new Error('Vídeo não encontrado');
        } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          throw new Error('Erro de Rede: Não é possível conectar ao servidor da API de vídeo. Certifique-se de que o servidor backend está em execução.');
        } else if (error.response) {
          throw new Error(`Erro da API (${error.response.status}): ${error.response.data?.message || error.message}`);
        }
      }
      throw error;
    }
  },

  /**
   * Update video display and embed options
   * @param uid The video's unique identifier
   * @param displayOptions The display options to update
   * @param embedOptions The embed options to update
   * @param ctaFields The CTA fields to update
   */
  updateVideoOptions: async (
    uid: string,
    displayOptions: DisplayOptions,
    embedOptions: EmbedOptions,
    ctaFields?: {
      ctaText?: string;
      ctaButtonText?: string;
      ctaLink?: string;
      ctaStartTime?: number;
      ctaEndTime?: number;
    }
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

      if (formattedDisplayOptions.soundControlColor && !formattedDisplayOptions.soundControlColor.startsWith('#')) {
        formattedDisplayOptions.soundControlColor = '#' + formattedDisplayOptions.soundControlColor;
      }
      
      // Ensure numeric values are actually numbers
      if (typeof formattedDisplayOptions.progressEasing === 'string') {
        formattedDisplayOptions.progressEasing = parseFloat(formattedDisplayOptions.progressEasing);
      }
      
      if (typeof formattedDisplayOptions.playButtonSize === 'string') {
        formattedDisplayOptions.playButtonSize = parseInt(formattedDisplayOptions.playButtonSize, 10);
      }

      if (typeof formattedDisplayOptions.soundControlSize === 'string') {
        formattedDisplayOptions.soundControlSize = parseInt(formattedDisplayOptions.soundControlSize, 10);
      }

      if (typeof formattedDisplayOptions.soundControlOpacity === 'string') {
        formattedDisplayOptions.soundControlOpacity = parseFloat(formattedDisplayOptions.soundControlOpacity);
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
      
      const response = await api.put<VideoApiResponse>(`videos/organization/${uid}`, {
        displayOptions: formattedDisplayOptions,
        embedOptions: formattedEmbedOptions,
        ctaText: ctaFields?.ctaText,
        ctaButtonText: ctaFields?.ctaButtonText,
        ctaLink: ctaFields?.ctaLink,
        ctaStartTime: ctaFields?.ctaStartTime,
        ctaEndTime: ctaFields?.ctaEndTime,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating video options:', error);
      throw error;
    }
  },

  /**
   * Get video details for embed page (uses backend's embed endpoint)
   * @param videoId The video's unique identifier
   */
  getVideoForEmbed: async (videoId: string): Promise<EmbedVideoResponse> => {
    try {
      const response = await api.get<EmbedVideoResponse>(`/videos/embed/${videoId}`);

      return response.data;
    } catch (error) {
      console.error(`Error fetching embed video for ID ${videoId}:`, error);
      throw error;
    }
  },

  /**
   * Upload a cover image for a video
   * @param videoId The video's unique identifier
   * @param coverFile The cover image file
   */
  uploadCover: async (videoId: string, coverFile: File): Promise<VideoApiResponse> => {
    try {
      const formData = new FormData();
      formData.append('cover', coverFile);

      const response = await api.post<VideoApiResponse>(`videos/${videoId}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading video cover:', error);
      throw error;
    }
  },

  /**
   * Clear the thumbnail for a video
   * @param uid The video's unique identifier
   */
  clearThumbnail: async (uid: string): Promise<void> => {
    try {
      await api.delete(`videos/${uid}/cover`);
    } catch (error) {
      console.error('Error clearing video thumbnail:', error);
      throw error;
    }
  },

  /**
   * Update the text overlay for a video
   * @param uid The video's unique identifier
   * @param text The new text to display
   */
  updateStreamText: async ({ uid, text }: StreamTextUpdate): Promise<VideoApiResponse> => {
    try {  
      const response = await api.patch<VideoApiResponse>(`videos/${uid}/text`, { text });
    
      return response.data;
    } catch (error) {
      console.error(`Error updating text for video ${uid}:`, error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('ID do vídeo ou dados de texto inválidos');
        } else if (error.response?.status === 404) {
          throw new Error('Vídeo não encontrado');
        } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          throw new Error('Erro de Rede: Não é possível conectar ao servidor da API de vídeo. Certifique-se de que o servidor backend está em execução.');
        } else if (error.response) {
          throw new Error(`Erro da API (${error.response.status}): ${error.response.data?.message || error.message}`);
        }
      }
      throw error;
    }
  },

  /**
   * Update the sound control settings for a video
   * @param id The video's unique identifier
   * @param text The text to display
   * @param size The size of the control
   * @param color The color of the control
   * @param opacity The opacity of the control
   */
  updateSoundControl: async ({ id, text, size, color, opacity }: SoundControlUpdate): Promise<VideoApiResponse> => {
    try {
      const response = await api.patch<VideoApiResponse>(`videos/${id}/sound-control`, {
        text,
        size,
        color: color?.startsWith('#') ? color : color ? `#${color}` : undefined,
        opacity: typeof opacity === 'number' ? Math.max(0, Math.min(1, opacity)) : undefined
      });
  
      return response.data;
    } catch (error) {
      console.error(`Error updating sound control for video ${id}:`, error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('ID do vídeo ou dados do controle de som inválidos');
        } else if (error.response?.status === 404) {
          throw new Error('Vídeo não encontrado');
        } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          throw new Error('Erro de Rede: Não é possível conectar ao servidor da API de vídeo. Certifique-se de que o servidor backend está em execução.');
        } else if (error.response) {
          throw new Error(`Erro da API (${error.response.status}): ${error.response.data?.message || error.message}`);
        }
      }
      throw error;
    }
  },

  deleteVideo: async (videoId: string): Promise<void> => {
    try {
      await api.delete(`videos/organization/${videoId}`);
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
  
};

export default videoService; 