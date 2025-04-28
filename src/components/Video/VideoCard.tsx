import { useState } from 'react';
import Link from 'next/link';
import { VideoData } from '@/api-connection/videos';

interface VideoCardProps {
  video: VideoData;
  onDelete?: (videoId: string) => void;
  className?: string;
}

export default function VideoCard({ video, onDelete, className = '' }: VideoCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  
  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this video?')) {
      onDelete(video.uid);
    }
  };

  return (
    <Link href={`/videos/${video.uid}`} className={`block group ${className}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full border border-gray-100 group-hover:border-blue-200">
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          {/* Thumbnail */}
          <img 
            src={video.thumbnail} 
            alt={video.meta?.name || 'Video thumbnail'} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration || 0)}
          </div>
          
          {/* Status badge */}
          {!video.readyToStream && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
              Processing
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-blue-600/80 rounded-full p-3 transform group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between">
            <h3 className="text-gray-800 font-medium truncate group-hover:text-blue-600 transition-colors">
              {video.meta?.name || 'Untitled Video'}
            </h3>
            
            <div className="relative ml-2">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
                className="text-gray-400 hover:text-gray-600 focus:outline-none p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {showOptions && (
                <div 
                  className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a 
                    href={`/videos/${video.uid}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </a>
                  <a 
                    href={video.playback.hls} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open Stream URL
                  </a>
                  {onDelete && (
                    <button 
                      onClick={handleDelete}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Delete Video
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-500 text-sm mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(video.created)}
          </p>
          
          {video.meta?.filetype && (
            <p className="text-gray-500 text-xs mt-2 flex items-center">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {video.meta.filetype.toUpperCase()}
              </span>
              <span className="ml-2">{Math.round((video.size || 0) / (1024 * 1024))} MB</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
} 