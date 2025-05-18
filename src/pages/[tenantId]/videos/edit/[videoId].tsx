import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOrganization } from '@clerk/nextjs';
import Head from 'next/head';
import Link from 'next/link';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';
import MuxVideoPlayer from '@/components/Video/MuxVideoPlayer';
import videoService, { VideoData } from '@/api-connection/videos';

export default function EditVideoPage() {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [displayOptions, setDisplayOptions] = useState({
    showProgressBar: true,
    showTitle: true,
    showPlaybackControls: true,
    autoPlay: false,
    muted: false,
    loop: false
  });
  
  const [embedOptions, setEmbedOptions] = useState({
    showVideoTitle: true,
    showUploadDate: true,
    showMetadata: true,
    allowFullscreen: true,
    responsive: true,
    showBranding: true
  });
  
  const router = useRouter();
  const { videoId, tenantId } = router.query;
  const { organization } = useOrganization();

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
      
      if (response.success && response.data) {
        // Handle both array and object responses
        let videoData: VideoData | null = null;
        
        if (response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
          videoData = response.data.result[0];
        } else if (response.data.result && typeof response.data.result === 'object') {
          videoData = response.data.result as unknown as VideoData;
        }
        
        if (videoData) {
          setVideo(videoData);
          setFormData({
            name: videoData.meta?.name || '',
            description: ''
          });
          
          // Load display options from video metadata if available
          if (videoData.meta && (videoData.meta as any).displayOptions) {
            try {
              const savedDisplayOptions = JSON.parse((videoData.meta as any).displayOptions);
              if (savedDisplayOptions && typeof savedDisplayOptions === 'object') {
                setDisplayOptions(prev => ({
                  ...prev,
                  ...savedDisplayOptions
                }));
              }
            } catch (err) {
              console.warn('Failed to parse saved display options:', err);
            }
          }
          
          // Load embed options from video metadata if available
          if (videoData.meta && (videoData.meta as any).embedOptions) {
            try {
              const savedEmbedOptions = JSON.parse((videoData.meta as any).embedOptions);
              if (savedEmbedOptions && typeof savedEmbedOptions === 'object') {
                setEmbedOptions(prev => ({
                  ...prev,
                  ...savedEmbedOptions
                }));
              }
            } catch (err) {
              console.warn('Failed to parse saved embed options:', err);
            }
          }
        } else {
          throw new Error('No video data available');
        }
      } else {
        if (!response.success) {
          throw new Error(response.message || 'Failed to load video');
        } else {
          throw new Error('No video data available');
        }
      }
    } catch (err: any) {
      console.error('Error fetching video:', err);
      setError(err.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleOption = (option: keyof typeof displayOptions) => {
    setDisplayOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleToggleEmbedOption = (option: keyof typeof embedOptions) => {
    setEmbedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // TODO: Implement the actual API call to update video information
      // For now, we'll just simulate a successful update
      console.log('Submitting form with data:', {
        ...formData,
        displayOptions,
        embedOptions
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to the video detail page
      router.push(`/${tenantId}/videos/${videoId}`);
    } catch (err: any) {
      console.error('Error updating video:', err);
      setError(err.message || 'Failed to update video');
      setSaving(false);
    }
  };

  // Helper function to navigate back to video details
  const getVideoDetailsUrl = () => {
    return tenantId ? `/${tenantId}/videos/${videoId}` : `/videos/${videoId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{loading ? 'Edit Video' : `Edit: ${video?.meta?.name}`} - Stream</title>
      </Head>

      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-white truncate">
                Edit Video
              </h1>
              <p className="text-blue-100 text-sm mt-1">Update video information</p>
            </div>
            <DashboardMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href={getVideoDetailsUrl()} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Video Details
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white p-12 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading video information...</p>
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

        {/* Edit Form */}
        {!loading && !error && video && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Preview Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {video.playback?.hls ? (
                  <MuxVideoPlayer 
                    src={video.playback}
                    title={displayOptions.showTitle ? video.meta?.name : undefined}
                    autoPlay={displayOptions.autoPlay}
                    showControls={displayOptions.showPlaybackControls}
                    muted={displayOptions.muted}
                    loop={displayOptions.loop}
                    hideProgress={!displayOptions.showProgressBar}
                  />
                ) : (
                  <div className="aspect-video bg-gray-900 flex items-center justify-center text-white">
                    <div className="text-center p-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Video preview not available</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Video Information</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Video ID:</dt>
                    <dd className="text-gray-900 font-mono">{video.uid}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Duration:</dt>
                    <dd className="text-gray-900">{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">File Size:</dt>
                    <dd className="text-gray-900">{Math.round(video.size / (1024 * 1024))} MB</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Uploaded:</dt>
                    <dd className="text-gray-900">{new Date(video.created).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Edit Form Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Edit Video Details</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-6">
                    {/* Video Title */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Video Title
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter video title"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Video Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          name="description"
                          rows={5}
                          value={formData.description}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter video description"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Add details about your video content. This helps with discoverability and provides context for viewers.
                      </p>
                    </div>
                    
                    {/* Tags (future feature) */}
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                        Tags (coming soon)
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="tags"
                          id="tags"
                          disabled
                          className="shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                          placeholder="This feature is coming soon"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Tags help categorize your video and make it more discoverable.
                      </p>
                    </div>
                    
                    {/* Privacy Settings (future feature) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Privacy Settings (coming soon)</label>
                      <div className="mt-1 space-y-2">
                        <div className="flex items-center opacity-50 cursor-not-allowed">
                          <input
                            id="privacy-public"
                            name="privacy"
                            type="radio"
                            disabled
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 cursor-not-allowed"
                            defaultChecked
                          />
                          <label htmlFor="privacy-public" className="ml-3 block text-sm font-medium text-gray-700 cursor-not-allowed">
                            Public (available to everyone)
                          </label>
                        </div>
                        <div className="flex items-center opacity-50 cursor-not-allowed">
                          <input
                            id="privacy-unlisted"
                            name="privacy"
                            type="radio"
                            disabled
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 cursor-not-allowed"
                          />
                          <label htmlFor="privacy-unlisted" className="ml-3 block text-sm font-medium text-gray-700 cursor-not-allowed">
                            Unlisted (only accessible via link)
                          </label>
                        </div>
                        <div className="flex items-center opacity-50 cursor-not-allowed">
                          <input
                            id="privacy-private"
                            name="privacy"
                            type="radio"
                            disabled
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 cursor-not-allowed"
                          />
                          <label htmlFor="privacy-private" className="ml-3 block text-sm font-medium text-gray-700 cursor-not-allowed">
                            Private (only accessible by you)
                          </label>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Control who can view your video.
                      </p>
                    </div>
                    
                    {/* Player Display Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Player Display Options
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            id="show-progress-bar"
                            name="showProgressBar"
                            type="checkbox"
                            checked={displayOptions.showProgressBar}
                            onChange={() => handleToggleOption('showProgressBar')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="show-progress-bar" className="ml-3 block text-sm font-medium text-gray-700">
                            Show progress bar
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="show-title"
                            name="showTitle"
                            type="checkbox"
                            checked={displayOptions.showTitle}
                            onChange={() => handleToggleOption('showTitle')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="show-title" className="ml-3 block text-sm font-medium text-gray-700">
                            Show video title
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="show-playback-controls"
                            name="showPlaybackControls"
                            type="checkbox"
                            checked={displayOptions.showPlaybackControls}
                            onChange={() => handleToggleOption('showPlaybackControls')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="show-playback-controls" className="ml-3 block text-sm font-medium text-gray-700">
                            Show playback controls
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="autoplay"
                            name="autoPlay"
                            type="checkbox"
                            checked={displayOptions.autoPlay}
                            onChange={() => handleToggleOption('autoPlay')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="autoplay" className="ml-3 block text-sm font-medium text-gray-700">
                            Autoplay
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="muted"
                            name="muted"
                            type="checkbox"
                            checked={displayOptions.muted}
                            onChange={() => handleToggleOption('muted')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="muted" className="ml-3 block text-sm font-medium text-gray-700">
                            Muted
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="loop"
                            name="loop"
                            type="checkbox"
                            checked={displayOptions.loop}
                            onChange={() => handleToggleOption('loop')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="loop" className="ml-3 block text-sm font-medium text-gray-700">
                            Loop video
                          </label>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Customize how the video player appears to viewers.
                      </p>
                    </div>
                    
                    {/* Embed Options */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Embed Page Options
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            id="show-video-title"
                            name="showVideoTitle"
                            type="checkbox"
                            checked={embedOptions.showVideoTitle}
                            onChange={() => handleToggleEmbedOption('showVideoTitle')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="show-video-title" className="ml-3 block text-sm font-medium text-gray-700">
                            Show video title on embed page
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="show-upload-date"
                            name="showUploadDate"
                            type="checkbox"
                            checked={embedOptions.showUploadDate}
                            onChange={() => handleToggleEmbedOption('showUploadDate')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="show-upload-date" className="ml-3 block text-sm font-medium text-gray-700">
                            Show upload date
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="show-metadata"
                            name="showMetadata"
                            type="checkbox"
                            checked={embedOptions.showMetadata}
                            onChange={() => handleToggleEmbedOption('showMetadata')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="show-metadata" className="ml-3 block text-sm font-medium text-gray-700">
                            Show video metadata (resolution, size, etc.)
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="allow-fullscreen"
                            name="allowFullscreen"
                            type="checkbox"
                            checked={embedOptions.allowFullscreen}
                            onChange={() => handleToggleEmbedOption('allowFullscreen')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="allow-fullscreen" className="ml-3 block text-sm font-medium text-gray-700">
                            Allow fullscreen
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="responsive"
                            name="responsive"
                            type="checkbox"
                            checked={embedOptions.responsive}
                            onChange={() => handleToggleEmbedOption('responsive')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="responsive" className="ml-3 block text-sm font-medium text-gray-700">
                            Responsive embed (adapts to container)
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="show-branding"
                            name="showBranding"
                            type="checkbox"
                            checked={embedOptions.showBranding}
                            onChange={() => handleToggleEmbedOption('showBranding')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="show-branding" className="ml-3 block text-sm font-medium text-gray-700">
                            Show branding
                          </label>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Customize how your video appears when embedded on other websites.
                      </p>
                    </div>
                    
                    {/* Embed Code Preview */}
                    {video.playback?.hls && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-md">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Embed Code Preview</h3>
                        <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                          {`<iframe 
  src="${video.playback.hls}${displayOptions.autoPlay ? '?autoplay=1' : ''}${displayOptions.muted ? '&muted=1' : ''}${displayOptions.loop ? '&loop=1' : ''}"
  style="${embedOptions.responsive ? 'width:100%;height:100%;position:absolute;left:0px;top:0px;' : 'width:640px;height:360px;'}overflow:hidden;"
  frameborder="0"
  ${embedOptions.allowFullscreen ? 'allow="autoplay; fullscreen" allowfullscreen' : ''}
  title="${formData.name}"
></iframe>`}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const embedCode = `<iframe 
  src="${video.playback.hls}${displayOptions.autoPlay ? '?autoplay=1' : ''}${displayOptions.muted ? '&muted=1' : ''}${displayOptions.loop ? '&loop=1' : ''}"
  style="${embedOptions.responsive ? 'width:100%;height:100%;position:absolute;left:0px;top:0px;' : 'width:640px;height:360px;'}overflow:hidden;"
  frameborder="0"
  ${embedOptions.allowFullscreen ? 'allow="autoplay; fullscreen" allowfullscreen' : ''}
  title="${formData.name}"
></iframe>`;
                            navigator.clipboard.writeText(embedCode);
                            alert('Embed code copied to clipboard!');
                          }}
                          className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Copy Embed Code
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Link
                      href={getVideoDetailsUrl()}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Actions here cannot be undone. Please proceed with caution.
                </p>
                
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
                      // TODO: Implement actual deletion
                      router.push(`/${tenantId}/videos`);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Video
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 