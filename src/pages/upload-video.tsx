import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/Auth/AuthGuard';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import DashboardSidebar from '../components/Dashboard/DashboardSidebar';
import VideoUploader from '../components/Video/VideoUploader';
import CustomVideoPlayer from '../components/Video/CustomVideoPlayer';
import Button from '../components/Button';
import videoService from '../api-connection/videos';
import ErrorMessage from '../components/Error/ErrorMessage';

export default function UploadVideoPage() {
  const router = useRouter();
  const { tenantId } = router.query;
  const [uploadComplete, setUploadComplete] = useState(false);
  const [videoUid, setVideoUid] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<any>(null);
  const [videoPlaybackSrc, setVideoPlaybackSrc] = useState<{hls: string, dash?: string} | null>(null);

  // Redirect to tenant-specific version if tenantId is available
  useEffect(() => {
    if (tenantId && typeof tenantId === 'string') {
      router.replace(`/${tenantId}/upload-video`);
    }
  }, [tenantId, router]);

  // Helper function to get the videos page URL based on tenant context
  const getVideosUrl = () => {
    return tenantId ? `/${tenantId}/videos` : '/my-videos';
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (videoUid && isProcessing) {
      intervalId = setInterval(async () => {
        try {
          console.log('Checking status for video:', videoUid);
          const response = await videoService.checkVideoStatus(videoUid);
          console.log('Status response:', JSON.stringify(response, null, 2));
          
          // Check if the video is ready to stream
          if (response.success && response.video && response.video.readyToStream) {
            console.log('Video is ready to stream!', response.video);
            setIsProcessing(false);
            setIsReady(true);
            
            // Update the playback URLs if available
            if (response.video.playback && response.video.playback.hls) {
              console.log('Setting playback URLs:', response.video.playback);
              setVideoPlaybackSrc({
                hls: response.video.playback.hls,
                dash: response.video.playback.dash
              });
            }
            
            clearInterval(intervalId);
          } else {
            console.log('Video still processing. Status:', response.video?.status?.state || 'unknown', 'Ready to stream:', response.video?.readyToStream);
          }
        } catch (err) {
          console.error('Error checking video status:', err);
          clearInterval(intervalId);
          setError('Falha ao verificar o status de processamento do vídeo');
        }
      }, 2000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [videoUid, isProcessing]);

  const handleUploadSuccess = (embedInfo: { uid: string, hls?: string, dash?: string }) => {
    setUploadComplete(true);
    setVideoUid(embedInfo.uid);
    setIsProcessing(true);
    
    if (embedInfo.hls) {
      setVideoPlaybackSrc({
        hls: embedInfo.hls,
        dash: embedInfo.dash
      });
    }
  };

  const handleUploadError = (error: Error) => {
    setError(error);
  };

  return (
    <>
      <Head>
        <title>Enviar Vídeo</title>
      </Head>
      <AuthGuard>
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="px-6 py-4">
          <div className="flex items-center mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(getVideosUrl())}
              className="mr-4"
            >
              Voltar aos Vídeos
            </Button>
            <h1 className="text-2xl font-semibold">Enviar Vídeo</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            {!uploadComplete && (
              <VideoUploader 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            )}
            
            {isProcessing && (
              <div className="mt-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-700">Vídeo está sendo processado...</p>
              </div>
            )}
            
            {error && (
              <div className="mt-4">
                <ErrorMessage error={error} />
              </div>
            )}
            
            {isReady && videoUid && videoPlaybackSrc && (
              <div className="mt-8">
                <h2 className="text-xl font-medium mb-4">Vídeo Pronto!</h2>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <CustomVideoPlayer src={videoPlaybackSrc} />
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
      </AuthGuard>
    </>
  );
} 