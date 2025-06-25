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
  const playerRef = useRef<MuxPlayerRef>(null);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCtaVisible, setIsCtaVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

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
      playButtonColor,
      playButtonSize,
      playButtonBgColor
    });
    
    if (playerRef.current) {
      const player = playerRef.current;
      
      // Apply control visibility
      if (!showControls) {
        player.style.setProperty('--controls', 'none');
        player.style.setProperty('--media-controls', 'none');
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
  }, [showControls, playButtonColor, playButtonSize, playButtonBgColor]);

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

  // Handle time updates
  const handleTimeUpdate = (e: Event) => {
    const target = e.target as HTMLVideoElement;
    const newTime = target.currentTime;
    setCurrentTime(newTime);
    setDuration(target.duration);
    // Simple CTA visibility check
    if (showCta && ctaText && ctaButtonText && ctaLink && typeof ctaStartTime === 'number' && typeof ctaEndTime === 'number') {
      const shouldShow = newTime >= ctaStartTime && newTime <= ctaEndTime;
      setIsCtaVisible(shouldShow);
    } else {
      setIsCtaVisible(false);
    }
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
        {/* Custom CSS for Mux Player */}
        <style jsx>{`
          mux-player {
            --controls: ${showControls ? 'flex' : 'none'} !important;
            --media-controls: ${showControls ? 'flex' : 'none'} !important;
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
          onPlay={handlePlay}
          onPause={handlePause}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            position: 'absolute',
            top: 0,
            left: 0,
            ...(showControls ? {} : {
              '--controls': 'none',
              '--media-controls': 'none',
            }),
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
      {/* Custom Play Button Overlay */}
      {!isPlaying && (
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
          <div>Play Button Size: {playButtonSize}px</div>
          <div>Play Button Color: {playButtonColor}</div>
          <div>Show Controls: {showControls ? 'Yes' : 'No'}</div>
          <div>Is Playing: {isPlaying ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
} 