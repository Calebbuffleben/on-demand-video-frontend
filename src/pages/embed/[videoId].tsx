import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import MuxVideoPlayer from '../../components/Video/MuxVideoPlayer';
import videoService, { VideoData } from '../../api-connection/videos';

export default function VideoEmbedPage() {
  const router = useRouter();
  const { videoId, tenantId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  // Get the base URL for constructing embed URLs
  const getBaseUrl = () => {
    if (typeof window === 'undefined') return 'https://yourdomain.com';
    return `${window.location.protocol}//${window.location.host}`;
  };

  // Get tenant-aware video watch URL
  const getVideoWatchUrl = (uid: string) => {
    const baseUrl = getBaseUrl();
    return tenantId ? `${baseUrl}/${tenantId}/videos/watch/${uid}` : `${baseUrl}/videos/watch/${uid}`;
  };

  useEffect(() => {
    async function fetchVideo() {
      if (!videoId) return;
      
      try {
        setLoading(true);
        const response = await videoService.getVideoByUid(videoId as string);
        if (response.success && response.data && response.data.result) {
          // Handle both array and object responses
          const videoResult = Array.isArray(response.data.result) 
            ? response.data.result[0] 
            : response.data.result;
          setVideoData(videoResult as VideoData);
        } else {
          setError('No video data available');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video');
        setLoading(false);
      }
    }

    fetchVideo();
  }, [videoId]);

  // Add more debugging info in the render
  const renderDebugInfo = () => {
    if (!videoData) return null;
    
    return (
      <div className="text-white text-xs p-2 absolute bottom-0 left-0 bg-black/50 max-w-full overflow-auto">
        <p>Video UID: {videoData.uid}</p>
        <p>Ready to stream: {videoData.readyToStream ? 'Yes' : 'No'}</p>
        <p>Has playback?: {videoData.playback ? 'Yes' : 'No'}</p>
        {videoData.playback && (
          <>
            <p>HLS URL: {videoData.playback.hls ? 'Available' : 'Missing'}</p>
            <p>DASH URL: {videoData.playback.dash ? 'Available' : 'Missing'}</p>
          </>
        )}
        <p>Status: {videoData.status?.state || 'Unknown'}</p>
      </div>
    );
  };

  // Simple embed page with minimal UI
  return (
    <>
      <Head>
        <title>{videoData?.meta?.name || 'Video Player'}</title>
        <style>{`
          body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden;
            background-color: #000;
          }
        `}</style>
      </Head>

      <div className="w-full h-screen flex items-center justify-center bg-black relative">
        {loading ? (
          <div className="text-white flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-gray-600 border-t-white rounded-full animate-spin mb-2"></div>
            <p className="text-sm">Loading video...</p>
          </div>
        ) : error ? (
          <div className="text-white text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        ) : videoData && videoData.playback && videoData.playback.hls ? (
          <>
            <MuxVideoPlayer
              src={videoData.playback}
              title={videoData.meta?.name || 'Video'}
              autoPlay={true}
              showControls={videoData.meta?.displayOptions?.showPlaybackControls !== false}
              muted={videoData.meta?.displayOptions?.muted}
              loop={videoData.meta?.displayOptions?.loop}
              hideProgress={videoData.meta?.displayOptions?.showProgressBar === false}
              showTechnicalInfo={videoData.meta?.embedOptions?.showTechnicalInfo}
              useOriginalProgressBar={videoData.meta?.displayOptions?.useOriginalProgressBar}
              progressBarColor={videoData.meta?.displayOptions?.progressBarColor || '#3b82f6'}
              progressEasing={typeof videoData.meta?.displayOptions?.progressEasing === 'number' ? videoData.meta.displayOptions.progressEasing : -3}
              playButtonColor={videoData.meta?.displayOptions?.playButtonColor || '#fff'}
              playButtonSize={typeof videoData.meta?.displayOptions?.playButtonSize === 'number' ? videoData.meta.displayOptions.playButtonSize : 32}
              playButtonBgColor={videoData.meta?.displayOptions?.playButtonBgColor || '#000000'}
              className="w-full h-full"
              poster={videoData.thumbnail || undefined}
              soundControlText={videoData.meta?.displayOptions?.soundControlText}
              soundControlColor={videoData.meta?.displayOptions?.soundControlColor}
              soundControlOpacity={videoData.meta?.displayOptions?.soundControlOpacity}
              soundControlSize={videoData.meta?.displayOptions?.soundControlSize}
            />
            {renderDebugInfo()}
          </>
        ) : (
          <div className="text-white text-center p-4">
            <p>Video not available</p>
            {videoData && <p className="text-xs mt-2">Status: {videoData.status?.state || 'Unknown'}</p>}
            {videoData && videoData.readyToStream === false && (
              <p className="text-xs mt-1">Video is still processing. Please check back later.</p>
            )}
            {renderDebugInfo()}
          </div>
        )}
      </div>
    </>
  );
} 