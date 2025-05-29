import React, { useState, useEffect, useRef } from 'react';
import videoService from '../../api-connection/videos';

interface SoundControlProps {
  isMuted: boolean;
  onToggleMute: () => void;
  color?: string;
  opacity?: number;
  showControl?: boolean;
  size?: number;
  text?: string;
  id?: string;
  onTextChange?: (text: string) => void;
}

const SoundControl: React.FC<SoundControlProps> = ({
  isMuted,
  onToggleMute,
  color = '#ffffff',
  opacity = 0.8,
  showControl = true,
  size = 64,
  text = 'Sound',
  id,
  onTextChange
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSize, setCurrentSize] = useState(size);
  const [isVisible, setIsVisible] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentSize(size);
  }, [size]);

  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) {
      return;
    }
    setIsVisible(false);
    onToggleMute();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setCurrentText(newText);
    onTextChange?.(newText);
  };

  //This function is notbeign called when the text is changed.
  const handleBlur = async () => {
    setIsEditing(false);
    //if (!id) return; // Skip API call if no id is provided
    
    try {
      console.log('----------------------------------Current text value:', currentText);
      console.log('Updating sound control with values:', {
        id,
        text: currentText,
        size: currentSize,
        color,
        opacity
      });

      const displayOptions = {
        soundControlText: currentText,
        soundControlSize: currentSize,
        soundControlColor: color,
        soundControlOpacity: opacity
      };

      console.log('Display options being sent:', displayOptions);

      const response = await videoService.updateVideoOptions(
        id || '',
        displayOptions,
        {
          showVideoTitle: true,
          showUploadDate: true,
          showMetadata: true,
          allowFullscreen: true,
          responsive: true,
          showBranding: true,
          showTechnicalInfo: false
        }
      );
      
      console.log('Sound control update response:', response);
      
      if (!response.success) {
        console.error('Failed to update sound control:', response.message);
      } else {
        console.log('Sound control updated successfully with values:', {
          text: currentText,
          size: currentSize,
          color,
          opacity
        });
      }
    } catch (error) {
      console.error('Failed to update sound control:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  if (!showControl || !isVisible) return null;

  const containerSize = currentSize * 4;
  
  const speakerPath = isMuted
    ? "M12.5 8v8l-4-3H5v-2h3.5l4-3zm5.5 2l2 2-2 2m-3-4l2 2-2 2"
    : "M12.5 8v8l-4-3H5v-2h3.5l4-3zm3 1.5c1.5 1.2 1.5 3.8 0 5m2.5-7c2.5 2 2.5 6 0 8";

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
    

      {isEditing && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-40">
          <input
            ref={inputRef}
            type="text"
            value={currentText}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-3/4 text-center px-2 py-1 rounded"
            style={{
              color,
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${color}`,
              fontSize: `${containerSize / 12}px`,
              outline: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter text..."
          />
        </div>
      )}

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

        <text
          x="12"
          y="7"
          textAnchor="middle"
          fill={color}
          fontSize="3"
          fontFamily="system-ui"
          style={{
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        >
          {currentText}
        </text>

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