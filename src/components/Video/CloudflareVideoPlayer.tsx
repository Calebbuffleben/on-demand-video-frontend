import { useEffect, useRef, useState } from 'react';

interface VideoPlaybackSources {
  hls: string;
  dash: string;
}

interface CloudflareVideoPlayerProps {
  playback: VideoPlaybackSources;
  thumbnail: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

export default function CloudflareVideoPlayer({
  playback,
  thumbnail,
  title,
  autoPlay = false,
  className = '',
}: CloudflareVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hls: any = null;

    const setupPlayer = async () => {
      try {
        if (!videoRef.current) return;

        // Import HLS.js dynamically
        const Hls = (await import('hls.js')).default;

        // Check if HLS is supported in this browser
        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });

          hls.loadSource(playback.hls);
          hls.attachMedia(videoRef.current);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (autoPlay && videoRef.current) {
              videoRef.current.play().catch(e => {
                console.warn('Autoplay prevented:', e);
              });
            }
          });

          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            if (data.fatal) {
              console.error('HLS error:', data);
              setError(`Playback error: ${data.type}. ${data.details}`);
              
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                // Try to recover network error
                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                // Try to recover media error
                hls.recoverMediaError();
              } else {
                // Cannot recover
                hls.destroy();
              }
            }
          });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari which has built-in HLS support
          videoRef.current.src = playback.hls;
        } else {
          // Try DASH as fallback
          console.warn('HLS is not supported in this browser, trying DASH...');
          videoRef.current.src = playback.dash;
          
          // Add error handler for DASH fallback
          videoRef.current.onerror = (e) => {
            console.error('Video playback error:', e);
            setError('This browser does not support the video format.');
          };
        }
      } catch (err) {
        console.error('Error setting up video player:', err);
        setError('Failed to initialize video player');
      }
    };

    setupPlayer();

    // Cleanup
    return () => {
      if (hls) {
        hls.destroy();
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, [playback, autoPlay]);

  return (
    <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
          <h3 className="text-white text-sm font-medium truncate">{title}</h3>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-white text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <video 
        ref={videoRef}
        controls 
        autoPlay={autoPlay} 
        playsInline
        className="w-full h-full"
        poster={thumbnail}
        title={title}
      >
        <source src={playback.dash} type="application/dash+xml" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
} 