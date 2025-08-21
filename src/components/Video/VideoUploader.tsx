'use client'

import { useState, useRef, useCallback, useEffect } from 'react';
import videoService from '../../api-connection/videos';
import Image from 'next/image';

interface VideoUploaderProps {
  maxDurationSeconds?: number;
  className?: string;
  onUploadSuccess?: (embedInfo: VideoEmbedInfo) => void;
  onUploadError?: (error: Error) => void;
  onUploadProgress?: (progress: number) => void;
  organizationId?: string;
}

interface VideoEmbedInfo {
  uid: string;
  hls?: string;
  dash?: string;
  thumbnailUrl?: string;
  readyToStream?: boolean;
  status?: string;
}

export default function VideoUploader({
  maxDurationSeconds = 3600, // eslint-disable-line @typescript-eslint/no-unused-vars
  className = '',
  onUploadSuccess,
  onUploadError,
  onUploadProgress,
  organizationId = '659b9a2c-4f58-4590-bc18-d2d1385b0fb0', // Default organization ID
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [embedInfo, setEmbedInfo] = useState<VideoEmbedInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pollingStartRef = useRef<number | null>(null);
  const lastVideoUidRef = useRef<string | null>(null);

  // Polling configuration
  const POLL_INTERVAL_MS = 5000;
  const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const checkVideoStatus = useCallback(async (uid: string) => {
    try {
      console.log('Checking video status for:', uid);
      const statusResponse = await videoService.checkVideoStatus(uid);
      console.log('Status response in VideoUploader:', JSON.stringify(statusResponse, null, 2));

      if (statusResponse.success && statusResponse.video) {
        const videoData = statusResponse.video;
        // Check both readyToStream flag and status state for readiness
        const isReady = videoData.readyToStream === true || 
                         (videoData.status?.state === 'ready');
        
        console.log('Video status check - isReady:', isReady, 
                    'readyToStream:', videoData.readyToStream, 
                    'state:', videoData.status?.state);
        
        const embedInfo: VideoEmbedInfo = {
          uid: uid,
          hls: videoData.playback?.hls,
          dash: videoData.playback?.dash,
          thumbnailUrl: videoData.thumbnail,
          readyToStream: videoData.readyToStream || (videoData.status?.state === 'ready'),
          status: videoData.status?.state || 'processing'
        };

        console.log('Setting embedInfo to:', embedInfo);
        setEmbedInfo(embedInfo);
        
        if (isReady) {
          console.log('Video is ready! Setting isProcessing to false');
          setIsProcessing(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            console.log('Cleared polling interval');
          }
          if (onUploadSuccess) {
            console.log('Calling onUploadSuccess with ready video:', embedInfo);
            onUploadSuccess(embedInfo);
          }
        }
      }
    } catch (error) {
      console.error('Error checking video status:', error);
      setIsProcessing(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  }, [onUploadSuccess]);

  const startPolling = useCallback((uid: string) => {
    setIsProcessing(true);
    // Check immediately
    checkVideoStatus(uid);
    // Then check every 5 seconds
    pollingStartRef.current = Date.now();
    pollingIntervalRef.current = setInterval(() => {
      checkVideoStatus(uid);
    }, POLL_INTERVAL_MS);

    // Set an overall timeout to avoid infinite processing state
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }
    pollingTimeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      setIsProcessing(false);
      setError('O processamento está demorando mais que o esperado. Tente novamente em alguns minutos.');
    }, POLL_TIMEOUT_MS);
  }, [checkVideoStatus, POLL_TIMEOUT_MS]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setVideoFile(files[0]);
      setError(null);
    }
  };

  const uploadVideo = useCallback(async () => {
    if (!videoFile) {
      setError('Por favor, selecione um arquivo de vídeo');
      return;
    }

    if (!organizationId) {
      setError('ID da organização é obrigatório');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setEmbedInfo(null);
    setIsProcessing(false);

    try {
      // Prefer multipart for big files
      const { uid } = await videoService.uploadVideoFileMultipart(
        videoFile,
        organizationId,
        (progress) => {
          setUploadProgress(progress);
          onUploadProgress?.(progress);
        }
      );

      // Step 3: Start polling for video status
      console.log('Upload complete, starting status polling for:', uid);
      lastVideoUidRef.current = uid;
      startPolling(uid);

      // Set initial processing state
      const initialInfo: VideoEmbedInfo = {
          uid: uid,
          status: 'processing',
          readyToStream: false
        };
      setEmbedInfo(initialInfo);
      
      console.log('Initial video info set:', initialInfo);
      
      if (onUploadSuccess) {
        console.log('Calling onUploadSuccess with:', initialInfo);
        onUploadSuccess(initialInfo);
      }

    } catch (err) {
      console.error('Error uploading video:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ocorreu';
      setError(errorMessage);
      
      if (onUploadError && err instanceof Error) {
        onUploadError(err);
      }
    } finally {
      setUploading(false);
    }
  }, [videoFile, onUploadSuccess, onUploadError, onUploadProgress, startPolling, organizationId]);

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
          ${error ? 'border-red-400 bg-red-50' : 'border-silver-300 bg-silver-50 hover:bg-silver-100'}`}
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
        
        {!videoFile && !uploading && !embedInfo && (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-silver-400 mb-4" 
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
            <p className="text-silver-700 font-medium mb-2">Arraste e solte seu vídeo ou clique para navegar</p>
            <p className="text-sm text-silver-500">MP4, MKV, MOV, AVI até 30GB</p>
          </>
        )}
        
        {videoFile && !uploading && !embedInfo && (
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
              <span className="text-sm font-medium text-gray-700">Enviando...</span>
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
        
        {embedInfo && (
          <div className="w-full text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-12 w-12 mx-auto mb-4 ${isProcessing ? 'text-yellow-500' : 'text-green-500'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isProcessing ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M5 13l4 4L19 7"} 
              />
            </svg>
            <p className="text-gray-700 font-medium mb-2">
              {isProcessing ? 'Vídeo está sendo processado...' : (embedInfo.readyToStream || embedInfo.status === 'ready' ? 'Envio Bem-sucedido!' : 'Processamento Concluído')}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              {isProcessing ? 'Isso pode levar alguns minutos' : (embedInfo.hls ? 'Vídeo está pronto para incorporação' : 'Vídeo estará disponível em breve')}
            </p>

            {!isProcessing && !embedInfo.hls && (
              <div className="mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                    const uid = lastVideoUidRef.current || embedInfo.uid;
                    if (uid) {
                      startPolling(uid);
                    }
                  }}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Verificar status novamente
                </button>
              </div>
            )}
            
            {embedInfo.hls && (
              <div className="mt-4 bg-gray-100 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">URL HLS (para Safari/iOS):</p>
                <code className="text-xs bg-white p-2 block rounded border border-gray-300 break-all">
                  {embedInfo.hls}
                </code>
                
                {embedInfo.dash && (
                  <>
                    <p className="text-sm font-medium text-gray-700 mt-4 mb-2">URL DASH (para Chrome/Android):</p>
                    <code className="text-xs bg-white p-2 block rounded border border-gray-300 break-all">
                      {embedInfo.dash}
                    </code>
                  </>
                )}
                
                <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Código de Incorporação:</p>
                <code className="text-xs bg-white p-2 block rounded border border-gray-300 break-all">
                  {`<video id="player" controls>
                      <source src="${embedInfo.hls}" type="application/x-mpegURL">
                      ${embedInfo.dash ? `<source src="${embedInfo.dash}" type="application/dash+xml">` : ''}
                      Seu navegador não suporta vídeo HTML5.
                    </video>`}
                </code>
              </div>
            )}
            
            {embedInfo.thumbnailUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Miniatura:</p>
                <Image
                  src={embedInfo.thumbnailUrl}
                  alt="Miniatura do vídeo"
                  className="mx-auto max-w-full h-auto rounded-md border border-gray-300"
                  width={320}
                  height={180}
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
      
      {videoFile && !uploading && !embedInfo && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVideoFile(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md mr-2 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              uploadVideo();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Enviar Vídeo
          </button>
        </div>
      )}
      
      {embedInfo && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVideoFile(null);
              setEmbedInfo(null);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Enviar Outro Vídeo
          </button>
        </div>
      )}
    </div>
  );
} 