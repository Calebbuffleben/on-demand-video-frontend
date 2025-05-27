import React, { useState, useEffect } from 'react';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';

interface SoundControlProps {
  isMuted: boolean;
  onToggleMute: () => void;
  color?: string;
  opacity?: number;
  showControl?: boolean;
  size?: number;
}

const SoundControl: React.FC<SoundControlProps> = ({
  isMuted,
  onToggleMute,
  color = '#ffffff',
  opacity = 0.8,
  showControl = true,
  size = 24
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSize, setCurrentSize] = useState(size);

  // Update currentSize when size prop changes
  useEffect(() => {
    console.log('[DEBUG] SoundControl size changed to:', size);
    setCurrentSize(size);
  }, [size]);

  if (!showControl) return null;

  const containerSize = currentSize * 1.5;

  return (
    <div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 cursor-pointer z-30"
      style={{
        backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        transform: isHovered ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%) scale(1)',
        padding: `${currentSize / 4}px`,
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onToggleMute}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isMuted ? (
        <HiSpeakerXMark style={{ width: currentSize, height: currentSize }} className="text-black" />
      ) : (
        <HiSpeakerWave style={{ width: currentSize, height: currentSize }} className="text-black" />
      )}
    </div>
  );
};

export default SoundControl; 