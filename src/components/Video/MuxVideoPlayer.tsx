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
}

export default function MuxVideoPlayer({
  src,
  title,
  autoPlay = false,
  className = '',
}: MuxVideoPlayerProps) {
  // Extract the playback ID from the HLS URL
  const playbackId = src.hls.split('/').pop()?.split('.')[0] || '';

  return (
    <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
          <h3 className="text-white text-sm font-medium truncate">{title}</h3>
        </div>
      )}
      
      <MuxPlayer
        streamType="on-demand"
        playbackId={playbackId}
        metadata={{
          video_title: title || 'Video',
        }}
        autoPlay={autoPlay}
        muted={autoPlay}
        theme="dark"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#ffffff',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          '--controls': 'none'
        } as React.CSSProperties}
      />
    </div>
  );
} 