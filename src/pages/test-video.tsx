import { useEffect, useState } from 'react';
import Head from 'next/head';
import MuxVideoPlayer from '@/components/Video/MuxVideoPlayer';
import VideoInfoCard from '@/components/Video/VideoInfoCard';
import videoService, { VideoData } from '@/api-connection/videos';

export default function TestVideoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await videoService.testCloudflareConnection();

      if (!response.success || !response.data.result || response.data.result.length === 0) {
        throw new Error('No video data returned from API');
      }

      // Take the first video from the results
      setVideoData(response.data.result[0]);
    } catch (err) {
      console.error('Error fetching video:', err);
      if (err instanceof Error) {
        if (err.message.includes('Network Error')) {
          setError('Cannot connect to the server. Please check if the backend is running at http://localhost:4000.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unknown error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Head>
        <title>Video Test Page</title>
      </Head>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Video Test Page</h1>
            <p className="text-sm text-gray-500 mt-1">Testing Cloudflare Stream video playback</p>
          </div>

          <div className="p-6">
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex flex-col">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={fetchVideo}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Retry Connection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!loading && !error && videoData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MuxVideoPlayer 
                src={videoData.playback}
                title={videoData.meta?.name || ''}
                autoPlay={true}
                soundControlText={videoData.meta?.displayOptions?.soundControlText || ''}
                soundControlColor={videoData.meta?.displayOptions?.soundControlColor || '#FFFFFF'}
                soundControlOpacity={videoData.meta?.displayOptions?.soundControlOpacity ?? 0.8}
                soundControlSize={videoData.meta?.displayOptions?.soundControlSize ?? 64}
              />
            </div>
            
            <div>
              <VideoInfoCard 
                videoId={videoData.uid}
                name={videoData.meta.name}
                format={videoData.meta.filetype}
                duration={videoData.duration}
                readyToStream={videoData.readyToStream}
                preview={videoData.preview}
                playback={videoData.playback}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 