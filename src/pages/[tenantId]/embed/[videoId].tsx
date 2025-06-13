import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import videoService, { VideoData } from '../../../api-connection/videos';
import MuxVideoPlayer from '../../../components/Video/MuxVideoPlayer';

export default function VideoEmbedPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  
  const router = useRouter();
  const { videoId, tenantId } = router.query;

  useEffect(() => {
    if (videoId && typeof videoId === 'string') {
      fetchVideo(videoId);
    }
  }, [videoId]);

  const fetchVideo = async (videoId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await videoService.getVideoByUid(videoId);

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
      console.error('Error fetching video:', err);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  // Use minimal styling for embed page
  return (
    <>
      <Head>
        <title>{videoData?.meta?.name || 'Video Player'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
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
        {loading && (
          <div className="text-white flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-gray-600 border-t-white rounded-full animate-spin mb-2"></div>
            <p className="text-sm">Loading video...</p>
          </div>
        )}
        
        {error && (
          <div className="text-white text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="w-full max-w-[100vw] max-h-[100vh] aspect-video">
            {videoData && videoData.playback && videoData.playback.hls && (
              <MuxVideoPlayer 
                src={videoData.playback}
                title={videoData.meta?.displayOptions?.showTitle ? videoData.meta?.name : undefined}
                autoPlay={videoData.meta?.displayOptions?.autoPlay}
                showControls={videoData.meta?.displayOptions?.showPlaybackControls}
                muted={videoData.meta?.displayOptions?.muted}
                loop={videoData.meta?.displayOptions?.loop}
                hideProgress={!videoData.meta?.displayOptions?.showProgressBar}
                showTechnicalInfo={videoData.meta?.embedOptions?.showTechnicalInfo}
                useOriginalProgressBar={videoData.meta?.displayOptions?.useOriginalProgressBar}
                progressBarColor={videoData.meta?.displayOptions?.progressBarColor}
                progressEasing={videoData.meta?.displayOptions?.progressEasing}
                playButtonColor={videoData.meta?.displayOptions?.playButtonColor}
                playButtonSize={videoData.meta?.displayOptions?.playButtonSize}
                playButtonBgColor={videoData.meta?.displayOptions?.playButtonBgColor}
                soundControlSize={videoData.meta?.displayOptions?.soundControlSize}
                soundControlColor={videoData.meta?.displayOptions?.soundControlColor}
                soundControlOpacity={videoData.meta?.displayOptions?.soundControlOpacity}
                soundControlText={videoData.meta?.displayOptions?.soundControlText}
                poster={videoData.thumbnail || undefined}
                showSoundControl={videoData.meta?.displayOptions?.showSoundControl ?? (videoData.meta?.displayOptions?.autoPlay && videoData.meta?.displayOptions?.muted)}
                showCta={!!videoData.ctaText}
                ctaText={videoData.ctaText}
                ctaButtonText={videoData.ctaButtonText}
                ctaLink={videoData.ctaLink}
                ctaStartTime={videoData.ctaStartTime}
                ctaEndTime={videoData.ctaEndTime}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
} 