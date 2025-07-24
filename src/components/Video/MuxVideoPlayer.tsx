import { useRef, useState, useEffect } from 'react';
import React from 'react';
import SoundControl from './SoundControl';
import MuxPlayer from '@mux/mux-player-react';

interface VideoPlaybackSources {
  hls: string;
  dash?: string;
}

interface MuxPlayerRef {
  style: CSSStyleDeclaration;
  querySelector: (selector: string) => Element | null;
  load: () => void;
  play: () => void;
  muted: boolean;
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
  progressBarColor?: string;
  progressEasing?: number;
  playButtonColor?: string;
  playButtonSize?: number;
  playButtonBgColor?: string;
  poster?: string;
  showCta?: boolean;
  ctaText?: string;
  ctaButtonText?: string;
  ctaLink?: string;
  ctaStartTime?: number;
  ctaEndTime?: number;
  soundControlColor?: string;
  soundControlOpacity?: number;
  showSoundControl?: boolean;
  soundControlSize?: number;
  soundControlText?: string;
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
  progressBarColor = '#171717',
  progressEasing = 2,
  playButtonColor = '#fff',
  playButtonSize = 24,
  playButtonBgColor = '#000000',
  poster,
  showCta = false,
  ctaText,
  ctaButtonText,
  ctaLink,
  ctaStartTime,
  ctaEndTime,
  soundControlColor = '#ffffff',
  soundControlOpacity = 0.8,
  showSoundControl = true,
  soundControlSize = 24,
  soundControlText,
}: MuxVideoPlayerProps) {
  const playerRef = useRef<MuxPlayerRef>(null);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCtaVisible, setIsCtaVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  // Detect iframe context for safer analytics-enabled mode
  useEffect(() => {
    const inIframe = window.self !== window.top;
    const isEmbedPath = window.location.pathname.includes('/embed/');
    setIsInIframe(inIframe || isEmbedPath);
    
    if (inIframe || isEmbedPath) {
      console.log('🎯 IFRAME/EMBED DETECTED - Using safe MuxPlayer with analytics');
    }
  }, []);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');
  }, [src]);

  // Handle play/pause state
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  // Apply custom styles after component mounts
  useEffect(() => {
    console.log('Applying Mux Player customizations:', {
      showControls,
      useOriginalProgressBar,
      playButtonColor,
      playButtonSize,
      playButtonBgColor,
      isInIframe
    });
    
    if (playerRef.current) {
      const player = playerRef.current;
      
      // Apply control visibility - show controls if useOriginalProgressBar is true OR showControls is true
      if (!useOriginalProgressBar && !showControls) {
        player.style.setProperty('--controls', 'none');
        player.style.setProperty('--media-controls', 'none');
      } else {
        player.style.setProperty('--controls', 'flex');
        player.style.setProperty('--media-controls', 'flex');
      }
      
      // Apply play button customization
      player.style.setProperty('--play-button-color', playButtonColor);
      player.style.setProperty('--play-button-size', `${playButtonSize}px`);
      player.style.setProperty('--play-button-bg-color', playButtonBgColor);
      
      // Target specific DOM elements for better control
      setTimeout(() => {
        const playButton = player.querySelector('.media-play-button') || 
                          player.querySelector('[part="play-button"]') ||
                          player.querySelector('button[aria-label*="play"]');
        
        if (playButton) {
          console.log('Found play button, applying size:', playButtonSize);
          (playButton as HTMLElement).style.width = `${playButtonSize}px`;
          (playButton as HTMLElement).style.height = `${playButtonSize}px`;
          (playButton as HTMLElement).style.minWidth = `${playButtonSize}px`;
          (playButton as HTMLElement).style.minHeight = `${playButtonSize}px`;
          
          const svg = playButton.querySelector('svg');
          if (svg) {
            (svg as unknown as HTMLElement).style.width = `${Math.max(playButtonSize * 0.4, 16)}px`;
            (svg as unknown as HTMLElement).style.height = `${Math.max(playButtonSize * 0.4, 16)}px`;
          }
        } else {
          console.log('No play button found in Mux Player');
        }
      }, 100); // Small delay to ensure Mux Player has rendered
    }
  }, [showControls, useOriginalProgressBar, playButtonColor, playButtonSize, playButtonBgColor, isInIframe]);

  // Extract the playback ID from the HLS URL
  const getPlaybackId = (url: string) => {
    try {
      // Handle direct playback ID
      if (url.match(/^[a-zA-Z0-9]+$/)) {
        return url;
      }
      // Handle HLS URL format: https://stream.mux.com/{playbackId}.m3u8
      const match = url.match(/stream\.mux\.com\/([^\/\.]+)/);
      if (match) {
        return match[1];
      }
      // Handle Mux.com URL format: https://mux.com/{playbackId}
      const muxMatch = url.match(/mux\.com\/([^\/]+)/);
      if (muxMatch) {
        return muxMatch[1];
      }
      return null;
    } catch {
      return null;
    }
  };

  const playbackId = getPlaybackId(src.hls);

  if (!playbackId) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">Error loading video</p>
          <p className="text-gray-600 text-sm mt-2">Invalid playback URL or ID</p>
        </div>
      </div>
    );
  }

  // Handle time updates for Mux Player
  const handleTimeUpdate = (e: Event) => {
    const target = e.target as HTMLVideoElement;
    const newTime = target.currentTime;
    setCurrentTime(newTime);
    setDuration(target.duration);
    // Simple CTA visibility check - disabled in iframe for safety
    if (!isInIframe && showCta && ctaText && ctaButtonText && ctaLink && typeof ctaStartTime === 'number' && typeof ctaEndTime === 'number') {
      const shouldShow = newTime >= ctaStartTime && newTime <= ctaEndTime;
      setIsCtaVisible(shouldShow);
    } else {
      setIsCtaVisible(false);
    }
  };

  // Calculate non-linear progress based on easing value
  const calculateProgress = (currentTime: number, duration: number, easing: number) => {
    if (duration === 0) return 0;
    
    const progress = currentTime / duration;
    
    // If easing is 0, return linear progress
    if (easing === 0) return progress;
    
    // Apply non-linear transformation
    // Positive easing: starts fast, ends slow
    // Negative easing: starts slow, ends fast
    const absEasing = Math.abs(easing);
    const sign = Math.sign(easing);
    
    // Use exponential function for non-linear effect
    if (sign > 0) {
      // Positive: starts fast, ends slow
      return Math.pow(progress, absEasing);
    } else {
      // Negative: starts slow, ends fast
      return 1 - Math.pow(1 - progress, absEasing);
    }
  };

  // Calculate the visual progress percentage
  const visualProgress = calculateProgress(currentTime, duration, progressEasing);

  // Generate safe metadata for iframe context
  const generateSafeMetadata = () => {
    const baseMetadata = {
      video_id: playbackId,
      video_title: title || 'Untitled Video',
      player_name: 'Mux Player',
      env_key: process.env.NEXT_PUBLIC_MUX_ENV_KEY,
    };

    if (isInIframe) {
      // Add iframe-specific metadata for analytics
      return {
        ...baseMetadata,
        embed_context: 'iframe',
        embed_url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        viewer_user_id: 'embed_anonymous',
        page_type: 'embed',
        // Disable potentially problematic features
        disable_tracking: false,        // Keep analytics enabled
        disable_cookies: true,          // Disable cookies for privacy
      };
    }

    return {
      ...baseMetadata,
      viewer_user_id: 'anonymous',
      page_type: 'normal',
    };
  };

  const safeMetadata = generateSafeMetadata();

  return (
    <div className={`relative w-full h-full ${className}`} style={{ width: '100%', height: '100%' }}>
      {/* Title overlay */}
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10 w-full">
          <h3 className="text-white text-sm font-medium truncate">{title}</h3>
        </div>
      )}
      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 w-full h-full">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <p className="text-red-600 font-medium">{errorMessage}</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => {
                setHasError(false);
                if (playerRef.current) {
                  playerRef.current.load();
                }
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {/* Mux Player - ALWAYS ENABLED WITH SAFE CONFIG */}
      <div className="absolute inset-0 w-full h-full">
        {/* Custom CSS for Mux Player */}
        <style jsx>{`
          mux-player {
            --controls: ${useOriginalProgressBar || showControls ? 'flex' : 'none'} !important;
            --media-controls: ${useOriginalProgressBar || showControls ? 'flex' : 'none'} !important;
            --play-button-color: ${playButtonColor} !important;
            --play-button-size: ${playButtonSize}px !important;
            --play-button-bg-color: ${playButtonBgColor} !important;
          }
          
          mux-player::part(play-button) {
            width: ${playButtonSize}px !important;
            height: ${playButtonSize}px !important;
            min-width: ${playButtonSize}px !important;
            min-height: ${playButtonSize}px !important;
          }
          
          mux-player::part(play-button) svg {
            width: ${Math.max(playButtonSize * 0.4, 16)}px !important;
            height: ${Math.max(playButtonSize * 0.4, 16)}px !important;
          }
          
          mux-player .media-play-button {
            width: ${playButtonSize}px !important;
            height: ${playButtonSize}px !important;
            min-width: ${playButtonSize}px !important;
            min-height: ${playButtonSize}px !important;
          }
          
          mux-player .media-play-button svg {
            width: ${Math.max(playButtonSize * 0.4, 16)}px !important;
            height: ${Math.max(playButtonSize * 0.4, 16)}px !important;
          }
        `}</style>
        <MuxPlayer
          // @ts-expect-error - Mux Player component expects MuxPlayerElement but our custom interface works for our use case
          ref={playerRef}
          streamType="on-demand"
          playbackId={playbackId}
          metadataVideoTitle={title}
          metadataViewerUserId={safeMetadata.viewer_user_id}
          envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
          metadata={safeMetadata}
          autoPlay={autoPlay}
          muted={isMuted}
          loop={loop}
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          // IFRAME SAFETY CONFIGURATIONS
          {...(isInIframe && {
            // Disable features that might cause redirects in iframe
            disableTracking: false,        // Keep analytics enabled
            disableCookies: true,          // Disable cookies for privacy
            targetBlankLinks: false,       // Disable target="_blank" links
            primaryColor: progressBarColor, // Set brand color
            accent: progressBarColor,      // Set accent color
            // Additional iframe safety props
            debug: false,                  // Disable debug mode
            startTime: 0,                  // Always start from beginning
            preload: 'metadata',           // Conservative preload
          })}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            position: 'absolute',
            top: 0,
            left: 0,
            ...(useOriginalProgressBar || showControls ? {} : {
              '--controls': 'none',
              '--media-controls': 'none',
            }),
          } as React.CSSProperties}
        />
        {/* Custom Progress Bar */}
        {!useOriginalProgressBar && !hideProgress && (
          <div className="absolute bottom-0 left-0 right-0 z-40 p-4">
            <div className="w-full bg-gray-600 bg-opacity-50 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${visualProgress * 100}%`,
                  backgroundColor: progressBarColor,
                }}
              />
            </div>
          </div>
        )}

        {!isPlaying && !useOriginalProgressBar && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-30 cursor-pointer"
            onClick={() => {
              if (playerRef.current) {
                playerRef.current.play();
              }
            }}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              className="rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              style={{
                backgroundColor: playButtonBgColor,
                width: `${playButtonSize}px`,
                height: `${playButtonSize}px`,
              }}
              title={`Custom Play Button (${playButtonSize}px)`}
            >
              <svg
                width={Math.max(playButtonSize * 0.4, 16)}
                height={Math.max(playButtonSize * 0.4, 16)}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginLeft: '2px' }}
              >
                <path
                  d="M8 5v14l11-7z"
                  fill={playButtonColor}
                />
              </svg>
            </div>
          </div>
        )}
        {/* Sound Control */}
        {showSoundControl && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
            <SoundControl
              isMuted={isMuted}
              onToggleMute={() => {
                setIsMuted(!isMuted);
                if (playerRef.current) {
                  playerRef.current.muted = !isMuted;
                }
              }}
              color={soundControlColor}
              opacity={soundControlOpacity}
              showControl={showSoundControl}
              size={soundControlSize}
              text={soundControlText}
            />
          </div>
        )}
        {/* CTA Overlay - DISABLED IN IFRAME for safety */}
        {!isInIframe && isCtaVisible && ctaText && ctaButtonText && ctaLink && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-lg shadow-lg px-6 py-4 flex flex-col items-center z-30 max-w-full w-[90%] md:w-auto">
            <div className="text-lg font-semibold text-gray-900 mb-2 text-center break-words">
              {ctaText}
            </div>
            <a
              href={ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-scale-900 text-white rounded hover:bg-scale-800 transition text-center"
              style={{ wordBreak: 'break-word' }}
            >
              {ctaButtonText}
            </a>
          </div>
        )}
        {/* Technical Info */}
        {showTechnicalInfo && (
          <div className="absolute top-0 right-0 bg-black/70 text-white text-xs p-2 z-40">
            <div>Playback ID: {playbackId}</div>
            <div>Title: {title || 'Untitled'}</div>
            <div>Mode: {isInIframe ? '🛡️ Safe Iframe' : '🎥 Normal'}</div>
            <div>Analytics: {isInIframe ? '✅ Enabled (Safe)' : '✅ Enabled'}</div>
            <div>Time: {currentTime.toFixed(1)}s / {duration.toFixed(1)}s</div>
            <div>Actual Progress: {duration > 0 ? ((currentTime / duration) * 100).toFixed(1) : '0'}%</div>
            <div>Visual Progress: {(visualProgress * 100).toFixed(1)}%</div>
            <div>Progress Easing: {progressEasing}</div>
            <div>Play Button Size: {playButtonSize}px</div>
            <div>Play Button Color: {playButtonColor}</div>
            <div>Show Controls: {showControls ? 'Yes' : 'No'}</div>
            <div>Use Original Progress Bar: {useOriginalProgressBar ? 'Yes' : 'No'}</div>
            <div>Is Playing: {isPlaying ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </div>
  );
} 