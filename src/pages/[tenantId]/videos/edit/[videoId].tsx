import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';
import MuxVideoPlayer from '@/components/Video/MuxVideoPlayer';
import CoverUploader from '@/components/Video/CoverUploader';
import videoService, { VideoData } from '@/api-connection/videos';
import ColorPicker from '@/components/ui/ColorPicker';

// Edit Video Page allows users to update video details and player options
export default function EditVideoPage() {
  // State for video data, loading, saving, and error handling
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  // State for form fields (title, description)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  // State for player display options (progress bar, color, etc.)
  const [displayOptions, setDisplayOptions] = useState({
    showProgressBar: true,
    showTitle: true,
    showPlaybackControls: true,
    autoPlay: false,
    muted: false,
    loop: false,
    useOriginalProgressBar: false,
    progressBarColor: '#3b82f6',
    progressEasing: 0,
    playButtonColor: '#fff',
    playButtonSize: 32,
    playButtonBgColor: '#000000',
    soundControlSize: 24,
    soundControlColor: '#ffffff',
    soundControlOpacity: 0.8,
    soundControlText: '',
    showSoundControl: false,
  });
  // State for embed options (how video appears when embedded)
  const [embedOptions, setEmbedOptions] = useState({
    showVideoTitle: true,
    showUploadDate: true,
    showMetadata: true,
    allowFullscreen: true,
    responsive: true,
    showBranding: true,
    showTechnicalInfo: false
  });
  // Add CTA state
  const [ctaFields, setCtaFields] = useState({
    showCta: false,
    ctaText: '',
    ctaButtonText: '',
    ctaLink: '',
    ctaStartTime: undefined as number | undefined,
    ctaEndTime: undefined as number | undefined,
  });
  
  const router = useRouter();
  const { videoId, tenantId } = router.query;

  // Log displayOptions whenever it changes
  useEffect(() => {
    console.log('[DEBUG] displayOptions state in parent has changed to:', displayOptions);
  }, [displayOptions]);

  // Fetch video data when videoId changes
  useEffect(() => {
    if (videoId && typeof videoId === 'string') {
      fetchVideo(videoId);
    }
  }, [videoId]);

  // Fetch video details from API and populate state
  const fetchVideo = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await videoService.getVideoByUid(id);
      console.log('[DEBUG] Video data from API:', response);
      
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
          setCtaFields({
            showCta: Boolean(videoData.ctaText),
            ctaText: videoData.ctaText || '',
            ctaButtonText: videoData.ctaButtonText || '',
            ctaLink: videoData.ctaLink || '',
            ctaStartTime: videoData.ctaStartTime,
            ctaEndTime: videoData.ctaEndTime,
          });
          
          console.log('[DEBUG] Video metadata:', videoData.meta);
          
          // Load display options from video metadata if available
          if (videoData.meta && videoData.meta.displayOptions) {
            console.log('[DEBUG] Display options from API:', videoData.meta.displayOptions);
            
            // Don't try to parse - the displayOptions are already an object
            const savedDisplayOptions = videoData.meta.displayOptions;
            
            if (savedDisplayOptions && typeof savedDisplayOptions === 'object') {
              console.log('[DEBUG] Setting displayOptions to:', savedDisplayOptions);
              setDisplayOptions(prev => ({
                ...prev,
                ...savedDisplayOptions
              }));
            }
          }
          
          // Load embed options from video metadata if available
          if (videoData.meta && videoData.meta.embedOptions) {
            console.log('[DEBUG] Embed options from API:', videoData.meta.embedOptions);
            
            // Don't try to parse - the embedOptions are already an object
            const savedEmbedOptions = videoData.meta.embedOptions;
            
            if (savedEmbedOptions && typeof savedEmbedOptions === 'object') {
              console.log('[DEBUG] Setting embedOptions to:', savedEmbedOptions);
              setEmbedOptions(prev => ({
                ...prev,
                ...savedEmbedOptions
              }));
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
    } catch (err: unknown) {
      console.error('Error fetching video:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load video';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle changes to text inputs (title, description)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle boolean display options (checkboxes)
  const handleToggleOption = (option: keyof typeof displayOptions) => {
    setDisplayOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // Toggle boolean embed options (checkboxes)
  const handleToggleEmbedOption = (option: keyof typeof embedOptions) => {
    setEmbedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // Handle form submission to save video details and options
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Save the display and embed options
      const formattedData = {
        ...formData,
        displayOptions,
        embedOptions,
        ctaFields
      };
      
      console.log('[DEBUG] Submitting form with data:', {
        ...formattedData,
        displayOptions: {
          ...displayOptions,
          // Log the button colors explicitly
          playButtonColor: displayOptions.playButtonColor,
          playButtonBgColor: displayOptions.playButtonBgColor
        }
      });
      
      // Call the API to update the video
      if (video && video.uid) {
        // Log the actual payload being sent to the API
        console.log('[DEBUG] Sending to API:', {
          displayOptions: {
            ...displayOptions,
            playButtonColor: displayOptions.playButtonColor,
            playButtonBgColor: displayOptions.playButtonBgColor,
            playButtonSize: displayOptions.playButtonSize
          },
          embedOptions
        });
        
        await videoService.updateVideoOptions(
          video.uid,
          displayOptions,
          embedOptions,
          ctaFields
        );
        
        // Redirect back to the video detail page after successful save
        router.push(`/${tenantId}/videos/${videoId}`);
      } else {
        throw new Error('Video data is missing');
      }
    } catch (err: unknown) {
      console.error('Error updating video:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update video';
      setError(errorMessage);
      setSaving(false);
    }
  };

  // Helper to get the video details URL for navigation
  const getVideoDetailsUrl = () => {
    return tenantId ? `/${tenantId}/videos/${videoId}` : `/videos/${videoId}`;
  };

  const handleCoverUpload = async (file: File) => {
    if (!video?.uid) return;

    try {
      setIsUploadingCover(true);
      const response = await videoService.uploadCover(video.uid, file);
      if (response.success && response.data.result.length > 0) {
        setVideo(response.data.result[0]);
      }
    } catch (err: unknown) {
      console.error('Error uploading cover:', err);
      alert('Failed to upload cover image. Please try again.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        {/* Page title for SEO and browser tab */}
        <title>{loading ? 'Edit Video' : `Edit: ${video?.meta?.name}`} - Stream</title>
      </Head>

      {/* Header with navigation and menu */}
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
        {/* Breadcrumb navigation */}
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

        {/* Edit Form Section */}
        {!loading && !error && video && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Preview Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <div className="absolute inset-0">
                    {video.playback?.hls ? (
                      <MuxVideoPlayer 
                        src={video.playback}
                        title={displayOptions.showTitle ? video.meta?.name : undefined}
                        autoPlay={displayOptions.autoPlay}
                        showControls={displayOptions.showPlaybackControls}
                        muted={displayOptions.muted}
                        loop={displayOptions.loop}
                        hideProgress={!displayOptions.showProgressBar}
                        showTechnicalInfo={embedOptions.showTechnicalInfo}
                        useOriginalProgressBar={displayOptions.useOriginalProgressBar}
                        progressBarColor={displayOptions.progressBarColor}
                        progressEasing={displayOptions.progressEasing}
                        playButtonColor={displayOptions.playButtonColor}
                        playButtonSize={displayOptions.playButtonSize}
                        playButtonBgColor={displayOptions.playButtonBgColor}
                        soundControlSize={displayOptions.soundControlSize}
                        soundControlColor={displayOptions.soundControlColor}
                        soundControlOpacity={displayOptions.soundControlOpacity}
                        soundControlText={displayOptions.soundControlText}
                        poster={video.thumbnail || undefined}
                        showSoundControl={displayOptions.showSoundControl ?? (displayOptions.autoPlay && displayOptions.muted)}
                        showCta={ctaFields.showCta}
                        ctaText={ctaFields.ctaText}
                        ctaButtonText={ctaFields.ctaButtonText}
                        ctaLink={ctaFields.ctaLink}
                        ctaStartTime={ctaFields.ctaStartTime}
                        ctaEndTime={ctaFields.ctaEndTime}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
              
              {/* Video information summary */}
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
                
                {/* Main edit form for video details and options */}
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
                        Brief description of your video content
                      </p>
                    </div>

                    {/* Video Cover */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Cover
                      </label>
                      <CoverUploader
                        onCoverSelect={handleCoverUpload}
                        currentCover={video.thumbnail}
                      />
                      {isUploadingCover && (
                        <p className="mt-2 text-sm text-blue-600">
                          Uploading cover image...
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Upload a custom thumbnail for your video
                      </p>
                      {video.thumbnail && (
                        <button
                          type="button"
                          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition shadow"
                          onClick={async () => {
                            if (!video?.uid) return;
                            try {
                              setSaving(true);
                              await videoService.clearThumbnail(video.uid);
                              setVideo(prev => prev ? { ...prev, thumbnail: '' } : prev);
                            } catch {
                              alert('Failed to remove thumbnail');
                            } finally {
                              setSaving(false);
                            }
                          }}
                        >
                          Remove Thumbnail
                        </button>
                      )}
                    </div>
                    
                    {/* Player Display Options Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Player Display Options
                      </label>
                      <div className="space-y-3">
                        {/* Show progress bar toggle */}
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
                        
                        {/* Show title toggle */}
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
                        
                        {/* Show playback controls toggle */}
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
                        
                        {/* Autoplay toggle */}
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
                        
                        {/* Muted toggle */}
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
                        
                        {/* Loop toggle */}
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

                        {/* Autoplay Muted toggle */}
                        <div className="flex items-center">
                          <input
                            id="autoplay-muted"
                            name="autoplayMuted"
                            type="checkbox"
                            checked={displayOptions.autoPlay && displayOptions.muted}
                            onChange={() => {
                              const newValue = !(displayOptions.autoPlay && displayOptions.muted);
                              setDisplayOptions(prev => ({
                                ...prev,
                                autoPlay: newValue,
                                muted: newValue,
                                showSoundControl: newValue
                              }));
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="autoplay-muted" className="ml-3 block text-sm font-medium text-gray-700">
                            Autoplay Muted
                          </label>
                          <div className="ml-2">
                            <span className="text-xs text-gray-500">
                              (Video will start playing automatically with sound muted)
                            </span>
                          </div>
                        </div>

                        {/* Show Sound Control toggle (optional, for manual override) */}
                        <div className="flex items-center">
                          <input
                            id="show-sound-control"
                            name="showSoundControl"
                            type="checkbox"
                            checked={displayOptions.showSoundControl ?? (displayOptions.autoPlay && displayOptions.muted)}
                            onChange={() => setDisplayOptions(prev => ({
                              ...prev,
                              showSoundControl: !prev.showSoundControl
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="show-sound-control" className="ml-3 block text-sm font-medium text-gray-700">
                            Show Sound Control
                          </label>
                        </div>

                        {/* Use original Mux progress bar toggle */}
                        <div className="flex items-center">
                          <input
                            id="use-original-progress-bar"
                            name="useOriginalProgressBar"
                            type="checkbox"
                            checked={displayOptions.useOriginalProgressBar}
                            onChange={() => handleToggleOption('useOriginalProgressBar')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="use-original-progress-bar" className="ml-3 block text-sm font-medium text-gray-700">
                            Use original Mux progress bar
                          </label>
                        </div>
                        {/* Progress bar color picker */}
                        <ColorPicker
                          label="Progress bar color"
                          id="progress-bar-color"
                          value={displayOptions.progressBarColor}
                          onChange={color => {
                            console.log(`[DEBUG] ColorPicker onChange for progressBarColor triggered. New color: ${color}`);
                            setDisplayOptions(prev => ({ ...prev, progressBarColor: color }));
                          }}
                        />
                        {/* Progress bar easing slider */}
                        <div className="flex items-center mt-2">
                          <label htmlFor="progress-easing" className="block text-sm font-medium text-gray-700 mr-3 mb-0">
                            Progress bar easing
                          </label>
                          <input
                            id="progress-easing"
                            name="progressEasing"
                            type="range"
                            min="-5"
                            max="1"
                            step="0.1"
                            value={displayOptions.progressEasing}
                            onChange={e => setDisplayOptions(prev => ({ ...prev, progressEasing: parseFloat(e.target.value) }))}
                            className="w-32 ml-2"
                          />
                          <span className="ml-2 text-xs text-gray-500">{displayOptions.progressEasing}</span>
                        </div>
                        {/* Play button color picker */}
                        <ColorPicker
                          label="Play button color"
                          id="play-button-color"
                          value={displayOptions.playButtonColor}
                          onChange={color => {
                            console.log(`[DEBUG] ColorPicker onChange for playButtonColor triggered. New color: ${color}`);
                            setDisplayOptions(prev => ({ ...prev, playButtonColor: color }));
                          }}
                        />
                        {/* Play button size slider */}
                        <div className="flex items-center mt-2">
                          <label htmlFor="play-button-size" className="block text-sm font-medium text-gray-700 mr-3 mb-0">
                            Play button size
                          </label>
                          <input
                            id="play-button-size"
                            name="playButtonSize"
                            type="range"
                            min="16"
                            max="96"
                            step="1"
                            value={displayOptions.playButtonSize}
                            onChange={e => setDisplayOptions(prev => ({ ...prev, playButtonSize: parseInt(e.target.value) }))}
                            className="w-32 ml-2"
                          />
                          <span className="ml-2 text-xs text-gray-500">{displayOptions.playButtonSize}px</span>
                        </div>
                        {/* Play button background color picker */}
                        <ColorPicker
                          label="Play button background"
                          id="play-button-bg-color"
                          value={displayOptions.playButtonBgColor}
                          supportAlpha={true}
                          onChange={color => {
                            console.log(`[DEBUG] ColorPicker onChange for playButtonBgColor triggered. New color: ${color}`);
                            setDisplayOptions(prev => ({ ...prev, playButtonBgColor: color }));
                          }}
                        />

                        {/* Sound Control Size slider */}
                        <div className="flex items-center mt-2">
                          <label htmlFor="sound-control-size" className="block text-sm font-medium text-gray-700 mr-3 mb-0">
                            Sound control size
                          </label>
                          <input
                            id="sound-control-size"
                            name="soundControlSize"
                            type="range"
                            min="24"
                            max="96"
                            step="4"
                            value={displayOptions.soundControlSize}
                            onChange={(e) => {
                              const newSize = parseInt(e.target.value);
                              console.log('[DEBUG] Updating sound control size to:', newSize);
                              setDisplayOptions(prev => ({
                                ...prev,
                                soundControlSize: newSize
                              }));
                            }}
                            className="w-32 ml-2"
                          />
                          <span className="ml-2 text-xs text-gray-500">{displayOptions.soundControlSize}px</span>
                        </div>

                        {/* Sound Control Color picker */}
                        <ColorPicker
                          label="Sound control color"
                          id="sound-control-color"
                          value={displayOptions.soundControlColor}
                          onChange={color => {
                            console.log(`[DEBUG] ColorPicker onChange for soundControlColor triggered. New color: ${color}`);
                            setDisplayOptions(prev => ({ ...prev, soundControlColor: color }));
                          }}
                        />

                        {/* Sound Control Opacity slider */}
                        <div className="flex items-center mt-2">
                          <label htmlFor="sound-control-opacity" className="block text-sm font-medium text-gray-700 mr-3 mb-0">
                            Sound control opacity
                          </label>
                          <input
                            id="sound-control-opacity"
                            name="soundControlOpacity"
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={Math.round(displayOptions.soundControlOpacity * 100)}
                            onChange={(e) => {
                              const newOpacity = parseInt(e.target.value) / 100;
                              console.log('[DEBUG] Updating sound control opacity to:', newOpacity);
                              setDisplayOptions(prev => ({
                                ...prev,
                                soundControlOpacity: newOpacity
                              }));
                            }}
                            className="w-32 ml-2"
                          />
                          <span className="ml-2 text-xs text-gray-500">{Math.round(displayOptions.soundControlOpacity * 100)}%</span>
                        </div>

                        {/* Sound Control Text input */}
                        <div>
                          <label htmlFor="sound-control-text" className="block text-sm font-medium text-gray-700">
                            Sound control text
                          </label>
                          <input
                            type="text"
                            id="sound-control-text"
                            name="soundControlText"
                            value={displayOptions.soundControlText}
                            onChange={e => setDisplayOptions(prev => ({
                              ...prev,
                              soundControlText: e.target.value
                            }))}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter sound control text"
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Customize how the video player appears to viewers.
                      </p>
                    </div>
                    
                    {/* Embed Options Section */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Embed Page Options
                      </label>
                      <div className="space-y-3">
                        {/* Show video title on embed page toggle */}
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
                        
                        {/* Show upload date toggle */}
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
                        
                        {/* Show metadata toggle */}
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
                        
                        {/* Allow fullscreen toggle */}
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
                        
                        {/* Responsive embed toggle */}
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
                        
                        {/* Show branding toggle */}
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
                        
                        {/* Show technical info toggle */}
                        <div className="flex items-center">
                          <input
                            id="show-technical-info"
                            name="showTechnicalInfo"
                            type="checkbox"
                            checked={embedOptions.showTechnicalInfo}
                            onChange={() => handleToggleEmbedOption('showTechnicalInfo')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="show-technical-info" className="ml-3 block text-sm font-medium text-gray-700">
                            Show technical information (progress, time, etc.)
                          </label>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Customize how your video appears when embedded on other websites.
                      </p>
                    </div>
                    
                    {/* CTA Fields Section */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="show-cta"
                          name="showCta"
                          type="checkbox"
                          checked={ctaFields.showCta}
                          onChange={(e) => {
                            setCtaFields(prev => ({
                              ...prev,
                              showCta: e.target.checked
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show-cta" className="ml-3 block text-sm font-medium text-gray-700">
                          Show CTA
                        </label>
                      </div>

                      {ctaFields.showCta && (
                        <>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="cta-text" className="block text-sm font-medium text-gray-700">
                                CTA Text
                              </label>
                              <input
                                type="text"
                                id="cta-text"
                                value={ctaFields.ctaText}
                                onChange={(e) => setCtaFields(prev => ({ ...prev, ctaText: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="cta-button-text" className="block text-sm font-medium text-gray-700">
                                CTA Button Text
                              </label>
                              <input
                                type="text"
                                id="cta-button-text"
                                value={ctaFields.ctaButtonText}
                                onChange={(e) => setCtaFields(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="cta-link" className="block text-sm font-medium text-gray-700">
                                CTA Link
                              </label>
                              <input
                                type="text"
                                id="cta-link"
                                value={ctaFields.ctaLink}
                                onChange={(e) => setCtaFields(prev => ({ ...prev, ctaLink: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="cta-start-time" className="block text-sm font-medium text-gray-700">
                                CTA Start Time (seconds)
                              </label>
                              <input
                                type="number"
                                id="cta-start-time"
                                value={ctaFields.ctaStartTime ?? ''}
                                onChange={(e) => setCtaFields(prev => ({ ...prev, ctaStartTime: e.target.value ? Number(e.target.value) : undefined }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="cta-end-time" className="block text-sm font-medium text-gray-700">
                                CTA End Time (seconds)
                              </label>
                              <input
                                type="number"
                                id="cta-end-time"
                                value={ctaFields.ctaEndTime ?? ''}
                                onChange={(e) => setCtaFields(prev => ({ ...prev, ctaEndTime: e.target.value ? Number(e.target.value) : undefined }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Save/Cancel Buttons */}
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
              
              {/* Danger Zone for deleting the video */}
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