import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useOrganization } from '@clerk/nextjs';
import Link from 'next/link';
import CloudflareVideoUploader from '@/components/Video/CloudflareVideoUploader';
import CloudflareVideoPlayer from '@/components/Video/CloudflareVideoPlayer';
import DashboardMenu from '@/components/Dashboard/DashboardMenu';
import videoService from '@/api-connection/videos';

interface UploadedVideo {
  uid: string;
  readyToStream?: boolean;
  thumbnail?: string;
  playback?: {
    hls: string;
    dash: string;
  };
}

export default function UploadVideoPage() {
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [pollingStatus, setPollingStatus] = useState('');
  const router = useRouter();
  const { organization } = useOrganization();
  const { tenantId } = router.query;

  const handleUploadSuccess = async (videoData: UploadedVideo) => {
    setUploadedVideo(videoData);
    setPollingStatus('Waiting for video processing...');
    
    // Start polling for video status
    let attempts = 0;
    const maxAttempts = 60; // Poll for up to 5 minutes (5s intervals)
    const pollInterval = 5000; // 5 seconds
    
    const pollVideoStatus = async () => {
      try {
        const data = await videoService.checkVideoStatus(videoData.uid);
        
        if (data.success && data.readyToStream) {
          setUploadedVideo(data.video);
          setIsVideoReady(true);
          setPollingStatus('Video ready to stream!');
          return;
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          setPollingStatus('Video processing is taking longer than expected. Check back later.');
          return;
        }
        
        setPollingStatus(`Video processing: ${data.status || 'in progress'}...`);
        setTimeout(pollVideoStatus, pollInterval);
      } catch (error) {
        console.error('Error polling video status:', error);
        setPollingStatus('Error checking video status. Please check later.');
      }
    };
    
    // Start polling after a short delay to allow Cloudflare to begin processing
    setTimeout(pollVideoStatus, 2000);
  };

  // Helper function to navigate back to dashboard
  const getDashboardUrl = () => {
    if (tenantId && typeof tenantId === 'string') {
      return `/${tenantId}/dashboard`;
    }
    return organization?.id ? `/${organization.id}/dashboard` : '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Upload Video - Cloudflare Stream</title>
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Upload Video
            </h1>
            <DashboardMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href={getDashboardUrl()} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upload Video to Cloudflare Stream</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload videos directly to Cloudflare Stream for high-quality streaming
            </p>
          </div>

          <div className="p-6">
            {!uploadedVideo && (
              <CloudflareVideoUploader 
                maxDurationSeconds={3600} // 1 hour max
                onUploadSuccess={handleUploadSuccess}
                onUploadError={(error) => console.error('Upload error:', error)}
              />
            )}

            {uploadedVideo && !isVideoReady && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-700">{pollingStatus}</p>
              </div>
            )}

            {uploadedVideo && isVideoReady && uploadedVideo.playback && (
              <div className="space-y-6">
                <div className="border border-green-200 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Video uploaded successfully and ready to stream!
                      </p>
                    </div>
                  </div>
                </div>

                <CloudflareVideoPlayer
                  playback={uploadedVideo.playback}
                  thumbnail={uploadedVideo.thumbnail || ''}
                  title="Your uploaded video"
                  autoPlay={true}
                />

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Video Information</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Video ID:</span>
                      <span className="font-mono">{uploadedVideo.uid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span>{uploadedVideo.readyToStream ? 'Ready to stream' : 'Processing'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Link
                    href={getDashboardUrl()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setUploadedVideo(null);
                      setIsVideoReady(false);
                      setPollingStatus('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Upload Another Video
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 