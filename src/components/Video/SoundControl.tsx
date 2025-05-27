import React, { useState, useEffect } from 'react';

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
  size = 64
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSize, setCurrentSize] = useState(size);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setCurrentSize(size);
  }, [size]);

  const handleClick = () => {
    setIsVisible(false);
    onToggleMute();
  };

  if (!showControl || !isVisible) return null;

  const containerSize = currentSize * 4;
  
  // Centered speaker paths with better proportions
  const speakerPath = isMuted
    ? "M12.5 8v8l-4-3H5v-2h3.5l4-3zm5.5 2l2 2-2 2m-3-4l2 2-2 2" // Muted with X
    : "M12.5 8v8l-4-3H5v-2h3.5l4-3zm3 1.5c1.5 1.2 1.5 3.8 0 5m2.5-7c2.5 2 2.5 6 0 8"; // Unmuted with waves

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 flex items-center justify-center"
      style={{
        width: containerSize,
        height: containerSize,
        opacity: 1,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 24 24"
        width={containerSize}
        height={containerSize}
        style={{
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }}
      >
        <defs>
          <mask id={`speaker-hole-${containerSize}`}>
            <rect x="0" y="0" width="24" height="24" fill="white" />
            <g transform="translate(7, 7) scale(0.4)">
              <path
                d={speakerPath}
                fill="black"
                strokeWidth="0.5"
                stroke="black"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          </mask>
        </defs>

        {/* Main square with transparent icon */}
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="2"
          fill={color}
          fillOpacity={opacity}
          mask={`url(#speaker-hole-${containerSize})`}
        />

        {/* Subtle border for definition */}
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="2"
          fill="none"
          stroke={color}
          strokeOpacity={opacity * 0.3}
          strokeWidth="0.00"
        />
      </svg>
    </div>
  );
};

export default SoundControl; 