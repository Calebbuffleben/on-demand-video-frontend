import React from 'react';
import { HiCog } from 'react-icons/hi2';

interface VideoSettingsProps {
  enableAutoplayMuted: boolean;
  onToggleAutoplayMuted: (enabled: boolean) => void;
  className?: string;
}

const VideoSettings: React.FC<VideoSettingsProps> = ({
  enableAutoplayMuted,
  onToggleAutoplayMuted,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        aria-label="Video Settings"
      >
        <HiCog className="w-5 h-5 text-white" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-black/90 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <span className="mr-3">Autoplay Muted</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={enableAutoplayMuted}
                  onChange={(e) => onToggleAutoplayMuted(e.target.checked)}
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  enableAutoplayMuted ? 'bg-scale-600' : 'bg-silver-600'
                }`} />
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform transform ${
                  enableAutoplayMuted ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSettings; 