import { useRef, useState, useEffect } from 'react';
import React from 'react';
import SoundControl from './SoundControl';
import VideoSettings from './VideoSettings';
import MuxPlayer from '@mux/mux-player-react';

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

// Define the type for Mux player custom properties
type MuxPlayerStyles = {
  [key: string]: string | number;
  '--media-object-fit': string;
  '--media-object-position': string;
  '--controls': string;
  '--time-range': string;
  '--time-display': string;
  '--controls-backdrop-color': string;
  '--play-button-size': string;
  '--play-button-color': string;
  '--play-button-background': string;
  '--time-range-track-color': string;
  '--time-range-value-color': string;
  '--time-range-hover-color': string;
  '--time-range-thumb-color': string;
  '--time-range-loaded-color': string;
};

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
  progressBarColor = '#3b82f6',
  progressEasing = -3,
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
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCtaVisible, setIsCtaVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
    } catch (e) {
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

  // Handle time updates
  const handleTimeUpdate = (e: any) => {
    const newTime = e.target.currentTime;
    setCurrentTime(newTime);
    setDuration(e.target.duration);

    // Simple CTA visibility check
    if (showCta && ctaText && ctaButtonText && ctaLink && typeof ctaStartTime === 'number' && typeof ctaEndTime === 'number') {
      console.log('CTA Time Check:', { 
        newTime, 
        ctaStartTime, 
        ctaEndTime, 
        shouldShow: newTime >= ctaStartTime && newTime <= ctaEndTime 
      });
      const shouldShow = newTime >= ctaStartTime && newTime <= ctaEndTime;
      setIsCtaVisible(shouldShow);
    } else {
      setIsCtaVisible(false);
    }
  };

  // Handle player errors
  const handleError = (e: any) => {
    setHasError(true);
    
    if (e.type === 'error' && e.target?.error?.code === 2) {
      setErrorMessage('Network error: Please check your internet connection');
    } else if (e.type === 'error' && e.target?.error?.code === 4) {
      setErrorMessage('This video is not supported by your browser');
    } else {
      setErrorMessage('An error occurred while playing the video');
    }
  };

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');
  }, [src]);

  // Calculate progress bar styles
  const progressBarStyles: Partial<MuxPlayerStyles> = {
    '--time-range-height': hideProgress ? '0px' : '4px',
    '--time-range-track-color': 'rgba(255, 255, 255, 0.3)',
    '--time-range-value-color': progressBarColor,
    '--time-range-hover-color': 'rgba(255, 255, 255, 0.5)',
    '--time-range-thumb-color': progressBarColor,
    '--time-range-loaded-color': 'rgba(255, 255, 255, 0.2)',
  };

  // Calculate play button styles
  const playButtonStyles: Partial<MuxPlayerStyles> = {
    '--play-button-size': `${playButtonSize}px`,
    '--play-button-color': playButtonColor,
    '--play-button-background': playButtonBgColor,
    '--seek-backward-button-display': 'none',
    '--seek-forward-button-display': 'none',
  };

  // Calculate controls visibility and background
  const controlsStyles: Partial<MuxPlayerStyles> = {
    '--controls': showControls ? 'flex' : 'none',
    '--controls-backdrop-color': showControls ? 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)' : 'none',
    '--time-range': useOriginalProgressBar ? 'block' : 'none',
    '--time-display': useOriginalProgressBar ? 'block' : 'none',
  };

  // Base styles for video display
  const baseStyles: Partial<MuxPlayerStyles> = {
    '--media-object-fit': 'contain',
    '--media-object-position': 'center',
  };

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
      
      {/* Mux Player */}
      <div className="absolute inset-0 w-full h-full">
        <MuxPlayer
          ref={playerRef}
          streamType="on-demand"
          playbackId={playbackId}
          metadataVideoTitle={title}
          metadataViewerUserId="anonymous"
          envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
          metadata={{
            video_id: playbackId,
            video_title: title || 'Untitled Video',
            player_name: 'Mux Player',
            viewer_user_id: 'anonymous',
            env_key: process.env.NEXT_PUBLIC_MUX_ENV_KEY,
          }} 
          autoPlay={autoPlay}
          muted={isMuted}
          loop={loop}
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
        style={{
            width: '100%',
            height: '100%',
          objectFit: 'contain',
            position: 'absolute',
            top: 0,
            left: 0,
            '--controls': useOriginalProgressBar ? 'flex' : 'none',
          } as React.CSSProperties}
        />

        {/* Custom Progress Bar */}
        {!useOriginalProgressBar && !hideProgress && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800/30 h-2 group/progress w-full">
            <div 
              className="h-full relative group"
              style={{ 
                width: `${(currentTime / duration) * 100}%`,
                backgroundColor: progressBarColor,
                transition: `width ${Math.abs(progressEasing)}s ${progressEasing < 0 ? 'ease-out' : 'ease-in'}`,
              }}
            >
              {/* Progress Bar Handle */}
              <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg"
                style={{ backgroundColor: progressBarColor }}
              />
            </div>
            {/* Hover effect for the entire progress bar */}
            <div className="absolute inset-0 h-4 -top-1 cursor-pointer hover:h-6 transition-all duration-200" />
          </div>
        )}
      </div>

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

      {/* CTA Overlay */}
      {isCtaVisible && ctaText && ctaButtonText && ctaLink && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-lg shadow-lg px-6 py-4 flex flex-col items-center z-30 max-w-full w-[90%] md:w-auto">
          <div className="text-lg font-semibold text-gray-900 mb-2 text-center break-words">
            {ctaText}
          </div>
          <a
            href={ctaLink}
                target="_blank"
                rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center"
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
          <div>Time: {currentTime.toFixed(1)}s / {duration.toFixed(1)}s</div>
        </div>
      )}
    </div>
  );
} 