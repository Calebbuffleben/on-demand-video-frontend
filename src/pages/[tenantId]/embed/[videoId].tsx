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
      const response = await videoService.getVideoForEmbed(videoId);
      if (response.success && response.result) {
        setVideoData(response.result as VideoData);
      } else {
        setError('No video data available');
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
        
        {!loading && !error && videoData && videoData.playback && videoData.playback.hls && (
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
            progressBarColor={videoData.meta?.displayOptions?.progressBarColor || '#3b82f6'}
            progressEasing={typeof videoData.meta?.displayOptions?.progressEasing === 'number' ? videoData.meta.displayOptions.progressEasing : 0.65}
            playButtonColor={videoData.meta?.displayOptions?.playButtonColor || '#fff'}
            playButtonSize={typeof videoData.meta?.displayOptions?.playButtonSize === 'number' ? videoData.meta.displayOptions.playButtonSize : 32}
            className="w-full h-full"
          />
        )}
      </div>
    </>
  );
} 