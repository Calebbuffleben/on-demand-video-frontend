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

/**
 * @deprecated MuxVideoPlayer has been replaced by CustomVideoPlayer
 * This component is kept for backward compatibility but should not be used in new code.
 * Use CustomVideoPlayer instead for HLS.js based video playback.
 */
export default function MuxVideoPlayer(_props: MuxVideoPlayerProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h3>⚠️ MuxVideoPlayer Deprecated</h3>
        <p>Please use CustomVideoPlayer instead</p>
        <p style={{ fontSize: '12px', opacity: 0.7 }}>
          This component has been replaced with a custom HLS.js implementation
        </p>
      </div>
    </div>
  );
}