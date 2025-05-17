import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import DashboardSidebar from '../../components/Dashboard/DashboardSidebar';
import VideoUploader from '../../components/Video/VideoUploader';
import MuxVideoPlayer from '../../components/Video/MuxVideoPlayer';
import Button from '../../components/Button';
import videoService from '../../api-connection/videos';

export default function UploadVideoPage() {
  const router = useRouter();
  const { tenantId } = router.query;
  const [uploadComplete, setUploadComplete] = useState(false);
  const [videoUid, setVideoUid] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoPlaybackSrc, setVideoPlaybackSrc] = useState<{hls: string, dash?: string} | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (videoUid && isProcessing) {
      const checkStatus = async () => {
        try {
          const response = await videoService.checkVideoStatus(videoUid);
          
          if (response.success && response.video) {
            // Determine if video is ready from the backend response
            const videoData = response.video;
            const videoReady = videoData.readyToStream === true || videoData.status?.state === 'ready';
            
            // If video is ready, update state
            if (videoReady) {
              setIsProcessing(false);
              setIsReady(true);
              
              if (videoData.playback && videoData.playback.hls) {
                setVideoPlaybackSrc({
                  hls: videoData.playback.hls,
                  dash: videoData.playback.dash
                });
              }
            }
          }
        } catch (err) {
          console.error('Error checking video status:', err);
        }
      };
      
      // Check immediately
      checkStatus();
      
      // Then set up interval
      intervalId = setInterval(checkStatus, 3000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [videoUid, isProcessing]);

  const handleUploadSuccess = (embedInfo: { uid: string, hls?: string, dash?: string, readyToStream?: boolean, status?: string }) => {
    // Always set the video UID and mark upload as complete
    setUploadComplete(true);
    setVideoUid(embedInfo.uid);
    
    // Check if the video is immediately ready (rare but possible)
    const videoReady = embedInfo.readyToStream === true || embedInfo.status === 'ready';
    
    if (videoReady && embedInfo.hls) {
      // If already ready with playback URLs, set as ready
      setIsReady(true);
      setIsProcessing(false);
      setVideoPlaybackSrc({
        hls: embedInfo.hls,
        dash: embedInfo.dash
      });
    } else {
      // Otherwise, set as processing to trigger the polling
      setIsProcessing(true);
      setIsReady(false);
      setVideoPlaybackSrc(null);
    }
  };

  const handleUploadError = (error: Error) => {
    setError(error.message);
  };

  return (
    <>
      <Head>
        <title>Upload Video</title>
      </Head>
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="px-6 py-4">
          <div className="flex items-center mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(tenantId ? `/${tenantId}/videos` : '/my-videos')}
              className="mr-4"
            >
              Back to Videos
            </Button>
            <h1 className="text-2xl font-semibold">Upload Video</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            {!uploadComplete && (
              <VideoUploader 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                organizationId={typeof tenantId === 'string' ? tenantId : undefined}
              />
            )}
            
            {uploadComplete && (
              <>
                {isProcessing && (
                  <div className="mt-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-gray-700">Video is being processed...</p>
                    <p className="text-xs text-gray-500 mt-1">This may take a few minutes</p>
                  </div>
                )}
                
                {error && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </div>
                )}
                
                {isReady && (
                  <div className="mt-8">
                    <h2 className="text-xl font-medium mb-4">Video Ready!</h2>
                    
                    {videoPlaybackSrc ? (
                      <>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <MuxVideoPlayer src={videoPlaybackSrc} />
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="primary"
                            onClick={() => router.push(tenantId ? `/${tenantId}/videos/${videoUid}` : `/videos/${videoUid}`)}
                          >
                            View Video Details
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                        Video is ready but playback URLs are not available.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
} 