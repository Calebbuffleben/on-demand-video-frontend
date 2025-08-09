'use client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import MuxVideoPlayer from '../../../components/Video/MuxVideoPlayer';
import { VideoData } from '../../../api-connection/videos';

interface EmbedPageProps {
  videoData: VideoData | null;
  error: string | null;
  uid: string;
}

// FORCE SERVER-SIDE RENDERING - NO CLIENT-SIDE CLERK INTERFERENCE
export const getServerSideProps: GetServerSideProps<EmbedPageProps> = async (context) => {
  const { uid } = context.params as { uid: string };
  
  console.log('🎬 SSR: Fetching video for embed (videos/embed):', uid);
  
  // Set aggressive headers for iframe compatibility
  context.res.setHeader('X-Frame-Options', 'ALLOWALL');
  context.res.setHeader('Content-Security-Policy', 'frame-ancestors *;');
  context.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  context.res.setHeader('X-Embed-SSR', 'true');
  context.res.setHeader('X-Embed-Route', 'videos/embed');
  
  try {
    // Direct fetch to backend without any Clerk interference
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${backendUrl}/videos/embed/${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Embed-SSR/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.result) {
      console.log('✅ SSR: Video data loaded successfully for videos/embed');
      return {
        props: {
          videoData: data.result,
          error: null,
          uid,
        },
      };
    } else {
      throw new Error('No video data available');
    }
  } catch (error) {
    console.error('❌ SSR: Failed to fetch video for videos/embed:', error);
    return {
      props: {
        videoData: null,
        error: error instanceof Error ? error.message : 'Failed to load video',
        uid,
      },
    };
  }
};

export default function VideoEmbedPage({ videoData, error, uid }: EmbedPageProps) {
  console.log('🎥 VIDEOS/EMBED PAGE RENDER:', { uid, hasData: !!videoData, error });

  return (
    <>
      <Head>
        <title>{videoData?.meta?.name || 'Video Player'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
        <meta httpEquiv="Content-Security-Policy" content="frame-ancestors *;" />
        <style>{`
          body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden; 
            background-color: #000; 
            font-family: system-ui, -apple-system, sans-serif;
          }
          * { box-sizing: border-box; }
        `}</style>
        
        {/* ANTI-REDIRECT SCRIPT */}
        <script dangerouslySetInnerHTML={{
          __html: `
            console.log('🛡️ ANTI-REDIRECT PROTECTION ACTIVATED for videos/embed');
            
            // BLOCK ALL REDIRECT METHODS
            const originalReplace = window.location.replace;
            const originalAssign = window.location.assign;
            const originalReload = window.location.reload;
            
            window.location.replace = function(url) {
              console.warn('🛡️ BLOCKED location.replace:', url);
              return false;
            };
            
            window.location.assign = function(url) {
              console.warn('🛡️ BLOCKED location.assign:', url);
              return false;
            };
            
            window.location.reload = function() {
              console.warn('🛡️ BLOCKED location.reload');
              return false;
            };
            
            // BLOCK href changes
            Object.defineProperty(window.location, 'href', {
              set: function(url) {
                console.warn('🛡️ BLOCKED location.href set:', url);
                return false;
              },
              get: function() {
                return window.location.toString();
              }
            });
            
            // BLOCK window.open
            const originalOpen = window.open;
            window.open = function(url, name, features) {
              console.warn('🛡️ BLOCKED window.open:', url);
              return null;
            };
            
            // BLOCK history manipulation
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            
            history.pushState = function(state, title, url) {
              console.warn('🛡️ BLOCKED history.pushState:', url);
              return false;
            };
            
            history.replaceState = function(state, title, url) {
              console.warn('🛡️ BLOCKED history.replaceState:', url);
              return false;
            };
            
            // BLOCK form submissions
            document.addEventListener('submit', function(e) {
              console.warn('🛡️ BLOCKED form submission');
              e.preventDefault();
              e.stopPropagation();
              return false;
            }, true);
            
            // BLOCK click events that might trigger redirects
            document.addEventListener('click', function(e) {
              const target = e.target;
              if (target && (target.tagName === 'A' || target.closest('a'))) {
                const link = target.tagName === 'A' ? target : target.closest('a');
                if (link.href && !link.href.startsWith('#') && !link.href.startsWith('javascript:')) {
                  console.warn('🛡️ BLOCKED link click:', link.href);
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }
            }, true);
            
            // BLOCK all navigation
            window.addEventListener('beforeunload', function(e) {
              console.warn('🛡️ BLOCKED beforeunload');
              e.preventDefault();
              e.returnValue = '';
              return '';
            });
            
            console.log('🛡️ ALL REDIRECT PROTECTION INSTALLED for videos/embed');
          `
        }} />
      </Head>

      <div className="w-full h-screen flex items-center justify-center bg-black relative">
        {error && (
          <div className="text-white text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm">{error}</p>
            <p className="text-xs text-gray-400 mt-2">Video UID: {uid}</p>
          </div>
        )}

        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="w-full max-w-[100vw] max-h-[100vh] aspect-video">
            {videoData && videoData.playback && videoData.playback.hls && (
              <MuxVideoPlayer
                src={videoData.playback}
                title={videoData.meta?.displayOptions?.showTitle ? videoData.meta?.name : undefined}
                autoPlay={videoData.meta?.displayOptions?.autoPlay}
                showControls={videoData.meta?.displayOptions?.showPlaybackControls}
                muted={videoData.meta?.displayOptions?.muted}
                loop={videoData.meta?.displayOptions?.loop}
                hideProgress={!videoData.meta?.displayOptions?.showProgressBar}
                showTechnicalInfo={false} // DISABLE para evitar tracking
                useOriginalProgressBar={videoData.meta?.displayOptions?.useOriginalProgressBar}
                progressBarColor={videoData.meta?.displayOptions?.progressBarColor}
                progressEasing={videoData.meta?.displayOptions?.progressEasing}
                playButtonColor={videoData.meta?.displayOptions?.playButtonColor}
                playButtonSize={videoData.meta?.displayOptions?.playButtonSize}
                playButtonBgColor={videoData.meta?.displayOptions?.playButtonBgColor}
                soundControlSize={videoData.meta?.displayOptions?.soundControlSize}
                soundControlColor={videoData.meta?.displayOptions?.soundControlColor}
                soundControlOpacity={videoData.meta?.displayOptions?.soundControlOpacity}
                soundControlText={videoData.meta?.displayOptions?.soundControlText}
                showSoundControl={videoData.meta?.displayOptions?.showSoundControl ?? (videoData.meta?.displayOptions?.autoPlay && videoData.meta?.displayOptions?.muted)}
                showCta={false} // DISABLE CTA para evitar links externos
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
} 