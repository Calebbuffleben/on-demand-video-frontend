import { useRef, useState, useEffect } from 'react';
import React from 'react';

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
  poster?: string; // URL for the video poster/thumbnail image
  editableCta?: boolean; // If true, show Add/Edit CTA button and editor
  ctaText?: string;
  ctaButtonText?: string;
  ctaLink?: string;
  ctaStartTime?: number;
  ctaEndTime?: number;
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
  progressEasing = -3, // Default to a strong fast-start, slow-end effect
  playButtonColor = '#fff',
  playButtonSize = 24,
  playButtonBgColor = '#000000', // Default to black
  poster,
  editableCta = false,
  ctaText,
  ctaButtonText,
  ctaLink,
  ctaStartTime,
  ctaEndTime,
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
  const [cta, setCta] = useState<{
    text: string;
    buttonText: string;
    link: string;
    startTime: number;
    endTime: number;
  } | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  // Local state for editing CTA
  const [editCta, setEditCta] = useState<{
    text: string;
    buttonText: string;
    link: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  
  // For click-outside-to-close
  const editPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showEdit) return;
    function handleClick(e: MouseEvent) {
      if (editPanelRef.current && !editPanelRef.current.contains(e.target as Node)) {
        setShowEdit(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showEdit]);

  const [posterUrl, setPosterUrl] = useState(poster || '');

  // Calculate non-linear progress (customizable easing)
  const calculateCustomProgress = (current: number, total: number) => {
    if (total === 0) return 0;
    
    const linearProgress = current / total;
    
    // New easing function handling -5 to 1 range:
    // - Value of 0: linear progress (no easing)
    // - Values from 0 to 1: slow start, fast end (power function)
    // - Values from -5 to 0: fast start, slow end (using different function)
    
    if (progressEasing === 0) {
      // Linear progress
      return linearProgress * 100;
    } else if (progressEasing > 0) {
      // Slow start, fast end (0 to 1 range)
      return Math.pow(linearProgress, 1 + progressEasing) * 100;
    } else {
      // Fast start, slow end (-5 to 0 range)
      // Use a modified easing function that gets more dramatic as we approach -5
      const easingFactor = Math.abs(progressEasing);
      // Apply an easeOutQuad-like function with variable strength
      return (1 - Math.pow(1 - linearProgress, 1 + easingFactor)) * 100;
    }
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
    
    // Calculate the inverse of the easing function based on the progressEasing value
    let linearPosition;
    
    if (progressEasing === 0) {
      // Linear (no conversion needed)
      linearPosition = clickPosition;
    } else if (progressEasing > 0) {
      // Inverse of the power function used for slow-start, fast-end
      linearPosition = Math.pow(clickPosition, 1/(1 + progressEasing));
    } else {
      // Inverse of the easeOutQuad-like function used for fast-start, slow-end
      const easingFactor = Math.abs(progressEasing);
      // Inverse of (1 - Math.pow(1 - linearProgress, 1 + easingFactor))
      linearPosition = 1 - Math.pow(1 - clickPosition, 1/(1 + easingFactor));
    }
    
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

  // Set CTA from props
  useEffect(() => {
    if (
      ctaText || ctaButtonText || ctaLink || typeof ctaStartTime === 'number' || typeof ctaEndTime === 'number'
    ) {
      setCta({
        text: ctaText || '',
        buttonText: ctaButtonText || '',
        link: ctaLink || '',
        startTime: typeof ctaStartTime === 'number' ? ctaStartTime : 0,
        endTime: typeof ctaEndTime === 'number' ? ctaEndTime : 0,
      });
    } else {
      setCta(null);
    }
  }, [ctaText, ctaButtonText, ctaLink, ctaStartTime, ctaEndTime]);

  // Show CTA overlay only if CTA is set and currentTime is between startTime and endTime
  const showCta = cta && currentTime >= cta.startTime && currentTime <= cta.endTime;

  // Open editor with current CTA or blank
  const openEdit = () => {
    setEditCta(
      cta
        ? {
            text: cta.text,
            buttonText: cta.buttonText,
            link: cta.link,
            startTime: String(cta.startTime),
            endTime: String(cta.endTime),
          }
        : {
            text: '',
            buttonText: '',
            link: '',
            startTime: '',
            endTime: '',
          }
    );
    setShowEdit(true);
  };

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
        poster={posterUrl}
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

      {/* CTA Overlay */}
      {showCta && cta && cta.text && (
          <div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-lg shadow-lg px-6 py-4 flex flex-col items-center z-20"
            style={{ minWidth: 280 }}
          >
            <div className="text-lg font-semibold text-gray-900 mb-2 text-center">{cta.text}</div>
            {cta.buttonText && cta.link && (
              <a
                href={cta.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {cta.buttonText}
              </a>
            )}
          </div>
        )}

      {/* Add/Edit CTA Button (outside video area, top-right) */}
      {editableCta && (
        <div className="absolute top-4 right-4 z-30">
          {!cta ? (
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow"
              onClick={openEdit}
              type="button"
            >
              Add CTA
            </button>
          ) : (
            <button
              className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition shadow flex items-center"
              onClick={openEdit}
              type="button"
              aria-label="Edit CTA"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113.02 2.92L7.5 19.789l-4 1 1-4 12.362-12.302z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* CTA Editing UI (modal style, click outside to close) */}
      {editableCta && showEdit && editCta && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div ref={editPanelRef} className="bg-white p-6 rounded shadow-lg w-96 flex flex-col gap-3 relative">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => { setShowEdit(false); setEditError(null); }}
              aria-label="Close CTA Editor"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-2">{cta ? 'Edit CTA' : 'Add CTA'}</h3>
            {/* Validation error message */}
            {editError && (
              <div className="mb-2 text-red-600 text-sm font-medium">{editError}</div>
            )}
            <label className="flex flex-col text-sm font-medium text-gray-700">
              CTA Text
              <input
                className="mt-1 p-2 border rounded"
                value={editCta.text}
                onChange={e => setEditCta({ ...editCta, text: e.target.value })}
                placeholder="Enter CTA text"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-gray-700">
              Button Text
              <input
                className="mt-1 p-2 border rounded"
                value={editCta.buttonText}
                onChange={e => setEditCta({ ...editCta, buttonText: e.target.value })}
                placeholder="Enter button text"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-gray-700">
              Link (URL)
              <input
                className="mt-1 p-2 border rounded"
                value={editCta.link}
                onChange={e => setEditCta({ ...editCta, link: e.target.value })}
                type="url"
                placeholder="https://..."
              />
            </label>
            <div className="flex gap-2">
              <label className="flex flex-col text-sm font-medium text-gray-700 w-1/2">
                Start (s)
                <input
                  className="mt-1 p-2 border rounded"
                  value={editCta.startTime}
                  onChange={e => {
                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                    setEditCta({ ...editCta, startTime: val });
                  }}
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 10"
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-gray-700 w-1/2">
                End (s)
                <input
                  className="mt-1 p-2 border rounded"
                  value={editCta.endTime}
                  onChange={e => {
                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                    setEditCta({ ...editCta, endTime: val });
                  }}
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 20"
                />
              </label>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => {
                  // Validate
                  const start = Number(editCta.startTime);
                  const end = Number(editCta.endTime);
                  if (!editCta.text || !editCta.buttonText || !editCta.link || isNaN(start) || isNaN(end) || start >= end) {
                    setEditError('Please fill all fields correctly. Start time must be less than end time.');
                    return;
                  }
                  setCta({
                    text: editCta.text,
                    buttonText: editCta.buttonText,
                    link: editCta.link,
                    startTime: start,
                    endTime: end,
                  });
                  setShowEdit(false);
                  setEditError(null);
                }}
                type="button"
              >
                Save
              </button>
              {cta && (
                <button
                  className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  onClick={() => { setCta(null); setShowEdit(false); setEditError(null); }}
                  type="button"
                >
                  Remove CTA
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove Thumbnail Button */}
      {posterUrl && (
        <button
          className="absolute top-4 left-4 z-30 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition shadow"
          onClick={() => setPosterUrl('')}
          type="button"
        >
          Remove Thumbnail
        </button>
      )}
    </div>
  );
} 