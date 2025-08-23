export interface CustomVideoPlayerProps {
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