import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import CloudflareVideoPlayer from '../../components/Video/CloudflareVideoPlayer';
import videoService, { VideoData } from '../../api-connection/videos';

export default function VideoEmbedPage() {
  const router = useRouter();
  const { videoId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  useEffect(() => {
    async function fetchVideo() {
      if (!videoId || typeof videoId !== 'string') return;
      
      try {
        setLoading(true);
        console.log('Fetching video with ID:', videoId);
        const response = await videoService.getVideoByUid(videoId);
        console.log('API Response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
          // Handle both array and object responses
          let video: VideoData | null = null;
          
          if (response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
            // If result is an array, get the first element
            video = response.data.result[0];
          } else if (response.data.result && typeof response.data.result === 'object') {
            // If result is a direct object, use it
            video = response.data.result as unknown as VideoData;
          }
          
          if (video) {
            console.log('Video data:', JSON.stringify(video, null, 2));
            console.log('Playback info:', video.playback);
            setVideoData(video);
          } else {
            throw new Error('No video data available');
          }
        } else {
          // Only throw an error if the response indicates a failure
          if (!response.success) {
            const errorMessage = response.message || 'Failed to load video';
            console.error('API response error:', response);
            throw new Error(errorMessage);
          } else {
            // Handle case where response is successful but no video data
            console.error('API response has no video data:', response);
            throw new Error('No video data available');
          }
        }
      } catch (err) {
        console.error('Error loading video:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
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
            <CloudflareVideoPlayer
              src={{
                hls: videoData.playback.hls,
                dash: videoData.playback.dash
              }}
              title={videoData.meta?.name || 'Video'}
              autoPlay={true}
              className="w-full h-full"
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