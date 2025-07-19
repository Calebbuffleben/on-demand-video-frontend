import React from 'react';

interface ScaleLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  variant?: 'dark' | 'light';
}

const ScaleLogo: React.FC<ScaleLogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true,
  variant = 'dark'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const isLight = variant === 'light';
  const bgColor = isLight ? 'bg-white' : 'bg-scale-900';
  const textColor = isLight ? 'text-scale-900' : 'text-white';

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} ${bgColor} rounded-lg flex items-center justify-center`}>
        <svg 
          className="w-3/4 h-3/4 text-white" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`ml-2 font-bold ${textColor} ${textSizes[size]}`}>
          Scale
        </span>
      )}
    </div>
  );
};

export default ScaleLogo; 