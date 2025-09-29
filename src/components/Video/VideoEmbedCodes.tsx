import React, { useState } from 'react';
import { VideoData } from '../../api-connection/videos';
import { useRouter } from 'next/router';
import { useOrganization } from '@/hooks/useOrganization';

interface VideoEmbedCodesProps {
  video: VideoData;
}

export default function VideoEmbedCodes({ video }: VideoEmbedCodesProps) {
  const [activeTab, setActiveTab] = useState<'iframe' | 'direct' | 'hls'>('iframe');
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { tenantId } = router.query;
  const { organization } = useOrganization();
  
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://yourdomain.com';

  const getVideoWatchUrl = (uid: string) => {
    const orgId = organization?.id || tenantId;
    return orgId ? `${baseUrl}/${orgId}/videos/watch/${uid}` : `${baseUrl}/videos/watch/${uid}`;
  };
  
  const embedUrls = {
    iframe: `<iframe 
  src="${baseUrl}/embed/${video.uid}" 
  style="min-height: 300px; width:100%;height:100%;border:none;display:block;margin:0 auto;"
  frameborder="0" 
  allow="autoplay; fullscreen; picture-in-picture">
</iframe>`,
    direct: getVideoWatchUrl(video.uid),
    hls: video.playback?.hls || 'HLS stream not available'
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-silver-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('iframe')}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === 'iframe'
                ? 'border-b-2 border-scale-700 text-scale-700'
                : 'text-silver-500 hover:text-silver-700 hover:border-silver-300'
            }`}
          >
            Iframe Embed
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === 'direct'
                ? 'border-b-2 border-scale-700 text-scale-700'
                : 'text-silver-500 hover:text-silver-700 hover:border-silver-300'
            }`}
          >
            Direct URL
          </button>
          <button
            onClick={() => setActiveTab('hls')}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === 'hls'
                ? 'border-b-2 border-scale-700 text-scale-700'
                : 'text-silver-500 hover:text-silver-700 hover:border-silver-300'
            }`}
          >
            HLS URL
          </button>
        </nav>
      </div>
      
      <div className="p-4">
        <div className="mb-2 flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            {activeTab === 'iframe' ? 'Embed Code' : activeTab === 'direct' ? 'Direct URL' : 'HLS Stream URL'}
          </label>
          <button
            onClick={() => copyToClipboard(embedUrls[activeTab])}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            {copied ? (
              <>
                <svg className="h-4 w-4 mr-1 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-40">
          <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all">
            {embedUrls[activeTab]}
          </pre>
        </div>

        {activeTab === 'iframe' && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
              <div 
                dangerouslySetInnerHTML={{ __html: embedUrls.iframe }}
                className="w-full aspect-video"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 