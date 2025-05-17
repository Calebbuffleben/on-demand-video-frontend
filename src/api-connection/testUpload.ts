import axios from 'axios';

/**
 * Helper functions for testing direct file uploads without authentication
 */
const testUploadService = {
  /**
   * Upload a file directly to the test-upload endpoint
   * @param file The file to upload
   * @param organizationId The organization ID for the upload
   * @param onUploadProgress Optional callback for upload progress
   */
  uploadFileToTestEndpoint: async (
    file: File,
    organizationId: string = '659b9a2c-4f58-4590-bc18-d2d1385b0fb0', // Default test organization ID
    onUploadProgress?: (progress: number) => void
  ): Promise<any> => {
    try {
      if (!file) {
        throw new Error('File is required');
      }

      console.log('Starting test upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        organizationId
      });

      // Use query parameters for organization ID and send raw file
      // This approach sometimes works better with certain API configurations
      const response = await axios.post(
        `http://localhost:4000/api/videos/test-upload?organizationId=${encodeURIComponent(organizationId)}&name=${encodeURIComponent(file.name)}`,
        file,
        {
          headers: {
            'Content-Type': file.type,
            'X-Organization-ID': organizationId, // Also try in custom header
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
        }
      );

      console.log('Test upload completed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in test upload:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Upload timed out. Please try again with a smaller file or better internet connection.');
        } else if (error.code === 'ERR_NETWORK') {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else if (error.response) {
          console.error('Error response:', error.response.data);
          throw new Error(`Upload failed: ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error(`No response received from server: ${error.message}`);
        }
      }
      
      throw error;
    }
  },

  /**
   * Alternative method to upload a file using FormData
   */
  uploadFileWithFormData: async (
    file: File,
    organizationId: string = '659b9a2c-4f58-4590-bc18-d2d1385b0fb0',
    onUploadProgress?: (progress: number) => void
  ): Promise<any> => {
    try {
      if (!file) {
        throw new Error('File is required');
      }

      console.log('Starting form data upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        organizationId
      });

      // Create FormData to include both file and metadata
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', organizationId);
      formData.append('name', file.name);
      formData.append('description', 'Test upload');

      const response = await axios.post(
        'http://localhost:4000/api/videos/test-upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onUploadProgress) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onUploadProgress(progress);
              console.log(`Upload progress: ${progress}%`);
            }
          },
        }
      );

      console.log('Form data upload completed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in form data upload:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Error response:', error.response.data);
          throw new Error(`Upload failed: ${error.response.status} - ${error.response.data?.message || error.message}`);
        }
      }
      
      throw error;
    }
  }
};

export default testUploadService; 