import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOrganization } from '@clerk/nextjs';
import Head from 'next/head';
import Link from 'next/link';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';
import MuxVideoPlayer from '@/components/Video/MuxVideoPlayer';
import CoverUploader from '@/components/Video/CoverUploader';
import videoService, { VideoData } from '@/api-connection/videos';

export default function VideoDetailPage() {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const router = useRouter();
  const { videoId } = router.query;
  const { organization } = useOrganization();
  const { tenantId } = router.query;

  useEffect(() => {
    if (videoId && typeof videoId === 'string') {
      fetchVideo(videoId);
    }
  }, [videoId]);

  const fetchVideo = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await videoService.getVideoByUid(id);
      
      if (response.success && response.data.result && response.data.result.length > 0) {
        setVideo(response.data.result[0]);
      } else {
        throw new Error('Video not found');
      }
    } catch (err: any) {
      console.error('Error fetching video:', err);
      setError(err.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to navigate back to videos
  const getVideosUrl = () => {
    return '/my-videos';
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video? This cannot be undone.')) {
      // In a real implementation, you'd call an API to delete the video
      // For now, we'll just redirect back to the videos page
      router.push('/my-videos');
      // TODO: Implement actual deletion API call when backend supports it
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleCoverUpload = async (file: File) => {
    if (!video?.uid) return;

    try {
      setIsUploadingCover(true);
      const response = await videoService.uploadCover(video.uid, file);
      if (response.success && response.data.result.length > 0) {
        setVideo(response.data.result[0]);
      }
    } catch (err: any) {
      console.error('Error uploading cover:', err);
      alert('Failed to upload cover image. Please try again.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{video?.meta?.name || 'Video Detail'} - Cloudflare Stream</title>
      </Head>

      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-white truncate">
                {video?.meta?.name || 'Video Detail'}
              </h1>
              <p className="text-blue-100 text-sm mt-1">Video Management</p>
            </div>
            <DashboardMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href={getVideosUrl()} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Videos
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white p-12 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading video...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
                <div className="mt-2">
                  <button 
                    onClick={() => router.back()}
                    className="text-sm text-red-700 underline hover:text-red-800"
                  >
                    Go back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Detail View */}
        {!loading && !error && video && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <MuxVideoPlayer 
                  src={video.playback}
                  title={video.meta?.displayOptions?.showTitle ? video.meta?.name : undefined}
                  autoPlay={video.meta?.displayOptions?.autoPlay}
                  showControls={video.meta?.displayOptions?.showPlaybackControls}
                  muted={video.meta?.displayOptions?.muted}
                  loop={video.meta?.displayOptions?.loop}
                  hideProgress={!video.meta?.displayOptions?.showProgressBar}
                  showTechnicalInfo={video.meta?.embedOptions?.showTechnicalInfo}
                  useOriginalProgressBar={video.meta?.displayOptions?.useOriginalProgressBar}
                  progressBarColor={video.meta?.displayOptions?.progressBarColor || '#3b82f6'}
                  progressEasing={typeof video.meta?.displayOptions?.progressEasing === 'number' ? video.meta.displayOptions.progressEasing : 0.65}
                  playButtonColor={video.meta?.displayOptions?.playButtonColor || '#fff'}
                  playButtonSize={typeof video.meta?.displayOptions?.playButtonSize === 'number' ? video.meta.displayOptions.playButtonSize : 32}
                  playButtonBgColor={video.meta?.displayOptions?.playButtonBgColor || '#000000'}
                />
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-medium text-gray-900 mb-2">{video.meta?.name}</h2>
                
                {/* Cover Uploader */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Video Cover</h3>
                  <CoverUploader
                    onCoverSelect={handleCoverUpload}
                    currentCover={video.thumbnail}
                  />
                  {isUploadingCover && (
                    <p className="mt-2 text-sm text-blue-600">
                      Uploading cover image...
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {video.meta?.filetype?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {formatDuration(video.duration)} duration
                  </span>
                  
                  {video.readyToStream ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ready to Stream
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Uploaded on {formatDate(video.created)}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleDelete}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Video
                    </button>
                    
                    <button 
                      onClick={() => copyToClipboard(video.playback.hls)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Stream URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Video Info Column */}
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Video Information</h3>
                </div>
                
                <div className="p-6">
                  <dl className="space-y-4">
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Video ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{video.uid}</dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Original File</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{video.meta?.filename}</dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Size</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatFileSize(video.size || 0)}</dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Resolution</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{video.input?.width || 0} x {video.input?.height || 0}</dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(video.created)}</dd>
                    </div>
                    
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Modified</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(video.modified)}</dd>
                    </div>
                    
                    {video.status && (
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {video.status.state}
                          {video.status.pctComplete && ` (${video.status.pctComplete}%)`}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Embed Code</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-4">Use this code to embed the video on your website:</p>
                  
                  <div className="bg-gray-50 p-4 rounded-md font-mono text-xs overflow-x-auto">
                    {`<iframe
  src="${video.playback.hls}"
  style="width:100%;height:100%;position:absolute;left:0px;top:0px;overflow:hidden;"
  frameborder="0"
  allow="autoplay; fullscreen"
  allowfullscreen
></iframe>`}
                  </div>
                  
                  <button 
                    onClick={() => copyToClipboard(`<iframe src="${video.playback.hls}" style="width:100%;height:100%;position:absolute;left:0px;top:0px;overflow:hidden;" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`)}
                    className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Copy Embed Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 