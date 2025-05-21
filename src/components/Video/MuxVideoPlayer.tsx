import { useRef, useState, useEffect } from 'react';

interface VideoPlaybackSources {
  hls: string;
  dash?: string;
}

interface MuxVideoPlayerProps {
  src: VideoPlaybackSources;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  hideProgress?: boolean;
  showControls?: boolean;
  muted?: boolean;
  loop?: boolean;
  showTechnicalInfo?: boolean;
  useOriginalProgressBar?: boolean;
  progressBarColor?: string; // HEX or CSS color
  progressEasing?: number; // Exponent for easing, 1 = linear, <1 = fast start, >1 = slow start
  playButtonColor?: string; // HEX or CSS color
  playButtonSize?: number; // px size for play/pause button
  playButtonBgColor?: string; // HEX or CSS color for play button background
}

export default function MuxVideoPlayer({
  src,
  title,
  autoPlay = false,
  className = '',
  hideProgress = false,
  showControls = true,
  muted = false,
  loop = false,
  showTechnicalInfo = false,
  useOriginalProgressBar = false,
  progressBarColor = '#3b82f6', // Tailwind blue-500
  progressEasing = 0.2, // Use lowest value for maximum fast-start effect
  playButtonColor = '#fff',
  playButtonSize = 24,
  playButtonBgColor = '#000000', // Default to black
}: MuxVideoPlayerProps) {
  // Log props for debugging
  console.log('[DEBUG] MuxVideoPlayer props:', { 
    playButtonColor, 
    playButtonSize, 
    playButtonBgColor,
    progressEasing
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [customProgress, setCustomProgress] = useState(0);
  
  // Calculate non-linear progress (customizable easing)
  const calculateCustomProgress = (current: number, total: number) => {
    if (total === 0) return 0;
    const linearProgress = current / total;
    
    // For values close to our minimum (0.2), we want a very fast start and slow end
    // The closer to 0, the more dramatic this effect
    return Math.pow(linearProgress, progressEasing) * 100;
  };

  // Update progress and state when video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && video.duration !== Infinity) {
        setDuration(video.duration);
        setCustomProgress(calculateCustomProgress(video.currentTime, video.duration));
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoRef.current, progressEasing]);

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    if (!seconds || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle play/pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play().catch(err => console.error('Error playing video:', err));
    } else {
      video.pause();
    }
  };

  // Handle seeking when clicking on the progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    
    // Convert from non-linear progress to linear position
    // This is the inverse of the calculateCustomProgress function
    const linearPosition = Math.pow(clickPosition, 1/progressEasing);
    const targetTime = linearPosition * duration;
    
    if (targetTime >= 0 && targetTime <= duration) {
      video.currentTime = targetTime;
      console.log('[DEBUG] Seeking to:', targetTime, 'seconds with easing:', progressEasing);
    }
  };

  // Set up HLS.js for browsers that don't support HLS natively
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const setupHls = async () => {
      try {
        // Check if browser supports HLS natively (like Safari)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src.hls;
        } else {
          // For other browsers, use HLS.js
          const Hls = (await import('hls.js')).default;
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src.hls);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (autoPlay) {
                video.play().catch(e => console.warn('Autoplay prevented:', e));
              }
            });
          } else {
            console.error('HLS is not supported in this browser and no fallback is available');
          }
        }
      } catch (err) {
        console.error('Error setting up video player:', err);
      }
    };

    setupHls();
  }, [src.hls, autoPlay]);

  return (
    <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
          <h3 className="text-white text-sm font-medium truncate">{title}</h3>
        </div>
      )}
      
      {/* Central Play Button Overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center z-30 focus:outline-none"
          style={{ pointerEvents: 'auto' }}
          aria-label="Play video"
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: playButtonSize * 2,
              height: playButtonSize * 2,
              background: playButtonBgColor,
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width={playButtonSize} height={playButtonSize} style={{ fill: playButtonColor }}>
              <polygon points="16,12 40,24 16,36" />
            </svg>
          </span>
        </button>
      )}
      
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className="w-full h-full object-contain"
        style={{
          objectFit: 'contain',
          maxHeight: '100%',
          maxWidth: '100%'
        }}
        controls={useOriginalProgressBar && showControls}
      />

      {/* Custom progress bar */}
      {showControls && !hideProgress && !useOriginalProgressBar && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 z-20">
          <div className="flex items-center space-x-2">
            {showControls && (
              <button 
                onClick={togglePlayPause}
                className="flex items-center justify-center"
                style={{ color: '#fff', width: 32, height: 32 }}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                )}
              </button>
            )}
            
            <div 
              className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="absolute top-0 left-0 h-full rounded-full transition-width duration-100"
                style={{ width: `${customProgress}%`, background: progressBarColor }}
              ></div>
            </div>
            
            <span className="text-white text-xs min-w-[70px] text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
      
      {/* Simple controls if progress bar is hidden but controls are shown */}
      {showControls && hideProgress && !useOriginalProgressBar && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <button 
            onClick={togglePlayPause}
            className="bg-black/50 text-white rounded-full p-2"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            )}
          </button>
        </div>
      )}
      
      {/* Technical information display */}
      {showTechnicalInfo && (
        <div className="absolute top-0 right-0 bg-black/70 text-white text-xs p-2 z-30">
          Progress: {customProgress.toFixed(2)}%<br />
          Time: {currentTime.toFixed(2)}s / {duration.toFixed(2)}s<br />
          Player: {isPlaying ? 'Playing' : 'Paused'}<br />
          URL: {src.hls.substring(0, 20)}...
        </div>
      )}
    </div>
  );
} 