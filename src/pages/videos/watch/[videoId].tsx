// Watch video page - updated to handle API response formats
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from '../../../components/Dashboard/DashboardLayout';
import DashboardSidebar from '../../../components/Dashboard/DashboardSidebar';
import DashboardMenu from '../../../components/Dashboard/DashboardMenu';
import MuxVideoPlayer from '../../../components/Video/MuxVideoPlayer';
import VideoEmbedCodes from '../../../components/Video/VideoEmbedCodes';
import videoService, { VideoData } from '../../../api-connection/videos';

export default function VideoWatchPage() {
  const router = useRouter();
  const { videoId, tenantId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [showEmbedCodes, setShowEmbedCodes] = useState(false);

  // Helper function to get the videos page URL based on tenant context
  const getVideosUrl = () => {
    return tenantId ? `/${tenantId}/videos` : '/my-videos';
  };

  // Helper function to get edit URL based on tenant context
  const getEditUrl = (id: string) => {
    return tenantId ? `/${tenantId}/videos/edit/${id}` : `/videos/edit/${id}`;
  };

  // Helper function to get upload URL based on tenant context
  const getUploadUrl = () => {
    return tenantId ? `/${tenantId}/upload-video` : '/upload-video';
  };

  useEffect(() => {
    async function fetchVideo() {
      if (!videoId || typeof videoId !== 'string') return;
      
      try {
        setLoading(true);
        console.log('Fetching video with ID:', videoId);
        const response = await videoService.getVideoByUid(videoId);
        console.log('API Response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
          // Handle both array and object responses
          let video: VideoData | null = null;
          
          if (response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
            // If result is an array, get the first element
            video = response.data.result[0];
          } else if (response.data.result && typeof response.data.result === 'object') {
            // If result is a direct object, use it
            video = response.data.result as unknown as VideoData;
          }
          
          if (video) {
            console.log('Video data:', JSON.stringify(video, null, 2));
            setVideoData(video);
          } else {
            throw new Error('No video data available');
          }
        } else {
          // Only throw an error if the response indicates a failure
          if (!response.success) {
            const errorMessage = response.message || 'Failed to load video';
            console.error('API response error:', response);
            throw new Error(errorMessage);
          } else {
            // Handle case where response is successful but no video data
            console.error('API response has no video data:', response);
            throw new Error('No video data available');
          }
        }
      } catch (err) {
        console.error('Error loading video:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [videoId]);

  return (
    <>
      <Head>
        <title>{videoData?.meta?.name || 'Video Player'} - Stream</title>
      </Head>
      
      <DashboardLayout sidebar={<DashboardSidebar />}>
        <div className="p-4 md:p-6">
          <header className="bg-white shadow-sm mb-6 rounded-lg">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">Video Player</h1>
                <p className="text-gray-600 text-sm mt-1">Watch and share your video</p>
              </div>
              <DashboardMenu />
            </div>
          </header>

          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href={getVideosUrl()} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Videos
            </Link>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video and details - takes up 2 columns on lg screens */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                {loading ? (
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-400">Loading video...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-gray-400 p-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="mb-2">{error}</p>
                      <button 
                        onClick={() => router.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : videoData?.playback && videoData.playback.hls ? (
                  <MuxVideoPlayer 
                    src={videoData.playback}
                    title={videoData.meta?.displayOptions?.showTitle ? videoData.meta?.name : undefined}
                    autoPlay={videoData.meta?.displayOptions?.autoPlay}
                    showControls={videoData.meta?.displayOptions?.showPlaybackControls}
                    muted={videoData.meta?.displayOptions?.muted}
                    loop={videoData.meta?.displayOptions?.loop}
                    hideProgress={!videoData.meta?.displayOptions?.showProgressBar}
                    showTechnicalInfo={videoData.meta?.embedOptions?.showTechnicalInfo}
                    useOriginalProgressBar={videoData.meta?.displayOptions?.useOriginalProgressBar}
                    progressBarColor={videoData.meta?.displayOptions?.progressBarColor || '#3b82f6'}
                    progressEasing={typeof videoData.meta?.displayOptions?.progressEasing === 'number' ? videoData.meta.displayOptions.progressEasing : 0.65}
                    playButtonColor={videoData.meta?.displayOptions?.playButtonColor || '#fff'}
                    playButtonSize={typeof videoData.meta?.displayOptions?.playButtonSize === 'number' ? videoData.meta.displayOptions.playButtonSize : 32}
                    playButtonBgColor={videoData.meta?.displayOptions?.playButtonBgColor || '#000000'}
                    poster={videoData.thumbnail || undefined}
                  />
                ) : (
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-gray-400 p-4">
                      <p>Video not available for playback</p>
                      {videoData && videoData.readyToStream === false && (
                        <p className="text-xs mt-2">Video is still processing. Please check back later.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Video details */}
                {videoData && (
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {videoData.meta?.name || 'Untitled Video'}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(videoData.created).toLocaleDateString()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${videoData.readyToStream ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {videoData.readyToStream ? 'Ready to stream' : 'Processing'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setShowEmbedCodes(!showEmbedCodes)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        {showEmbedCodes ? 'Hide embed codes' : 'Show embed codes'}
                      </button>

                      <div className="flex space-x-2">
                        <Link 
                          href={getVideosUrl()}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Back to Videos
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Embed codes (shown conditionally) */}
              {showEmbedCodes && videoData && (
                <VideoEmbedCodes video={videoData} />
              )}
            </div>

            {/* Right sidebar with related videos - takes up 1 column on lg screens */}
            <div className="space-y-6">
              <div className="bg-white shadow-sm rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Video Details</h3>
                
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ) : videoData ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500">Video ID:</span>
                      <div className="font-mono text-xs mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                        {videoData.uid}
                      </div>
                    </div>
                    
                    {videoData.duration && (
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <div className="mt-1">
                          {Math.floor(videoData.duration / 60)}:{(videoData.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    )}
                    
                    {videoData.size && (
                      <div>
                        <span className="text-gray-500">File size:</span>
                        <div className="mt-1">
                          {Math.round(videoData.size / (1024 * 1024))} MB
                        </div>
                      </div>
                    )}
                    
                    {videoData.status && (
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <div className="mt-1">
                          {videoData.status.state}
                        </div>
                      </div>
                    )}
                    
                    {videoData.input && (
                      <div>
                        <span className="text-gray-500">Input:</span>
                        <div className="mt-1">
                          {videoData.input.width}×{videoData.input.height}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No video details available</p>
                )}
              </div>
              
              <div className="bg-white shadow-sm rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">More actions</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href={getEditUrl(typeof videoId === 'string' ? videoId : '')}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit video details
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={getUploadUrl()}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      Upload new video
                    </Link>
                  </li>
                  <li>
                    <button
                      className="flex items-center text-red-600 hover:text-red-800 text-sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
                          // TODO: Implement delete functionality
                          router.push(getVideosUrl());
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete video
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
} 