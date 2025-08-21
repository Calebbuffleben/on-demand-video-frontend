import React, { useRef, useEffect, useState, useCallback } from 'react';
import analyticsService from '@/api-connection/analytics';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import type { ShakaPlayer } from 'shaka-player/dist/shaka-player.compiled.js';

interface CustomVideoPlayerProps {
  src: {
    hls: string;
    dash?: string;
  };
  poster?: string;
  title?: string;
  controls?: boolean;
  showControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  onError?: (error: Error) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  
  // Custom features
  enableCTA?: boolean;
  // Backward-compatible alias used in some pages
  showCta?: boolean;
  ctaText?: string;
  ctaButtonText?: string;
  ctaLink?: string;
  ctaStartTime?: number;
  ctaEndTime?: number;
  hideProgress?: boolean;
  hideVolumeControl?: boolean;
  hideFullscreenButton?: boolean;
  customTheme?: 'dark' | 'light';
  showTechnicalInfo?: boolean;
  
  // Internal video support
  videoId?: string;

  // Mux-like display options
  showProgressBar?: boolean;
  showPlaybackControls?: boolean;
  progressBarColor?: string;
  useOriginalProgressBar?: boolean;
  progressEasing?: number;
  playButtonColor?: string;
  playButtonBgColor?: string;
  playButtonSize?: number;
  showSoundControl?: boolean;
  soundControlText?: string;
  soundControlColor?: string;
  soundControlOpacity?: number;
  soundControlSize?: number;
}

export default function CustomVideoPlayer({
  src,
  poster,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  width = '100%',
  height = 'auto',
  className = '',
  onError,
  onPlay,
  onPause,
  onTimeUpdate,
  onDurationChange,
  enableCTA = false,
  showCta = false,
  ctaText,
  ctaButtonText,
  ctaLink,
  ctaStartTime = 0,
  ctaEndTime = 0,
  hideProgress = false,
  hideVolumeControl = false,
  hideFullscreenButton = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  customTheme = 'dark',
  showTechnicalInfo = false,
  showProgressBar = true,
  showPlaybackControls = true,
  progressBarColor = '#3B82F6',
  useOriginalProgressBar = false,
  progressEasing = 0,
  playButtonColor = '#000000',
  playButtonBgColor = '#FFFFFF',
  playButtonSize = 48,
  showSoundControl = false,
  soundControlText = 'Sound',
  soundControlColor = '#FFFFFF',
  soundControlOpacity = 0.8,
  soundControlSize = 64,
  videoId
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shakaPlayerRef = useRef<ShakaPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Player state
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [visualProgress, setVisualProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCTA, setShowCTA] = useState(false);
  const [mseSupported, setMseSupported] = useState<boolean | null>(null);
  const [playbackToken, setPlaybackToken] = useState<string | null>(null);
  const [computedPoster, setComputedPoster] = useState<string | undefined>(poster);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showControls, setShowControls] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const sessionIdRef = useRef<string>(typeof window !== 'undefined' ? (window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) : 'srv');

  // Normalize CTA enabled flag: accept either enableCTA or showCta
  const ctaEnabled = Boolean(enableCTA || showCta);





  // Detect MSE support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = !!(window.MediaSource || (window as { WebKitMediaSource?: typeof MediaSource }).WebKitMediaSource);
      setMseSupported(supported);
      if (showTechnicalInfo) {
        console.log('MSE Support:', supported);
      }
    }
  }, [showTechnicalInfo]);

  // Generate playback token for internal videos
  const generatePlaybackToken = useCallback(async (videoId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/videos/${videoId}/test-playback-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        console.warn(`Failed to generate token: ${response.status} - continuing without token`);
        return null;
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.warn('Error generating playback token, continuing without token:', error);
      return null;
    }
  }, []);

  // Initialize Shaka Player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src.hls || mseSupported === null) return;

    let destroyed = false;
    let player: ShakaPlayer | null = null;

    const initializeShaka = async () => {
      if (destroyed) return;
      
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');

      try {
        console.log('🎬 Initializing Shaka Player:', { 
          src: src.hls, 
          videoId, 
          mseSupported,
          userAgent: navigator.userAgent 
        });

        // Generate token for internal videos
        let token: string | null = null;
        if (videoId && src.hls.includes('/api/videos/stream/')) {
          try {
            // Add a small delay to ensure backend is ready
            await new Promise(resolve => setTimeout(resolve, 100));
            token = await generatePlaybackToken(videoId);
            if (token) {
              setPlaybackToken(token);
              console.log('✅ Generated playback token successfully');
            } else {
              console.log('⚠️ No token generated, continuing without authentication');
            }
          } catch (error) {
            console.warn('⚠️ Failed to generate playback token:', error);
          }
        }

        // Cleanup any previous instance
        if (shakaPlayerRef.current) {
          try { 
            await shakaPlayerRef.current.destroy(); 
            console.log('🧹 Cleaned up previous Shaka instance');
          } catch (e) {
            console.warn('Cleanup warning:', e);
          }
          shakaPlayerRef.current = null;
        }

        // Build source URL with token
        let videoSrc = src.hls;
        if (token && src.hls.includes('/api/videos/stream/')) {
          const separator = videoSrc.includes('?') ? '&' : '?';
          videoSrc = `${videoSrc}${separator}token=${token}`;
        }

        // Update poster with token
        if (poster && token && poster.includes('/api/videos/thumb/')) {
          const sep = poster.includes('?') ? '&' : '?';
          setComputedPoster(`${poster}${sep}token=${token}`);
        } else {
          setComputedPoster(poster);
        }

        console.log('🎯 Video source:', videoSrc);

        // Force Shaka Player for all browsers except Safari/iOS
        const ua = navigator.userAgent;
        const isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua);
        const isIOS = /iPhone|iPad|iPod/.test(ua);
        
        if ((isSafari || isIOS) && video.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('🍎 Using native HLS for Safari/iOS');
          video.src = videoSrc;
          setIsLoading(false);
          if (autoPlay) video.play().catch(() => undefined);
          return;
        }

        // Initialize Shaka Player
        console.log('🚀 Loading Shaka Player module...');
        const shakaModule = await import('shaka-player/dist/shaka-player.compiled.js');
        const shaka = shakaModule.default || shakaModule;
        
        if (destroyed) return;

        // Install polyfills
        if (typeof shaka.polyfill?.installAll === 'function') {
          shaka.polyfill.installAll();
          console.log('✅ Shaka polyfills installed');
        }

        // Check browser support
        if (!shaka.Player || (typeof shaka.Player.isBrowserSupported === 'function' && !shaka.Player.isBrowserSupported())) {
          throw new Error('Shaka Player not supported on this browser');
        }

        console.log('✅ Shaka Player supported, creating instance...');
        player = new shaka.Player(video);
        shakaPlayerRef.current = player;

        // Configure Shaka Player for optimal Chrome performance
        const config = {
          streaming: {
            rebufferingGoal: 2,
            bufferingGoal: 10,
            bufferBehind: 30,
            retryParameters: {
              timeout: 30000,
              maxAttempts: 3,
              backoffFactor: 2.0,
              fuzzFactor: 0.5
            }
          },
          drm: {
            retryParameters: {
              timeout: 30000,
              maxAttempts: 3,
              backoffFactor: 2.0,
              fuzzFactor: 0.5
            }
          },
          manifest: {
            retryParameters: {
              timeout: 30000,
              maxAttempts: 3,
              backoffFactor: 2.0,
              fuzzFactor: 0.5
            }
          },
          abr: {
            enabled: true,
            defaultBandwidthEstimate: 500000,
            switchInterval: 8,
            bandwidthUpdateInterval: 500,
            useNetworkInformation: false
          }
        };

        player.configure(config);
        console.log('⚙️ Shaka Player configured');

        // Setup networking for token authentication
        if (token) {
          const networkingEngine = player.getNetworkingEngine();
          if (networkingEngine) {
            networkingEngine.registerRequestFilter((type: string, request: { uris?: string[] }) => {
              if (Array.isArray(request.uris)) {
                request.uris = request.uris.map((uri: string) => {
                  // Only add token to stream URLs, not thumbnail URLs
                  if (uri.includes('/api/videos/stream/') && !uri.includes('token=')) {
                    const separator = uri.includes('?') ? '&' : '?';
                    return `${uri}${separator}token=${token}`;
                  }
                  return uri;
                });
              }
            });
            console.log('🔐 Token filter registered (stream only)');
          }
        }

        // Error handling
        player.addEventListener('error', (errorEvent: { detail: { code: number; category: string; severity: number; message: string } }) => {
          const error = errorEvent.detail;
          console.error('❌ Shaka Player Error:', {
            code: error.code,
            category: error.category,
            severity: error.severity,
            message: error.message
          });

          if (error.severity === 2) { // CRITICAL error
            setHasError(true);
            setErrorMessage(`Erro de reprodução: ${error.message}`);
            onError?.(new Error(`Shaka Error ${error.code}: ${error.message}`));
            setIsLoading(false);
          }
        });

        // Load the manifest
        console.log('📺 Loading video manifest...');
        if (player) {
          await player.load(videoSrc);
        }
        
        if (destroyed) return;

        console.log('✅ Video loaded successfully');
        setIsLoading(false);
        setControlsVisible(true);
        
        // Ensure correct playback rate
        video.playbackRate = 1.0;
        video.defaultPlaybackRate = 1.0;
        
        // Log video properties for debugging
        console.log('🎬 Video properties:', {
          duration: video.duration,
          currentTime: video.currentTime,
          playbackRate: video.playbackRate,
          defaultPlaybackRate: video.defaultPlaybackRate,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          readyState: video.readyState
        });
        
        if (autoPlay) {
          try {
            await video.play();
            console.log('▶️ Autoplay started');
          } catch (playError) {
            console.warn('Autoplay failed:', playError);
          }
        }

      } catch (error) {
        console.error('💥 Shaka initialization failed:', error);
        
        if (!destroyed) {
          setHasError(true);
          setErrorMessage(`Falha ao inicializar o player: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          onError?.(error instanceof Error ? error : new Error('Shaka initialization failed'));
          setIsLoading(false);
        }
      }
    };

    initializeShaka();

    return () => {
      console.log('🧹 Cleaning up Shaka Player...');
      destroyed = true;
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          console.warn('Cleanup error:', e);
        }
      }
      shakaPlayerRef.current = null;
    };
  }, [src.hls, videoId, autoPlay, mseSupported, showTechnicalInfo, onError, generatePlaybackToken, poster]);

  // Video event handlers
  //TODO: Refactor this to use a more modern approach
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      onDurationChange?.(video.duration);
      
      // Ensure correct playback rate when metadata is loaded
      if (video.playbackRate !== 1.0) {
        console.log('🔧 Fixing playback rate from', video.playbackRate, 'to 1.0');
        video.playbackRate = 1.0;
        video.defaultPlaybackRate = 1.0;
      }
    };

    const handleTimeUpdate = () => {
      const newTime = video.currentTime;
      setCurrentTime(newTime);
      onTimeUpdate?.(newTime);
      
      // Monitor and fix playback rate issues
      if (video.playbackRate !== 1.0 && video.playbackRate !== 0) {
        console.log('🔧 Detected incorrect playback rate:', video.playbackRate, '- fixing to 1.0');
        video.playbackRate = 1.0;
      }
      
      // Show CTA if enabled and within time range
      if (ctaEnabled && ctaStartTime !== undefined && ctaEndTime !== undefined) {
        const shouldShowCTA = video.currentTime >= ctaStartTime && video.currentTime <= ctaEndTime;
        setShowCTA(shouldShowCTA);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
      // Fire play event
      if (videoId) {
        analyticsService.sendEvent({
          videoId,
          eventType: 'play',
          currentTime: Math.floor(video.currentTime || 0),
          duration: Math.floor(video.duration || 0),
          sessionId: sessionIdRef.current,
        });
      }
      
      // Ensure correct playback rate when play starts
      if (video.playbackRate !== 1.0) {
        console.log('🔧 Fixing playback rate on play from', video.playbackRate, 'to 1.0');
        video.playbackRate = 1.0;
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
      if (videoId) {
        analyticsService.sendEvent({
          videoId,
          eventType: 'pause',
          currentTime: Math.floor(video.currentTime || 0),
          duration: Math.floor(video.duration || 0),
          sessionId: sessionIdRef.current,
        });
      }
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleRateChange = () => {
      console.log('🎬 Playback rate changed to:', video.playbackRate);
      // Don't auto-fix here as user might be changing speed intentionally
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ratechange', handleRateChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ratechange', handleRateChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableCTA, ctaStartTime, ctaEndTime, onPlay, onPause, onTimeUpdate, onDurationChange]);

  // Update visual progress with easing
  useEffect(() => {
    if (duration > 0) {
      const targetProgress = (currentTime / duration) * 100;
      
      // Apply easing only if not at the very end to maintain sync
      let finalProgress: number;
      if (targetProgress >= 100) {
        finalProgress = 100; // Always sync at the end
      } else if (targetProgress <= 0) {
        finalProgress = 0; // Always sync at the start
      } else {
        finalProgress = getEasedProgress(targetProgress);
      }
      
      setVisualProgress(finalProgress);
      
      // Debug visual progress (always show for testing)
      console.log('Visual Progress Update:', {
        currentTime,
        duration,
        targetProgress,
        finalProgress,
        visualProgress
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, duration]);

  // Heartbeat (timeupdate every 5s)
  useEffect(() => {
    if (!videoId) return;
    const interval = setInterval(() => {
      const v = videoRef.current;
      if (!v) return;
      analyticsService.sendEvent({
        videoId,
        eventType: 'timeupdate',
        currentTime: Math.floor(v.currentTime || 0),
        duration: Math.floor(v.duration || 0),
        sessionId: sessionIdRef.current,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [videoId]);

  // Ended event
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => {
      if (videoId) {
        analyticsService.sendEvent({
          videoId,
          eventType: 'ended',
          currentTime: Math.floor(v.currentTime || 0),
          duration: Math.floor(v.duration || 0),
          sessionId: sessionIdRef.current,
        });
      }
    };
    v.addEventListener('ended', onEnded);
    return () => v.removeEventListener('ended', onEnded);
  }, [videoId]);

  // Control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => undefined);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    video.muted = newVolume === 0;
  };

  const handleSeek = (newTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = newTime;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleCTAClick = () => {
    if (ctaLink) {
      window.open(ctaLink, '_blank');
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper function to calculate eased progress based on progressEasing
  const getEasedProgress = (currentProgress: number) => {
    if (!progressEasing || progressEasing === 0) {
      return currentProgress;
    }

    // Normalize progress to 0-1 range
    const normalizedProgress = currentProgress / 100;

    // Map progressEasing to an exponent: >0 => ease-out (exp < 1), <0 => ease-in (exp > 1)
    const clamped = Math.max(-5, Math.min(5, progressEasing));
    const k = Math.abs(clamped);
    const exponent = clamped > 0 ? 1 / (1 + k) : 1 + k; // pos => <1 (fast start), neg => >1 (slow start)

    let easedProgress = Math.pow(normalizedProgress, exponent);

    // Ensure we don't exceed bounds and maintain sync at the ends
    if (currentProgress >= 100) {
      easedProgress = 1;
    } else if (currentProgress <= 0) {
      easedProgress = 0;
    } else {
      easedProgress = Math.min(1, Math.max(0, easedProgress));
    }

    return easedProgress * 100;
  };

  // Helper function to calculate transition duration based on progressEasing
  const getTransitionDuration = (isCustomBar: boolean = false) => {
    // If near the end, minimize transition so the bar finishes exactly with the video
    if (duration > 0) {
      const progressPct = (currentTime / duration) * 100;
      const remaining = Math.max(0, duration - currentTime);
      if (progressPct >= 99.5 || remaining <= 0.3) {
        return 0.06; // essentially instant to snap to the end cleanly
      }
    }

    // Base durations kept subtle to avoid noticeable lag
    const baseDuration = isCustomBar ? 0.15 : 0.1;
    const clamped = Math.max(-5, Math.min(5, progressEasing || 0));
    const k = Math.abs(clamped);
    const easingMultiplier = isCustomBar ? 0.06 : 0.04;
    const calculated = k * easingMultiplier;

    return Math.max(baseDuration, calculated);
  };

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const retryPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    
    // Trigger re-initialization by updating a state
    window.location.reload();
  };

  const fixPlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.playbackRate !== 1.0) {
      console.log('🔧 Manually fixing playback rate from', video.playbackRate, 'to 1.0');
      video.playbackRate = 1.0;
      video.defaultPlaybackRate = 1.0;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      style={{ width, height: height === 'auto' ? '400px' : height }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain relative z-0 min-h-[300px]"
        poster={computedPoster}
        muted={muted}
        loop={loop}
        playsInline
        webkit-playsinline="true"
        controls={false}
      />

      {/* Big play button when video is not playing */}
      {!isPlaying && !isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 pointer-events-none z-5">
          <button
            onClick={togglePlay}
            className="rounded-full transition-all duration-200 shadow-lg pointer-events-auto"
            style={{
              backgroundColor: playButtonBgColor,
              width: playButtonSize + 24,
              height: playButtonSize + 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={playButtonSize} style={{ color: playButtonColor }} />
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="flex flex-col items-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            <p className="text-sm">Carregando vídeo...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-20">
          <div className="text-center text-white p-4">
            <div className="text-red-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Erro de reprodução</h3>
            <p className="text-sm text-gray-300 mb-4">{errorMessage}</p>
            <button
              onClick={retryPlay}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* CTA Overlay */}
      {showCTA && ctaText && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-15">
          <div className="text-center text-white p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">{ctaText}</h3>
            {ctaButtonText && ctaLink && (
              <button
                onClick={handleCTAClick}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                {ctaButtonText}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      {controls && controlsVisible && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 z-10 transition-opacity duration-300">
          {/* Progress Bar */}
          {showProgressBar !== false && !hideProgress && duration > 0 && (
            <div className="mb-4">
              {/* Default Progress Bar */}
              {!useOriginalProgressBar && (
                <div className="flex items-center gap-2 text-white text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${visualProgress}%, #4B5563 ${visualProgress}%, #4B5563 100%)`,
                        transition: `all ${getTransitionDuration(false)}s ease-in-out`
                      }}
                    />
                  </div>
                  <span>{formatTime(duration)}</span>
                </div>
              )}

              {/* Custom Progress Bar - VSL Style */}
              {useOriginalProgressBar && (
                <div className="flex items-center gap-3 text-white">
                  <span className="text-xs font-medium">{formatTime(currentTime)}</span>
                  <div className="flex-1 relative">
                    {/* Background track */}
                    <div className="w-full h-2 bg-black bg-opacity-50 rounded-full border border-white border-opacity-20"></div>
                    
                    {/* Progress fill with VSL style */}
                    <div 
                      className="absolute top-0 left-0 h-2 rounded-full"
                      style={{
                        width: `${visualProgress}%`,
                        background: `linear-gradient(90deg, ${progressBarColor} 0%, ${progressBarColor}dd 100%)`,
                        boxShadow: `0 0 10px ${progressBarColor}40`,
                        transition: `all ${getTransitionDuration(true)}s ease-in-out`
                      }}
                    ></div>
                    
                    {/* Interactive range input */}
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-xs font-medium">{formatTime(duration)}</span>
                </div>
              )}
            </div>
          )}

          {/* Control buttons */}
          {showPlaybackControls !== false && (
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              {!hideVolumeControl && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!hideFullscreenButton && (
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <Maximize size={20} />
                </button>
              )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mux-like Sound Control Overlay - Central overlay when showSoundControl is true */}
      {showSoundControl && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div
            className="cursor-pointer"
            style={{
              width: soundControlSize * 4,
              height: soundControlSize * 4,
              opacity: 1,
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
            onClick={toggleMute}
          >
            <svg
              viewBox="0 0 24 24"
              width={soundControlSize * 4}
              height={soundControlSize * 4}
              style={{
                transition: 'all 0.3s ease'
              }}
            >
              <defs>
                <mask id={`speaker-hole-${soundControlSize}`}>
                  <rect x="0" y="0" width="24" height="24" fill="white" />
                  <g transform="translate(7, 7) scale(0.4)">
                    <path
                      d={isMuted 
                        ? "M12.5 8v8l-4-3H5v-2h3.5l4-3zm5.5 2l2 2-2 2m-3-4l2 2-2 2"
                        : "M12.5 8v8l-4-3H5v-2h3.5l4-3zm3 1.5c1.5 1.2 1.5 3.8 0 5m2.5-7c2.5 2 2.5 6 0 8"
                      }
                      fill="black"
                      strokeWidth="0.5"
                      stroke="black"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </g>
                </mask>
              </defs>

              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="2"
                fill={soundControlColor}
                fillOpacity={soundControlOpacity}
                mask={`url(#speaker-hole-${soundControlSize})`}
              />

              <text
                x="12"
                y="7"
                textAnchor="middle"
                fill={soundControlColor}
                fontSize="3"
                fontFamily="system-ui"
                style={{
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              >
                {soundControlText || 'Sound'}
              </text>

              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="2"
                fill="none"
                stroke={soundControlColor}
                strokeOpacity={soundControlOpacity * 0.3}
                strokeWidth="0.00"
              />
            </svg>
          </div>
        </div>
      )}



      {/* Technical info overlay (debug) */}
      {showTechnicalInfo && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs">
          <div>MSE Support: {mseSupported ? 'Yes' : 'No'}</div>
          <div>Player: Shaka Player</div>
          <div>Source: {src.hls}</div>
          <div>Token: {playbackToken ? 'Generated' : 'None'}</div>
          <div>Status: {isLoading ? 'Loading' : hasError ? 'Error' : 'Ready'}</div>
          <div>Playback Rate: {videoRef.current?.playbackRate || 'N/A'}</div>
          <button
            onClick={fixPlaybackRate}
            className="mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Fix Playback Rate
          </button>
        </div>
      )}
    </div>
  );
}