'use client'

import { useState, useRef, useCallback } from 'react';
import videoService, { UploadUrlResponse } from '@/api-connection/videos';

interface CloudflareVideoUploaderProps {
  maxDurationSeconds?: number;
  className?: string;
  onUploadSuccess?: (videoData: VideoUploadResponse) => void;
  onUploadError?: (error: Error) => void;
  onUploadProgress?: (progress: number) => void;
}

interface VideoUploadResponse {
  uid: string;
  thumbnail?: string;
  playback?: {
    hls: string;
    dash: string;
  };
  readyToStream?: boolean;
}

export default function CloudflareVideoUploader({
  maxDurationSeconds = 3600, // Default 1 hour
  className = '',
  onUploadSuccess,
  onUploadError,
  onUploadProgress,
}: CloudflareVideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setVideoFile(files[0]);
      setError(null);
    }
  };

  const uploadVideo = useCallback(async () => {
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Request a one-time upload URL from our backend using videoService
      const { uploadURL, uid } = await videoService.getUploadUrl(maxDurationSeconds);

      if (!uploadURL) {
        throw new Error('Failed to get upload URL');
      }

      // Step 2: Upload the video file to Cloudflare using videoService
      await videoService.uploadVideoFile(uploadURL, videoFile, (progress) => {
        setUploadProgress(progress);
        
        if (onUploadProgress) {
          onUploadProgress(progress);
        }
      });

      // Step 3: Return the video data for status polling
      const videoData: VideoUploadResponse = {
        uid,
        // The rest of the properties will be populated by the backend
      };

      if (onUploadSuccess) {
        onUploadSuccess(videoData);
      }
    } catch (err) {
      console.error('Error uploading video:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      if (onUploadError && err instanceof Error) {
        onUploadError(err);
      }
    } finally {
      setUploading(false);
    }
  }, [videoFile, maxDurationSeconds, onUploadSuccess, onUploadError, onUploadProgress]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setVideoFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          className="hidden"
        />
        
        {!videoFile && !uploading && (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-gray-400 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <p className="text-gray-700 font-medium mb-2">Drag and drop your video or click to browse</p>
            <p className="text-sm text-gray-500">MP4, MKV, MOV, AVI up to 30GB</p>
          </>
        )}
        
        {videoFile && !uploading && (
          <div className="w-full">
            <div className="flex items-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-gray-400 mr-3" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <div className="flex-1 truncate">
                <p className="text-gray-700 font-medium truncate">{videoFile.name}</p>
                <p className="text-sm text-gray-500">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          </div>
        )}
        
        {uploading && (
          <div className="w-full">
            <div className="mb-2 flex justify-between">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
      
      {videoFile && !uploading && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVideoFile(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md mr-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              uploadVideo();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Upload Video
          </button>
        </div>
      )}
    </div>
  );
} 